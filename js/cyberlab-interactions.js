(function () {
  'use strict';

  function escapeText(value) {
    return String(value == null ? '' : value);
  }

  function probeInfo(path) {
    path = String(path || '');

    if (/\/(?:wp-login\.php|xmlrpc\.php|wp-admin(?:\/|$)|wp-content(?:\/|$)|wp-includes(?:\/|$))/i.test(path)) {
      return {
        title: 'WordPress discovery probe',
        summary: 'This bot was looking for a WordPress installation. hmax.space does not run WordPress.',
        why: 'Automated scanners request common WordPress paths to find login pages, plugins, themes and XML-RPC endpoints that may be brute-forced or exploited.',
        classification: 'WORDPRESS DISCOVERY'
      };
    }

    if (/(?:^|\/)\.git(?:\/|$)|(?:^|\/)\.svn(?:\/|$)/i.test(path)) {
      return {
        title: 'Source repository exposure probe',
        summary: 'This request was checking whether source-control files were accidentally exposed by the web server.',
        why: 'A published .git directory can reveal source code, commit history, internal paths and sometimes secrets that were removed from newer files but remain in history.',
        classification: 'SOURCE EXPOSURE'
      };
    }

    if (/(?:^|\/)(?:\.env(?:[./?]|$)|env\.bak|config\.env|aws\/credentials|\.aws(?:\/|$)|id_rsa|\.ssh(?:\/|$)|credentials(?:[./?]|$)|secrets?(?:[./?]|$))/i.test(path)) {
      return {
        title: 'Credential / secret discovery probe',
        summary: 'This request was looking for a file that commonly contains credentials, API keys or environment secrets.',
        why: 'Misconfigured web roots sometimes expose .env files, cloud credentials, SSH keys or backups. Bots scan for these paths because one successful hit can expose sensitive configuration.',
        classification: 'SECRET DISCOVERY'
      };
    }

    if (/phpinfo|[?&]pp=env(?:&|$)|debug(?:\/|\?|$)|_profiler|phpmyadmin|(?:^|\/)pma(?:\/|$)/i.test(path)) {
      return {
        title: 'PHP / debug exposure probe',
        summary: 'This scanner was testing for debugging or administration pages that should not be publicly exposed.',
        why: 'Debug pages and database-admin tools can leak software versions, environment variables, stack traces or privileged interfaces.',
        classification: 'DEBUG / ADMIN DISCOVERY'
      };
    }

    if (/(?:^|\/)(?:vendor\/phpunit|actuator|cgi-bin|boaform|HNAP1|manager\/html|solr|jenkins|console\/login)/i.test(path)) {
      return {
        title: 'Known exploit-path probe',
        summary: 'This request targeted a path associated with software that has historically been scanned for exploitable deployments.',
        why: 'Internet-wide scanners try well-known application paths at scale. A matching path does not mean the target is vulnerable; it means the scanner is checking whether that software is present.',
        classification: 'EXPLOIT DISCOVERY'
      };
    }

    if (/(?:^|\/)(?:backup|bak|old|config)(?:[./_-]|\/)/i.test(path)) {
      return {
        title: 'Backup / configuration probe',
        summary: 'This scanner was looking for leftover backups or configuration files in the public web root.',
        why: 'Old archives and copied configuration files can contain source code, credentials or database dumps even when the live application itself is secure.',
        classification: 'BACKUP / CONFIG DISCOVERY'
      };
    }

    return {
      title: 'Suspicious automated probe',
      summary: 'This request matched one of the Cyber Lab’s high-signal scanner rules.',
      why: 'The classification is heuristic: the requested path resembles a resource commonly targeted by automated internet scanners.',
      classification: 'HEURISTIC SCANNER MATCH'
    };
  }

  function ensureProbeDetail(probeList) {
    var detail = document.getElementById('probe-detail');
    if (detail) return detail;

    detail = document.createElement('div');
    detail.id = 'probe-detail';
    detail.className = 'probe-detail';
    detail.hidden = true;
    detail.innerHTML =
      '<div class="probe-detail-head">' +
        '<div><span class="probe-detail-kicker">WHY THIS MATTERS</span><strong id="probe-detail-title"></strong></div>' +
        '<button type="button" class="probe-detail-close" aria-label="Close probe explanation">×</button>' +
      '</div>' +
      '<code id="probe-detail-path"></code>' +
      '<p id="probe-detail-summary"></p>' +
      '<div class="probe-detail-grid">' +
        '<div><span>What scanners want</span><p id="probe-detail-why"></p></div>' +
        '<div><span>Classification</span><strong id="probe-detail-class"></strong></div>' +
      '</div>' +
      '<small>These labels describe the requested path, not proof that an exploit succeeded.</small>';

    probeList.insertAdjacentElement('afterend', detail);

    var close = detail.querySelector('.probe-detail-close');
    if (close) {
      close.addEventListener('click', function () {
        detail.hidden = true;
        document.querySelectorAll('.probe-row.is-selected').forEach(function (row) {
          row.classList.remove('is-selected');
          row.setAttribute('aria-expanded', 'false');
        });
      });
    }

    return detail;
  }

  function showProbeDetail(row, path) {
    var probeList = row.closest('.probe-list');
    if (!probeList) return;

    var detail = ensureProbeDetail(probeList);
    var info = probeInfo(path);

    document.querySelectorAll('.probe-row.is-selected').forEach(function (other) {
      if (other !== row) {
        other.classList.remove('is-selected');
        other.setAttribute('aria-expanded', 'false');
      }
    });

    row.classList.add('is-selected');
    row.setAttribute('aria-expanded', 'true');

    detail.querySelector('#probe-detail-title').textContent = info.title;
    detail.querySelector('#probe-detail-path').textContent = escapeText(path);
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

      function activate() {
        showProbeDetail(row, code.textContent.trim());
      }

      row.addEventListener('click', activate);
      row.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  function formatExactHour(ts) {
    var date = new Date(Number(ts) * 1000);
    return date.toLocaleString([], {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit'
    });
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
    section.innerHTML =
      '<div class="activity-heading">' +
        '<div><span>SCANNER ACTIVITY</span><strong>Suspicious requests by hour</strong></div>' +
        '<small id="noise-activity-status">Loading 24h timeline…</small>' +
      '</div>' +
      '<div class="activity-bars" id="activity-bars"></div>' +
      '<div class="activity-axis"><span>24h ago</span><span>18h</span><span>12h</span><span>6h</span><span>now</span></div>' +
      '<div class="activity-readout" id="noise-activity-readout">Hover or tap a bar to inspect an hour.</div>';

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
        bars.querySelectorAll('.activity-bar-wrap.is-active').forEach(function (other) {
          if (other !== wrap) other.classList.remove('is-active');
        });
        wrap.classList.add('is-active');
        readout.textContent = formatExactHour(bucket.ts) + ' · ' + count + ' suspicious request' + (count === 1 ? '' : 's') + ' · ' + networks + ' source network' + (networks === 1 ? '' : 's');
      }

      wrap.addEventListener('mouseenter', show);
      wrap.addEventListener('focus', show);
      wrap.addEventListener('click', show);
      bars.appendChild(wrap);
    });

    status.textContent = 'Live · refreshes every minute';

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        section.classList.add('is-loaded');
      });
    });
  }

  async function refreshTimeline() {
    try {
      var response = await fetch('/noise-data.php', {
        cache: 'no-store',
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      renderTimeline(await response.json());
    } catch (error) {
      var status = document.getElementById('noise-activity-status');
      if (status) status.textContent = 'Timeline temporarily unavailable';
    }
  }

  initProbeRows();
  refreshTimeline();
  window.setInterval(refreshTimeline, 60000);
})();
