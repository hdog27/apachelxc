<?php
require_once __DIR__ . '/includes/metadata.php';
require_once __DIR__ . '/includes/noise.php';
$noise = hmax_noise_stats();

$page_title       = 'Cyber Lab | hmax.space';
$page_description = 'A live web-server metadata security lab: see the IP, geolocation, ISP, VPN/proxy status and device fingerprint your browser reveals on every request.';
$body_class       = 'cyberlab';
$page_css         = 'cyberlab.css';
$page_js          = ['route-globe.js', 'rtc.js', 'flank.js', 'confetti.js', 'rain.js', 'ghosts.js'];
$og_image         = 'https://hmax.space/images/og-cyberlab.jpg';

$routePayload = [
  'lat' => $latitude,
  'lon' => $longitude,
  'city' => $city,
  'region' => $region,
  'country' => $country,
  'isp' => $isp,
  'ipVersion' => strpos($ip, ':') !== false ? 'IPv6' : 'IPv4',
  'cfColo' => $cfColo,
  'cfRay' => $cfRay,
];

require __DIR__ . '/includes/header.php';
?>

<!-- Short first-load visualisation. No GPS is requested; coordinates come from IP geolocation. -->
<div class="route-intro" id="route-intro" aria-hidden="true">
  <canvas id="route-canvas"></canvas>
  <div class="route-intro-copy">
    <span class="route-kicker">REQUEST PATH</span>
    <strong id="route-stage">Resolving network...</strong>
    <small>Approximate IP location · never device GPS</small>
  </div>
