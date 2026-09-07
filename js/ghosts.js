(function () {
  var badge = document.querySelector('.vpn-badge[data-vpn="0"]');
  if (!badge) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function haunt() {
    var panel = badge.closest('.connection-panel');
    if (!panel) return;

    var old = panel.querySelector('canvas.vpn-ghost-layer');
    if (old) old.remove();

    var panelRect = panel.getBoundingClientRect();
    var badgeRect = badge.getBoundingClientRect();
    var W = Math.max(1, panel.clientWidth);
    var H = Math.max(1, panel.clientHeight);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    panel.style.position = 'relative';
    panel.style.overflow = 'hidden';

    var cvs = document.createElement('canvas');
    cvs.className = 'vpn-ghost-layer';
    cvs.style.position = 'absolute';
    cvs.style.inset = '0';
    cvs.style.width = '100%';
    cvs.style.height = '100%';
    cvs.style.pointerEvents = 'none';
    cvs.style.zIndex = '5';
    panel.appendChild(cvs);

    cvs.width = Math.round(W * dpr);
    cvs.height = Math.round(H * dpr);
    var ctx = cvs.getContext('2d');
    ctx.scale(dpr, dpr);

    var originX = badgeRect.left - panelRect.left + badgeRect.width / 2;
    var originY = badgeRect.top - panelRect.top + badgeRect.height / 2;
    var ghosts = [];
    var last = 0;
    var elapsed = 0;

    for (var i = 0; i < 5; i++) {
      ghosts.push({
        x: originX + (Math.random() - 0.5) * Math.max(100, badgeRect.width * .8),
        y: originY + 18 + Math.random() * 18,
        vy: .35 + Math.random() * .28,
        sway: .65 + Math.random() * .9,
        phase: Math.random() * 6.28,
        size: 15 + Math.random() * 6,
        delay: i * 140 + Math.random() * 100
      });
    }

    (function tick(now) {
      if (!document.body.contains(cvs)) return;
      var dtMs = last ? Math.min(now - last, 50) : 16.7;
      last = now;
      elapsed += dtMs;
      ctx.clearRect(0, 0, W, H);
      var alive = false;

      for (var j = 0; j < ghosts.length; j++) {
        var g = ghosts[j];
        var age = elapsed - g.delay;
        if (age < 0) { alive = true; continue; }
        if (age > 2200) continue;
        alive = true;
        g.y -= g.vy * (dtMs / 16.7);
        var alpha = age < 250 ? age / 250 : Math.max(0, 1 - (age - 250) / 1950);
        ctx.save();
        ctx.globalAlpha = alpha * .85;
        ctx.font = g.size + 'px serif';
        ctx.textAlign = 'center';
        ctx.fillText('👻', g.x + Math.sin(g.phase + age / 250) * g.sway * 8, g.y);
        ctx.restore();
      }

      if (alive) requestAnimationFrame(tick);
      else cvs.remove();
    })(performance.now());
  }

  setTimeout(haunt, 560);
  badge.addEventListener('click', haunt);
})();
