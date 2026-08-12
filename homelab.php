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
  <p class="homelab-intro">This is my own build, shaped by trial and error, not a shopping list to clone. Below is a quick tour of the hardware; the real story is in the services running on top of it.</p>

  <div class="rack-hotspot-wrap">
    <img src="/images/rack.jpg" alt="Homelab rack" class="rack-photo">
    <div class="hotspot" style="top:12%;left:50%;" tabindex="0"><span class="hotspot-dot">1</span><div class="hotspot-tooltip"><strong>Display</strong>Repurposed monitor for at-a-glance dashboards.</div></div>
    <div class="hotspot" style="top:28%;left:30%;" tabindex="0"><span class="hotspot-dot">2</span><div class="hotspot-tooltip"><strong>Managed PoE Switch</strong>VLAN segmentation and PoE for access points/cameras.</div></div>
    <div class="hotspot" style="top:40%;left:65%;" tabindex="0"><span class="hotspot-dot">3</span><div class="hotspot-tooltip"><strong>Spotify Car Thing</strong>Jailbroken, running Nocturne as a custom media controller.</div></div>
    <div class="hotspot" style="top:52%;left:35%;" tabindex="0"><span class="hotspot-dot">4</span><div class="hotspot-tooltip"><strong>Proxmox Mini PC</strong>Main virtualization host for the lab.</div></div>
    <div class="hotspot" style="top:64%;left:60%;" tabindex="0"><span class="hotspot-dot">5</span><div class="hotspot-tooltip"><strong>Hue Hub</strong>Smart lighting tied into the automation stack.</div></div>
    <div class="hotspot" style="top:76%;left:30%;" tabindex="0"><span class="hotspot-dot">6</span><div class="hotspot-tooltip"><strong>Protectli VP1410</strong>Purpose-built appliance running the firewall/router stack.</div></div>
    <div class="hotspot" style="top:86%;left:65%;" tabindex="0"><span class="hotspot-dot">7</span><div class="hotspot-tooltip"><strong>NAS</strong>Central storage for backups, media, and lab data.</div></div>
    <div class="hotspot" style="top:95%;left:45%;" tabindex="0"><span class="hotspot-dot">8</span><div class="hotspot-tooltip"><strong>PDU</strong>Remote power control for the rack.</div></div>
  </div>

  <h3>Services</h3>
  <div class="services-list">
    <div class="service-item">
      <h4>Virtualization Platform &mdash; Proxmox VE</h4>
      <p>Proxmox VE is the hypervisor underlying the entire lab, hosting every VM and container listed here. It's also where most of the day-to-day admin practice happens: snapshots, resource tuning, and template-based provisioning.</p>
    </div>
    <div class="service-item">
      <h4>Firewall &amp; Routing &mdash; OPNsense</h4>
      <p>OPNsense runs on the Protectli appliance and handles inter-VLAN routing and firewall policy for the lab. It's the enforcement point that keeps management, IoT, and training-range traffic segmented from each other.</p>
    </div>
    <div class="service-item">
      <h4>Security Monitoring &amp; SIEM &mdash; Splunk Enterprise</h4>
      <p>A Splunk Enterprise instance ingests logs from across the lab for correlation, alerting, and hands-on detection engineering practice. It's the primary tool used to build and test custom search queries and dashboards.</p>
    </div>
    <div class="service-item">
      <h4>Log Aggregation &mdash; Loki</h4>
      <p>Loki collects and indexes logs from services and containers that don't feed into Splunk, giving a lighter-weight option for quick troubleshooting. It's mainly used to practice log-based debugging without the overhead of a full SIEM pipeline.</p>
    </div>
    <div class="service-item">
      <h4>Network Management &mdash; UniFi Controller</h4>
      <p>A UniFi controller manages switching, access points, and VLAN segmentation, keeping management, IoT, and lab traffic isolated from one another. It's also where most network-design experimentation happens before rules get pushed to the firewall.</p>
    </div>
    <div class="service-item">
      <h4>Remote Access &mdash; Tailscale</h4>
      <p>Tailscale provides a zero-config mesh VPN for securely reaching lab services from anywhere without exposing ports to the public internet. Every device authenticates individually, so there's no single exposed entry point.</p>
    </div>
    <div class="service-item">
      <h4>Security Training Range</h4>
      <p>Deliberately vulnerable targets &mdash; OWASP Juice Shop, Metasploitable2, and DVWA &mdash; run in an isolated segment for practicing red-team techniques and building teaching demos. Keeping them fully separated from production services is itself part of the network-segmentation exercise.</p>
    </div>
    <div class="service-item">
      <h4>Self-Hosted Cloud Storage &mdash; Nextcloud</h4>
      <p>Nextcloud provides self-hosted file sync and storage as a hands-on alternative to commercial cloud services. It also doubles as a testbed for practicing backup and access-control workflows.</p>
    </div>
    <div class="service-item">
      <h4>Web &amp; Application Hosting</h4>
      <p>An Apache/PHP container hosts this site, including the Cyber Lab metadata logger showcased under that tab.</p>
    </div>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
