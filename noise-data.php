<?php
require_once __DIR__ . '/includes/noise.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex');

$noise = hmax_noise_stats();

// Deliberately expose only sanitized aggregate timeline data. No raw client IP,
// request header, user-agent or individual visitor record is returned here.
$out = [
    'available' => (bool)($noise['available'] ?? false),
    'window' => $noise['window'] ?? '24h',
    'activity' => is_array($noise['activity'] ?? null) ? $noise['activity'] : [],
    'updated' => $noise['updated'] ?? null,
];

echo json_encode($out, JSON_UNESCAPED_SLASHES);
