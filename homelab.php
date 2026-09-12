<?php
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Homelab | hmax.space';
$page_description = 'A tour of the homelab: Proxmox virtualization, OPNsense firewalling, Splunk SIEM, VLAN segmentation and the services running on top.';
$page_css         = 'homelab.css';
$body_class       = 'homelab-page';
$og_image         = 'https://hmax.space/images/og-homelab.jpg';
require __DIR__ . '/includes/header.php';
?>

<main class="card homelab-card">
  <header class="homelab-hero">
    <div>
      <p class="eyebrow">12U HOMELAB</p>
      <h1>Homelab</h1>
      <p class="homelab-intro">Homelabbing is a personal journey. You should be the one to build it, not copy it.</p>
    </div>
    <ul class="homelab-facts" aria-label="Homelab quick facts">
      <li>12U half rack</li>
      <li>Click the numbered points for a hardware breakdown</li>
      <li>Tap a service to expand the details</li>
    </ul>
  </header>

  <a class="network-explorer-link" href="/network">
    <span>
      <span class="eyebrow">INTERACTIVE ARCHITECTURE</span>
      <strong>Explore My Network</strong>
      <small>Follow traffic from Cloudflare and OPNsense through trust zones, Proxmox workloads, and security telemetry.</small>
    </span>
    <span class="network-explorer-flow" aria-hidden="true">EDGE → POLICY → SEGMENTATION → EVIDENCE</span>
    <span class="network-explorer-arrow" aria-hidden="true">→</span>
  </a>

  <div class="homelab-layout">
    <section class="homelab-rack-column" aria-labelledby="rack-heading">
      <div class="section-heading compact-heading">
        <p class="eyebrow">HARDWARE</p>
        <h2 id="rack-heading">The rack</h2>
      </div>

      <div class="rack-hotspot-wrap">
        <img src="/images/rack.jpg?v=2" alt="Harrison's 12U homelab rack" class="rack-photo" loading="eager" width="820" height="1600">
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
    </section>

    <section class="homelab-services-column" aria-labelledby="services-heading">
      <div class="section-heading compact-heading services-heading">
        <p class="eyebrow">SOFTWARE + INFRASTRUCTURE</p>
        <h2 id="services-heading">Services</h2>
        <p>What the rack actually does. Open any service for the implementation details.</p>
      </div>

      <div class="services-list">
        <details class="service-item">
          <summary>Virtualization Platform <span>Proxmox VE</span></summary>
          <p>Two Proxmox nodes run everything here as VMs and containers, split so security services and general compute sit on separate hardware. Most builds start from a community helper script.</p>
        </details>
        <details class="service-item">
          <summary>Firewall &amp; Routing <span>OPNsense</span></summary>
          <p>Runs on the Protectli and does most of the heavy lifting. This is the box that got me into all of this.</p>
          <ul class="svc-parts">
            <li><b>VLAN routing &amp; firewall policy</b>Decides what is allowed to talk to what.</li>
            <li><b>Suricata lab telemetry</b>The attack-range project demonstrates detection and phone alerts. The OPNsense built-in IDS/IPS was disabled in the September 8, 2026 inventory; this page does not verify a live sensor location, capture interface or inline blocking mode. See the <a href="/projects">detection project</a> for the demonstrated workflow.</li>
            <li><b>CrowdSec</b>Blocks IPs flagged by a shared community threat feed.</li>
            <li><b>Unbound DNS</b>Handles local DNS and privacy controls.</li>
            <li><b>Threat feeds</b>Drops traffic to and from known-bad address lists.</li>
            <li><b>DHCP</b>Hands out IP addresses to devices on each network.</li>
            <li><b>WireGuard</b>Encrypted tunnels for privacy and remote access.</li>
          </ul>
        </details>
        <details class="service-item">
          <summary>Security Monitoring &amp; SIEM <span>Splunk Enterprise</span></summary>
          <p>Ingests logs from across the lab. This is where I build correlation searches and alerts, mostly around failed authentication and anything hitting the origin directly.</p>
        </details>
        <details class="service-item">
          <summary>Local AI <span>Ollama + Hermes</span></summary>
          <p>Ollama runs qwen3:14b locally on my gaming PC using the RTX 5070 Ti for inference. Hermes runs as a container on Proxmox and connects to it, so the model is reachable from the lab without using a paid API.</p>
        </details>
        <details class="service-item">
          <summary>Log Aggregation <span>Loki</span></summary>
          <p>Catches logs from containers that do not warrant a full Splunk pipeline. Fast to search when something breaks.</p>
        </details>
        <details class="service-item">
          <summary>Wireless <span>UniFi OS</span></summary>
          <p>Manages the access point. VLANs live on the managed switching side; UniFi tags wireless traffic so clients land in the correct isolated segment.</p>
        </details>
        <details class="service-item">
          <summary>Remote Access <span>Tailscale</span></summary>
          <p>Mesh VPN for reaching lab services without opening a public port for each service. Devices authenticate individually.</p>
        </details>
        <details class="service-item">
          <summary>Reverse Proxy <span>Nginx Proxy Manager</span></summary>
          <p>Single internal entry point for web services. Handles certificates and routes hostnames to the right container instead of exposing a port per service.</p>
        </details>
        <details class="service-item">
          <summary>Security Training Range <span>Kali + vulnerable targets</span></summary>
          <p>Deliberately vulnerable targets in a segment with no route to anything else, used for practice and teaching demos. Keeping them walled off is half the exercise.</p>
          <ul class="svc-parts">
            <li><b>OWASP Juice Shop</b>Modern web app with less obvious flaws.</li>
            <li><b>DVWA</b>Classic web vulnerabilities, hands on.</li>
            <li><b>Metasploitable2</b>Purpose-built vulnerable host.</li>
            <li><b>Kali Linux</b>The attack box pointed at the isolated targets.</li>
          </ul>
        </details>
        <details class="service-item">
          <summary>Self-Hosted Cloud <span>Nextcloud</span></summary>
          <p>Self-hosted storage replacing OneDrive for files, documents and other lab data, backed by local storage.</p>
        </details>
        <details class="service-item">
          <summary>Photo Library <span>Immich</span></summary>
          <p>Self-hosted photo and video backup from my phone. Same idea as a cloud photo library, except the library stays in the rack.</p>
        </details>
        <details class="service-item">
          <summary>Home Automation <span>Home Assistant</span></summary>
          <p>Runs automations and ties smart devices together, including the Hue bridge. It also feeds the rack display with system and network status.</p>
        </details>
        <details class="service-item">
          <summary>Game Server Hosting <span>DiscoPanel</span></summary>
          <p>Web panel for running and managing a modded Minecraft server so starting, updating and backing it up is not a terminal job every time.</p>
        </details>
        <details class="service-item">
          <summary>Dashboards <span>Homepage</span></summary>
          <p>One landing page linking the lab services with live status so I am not remembering ports and IPs.</p>
        </details>
        <details class="service-item">
          <summary>Web &amp; Application Hosting <span>Apache + PHP</span></summary>
          <p>An Apache/PHP container on Proxmox serves this site and the Cyber Lab metadata demo.</p>
        </details>
      </div>
    </section>
  </div>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
