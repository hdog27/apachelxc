<?php
// Aggregate suspicious-looking public web probes without exposing visitor IPs.
// This intentionally treats "scanner" as a heuristic, not a verdict.
// Results are cached so normal page loads do not repeatedly parse Apache logs.

function hmax_noise_stats() {
    $empty = [
        'available' => false,
        'window' => '24h',
        'requests' => 0,
        'suspected_scanners' => 0,
        'networks' => 0,
        'top_probes' => [],
        'latest' => null,
        'updated' => null,
    ];

    $cache = '/var/cache/hmax-noise.json';
    if (is_readable($cache) && (time() - filemtime($cache)) < 60) {
        $cached = json_decode(@file_get_contents($cache), true);
        if (is_array($cached)) return $cached;
    }

    // Debian/Ubuntu Apache default first, then common alternates.
    $candidates = [
        '/var/log/apache2/access.log',
        '/var/log/apache2/other_vhosts_access.log',
        '/var/log/httpd/access_log',
        '/var/log/httpd/access.log',
    ];
    $logFile = null;
    foreach ($candidates as $candidate) {
        if (is_readable($candidate)) { $logFile = $candidate; break; }
    }
    if (!$logFile) return $empty;

    $patterns = [
        'Environment files' => '~/(?:\.env(?:\.|$)|env\.bak|config\.env)~i',
        'Git exposure' => '~/(?:\.git(?:/|$)|\.svn(?:/|$))~i',
        'WordPress login' => '~/(?:wp-login\.php|wp-admin(?:/|$)|xmlrpc\.php)~i',
        'PHP info/debug' => '~(?:phpinfo|\?pp=env|debug(?:/|\?|$)|_profiler)~i',
        'phpMyAdmin' => '~/(?:phpmyadmin|pma)(?:/|$)~i',
        'Framework exploit probe' => '~/(?:vendor/phpunit|actuator|cgi-bin|\.well-known/security\.txt\.php)~i',
        'Secrets/credentials' => '~/(?:aws/credentials|\.aws|id_rsa|\.ssh|credentials(?:\.|/)|secrets?(?:\.|/))~i',
        'Backup/config files' => '~/(?:backup|bak|old|config)(?:\.|/).*?(?:zip|tar|gz|sql|yml|yaml|json|ini|php)?(?:\?|$)~i',
    ];

    $cutoff = time() - 86400;
    $requestCount = 0;
    $probeCounts = [];
    $scannerIps = [];
    $networkKeys = [];
    $latest = null;

    // Read only the tail. On a personal portfolio this comfortably covers a
    // day while preventing a giant bot-spammed log from eating memory.
    $maxBytes = 12 * 1024 * 1024;
    $size = @filesize($logFile);
    $fh = @fopen($logFile, 'rb');
    if (!$fh) return $empty;
    if ($size && $size > $maxBytes) @fseek($fh, -$maxBytes, SEEK_END);

    while (($line = fgets($fh)) !== false) {
        // Common/combined Apache log: IP ... [04/Sep/2026:01:53:01 -0400] "GET /?phpinfo=1 HTTP/1.1"
        if (!preg_match('~^(\S+).*?\[([^\]]+)\]\s+"([A-Z]+)\s+([^\s"]+)~', $line, $m)) continue;
        $ipAddr = $m[1];
        $ts = strtotime(preg_replace('~:(\d{2}):(\d{2}):(\d{2})\s~', ' $1:$2:$3 ', $m[2]));
        if (!$ts || $ts < $cutoff) continue;

        $requestCount++;
        $path = $m[4];
        $matched = false;
        $label = null;
        foreach ($patterns as $name => $regex) {
            if (preg_match($regex, $path)) {
                $matched = true;
                $label = $name;
                break;
            }
        }
        if (!$matched) continue;

        $probeCounts[$path] = ($probeCounts[$path] ?? 0) + 1;
        $scannerIps[hash('sha256', $ipAddr)] = true;

        // Approximate source-network uniqueness without retaining raw IPs.
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
            $latest = ['ts' => $ts, 'path' => $path, 'type' => $label];
        }
    }
    fclose($fh);

    arsort($probeCounts);
    $top = [];
    foreach (array_slice($probeCounts, 0, 5, true) as $path => $count) {
        $top[] = ['path' => mb_substr($path, 0, 70), 'count' => $count];
    }

    $out = [
        'available' => true,
        'window' => '24h',
        'requests' => $requestCount,
        'suspected_scanners' => count($scannerIps),
        'networks' => count($networkKeys),
        'top_probes' => $top,
        'latest' => $latest ? ['path' => mb_substr($latest['path'], 0, 70), 'type' => $latest['type'], 'ts' => $latest['ts']] : null,
        'updated' => time(),
    ];

    @file_put_contents($cache, json_encode($out, JSON_UNESCAPED_SLASHES), LOCK_EX);
    return $out;
}
