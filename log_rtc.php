<?php
header('Content-Type: application/json');

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

function clean($v, $max = 200) {
    if ($v === null) return 'Unknown';
    if (is_array($v)) $v = implode(', ', $v);
    $v = (string) $v;
    $v = preg_replace('/[\r\n]+/', ' ', $v);
    return mb_substr($v, 0, $max);
}

$cores  = clean($data['cores'] ?? null, 20);
$ram    = clean($data['ram'] ?? null, 30);
$gpu    = clean($data['gpu'] ?? null, 150);
$locals = clean($data['localIps'] ?? null, 150);
$scr    = clean($data['screenInfo'] ?? null, 60);
$tz     = clean($data['timezone'] ?? null, 60);
$langs  = clean($data['languages'] ?? null, 60);

$log = date('Y-m-d H:i:s') . " - RTC-FINGERPRINT for IP: $ip \xe2\x80\x93 WebRTC IP(s): $locals \xe2\x80\x93 CPU Cores: $cores \xe2\x80\x93 RAM: $ram \xe2\x80\x93 GPU: $gpu \xe2\x80\x93 Screen: $scr \xe2\x80\x93 TZ: $tz \xe2\x80\x93 Lang: $langs\n";

file_put_contents('/var/log/visits.log', $log, FILE_APPEND | LOCK_EX);

echo json_encode(['ok' => true]);
