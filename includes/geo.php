<?php
// Geo + network metadata. Expects $ip.
// Sets $city, $country, $isp, $vpn, $vpnDetected, $vpnReason.
//
// ISP comes from the local GeoLite2-ASN database (no network call).
// Datacenter/VPN ASNs are matched locally first; the ip2location.io API
// (HTTPS, no key, 1k/day) is only consulted when the local check is clean,
// which keeps bot traffic off the quota entirely.

$city = $country = $isp = 'Unknown';
$vpn = 'No VPN Detected';
$vpnReason = '';

$HOSTING_ASNS = 'amazon|aws|google|microsoft|azure|digitalocean|linode|akamai|'
              . 'ovh|hetzner|vultr|cloudflare|oracle|choopa|datacamp|m247|'
              . 'leaseweb|contabo|scaleway|alibaba|tencent|hostinger|godaddy|'
              . 'quadranet|psychz|colocrossing|equinix|packet|nforce|zenlayer|'
              . 'datawagon|hostwinds|ionos|servers\.com|host|vpn|proxy|cdn';

if (filter_var($ip, FILTER_VALIDATE_IP)) {

    try {
        $rec     = (new \GeoIp2\Database\Reader('/var/lib/GeoIP/GeoLite2-City.mmdb'))->city($ip);
        $city    = $rec->city->name    ?? 'Unknown';
        $country = $rec->country->name ?? 'Unknown';
    } catch (\Throwable $e) { /* private/reserved IP */ }

    try {
        $asn = (new \GeoIp2\Database\Reader('/var/lib/GeoIP/GeoLite2-ASN.mmdb'))->asn($ip);
        $isp = $asn->autonomousSystemOrganization ?: 'Unknown';
    } catch (\Throwable $e) { /* not in db */ }

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
