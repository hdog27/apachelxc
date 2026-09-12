(function () {
  var root = document.querySelector('.architecture-workspace');
  if (!root) return;

  var components = {
    internet: {
      kicker: 'ENTRY · PUBLIC AND CLIENT TRAFFIC',
      title: 'Internet',
      summary: 'The lab has one physical WAN path through the modem or ONT. Public web requests and client internet traffic diverge after entering the architecture.',
      points: [
        'Public requests for hmax.space first pass through Cloudflare.',
        'Client egress reaches OPNsense before an allowed WAN or Mullvad path.',
        'Four VPN tunnels add encrypted-egress resilience, not a second ISP.'
      ],
      links: [['See the physical rack', '/homelab']]
    },
    cloudflare: {
      kicker: 'EDGE · PUBLIC WEB PATH',
      title: 'Cloudflare',
      summary: 'The public edge in front of hmax.space, providing DNS, proxying and TLS before requests reach the self-hosted Apache application.',
      points: [
        'Keeps the public web path separate from normal client egress.',
        'Forwards permitted web requests toward the origin behind OPNsense.',
        'The live Cyber Lab explains which request metadata reaches the site.'
      ],
      links: [['Open the live Cyber Lab', '/'], ['Review privacy and headers', '/safe']]
    },
    opnsense: {
      kicker: 'SELECTED COMPONENT · POLICY',
      title: 'OPNsense',
      summary: 'The policy center for routing, segmentation, DNS controls and encrypted egress on the Protectli edge.',
      points: [
        'Routes traffic between sanitized trust zones.',
        'Applies firewall rules and policy-based routing.',
        'Maintains four Mullvad WireGuard egress tunnels.',
        'Provides DNS and DHCP services with Unbound and dnsmasq.',
        'Uses CrowdSec and threat feeds as additional defensive inputs.'
      ],
      links: [['Firewall architecture', 'https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security'], ['Physical rack context', '/homelab']]
    },
    zones: {
      kicker: 'SEGMENTATION · TRUST MODEL',
      title: 'Trust zones',
      summary: 'The first-level model groups systems by trust and purpose. OPNsense mediates traffic between zones instead of treating the rack as one flat network.',
      points: [
        'Public-facing paths are separated from internal applications.',
        'Trusted users do not share unrestricted access with guests or IoT devices.',
        'The offensive-security range is isolated from normal services.',
        'Specific VLAN IDs and private addresses are deliberately omitted.'
      ],
      links: [['Explore the homelab', '/homelab'], ['Read the firewall project', 'https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security']]
    },
    proxmox: {
      kicker: 'COMPUTE · WORKLOAD GROUPS',
      title: 'Proxmox',
      summary: 'Two Proxmox systems separate the network edge from general compute. The public view groups workloads by function instead of exposing a full VM and container inventory.',
      points: [
        'Edge security: OPNsense on the Protectli V1410.',
        'Applications: internal web, automation, storage and support services.',
        'Observability: Splunk and Loki pipelines.',
        'Security range: authorized attack and detection workloads.',
        'Configuration and workload backups run weekly.'
      ],
      links: [['Tour the rack', '/homelab'], ['Browse implementation projects', '/projects']]
    },
    telemetry: {
      kicker: 'VISIBILITY · LOGS AND ALERTS',
      title: 'Splunk + Loki',
      summary: 'Two complementary logging paths provide security investigation and practical service troubleshooting without forcing every event into one platform.',
      points: [
        'Splunk supports security searches, authentication investigations and alerting.',
        'Loki collects operational logs from containerized services.',
        'Detection projects connect telemetry to defender-visible Pushover notifications.',
        'Published case studies provide evidence without exposing raw production logs.'
      ],
      links: [['View detection case study', 'https://github.com/hdog27/homelab-IDS-alerts'], ['Browse security projects', '/projects']]
    },
    dmz: {
      kicker: 'TRUST ZONE · PUBLIC-FACING PATHS',
      title: 'DMZ',
      summary: 'Internet-facing application paths are treated differently from internal services and clients, limiting how far an exposed workload can reach.',
      points: [
        'Inbound traffic is limited to explicitly published services.',
        'Cloudflare and the reverse-proxy path reduce direct application exposure.',
        'Management access stays outside the public service path.'
      ],
      links: [['Inspect the live web edge', '/'], ['View Apache project', 'https://github.com/hdog27/Apache-IP-Logging-HomeLab-On-Proxmox']]
    },
    services: {
      kicker: 'TRUST ZONE · INTERNAL APPLICATIONS',
      title: 'Services',
      summary: 'Self-hosted applications are grouped behind internal routing and reverse-proxy controls rather than published individually to the internet.',
      points: [
        'Nginx Proxy Manager provides a shared application entry point.',
        'Storage, automation and dashboards remain internal by default.',
        'Cross-zone access is granted according to service need.'
      ],
      links: [['Explore service details', '/homelab'], ['Browse projects', '/projects']]
    },
    users: {
      kicker: 'TRUST ZONE · TRUSTED CLIENTS',
      title: 'Users',
      summary: 'Trusted client devices receive the access required for normal use without automatically becoming part of the infrastructure-management plane.',
      points: [
        'Client traffic reaches other zones through OPNsense policy.',
        'DNS and internet-egress decisions are applied centrally.',
        'Administrative paths can remain distinct from everyday access.'
      ],
      links: [['Read the network design', 'https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security']]
    },
    guests: {
      kicker: 'TRUST ZONE · RESTRICTED CLIENTS',
      title: 'Guests / IoT',
      summary: 'Lower-trust and transient devices are separated from trusted clients and infrastructure while retaining the limited connectivity they require.',
      points: [
        'No broad access to management or internal application networks.',
        'Internet and selected local services can be permitted explicitly.',
        'Wireless tagging places clients into the appropriate segment.'
      ],
      links: [['See wireless and VLAN context', '/homelab']]
    },
    cyberlab: {
      kicker: 'TRUST ZONE · AUTHORIZED TEST RANGE',
      title: 'CyberLAB',
      summary: 'An isolated environment for authorized offensive testing and defensive validation, built to connect an attack technique to observable evidence.',
      points: [
        'Kali Linux provides the controlled attack workstation.',
        'Metasploitable, Juice Shop and DVWA provide deliberately vulnerable targets.',
        'Suricata captures relevant network telemetry for detection exercises.',
        'Splunk supports investigation and Pushover closes the alerting loop.'
      ],
      links: [['View attack-to-alert case study', 'https://github.com/hdog27/homelab-IDS-alerts'], ['Open the live Cyber Lab', '/']]
    }
  };

  var kicker = document.getElementById('detail-kicker');
  var title = document.getElementById('detail-title');
  var summary = document.getElementById('detail-summary');
  var points = document.getElementById('detail-points');
  var links = document.getElementById('detail-links');
  var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-network-node]'));

  function selectComponent(key, moveFocus) {
    var component = components[key];
    if (!component) return;

    buttons.forEach(function (button) {
      var selected = button.getAttribute('data-network-node') === key;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    kicker.textContent = component.kicker;
    title.textContent = component.title;
    summary.textContent = component.summary;
    points.replaceChildren();
    component.points.forEach(function (point) {
      var item = document.createElement('li');
      item.textContent = point;
      points.appendChild(item);
    });

    links.replaceChildren();
    component.links.forEach(function (linkData) {
      var link = document.createElement('a');
      link.textContent = linkData[0] + (linkData[1].indexOf('http') === 0 ? ' ↗' : ' →');
      link.href = linkData[1];
      if (linkData[1].indexOf('http') === 0) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      links.appendChild(link);
    });

    if (moveFocus && window.matchMedia('(max-width: 1120px)').matches) {
      document.querySelector('.network-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectComponent(button.getAttribute('data-network-node'), true);
    });
  });
})();
