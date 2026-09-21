<?php
declare(strict_types=1);

// Same-origin proxy/cache for a high-resolution regional Blue Marble crop.
// The browser requests only the visitor's approximate IP region; NASA receives
// the hmax.space server request, not the visitor's IP address.

$lat = filter_input(INPUT_GET, 'lat', FILTER_VALIDATE_FLOAT);
$lon = filter_input(INPUT_GET, 'lon', FILTER_VALIDATE_FLOAT);
$spanInput = filter_input(INPUT_GET, 'span', FILTER_VALIDATE_FLOAT);

if ($lat === false || $lat === null || $lon === false || $lon === null) {
    http_response_code(400);
    exit;
}

$lat = max(-88.0, min(88.0, (float)$lat));
$lon = max(-178.0, min(178.0, (float)$lon));

// Quarter-degree snapping improves cache reuse. Span is quantized too so the
// close visitor crop and broader origin crop can both be cached efficiently.
$centerLat = round($lat * 4.0) / 4.0;
$centerLon = round($lon * 4.0) / 4.0;
$span = ($spanInput === false || $spanInput === null) ? 2.4 : (float)$spanInput;
$span = max(1.5, min(14.0, round($span * 10.0) / 10.0));
$half = $span / 2.0;

$minLat = max(-89.9, $centerLat - $half);
$maxLat = min(89.9, $centerLat + $half);
$minLon = max(-179.9, $centerLon - $half);
$maxLon = min(179.9, $centerLon + $half);

$cacheDir = sys_get_temp_dir() . '/hmax-earth-regions';
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0755, true);

$key = hash('sha256', implode(',', [$centerLat, $centerLon, $span, '1024']));
$cacheFile = $cacheDir . '/' . $key . '.jpg';

if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < 2592000) {
    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=2592000, immutable');
    readfile($cacheFile);
    exit;
}

$params = [
    'SERVICE' => 'WMS',
    'VERSION' => '1.1.1',
    'REQUEST' => 'GetMap',
    'LAYERS' => 'BlueMarble_NextGeneration',
    'STYLES' => '',
    'FORMAT' => 'image/jpeg',
    'SRS' => 'EPSG:4326',
    'BBOX' => implode(',', [$minLon, $minLat, $maxLon, $maxLat]),
    'WIDTH' => '1024',
    'HEIGHT' => '1024',
];

$url = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?' .
    http_build_query($params, '', '&', PHP_QUERY_RFC3986);

$body = false;
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_USERAGENT => 'hmax.space regional globe/1.0',
    ]);
    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $type = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    if ($status !== 200 || stripos($type, 'image/') !== 0) $body = false;
} else {
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 6,
            'user_agent' => 'hmax.space regional globe/1.0',
        ],
    ]);
    $body = @file_get_contents($url, false, $ctx);
}

if (!is_string($body) || strlen($body) < 4096) {
    http_response_code(502);
    exit;
}

@file_put_contents($cacheFile . '.tmp', $body, LOCK_EX);
@rename($cacheFile . '.tmp', $cacheFile);

header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=2592000, immutable');
echo $body;
