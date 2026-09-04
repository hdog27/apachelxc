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

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0, baseR = 0;
  var started = performance.now();
  var duration = 4300;
  var visitorLat = Number(data.lat);
  var visitorLon = Number(data.lon);
  if (!isFinite(visitorLat)) visitorLat = 0;
  if (!isFinite(visitorLon)) visitorLon = 0;

  // Deliberately generalized New England origin, not a home/server address.
  var originLat = 42.0;
  var originLon = -71.5;

  // Coarse land silhouettes. They are intentionally lightweight rather than a
  // third-party map dependency, but enough to make the globe unmistakably Earth.
  var LAND = [
    // North America
    [[72,-168],[70,-145],[60,-137],[56,-126],[49,-124],[44,-124],[38,-122],[32,-117],[25,-109],[19,-105],[17,-96],[21,-88],[29,-83],[31,-81],[38,-75],[45,-66],[51,-58],[58,-63],[65,-73],[70,-100],[72,-130],[72,-168]],
    // Central America
    [[21,-105],[18,-98],[16,-92],[17,-88],[15,-84],[12,-83],[9,-79],[7,-78],[8,-82],[12,-87],[15,-92],[21,-105]],
    // South America
    [[12,-81],[8,-76],[5,-72],[2,-68],[-5,-64],[-10,-58],[-16,-54],[-22,-46],[-29,-49],[-36,-56],[-44,-65],[-53,-71],[-55,-68],[-50,-59],[-40,-53],[-30,-49],[-20,-43],[-10,-36],[-4,-35],[2,-50],[7,-61],[11,-71],[12,-81]],
    // Greenland
    [[83,-58],[80,-20],[72,-18],[61,-43],[60,-52],[69,-58],[76,-72],[83,-58]],
    // Europe + Asia
    [[36,-10],[43,-9],[49,-5],[53,1],[57,8],[60,18],[66,24],[70,40],[69,58],[73,72],[70,100],[68,130],[61,150],[55,163],[48,150],[43,135],[38,121],[31,121],[24,114],[18,109],[8,105],[1,104],[7,95],[20,88],[23,80],[28,73],[26,63],[31,52],[36,44],[41,35],[45,29],[45,18],[41,13],[39,4],[36,-10]],
    // Africa
    [[36,-17],[37,10],[32,31],[23,37],[12,44],[4,42],[-5,39],[-15,40],[-25,35],[-34,20],[-35,13],[-29,5],[-18,-5],[-5,-16],[8,-17],[18,-16],[28,-13],[36,-17]],
    // Arabia / India
    [[31,34],[30,49],[23,58],[16,55],[13,45],[20,39],[31,34]],
    [[24,67],[28,78],[24,88],[17,88],[8,78],[8,73],[16,72],[24,67]],
    // Japan-ish island line
    [[45,141],[39,142],[35,139],[31,131]],
    // Australia
    [[-11,113],[-16,122],[-18,136],[-12,143],[-18,153],[-28,153],[-38,146],[-44,136],[-35,116],[-24,113],[-11,113]],
    // Madagascar
    [[-13,48],[-18,50],[-25,47],[-26,44],[-18,43],[-13,48]],
    // Antarctica (stylized rim)
    [[-66,-180],[-70,-140],[-68,-100],[-72,-60],[-69,-20],[-72,30],[-68,70],[-71,110],[-67,150],[-66,180]]
  ];

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
    baseR = Math.min(W, H) * (W < 640 ? 0.30 : 0.27);
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

  // Orthographic projection with a movable globe center.
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

  function drawLand(centerLat, centerLon, radius, alpha) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.clip();
    ctx.fillStyle = 'rgba(75,151,121,' + (0.55*alpha) + ')';
    ctx.strokeStyle = 'rgba(137,222,178,' + (0.48*alpha) + ')';
    ctx.lineWidth = 0.9;

    for (var pi=0; pi<LAND.length; pi++) {
      var poly = LAND[pi];
      var visible = [];
      for (var j=0; j<poly.length; j++) {
        var q = project(poly[j][0], poly[j][1], centerLat, centerLon, radius);
        if (q.visible) visible.push(q);
        else visible.push(null);
      }
      var run = [];
      function flush() {
        if (run.length < 3) { run=[]; return; }
        ctx.beginPath();
        ctx.moveTo(run[0].x, run[0].y);
        for (var k=1;k<run.length;k++) ctx.lineTo(run[k].x,run[k].y);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        run=[];
      }
      for (var r=0;r<visible.length;r++) {
        if (visible[r]) run.push(visible[r]); else flush();
      }
      flush();
    }
    ctx.restore();
  }

  function drawGlobe(centerLat, centerLon, radius, alpha) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.clip();

    var ocean = ctx.createRadialGradient(cx-radius*.34,cy-radius*.38,radius*.06,cx,cy,radius);
    ocean.addColorStop(0,'rgba(43,132,211,.88)');
    ocean.addColorStop(.50,'rgba(14,68,121,.95)');
    ocean.addColorStop(1,'rgba(2,19,37,.99)');
    ctx.fillStyle=ocean; ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);

    ctx.strokeStyle='rgba(119,195,255,'+(0.15*alpha)+')';
    ctx.lineWidth=1;
    var lat,lon,p,prev;
    for(lat=-60;lat<=60;lat+=30){
      ctx.beginPath(); prev=null;
      for(lon=-180;lon<=180;lon+=4){
        p=project(lat,lon,centerLat,centerLon,radius);
        if(!p.visible){prev=null;continue;}
        if(!prev)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
        prev=p;
      }
      ctx.stroke();
    }
    for(lon=-180;lon<180;lon+=30){
      ctx.beginPath(); prev=null;
      for(lat=-88;lat<=88;lat+=4){
        p=project(lat,lon,centerLat,centerLon,radius);
        if(!p.visible){prev=null;continue;}
        if(!prev)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
        prev=p;
      }
      ctx.stroke();
    }
    ctx.restore();

    drawLand(centerLat,centerLon,radius,alpha);

    // atmosphere + limb
    ctx.strokeStyle='rgba(102,190,255,'+(0.72*alpha)+')';
    ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.stroke();
    var glow=ctx.createRadialGradient(cx,cy,radius*.82,cx,cy,radius*1.15);
    glow.addColorStop(0,'rgba(70,164,255,0)');
    glow.addColorStop(1,'rgba(70,164,255,'+(0.16*alpha)+')');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(cx,cy,radius*1.15,0,Math.PI*2); ctx.fill();
  }

  function drawNode(x,y,label,sub,color,pulse){
    ctx.save();
    ctx.shadowBlur=18+pulse*10; ctx.shadowColor=color; ctx.fillStyle=color;
    ctx.beginPath(); ctx.arc(x,y,5+pulse*2.3,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0; ctx.textAlign='center';
    ctx.fillStyle='rgba(255,255,255,.97)'; ctx.font='700 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
    ctx.fillText(label,x,y-17);
    if(sub){ctx.fillStyle='rgba(219,233,249,.62)';ctx.font='500 9px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';ctx.fillText(sub,x,y+24);}
    ctx.restore();
  }

  function drawArc(a,b,progress,color){
    if(!a.visible||!b.visible||progress<=0)return;
    var mx=(a.x+b.x)/2, my=(a.y+b.y)/2-Math.min(baseR*.48,Math.abs(a.x-b.x)*.22+30);
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.shadowBlur=12;ctx.shadowColor=color;
    ctx.beginPath();ctx.moveTo(a.x,a.y);
    var steps=42,upto=Math.max(1,Math.floor(steps*progress));
    for(var i=1;i<=upto;i++){
      var t=i/steps,omt=1-t;
      ctx.lineTo(omt*omt*a.x+2*omt*t*mx+t*t*b.x,omt*omt*a.y+2*omt*t*my+t*t*b.y);
    }
    ctx.stroke();ctx.restore();
  }

  function tick(now){
    var t=clamp((now-started)/duration,0,1);

    // 0-.22: close-up on generalized New England
    // .22-.48: pull back to a recognizable Earth view
    // .48-.72: rotate toward visitor through Cloudflare
    // .72-1: zoom into visitor region
    var pullBack=smoothSegment(t,.05,.34);
    var travel=smoothSegment(t,.43,.73);
    var visitorZoom=smoothSegment(t,.72,.96);

    var centerLat=mix(originLat,visitorLat,travel);
    var centerLon=shortestLon(originLon,visitorLon,travel);

    var startScale=2.55;
    var worldScale=mix(startScale,1.0,pullBack);
    var endScale=mix(1.0,1.82,visitorZoom);
    var scale=visitorZoom>0 ? endScale : worldScale;
    var radius=baseR*scale;

    ctx.clearRect(0,0,W,H);
    drawGlobe(centerLat,centerLon,radius,1);

    var home=project(originLat,originLon,centerLat,centerLon,radius);
    var visitor=project(visitorLat,visitorLon,centerLat,centerLon,radius);
    var pulse=(Math.sin(now/160)+1)/2;

    if(home.visible && t<.77) drawNode(home.x,home.y,'HMAX.SPACE','New England · origin hidden','#58a6ff',pulse);

    // Cloudflare remains architectural rather than a fabricated physical POP.
    var relay={
      x:mix(home.x,visitor.x,.50),
      y:Math.min(home.y,visitor.y)-Math.min(radius*.18,80),
      visible:home.visible&&visitor.visible
    };

    var first=smoothSegment(t,.27,.49);
    if(first>.02 && relay.visible){
      drawArc(home,relay,first,'rgba(88,166,255,.96)');
      drawNode(relay.x,relay.y,'CLOUDFLARE',data.cfColo?('edge '+data.cfColo):'edge network','#a371f7',pulse);
    }

    var second=smoothSegment(t,.50,.76);
    if(second>.02 && relay.visible) drawArc(relay,visitor,second,'rgba(126,231,135,.96)');
    if(t>.67 && visitor.visible) drawNode(visitor.x,visitor.y,'YOUR NETWORK',data.city||'approximate IP location','#7ee787',pulse);

    if(t<.20) stage.textContent='Starting from the hmax.space homelab...';
    else if(t<.42) stage.textContent='Pulling back to the public internet...';
    else if(t<.63) stage.textContent='Passing through Cloudflare'+(data.cfColo?' ('+data.cfColo+')':'')+'...';
    else if(t<.84) stage.textContent='Routing toward '+(data.city||'your network')+'...';
    else stage.textContent=(data.ipVersion||'IP')+' request resolved · '+(data.city||'network located');

    if(t<1) requestAnimationFrame(tick);
    else {
      overlay.classList.add('done');
      setTimeout(function(){overlay.remove();window.removeEventListener('resize',resize);},420);
    }
  }

  requestAnimationFrame(tick);
})();
