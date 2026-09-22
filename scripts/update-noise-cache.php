<?php
// Run as root from cron once per minute.
// Reads raw Apache access.log, emits only sanitized aggregate telemetry to
// /var/cache/hmax-noise.json for the public PHP page to consume.
// Pass --debug when running manually to print parser diagnostics.

require_once __DIR__ . '/../vendor/autoload.php';

$logFiles = [
    '/var/log/apache2/access.log.1',
    '/var/log/apache2/access.log',
];
$cacheFile = '/var/cache/hmax-noise.json';
$debug = in_array('--debug', $argv ?? [], true);

$empty = [
    'window' => '24h',
    'requests' => 0,
    'suspected_scanners' => 0,
    'networks' => 0,
    'top_probes' => [],
    'taxonomy' => [],
    'activity' => [],
    'geo_points' => [],
    'latest' => null,
    'updated' => time(),
];

function debug_line($message) {
    global $debug;
    if ($debug) fwrite(STDOUT, $message . PHP_EOL);
}

function apache_timestamp($raw) {
    $raw = trim($raw);

    $dt = DateTimeImmutable::createFromFormat('d/M/Y:H:i:s O', $raw);
    if ($dt instanceof DateTimeImmutable) return $dt->getTimestamp();

    $dt = DateTimeImmutable::createFromFormat('d/M/Y:H:i:s', $raw);
    if ($dt instanceof DateTimeImmutable) return $dt->getTimestamp();

    $normalized = preg_replace('~^(\d{2}/[A-Za-z]{3}/\d{4}):(\d{2}:\d{2}:\d{2})(.*)$~', '$1 $2$3', $raw);
    $fallback = strtotime($normalized ?: $raw);
    return $fallback !== false ? $fallback : null;
}

$readableLogs = array_values(array_filter($logFiles, 'is_readable'));
if (!$readableLogs) {
    file_put_contents($cacheFile, json_encode($empty, JSON_UNESCAPED_SLASHES), LOCK_EX);
    chmod($cacheFile, 0644);
    debug_line('ERROR: no Apache access logs are readable');
    exit(0);
}

$patterns = [
    'Credential / secret hunting' => '~(?:^|/)(?:\.env(?:[./?]|$)|env\.bak|config\.env|aws/credentials|\.aws(?:/|$)|id_rsa|\.ssh(?:/|$)|credentials(?:[./?]|$)|secrets?(?:[./?]|$))~i',
    'Git / source exposure' => '~(?:^|/)(?:\.git(?:/|$)|\.svn(?:/|$))~i',
    'WordPress probes' => '~(?:^|/)(?:wp-login\.php|wp-admin(?:/|$)|xmlrpc\.php|wp-content(?:/|$)|wp-includes(?:/|$))~i',
    'PHP / debug probes' => '~(?:phpinfo|[?&]pp=env(?:&|$)|debug(?:/|\?|$)|_profiler|phpmyadmin|(?:^|/)pma(?:/|$))~i',
    'Known exploit paths' => '~(?:^|/)(?:vendor/phpunit|actuator|cgi-bin|boaform|HNAP1|manager/html|solr|jenkins|console/login)~i',
    'Backup / config hunting' => '~(?:^|/)(?:backup|bak|old|config)(?:[./_-]|/).*?(?:zip|tar|gz|sql|yml|yaml|json|ini|php)?(?:\?|$)~i',
];

$now = time();
$cutoff = $now - 86400;
$requestCount = 0;
$probeCounts = [];
$probeLabels = [];
$taxonomy = array_fill_keys(array_keys($patterns), 0);
$scannerIps = [];
$networkKeys = [];
$latest = null;
$geoCells = [];
$geoByIp = [];

$geoReader = null;
try {
    $geoReader = new \GeoIp2\Database\Reader('/var/lib/GeoIP/GeoLite2-City.mmdb');
} catch (\Throwable $e) {}

