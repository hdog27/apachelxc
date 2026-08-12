<?php
// ==========================================================================
// projects.php - kept as-is from the original site (neither fork improved it).
// The GitHub README embed is driven by main.js (.repo-embed loader).
// ==========================================================================
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Projects — hmax.space';
$page_description = 'Security projects: an Airgeddon evil-twin captive portal, Splunk SIEM build, VLAN design, Cloudflare Tunnel setup and red-team teaching demos.';

require __DIR__ . '/includes/header.php';
?>

<div class="card">
  <h2>Projects</h2>
  <div class="project-item">
    <h3>Evil Twin Captive Portal &mdash; Airgeddon-based</h3>
    <p>A red-team homelab build combining Airgeddon with a custom captive portal to demonstrate evil-twin Wi-Fi attacks for teaching and demo purposes.</p>
    <div class="repo-embed" data-user="hdog27" data-repo="airgeddon-evil-twin-captive-portal">
      <div class="repo-embed-header">
        <span class="repo-embed-name">hdog27/airgeddon-evil-twin-captive-portal</span>
        <a href="https://github.com/hdog27/airgeddon-evil-twin-captive-portal" target="_blank" rel="noopener" class="repo-embed-link">View on GitHub &rarr;</a>
      </div>
      <div class="repo-embed-body"><p class="repo-embed-loading">Loading README&hellip;</p></div>
    </div>
  </div>
  <div class="project-item">
    <h3>SIEM Build &mdash; Splunk</h3>
    <p>Write-up coming soon.</p>
  </div>
  <div class="project-item">
    <h3>VLAN Design</h3>
    <p>Write-up coming soon.</p>
  </div>
  <div class="project-item">
    <h3>Cloudflare Tunnel Setup</h3>
    <p>Write-up coming soon.</p>
  </div>
  <div class="project-item">
    <h3>Teaching Demos &amp; Red-Team Homelab Work</h3>
    <p>Write-up coming soon.</p>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
