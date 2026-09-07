(function () {
  var badge = document.querySelector('.vpn-badge[data-vpn="0"]');
  if (!badge) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function pour() {
    var panel = badge.closest('.connection-panel');
    if (!panel) return;

    var old = panel.querySelector('canvas.vpn-rain-layer');
    if (old) old.remove();

    var panelRect = panel.getBoundingClientRect();
    var badgeRect = badge.getBoundingClientRect();
    var W = Math.max(1, panel.clientWidth);
    var H = Math.max(1, panel.clientHeight);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    panel.style.position = 'relative';
    panel.style.overflow = 'hidden';

    var cvs = document.createElement('canvas');
    cvs.className = 'vpn-rain-layer';
    cvs.style.position = 'absolute';
    cvs.style.inset = '0';
    cvs.style.width = '100%';
    cvs.style.height = '100%';
    cvs.style.pointerEvents = 'none';
    cvs.style.zIndex = '4';
    panel.appendChild(cvs);

    cvs.width = Math.round(W * dpr);
    cvs.height = Math.round(H * dpr);
    var ctx = cvs.getContext('2d');
    ctx.scale(dpr, dpr);

    var originX = badgeRect.left - panelRect.left + badgeRect.width / 2;
    var originY = badgeRect.bottom - panelRect.top - 1;
    var spread = Math.max(95, badgeRect.width * 0.85);
    var drops = [];
    var last = 0;
    var elapsed = 0;

    for (var i = 0; i < 42; i++) {
      drops.push({
        x: originX + (Math.random() - 0.5) * spread,
        y: originY + Math.random() * 10,
        vy: 1.1 + Math.random() * 1.7,
        len: 5 + Math.random() * 5,
        w: 1.2 + Math.random() * 1.1,
        delay: Math.random() * 420,
        alpha: 0.28 + Math.random() * 0.45
      });
    }

    (function tick(now) {
      if (!document.body.contains(cvs)) return;
      var dtMs = last ? Math.min(now - last, 50) : 16.7;
      last = now;
      elapsed += dtMs;
      ctx.clearRect(0, 0, W, H);

      var alive = false;
      for (var j = 0; j < drops.length; j++) {
        var d = drops[j];
        if (elapsed < d.delay) { alive = true; continue; }

        d.vy += 0.003 * dtMs;
        d.y += d.vy * (dtMs / 16.7);
        if (d.y < H + 12 && elapsed < 2500) {
          alive = true;
          var fade = elapsed > 1900 ? Math.max(0, 1 - (elapsed - 1900) / 600) : 1;
          var a = d.alpha * fade;
          var g = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.len);
          g.addColorStop(0, 'rgba(180,205,232,' + (a * 0.35) + ')');
          g.addColorStop(1, 'rgba(214,234,255,' + a + ')');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.bezierCurveTo(d.x - d.w, d.y + d.len * 0.62, d.x - d.w, d.y + d.len, d.x, d.y + d.len);
          ctx.bezierCurveTo(d.x + d.w, d.y + d.len, d.x + d.w, d.y + d.len * 0.62, d.x, d.y);
          ctx.fill();
        }
      }

      if (alive) requestAnimationFrame(tick);
      else cvs.remove();
    })(performance.now());
  }

  setTimeout(pour, 420);
  badge.style.cursor = 'pointer';
  badge.addEventListener('click', pour);
})();
