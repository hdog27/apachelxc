<?php
http_response_code(404);
require_once __DIR__ . '/includes/metadata.php';
$current_page     = '404';
$page_title       = '404 | hmax.space';
$page_description = 'Page not found.';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <header class="page-credential-layout">
    <div class="page-credential-copy">
  <h1>404</h1>
  <p class="subtext">This page doesn't exist. Your request was still logged, though.</p>
    </div>
    <?php require __DIR__ . '/includes/csap-badge.php'; ?>
  </header>
  <p>Requested: <code><?= htmlspecialchars(strtok($_SERVER['REQUEST_URI'], '?')) ?></code></p>
  <hr class="divider">
  <p>Try the <a href="/">Cyber Lab</a>, the <a href="/homelab">homelab</a>, or <a href="/projects">projects</a>.</p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
