// ==========================================================================
// rtc.js - client-side browser/network exposure report for the Cyber Lab.
// No GPS, camera, microphone or other permission prompt is requested.
// ==========================================================================
(async function () {
  // Load the dense v2 security-panel styles as a same-origin stylesheet so the
  // existing page template does not need another risky rewrite.
  try {
    if (!document.querySelector('link[data-cyberlab-extras]')) {
      var extraCss = document.createElement('link');
      extraCss.rel = 'stylesheet';
      extraCss.href = '/css/cyberlab-extras.css?v=2';
      extraCss.setAttribute('data-cyberlab-extras', '1');
      document.head.appendChild(extraCss);
    }
  } catch (e) {}

  // Correct the persistent diagram to represent the inbound HTTP request:
  // visitor -> Cloudflare -> hmax.space homelab.
  try {
    var routePanel = document.querySelector('.route-panel');
    if (routePanel) {
      var routeHeading = routePanel.querySelector('.section-copy h2');
      var routeCopy = routePanel.querySelector('.section-copy p:last-child');
      if (routeHeading) routeHeading.textContent = 'From your network, through Cloudflare, to my homelab.';
      if (routeCopy) routeCopy.textContent = 'The opening animation follows your inbound request: it starts near your approximate IP location, pulls back to Earth, passes through Cloudflare, then zooms toward the generalized New England homelab destination.';

      var summary = routePanel.querySelector('.route-summary');
      if (summary) {
        var visitorDot = summary.querySelector('.node-dot.visitor');
        var cloudDot = summary.querySelector('.node-dot.cloud');
        var homeDot = summary.querySelector('.node-dot.home');
        var lines = summary.querySelectorAll('.route-line');
        if (visitorDot && cloudDot && homeDot && lines.length >= 2) {
          var visitorNode = visitorDot.parentNode;
          var cloudNode = cloudDot.parentNode;
          var homeNode = homeDot.parentNode;
          summary.appendChild(visitorNode);
          summary.appendChild(lines[1]);
          summary.appendChild(cloudNode);
          summary.appendChild(lines[0]);
          summary.appendChild(homeNode);
        }
      }
    }
  } catch (e) {}

  // Put the existing kitty beside VPN status. Safe = relaxed idle animation;
  // no VPN = nervous/jumpy state. This uses the current sprite sheet and can
  // later be replaced by a custom scared/happy animation without changing PHP.
  try {
    var vpnBadge = document.querySelector('.vpn-badge[data-vpn]');
    if (vpnBadge && !vpnBadge.parentNode.classList.contains('vpn-status-wrap')) {
      var vpnWrap = document.createElement('div');
      vpnWrap.className = 'vpn-status-wrap';
      vpnBadge.parentNode.insertBefore(vpnWrap, vpnBadge);
      var vpnCat = document.createElement('span');
      vpnCat.className = 'vpn-cat ' + (vpnBadge.getAttribute('data-vpn') === '1' ? 'vpn-cat-safe' : 'vpn-cat-risk');
      vpnCat.setAttribute('aria-hidden', 'true');
      vpnWrap.appendChild(vpnCat);
      vpnWrap.appendChild(vpnBadge);
    }
  } catch (e) {}

  var result = {};
  result.cores = navigator.hardwareConcurrency || 'Unavailable';
  result.ram = navigator.deviceMemory ? (navigator.deviceMemory + ' GB (approx)') : 'Hidden by browser';
  result.screenInfo = screen.width + 'x' + screen.height + ' @' + window.devicePixelRatio + 'x, ' + screen.colorDepth + '-bit';
  result.timezone = (window.Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Unavailable';
  result.languages = navigator.languages ? navigator.languages.join(', ') : (navigator.language || 'Unavailable');
  result.cookies = navigator.cookieEnabled;
  result.dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || 'Not reported';
  result.secureContext = !!window.isSecureContext;
  result.crossOriginIsolated = !!window.crossOriginIsolated;
  result.touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  result.mediaDevicesApi = !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
  result.localStorage = false;
  result.sessionStorage = false;
  result.httpProtocol = 'Unavailable';
  result.tlsVersion = 'Not reported';
  result.warp = 'Not reported';
  result.cfColo = 'Not reported';
  result.ipVersion = 'Not reported';

  try {
    var routeDataEl = document.getElementById('route-data');
    if (routeDataEl) {
      var routeData = JSON.parse(routeDataEl.textContent || '{}');
      if (routeData.ipVersion) result.ipVersion = routeData.ipVersion;
      if (routeData.cfColo) result.cfColo = routeData.cfColo;
    }
  } catch (e) {}

  try {
    localStorage.setItem('__hmax_test', '1');
    localStorage.removeItem('__hmax_test');
    result.localStorage = true;
  } catch (e) {}
  try {
    sessionStorage.setItem('__hmax_test', '1');
    sessionStorage.removeItem('__hmax_test');
    result.sessionStorage = true;
  } catch (e) {}

  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (nav && nav.nextHopProtocol) result.httpProtocol = nav.nextHopProtocol;
  } catch (e) {}

  // Cloudflare's same-origin trace endpoint reports the edge-observed transport
  // for this browser connection. We intentionally ignore trace.ip here because
  // the page already displays the server-observed public IP elsewhere.
  try {
    var traceText = await fetch('/cdn-cgi/trace', {
      cache: 'no-store',
      credentials: 'omit'
    }).then(function (r) { return r.text(); });
    var trace = {};
    traceText.split('\n').forEach(function (line) {
      var i = line.indexOf('=');
      if (i > 0) trace[line.slice(0, i)] = line.slice(i + 1);
    });
    if (trace.http) result.httpProtocol = trace.http;
    if (trace.tls) result.tlsVersion = trace.tls;
    if (trace.warp) result.warp = trace.warp;
    if (trace.colo) result.cfColo = trace.colo;
  } catch (e) {}

  try {
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      var dbgExt = gl.getExtension('WEBGL_debug_renderer_info');
      result.gpu = dbgExt ? gl.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL) : 'Renderer hidden';
    } else {
      result.gpu = 'WebGL unavailable';
    }
  } catch (e) { result.gpu = 'Unavailable'; }

  result.localIps = [];
  try {
    var ips = new Set();
    var pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    await new Promise(function (resolve) {
      pc.onicecandidate = function (e) {
        if (!e.candidate) { resolve(); return; }
        var parts = e.candidate.candidate.split(' ');
        var ip = parts[4];
        if (ip) ips.add(ip);
      };
      pc.createOffer().then(function (offer) { return pc.setLocalDescription(offer); }).catch(resolve);
      setTimeout(resolve, 1500);
    });
    pc.close();
    result.localIps = Array.from(ips);
  } catch (e) {}

  var box = document.getElementById('rtc-info');
  if (box) {
    box.innerHTML =
      'CPU Cores: <strong>' + escapeHtml(result.cores) + '</strong> &nbsp;|&nbsp; ' +
      'RAM (approx): <strong>' + escapeHtml(result.ram) + '</strong><br>' +
      'GPU: <strong>' + escapeHtml(result.gpu) + '</strong><br>' +
      'Screen: <strong>' + escapeHtml(result.screenInfo) + '</strong> &nbsp;|&nbsp; TZ: <strong>' + escapeHtml(result.timezone) + '</strong><br>' +
      'Languages: <strong>' + escapeHtml(result.languages) + '</strong><br>' +
      'WebRTC candidate IP(s): <strong>' + escapeHtml(result.localIps.join(', ') || 'None exposed') + '</strong>';
  }

  // Count which fingerprinting signals were actually available. This is an
  // educational exposure meter, NOT a uniqueness/fingerprint-confidence claim.
  var signals = [
    ['OS / browser', true],
    ['CPU core count', result.cores !== 'Unavailable'],
    ['RAM bucket', String(result.ram).indexOf('Hidden') === -1],
    ['GPU renderer', !/hidden|unavailable/i.test(String(result.gpu))],
    ['Screen geometry', !!result.screenInfo],
    ['Timezone', result.timezone !== 'Unavailable'],
    ['Languages', result.languages !== 'Unavailable'],
    ['WebRTC candidates', result.localIps.length > 0],
    ['Touch capability', typeof result.touch === 'boolean'],
    ['Cookie capability', typeof result.cookies === 'boolean'],
    ['HTTP protocol', result.httpProtocol !== 'Unavailable'],
    ['Storage capability', result.localStorage || result.sessionStorage]
  ];
  var exposed = signals.filter(function (s) { return s[1]; }).length;
  var meter = document.getElementById('exposure-meter');
  var meterFill = document.getElementById('exposure-meter-fill');
  var signalList = document.getElementById('signal-list');
  if (meter) meter.textContent = exposed + '/12 signals exposed';
  if (meterFill) meterFill.style.width = Math.round(exposed / 12 * 100) + '%';
  if (signalList) {
    signalList.innerHTML = signals.map(function (s) {
      return '<span class="signal ' + (s[1] ? 'signal-on' : 'signal-off') + '">' +
        (s[1] ? '● ' : '○ ') + escapeHtml(s[0]) + '</span>';
    }).join('');
  }

  var caps = [
    ['Cookies', result.cookies ? 'Enabled' : 'Disabled'],
    ['Do Not Track', String(result.dnt)],
    ['Secure context', result.secureContext ? 'Yes' : 'No'],
    ['Cross-origin isolated', result.crossOriginIsolated ? 'Yes' : 'No'],
    ['Local storage', result.localStorage ? 'Available' : 'Blocked'],
    ['Session storage', result.sessionStorage ? 'Available' : 'Blocked'],
    ['Touch input', result.touch ? 'Available' : 'Not detected'],
    ['MediaDevices API', result.mediaDevicesApi ? 'Exposed (no permission requested)' : 'Unavailable'],
    ['Public IP stack', result.ipVersion],
    ['HTTP transport', prettyProtocol(result.httpProtocol)],
    ['TLS at Cloudflare edge', result.tlsVersion],
    ['Cloudflare edge', result.cfColo],
    ['Cloudflare WARP', prettyWarp(result.warp)]
  ];
  var capGrid = document.getElementById('capability-grid');
  if (capGrid) {
    capGrid.innerHTML = caps.map(function (c) {
      return '<div><dt>' + escapeHtml(c[0]) + '</dt><dd>' + escapeHtml(c[1]) + '</dd></div>';
    }).join('');
  }

  // Update the compact transport cards with values observed by Cloudflare.
  var transportEl = document.getElementById('http-transport');
  if (transportEl) transportEl.textContent = prettyProtocol(result.httpProtocol);
  var cards = document.querySelector('.protocol-cards');
  if (cards) {
    var cardEls = cards.children;
    if (cardEls[2]) {
      var tlsStrong = cardEls[2].querySelector('strong');
      var tlsSmall = cardEls[2].querySelector('small');
      if (tlsStrong) tlsStrong.textContent = result.tlsVersion;
      if (tlsSmall) tlsSmall.textContent = 'Cloudflare edge-observed TLS';
    }
    if (!cards.querySelector('[data-warp-card]')) {
      var warpCard = document.createElement('div');
      warpCard.setAttribute('data-warp-card', '1');
      warpCard.innerHTML = '<span>Cloudflare WARP</span><strong>' + escapeHtml(prettyWarp(result.warp)) + '</strong><small>Reported by Cloudflare trace</small>';
      cards.appendChild(warpCard);
    }
  }

  fetch('/log_rtc.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  }).catch(function () {});

  function prettyProtocol(p) {
    if (p === 'h3') return 'HTTP/3';
    if (p === 'h2') return 'HTTP/2';
    if (p === 'http/1.1') return 'HTTP/1.1';
    return p || 'Unavailable';
  }

  function prettyWarp(v) {
    if (v === 'on' || v === 'plus') return v === 'plus' ? 'WARP+' : 'WARP';
    if (v === 'off') return 'Not using WARP';
    return v || 'Not reported';
  }

  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
