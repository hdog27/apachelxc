<?php
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Network Architecture | hmax.space';
$page_description = 'Explore the sanitized network architecture, trust zones, security controls and evidence behind the hmax.space homelab.';
$page_css         = 'network.css';
$page_js          = ['network.js'];
$body_class       = 'network-page';
$og_image         = 'https://hmax.space/images/og-homelab.jpg';
require __DIR__ . '/includes/header.php';
?>

<main class="network-shell">
  <header class="network-hero card">
    <p class="network-eyebrow">INTERACTIVE ARCHITECTURE</p>
    <h1>Explore My Network</h1>
    <p>An interactive, sanitized look inside the infrastructure and security lab behind hmax.space. Select a component to see why it exists, what it protects, and the work that proves it was built and tested.</p>
    <div class="network-hero-actions">
      <a class="network-link primary" href="#architecture">Explore the architecture ↓</a>
      <a class="network-link" href="/homelab">See the physical rack →</a>
    </div>
  </header>

  <section class="architecture-card card" id="architecture" aria-labelledby="architecture-heading">
    <div class="architecture-heading">
      <div>
        <p class="network-eyebrow">ARCHITECTURE → CONTROL → TEST → EVIDENCE</p>
        <h2 id="architecture-heading">How traffic moves through the lab</h2>
      </div>
      <p>Select any node. The diagram shows trust boundaries and workload groups rather than private addresses or a device-by-device inventory.</p>
    </div>

    <div class="architecture-workspace">
      <div class="architecture-map" aria-label="Interactive network architecture">
        <div class="network-flow">
          <button class="network-node" type="button" data-network-node="internet" aria-pressed="false">
            <span class="node-kicker">ENTRY</span><strong>Internet</strong><small>Public traffic</small>
          </button>
          <span class="flow-arrow" aria-hidden="true">→</span>
          <button class="network-node" type="button" data-network-node="cloudflare" aria-pressed="false">
            <span class="node-kicker">EDGE</span><strong>Cloudflare</strong><small>DNS · proxy · TLS</small>
          </button>
          <span class="flow-arrow" aria-hidden="true">→</span>
          <button class="network-node active" type="button" data-network-node="opnsense" aria-pressed="true">
            <span class="node-kicker">POLICY</span><strong>OPNsense</strong><small>Routing · firewall · VPN</small>
          </button>
          <span class="flow-arrow" aria-hidden="true">→</span>
          <button class="network-node" type="button" data-network-node="zones" aria-pressed="false">
            <span class="node-kicker">SEGMENTATION</span><strong>Trust zones</strong><small>Least-privilege paths</small>
          </button>
          <span class="flow-arrow" aria-hidden="true">→</span>
          <button class="network-node" type="button" data-network-node="proxmox" aria-pressed="false">
            <span class="node-kicker">COMPUTE</span><strong>Proxmox</strong><small>Workload groups</small>
          </button>
          <span class="flow-arrow" aria-hidden="true">→</span>
          <button class="network-node" type="button" data-network-node="telemetry" aria-pressed="false">
            <span class="node-kicker">VISIBILITY</span><strong>Splunk + Loki</strong><small>Logs · search · alerts</small>
          </button>
        </div>

        <div class="zone-cluster" aria-label="Sanitized trust-zone model">
          <p>Explore a trust zone</p>
          <div class="zone-buttons">
            <button type="button" data-network-node="dmz" aria-pressed="false"><strong>DMZ</strong><span>Public-facing paths</span></button>
            <button type="button" data-network-node="services" aria-pressed="false"><strong>Services</strong><span>Internal applications</span></button>
            <button type="button" data-network-node="users" aria-pressed="false"><strong>Users</strong><span>Trusted clients</span></button>
            <button type="button" data-network-node="guests" aria-pressed="false"><strong>Guests / IoT</strong><span>Restricted clients</span></button>
            <button type="button" data-network-node="cyberlab" aria-pressed="false"><strong>CyberLAB</strong><span>Isolated test range</span></button>
          </div>
        </div>

        <p class="architecture-note">Public web traffic and normal client egress are different paths; this view combines them to explain the major controls without exposing the private addressing plan.</p>
      </div>

      <aside class="network-detail" aria-live="polite" aria-labelledby="detail-title">
        <p class="detail-kicker" id="detail-kicker">SELECTED COMPONENT · POLICY</p>
        <h2 id="detail-title">OPNsense</h2>
        <p id="detail-summary">The policy center for routing, segmentation, DNS controls and encrypted egress on the Protectli edge.</p>
        <ul id="detail-points">
          <li>Routes traffic between sanitized trust zones.</li>
          <li>Applies firewall rules and policy-based routing.</li>
          <li>Maintains four Mullvad WireGuard egress tunnels.</li>
          <li>Provides DNS and DHCP services with Unbound and dnsmasq.</li>
        </ul>
        <div class="detail-evidence">
          <p>Evidence and deeper dives</p>
          <div id="detail-links">
            <a href="https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security" target="_blank" rel="noopener">Firewall architecture ↗</a>
            <a href="/homelab">Physical rack context →</a>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <section class="proof-section" aria-labelledby="proof-heading">
    <div class="proof-heading">
      <p class="network-eyebrow">IMPLEMENTATION EVIDENCE</p>
      <h2 id="proof-heading">Not just boxes and arrows</h2>
      <p>Each path leads to a build, test, live demonstration, or implementation write-up.</p>
    </div>
    <div class="proof-grid">
      <article class="proof-card card">
        <p class="proof-number">01 · EDGE SECURITY</p>
        <h3>Virtualized OPNsense firewall</h3>
        <p>Protectli hardware, Proxmox virtualization, segmented routing, DNS controls, WireGuard egress and operational tradeoffs.</p>
        <a href="https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security" target="_blank" rel="noopener">View architecture project →</a>
      </article>
      <article class="proof-card card">
        <p class="proof-number">02 · DETECTION PIPELINE</p>
        <h3>Attack to mobile alert</h3>
        <p>Authorized test traffic flows through Suricata detection, centralized investigation and a defender-visible Pushover alert.</p>
        <a href="https://github.com/hdog27/homelab-IDS-alerts" target="_blank" rel="noopener">View detection case study →</a>
      </article>
      <article class="proof-card card">
        <p class="proof-number">03 · LIVE WEB EDGE</p>
        <h3>Inspect the request path</h3>
        <p>The Cyber Lab shows how a request reaches hmax.space through Cloudflare and what limited metadata the server can observe.</p>
        <a href="/">Open the live Cyber Lab →</a>
      </article>
    </div>
  </section>

  <section class="network-next card">
    <div><p class="network-eyebrow">PHYSICAL LAYER</p><h2>Want the hardware and service inventory?</h2><p>The existing Homelab page remains the detailed tour of the rack, numbered hardware, and expandable services.</p></div>
    <a class="network-link primary" href="/homelab">Tour the 12U rack →</a>
  </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
