<?php
// ==========================================================================
// projects.php - kept as-is from the original site (neither fork improved it).
// The GitHub README embed is driven by main.js (.repo-embed loader).
// ==========================================================================
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Projects | hmax.space';
$page_description = 'Homelab and security projects: Apache visitor logging on Proxmox, a segmented Protectli firewall lab, an Airgeddon evil twin captive portal and an ESP32 HyperHDR LED controller.';

require __DIR__ . '/includes/header.php';
?>

<div class="card">
  <h1>Projects</h1>
  <div class="project-item">
    <h3>Evil Twin Captive Portal | Airgeddon</h3>
    <p>Red team homelab build pairing Airgeddon with a custom captive portal to demonstrate evil twin WiFi attacks. Put together for teaching and demos.</p>
    <div class="repo-embed" data-user="hdog27" data-repo="airgeddon-evil-twin-captive-portal">
      <div class="repo-embed-header">
        <span class="repo-embed-name">hdog27/airgeddon-evil-twin-captive-portal</span>
        <a href="https://github.com/hdog27/airgeddon-evil-twin-captive-portal" target="_blank" rel="noopener" class="repo-embed-link">View on GitHub &rarr;</a>
      </div>
      <div class="repo-embed-body"><p class="repo-embed-loading">Loading README&hellip;</p></div>
    </div>
  </div>
  <div class="project-item">
    <h3>HomeLab Network Security | Protectli V1410</h3>
    <p>Segmented home lab on a Protectli V1410 running Proxmox, pfSense and WireGuard. Covers the install, the network layout and routing remote access back into the lab.</p>
    <div class="repo-embed" data-user="hdog27" data-repo="Protectli-v1410-HomeLab-Net-Security">
      <div class="repo-embed-header">
        <span class="repo-embed-name">hdog27/Protectli-v1410-HomeLab-Net-Security</span>
        <a href="https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security" target="_blank" rel="noopener" class="repo-embed-link">View on GitHub &rarr;</a>
      </div>
      <div class="repo-embed-body"><p class="repo-embed-loading">Loading README&hellip;</p></div>
    </div>
  </div>
  <div class="project-item">
    <h3>Apache IP Logging | Proxmox</h3>
    <p>Apache and PHP in an Ubuntu LXC on Proxmox, logging visitor IP addresses and rough geolocation behind a Cloudflare Tunnel. The Cyber Lab page on this site runs on it.</p>
    <div class="repo-embed" data-user="hdog27" data-repo="Apache-IP-Logging-HomeLab-On-Proxmox">
      <div class="repo-embed-header">
        <span class="repo-embed-name">hdog27/Apache-IP-Logging-HomeLab-On-Proxmox</span>
        <a href="https://github.com/hdog27/Apache-IP-Logging-HomeLab-On-Proxmox" target="_blank" rel="noopener" class="repo-embed-link">View on GitHub &rarr;</a>
      </div>
      <div class="repo-embed-body"><p class="repo-embed-loading">Loading README&hellip;</p></div>
    </div>
  </div>
  <div class="project-item">
    <h3>ESP32 HyperHDR LED Controller</h3>
    <p>Ambient lighting controller built on an ESP32, driving an addressable LED strip from HyperHDR over the network. Covers the wiring, flashing the firmware and pinning it to a static IP.</p>
    <div class="repo-embed" data-user="hdog27" data-repo="ESP32-HyperHDR-LED-Controller">
      <div class="repo-embed-header">
        <span class="repo-embed-name">hdog27/ESP32-HyperHDR-LED-Controller</span>
        <a href="https://github.com/hdog27/ESP32-HyperHDR-LED-Controller" target="_blank" rel="noopener" class="repo-embed-link">View on GitHub &rarr;</a>
      </div>
      <div class="repo-embed-body"><p class="repo-embed-loading">Loading README&hellip;</p></div>
    </div>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
