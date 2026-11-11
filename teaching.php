<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'teaching';
$page_title       = 'Teaching | hmax.space';
$page_description = 'Cyber-range engineering and hands-on instruction: isolated attack environments, centralized telemetry, and student-led investigations.';
$page_css         = 'content-wide.css';
$body_class       = 'wide-content-page';
$photos           = glob(__DIR__ . '/images/teaching*.{jpg,jpeg,png,webp}', GLOB_BRACE);
sort($photos);
$hero = null; $rest = [];
foreach ($photos as $ph) {
    if ($hero === null && stripos(basename($ph), 'teaching3') === 0) { $hero = $ph; }
    else { $rest[] = $ph; }
}
if ($hero === null && $rest) { $hero = array_shift($rest); }
$og_image         = 'https://hmax.space/images/og-teaching.jpg';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h1>Teaching</h1>
  <p class="subtext">Cyber-range engineering. Live telemetry. Hands-on investigation.</p>

<?php if ($hero): ?>
  <img class="teach-hero" src="/images/<?= rawurlencode(basename($hero)) ?>?v=<?= @filemtime($hero) ?>" alt="Teaching session in the homelab" loading="lazy">
<?php endif; ?>

  <p>I designed and operated an isolated cyber range at Rhode Island College, made its security telemetry work, and taught students to investigate their own attacks.</p>

  <ul class="safe-list">
    <li><strong>Built the environment:</strong> Combined Kali, Metasploitable 2, DVWA, and OWASP Juice Shop behind OPNsense firewall segmentation on my own hardware.</li>
    <li><strong>Engineered detection:</strong> Resolved Linux service, syslog, routing, and NAT issues; built custom Splunk dashboards and automated searches, with CrowdSec blocking attacking hosts.</li>
    <li><strong>Led the investigation:</strong> Guided students from authorized attacks to finding and correlating their activity in Splunk, connecting attacker actions to defender evidence.</li>
  </ul>

  <h2>Web development side</h2>
  <p>Students interested in web development also contributed to this site’s design and layout using GitHub, a VNC editor, and StackBlitz.</p>

<?php if ($rest): ?>
  <div class="teach-gallery">
<?php foreach ($rest as $ph): ?>
    <img src="/images/<?= rawurlencode(basename($ph)) ?>?v=<?= @filemtime($ph) ?>" alt="Teaching session in the homelab" loading="lazy">
<?php endforeach; ?>
  </div>
<?php endif; ?>

  <hr class="divider">
  <p class="subtext">Attack exercises ran in an isolated lab segment on hardware I own.</p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
