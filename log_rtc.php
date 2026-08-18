<?php
header('Content-Type: application/json');
header('X-Robots-Tag: noindex');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405); echo json_encode(['ok' => false]); exit;
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) {
    http_response_code(413); echo json_encode(['ok' => false]); exit;
}

require __DIR__ . '/includes/clientip.php';

// rate limit: 1 write per IP per 60s
$stamp = '/var/cache/hmax-geo/rtc_' . hash('sha256', $ip);
if (is_readable($stamp) && (time() - filemtime($stamp)) < 60) {
    echo json_encode(['ok' => true, 'cached' => true]); exit;
}
@touch($stamp);

$raw = file_get_contents('php://input', false, null, 0, 4096);
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400); echo json_encode(['ok' => false]); exit;
}

function clean($v, $max = 200) {
    if ($v === null) return 'Unknown';
    if (is_array($v)) $v = implode(', ', array_slice($v, 0, 10));
    $v = preg_replace('/[^\P{C}]+/u', ' ', (string) $v);
    return mb_substr(trim($v), 0, $max);
}

$f = [
  'localIps'   => clean($data['localIps']   ?? null, 150),
  'cores'      => clean($data['cores']      ?? null, 20),
  'ram'        => clean($data['ram']        ?? null, 30),
  'gpu'        => clean($data['gpu']        ?? null, 150),
  'screenInfo' => clean($data['screenInfo'] ?? null, 60),
  'timezone'   => clean($data['timezone']   ?? null, 60),
  'languages'  => clean($data['languages']  ?? null, 60),
];

$log = date('Y-m-d H:i:s') . " - RTC-FINGERPRINT for IP: $ip"
     . " | WebRTC IP(s): {$f['localIps']} | CPU Cores: {$f['cores']}"
     . " | RAM: {$f['ram']} | GPU: {$f['gpu']} | Screen: {$f['screenInfo']}"
     . " | TZ: {$f['timezone']} | Lang: {$f['languages']}\n";
file_put_contents('/var/log/visits.log', $log, FILE_APPEND | LOCK_EX);

echo json_encode(['ok' => true]);
