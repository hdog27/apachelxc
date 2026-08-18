<?php
// ==========================================================================
// homelab.php - Homelab page. Layout + Services accent-bar styling adopted
// from Zack's fork (see homelab.css). Hotspot content is Harrison's own
// hardware (kept from the original site), not Zack's generic rack labels.
// ==========================================================================
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Homelab | hmax.space';
$page_description = 'A tour of the homelab: Proxmox virtualization, OPNsense firewalling, Splunk SIEM, VLAN segmentation and the services running on top.';
$page_css         = 'homelab.css';

$og_image         = 'https://hmax.space/images/og-homelab.jpg';
require __DIR__ . '/includes/header.php';
?>

<div class="card homelab-card">
  <h1>Homelab</h1>
  <p class="homelab-intro">Homelabbing is a personal journey. You should be the one to build it, not copy it.</p>
  <ul class="homelab-facts">
    <li>12U half rack</li>
    <li>Click the numbered points for a hardware breakdown</li>
    <li>Tap a service below to expand it</li>
  </ul>

  <div class="rack-hotspot-wrap">
    <img src="/images/rack.jpg?v=2" alt="Homelab rack" class="rack-photo" loading="lazy" width="820" height="1600">
    <div class="hotspot below hs1" tabindex="0"><span class="hotspot-dot">1</span><div class="hotspot-tooltip"><strong>Raspberry Pi 4</strong>Lightweight always-on node serving dashboards: Home Assistant, Splunk, UniFi and btop.</div></div>
    <div class="hotspot below hs2" tabindex="0"><span class="hotspot-dot">2</span><div class="hotspot-tooltip"><strong>Wireless Access Point</strong>Broadcasts the lab's networks, each pinned to its own VLAN.</div></div>
    <div class="hotspot below hs3" tabindex="0"><span class="hotspot-dot">3</span><div class="hotspot-tooltip"><strong>Display</strong>Wall display for network security monitoring and Home Assistant.</div></div>
    <div class="hotspot hs4" tabindex="0"><span class="hotspot-dot">4</span><div class="hotspot-tooltip"><strong>Raspberry Pi 4</strong>Runs Nocturne Connector, driving the Spotify Car Thing.</div></div>
    <div class="hotspot hs5" tabindex="0"><span class="hotspot-dot">5</span><div class="hotspot-tooltip"><strong>Patch Panel</strong>A neat way to organise network cables and keep every run easy to get at.</div></div>
    <div class="hotspot hs6" tabindex="0"><span class="hotspot-dot">6</span><div class="hotspot-tooltip"><strong>PoE Switch</strong>Managed switching with VLAN tagging; powers the access point over its data line.</div></div>
    <div class="hotspot hs7" tabindex="0"><span class="hotspot-dot">7</span><div class="hotspot-tooltip"><strong>Spotify Car Thing</strong>Media controller running Nocturne, open source firmware on salvaged hardware.</div></div>
    <div class="hotspot hs8" tabindex="0"><span class="hotspot-dot">8</span><div class="hotspot-tooltip"><strong>Mini PC | Proxmox</strong>Hosts this website and most of the lab services. Compute and security stay on separate machines.</div></div>
    <div class="hotspot hs9" tabindex="0"><span class="hotspot-dot">9</span><div class="hotspot-tooltip"><strong>Hue Hub</strong>Bridges lighting and other smart devices, tied into Home Assistant automations.</div></div>
    <div class="hotspot hs10" tabindex="0"><span class="hotspot-dot hotspot-star">10</span><div class="hotspot-tooltip"><strong>OPNsense Firewall | Proxmox</strong>The piece that started all of this. VLAN routing, firewall policy, DNS, DHCP and WireGuard.</div></div>
    <div class="hotspot hs11" tabindex="0"><span class="hotspot-dot">11</span><div class="hotspot-tooltip"><strong>NAS Storage</strong>Nextcloud storage replacing OneDrive, photo library, Minecraft server data and backups.</div></div>
    <div class="hotspot hs12" tabindex="0"><span class="hotspot-dot">12</span><div class="hotspot-tooltip"><strong>PDU</strong>Distributes power to the rack with per-outlet switching and monitoring.</div></div>
  </div>

  <h3>Services</h3>
  <div class="services-list">
    <details class="service-item">
      <summary>Virtualization Platform | Proxmox VE</summary>
      <p>Two Proxmox nodes run everything here as VMs and containers, split so security services and general compute sit on separate hardware. Most builds start from a community helper script.</p>
    </details>
    <details class="service-item">
      <summary>Firewall &amp; Routing | OPNsense</summary>
      <p>Runs on the Protectli and does most of the heavy lifting. This is the box that got me into all of this.</p>
      <ul class="svc-parts">
        <li><b>VLAN routing &amp; firewall policy</b> decides what is allowed to talk to what</li>
        <li><b>Suricata</b> IDS/IPS, inspects traffic for known attack patterns</li>
        <li><b>CrowdSec</b> blocks IPs flagged by a shared community threat feed</li>
        <li><b>Unbound DNS</b> resolves DNS locally and blocks ads and trackers at the lookup</li>
        <li><b>Threat feeds</b> drops traffic to and from known-bad address lists</li>
        <li><b>DHCP</b> hands out IP addresses to everything on the network</li>
        <li><b>WireGuard</b> encrypted tunnel back into the lab from outside</li>
      </ul>
    </details>
    <details class="service-item">
      <summary>Security Monitoring &amp; SIEM | Splunk Enterprise</summary>
      <p>Ingests logs from across the lab. Where I build correlation searches and alerts, mostly around failed auth and anything hitting the origin directly.</p>
    </details>
    <details class="service-item">
      <summary>Local AI | Ollama + Hermes</summary>
      <p>Ollama runs qwen3:14b locally on my gaming PC, using the 5070 Ti for inference. Hermes runs as a container on Proxmox and connects to it, so the model is reachable from the lab without anything leaving the network or hitting a paid API.</p>
    </details>
    <details class="service-item">
      <summary>Log Aggregation | Loki</summary>
      <p>Catches logs from containers that do not warrant a full Splunk pipeline. Faster to grep when something breaks at 2am.</p>
    </details>
    <details class="service-item">
      <summary>Wireless | UniFi OS</summary>
      <p>Manages the access point only. VLANs live on the managed switch; UniFi tags wireless traffic onto them so wireless clients land in the right isolated segment.</p>
    </details>
    <details class="service-item">
      <summary>Remote Access | Tailscale</summary>
      <p>Mesh VPN for reaching lab services without opening a single port. Every device authenticates on its own, so there is no shared way in.</p>
    </details>
    <details class="service-item">
      <summary>Reverse Proxy | Nginx Proxy Manager</summary>
      <p>Single entry point in front of the internal web services. Handles certificates and routes hostnames to the right container instead of exposing a port per service.</p>
    </details>
    <details class="service-item">
      <summary>Security Training Range</summary>
      <p>Deliberately vulnerable targets in a segment with no route to anything else, used for practice and teaching demos. Keeping them walled off is half the exercise.</p>
      <ul class="svc-parts">
        <li><b>OWASP Juice Shop</b> modern web app with less obvious flaws</li>
        <li><b>DVWA</b> classic web vulnerabilities, hands on</li>
        <li><b>Metasploitable2</b> purpose-built vulnerable host</li>
        <li><b>Kali Linux</b> the attack box pointed at all of the above</li>
      </ul>
    </details>
    <details class="service-item">
      <summary>Self-Hosted Cloud Storage | Nextcloud</summary>
      <p>Self-hosted storage that replaced OneDrive. Files, documents and the Minecraft server data live here, backed by the NAS.</p>
    </details>
    <details class="service-item">
      <summary>Photo Library | Immich</summary>
      <p>Self-hosted photo and video backup off my phone. Same idea as Google Photos, except the library never leaves the rack.</p>
    </details>
    <details class="service-item">
      <summary>Home Automation | Home Assistant</summary>
      <p>Runs the automations and ties the smart devices together, including the Hue bridge. Also feeds the wall display showing network and system status.</p>
    </details>
    <details class="service-item">
      <summary>Game Server Hosting | DiscoPanel</summary>
      <p>Web panel for running and managing a modded Minecraft server, so starting, updating and backing it up is not a terminal job every time.</p>
    </details>
    <details class="service-item">
      <summary>Dashboards | Homepage</summary>
      <p>One landing page linking every service in the lab with live status, so I am not remembering ports and IPs.</p>
    </details>
    <details class="service-item">
      <summary>Web &amp; Application Hosting</summary>
      <p>An Apache/PHP container on the Proxmox host. Serves this site and the Cyber Lab metadata logger under that tab.</p>
    </details>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
