(function () {
  'use strict';

  var root = document.querySelector('.architecture-card');
  if (!root) return;

  var components = {
    internet: {
      kicker: 'ENTRY · WAN',
      title: 'Internet',
      summary: 'One physical WAN connection feeds the lab. Public web requests and normal client egress take different logical paths once they reach the edge.',
      points: [
        'Public hmax.space requests arrive through Cloudflare.',
        'Client traffic is routed by OPNsense before approved WAN or Mullvad egress.',
        'The VPN paths add encrypted-egress resilience; they are not extra ISPs.'
      ],
      links: [['See the physical rack', '/homelab']]
    },
    cloudflare: {
      kicker: 'EDGE · PUBLIC WEB',
      title: 'Cloudflare',
      summary: 'The public edge in front of hmax.space, providing authoritative DNS, proxying and TLS before requests reach the self-hosted site.',
      points: [
        'Separates the public web path from normal client internet access.',
        'Handles public DNS and TLS at the edge.',
        'The Cyber Lab exposes a safe subset of request metadata for teaching.'
      ],
      links: [['Open the Cyber Lab', '/'], ['Privacy / headers', '/safe']]
    },
    mullvad: {
      kicker: 'EGRESS · VPN',
      title: 'Mullvad WireGuard',
      summary: 'Four WireGuard paths provide encrypted outbound routing options for selected networks and policies.',
      points: [
        'Policy-based routing decides which traffic uses a VPN path.',
        'Multiple tunnels allow failover instead of relying on a single endpoint.',
        'Direct DNS and IPv6 escape paths are intentionally restricted.'
      ],
      links: [['Firewall architecture', 'https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security']]
    },
    opnsense: {
      kicker: 'SELECTED · POLICY EDGE',
      title: 'OPNsense',
      summary: 'The policy center for routing, segmentation, DNS controls and encrypted egress on the Protectli edge.',
      points: [
        'Routes traffic between sanitized trust zones.',
        'Applies firewall rules and policy-based routing.',
        'Maintains four Mullvad WireGuard egress tunnels.',
        'Provides DNS and DHCP services with Unbound and dnsmasq.',
        'Feeds operational and security telemetry into the monitoring stack.'
      ],
      links: [['Firewall architecture', 'https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security'], ['Physical rack', '/homelab']]
    },
    switch: {
      kicker: 'PHYSICAL · L2',
      title: 'TP-Link TL-SG108PE',
      summary: 'The managed PoE+ switch carries tagged VLANs between the firewall, access point and rack systems.',
      points: [
        '802.1Q trunks carry multiple trust zones over shared physical links.',
        'Access ports place devices into the correct network where needed.',
        'PoE powers supported infrastructure without separate adapters.'
      ],
      links: [['Rack hardware', '/homelab']]
    },
    wireless: {
      kicker: 'ACCESS · WIRELESS',
      title: 'Ubiquiti U6+',
      summary: 'The wireless access point maps wireless clients into the appropriate segmented network instead of dropping everything onto one LAN.',
      points: [
        'Wireless client classes can land in different VLANs.',
        'Guests and lower-trust devices stay separated from management paths.',
        'The AP is infrastructure; routing and policy remain on OPNsense.'
      ],
      links: [['Wireless / VLAN context', '/homelab']]
    },
    admin: {
      kicker: 'TRUST ZONE · MANAGEMENT',
      title: 'Admin',
      summary: 'A dedicated management plane for infrastructure interfaces and privileged administration.',
      points: [
        'Keeps management access separate from normal client use.',
        'Reduces exposure of firewall, hypervisor and infrastructure interfaces.',
        'Cross-zone access is explicitly allowed rather than assumed.'
      ],
      links: [['Network design', 'https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security']]
    },
    dmz: {
      kicker: 'TRUST ZONE · PUBLIC-FACING',
      title: 'DMZ',
      summary: 'Internet-facing application paths are isolated from internal clients and services so an exposed workload does not inherit broad internal access.',
      points: [
        'Only deliberately published services belong on the public-facing path.',
        'The hmax.space Apache workload is represented here.',
        'Management access stays outside the public service path.'
      ],
      links: [['Inspect the live web edge', '/'], ['Apache project', 'https://github.com/hdog27/Apache-IP-Logging-HomeLab-On-Proxmox']]
    },
    services: {
      kicker: 'TRUST ZONE · INTERNAL APPS',
      title: 'Services',
      summary: 'Self-hosted applications live behind internal routing and reverse-proxy controls instead of being individually exposed to the internet.',
      points: [
        'Hosts internal applications, automation and support services.',
        'Cross-zone access is allowed according to service need.',
        'Reverse proxying provides a shared entry pattern for internal web applications.'
      ],
      links: [['Explore services', '/homelab'], ['Browse projects', '/projects']]
    },
    users: {
      kicker: 'TRUST ZONE · CLIENTS',
      title: 'Users',
      summary: 'Trusted everyday devices get the access required for normal use without automatically joining the infrastructure-management plane.',
      points: [
        'DNS and internet-egress decisions are applied centrally.',
        'Traffic to other zones still crosses OPNsense policy.',
        'Administrative access can remain distinct from ordinary client access.'
      ],
      links: [['Read the network design', 'https://github.com/hdog27/Protectli-v1410-HomeLab-Net-Security']]
    },
    guests: {
      kicker: 'TRUST ZONE · RESTRICTED',
      title: 'Guests / IoT',
      summary: 'Lower-trust and transient devices are separated from trusted clients and infrastructure while retaining the limited connectivity they need.',
      points: [
        'No broad access to management or internal application networks.',
        'Internet and selected local services can be permitted explicitly.',
        'Wireless tagging places clients into the appropriate segment.'
      ],
      links: [['See wireless context', '/homelab']]
    },
    cyberlab: {
      kicker: 'TRUST ZONE · TEST RANGE',
      title: 'CyberLAB',
      summary: 'An isolated environment for authorized offensive testing and defensive validation, designed to connect an attack technique to observable evidence.',
      points: [
        'Kali Linux provides the controlled attack workstation.',
        'Deliberately vulnerable targets provide safe test workloads.',
        'Relevant network and host telemetry feeds investigation workflows.',
        'Isolation keeps test activity separate from normal services.'
      ],
      links: [['Attack-to-alert case study', 'https://github.com/hdog27/homelab-IDS-alerts'], ['Browse security projects', '/projects']]
    },
    apache: {
      kicker: 'WORKLOAD · PUBLIC WEB',
      title: 'Apache / hmax.space',
      summary: 'The portfolio itself is a self-hosted Apache workload inside the rack, with the public edge intentionally separated from the rest of the environment.',
      points: [
        'Hosts the portfolio and Cyber Lab application.',
        'Receives only the request context the public application needs.',
        'Security telemetry can be investigated without exposing raw production logs.'
      ],
      links: [['Open the Cyber Lab', '/'], ['Apache project', 'https://github.com/hdog27/Apache-IP-Logging-HomeLab-On-Proxmox']]
    },
    proxmox: {
      kicker: 'COMPUTE · VIRTUALIZATION',
      title: 'Proxmox VE',
      summary: 'The general compute platform runs the lab workloads as VMs and LXCs while the public topology groups them by function instead of exposing every private endpoint.',
      points: [
        'Runs internal applications, security tooling and lab workloads.',
        'Keeps services portable and easier to isolate or rebuild.',
        'Supports separate workload groups behind the VLAN policy model.'
      ],
      links: [['Tour the rack', '/homelab'], ['Browse implementation projects', '/projects']]
    },
    telemetry: {
      kicker: 'VISIBILITY · SECURITY + OPS',
      title: 'Splunk + Loki',
      summary: 'Complementary logging paths support security investigation, alerting and practical service troubleshooting.',
      points: [
        'Splunk supports security searches and investigation workflows.',
        'Loki collects operational logs from containerized services.',
        'Detection projects connect events to defender-visible notifications.',
        'Published case studies prove the pipeline without exposing privileged logs.'
      ],
      links: [['Detection case study', 'https://github.com/hdog27/homelab-IDS-alerts'], ['Security projects', '/projects']]
    }
  };

  var kicker = document.getElementById('detail-kicker');
  var title = document.getElementById('detail-title');
  var summary = document.getElementById('detail-summary');
  var points = document.getElementById('detail-points');
  var links = document.getElementById('detail-links');
  var stage = root.querySelector('[data-topology-stage]');
  var nodeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-network-node]'));
  var pathButtons = Array.prototype.slice.call(root.querySelectorAll('[data-path-mode]'));
  var pathLines = Array.prototype.slice.call(root.querySelectorAll('[data-path-line]'));

  function selectComponent(key, moveFocus) {
    var component = components[key];
    if (!component) return;

    nodeButtons.forEach(function (button) {
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
      var external = linkData[1].indexOf('http') === 0;
      link.textContent = linkData[0] + (external ? ' ↗' : ' →');
      link.href = linkData[1];
      if (external) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      links.appendChild(link);
    });

    if (moveFocus && window.matchMedia('(max-width: 760px)').matches) {
      root.querySelector('.network-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function pathMatches(value, mode) {
    if (mode === 'all') return true;
    var values = String(value || '').split(/\s+/);
    return values.indexOf(mode) !== -1 || values.indexOf('all') !== -1;
  }

  function setPathMode(mode) {
    pathButtons.forEach(function (button) {
      var selected = button.getAttribute('data-path-mode') === mode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    stage.classList.toggle('path-filtered', mode !== 'all');

    pathLines.forEach(function (line) {
      line.classList.toggle('path-active', pathMatches(line.getAttribute('data-path-line'), mode));
    });

    nodeButtons.forEach(function (node) {
      var match = pathMatches(node.getAttribute('data-path-node'), mode);
      node.classList.toggle('path-active', match);
      node.classList.toggle('path-muted', mode !== 'all' && !match);
    });
  }

  nodeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectComponent(button.getAttribute('data-network-node'), true);
    });
  });

  pathButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setPathMode(button.getAttribute('data-path-mode'));
    });
  });

  setPathMode('all');
})();