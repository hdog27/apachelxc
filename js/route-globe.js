(function () {
  var overlay = document.getElementById('route-intro');
  var canvas = document.getElementById('route-canvas');
  var stage = document.getElementById('route-stage');
  var dataEl = document.getElementById('route-data');
  if (!overlay || !canvas || !stage || !dataEl) return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { overlay.remove(); return; }

  var data;
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch (e) { data = {}; }

  var ctx = canvas.getContext('2d');
  if (!ctx) { overlay.remove(); return; }

  // Real NASA Blue Marble equirectangular texture, served by Wikimedia Commons.
  // It replaces the previous hand-built continent polygons completely.
  var earth = document.createElement('div');
  earth.setAttribute('aria-hidden', 'true');
  earth.style.position = 'absolute';
  earth.style.borderRadius = '50%';
  earth.style.overflow = 'hidden';
  earth.style.pointerEvents = 'none';
  earth.style.backgroundImage = 'url("https://upload.wikimedia.org/wikipedia/commons/archive/9/91/20170416020821%21Land_shallow_topo_2048.jpg")';
  earth.style.backgroundRepeat = 'repeat-x';
  earth.style.backgroundColor = '#06182d';
  earth.style.boxShadow = '0 0 80px rgba(67,151,255,.22), inset -70px -25px 95px rgba(0,0,0,.64), inset 32px 16px 48px rgba(255,255,255,.08)';
  earth.style.zIndex = '0';

  var atmosphere = document.createElement('div');
  atmosphere.style.position = 'absolute';
  atmosphere.style.inset = '0';
  atmosphere.style.borderRadius = '50%';
  atmosphere.style.pointerEvents = 'none';
  atmosphere.style.background = 'radial-gradient(circle at 32% 27%, rgba(255,255,255,.12), transparent 23%), radial-gradient(circle at 50% 50%, transparent 62%, rgba(0,6,18,.12) 70%, rgba(0,3,12,.68) 100%)';
  atmosphere.style.boxShadow = 'inset 0 0 28px rgba(126,202,255,.2)';
  earth.appendChild(atmosphere);
  overlay.insertBefore(earth, canvas);
  canvas.style.zIndex = '1';

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0, baseR = 0;
  var started = performance.now();
  var duration = 4300;

  var hasVisitorCoords = data.lat !== null && data.lat !== '' && data.lon !== null && data.lon !== '';
  var visitorLat = hasVisitorCoords ? Number(data.lat) : 0;
  var visitorLon = hasVisitorCoords ? Number(data.lon) : -35;
  if (!isFinite(visitorLat)) visitorLat = 0;
  if (!isFinite(visitorLon)) visitorLon = -35;

  // Deliberately generalized New England destination, not the server/home address.
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
    cy = H / 2 - Math.min(16, H * 0.02);
    baseR = Math.min(W, H) * (W < 640 ? 0.29 : 0.25);
  }
  resize();
  window.addEventListener('resize', resize);

  function ease(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2,2)/2; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function mix(a, b, t) { return a + (b-a)*t; }
  function smoothSegment(t, a, b) { return ease(clamp((t-a)/(b-a),0,1)); }

  function shortestLon(a, b, t) {
    var d = b - a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return a + d*t;
  }

  // Orthographic math is used for markers/arcs. The photographic texture is a
  // lightweight faux-3D skin, while markers remain tied to real coordinates.
  function project(lat, lon, centerLat, centerLon, radius) {
    var p = lat*Math.PI/180, l = lon*Math.PI/180;
    var p0 = centerLat*Math.PI/180, l0 = centerLon*Math.PI/180;
    var dl = l-l0;
    var cosc = Math.sin(p0)*Math.sin(p) + Math.cos(p0)*Math.cos(p)*Math.cos(dl);
    return {
      x: cx + radius*Math.cos(p)*Math.sin(dl),
      y: cy - radius*(Math.cos(p0)*Math.sin(p)-Math.sin(p0)*Math.cos(p)*Math.cos(dl)),
      visible: cosc >= 0
    };
  }

  function positionEarth(centerLon, radius) {
    var diameter = radius * 2;
    earth.style.width = diameter + 'px';
    earth.style.height = diameter + 'px';
    earth.style.left = (cx - radius) + 'px';
    earth.style.top = (cy - radius) + 'px';

    // One full equirectangular texture is twice the visible sphere width. The
    // horizontal offset makes the globe appear to rotate with longitude.
    var textureWidth = diameter * 2;
    var u = (((centerLon + 180) % 360) + 360) % 360 / 360;
    var left = radius - (u * textureWidth);
    earth.style.backgroundSize = textureWidth + 'px ' + diameter + 'px';
    earth.style.backgroundPosition = left + 'px center';
  }

  function drawNode(x,y,label,sub,color,pulse){
    ctx.save();
    ctx.shadowBlur=18+pulse*10; ctx.shadowColor=color; ctx.fillStyle=color;
    ctx.beginPath(); ctx.arc(x,y,5+pulse*2.3,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0; ctx.textAlign='center';
    ctx.fillStyle='rgba(255,255,255,.98)'; ctx.font='700 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
    ctx.fillText(label,x,y-17);
    if(sub){ctx.fillStyle='rgba(219,233,249,.72)';ctx.font='500 9px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';ctx.fillText(sub,x,y+24);}
    ctx.restore();
  }

  function drawArc(a,b,progress,color){
    if(!a.visible||!b.visible||progress<=0)return;
    var mx=(a.x+b.x)/2, my=(a.y+b.y)/2-Math.min(baseR*.52,Math.abs(a.x-b.x)*.24+34);
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.shadowBlur=13;ctx.shadowColor=color;
    ctx.beginPath();ctx.moveTo(a.x,a.y);
    var steps=48,upto=Math.max(1,Math.floor(steps*progress));
    for(var i=1;i<=upto;i++){
      var tt=i/steps,omt=1-tt;
      ctx.lineTo(omt*omt*a.x+2*omt*tt*mx+tt*tt*b.x,omt*omt*a.y+2*omt*tt*my+tt*tt*b.y);
    }
    ctx.stroke();ctx.restore();
  }

  function tick(now){
    var t=clamp((now-started)/duration,0,1);

    // Visitor close-up -> pull back -> Cloudflare -> zoom into hmax.space.
    var pullBack=smoothSegment(t,.04,.33);
    var travel=smoothSegment(t,.42,.73);
    var originZoom=smoothSegment(t,.72,.96);

    var centerLat=mix(visitorLat,originLat,travel);
    var centerLon=shortestLon(visitorLon,originLon,travel);

    var startScale=2.15;
    var worldScale=mix(startScale,1.0,pullBack);
    var endScale=mix(1.0,1.65,originZoom);
    var scale=originZoom>0 ? endScale : worldScale;
    var radius=baseR*scale;

    positionEarth(centerLon,radius);
    ctx.clearRect(0,0,W,H);

    // Thin atmospheric rim over the photographic sphere.
    ctx.save();
    ctx.strokeStyle='rgba(105,191,255,.72)';
    ctx.lineWidth=1.3;
    ctx.shadowBlur=16;
    ctx.shadowColor='rgba(75,166,255,.55)';
    ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.stroke();
    ctx.restore();

    var visitor=project(visitorLat,visitorLon,centerLat,centerLon,radius);
    var home=project(originLat,originLon,centerLat,centerLon,radius);
    var pulse=(Math.sin(now/160)+1)/2;

    if(hasVisitorCoords && visitor.visible && t<.78) {
      drawNode(visitor.x,visitor.y,'YOUR NETWORK',data.city||'approximate IP location','#7ee787',pulse);
    }

    var relay={
      x:mix(visitor.x,home.x,.50),
      y:Math.min(visitor.y,home.y)-Math.min(radius*.19,88),
      visible:visitor.visible&&home.visible
    };

    var first=smoothSegment(t,.27,.50);
    if(hasVisitorCoords && first>.02 && relay.visible){
      drawArc(visitor,relay,first,'rgba(126,231,135,.98)');
      drawNode(relay.x,relay.y,'CLOUDFLARE',data.cfColo?('edge '+data.cfColo):'edge network','#a371f7',pulse);
    }

    var second=smoothSegment(t,.50,.77);
    if(hasVisitorCoords && second>.02 && relay.visible) drawArc(relay,home,second,'rgba(88,166,255,.98)');
    if(t>.67 && home.visible) drawNode(home.x,home.y,'HMAX.SPACE','New England · origin hidden','#58a6ff',pulse);

    if(!hasVisitorCoords) {
      stage.textContent = t < .56 ? 'IP location unavailable — showing request edge...' : 'Forwarding request to hmax.space...';
    } else if(t<.20) stage.textContent='Starting from '+(data.city||'your network')+'...';
    else if(t<.42) stage.textContent='Pulling back to the public internet...';
    else if(t<.63) stage.textContent='Entering Cloudflare'+(data.cfColo?' ('+data.cfColo+')':'')+'...';
    else if(t<.84) stage.textContent='Forwarding the request to hmax.space...';
    else stage.textContent=(data.ipVersion||'IP')+' request delivered to the homelab';

    if(t<1) requestAnimationFrame(tick);
    else {
      overlay.classList.add('done');
      setTimeout(function(){overlay.remove();window.removeEventListener('resize',resize);},420);
    }
  }

  requestAnimationFrame(tick);
})();
