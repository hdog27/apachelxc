// ==========================================================================
// rtc.js - client-side WebRTC / hardware fingerprint for the Cyber Lab page.
// Fills #rtc-info with what the browser leaks, then POSTs it to /log_rtc.php.
// The POST path must stay exactly /log_rtc.php (server route is unchanged).
// Moved verbatim from the original inline <script>.
// ==========================================================================
(async function () {
  const result = {};
  result.cores = navigator.hardwareConcurrency || 'Unavailable';
  result.ram = navigator.deviceMemory ? (navigator.deviceMemory + ' GB (approx)') : 'Hidden by browser';
  result.screenInfo = screen.width + 'x' + screen.height + ' @' + window.devicePixelRatio + 'x, ' + screen.colorDepth + '-bit';
  result.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  result.languages = navigator.languages ? navigator.languages.join(',') : navigator.language;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const dbgExt = gl.getExtension('WEBGL_debug_renderer_info');
    result.gpu = dbgExt ? gl.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL) : 'Unavailable';
  } catch (e) { result.gpu = 'Unavailable'; }

  result.localIps = [];
  try {
    const ips = new Set();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    await new Promise((resolve) => {
      pc.onicecandidate = (e) => {
        if (!e.candidate) { resolve(); return; }
        const parts = e.candidate.candidate.split(' ');
        const ip = parts[4];
        if (ip) ips.add(ip);
      };
      pc.createOffer().then((offer) => pc.setLocalDescription(offer));
      setTimeout(resolve, 1500);
    });
    pc.close();
    result.localIps = [...ips];
  } catch (e) {}

  const box = document.getElementById('rtc-info');
  if (box) {
    box.innerHTML =
      'CPU Cores: <strong>' + result.cores + '</strong> &nbsp;|&nbsp; ' +
      'RAM (approx): <strong>' + result.ram + '</strong><br>' +
      'GPU: <strong>' + result.gpu + '</strong><br>' +
      'Screen: <strong>' + result.screenInfo + '</strong> &nbsp;|&nbsp; TZ: <strong>' + result.timezone + '</strong><br>' +
      'WebRTC-leaked IP(s): <strong>' + (result.localIps.join(', ') || 'None found') + '</strong>';
  }

  fetch('/log_rtc.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  }).catch(function () {});
})();
