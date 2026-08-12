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

if (!isset($page_title))       { $page_title = 'hmax.space — Homelab & Cyber Security Portfolio'; }
if (!isset($page_description)) { $page_description = 'Homelab builds, SIEM/Splunk projects, VLAN design, and a live web metadata security demo.'; }
if (!isset($og_image))         { $og_image = 'https://hmax.space/background.jpg'; }
if (!isset($current_page))     { $current_page = 'index'; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($page_title) ?></title>

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

  <link rel="stylesheet" href="/css/style.css">
<?php if (!empty($page_css)): ?>
  <link rel="stylesheet" href="/css/<?= htmlspecialchars($page_css) ?>">
<?php endif; ?>
</head>
<body>

<nav class="top-nav">
  <a class="nav-btn<?= nav_active('homelab', $current_page) ?>" href="/homelab">Homelab</a>
  <a class="nav-btn<?= nav_active('index', $current_page) ?>" href="/">Cyber Lab</a>
  <a class="nav-btn<?= nav_active('projects', $current_page) ?>" href="/projects">Projects</a>
  <a class="nav-btn<?= nav_active('contact', $current_page) ?>" href="/contact">Contact</a>
</nav>
