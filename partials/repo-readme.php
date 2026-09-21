<?php
declare(strict_types=1);

// HTMX fragment endpoint for project README previews.
// This file intentionally does NOT include metadata.php so fragment requests
// never increment visitor counters, write visit logs, or touch browser metrics.

header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: public, max-age=300, stale-while-revalidate=86400');
header('X-Robots-Tag: noindex, nofollow');

$allowedRepos = [
    'cloud-firewall-guard-showcase' => 'hdog27/cloud-firewall-guard-showcase',
    'airgeddon-evil-twin-captive-portal' => 'hdog27/airgeddon-evil-twin-captive-portal',
    'Protectli-v1410-HomeLab-Net-Security' => 'hdog27/Protectli-v1410-HomeLab-Net-Security',
    'Apache-IP-Logging-HomeLab-On-Proxmox' => 'hdog27/Apache-IP-Logging-HomeLab-On-Proxmox',
    'ESP32-HyperHDR-LED-Controller' => 'hdog27/ESP32-HyperHDR-LED-Controller',
];

$repoKey = isset($_GET['repo']) ? trim((string)$_GET['repo']) : '';
if (!isset($allowedRepos[$repoKey])) {
    http_response_code(404);
    echo '<p class="repo-embed-error">README preview unavailable.</p>';
    exit;
}

$fullRepo = $allowedRepos[$repoKey];
$cacheDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'hmax-readme-cache';
$cacheFile = $cacheDir . DIRECTORY_SEPARATOR . hash('sha256', $fullRepo) . '.html';
$lockFile = $cacheFile . '.lock';
$cacheTtl = 21600; // 6 hours

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0750, true);
}

function hmax_emit_readme(string $html): void {
    echo '<div class="repo-readme-markdown">' . $html . '</div>';
}

function hmax_http_get(string $url, array $headers): array {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) return [null, 0];

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 7,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_USERAGENT => 'hmax.space-readme-cache',
        ]);

        $body = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        return [is_string($body) ? $body : null, $status];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => implode("\r\n", array_merge($headers, ['User-Agent: hmax.space-readme-cache'])),
            'timeout' => 7,
            'ignore_errors' => true,
        ],
    ]);

    $body = @file_get_contents($url, false, $context);
    $status = 0;
    foreach ($http_response_header ?? [] as $line) {
        if (preg_match('~^HTTP/\\S+\\s+(\\d{3})~', $line, $m)) {
            $status = (int)$m[1];
            break;
        }
    }

    return [is_string($body) ? $body : null, $status];
}

function hmax_normalize_github_html(?string $body): ?string {
    if ($body === null) return null;
    $trimmed = ltrim($body);
    if ($trimmed === '') return null;

    // GitHub's HTML media type normally returns rendered HTML directly.
    // Handle a JSON string/object too so the endpoint stays resilient if the
    // response representation changes.
    if ($trimmed[0] === '"') {
        $decoded = json_decode($body, true);
        if (is_string($decoded)) $body = $decoded;
    } elseif ($trimmed[0] === '{') {
        $decoded = json_decode($body, true);
        if (is_array($decoded)) {
            if (!empty($decoded['body_html']) && is_string($decoded['body_html'])) {
                $body = $decoded['body_html'];
            } elseif (!empty($decoded['html']) && is_string($decoded['html'])) {
                $body = $decoded['html'];
            } else {
                return null;
            }
        }
    }

    return stripos($body, '<') !== false ? $body : null;
}

$cached = is_readable($cacheFile) ? @file_get_contents($cacheFile) : false;
$cacheFresh = $cached !== false && (time() - (int)@filemtime($cacheFile)) < $cacheTtl;
if ($cacheFresh) {
    header('X-Hmax-README-Cache: HIT');
    hmax_emit_readme($cached);
    exit;
}

$lock = @fopen($lockFile, 'c+');
if ($lock && @flock($lock, LOCK_EX)) {
    // Another request may have refreshed the cache while this request waited.
    clearstatcache(true, $cacheFile);
    $cached = is_readable($cacheFile) ? @file_get_contents($cacheFile) : false;
    $cacheFresh = $cached !== false && (time() - (int)@filemtime($cacheFile)) < $cacheTtl;

    if (!$cacheFresh) {
        $apiUrl = 'https://api.github.com/repos/' . $fullRepo . '/readme';
        [$body, $status] = hmax_http_get($apiUrl, [
            'Accept: application/vnd.github.html+json',
            'X-GitHub-Api-Version: 2022-11-28',
        ]);

        $rendered = $status === 200 ? hmax_normalize_github_html($body) : null;
        if ($rendered !== null) {
            $tmp = $cacheFile . '.' . getmypid() . '.tmp';
            if (@file_put_contents($tmp, $rendered, LOCK_EX) !== false) {
                @chmod($tmp, 0640);
                @rename($tmp, $cacheFile);
                $cached = $rendered;
            } else {
                @unlink($tmp);
            }
        }
    }

    @flock($lock, LOCK_UN);
    fclose($lock);
}

if (is_string($cached) && $cached !== '') {
    header('X-Hmax-README-Cache: ' . ($cacheFresh ? 'HIT' : 'STALE'));
    hmax_emit_readme($cached);
    exit;
}

header('X-Hmax-README-Cache: MISS');
echo '<p class="repo-embed-error">README preview is temporarily unavailable. Use the GitHub link above to open the project.</p>';
