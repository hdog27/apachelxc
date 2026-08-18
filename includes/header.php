<?php
// ==========================================================================
// header.php - doctype, <head> (per-page meta + OG/Twitter), nav, open body
// Expects the including page to define, before requiring this file:
//   $page_title        - <title> and OG/Twitter title
//   $page_description   - meta description + OG/Twitter description
//   $page_css           - (optional) page-specific stylesheet in /css
//   $og_image           - (optional) absolute URL for social preview image
// Also expects metadata.php to have been included so $current_page is set.
// ==========================================================================

if (!isset($page_title))       { $page_title = 'hmax.space | Homelab & Cyber Security Portfolio'; }
if (!isset($page_description)) { $page_description = 'Homelab builds, SIEM/Splunk projects, VLAN design, and a live web metadata security demo.'; }
if (!isset($og_image))         { $og_image = 'https://hmax.space/background.jpg'; }
if (!isset($current_page))     { $current_page = 'index'; }
if (!isset($body_class))       { $body_class = ''; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($page_title) ?></title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#0d1117">

  <meta name="description" content="<?= htmlspecialchars($page_description) ?>">

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://hmax.space<?= htmlspecialchars($_SERVER['REQUEST_URI']) ?>">
  <meta property="og:title" content="<?= htmlspecialchars($page_title) ?>">
  <meta property="og:description" content="<?= htmlspecialchars($page_description) ?>">
  <meta property="og:image" content="<?= htmlspecialchars($og_image) ?>">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= htmlspecialchars($page_title) ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($page_description) ?>">
  <meta name="twitter:image" content="<?= htmlspecialchars($og_image) ?>">

  <link rel="canonical" href="https://hmax.space<?= htmlspecialchars(strtok($_SERVER["REQUEST_URI"], "?")) ?>">
  <link rel="stylesheet" href="/css/stars.css?v=<?= @filemtime(__DIR__ . "/../css/stars.css") ?>">
  <link rel="stylesheet" href="/css/style.css?v=<?= @filemtime(__DIR__ . '/../css/style.css') ?>">
<?php if (!empty($page_css)): ?>
  <link rel="stylesheet" href="/css/<?= htmlspecialchars($page_css) ?>?v=<?= @filemtime(__DIR__ . '/../css/' . $page_css) ?>">
<?php endif; ?>
  <link rel="stylesheet" href="/css/nav.css?v=<?= @filemtime(__DIR__ . "/../css/nav.css") ?>">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Harrison","url":"https://hmax.space","jobTitle":"Cybersecurity Student","sameAs":["https://github.com/hdog27","https://www.linkedin.com/in/harrison-smith1234/"]}</script>
</head>
<body class="<?= htmlspecialchars($body_class) ?>">
<div class="stars-layer" aria-hidden="true"><div id="stars"></div><div id="stars2"></div><div id="stars3"></div></div>
<div class="hm-bar"><button class="hm-burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button><div class="hm-runner" aria-hidden="true"></div><span class="hm-wordmark">Nothing here is hacking you</span></div>
<div class="hm-scrim"></div>
<aside class="hm-drawer"><div class="hm-sneak" aria-hidden="true"></div></aside>

<nav class="top-nav">
  <a class="nav-btn<?= nav_active('homelab', $current_page) ?>" href="/homelab">Homelab</a>
  <a class="nav-btn<?= nav_active('index', $current_page) ?>" href="/">Cyber Lab</a>
  <a class="nav-btn<?= nav_active('projects', $current_page) ?>" href="/projects">Projects</a>
  <a class="nav-btn<?= nav_active("start", $current_page) ?>" href="/start">Get Started</a>
  <a class="nav-btn<?= nav_active("teaching", $current_page) ?>" href="/teaching">Teaching</a>
  <a class="nav-btn<?= nav_active('contact', $current_page) ?>" href="/contact">Contact</a>
  <a class="nav-btn<?= nav_active("safe", $current_page) ?>" href="/safe">Is this safe?</a>
  <div class="hm-deskcat" aria-hidden="true"></div>
</nav>

