<?php
// Run as root from cron once per minute.
// Reads raw Apache access.log, emits only sanitized aggregate telemetry to
// /var/cache/hmax-noise.json for the public PHP page to consume.
// Pass --debug when running manually to print parser diagnostics.

require_once __DIR__ . '/../vendor/autoload.php';

$logFile = '/var/log/apache2/access.log';
$cacheFile = '/var/cache/hmax-noise.json';
$debug = in_array('--debug', $argv ?? [], true);

$empty = [
    'window' => '24h',
    'requests' => 0,
    'suspected_scanners' => 0,
    'networks' => 0,
    'top_probes' => [],
    'taxonomy' => [],
    'latest' => null,
    'updated' => time(),
];

function debug_line($message) {
    global $debug;
    if ($debug) fwrite(STDOUT, $message . PHP_EOL);
}

function apache_timestamp($raw) {
    $raw = trim($raw);

    // Standard Apache combined-log timestamp:
    // 04/Sep/2026:13:09:01 -0400
    $dt = DateTimeImmutable::createFromFormat('d/M/Y:H:i:s O', $raw);
    if ($dt instanceof DateTimeImmutable) return $dt->getTimestamp();

    // Some custom formats omit the numeric timezone.
    $dt = DateTimeImmutable::createFromFormat('d/M/Y:H:i:s', $raw);
    if ($dt instanceof DateTimeImmutable) return $dt->getTimestamp();

    // Final fallback for unusual but still parseable Apache timestamps.
    $normalized = preg_replace('~^(\d{2}/[A-Za-z]{3}/\d{4}):(\d{2}:\d{2}:\d{2})(.*)$~', '$1 $2$3', $raw);
    $fallback = strtotime($normalized ?: $raw);
    return $fallback !== false ? $fallback : null;
}

if (!is_readable($logFile)) {
    file_put_contents($cacheFile, json_encode($empty, JSON_UNESCAPED_SLASHES), LOCK_EX);
    chmod($cacheFile, 0644);
    debug_line('ERROR: access log is not readable: ' . $logFile);
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

$cutoff = time() - 86400;
$requestCount = 0;
$probeCounts = [];
$taxonomy = array_fill_keys(array_keys($patterns), 0);
$scannerIps = [];
$networkKeys = [];
$latest = null;

$lineCount = 0;
$regexMatches = 0;
$timestampMatches = 0;
$recentMatches = 0;
$firstRejectedTimestamp = null;

$maxBytes = 16 * 1024 * 1024;
$size = @filesize($logFile);
$fh = @fopen($logFile, 'rb');
if (!$fh) {
    file_put_contents($cacheFile, json_encode($empty, JSON_UNESCAPED_SLASHES), LOCK_EX);
    chmod($cacheFile, 0644);
    debug_line('ERROR: fopen failed: ' . $logFile);
    exit(0);
}
if ($size && $size > $maxBytes) {
    @fseek($fh, -$maxBytes, SEEK_END);
    // Discard the partial line created by seeking into the file.
    fgets($fh);
}

while (($line = fgets($fh)) !== false) {
    $lineCount++;

    // Standard combined Apache log, e.g.:
    // 203.0.113.10 - - [04/Sep/2026:13:09:01 -0400] "GET /.env HTTP/2.0" 404 ...
    if (!preg_match('~^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^\s"]+)~', $line, $m)) {
        // Tolerant fallback for custom prefixes between client IP and timestamp.
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

    $requestCount++;
    $path = $m[4];
    $label = null;
    foreach ($patterns as $name => $regex) {
        if (preg_match($regex, $path)) { $label = $name; break; }
    }
    if ($label === null) continue;

    $probeCounts[$path] = ($probeCounts[$path] ?? 0) + 1;
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
    $networkKeys[hash('sha256', $net)] = true;

    if (!$latest || $ts > $latest['ts']) {
        $latest = ['ts' => $ts, 'path' => $path, 'type' => $label, 'ip' => $ipAddr];
    }
}
fclose($fh);

arsort($probeCounts);
arsort($taxonomy);
$top = [];
foreach (array_slice($probeCounts, 0, 5, true) as $path => $count) {
    $top[] = ['path' => mb_substr($path, 0, 70), 'count' => $count];
}

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
    'latest' => $latestPublic,
    'updated' => time(),
];

$tmp = $cacheFile . '.tmp';
file_put_contents($tmp, json_encode($out, JSON_UNESCAPED_SLASHES), LOCK_EX);
chmod($tmp, 0644);
rename($tmp, $cacheFile);

debug_line('log bytes: ' . ($size ?: 0));
debug_line('lines scanned: ' . $lineCount);
debug_line('request regex matches: ' . $regexMatches);
debug_line('timestamps parsed: ' . $timestampMatches);
debug_line('requests inside 24h: ' . $recentMatches);
debug_line('suspicious unique IPs: ' . count($scannerIps));
debug_line('suspicious source networks: ' . count($networkKeys));
if ($firstRejectedTimestamp !== null) debug_line('first rejected timestamp: ' . $firstRejectedTimestamp);
debug_line('cache: ' . $cacheFile);
