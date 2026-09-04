<?php
// Geo + network metadata. Expects $ip.
// Sets $city, $region, $country, $latitude, $longitude, $isp,
// $vpn, $vpnDetected, $vpnReason plus a small amount of Cloudflare request
// metadata used by the connection-path visualisation.
//
// ISP comes from the local GeoLite2-ASN database (no network call).
// Datacenter/VPN ASNs are matched locally first; the ip2location.io API
// (HTTPS, no key, 1k/day) is only consulted when the local check is clean,
// which keeps bot traffic off the quota entirely.

$city = $region = $country = $isp = 'Unknown';
$latitude = null;
$longitude = null;
$vpn = 'No VPN Detected';
$vpnReason = '';

// Cloudflare request metadata. CF-Ray is useful for correlating a request in
// Cloudflare Security Events / logs. Its three-letter suffix can represent
// the edge connecting to the origin under some routing configurations, so the
// UI calls it a Cloudflare edge code rather than claiming an exact route.
$cfRay = isset($_SERVER['HTTP_CF_RAY']) ? trim($_SERVER['HTTP_CF_RAY']) : '';
$cfColo = '';
if ($cfRay && preg_match('/-([A-Z]{3})$/i', $cfRay, $cfm)) {
    $cfColo = strtoupper($cfm[1]);
}
$cfCountry = isset($_SERVER['HTTP_CF_IPCOUNTRY']) ? strtoupper(trim($_SERVER['HTTP_CF_IPCOUNTRY'])) : '';

$HOSTING_ASNS = 'amazon|aws|google|microsoft|azure|digitalocean|linode|akamai|'
              . 'ovh|hetzner|vultr|cloudflare|oracle|choopa|datacamp|m247|'
              . 'leaseweb|contabo|scaleway|alibaba|tencent|hostinger|godaddy|'
              . 'quadranet|psychz|colocrossing|equinix|packet|nforce|zenlayer|'
              . 'datawagon|hostwinds|ionos|servers\\.com|host|vpn|proxy|cdn';

if (filter_var($ip, FILTER_VALIDATE_IP)) {

    try {
        $rec       = (new \\GeoIp2\\Database\\Reader('/var/lib/GeoIP/GeoLite2-City.mmdb'))->city($ip);
        $city      = $rec->city->name    ?: 'Unknown';
        $country   = $rec->country->name ?: 'Unknown';
        $region    = ($rec->mostSpecificSubdivision && $rec->mostSpecificSubdivision->name)
                   ? $rec->mostSpecificSubdivision->name : 'Unknown';
        $latitude  = is_numeric($rec->location->latitude)  ? (float)$rec->location->latitude  : null;
        $longitude = is_numeric($rec->location->longitude) ? (float)$rec->location->longitude : null;
    } catch (\\Throwable $e) { /* private/reserved IP */ }

    // Optional Cloudflare visitor-location headers are only a fallback for
    // coordinates if MaxMind did not return a usable point.
    if ($latitude === null && isset($_SERVER['HTTP_CF_IPLATITUDE']) && is_numeric($_SERVER['HTTP_CF_IPLATITUDE'])) {
        $latitude = (float)$_SERVER['HTTP_CF_IPLATITUDE'];
    }
    if ($longitude === null && isset($_SERVER['HTTP_CF_IPLONGITUDE']) && is_numeric($_SERVER['HTTP_CF_IPLONGITUDE'])) {
        $longitude = (float)$_SERVER['HTTP_CF_IPLONGITUDE'];
    }

    try {
        $asn = (new \\GeoIp2\\Database\\Reader('/var/lib/GeoIP/GeoLite2-ASN.mmdb'))->asn($ip);
        $isp = $asn->autonomousSystemOrganization ?: 'Unknown';
    } catch (\\Throwable $e) { /* not in db */ }

    // --- Local pass: is the ASN owner a hosting/VPN operator? ---
    if ($isp !== 'Unknown' && preg_match('/' . $HOSTING_ASNS . '/i', $isp)) {
        $vpn = 'VPN/Proxy Detected';
        $vpnReason = $isp . ': VPN/hosting provider, not residential.';
    } else {
        // --- Only now spend an API call. Cached 24h, hard 2s timeout. ---
        $cacheFile = '/var/cache/hmax-geo/' . hash('sha256', $ip) . '.json';
        $d = null;

        if (is_readable($cacheFile) && (time() - filemtime($cacheFile)) < 86400) {
            $d = json_decode(file_get_contents($cacheFile), true);
        }

        if (!is_array($d)) {
            $ctx = stream_context_create(['http' => [
                'timeout'       => 2,
                'ignore_errors' => true,
                'user_agent'    => 'hmax.space metadata lab',
            ]]);
            $raw = @file_get_contents(
                'https://api.ip2location.io/?ip=' . urlencode($ip),
                false, $ctx
            );
            $tmp = $raw ? json_decode($raw, true) : null;
            if (is_array($tmp) && isset($tmp['country_code'])) {
                $d = ['proxy' => (bool)($tmp['is_proxy'] ?? false)];
                @file_put_contents($cacheFile, json_encode($d), LOCK_EX);
            }
        }

        if (is_array($d) && ($d['proxy'] ?? false)) {
            $vpn = 'VPN/Proxy Detected';
            $vpnReason = 'Listed in a public VPN/proxy database.';
        }
    }
}

$vpnDetected = ($vpn === 'VPN/Proxy Detected');
