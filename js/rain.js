(function () {
  var badge = document.querySelector('.vpn-badge[data-vpn="0"]');
  if (!badge) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function pour() {
    var r = badge.getBoundingClientRect();
    var pageY = r.top + window.scrollY, H = 900, W = document.documentElement.clientWidth;
    var cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:absolute;left:0;top:' + pageY + 'px;width:' + W +
      'px;height:' + H + 'px;pointer-events:none;z-index:900';
    document.body.appendChild(cvs);
    var dpr = window.devicePixelRatio || 1;
    cvs.width = W * dpr; cvs.height = H * dpr;
    var ctx = cvs.getContext('2d'); ctx.scale(dpr, dpr);
    var drops = [], last = 0, t = 0;
    for (var i = 0; i < 70; i++) {
      drops.push({
        x: r.left + Math.random() * r.width,
        y: r.height * (0.5 + Math.random() * 0.5),
        vy: 0.18 + Math.random() * 0.28,
        len: 5 + Math.random() * 4.5,
        w: 1.5 + Math.random() * 1.1,
        delay: Math.random() * 200,
        alpha: 0.3 + Math.random() * 0.4
      });
    }
    (function tick(now) {
      var dt = last ? Math.min((now - last) / 16.667, 3) : 1; last = now; t += dt;
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      for (var j = 0; j < drops.length; j++) {
        var d = drops[j];
        if (t < d.delay) { alive = true; continue; }
        d.vy += 0.0022 * dt; d.y += d.vy * dt;
        if (d.y < H) {
          alive = true;
          var a = d.alpha * (t > 420 ? Math.max(0, 1 - (t - 420) / 130) : 1);
          var g = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.len);
          g.addColorStop(0, 'rgba(180,205,232,' + (a * 0.45) + ')');
          g.addColorStop(1, 'rgba(214,234,255,' + a + ')');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.bezierCurveTo(d.x - d.w, d.y + d.len * 0.62, d.x - d.w, d.y + d.len, d.x, d.y + d.len);
          ctx.bezierCurveTo(d.x + d.w, d.y + d.len, d.x + d.w, d.y + d.len * 0.62, d.x, d.y);
          ctx.fill();
          ctx.globalAlpha = a * 0.5;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.ellipse(d.x - d.w * 0.28, d.y + d.len * 0.72, d.w * 0.22, d.len * 0.13, 0, 0, 6.28);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      if (alive && t < 560) { requestAnimationFrame(tick); } else { cvs.remove(); }
    })();
  }
  setTimeout(pour, 350);
  badge.style.cursor = 'pointer';
  badge.addEventListener('click', pour);
})();
