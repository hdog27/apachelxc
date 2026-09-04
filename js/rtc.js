// ==========================================================================
// rtc.js - client-side WebRTC / hardware exposure report for the Cyber Lab.
// No GPS, camera, microphone or other permission prompt is requested.
// ==========================================================================
(async function () {
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

  // Educational exposure score: count which fingerprinting signals were
  // actually available. It is NOT a uniqueness score and does not claim the
  // visitor can be uniquely identified.
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
    ['HTTP transport', prettyProtocol(result.httpProtocol)]
  ];
  var capGrid = document.getElementById('capability-grid');
  if (capGrid) {
    capGrid.innerHTML = caps.map(function (c) {
      return '<div><dt>' + escapeHtml(c[0]) + '</dt><dd>' + escapeHtml(c[1]) + '</dd></div>';
    }).join('');
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

  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
