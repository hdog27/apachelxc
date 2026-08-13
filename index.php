<?php
// ==========================================================================
// index.php - Cyber Lab (the site's default page). Design adopted from
// Morgan's fork, rebuilt around the LIVE PHP telemetry from metadata.php.
// Every visitor value below is echoed from PHP, never hard-coded.
// ==========================================================================
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Cyber Lab — hmax.space';
$page_description = 'A live web-server metadata security lab: see the IP, geolocation, ISP, VPN/proxy status and device fingerprint your browser reveals on every request.';
$body_class       = 'cyberlab';
$page_css         = 'cyberlab.css';
$page_js          = ['rtc.js'];

require __DIR__ . '/includes/header.php';
?>

<div class="card">

  <h1>Web Server Metadata Security Lab</h1>

  <img class="banner-photo" src="/images/cyber-banner.gif?v=2" alt="Animated cyberspace banner">

  <p class="subtext">Apache server environment built for generating, collecting, and analyzing web access logs for cybersecurity analysis</p>

  <span class="ip-highlight"><?= htmlspecialchars($ip) ?></span>

  <p class="info-row">📍 Location: <strong><?= htmlspecialchars($city) ?>, <?= htmlspecialchars($country) ?></strong></p>
  <p class="info-row">🌐 ISP: <strong><?= htmlspecialchars($isp) ?></strong></p>
  <span class="vpn-badge <?= (($data->proxy ?? false) || ($data->hosting ?? false)) ? 'vpn-yes' : 'vpn-no' ?>">
    <?= htmlspecialchars($vpn) ?>
  </span>

  <hr class="divider">

  <p class="visit-counter">👁 This page has been visited <strong><?= number_format($visit_count) ?></strong> times</p>

  <hr class="divider">

  <p>This request also includes this automatically collected client-side metadata:</p>
  <div class="device-box" id="device-box"><?= $device ?><br><span id="rtc-info">Gathering WebRTC / hardware fingerprint...</span></div>

  <hr class="divider">

  <p>Any website you visit can see your IP address, estimate your location, and read your device info. This page logged all of it the moment you loaded it.</p>
  <p>As another example, this link appears to go to Instagram, but it actually takes you to Google:<br>
  <a href="https://google.com">Instagram</a><br>
  <em>Always hover over links first and check where they actually lead before clicking.</em></p>

  <div class="gallery-grid gallery-grid--single">
    <a href="https://www.staysafeonline.org/resources/online-safety-and-privacy" target="_blank" rel="noopener">
      <img src="/images/cyber-gallery-2.jpg" alt="Learn about cyber safety">
    </a>
  </div>

  <div class="threat-map">
    <iframe src="https://cybermap.kaspersky.com/en/widget/dynamic/dark" title="Kaspersky Cyberthreat Live Map" loading="lazy"></iframe>
  </div>

  <hr class="divider">

  <div class="social-links">
    <a href="https://github.com/hdog27" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      GitHub
    </a>
    <a href="https://www.linkedin.com/in/harrison-smith1234/" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      LinkedIn
    </a>
  </div>
  <p class="footer">Built by Harrison Smith, <a href="https://github.com/1Fragz1" target="_blank" rel="noopener">Zachary Lavornia</a> and <a href="https://www.linkedin.com/in/morgan-stone-90b514419/" target="_blank" rel="noopener">Morgan Stone</a></p>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
