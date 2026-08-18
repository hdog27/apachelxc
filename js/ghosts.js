(function () {
  var badge = document.querySelector('.vpn-badge[data-vpn="0"]');
  if (!badge) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function haunt() {
    var r = badge.getBoundingClientRect();
    var pageY = r.top + window.scrollY, H = 700, W = document.documentElement.clientWidth;
    var cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:absolute;left:0;top:' + (pageY - 260) + 'px;width:' + W + 'px;height:' + H + 'px;pointer-events:none;z-index:899';
    document.body.appendChild(cvs);
    var dpr = window.devicePixelRatio || 1;
    cvs.width = W * dpr; cvs.height = H * dpr;
    var ctx = cvs.getContext('2d'); ctx.scale(dpr, dpr);
    var gs = [], last = 0, t = 0;
    for (var i = 0; i < 5; i++) {
      gs.push({
        x: r.left + 10 + Math.random() * (r.width - 20),
        y: 260 + r.height / 2,
        vy: 0.25 + Math.random() * 0.2,
        sway: 0.6 + Math.random() * 0.8,
        phase: Math.random() * 6.28,
        size: 13 + Math.random() * 5,
        delay: i * 22 + Math.random() * 12
      });
    }
    (function tick(now) {
      var dt = last ? Math.min((now - last) / 16.667, 3) : 1; last = now; t += dt;
      ctx.clearRect(0, 0, W, H);
      
      var alive = false;
      for (var j = 0; j < gs.length; j++) {
        var g = gs[j], age = t - g.delay;
        if (age < 0) { alive = true; continue; }
        if (age > 190) continue;
        alive = true;
        g.y -= g.vy * dt;
        var a = age < 30 ? age / 30 : Math.max(0, 1 - (age - 30) / 160);
        ctx.save();
        ctx.globalAlpha = a * 0.85;
        ctx.font = g.size + 'px serif';
        ctx.textAlign = 'center';
        ctx.fillText('\uD83D\uDC7B', g.x + Math.sin(g.phase + age / 26) * g.sway * 7, g.y);
        }
      if (alive) { requestAnimationFrame(tick); } else { cvs.remove(); }
    })();
  }
  setTimeout(haunt, 500);
  badge.addEventListener('click', haunt);
})();
