<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'teaching';
$page_title       = 'Teaching | hmax.space';
$page_description = 'Hands-on cybersecurity teaching and mentoring using a live homelab environment.';
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
  <p class="subtext">Hands-on cybersecurity mentoring using the homelab, not slides.</p>

<?php if ($hero): ?>
  <img class="teach-hero" src="/images/<?= rawurlencode(basename($hero)) ?>?v=<?= @filemtime($hero) ?>" alt="Teaching session in the homelab" loading="lazy">
<?php endif; ?>

  <p>I ran hands-on sessions for visiting students using the same lab documented on this site. Rather than talking about attacks in the abstract, they ran them against deliberately vulnerable targets in an isolated segment, then went and found their own traffic in the logs.</p>

  <h2>What they worked with</h2>
  <ul class="safe-list">
    <li><strong>Metasploitable</strong> | a purpose-built vulnerable host to attack.</li>
    <li><strong>DVWA</strong> | web application vulnerabilities, hands on.</li>
    <li><strong>OWASP Juice Shop</strong> | a modern vulnerable app with less obvious flaws.</li>
    <li><strong>Splunk</strong> | finding their own attacks in the logs afterwards.</li>
    <li><strong>OPNsense</strong> | the firewall and segmentation keeping the range isolated.</li>
  </ul>

  <p>The part that landed hardest was the second half: running an attack is one thing, then seeing exactly what it looked like from the defender's side is what makes the lesson stick.</p>

  <h2>Web development side</h2>
  <p>Some students were more interested in the coding work than the security side, so they took on this website instead | working on the design and layout you're looking at now, through the GitHub web editor, a VNC editor and StackBlitz.</p>

<?php if ($rest): ?>
  <div class="teach-gallery">
<?php foreach ($rest as $ph): ?>
    <img src="/images/<?= rawurlencode(basename($ph)) ?>?v=<?= @filemtime($ph) ?>" alt="Teaching session in the homelab" loading="lazy">
<?php endforeach; ?>
  </div>
<?php endif; ?>

  <hr class="divider">
  <p class="subtext">Everything ran on hardware I own, in a segment with no route to anything else.</p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
