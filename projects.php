<?php
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Projects | hmax.space';
$page_description = 'Hands-on security, networking and infrastructure projects from my homelab.';
$page_css         = 'projects.css';
$body_class       = 'projects-page';

$featured_video = null;
$media_dir = __DIR__ . '/media';
if (is_dir($media_dir)) {
    $matches = [];
    foreach (['mp4','webm','mov'] as $ext) {
        foreach (glob($media_dir . '/*.' . $ext) ?: [] as $file) $matches[] = $file;
    }
    if ($matches) {
        usort($matches, function ($a, $b) { return @filemtime($b) <=> @filemtime($a); });
        $featured_video = '/media/' . rawurlencode(basename($matches[0]));
    }
}

require __DIR__ . '/includes/header.php';
?>

<main class="projects-shell">
  <header class="projects-hero card">
    <p class="projects-eyebrow">BUILD LOG</p>
    <h1>Projects</h1>
    <p>Hands-on security, networking and infrastructure projects from the lab.</p>
  </header>

<?php if ($featured_video): ?>
  <article class="project-card project-featured card">
    <div class="project-copy">
      <p class="project-kicker">FEATURED BUILD</p>
      <h2>Metasploitable + Suricata + Pushover Alerts</h2>
      <p>An isolated attack-and-detection demo: generate traffic against Metasploitable, let Suricata detect it, then push the alert to my phone through Pushover. It shows the whole path from attack traffic to a defender-visible notification.</p>
      <div class="project-actions">
        <a class="project-btn primary" href="/homelab">See the lab setup →</a>
        <a class="project-btn" href="https://github.com/hdog27/homelab-IDS-alerts" target="_blank" rel="noopener">GitHub →</a>
      </div>
    </div>
    <div class="project-media">
      <video id="featured-build-video" src="<?= htmlspecialchars($featured_video) ?>" autoplay muted loop playsinline controls preload="auto"></video>
    </div>
  </article>
<?php endif; ?>

  <section class="project-grid" aria-label="Project list">
    <article class="project-card card">
      <div class="project-copy">
        <p class="project-kicker">WIRELESS SECURITY</p>
        <h2>Evil Twin Captive Portal | Airgeddon</h2>
        <p>Custom captive portal and Airgeddon workflow for demonstrating evil twin Wi-Fi attacks in an isolated, authorized lab.</p>
        <div class="project-actions"><a class="project-btn" href="https://github.com/hdog27/airgeddon-evil-twin-captive-portal" target="_blank" rel="noopener">GitHub →</a></div>
      </div>
      <div class="repo-embed" data-user="hdog27" data-repo="airgeddon-evil-twin-captive-portal">
        <div class="repo-embed-header"><span class="repo-embed-name">hdog27/airgeddon-evil-twin-captive-portal</span><a href="https://github.com/hdog27/airgeddon-evil-twin-captive-portal" target="_blank" rel="noopener" class="repo-embed-link">Open repo →</a></div>
        <div class="repo-embed-body"><p class="repo-embed-loading">Loading README…</p></div>
      </div>
    </article>

    <article class="project-card card">
      <div class="project-copy">
        <p class="project-kicker">NETWORK SECURITY</p>
        <h2>HomeLab Network Security | Protectli V1410</h2>
        <p>Segmented home lab on a Protectli V1410 with virtualization, firewalling, VPN routing and isolated networks.</p>
        <div class="project-actions"><a class="project-btn" href="https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security" target="_blank" rel="noopener">GitHub →</a></div>
      </div>
      <div class="repo-embed" data-user="hdog27" data-repo="Protectli-v1410-HomeLab-Net-Security">
        <div class="repo-embed-header"><span class="repo-embed-name">hdog27/Protectli-v1410-HomeLab-Net-Security</span><a href="https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security" target="_blank" rel="noopener" class="repo-embed-link">Open repo →</a></div>
        <div class="repo-embed-body"><p class="repo-embed-loading">Loading README…</p></div>
      </div>
    </article>

    <article class="project-card card">
      <div class="project-copy">
        <p class="project-kicker">WEB SECURITY</p>
        <h2>Apache IP Logging | Proxmox</h2>
        <p>Apache and PHP in an Ubuntu LXC on Proxmox, logging request metadata and rough IP geolocation behind Cloudflare. The Cyber Lab runs on this work.</p>
        <div class="project-actions"><a class="project-btn" href="https://github.com/hdog27/Apache-IP-Logging-HomeLab-On-Proxmox" target="_blank" rel="noopener">GitHub →</a></div>
      </div>
      <div class="repo-embed" data-user="hdog27" data-repo="Apache-IP-Logging-HomeLab-On-Proxmox">
        <div class="repo-embed-header"><span class="repo-embed-name">hdog27/Apache-IP-Logging-HomeLab-On-Proxmox</span><a href="https://github.com/hdog27/Apache-IP-Logging-HomeLab-On-Proxmox" target="_blank" rel="noopener" class="repo-embed-link">Open repo →</a></div>
        <div class="repo-embed-body"><p class="repo-embed-loading">Loading README…</p></div>
      </div>
    </article>

    <article class="project-card card">
      <div class="project-copy">
        <p class="project-kicker">EMBEDDED / LIGHTING</p>
        <h2>ESP32 HyperHDR LED Controller</h2>
        <p>ESP32-based ambient lighting controller driving addressable LEDs from HyperHDR over the network.</p>
        <div class="project-actions"><a class="project-btn" href="https://github.com/hdog27/ESP32-HyperHDR-LED-Controller" target="_blank" rel="noopener">GitHub →</a></div>
      </div>
      <div class="repo-embed" data-user="hdog27" data-repo="ESP32-HyperHDR-LED-Controller">
        <div class="repo-embed-header"><span class="repo-embed-name">hdog27/ESP32-HyperHDR-LED-Controller</span><a href="https://github.com/hdog27/ESP32-HyperHDR-LED-Controller" target="_blank" rel="noopener" class="repo-embed-link">Open repo →</a></div>
        <div class="repo-embed-body"><p class="repo-embed-loading">Loading README…</p></div>
      </div>
    </article>
  </section>
</main>

<?php if ($featured_video): ?>
<script>
(function(){
  var video=document.getElementById('featured-build-video');
  if(!video) return;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  function tryPlay(){
    var p=video.play();
    if(p&&p.catch) p.catch(function(){});
  }
  if(video.readyState>=2) tryPlay();
  video.addEventListener('loadeddata',tryPlay,{once:true});
  video.addEventListener('canplay',tryPlay,{once:true});
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) tryPlay(); });
})();
</script>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>
