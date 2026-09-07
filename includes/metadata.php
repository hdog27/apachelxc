<?php
// ==========================================================================
// metadata.php - all server-side logic for hmax.space
// Visitor metadata is generated live per request.
// ==========================================================================

require_once __DIR__ . '/../vendor/autoload.php';
use GeoIp2\Database\Reader;

require __DIR__ . '/clientip.php';
require __DIR__ . '/geo.php';

$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

function hmax_clean_version($raw, $maxParts = null) {
  $v = str_replace('_', '.', trim((string)$raw));
  $parts = array_values(array_filter(explode('.', $v), function ($p) { return $p !== ''; }));
  while (count($parts) > 1 && end($parts) === '0') array_pop($parts);
  if ($maxParts !== null && count($parts) > $maxParts) $parts = array_slice($parts, 0, $maxParts);
  return implode('.', $parts);
}

// Detect OS + concise human-readable version.
$device_name = 'Computer';
$platform_name = '';
$os_emoji = '🖥️';
if (preg_match('/Windows NT ([\d.]+)/i', $ua, $wm)) {
  $nt = $wm[1];
  $win_map = ['10.0'=>'10/11','6.3'=>'8.1','6.2'=>'8','6.1'=>'7'];
  $device_name = 'Windows PC';
  $platform_name = 'Windows ' . ($win_map[$nt] ?? hmax_clean_version($nt, 2));
} elseif (preg_match('/iPhone.*CPU iPhone OS ([\d_]+)/i', $ua, $im)) {
  $device_name = 'iPhone';
  $platform_name = 'iOS ' . hmax_clean_version($im[1], 3);
  $os_emoji = '📱';
} elseif (preg_match('/iPad.*CPU OS ([\d_]+)/i', $ua, $im)) {
  $device_name = 'iPad';
  $platform_name = 'iPadOS ' . hmax_clean_version($im[1], 3);
  $os_emoji = '📱';
} elseif (preg_match('/Android ([\d.]+)/i', $ua, $am)) {
  $device_name = 'Android';
  $platform_name = 'Android ' . hmax_clean_version($am[1], 3);
  $os_emoji = '📱';
} elseif (preg_match('/Mac OS X ([\d_]+)/i', $ua, $mm)) {
  $device_name = 'Mac';
  $platform_name = 'macOS ' . hmax_clean_version($mm[1], 3);
  $os_emoji = '💻';
} elseif (preg_match('/Linux/i', $ua)) {
  $device_name = 'Linux PC';
  $platform_name = 'Linux';
}

// Detect browser, including iOS browser tokens so we never dump the raw UA as
// a fake browser name.
$browser = 'Browser';
$browser_emoji = '🌐';
if (preg_match('/EdgiOS\/([\d.]+)/i', $ua, $m)) {
  $browser = 'Edge ' . hmax_clean_version($m[1], 2);
} elseif (preg_match('/CriOS\/([\d.]+)/i', $ua, $m)) {
  $browser = 'Chrome ' . hmax_clean_version($m[1], 2);
} elseif (preg_match('/FxiOS\/([\d.]+)/i', $ua, $m)) {
  $browser = 'Firefox ' . hmax_clean_version($m[1], 2);
  $browser_emoji = '🦊';
} elseif (preg_match('/Edg\/([\d.]+)/i', $ua, $m)) {
  $browser = 'Edge ' . hmax_clean_version($m[1], 2);
} elseif (preg_match('/OPR\/([\d.]+)|Opera\/([\d.]+)/i', $ua, $m)) {
  $browser = 'Opera ' . hmax_clean_version(($m[1] ?: $m[2]), 2);
} elseif (preg_match('/Firefox\/([\d.]+)/i', $ua, $m)) {
  $browser = 'Firefox ' . hmax_clean_version($m[1], 2);
  $browser_emoji = '🦊';
} elseif (preg_match('/Chrome\/([\d.]+)/i', $ua, $m)) {
  $browser = 'Chrome ' . hmax_clean_version($m[1], 2);
} elseif (preg_match('/Version\/([\d.]+).*Safari/i', $ua, $m)) {
  $browser = 'Safari ' . hmax_clean_version($m[1], 2);
}

$engine = '';
if (preg_match('/AppleWebKit\/([\d.]+)/i', $ua, $wk)) {
  $engine = 'WebKit ' . hmax_clean_version($wk[1], 3);
} elseif (preg_match('/Gecko\/([\d.]+)/i', $ua, $gk) && stripos($ua, 'like Gecko') === false) {
  $engine = 'Gecko ' . hmax_clean_version($gk[1], 3);
}

// A compact top summary. Device type is intentionally not repeated when the
// device name already says iPhone/iPad/Android.
$deviceParts = [];
$deviceParts[] = '<span>' . $os_emoji . ' <strong>' . htmlspecialchars($device_name) . '</strong>'
  . ($platform_name ? ' <small>' . htmlspecialchars($platform_name) . '</small>' : '') . '</span>';
$deviceParts[] = '<span>' . $browser_emoji . ' <strong>' . htmlspecialchars($browser) . '</strong></span>';
if ($engine) $deviceParts[] = '<span>⚙️ <strong>' . htmlspecialchars($engine) . '</strong></span>';
$device = '<div class="device-summary">' . implode('', $deviceParts) . '</div>';

$logDevice = trim($device_name . ' ' . $platform_name . ' | ' . $browser . ($engine ? ' | ' . $engine : ''));
$log = date('Y-m-d H:i:s') . " - IP: $ip - Location: $city, $country - ISP: $isp - VPN: $vpn - Device: $logDevice\n";
file_put_contents('/var/log/visits.log', $log, FILE_APPEND);
$visit_count = file_exists('/var/log/visits.log') ? count(file('/var/log/visits.log')) : 0;

// unique visitors: one stamp file per IP hash, rolling 30 days
$vdir  = '/var/cache/hmax-visits';
$vfile = $vdir . '/count';
$stamp = $vdir . '/' . hash('sha256', $ip);
if (!is_readable($stamp) || (time() - filemtime($stamp)) > 2592000) {
    @touch($stamp);
    $n = (int) @file_get_contents($vfile);
    @file_put_contents($vfile, $n + 1, LOCK_EX);
}
$unique_count = (int) @file_get_contents($vfile);

$current_page = basename($_SERVER['SCRIPT_NAME'], '.php');
function nav_active($page, $current) {
  return $page === $current ? ' active' : '';
}
?>
