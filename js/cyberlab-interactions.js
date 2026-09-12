(function () {
  'use strict';

  try {
    if (!document.querySelector('link[data-cyberlab-interactions-css]')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/css/cyberlab-interactions.css?v=1';
      css.setAttribute('data-cyberlab-interactions-css', '1');
      document.head.appendChild(css);
    }
  } catch (e) {}

  function escapeText(value) {
    return String(value == null ? '' : value);
  }

  function browserSnapshot() {
    var snapshot = {};
    snapshot.browser = navigator.userAgent || 'Unavailable';
    snapshot.cores = navigator.hardwareConcurrency || 'Unavailable';
    snapshot.ram = navigator.deviceMemory ? navigator.deviceMemory + ' GB (approx)' : 'Hidden by browser';
    snapshot.screen = screen.width + 'x' + screen.height + ' @' + window.devicePixelRatio + 'x, ' + screen.colorDepth + '-bit';
    snapshot.timezone = (window.Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Unavailable';
    snapshot.languages = navigator.languages ? navigator.languages.join(', ') : (navigator.language || 'Unavailable');
    snapshot.touch = (('ontouchstart' in window) || navigator.maxTouchPoints > 0) ? 'Touch input detected' : 'No touch input detected';
    snapshot.cookies = navigator.cookieEnabled ? 'Cookies enabled' : 'Cookies disabled';
    snapshot.storage = 'localStorage/sessionStorage capability checked by this page';
    snapshot.http = 'See transport panel below';
    snapshot.webrtc = 'See WebRTC candidate line above';
    return snapshot;
  }

  async function localWebglSnapshot() {
    var result = {
      supported: false,
      version: 'Unavailable',
      vendor: 'Hidden by browser',
      renderer: 'Unavailable',
      maxTexture: 'Unavailable',
      renderHash: 'Unavailable'
    };

    try {
      var canvas = document.createElement('canvas');
      canvas.width = 96;
      canvas.height = 96;
      var gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }) || canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
      if (!gl) return result;

      result.supported = true;
      result.version = gl.getParameter(gl.VERSION) || 'WebGL';
      result.maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE);

      var debug = gl.getExtension('WEBGL_debug_renderer_info');
      if (debug) {
        result.vendor = gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) || 'Hidden by browser';
        result.renderer = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) || 'Renderer hidden';
      } else {
        result.renderer = 'Renderer hidden';
      }

      if (window.crypto && crypto.subtle) {
        try {
          result.renderHash = await renderHash(gl, canvas);
        } catch (e) {
          result.renderHash = 'Render hash unavailable';
        }
      }
    } catch (e) {}

    return result;
  }

  async function renderHash(gl, canvas) {
    function compile(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('shader');
      return shader;
    }

    var program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }'));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, [
      'precision highp float;',
      'void main(){',
      'vec2 q=gl_FragCoord.xy/vec2(96.0,96.0);',
      'float r=sin(q.x*12.9898+q.y*78.233)*0.5+0.5;',
      'float g=cos(q.x*39.3467-q.y*11.135)*0.5+0.5;',
      'float b=sin((q.x+q.y)*51.734)*0.5+0.5;',
      'gl_FragColor=vec4(r,g,b,1.0);',
      '}'
    ].join('')));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    var pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var digest = await crypto.subtle.digest('SHA-256', pixels);
    return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  async function initBrowserSignals() {
    var tries = 0;
    var timer = window.setInterval(async function () {
      tries++;
      var list = document.getElementById('signal-list');
      var pills = list ? list.querySelectorAll('.signal') : [];
      if (!list || pills.length < 1) {
        if (tries > 30) window.clearInterval(timer);
        return;
      }
      window.clearInterval(timer);

      var snap = browserSnapshot();
      var webgl = await localWebglSnapshot();

      var info = {
        'OS / browser': { value: snap.browser, why: 'Browser and platform details help with compatibility, but they also add identifying characteristics to a browser fingerprint.', uses: 'Compatibility, analytics, bot detection, fingerprinting' },
        'CPU core count': { value: snap.cores, why: 'Logical CPU core count is a coarse hardware signal. It is not unique by itself, but it narrows the set of devices that look like yours.', uses: 'Performance tuning, anti-abuse, fingerprinting' },
        'RAM bucket': { value: snap.ram, why: 'Some browsers expose an approximate memory bucket rather than exact installed RAM. That still contributes to a device profile.', uses: 'Performance tuning, fingerprinting' },
        'GPU renderer': { value: webgl.renderer, why: 'WebGL can expose characteristics of the graphics stack. GPU, driver, browser and rendering differences can become a fingerprinting signal.', uses: 'Graphics compatibility, bot detection, browser fingerprinting', webgl: webgl },
        'Screen geometry': { value: snap.screen, why: 'Resolution, color depth and pixel ratio describe the display environment and become more useful when combined with other signals.', uses: 'Responsive design, analytics, fingerprinting' },
        'Timezone': { value: snap.timezone, why: 'Timezone can narrow a likely region and can be compared with IP geolocation or language settings for consistency checks.', uses: 'Localization, fraud detection, fingerprinting' },
        'Languages': { value: snap.languages, why: 'Preferred language order is useful for localization and can also contribute another relatively stable browser characteristic.', uses: 'Localization, analytics, fingerprinting' },
        'WebRTC candidates': { value: snap.webrtc, why: 'WebRTC ICE negotiation can expose network candidate information. Modern browsers often replace local addresses with mDNS names to reduce privacy leakage.', uses: 'Real-time communications, diagnostics, fingerprinting' },
        'Touch capability': { value: snap.touch, why: 'Input capabilities help distinguish phones, tablets, laptops and desktops, especially when combined with screen and platform information.', uses: 'UI adaptation, fingerprinting' },
        'Cookie capability': { value: snap.cookies, why: 'Sites can detect whether cookies are available before attempting to use them for sessions or preferences.', uses: 'Sessions, preferences, compatibility checks' },
        'HTTP protocol': { value: snap.http, why: 'The negotiated transport reveals protocol support and some network-path characteristics.', uses: 'Performance diagnostics, compatibility, telemetry' },
        'Storage capability': { value: snap.storage, why: 'A page can test whether browser storage APIs are available. Availability can vary with privacy mode, policy and browser settings.', uses: 'Preferences, app state, privacy-mode detection' }
      };

      var detail = document.getElementById('signal-detail');
      if (!detail) {
        detail = document.createElement('div');
        detail.id = 'signal-detail';
        detail.className = 'signal-detail';
        detail.hidden = true;
        list.insertAdjacentElement('afterend', detail);
      }

      Array.from(pills).forEach(function (pill) {
        var label = pill.textContent.replace(/^[●○]\s*/, '').trim();
        var entry = info[label];
        if (!entry) return;

        var button = document.createElement('button');
        button.type = 'button';
        button.className = pill.className;
        button.innerHTML = pill.innerHTML;
        button.setAttribute('aria-pressed', 'false');
        pill.replaceWith(button);

        button.addEventListener('click', function () {
          list.querySelectorAll('.signal').forEach(function (other) {
            var active = other === button;
            other.classList.toggle('is-selected', active);
            other.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          renderSignalDetail(detail, label, entry, /signal-on/.test(button.className));
        });
      });
    }, 150);
  }

  function renderSignalDetail(detail, label, entry, exposed) {
    var webgl = '';
    if (entry.webgl && entry.webgl.supported) {
      webgl = '<div class="signal-webgl"><div><span>WebGL version</span><strong>' + escapeText(entry.webgl.version) + '</strong></div><div><span>GPU vendor</span><strong>' + escapeText(entry.webgl.vendor) + '</strong></div><div><span>Max texture</span><strong>' + escapeText(entry.webgl.maxTexture) + ' px</strong></div><div class="signal-hash"><span>Local render SHA-256 <em>LOCAL ONLY</em></span><code>' + escapeText(entry.webgl.renderHash) + '</code></div></div>';
    }

    detail.innerHTML = '<div class="signal-detail-head"><div><span>BROWSER SIGNAL</span><strong>' + escapeText(label) + '</strong></div><b>' + (exposed ? 'EXPOSED' : 'REDUCED / HIDDEN') + '</b></div><div class="signal-current"><span>What your browser reported</span><code>' + escapeText(entry.value) + '</code></div><div class="signal-detail-grid"><div><span>Why it matters</span><p>' + escapeText(entry.why) + '</p></div><div><span>Common uses</span><p>' + escapeText(entry.uses) + '</p></div><div><span>Permission required</span><strong>None</strong></div></div>' + webgl;
    detail.hidden = false;
  }

  function probeInfo(path) {
    path = String(path || '');
    if (/\/(?:wp-login\.php|xmlrpc\.php|wp-admin(?:\/|$)|wp-content(?:\/|$)|wp-includes(?:\/|$))/i.test(path)) return { title: 'WordPress discovery probe', summary: 'This bot was looking for a WordPress installation. hmax.space does not run WordPress.', why: 'Automated scanners request common WordPress paths to find login pages, plugins, themes and XML-RPC endpoints that may be brute-forced or exploited.', classification: 'WORDPRESS DISCOVERY' };
    if (/(?:^|\/)\.git(?:\/|$)|(?:^|\/)\.svn(?:\/|$)/i.test(path)) return { title: 'Source repository exposure probe', summary: 'This request was checking whether source-control files were accidentally exposed by the web server.', why: 'A published .git directory can reveal source code, commit history, internal paths and sometimes secrets that were removed from newer files but remain in history.', classification: 'SOURCE EXPOSURE' };
    if (/(?:^|\/)(?:\.env(?:[./?]|$)|env\.bak|config\.env|aws\/credentials|\.aws(?:\/|$)|id_rsa|\.ssh(?:\/|$)|credentials(?:[./?]|$)|secrets?(?:[./?]|$))/i.test(path)) return { title: 'Credential / secret discovery probe', summary: 'This request was looking for a file that commonly contains credentials, API keys or environment secrets.', why: 'Misconfigured web roots sometimes expose .env files, cloud credentials, SSH keys or backups. Bots scan for these paths because one successful hit can expose sensitive configuration.', classification: 'SECRET DISCOVERY' };
    if (/phpinfo|[?&]pp=env(?:&|$)|debug(?:\/|\?|$)|_profiler|phpmyadmin|(?:^|\/)pma(?:\/|$)/i.test(path)) return { title: 'PHP / debug exposure probe', summary: 'This scanner was testing for debugging or administration pages that should not be publicly exposed.', why: 'Debug pages and database-admin tools can leak software versions, environment variables, stack traces or privileged interfaces.', classification: 'DEBUG / ADMIN DISCOVERY' };
    if (/(?:^|\/)(?:vendor\/phpunit|actuator|cgi-bin|boaform|HNAP1|manager\/html|solr|jenkins|console\/login)/i.test(path)) return { title: 'Known exploit-path probe', summary: 'This request targeted a path associated with software that has historically been scanned for exploitable deployments.', why: 'Internet-wide scanners try well-known application paths at scale. A matching path does not mean the target is vulnerable; it means the scanner is checking whether that software is present.', classification: 'EXPLOIT DISCOVERY' };
    if (/(?:^|\/)(?:backup|bak|old|config)(?:[./_-]|\/)/i.test(path)) return { title: 'Backup / configuration probe', summary: 'This scanner was looking for leftover backups or configuration files in the public web root.', why: 'Old archives and copied configuration files can contain source code, credentials or database dumps even when the live application itself is secure.', classification: 'BACKUP / CONFIG DISCOVERY' };
    return { title: 'Suspicious automated probe', summary: 'This request matched one of the Cyber Lab’s high-signal scanner rules.', why: 'The classification is heuristic: the requested path resembles a resource commonly targeted by automated internet scanners.', classification: 'HEURISTIC SCANNER MATCH' };
  }

  function ensureProbeDetail(probeList) {
    var detail = document.getElementById('probe-detail');
    if (detail) return detail;
    detail = document.createElement('div');
    detail.id = 'probe-detail';
    detail.className = 'probe-detail';
    detail.hidden = true;
    detail.innerHTML = '<div class="probe-detail-head"><div><span class="probe-detail-kicker">WHY THIS MATTERS</span><strong id="probe-detail-title"></strong></div><button type="button" class="probe-detail-close" aria-label="Close probe explanation">×</button></div><code id="probe-detail-path"></code><p id="probe-detail-summary"></p><div class="probe-detail-grid"><div><span>What scanners want</span><p id="probe-detail-why"></p></div><div><span>Classification</span><strong id="probe-detail-class"></strong></div></div><small>These labels describe the requested path, not proof that an exploit succeeded.</small>';
    probeList.insertAdjacentElement('afterend', detail);
    detail.querySelector('.probe-detail-close').addEventListener('click', function () {
      detail.hidden = true;
      document.querySelectorAll('.probe-row.is-selected').forEach(function (row) { row.classList.remove('is-selected'); row.setAttribute('aria-expanded', 'false'); });
    });
    return detail;
  }

  function showProbeDetail(row, path) {
    var probeList = row.closest('.probe-list');
    if (!probeList) return;
    var detail = ensureProbeDetail(probeList);
    var info = probeInfo(path);
    document.querySelectorAll('.probe-row.is-selected').forEach(function (other) { if (other !== row) { other.classList.remove('is-selected'); other.setAttribute('aria-expanded', 'false'); } });
    row.classList.add('is-selected');
    row.setAttribute('aria-expanded', 'true');
    detail.querySelector('#probe-detail-title').textContent = info.title;
    detail.querySelector('#probe-detail-path').textContent = path;
    detail.querySelector('#probe-detail-summary').textContent = info.summary;
    detail.querySelector('#probe-detail-why').textContent = info.why;
    detail.querySelector('#probe-detail-class').textContent = info.classification;
    detail.hidden = false;
  }

  function initProbeRows() {
    document.querySelectorAll('.probe-row').forEach(function (row) {
      var code = row.querySelector('code');
      if (!code) return;
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-expanded', 'false');
      row.setAttribute('aria-label', 'Explain suspicious request ' + code.textContent.trim());
      function activate() { showProbeDetail(row, code.textContent.trim()); }
      row.addEventListener('click', activate);
      row.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
    });
  }

  function formatExactHour(ts) {
    var date = new Date(Number(ts) * 1000);
    return date.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  }

  function ensureTimeline(noisePanel) {
    var existing = document.getElementById('noise-activity');
    if (existing) return existing;
    var stats = noisePanel.querySelector('.noise-stats');
    if (!stats) return null;
    var section = document.createElement('section');
    section.id = 'noise-activity';
    section.className = 'noise-activity';
    section.setAttribute('aria-label', 'Suspicious scanner activity during the last 24 hours');
    section.innerHTML = '<div class="activity-heading"><div><span>SCANNER ACTIVITY</span><strong>Suspicious requests by hour</strong></div><small id="noise-activity-status">Loading 24h timeline…</small></div><div class="activity-bars" id="activity-bars"></div><div class="activity-axis"><span>24h ago</span><span>18h</span><span>12h</span><span>6h</span><span>now</span></div><div class="activity-readout" id="noise-activity-readout">Hover or tap a bar to inspect an hour.</div>';
    stats.insertAdjacentElement('afterend', section);
    return section;
  }

  function renderTimeline(data) {
    var noisePanel = document.querySelector('.noise-panel');
    if (!noisePanel) return;
    var section = ensureTimeline(noisePanel);
    if (!section) return;
    var bars = section.querySelector('#activity-bars');
    var status = section.querySelector('#noise-activity-status');
    var readout = section.querySelector('#noise-activity-readout');
    var activity = data && Array.isArray(data.activity) ? data.activity : [];
    if (!data || !data.available || activity.length === 0) {
      bars.innerHTML = '<div class="activity-empty">No hourly scanner timeline is available yet.</div>';
      status.textContent = 'Waiting for parser refresh';
      return;
    }
    var total = activity.reduce(function (sum, bucket) { return sum + (Number(bucket.count) || 0); }, 0);
    if (total === 0) {
      bars.innerHTML = '<div class="activity-empty">No high-signal scanner requests were detected in this 24-hour window.</div>';
      status.textContent = 'Quiet window';
      readout.textContent = 'Normal requests are counted above but do not appear in this suspicious-activity chart.';
      section.classList.add('is-loaded');
      return;
    }
    var max = Math.max.apply(null, activity.map(function (bucket) { return Number(bucket.count) || 0; }).concat([1]));
    bars.textContent = '';
    activity.forEach(function (bucket, index) {
      var count = Number(bucket.count) || 0;
      var networks = Number(bucket.networks) || 0;
      var wrap = document.createElement('button');
      wrap.type = 'button';
      wrap.className = 'activity-bar-wrap' + (index === activity.length - 1 ? ' is-current' : '');
      wrap.setAttribute('aria-label', formatExactHour(bucket.ts) + ': ' + count + ' suspicious requests from ' + networks + ' source networks');
      wrap.title = formatExactHour(bucket.ts) + ' · ' + count + ' suspicious requests';
      var bar = document.createElement('i');
      bar.className = 'activity-bar';
      bar.style.setProperty('--activity-height', Math.max(5, Math.round((count / max) * 100)) + '%');
      wrap.appendChild(bar);
      function show() {
        bars.querySelectorAll('.activity-bar-wrap.is-active').forEach(function (other) { if (other !== wrap) other.classList.remove('is-active'); });
        wrap.classList.add('is-active');
        readout.textContent = formatExactHour(bucket.ts) + ' · ' + count + ' suspicious request' + (count === 1 ? '' : 's') + ' · ' + networks + ' source network' + (networks === 1 ? '' : 's');
      }
      wrap.addEventListener('mouseenter', show);
      wrap.addEventListener('focus', show);
      wrap.addEventListener('click', show);
      bars.appendChild(wrap);
    });
    status.textContent = 'Live · refreshes every minute';
    requestAnimationFrame(function () { requestAnimationFrame(function () { section.classList.add('is-loaded'); }); });
  }

  async function refreshTimeline() {
    try {
      var response = await fetch('/noise-data.php', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      renderTimeline(await response.json());
    } catch (e) {
      var status = document.getElementById('noise-activity-status');
      if (status) status.textContent = 'Timeline temporarily unavailable';
    }
  }

  initBrowserSignals();
  initProbeRows();
  refreshTimeline();
  window.setInterval(refreshTimeline, 60000);
})();
