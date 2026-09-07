(function () {
  var overlay = document.getElementById('route-intro');
  var routeCanvas = document.getElementById('route-canvas');
  var stage = document.getElementById('route-stage');
  var dataEl = document.getElementById('route-data');
  if (!overlay || !routeCanvas || !stage || !dataEl) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlay.remove();
    return;
  }

  var data = {};
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch (e) {}

  var ctx = routeCanvas.getContext('2d');
  if (!ctx) { overlay.remove(); return; }

  // Earth and its blue atmospheric rim live on ONE WebGL canvas. Previously
  // the rim was drawn on the separate label canvas; iOS visual-viewport
  // resizing could make the two composited layers drift apart.
  var globeCanvas = document.createElement('canvas');
  globeCanvas.setAttribute('aria-hidden', 'true');
  globeCanvas.style.position = 'absolute';
  globeCanvas.style.inset = '0';
  globeCanvas.style.width = '100%';
  globeCanvas.style.height = '100%';
  globeCanvas.style.pointerEvents = 'none';
  globeCanvas.style.zIndex = '0';
  routeCanvas.style.position = 'absolute';
  routeCanvas.style.inset = '0';
  routeCanvas.style.width = '100%';
  routeCanvas.style.height = '100%';
  routeCanvas.style.zIndex = '1';
  routeCanvas.style.pointerEvents = 'none';
  overlay.insertBefore(globeCanvas, routeCanvas);

  var gl = globeCanvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  });
  if (!gl) { overlay.remove(); return; }

  var W = 0, H = 0, cx = 0, cy = 0, baseR = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var started = performance.now();
  var duration = 4700;

  var hasVisitor = data.lat !== null && data.lat !== '' && data.lon !== null && data.lon !== '';
  var visitor = {
    lat: hasVisitor ? Number(data.lat) : 0,
    lon: hasVisitor ? Number(data.lon) : -35
  };
  if (!isFinite(visitor.lat)) visitor.lat = 0;
  if (!isFinite(visitor.lon)) visitor.lon = -35;

  // Deliberately generalized New England destination, not an origin address.
  var home = { lat: 42.0, lon: -71.5 };

  var COLOS = {
    EWR:[40.6895,-74.1745], BOS:[42.3656,-71.0096], IAD:[38.9531,-77.4565], JFK:[40.6413,-73.7781],
    ATL:[33.6407,-84.4277], ORD:[41.9742,-87.9073], DFW:[32.8998,-97.0403], DEN:[39.8561,-104.6737],
    LAX:[33.9416,-118.4085], SFO:[37.6213,-122.3790], SEA:[47.4502,-122.3088], PHX:[33.4342,-112.0116],
    MIA:[25.7959,-80.2870], YYZ:[43.6777,-79.6248], YUL:[45.4706,-73.7408], YVR:[49.1947,-123.1792],
    MEX:[19.4361,-99.0719], LIM:[-12.0219,-77.1143], BOG:[4.7016,-74.1469], GRU:[-23.4356,-46.4731],
    GIG:[-22.8090,-43.2506], SCL:[-33.3929,-70.7858], EZE:[-34.8222,-58.5358],
    LHR:[51.4700,-0.4543], LGW:[51.1537,-0.1821], AMS:[52.3105,4.7683], FRA:[50.0379,8.5622],
    CDG:[49.0097,2.5479], MAD:[40.4983,-3.5676], MXP:[45.6306,8.7281], FCO:[41.8003,12.2389],
    WAW:[52.1672,20.9679], ARN:[59.6519,17.9186], HEL:[60.3172,24.9633], DUB:[53.4213,-6.2701],
    ZRH:[47.4581,8.5555], VIE:[48.1103,16.5697], IST:[41.2753,28.7519],
    DXB:[25.2532,55.3657], DOH:[25.2731,51.6081], JNB:[-26.1337,28.2420], CPT:[-33.9700,18.5972],
    NRT:[35.7720,140.3929], HND:[35.5494,139.7798], ICN:[37.4602,126.4407], HKG:[22.3080,113.9185],
    SIN:[1.3644,103.9915], BKK:[13.6900,100.7501], BOM:[19.0896,72.8656], DEL:[28.5562,77.1000],
    SYD:[-33.9399,151.1753], MEL:[-37.6690,144.8410], AKL:[-37.0082,174.7850]
  };
  var cfCode = String(data.cfColo || '').toUpperCase();
  var cfPair = COLOS[cfCode] || null;
  var cloud = cfPair ? { lat: cfPair[0], lon: cfPair[1] } : null;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }
  function seg(t, a, b) { return ease(clamp((t-a)/(b-a), 0, 1)); }
  function rad(v) { return v * Math.PI / 180; }
  function deg(v) { return v * 180 / Math.PI; }

  function toVec(p) {
    var la=rad(p.lat), lo=rad(p.lon), c=Math.cos(la);
    return [c*Math.cos(lo), c*Math.sin(lo), Math.sin(la)];
  }
  function norm(v) {
    var m=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) || 1;
    return [v[0]/m,v[1]/m,v[2]/m];
  }
  function dot(a,b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function cross(a,b) { return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
  function fromVec(v) {
    v=norm(v);
    return {lat:deg(Math.asin(clamp(v[2],-1,1))),lon:deg(Math.atan2(v[1],v[0]))};
  }
  function angularDistance(a,b) {
    return Math.acos(clamp(dot(toVec(a),toVec(b)),-1,1)) * 180 / Math.PI;
  }
  function slerpPoint(a,b,t) {
    var va=toVec(a), vb=toVec(b), d=clamp(dot(va,vb),-1,1);
    if (d>.9995) {
      return fromVec([va[0]+(vb[0]-va[0])*t,va[1]+(vb[1]-va[1])*t,va[2]+(vb[2]-va[2])*t]);
    }
    if (d<-.9995) {
      var helper=Math.abs(va[2])<.9?[0,0,1]:[0,1,0];
      var axis=norm(cross(va,helper));
      var ang=Math.PI*t,c=Math.cos(ang),s=Math.sin(ang);
      var axv=cross(axis,va),adv=dot(axis,va)*(1-c);
      return fromVec([
        va[0]*c+axv[0]*s+axis[0]*adv,
        va[1]*c+axv[1]*s+axis[1]*adv,
        va[2]*c+axv[2]*s+axis[2]*adv
      ]);
    }
    var omega=Math.acos(d), so=Math.sin(omega);
    var s0=Math.sin((1-t)*omega)/so, s1=Math.sin(t*omega)/so;
    return fromVec([va[0]*s0+vb[0]*s1,va[1]*s0+vb[1]*s1,va[2]*s0+vb[2]*s1]);
  }

  function compile(type, source) {
    var shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)||'shader compile failed');
    return shader;
  }

  var vertexSrc='attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}';
  var fragmentSrc=[
    'precision mediump float;',
    'uniform sampler2D u_tex;',
    'uniform vec2 u_centerPx;',
    'uniform float u_radius;',
    'uniform float u_centerLat;',
    'uniform float u_centerLon;',
    'uniform float u_ready;',
    'const float PI=3.141592653589793;',
    'void main(){',
    'vec2 p=(gl_FragCoord.xy-u_centerPx)/u_radius;',
    'float r2=dot(p,p);if(r2>1.0)discard;',
    'float rr=sqrt(r2);float z=sqrt(max(0.0,1.0-r2));',
    'float slon=sin(u_centerLon),clon=cos(u_centerLon);',
    'float slat=sin(u_centerLat),clat=cos(u_centerLat);',
    'vec3 east=vec3(-slon,clon,0.0);',
    'vec3 north=vec3(-slat*clon,-slat*slon,clat);',
    'vec3 forward=vec3(clat*clon,clat*slon,slat);',
    'vec3 world=normalize(p.x*east+p.y*north+z*forward);',
    'float lat=asin(clamp(world.z,-1.0,1.0));float lon=atan(world.y,world.x);',
    'vec2 uv=vec2((lon+PI)/(2.0*PI),(lat+PI/2.0)/PI);',
    'vec3 base=u_ready>.5?texture2D(u_tex,uv).rgb:mix(vec3(.01,.055,.12),vec3(.02,.15,.28),z);',
    'vec3 lightDir=normalize(vec3(-.35,.42,.84));',
    'float lit=.58+.42*max(0.0,dot(normalize(vec3(p.x,p.y,z)),lightDir));',
    'float limb=.72+.28*z;vec3 color=base*lit*limb;',
    'color+=vec3(.015,.07,.14)*(1.0-z)*.35;',
    'float rim=smoothstep(.955,.997,rr);',
    'color+=vec3(.12,.55,1.0)*rim*.72;',
    'float alpha=1.0-smoothstep(.9975,1.0,rr);',
    'gl_FragColor=vec4(color,alpha);}'
  ].join('');

  var program;
  try {
    program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSrc));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSrc));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)||'program link failed');
    gl.useProgram(program);
  } catch (e) { overlay.remove(); return; }

  var quad=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  var aPos=gl.getAttribLocation(program,'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

  var uCenterPx=gl.getUniformLocation(program,'u_centerPx');
  var uRadius=gl.getUniformLocation(program,'u_radius');
  var uCenterLat=gl.getUniformLocation(program,'u_centerLat');
  var uCenterLon=gl.getUniformLocation(program,'u_centerLon');
  var uReady=gl.getUniformLocation(program,'u_ready');
  var uTex=gl.getUniformLocation(program,'u_tex');

  var texture=gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([4,22,43,255]));
  gl.uniform1i(uTex,0);

  var textureReady=false;
  var maxTexture=gl.getParameter(gl.MAX_TEXTURE_SIZE)||2048;
  var textureUrl=maxTexture>=8192 && window.innerWidth>900
    ? 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Nasa_land_ocean_ice_8192.jpg'
    : (maxTexture>=4096
      ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Nasa_land_ocean_ice_8192.jpg/4096px-Nasa_land_ocean_ice_8192.jpg'
      : 'https://upload.wikimedia.org/wikipedia/commons/archive/9/91/20170416020821%21Land_shallow_topo_2048.jpg');

  var img=new Image();
  img.crossOrigin='anonymous';
  img.onload=function(){
    try{
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      textureReady=true;
    }catch(e){}
  };
  img.onerror=function(){
    if(textureUrl.indexOf('2048')===-1){
      textureUrl='https://upload.wikimedia.org/wikipedia/commons/archive/9/91/20170416020821%21Land_shallow_topo_2048.jpg';
      img.src=textureUrl;
    }
  };
  img.src=textureUrl;

  function resize(){
    var r=overlay.getBoundingClientRect();
    W=Math.max(1,Math.round(r.width));
    H=Math.max(1,Math.round(r.height));
    dpr=Math.min(window.devicePixelRatio||1,2);
    globeCanvas.width=Math.round(W*dpr);
    globeCanvas.height=Math.round(H*dpr);
    routeCanvas.width=Math.round(W*dpr);
    routeCanvas.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    gl.viewport(0,0,globeCanvas.width,globeCanvas.height);
    cx=W/2;
    cy=H/2-Math.min(16,H*.02);
    baseR=Math.min(W,H)*(W<640?.29:.25);
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});
  if(window.visualViewport) window.visualViewport.addEventListener('resize',resize,{passive:true});
  var ro=null;
  if(window.ResizeObserver){ ro=new ResizeObserver(resize); ro.observe(overlay); }

  function project(p,center,radius){
    var la=rad(p.lat),lo=rad(p.lon),cla=rad(center.lat),clo=rad(center.lon),dl=lo-clo;
    var cosc=Math.sin(cla)*Math.sin(la)+Math.cos(cla)*Math.cos(la)*Math.cos(dl);
    return {
      x:cx+radius*Math.cos(la)*Math.sin(dl),
      y:cy-radius*(Math.cos(cla)*Math.sin(la)-Math.sin(cla)*Math.cos(la)*Math.cos(dl)),
      visible:cosc>=0
    };
  }

  function renderEarth(center,radius){
    gl.useProgram(program);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uCenterPx,cx*dpr,(H-cy)*dpr);
    gl.uniform1f(uRadius,radius*dpr);
    gl.uniform1f(uCenterLat,rad(center.lat));
    gl.uniform1f(uCenterLon,rad(center.lon));
    gl.uniform1f(uReady,textureReady?1:0);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }

  function drawNode(p,center,radius,label,sub,color,pulse){
    var q=project(p,center,radius); if(!q.visible)return;
    ctx.save();
    ctx.shadowBlur=18+pulse*9;ctx.shadowColor=color;ctx.fillStyle=color;
    ctx.beginPath();ctx.arc(q.x,q.y,5+pulse*2.2,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.textAlign='center';ctx.fillStyle='#fff';
    ctx.font='700 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';ctx.fillText(label,q.x,q.y-17);
    if(sub){ctx.fillStyle='rgba(225,237,250,.72)';ctx.font='500 9px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';ctx.fillText(sub,q.x,q.y+24);}
    ctx.restore();
  }

  function drawGreatCircle(a,b,progress,center,radius,color){
    if(progress<=0)return;
    var steps=72,upto=Math.max(1,Math.floor(steps*clamp(progress,0,1))),drawing=false;
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2.15;ctx.shadowBlur=11;ctx.shadowColor=color;
    for(var i=0;i<=upto;i++){
      var p=slerpPoint(a,b,i/steps),q=project(p,center,radius);
      if(q.visible){
        if(!drawing){ctx.beginPath();ctx.moveTo(q.x,q.y);drawing=true;}else ctx.lineTo(q.x,q.y);
      }else if(drawing){ctx.stroke();drawing=false;}
    }
    if(drawing)ctx.stroke();ctx.restore();
  }

  function drawPacket(a,b,progress,center,radius,color){
    if(progress<=0||progress>1)return;
    var p=slerpPoint(a,b,clamp(progress,0,1)),q=project(p,center,radius);if(!q.visible)return;
    ctx.save();ctx.fillStyle=color;ctx.shadowBlur=18;ctx.shadowColor=color;ctx.beginPath();ctx.arc(q.x,q.y,3.4,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function routeCenter(t){
    if(!hasVisitor)return home;
    if(cloud){
      if(t<.58)return slerpPoint(visitor,cloud,seg(t,.30,.58));
      return slerpPoint(cloud,home,seg(t,.58,.84));
    }
    return slerpPoint(visitor,home,seg(t,.34,.84));
  }

  var tripDegrees=hasVisitor?angularDistance(visitor,home):180;
  var startScale=hasVisitor ? clamp(2.75-(tripDegrees/180)*1.25,1.50,2.75) : 1.55;

  function cleanup(){
    window.removeEventListener('resize',resize);
    if(window.visualViewport) window.visualViewport.removeEventListener('resize',resize);
    if(ro) ro.disconnect();
  }

  function tick(now){
    var t=clamp((now-started)/duration,0,1);
    var center=routeCenter(t);
    var pullBack=seg(t,.04,.30),zoomHome=seg(t,.84,.97);
    var scale=(1-pullBack)*startScale+pullBack*1.0;
    if(zoomHome>0) scale=1.0+.66*zoomHome;
    var radius=baseR*scale;

    renderEarth(center,radius);
    ctx.clearRect(0,0,W,H);
    var pulse=(Math.sin(now/160)+1)/2;

    if(hasVisitor){
      if(t<.67)drawNode(visitor,center,radius,'YOUR NETWORK',data.city||'approximate IP location','#7ee787',pulse);
      if(cloud){
        var p1=seg(t,.24,.57),p2=seg(t,.56,.83);
        drawGreatCircle(visitor,cloud,p1,center,radius,'rgba(126,231,135,.98)');
        drawPacket(visitor,cloud,p1,center,radius,'#7ee787');
        if(t>.39&&t<.76)drawNode(cloud,center,radius,'CLOUDFLARE',cfCode?'edge '+cfCode:'edge network','#a371f7',pulse);
        drawGreatCircle(cloud,home,p2,center,radius,'rgba(88,166,255,.98)');
        drawPacket(cloud,home,p2,center,radius,'#58a6ff');
      }else{
        var direct=seg(t,.33,.82);
        drawGreatCircle(visitor,home,direct,center,radius,'rgba(88,166,255,.98)');
        drawPacket(visitor,home,direct,center,radius,'#58a6ff');
      }
    }

    if(t>.69)drawNode(home,center,radius,'HMAX.SPACE','New England · origin hidden','#58a6ff',pulse);

    if(!hasVisitor)stage.textContent=t<.60?'IP location unavailable — request still passed through Cloudflare...':'Forwarding request to hmax.space...';
    else if(t<.18)stage.textContent='Starting from '+(data.city||'your network')+'...';
    else if(t<.34)stage.textContent='Pulling back from your network...';
    else if(t<.60)stage.textContent='Entering Cloudflare'+(cfCode?' ('+cfCode+')':'')+'...';
    else if(t<.86)stage.textContent='Crossing the network toward hmax.space...';
    else stage.textContent=(data.ipVersion||'IP')+' request delivered to the homelab';

    if(t<1){
      requestAnimationFrame(tick);
    }else{
      overlay.classList.add('done');
      setTimeout(function(){cleanup();overlay.remove();},420);
    }
  }

  requestAnimationFrame(tick);
})();