// Exactly 24 local-hour buckets. These count suspicious requests only.
$currentHour = intdiv($now, 3600) * 3600;
$activityCounts = [];
$activityNetworks = [];
for ($i = 23; $i >= 0; $i--) {
    $bucketTs = $currentHour - ($i * 3600);
    $activityCounts[$bucketTs] = 0;
    $activityNetworks[$bucketTs] = [];
}

$lineCount = 0;
$regexMatches = 0;
$timestampMatches = 0;
$recentMatches = 0;
$firstRejectedTimestamp = null;

$maxBytesPerLog = 16 * 1024 * 1024;
$totalLogBytes = 0;
foreach ($readableLogs as $logFile) {
    $size = @filesize($logFile);
    $totalLogBytes += $size ?: 0;
    $fh = @fopen($logFile, 'rb');
    if (!$fh) {
        debug_line('WARNING: fopen failed: ' . $logFile);
        continue;
    }
    if ($size && $size > $maxBytesPerLog) {
        @fseek($fh, -$maxBytesPerLog, SEEK_END);
        fgets($fh);
    }

    while (($line = fgets($fh)) !== false) {
        $lineCount++;

        if (!preg_match('~^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^\s"]+)~', $line, $m)) {
            if (!preg_match('~^(\S+).*?\[([^\]]+)\]\s+"([A-Z]+)\s+([^\s"]+)~', $line, $m)) continue;
        }
        $regexMatches++;

        $ipAddr = $m[1];
        $ts = apache_timestamp($m[2]);
        if (!$ts) {
            if ($firstRejectedTimestamp === null) $firstRejectedTimestamp = $m[2];
            continue;
        }
        $timestampMatches++;
        if ($ts < $cutoff) continue;
        $recentMatches++;

        $path = $m[4];
        $requestPath = parse_url($path, PHP_URL_PATH) ?: $path;

        // Internal HTMX fragment requests are application plumbing, not Internet noise.
        // Excluding them keeps the public request counter comparable to the pre-HTMX site.
        if (in_array($requestPath, ['/partials/repo-readme', '/partials/repo-readme.php', '/partials/noise-panel', '/partials/noise-panel.php'], true)) continue;

        $requestCount++;

        // Build a privacy-preserving 24h globe dataset. Each unique IP is
        // geolocated locally once per parser run, then rounded to a 1-degree
        // grid before aggregation. The public cache never exposes raw IPs.
        if ($geoReader) {
            if (!array_key_exists($ipAddr, $geoByIp)) {
                $geoByIp[$ipAddr] = null;
                try {
                    $record = $geoReader->city($ipAddr);
                    $lat = $record->location->latitude;
                    $lon = $record->location->longitude;
                    if (is_numeric($lat) && is_numeric($lon)) {
                        $geoByIp[$ipAddr] = [
                            'lat' => round((float)$lat),
                            'lon' => round((float)$lon),
                        ];
                    }
                } catch (\Throwable $e) {}
            }

            if (is_array($geoByIp[$ipAddr])) {
                $g = $geoByIp[$ipAddr];
                $key = $g['lat'] . ',' . $g['lon'];
                if (!isset($geoCells[$key])) {
                    $geoCells[$key] = ['lat' => $g['lat'], 'lon' => $g['lon'], 'count' => 0];
                }
                $geoCells[$key]['count']++;
            }
        }

        $label = null;
        foreach ($patterns as $name => $regex) {
            if (preg_match($regex, $path)) { $label = $name; break; }
        }
        if ($label === null) continue;

        $probeCounts[$path] = ($probeCounts[$path] ?? 0) + 1;
        $probeLabels[$path] = $label;
        $taxonomy[$label]++;
        $scannerIps[hash('sha256', $ipAddr)] = true;

        if (filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ipAddr);
            $net = $parts[0] . '.' . $parts[1] . '.' . $parts[2] . '.0/24';
        } elseif (filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $packed = @inet_pton($ipAddr);
            $net = $packed ? bin2hex(substr($packed, 0, 6)) . '::/48' : 'ipv6';
        } else {
            $net = 'unknown';
        }

        $networkHash = hash('sha256', $net);
        $networkKeys[$networkHash] = true;

        $bucketTs = intdiv($ts, 3600) * 3600;
        if (array_key_exists($bucketTs, $activityCounts)) {
            $activityCounts[$bucketTs]++;
            $activityNetworks[$bucketTs][$networkHash] = true;
        }

        if (!$latest || $ts > $latest['ts']) {
            $latest = ['ts' => $ts, 'path' => $path, 'type' => $label, 'ip' => $ipAddr];
        }
    }
    fclose($fh);
}

