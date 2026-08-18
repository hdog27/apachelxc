(function () {
  var badge = document.querySelector('.vpn-badge[data-vpn="1"]');
  if (!badge) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var COLORS = ['#7ee787', '#3fb950', '#58a6ff', '#ffd866', '#ff7b72'];

  function burst() {
    var box = badge.getBoundingClientRect();
    var cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;' +
                        'pointer-events:none;z-index:900';
    document.body.appendChild(cvs);

    var dpr = window.devicePixelRatio || 1;
    cvs.width  = window.innerWidth  * dpr;
    cvs.height = window.innerHeight * dpr;
    var ctx = cvs.getContext('2d');
    ctx.scale(dpr, dpr);

    var originX = box.left + box.width / 2;
    var originY = box.top + box.height / 2;
    var bits = [];

    for (var i = 0; i < 90; i++) {
      var angle = (Math.PI * 2 * i) / 90 + (Math.random() - 0.5);
      var speed = 3 + Math.random() * 6;
      bits.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        w: 4 + Math.random() * 5,
        h: 6 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1
      });
    }

    var frames = 0, last = 0, sy0 = window.scrollY;
    (function tick(now) {
      var dt = last ? Math.min((now - last) / 16.667, 3) : 1; last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.save(); ctx.translate(0, sy0 - window.scrollY);
      var alive = false;
      for (var j = 0; j < bits.length; j++) {
        var p = bits[j];
        if (p.life <= 0) continue;
        alive = true;
        p.vy += 0.18 * dt;
        p.vx *= Math.pow(0.99, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        if (frames > 60) p.life -= 0.02 * dt;
        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      ctx.restore();
      frames += dt;
      if (alive && frames < 220) { requestAnimationFrame(tick); }
      else { cvs.remove(); }
    })();
  }

  setTimeout(burst, 350);
  badge.style.cursor = 'pointer';
  badge.title = 'Click to celebrate again';
  badge.addEventListener('click', burst);
})();
