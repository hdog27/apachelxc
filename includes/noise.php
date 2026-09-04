<?php
// Public web-side reader for sanitized Internet-noise telemetry.
// Raw Apache logs are parsed by scripts/update-noise-cache.php as root from cron.
// The website only reads this aggregate JSON cache; it never needs log access.

function hmax_noise_empty() {
    return [
        'available' => false,
        'window' => '24h',
        'requests' => 0,
        'suspected_scanners' => 0,
        'networks' => 0,
        'top_probes' => [],
        'taxonomy' => [],
        'latest' => null,
        'updated' => null,
    ];
}

function hmax_noise_stats() {
    $cache = '/var/cache/hmax-noise.json';
    if (!is_readable($cache)) return hmax_noise_empty();

    $raw = @file_get_contents($cache);
    if (!$raw) return hmax_noise_empty();

    $data = json_decode($raw, true);
    if (!is_array($data)) return hmax_noise_empty();

    $required = ['window','requests','suspected_scanners','networks','top_probes','taxonomy','latest','updated'];
    foreach ($required as $key) {
        if (!array_key_exists($key, $data)) return hmax_noise_empty();
    }

    // Treat very stale data as unavailable rather than pretending it is live.
    if (empty($data['updated']) || (time() - (int)$data['updated']) > 300) {
        return hmax_noise_empty();
    }

    $data['available'] = true;
    return $data;
}