arsort($probeCounts);
arsort($taxonomy);

// Show a representative live path for every scanner taxonomy instead of
// letting the five highest-volume paths crowd out less common attack types.
$top = [];
$seenTypes = [];
foreach ($probeCounts as $path => $count) {
    $type = $probeLabels[$path] ?? null;
    if (!$type || isset($seenTypes[$type])) continue;

    $top[] = [
        'path' => mb_substr($path, 0, 70),
        'count' => $count,
        'type' => $type,
    ];
    $seenTypes[$type] = true;

    if (count($seenTypes) >= count($patterns)) break;
}

// Keep the representative rows ordered by current taxonomy volume so the
// highest-activity category still appears first.
usort($top, function ($a, $b) use ($taxonomy) {
    $aCount = $taxonomy[$a['type']] ?? 0;
    $bCount = $taxonomy[$b['type']] ?? 0;
    return $bCount <=> $aCount;
});

$activity = [];
foreach ($activityCounts as $bucketTs => $count) {
    $activity[] = [
        'ts' => (int)$bucketTs,
        'count' => (int)$count,
        'networks' => count($activityNetworks[$bucketTs]),
    ];
}

$geoPoints = array_values($geoCells);
usort($geoPoints, function ($a, $b) {
    return ($b['count'] ?? 0) <=> ($a['count'] ?? 0);
});
$geoPoints = array_slice($geoPoints, 0, 80);

$latestPublic = null;
if ($latest) {
    $latestCountry = 'Unknown';
    try {
        $reader = new \GeoIp2\Database\Reader('/var/lib/GeoIP/GeoLite2-City.mmdb');
        $record = $reader->city($latest['ip']);
        $latestCountry = $record->country->name ?: 'Unknown';
    } catch (\Throwable $e) {}

    $latestPublic = [
        'path' => mb_substr($latest['path'], 0, 70),
        'type' => $latest['type'],
        'country' => $latestCountry,
        'ts' => $latest['ts'],
        'age_seconds' => max(0, time() - $latest['ts']),
    ];
}

$taxonomy = array_filter($taxonomy, function ($count) { return $count > 0; });

$out = [
    'window' => '24h',
    'requests' => $requestCount,
    'suspected_scanners' => count($scannerIps),
    'networks' => count($networkKeys),
    'top_probes' => $top,
    'taxonomy' => $taxonomy,
    'activity' => $activity,
    'geo_points' => $geoPoints,
    'latest' => $latestPublic,
    'updated' => time(),
];

$tmp = $cacheFile . '.tmp';
file_put_contents($tmp, json_encode($out, JSON_UNESCAPED_SLASHES), LOCK_EX);
chmod($tmp, 0644);
rename($tmp, $cacheFile);

debug_line('log files: ' . implode(', ', $readableLogs));
debug_line('log bytes: ' . $totalLogBytes);
debug_line('lines scanned: ' . $lineCount);
debug_line('request regex matches: ' . $regexMatches);
debug_line('timestamps parsed: ' . $timestampMatches);
debug_line('requests inside 24h: ' . $recentMatches);
debug_line('suspicious unique IPs: ' . count($scannerIps));
debug_line('suspicious source networks: ' . count($networkKeys));
debug_line('activity buckets: ' . count($activity));
debug_line('public globe geo cells: ' . count($geoPoints));
if ($firstRejectedTimestamp !== null) debug_line('first rejected timestamp: ' . $firstRejectedTimestamp);
debug_line('cache: ' . $cacheFile);
