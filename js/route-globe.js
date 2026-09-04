(function () {
  var overlay = document.getElementById('route-intro');
  var canvas = document.getElementById('route-canvas');
  var stage = document.getElementById('route-stage');
  var dataEl = document.getElementById('route-data');
  if (!overlay || !canvas || !stage || !dataEl) return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    overlay.remove();
    return;
  }

  var data;
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch (e) { data = {}; }

  var ctx = canvas.getContext('2d');
  if (!ctx) { overlay.remove(); return; }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0, R = 0;
  var started = performance.now();
  var duration = 3900;
  var visitorLat = Number(data.lat);
  var visitorLon = Number(data.lon);
  if (!isFinite(visitorLat)) visitorLat = 0;
  if (!isFinite(visitorLon)) visitorLon = 0;

  // Generalized New England origin. This is intentionally not the physical
  // home/server address.
  var originLat = 42.0;
  var originLon = -71.5;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2 - Math.min(18, H * 0.02);
    R = Math.min(W, H) * (W < 640 ? 0.30 : 0.25);
  }
  resize();
  window.addEventListener('resize', resize);

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function mix(a, b, t) { return a + (b - a) * t; }

  // Orthographic projection with a movable globe center.
  function project(lat, lon, centerLat, centerLon, radius) {
    var p = lat * Math.PI / 180;
    var l = lon * Math.PI / 180;
    var p0 = centerLat * Math.PI / 180;
    var l0 = centerLon * Math.PI / 180;
    var dl = l - l0;
    var cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(dl);
    return {
      x: cx + radius * Math.cos(p) * Math.sin(dl),
      y: cy - radius * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(dl)),
      visible: cosc > -0.08
    };
  }

  function drawGrid(centerLat, centerLon, radius, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    var grad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
    grad.addColorStop(0, 'rgba(58,145,255,0.30)');
    grad.addColorStop(0.55, 'rgba(17,55,99,0.28)');
    grad.addColorStop(1, 'rgba(3,12,24,0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    ctx.strokeStyle = 'rgba(93,181,255,' + (0.18 * alpha) + ')';
    ctx.lineWidth = 1;

    var lat, lon, p, prev;
    for (lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath(); prev = null;
      for (lon = -180; lon <= 180; lon += 4) {
        p = project(lat, lon, centerLat, centerLon, radius);
        if (!p.visible) { prev = null; continue; }
        if (!prev) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        prev = p;
      }
      ctx.stroke();
    }
    for (lon = -180; lon < 180; lon += 30) {
      ctx.beginPath(); prev = null;
      for (lat = -88; lat <= 88; lat += 4) {
        p = project(lat, lon, centerLat, centerLon, radius);
        if (!p.visible) { prev = null; continue; }
        if (!prev) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        prev = p;
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(91,184,255,' + (0.58 * alpha) + ')';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    var glow = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius * 1.12);
    glow.addColorStop(0, 'rgba(64,153,255,0)');
    glow.addColorStop(1, 'rgba(64,153,255,' + (0.14 * alpha) + ')');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2); ctx.fill();
  }

  function drawNode(x, y, label, sub, color, pulse) {
    ctx.save();
    ctx.shadowBlur = 18 + pulse * 10;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 5 + pulse * 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.font = '700 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 17);
    if (sub) {
      ctx.fillStyle = 'rgba(219,233,249,0.60)';
      ctx.font = '500 9px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
      ctx.fillText(sub, x, y + 24);
    }
    ctx.restore();
  }

  function drawArc(a, b, progress, color) {
    if (!a.visible || !b.visible || progress <= 0) return;
    var mx = (a.x + b.x) / 2;
    var my = (a.y + b.y) / 2 - Math.min(R * 0.42, Math.abs(a.x - b.x) * 0.22 + 30);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    var steps = 42;
    var upto = Math.max(1, Math.floor(steps * progress));
    for (var i = 1; i <= upto; i++) {
      var t = i / steps;
      var omt = 1 - t;
      var x = omt * omt * a.x + 2 * omt * t * mx + t * t * b.x;
      var y = omt * omt * a.y + 2 * omt * t * my + t * t * b.y;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function tick(now) {
    var elapsed = now - started;
    var t = clamp(elapsed / duration, 0, 1);

    // Camera begins near the origin and pans toward the visitor after the
    // Cloudflare relay stage.
    var pan = ease(clamp((t - 0.36) / 0.48, 0, 1));
    var centerLat = mix(originLat, visitorLat, pan * 0.78);
    var lonDelta = visitorLon - originLon;
    if (lonDelta > 180) lonDelta -= 360;
    if (lonDelta < -180) lonDelta += 360;
    var centerLon = originLon + lonDelta * pan * 0.78;
    var zoom = 1 + ease(clamp((t - 0.68) / 0.25, 0, 1)) * 0.38;
    var radius = R * zoom;

    ctx.clearRect(0, 0, W, H);
    drawGrid(centerLat, centerLon, radius, 1);

    var home = project(originLat, originLon, centerLat, centerLon, radius);
    var visitor = project(visitorLat, visitorLon, centerLat, centerLon, radius);

    // Cloudflare is represented as the relay layer in the architecture, not
    // as a fabricated physical POP coordinate.
    var relay = {
      x: mix(home.x, visitor.x, 0.48),
      y: Math.min(home.y, visitor.y) - radius * 0.20,
      visible: true
    };

    var pulse = (Math.sin(now / 160) + 1) / 2;
    if (home.visible) drawNode(home.x, home.y, 'HMAX.SPACE', 'homelab origin', '#58a6ff', pulse);

    var first = ease(clamp((t - 0.12) / 0.24, 0, 1));
    if (first > 0.02) {
      drawArc(home, relay, first, 'rgba(88,166,255,0.95)');
      drawNode(relay.x, relay.y, 'CLOUDFLARE', data.cfColo ? ('edge ' + data.cfColo) : 'edge network', '#a371f7', pulse);
    }

    var second = ease(clamp((t - 0.42) / 0.34, 0, 1));
    if (second > 0.02) drawArc(relay, visitor, second, 'rgba(126,231,135,0.95)');
    if (t > 0.59 && visitor.visible) drawNode(visitor.x, visitor.y, 'YOUR NETWORK', data.city || 'approximate location', '#7ee787', pulse);

    if (t < 0.18) stage.textContent = 'Resolving hmax.space origin...';
    else if (t < 0.43) stage.textContent = 'Entering Cloudflare edge network...';
    else if (t < 0.74) stage.textContent = 'Routing toward ' + (data.city || 'your network') + '...';
    else stage.textContent = (data.ipVersion || 'IP') + ' request resolved · ' + (data.city || 'network located');

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      overlay.classList.add('done');
      setTimeout(function () {
        overlay.remove();
        window.removeEventListener('resize', resize);
      }, 420);
    }
  }

  requestAnimationFrame(tick);
})();
