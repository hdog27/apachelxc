<?php
// ==========================================================================
// metadata.php - all server-side logic for hmax.space
// Moved verbatim from the original single-file index.php. Included by every
// page so the Cyber Lab visitor telemetry stays available site-wide.
// Do NOT replace any of these values with static text - they are generated
// live, per request.
// ==========================================================================

require_once __DIR__ . '/../vendor/autoload.php';
use GeoIp2\Database\Reader;

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];

// MaxMind GeoLite2 lookup for city/country (local, no external API call)
$city = 'Unknown';
$country = 'Unknown';
try {
  $geoReader = new Reader('/var/lib/GeoIP/GeoLite2-City.mmdb');
  $record = $geoReader->city($ip);
  $city = $record->city->name ?? 'Unknown';
  $country = $record->country->name ?? 'Unknown';
} catch (\Exception $e) {
  // Private/reserved IP or not found in database - leave as Unknown
}

// ip-api.com kept only for ISP name + VPN/proxy/hosting detection
$geo = @file_get_contents("http://ip-api.com/json/{$ip}?fields=isp,proxy,hosting");
$data = json_decode($geo);
$isp = $data->isp ?? 'Unknown';
$vpn = ($data && (($data->proxy ?? false) || ($data->hosting ?? false))) ? 'VPN/Proxy Detected' : 'No VPN Detected';
$ua = $_SERVER['HTTP_USER_AGENT'];

// Detect OS + version
if (preg_match('/Windows NT ([\d.]+)/i', $ua, $wm)) {
  $nt = $wm[1];
  $win_map = ['10.0'=>'10/11','6.3'=>'8.1','6.2'=>'8','6.1'=>'7'];
  $win_ver = $win_map[$nt] ?? $nt;
  $os = 'Windows ' . $win_ver;
  $os_emoji = '🖥️';
} elseif (preg_match('/iPhone.*CPU iPhone OS ([\d_]+)/i', $ua, $im)) {
  $os = 'iPhone iOS ' . str_replace('_', '.', $im[1]);
  $os_emoji = '📱';
} elseif (preg_match('/iPad.*CPU OS ([\d_]+)/i', $ua, $im)) {
  $os = 'iPad iOS ' . str_replace('_', '.', $im[1]);
  $os_emoji = '📱';
} elseif (preg_match('/Android ([\d.]+)/i', $ua, $am)) {
  $os = 'Android ' . $am[1];
  $os_emoji = '📱';
} elseif (preg_match('/Mac OS X ([\d_]+)/i', $ua, $mm)) {
  $os = 'macOS ' . str_replace('_', '.', $mm[1]);
  $os_emoji = '💻';
} elseif (preg_match('/Linux/i', $ua)) {
  $os = 'Linux';
  $os_emoji = '🖥️';
} else {
  $os = 'Unknown OS';
  $os_emoji = '🖥️';
}

// Detect Browser + version
if (preg_match('/Edg\/([\d.]+)/i', $ua, $em)) {
  $browser = 'Edge ' . $em[1];
  $browser_emoji = '🌐';
} elseif (preg_match('/OPR\/([\d.]+)|Opera\/([\d.]+)/i', $ua, $om)) {
  $browser = 'Opera ' . ($om[1] ?: $om[2]);
  $browser_emoji = '🌐';
} elseif (preg_match('/Firefox\/([\d.]+)/i', $ua, $fm)) {
  $browser = 'Firefox ' . $fm[1];
  $browser_emoji = '🦊';
} elseif (preg_match('/Chrome\/([\d.]+)/i', $ua, $cm)) {
  $browser = 'Chrome ' . $cm[1];
  $browser_emoji = '🌐';
} elseif (preg_match('/Version\/([\d.]+).*Safari/i', $ua, $sm)) {
  $browser = 'Safari ' . $sm[1];
  $browser_emoji = '🌐';
} else {
  $browser = 'Unknown Browser';
  $browser_emoji = '🌐';
}

// Detect device type
if (preg_match('/Mobile|Android.*Mobile/i', $ua)) {
  $device_type = 'Mobile';
} elseif (preg_match('/iPad|Tablet/i', $ua)) {
  $device_type = 'Tablet';
} else {
  $device_type = 'Desktop';
}

// Detect rendering engine
if (preg_match('/AppleWebKit\/([\d.]+)/i', $ua, $wk)) {
  $engine = 'WebKit ' . $wk[1];
} elseif (preg_match('/Gecko\/([\d.]+)/i', $ua, $gk)) {
  $engine = 'Gecko ' . $gk[1];
} else {
  $engine = '';
}

$device = $os_emoji . ' <strong>' . htmlspecialchars($os) . '</strong>'
  . ' &nbsp;|&nbsp; ' . $browser_emoji . ' <strong>' . htmlspecialchars($browser) . '</strong>'
  . ' &nbsp;|&nbsp; 📲 <strong>' . $device_type . '</strong>'
  . ($engine ? ' &nbsp;|&nbsp; ⚙️ <strong>' . htmlspecialchars($engine) . '</strong>' : '');

$log = date('Y-m-d H:i:s') . " - IP: $ip - Location: $city, $country - ISP: $isp - VPN: $vpn - Device: $device\n";
file_put_contents('/var/log/visits.log', $log, FILE_APPEND);
$visit_count = file_exists('/var/log/visits.log') ? count(file('/var/log/visits.log')) : 0;

// --------------------------------------------------------------------------
// Active-nav helper: derive the current page from the running script name so
// the nav highlight is set server-side (no JS needed).
// --------------------------------------------------------------------------
$current_page = basename($_SERVER['SCRIPT_NAME'], '.php'); // index | homelab | projects | contact
function nav_active($page, $current) {
  return $page === $current ? ' active' : '';
}
?>
