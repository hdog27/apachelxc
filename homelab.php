<?php
// ==========================================================================
// homelab.php - Homelab page. Layout + Services accent-bar styling adopted
// from Zack's fork (see homelab.css). Hotspot content is Harrison's own
// hardware (kept from the original site), not Zack's generic rack labels.
// ==========================================================================
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Homelab — hmax.space';
$page_description = 'A tour of the homelab: Proxmox virtualization, OPNsense firewalling, Splunk SIEM, VLAN segmentation and the services running on top.';
$page_css         = 'homelab.css';

require __DIR__ . '/includes/header.php';
?>

<div class="card homelab-card">
  <h2>Homelab</h2>
  <p class="homelab-intro">Homelabbing is a personal journey. You should be the one to build it, not copy it.</p>
  <ul class="homelab-facts">
    <li>12U half-depth rack</li>
    <li>Click the numbered points for a hardware breakdown</li>
    <li>Tap a service below to expand it</li>
  </ul>

  <div class="rack-hotspot-wrap">
    <img src="/images/rack.jpg?v=2" alt="Homelab rack" class="rack-photo">
    <div class="hotspot below" style="top:10%;left:29%;" tabindex="0"><span class="hotspot-dot">1</span><div class="hotspot-tooltip"><strong>Raspberry Pi 4</strong>Small ARM board handling lightweight always-on jobs and monitoring agents.</div></div>
    <div class="hotspot below" style="top:14%;left:50%;" tabindex="0"><span class="hotspot-dot">2</span><div class="hotspot-tooltip"><strong>Wireless Access Point</strong>Broadcasts the lab's networks, each pinned to its own VLAN.</div></div>
    <div class="hotspot below" style="top:28%;left:50%;" tabindex="0"><span class="hotspot-dot">3</span><div class="hotspot-tooltip"><strong>Display</strong>Repurposed monitor showing live dashboards for traffic and system health.</div></div>
    <div class="hotspot" style="top:37%;left:73%;" tabindex="0"><span class="hotspot-dot">4</span><div class="hotspot-tooltip"><strong>Raspberry Pi 4</strong>Second ARM node, used for trying things out before they touch real hardware.</div></div>
    <div class="hotspot" style="top:40%;left:32%;" tabindex="0"><span class="hotspot-dot">5</span><div class="hotspot-tooltip"><strong>Patch Panel</strong>Terminates the structured cabling so drops can be repatched without touching the walls.</div></div>
    <div class="hotspot" style="top:45%;left:50%;" tabindex="0"><span class="hotspot-dot">6</span><div class="hotspot-tooltip"><strong>PoE Switch</strong>Managed switching with VLAN tagging; powers the access point over its data line.</div></div>
    <div class="hotspot" style="top:55%;left:62%;" tabindex="0"><span class="hotspot-dot">7</span><div class="hotspot-tooltip"><strong>Spotify Car Thing</strong>Salvaged dashboard unit running open jailbroken firmware as a desk player.</div></div>
    <div class="hotspot" style="top:64%;left:42%;" tabindex="0"><span class="hotspot-dot">8</span><div class="hotspot-tooltip"><strong>Mini PC</strong>General compute node for virtualization and lab workloads.</div></div>
    <div class="hotspot" style="top:70%;left:58%;" tabindex="0"><span class="hotspot-dot">9</span><div class="hotspot-tooltip"><strong>Hue Hub</strong>Bridges smart lighting onto its own isolated segment.</div></div>
    <div class="hotspot" style="top:79%;left:40%;" tabindex="0"><span class="hotspot-dot">10</span><div class="hotspot-tooltip"><strong>Firewall</strong>Routes between VLANs and enforces the policy that keeps segments separated.</div></div>
    <div class="hotspot" style="top:88%;left:60%;" tabindex="0"><span class="hotspot-dot">11</span><div class="hotspot-tooltip"><strong>NAS Storage</strong>Spinning disks for backups, media, and virtual machine snapshots.</div></div>
    <div class="hotspot" style="top:94%;left:45%;" tabindex="0"><span class="hotspot-dot">12</span><div class="hotspot-tooltip"><strong>PDU</strong>Distributes power to the rack with per-outlet switching and monitoring.</div></div>
  </div>

  <h3>Services</h3>
  <div class="services-list">
    <details class="service-item">
      <summary>Virtualization Platform &mdash; Proxmox VE</summary>
      <p>Proxmox VE is the hypervisor underlying the entire lab, hosting every VM and container listed here. It's also where most of the day-to-day admin practice happens: snapshots, resource tuning, and template-based provisioning.</p>
    </details>
    <details class="service-item">
      <summary>Firewall &amp; Routing &mdash; OPNsense</summary>
      <p>OPNsense runs on the Protectli appliance and handles inter-VLAN routing and firewall policy for the lab. It's the enforcement point that keeps management, IoT, and training-range traffic segmented from each other.</p>
    </details>
    <details class="service-item">
      <summary>Security Monitoring &amp; SIEM &mdash; Splunk Enterprise</summary>
      <p>A Splunk Enterprise instance ingests logs from across the lab for correlation, alerting, and hands-on detection engineering practice. It's the primary tool used to build and test custom search queries and dashboards.</p>
    </details>
    <details class="service-item">
      <summary>Log Aggregation &mdash; Loki</summary>
      <p>Loki collects and indexes logs from services and containers that don't feed into Splunk, giving a lighter-weight option for quick troubleshooting. It's mainly used to practice log-based debugging without the overhead of a full SIEM pipeline.</p>
    </details>
    <details class="service-item">
      <summary>Network Management &mdash; UniFi Controller</summary>
      <p>A UniFi controller manages switching, access points, and VLAN segmentation, keeping management, IoT, and lab traffic isolated from one another. It's also where most network-design experimentation happens before rules get pushed to the firewall.</p>
    </details>
    <details class="service-item">
      <summary>Remote Access &mdash; Tailscale</summary>
      <p>Tailscale provides a zero-config mesh VPN for securely reaching lab services from anywhere without exposing ports to the public internet. Every device authenticates individually, so there's no single exposed entry point.</p>
    </details>
    <details class="service-item">
      <summary>Security Training Range</summary>
      <p>Deliberately vulnerable targets &mdash; OWASP Juice Shop, Metasploitable2, and DVWA &mdash; run in an isolated segment for practicing red-team techniques and building teaching demos. Keeping them fully separated from production services is itself part of the network-segmentation exercise.</p>
    </details>
    <details class="service-item">
      <summary>Self-Hosted Cloud Storage &mdash; Nextcloud</summary>
      <p>Nextcloud provides self-hosted file sync and storage as a hands-on alternative to commercial cloud services. It also doubles as a testbed for practicing backup and access-control workflows.</p>
    </details>
    <details class="service-item">
      <summary>Web &amp; Application Hosting</summary>
      <p>An Apache/PHP container hosts this site, including the Cyber Lab metadata logger showcased under that tab.</p>
    </details>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