</div>
<script type="application/json" id="route-data"><?= json_encode($routePayload, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?></script>

<main class="cyber-shell">
  <section class="identity-hero">
    <div>
      <p class="eyebrow">HARRISON SMITH — CYBERSECURITY &amp; INFRASTRUCTURE</p>
      <p class="identity-copy">I build and secure networks in my 12U homelab. This site is hosted from it.</p>
    </div>
    <div class="identity-actions">
      <a href="/homelab">Explore the homelab →</a>
      <a href="/projects">Projects</a>
    </div>
  </section>

  <section class="lab-grid">
    <article class="panel lab-intro-panel">
      <p class="panel-label">LIVE DEMO</p>
      <h1>Metadata Security Lab</h1>

      <div class="banner-row">
        <div class="banner-flank" id="flank-l"></div>
        <img class="banner-photo" src="/images/cyber-banner.gif?v=2" alt="Animated cyberspace banner" loading="lazy" width="400" height="400">
        <div class="banner-flank" id="flank-r"></div>
      </div>

      <p class="subtext">Apache environment logging, parsing and indexing live web access requests.</p>
      <p class="lab-explain">No permission prompt was needed for the network information beside this panel. It arrived with your request or was inferred from your IP and browser.</p>
    </article>

    <article class="panel connection-panel">
      <div class="panel-heading-row">
        <p class="panel-label">YOUR CONNECTION</p>
        <span class="live-dot">LIVE</span>
      </div>

      <span class="ip-highlight"><?= htmlspecialchars($ip) ?></span>

      <dl class="connection-list">
        <div><dt>Approx. location</dt><dd><?= htmlspecialchars($city) ?><?= $region !== 'Unknown' ? ', ' . htmlspecialchars($region) : '' ?>, <?= htmlspecialchars($country) ?></dd></div>
        <div><dt>Network</dt><dd><?= htmlspecialchars($isp) ?></dd></div>
        <div><dt>IP protocol</dt><dd><?= strpos($ip, ':') !== false ? 'IPv6' : 'IPv4' ?></dd></div>
        <?php if ($cfColo): ?><div><dt>Cloudflare edge code</dt><dd><?= htmlspecialchars($cfColo) ?></dd></div><?php endif; ?>
      </dl>

      <span class="vpn-badge <?= $vpnDetected ? 'vpn-yes' : 'vpn-no' ?>" data-vpn="<?= $vpnDetected ? 1 : 0 ?>">
        <?= htmlspecialchars($vpn) ?>
      </span>
      <?php if (!empty($vpnReason)): ?><p class="vpn-reason"><?= htmlspecialchars($vpnReason) ?></p><?php endif; ?>

      <p class="location-note">IP geolocation is approximate, not GPS. VPNs, mobile networks and ISP routing can move this location far from the device.</p>
    </article>
  </section>

  <section class="panel route-panel">
    <div class="section-copy">
      <p class="panel-label">CONNECTION PATH</p>
      <h2>From my rack, through Cloudflare, to your network.</h2>
      <p>The opening animation visualizes the architecture serving this request. The homelab location is intentionally generalized, and the visitor point comes from IP geolocation.</p>
    </div>
    <div class="route-summary" aria-label="Connection path summary">
      <div class="route-node"><span class="node-dot home"></span><strong>HOMELAB</strong><small>New England · location hidden</small></div>
      <span class="route-line"></span>
      <div class="route-node"><span class="node-dot cloud"></span><strong>CLOUDFLARE</strong><small><?= $cfColo ? 'Edge code ' . htmlspecialchars($cfColo) : 'Tunnel + edge network' ?></small></div>
      <span class="route-line"></span>
      <div class="route-node"><span class="node-dot visitor"></span><strong>YOUR NETWORK</strong><small><?= htmlspecialchars($city) ?>, <?= htmlspecialchars($country) ?></small></div>
    </div>
    <?php if ($cfRay): ?><p class="ray-id">Request correlation ID: <code><?= htmlspecialchars($cfRay) ?></code></p><?php endif; ?>
  </section>

  <section class="panel fingerprint-panel">
    <div class="section-copy compact">
      <p class="panel-label">BROWSER EXPOSURE</p>
      <h2>What your browser reports without a GPS prompt.</h2>
    </div>
    <div class="device-box" id="device-box"><?= $device ?><br><span id="rtc-info">Gathering WebRTC / hardware fingerprint...</span></div>
    <p class="privacy-note">Some fields may be reduced, randomized or hidden by your browser. That is a privacy feature, not an error.</p>
  </section>

  <section class="dashboard-grid">
    <article class="panel noise-panel">
      <div class="panel-heading-row">
        <div>
          <p class="panel-label">LIVE INTERNET NOISE</p>
          <h2>What the public internet is throwing at hmax.space.</h2>
        </div>
        <span class="live-dot">24H</span>
      </div>

      <?php if ($noise['available']): ?>
      <div class="noise-stats">
        <div><strong><?= number_format($noise['requests']) ?></strong><span>requests</span></div>
        <div><strong><?= number_format($noise['suspected_scanners']) ?></strong><span>suspected scanners</span></div>
        <div><strong><?= number_format($noise['networks']) ?></strong><span>source networks</span></div>
      </div>
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
      <?php if ($noise['latest']): ?>
        <p class="latest-probe">Latest classified probe: <code><?= htmlspecialchars($noise['latest']['path']) ?></code> · <?= htmlspecialchars($noise['latest']['type']) ?></p>
      <?php endif; ?>
      <?php else: ?>
        <p class="empty-state">Live parser is ready, but the Apache access log is not readable by PHP yet. The page fails closed instead of exposing raw log data.</p>
      <?php endif; ?>

      <p class="privacy-note">Raw visitor IP addresses are never rendered here. “Scanner” is a heuristic based on suspicious request paths, not a claim about a person.</p>
    </article>

    <article class="panel project-panel">
      <p class="panel-label">FEATURED BUILD</p>
      <img src="/images/rack.jpg" alt="Harrison's 12U cybersecurity homelab rack" loading="lazy">
      <h2>Detection → phone alert</h2>
      <p>Suricata events from the homelab are filtered and pushed to my phone so security telemetry becomes something I can actually react to.</p>
      <div class="project-links">
        <a href="https://github.com/hdog27/homelab-IDS-alerts" target="_blank" rel="noopener">View the code ↗</a>
        <a href="/homelab">See the infrastructure →</a>
      </div>
    </article>
  </section>

  <section class="panel currently-panel">
    <p class="panel-label">CURRENTLY BUILDING</p>
    <div class="build-chips">
      <span>OPNsense VPN failover</span>
      <span>AWS networking &amp; architecture</span>
      <span>Home Assistant rack UI</span>
      <span>Security telemetry</span>
    </div>
  </section>

  <section class="panel education-panel">
    <p>Every site you load receives some information about your connection. This one makes that normally invisible exchange visible.</p>
    <p>Links can lie too. Does this take you to Instagram?<br><a href="https://google.com">Instagram</a><br><em>Hover before you click.</em></p>

    <div class="media-row">
      <div class="threat-map">
        <iframe src="https://cybermap.kaspersky.com/en/widget/dynamic/dark" title="Kaspersky Cyberthreat Live Map" loading="lazy"></iframe>
      </div>
      <div class="gallery-grid gallery-grid--single">
        <a href="https://www.staysafeonline.org/resources/online-safety-and-privacy" target="_blank" rel="noopener">
          <img src="/images/cyber-gallery-2.jpg" alt="Learn about cyber safety" loading="lazy" width="1089" height="1120">
        </a>
      </div>
    </div>

    <p class="visit-counter">This page has been loaded <strong><?= number_format($visit_count) ?></strong> times by <strong><?= number_format($unique_count) ?></strong> unique visitors.</p>

    <div class="social-links">
      <a href="https://github.com/hdog27" target="_blank" rel="noopener">GitHub</a>
      <a href="https://www.linkedin.com/in/harrison-smith1234/" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
