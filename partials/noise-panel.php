<?php
declare(strict_types=1);

// HTMX fragment endpoint for the live Internet-noise panel.
// Deliberately does NOT include metadata.php, so polling this fragment never
// increments visitor counters or writes visitor metadata.

require_once __DIR__ . '/../includes/noise.php';

header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex, nofollow');

$noise = hmax_noise_stats();
?>
<div class="panel-heading-row">
  <div>
    <p class="panel-label">LIVE INTERNET NOISE</p>
    <h2>Traffic hitting hmax.space · last 24 hours.</h2>
  </div>
  <span class="live-dot">24H</span>
</div>

<?php if ($noise['available']): ?>
<div class="noise-stats">
  <div><strong><?= number_format($noise['requests']) ?></strong><span>all requests</span></div>
  <div><strong><?= number_format($noise['suspected_scanners']) ?></strong><span>suspected scanners</span></div>
  <div><strong><?= number_format($noise['networks']) ?></strong><span>scanner networks</span></div>
</div>

<h3 class="mini-heading">Common probes</h3>
<div class="probe-list">
  <?php if (!empty($noise['top_probes'])): ?>
    <?php $maxProbe = max(array_column($noise['top_probes'], 'count')); ?>
    <?php foreach ($noise['top_probes'] as $probe): ?>
    <div class="probe-row">
      <code><?= htmlspecialchars($probe['path']) ?></code>
      <span class="probe-bar"><i style="width:<?= max(8, round(($probe['count'] / $maxProbe) * 100)) ?>%"></i></span>
      <strong><?= number_format($probe['count']) ?></strong>
    </div>
    <?php endforeach; ?>
  <?php else: ?>
    <p class="empty-state">No matching high-signal probes in the current 24-hour window.</p>
  <?php endif; ?>
</div>

<?php if (!empty($noise['taxonomy'])): ?>
<h3 class="mini-heading taxonomy-title">Scanner taxonomy</h3>
<div class="taxonomy-grid">
  <?php foreach ($noise['taxonomy'] as $type => $count): ?>
    <div><span><?= htmlspecialchars($type) ?></span><strong><?= number_format($count) ?></strong></div>
  <?php endforeach; ?>
</div>
<?php endif; ?>

<?php if ($noise['latest']): ?>
  <div class="latest-probe-box">
    <span>Latest suspicious request</span>
    <strong><?= number_format($noise['latest']['age_seconds']) ?> sec ago · <?= htmlspecialchars($noise['latest']['country']) ?></strong>
    <code><?= htmlspecialchars($noise['latest']['path']) ?></code>
    <small><?= htmlspecialchars($noise['latest']['type']) ?></small>
  </div>
<?php endif; ?>

<details class="cyber-details noise-explain">
  <summary>What are these?</summary>
  <p>Public servers are continuously probed by automated scanners searching for exposed files, vulnerable applications and misconfigured services. These are real requests reaching this server; the labels are heuristic classifications based on the requested path.</p>
</details>
<?php else: ?>
  <p class="empty-state">Live parser is ready, but the aggregate telemetry cache is currently unavailable.</p>
<?php endif; ?>

<p class="privacy-note">No visitor IP addresses are displayed here. Raw IPs are only hashed in-memory for aggregate counting.</p>
