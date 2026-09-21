<?php
require_once __DIR__ . '/includes/metadata.php';

$page_title       = 'Network Architecture | hmax.space';
$page_description = 'Explore the sanitized network topology, trust zones, security controls and evidence behind the hmax.space homelab.';
$page_css         = 'network.css';
$page_js          = ['network.js'];
$body_class       = 'network-page';
$og_image         = 'https://hmax.space/images/og-homelab.jpg';
require __DIR__ . '/includes/header.php';
?>

<main class="network-shell">
  <header class="network-hero card">
    <div>
      <p class="network-eyebrow">MY NETWORK · SANITIZED VIEW</p>
      <h1>Explore the infrastructure behind hmax.space.</h1>
      <p>Physical hardware, segmented trust zones, self-hosted workloads and the security telemetry tying it together. Select a device or zone to inspect it.</p>
    </div>
    <div class="network-hero-actions">
      <a class="network-link primary" href="#topology">Open topology ↓</a>
      <a class="network-link" href="/homelab">See the physical rack →</a>
    </div>
  </header>

  <section class="architecture-card card" id="topology" aria-labelledby="architecture-heading">
    <div class="architecture-heading">
      <div>
        <p class="network-eyebrow">NETWORK TOPOLOGY</p>
        <h2 id="architecture-heading">Physical hardware + logical segmentation</h2>
      </div>
      <div class="path-controls" aria-label="Highlight a traffic path">
        <span>TRACE</span>
        <button type="button" class="active" data-path-mode="all" aria-pressed="true">ALL</button>
        <button type="button" data-path-mode="public" aria-pressed="false">PUBLIC WEB</button>
        <button type="button" data-path-mode="client" aria-pressed="false">CLIENT EGRESS</button>
        <button type="button" data-path-mode="lab" aria-pressed="false">LAB TELEMETRY</button>
      </div>
    </div>

    <div class="topology-stage" data-topology-stage>
      <div class="topology-grid" aria-hidden="true"></div>
      <span class="topology-layer-label layer-edge" aria-hidden="true">EDGE</span>
      <span class="topology-layer-label layer-access" aria-hidden="true">ACCESS / SWITCHING</span>
      <span class="topology-layer-label layer-zones" aria-hidden="true">TRUST ZONES</span>
      <span class="topology-layer-label layer-workloads" aria-hidden="true">WORKLOADS / VISIBILITY</span>

      <svg class="topology-links" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="line-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur"></feGaussianBlur>
            <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
          </filter>
        </defs>

        <g class="topology-line" data-path-line="public">
          <path d="M500 58 C610 58 690 72 760 100"></path>
          <text x="625" y="47">HTTPS</text>
        </g>
        <g class="topology-line" data-path-line="public">
          <path d="M760 100 C690 128 605 150 500 184"></path>
          <text x="665" y="139">PROXY / TLS</text>
        </g>

        <g class="topology-line" data-path-line="client">
          <path d="M500 58 C410 58 325 72 240 100"></path>
          <text x="325" y="47">ENCRYPTED EGRESS</text>
        </g>
        <g class="topology-line" data-path-line="client">
          <path d="M240 100 C315 132 405 154 500 184"></path>
          <text x="320" y="141">WIREGUARD</text>
        </g>

        <g class="topology-line backbone" data-path-line="public client">
          <path d="M500 204 L500 286"></path>
          <text x="515" y="250">802.1Q TRUNK</text>
        </g>

        <g class="topology-line branch" data-path-line="public">
          <path d="M500 306 C435 330 355 360 260 420"></path>
        </g>
        <g class="topology-line branch" data-path-line="client">
          <path d="M500 306 C530 338 556 372 580 420"></path>
        </g>
        <g class="topology-line branch" data-path-line="client">
          <path d="M500 306 C575 335 650 370 740 420"></path>
        </g>

        <g class="topology-line branch" data-path-line="admin">
          <path d="M500 306 C390 342 245 378 100 420"></path>
        </g>
        <g class="topology-line branch" data-path-line="lab">
          <path d="M500 306 C468 340 446 375 420 420"></path>
        </g>
        <g class="topology-line branch" data-path-line="lab">
          <path d="M500 306 C630 338 760 375 900 420"></path>
        </g>

        <g class="topology-line workload" data-path-line="public">
          <path d="M260 446 L260 542"></path>
          <text x="274" y="505">APACHE</text>
        </g>
        <g class="topology-line workload" data-path-line="public lab">
          <path d="M420 446 L420 542"></path>
          <text x="434" y="505">VMs / LXCs</text>
        </g>
        <g class="topology-line telemetry" data-path-line="public lab">
          <path d="M260 558 C385 590 515 590 650 558"></path>
          <path d="M420 558 C500 582 575 580 650 558"></path>
          <path d="M900 446 C840 505 760 540 650 558"></path>
          <text x="710" y="571">LOGS / EVENTS</text>
        </g>
      </svg>

      <button class="topology-node topology-node--plain" style="--node-x:50%;--node-y:7%" type="button"
        data-network-node="internet" data-path-node="public client" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9M12 3c-3 3-4 6-4 9s1 6 4 9"></path></svg>
        </span>
        <span><strong>Internet</strong><small>WAN</small></span>
      </button>

      <button class="topology-node topology-node--glass" style="--node-x:76%;--node-y:16%" type="button"
        data-network-node="cloudflare" data-path-node="public" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M7 18h11a4 4 0 0 0 .4-8A6 6 0 0 0 7 8.3 4.5 4.5 0 0 0 7 18Z"></path></svg>
        </span>
        <span><strong>Cloudflare</strong><small>DNS · proxy · TLS</small></span>
      </button>

      <button class="topology-node topology-node--glass topology-node--small" style="--node-x:24%;--node-y:16%" type="button"
        data-network-node="mullvad" data-path-node="client" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.6 2.7 8 7 10 4.3-2 7-5.4 7-10V6l-7-3Z"></path><path d="M9 12l2 2 4-5"></path></svg>
        </span>
        <span><strong>Mullvad</strong><small>4× WireGuard</small></span>
      </button>

      <button class="topology-node topology-node--glass topology-node--primary active" style="--node-x:50%;--node-y:31%" type="button"
        data-network-node="opnsense" data-path-node="public client lab" aria-pressed="true">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.6 2.7 8 7 10 4.3-2 7-5.4 7-10V6l-7-3Z"></path><path d="M8 12h8M12 8v8"></path></svg>
        </span>
        <span><strong>OPNsense</strong><small>Protectli V1410 · policy edge</small></span>
      </button>

      <button class="topology-node topology-node--hardware" style="--node-x:50%;--node-y:48%" type="button"
        data-network-node="switch" data-path-node="public client lab" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"></rect><path d="M6 11h2M10 11h2M14 11h2M18 11h1M6 14h12"></path></svg>
        </span>
        <span><strong>TP-Link SG108PE</strong><small>Managed PoE+ switch</small></span>
      </button>

      <button class="topology-node topology-node--hardware topology-node--small" style="--node-x:20%;--node-y:48%" type="button"
        data-network-node="wireless" data-path-node="client" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5 10a10 10 0 0 1 14 0M8 13a6 6 0 0 1 8 0M11 16a2 2 0 0 1 2 0"></path><circle cx="12" cy="19" r="1"></circle></svg>
        </span>
        <span><strong>Ubiquiti U6+</strong><small>Tagged wireless</small></span>
      </button>

      <div class="trust-boundary" aria-hidden="true">
        <span>TRUST BOUNDARY · INTER-VLAN POLICY</span>
      </div>

      <button class="topology-zone" style="--node-x:10%;--node-y:70%" type="button"
        data-network-node="admin" data-path-node="admin" aria-pressed="false">
        <i></i><strong>ADMIN</strong><small>Management plane</small>
      </button>
      <button class="topology-zone" style="--node-x:26%;--node-y:70%" type="button"
        data-network-node="dmz" data-path-node="public" aria-pressed="false">
        <i></i><strong>DMZ</strong><small>Public-facing</small>
      </button>
      <button class="topology-zone" style="--node-x:42%;--node-y:70%" type="button"
        data-network-node="services" data-path-node="lab" aria-pressed="false">
        <i></i><strong>SERVICES</strong><small>Internal apps</small>
      </button>
      <button class="topology-zone" style="--node-x:58%;--node-y:70%" type="button"
        data-network-node="users" data-path-node="client" aria-pressed="false">
        <i></i><strong>USERS</strong><small>Trusted clients</small>
      </button>
      <button class="topology-zone" style="--node-x:74%;--node-y:70%" type="button"
        data-network-node="guests" data-path-node="client" aria-pressed="false">
        <i></i><strong>GUESTS / IoT</strong><small>Restricted</small>
      </button>
      <button class="topology-zone" style="--node-x:90%;--node-y:70%" type="button"
        data-network-node="cyberlab" data-path-node="lab" aria-pressed="false">
        <i></i><strong>CYBERLAB</strong><small>Isolated range</small>
      </button>

      <button class="topology-node topology-node--workload topology-node--small" style="--node-x:26%;--node-y:90%" type="button"
        data-network-node="apache" data-path-node="public" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="6" rx="1"></rect><rect x="4" y="14" width="16" height="6" rx="1"></rect><path d="M7 7h.01M7 17h.01M10 7h7M10 17h7"></path></svg>
        </span>
        <span><strong>Apache</strong><small>hmax.space</small></span>
      </button>

      <button class="topology-node topology-node--workload" style="--node-x:42%;--node-y:90%" type="button"
        data-network-node="proxmox" data-path-node="public lab" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 8h10M7 12h4M7 16h7"></path></svg>
        </span>
        <span><strong>Proxmox VE</strong><small>VMs + LXCs</small></span>
      </button>

      <button class="topology-node topology-node--workload" style="--node-x:65%;--node-y:90%" type="button"
        data-network-node="telemetry" data-path-node="public lab" aria-pressed="false">
        <span class="topology-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 18V9M9 18V5M14 18v-7M19 18V3"></path><path d="M3 20h18"></path></svg>
        </span>
        <span><strong>Splunk + Loki</strong><small>Logs · search · alerts</small></span>
      </button>

      <div class="topology-legend">
        <span><i class="legend-dot hardware"></i>hardware</span>
        <span><i class="legend-dot zone"></i>trust zone</span>
        <span><i class="legend-dot workload"></i>workload / visibility</span>
      </div>
    </div>

    <aside class="network-detail" aria-live="polite" aria-labelledby="detail-title">
      <div class="detail-copy">
        <p class="detail-kicker" id="detail-kicker">SELECTED · POLICY EDGE</p>
        <h2 id="detail-title">OPNsense</h2>
        <p id="detail-summary">The policy center for routing, segmentation, DNS controls and encrypted egress on the Protectli edge.</p>
      </div>
      <ul id="detail-points">
        <li>Routes traffic between sanitized trust zones.</li>
        <li>Applies firewall rules and policy-based routing.</li>
        <li>Maintains four Mullvad WireGuard egress tunnels.</li>
        <li>Provides DNS and DHCP services with Unbound and dnsmasq.</li>
      </ul>
      <div class="detail-evidence">
        <p>Evidence / deeper dives</p>
        <div id="detail-links">
          <a href="https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security" target="_blank" rel="noopener">Firewall architecture ↗</a>
          <a href="/homelab">Physical rack →</a>
        </div>
      </div>
    </aside>

    <p class="architecture-note">Sanitized presentation view — private addressing and management endpoints are intentionally omitted. Traffic-path highlights are logical views, not packet-capture animations.</p>
  </section>

  <section class="proof-section" aria-labelledby="proof-heading">
    <div class="proof-heading">
      <p class="network-eyebrow">IMPLEMENTATION EVIDENCE</p>
      <h2 id="proof-heading">The diagram points to real builds.</h2>
      <p>Each path links back to hardware, configuration, testing or an implementation write-up.</p>
    </div>
    <div class="proof-grid">
      <article class="proof-card card">
        <p class="proof-number">01 · EDGE SECURITY</p>
        <h3>Virtualized OPNsense firewall</h3>
        <p>Protectli hardware, segmented routing, DNS controls, WireGuard egress and operational tradeoffs.</p>
        <a href="https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security" target="_blank" rel="noopener">View architecture project →</a>
      </article>
      <article class="proof-card card">
        <p class="proof-number">02 · DETECTION PIPELINE</p>
        <h3>Attack to mobile alert</h3>
        <p>Authorized test traffic flows through detection, centralized investigation and a defender-visible Pushover alert.</p>
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
    <div>
      <p class="network-eyebrow">PHYSICAL LAYER</p>
      <h2>Want the rack itself?</h2>
      <p>The Homelab page is the detailed tour of the 12U rack, numbered hardware and expandable services.</p>
    </div>
    <a class="network-link primary" href="/homelab">Tour the 12U rack →</a>
  </section>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
