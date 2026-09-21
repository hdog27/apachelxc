(function () {
  'use strict';

  function boot() {
    import('/js/vendor/cobe/index.esm.js')
      .then(function (mod) { init(mod.default); })
      .catch(function (error) {
        console.warn('COBE module unavailable; keeping GIF fallback.', error);
      });
  }

  function init(createGlobe) {

  var canvas = document.getElementById('metadata-cobe');
  var slot = document.getElementById('banner-globe-slot');
  var routeDataEl = document.getElementById('route-data');
  if (!canvas || !slot || !routeDataEl) return;

  var data = {};
  try { data = JSON.parse(routeDataEl.textContent || '{}'); } catch (e) {}

  var visitor = null;
  if (data.lat !== null && data.lat !== '' && data.lon !== null && data.lon !== '') {
    var vlat = Number(data.lat), vlon = Number(data.lon);
    if (Number.isFinite(vlat) && Number.isFinite(vlon)) visitor = [vlat, vlon];
  }

  // Cloudflare edge codes used by the current request-path visualization.
  var COLOS = {
    EWR:[40.6895,-74.1745], BOS:[42.3656,-71.0096], IAD:[38.9531,-77.4565], JFK:[40.6413,-73.7781],
    ATL:[33.6407,-84.4277], ORD:[41.9742,-87.9073], DFW:[32.8998,-97.0403], DEN:[39.8561,-104.6737],
    LAX:[33.9416,-118.4085], SFO:[37.6213,-122.3790], SEA:[47.4502,-122.3088], PHX:[33.4342,-112.0116],
    MIA:[25.7959,-80.2870], YYZ:[43.6777,-79.6248], YUL:[45.4706,-73.7408], YVR:[49.1947,-123.1792],
    MEX:[19.4361,-99.0719], LIM:[-12.0219,-77.1143], BOG:[4.7016,-74.1469], GRU:[-23.4356,-46.4731],
    GIG:[-22.8090,-43.2506], SCL:[-33.3929,-70.7858], EZE:[-34.8222,-58.5358],
    LHR:[51.4700,-0.4543], AMS:[52.3105,4.7683], FRA:[50.0379,8.5622], CDG:[49.0097,2.5479],
    MAD:[40.4983,-3.5676], DUB:[53.4213,-6.2701], ZRH:[47.4581,8.5555], VIE:[48.1103,16.5697],
    DXB:[25.2532,55.3657], JNB:[-26.1337,28.2420], NRT:[35.7720,140.3929], ICN:[37.4602,126.4407],
    HKG:[22.3080,113.9185], SIN:[1.3644,103.9915], SYD:[-33.9399,151.1753]
  };

  var cfCode = String(data.cfColo || '').toUpperCase();
  var cloud = COLOS[cfCode] || null;

  // Deliberately generalized hmax.space origin region, matching the intro globe.
  var home = [44.47, -71.57];

  var markers = [];
  if (visitor) markers.push({ location: visitor, size: 0.05, color: [0.49, 0.91, 0.53] });
  if (cloud) markers.push({ location: cloud, size: 0.045, color: [0.64, 0.44, 0.97] });
  markers.push({ location: home, size: 0.05, color: [0.35, 0.65, 1.0] });

  var arcs = [];
  if (visitor && cloud) {
    arcs.push({ from: visitor, to: cloud, color: [0.49, 0.91, 0.53] });
    arcs.push({ from: cloud, to: home, color: [0.35, 0.65, 1.0] });
  } else if (visitor) {
    arcs.push({ from: visitor, to: home, color: [0.35, 0.65, 1.0] });
  }

  var phi = 0;
  var globe = null;
  var destroyed = false;

  function sizeCanvas() {
    var rect = slot.getBoundingClientRect();
    var cssSize = Math.max(140, Math.round(Math.min(rect.width, rect.height || rect.width)));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = cssSize + 'px';
    canvas.style.height = cssSize + 'px';
    return { cssSize: cssSize, dpr: dpr };
  }

  try {
    var size = sizeCanvas();

    globe = createGlobe(canvas, {
      devicePixelRatio: size.dpr,
      width: Math.round(size.cssSize * size.dpr),
      height: Math.round(size.cssSize * size.dpr),
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.02, 0.03, 0.05],
      markerColor: [0.49, 0.91, 0.53],
      glowColor: [0.08, 0.12, 0.20],
      scale: 1,
      offset: [0, 0],
      markers: markers,
      arcs: arcs,
      arcColor: [0.35, 0.65, 1.0],
      arcWidth: 0.4,
      arcHeight: 0.25,
      markerElevation: 0.02,
      onRender: function (state) {
        if (document.hidden || destroyed) return;
        state.phi = phi;
        phi += 0.0026;
      }
    });

    requestAnimationFrame(function () {
      slot.classList.add('cobe-ready');
    });
  } catch (error) {
    console.warn('COBE metadata globe unavailable; keeping GIF fallback.', error);
    return;
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      // COBE dimensions are fixed at instance creation. A page reload after
      // orientation change is preferable to tearing down/rebuilding repeatedly.
      var rect = slot.getBoundingClientRect();
      if (rect.width < 120) slot.classList.remove('cobe-ready');
    }, 120);
  }, { passive: true });

  window.addEventListener('pagehide', function () {
    destroyed = true;
    window.clearTimeout(resizeTimer);
    if (globe && globe.destroy) globe.destroy();
  }, { once: true });
  }

  if (window.__hmaxIntroDone) {
    boot();
  } else {
    window.addEventListener('hmax:intro-complete', boot, { once: true });
    window.setTimeout(function () {
      if (!window.__hmaxIntroDone) boot();
    }, 9000);
  }
})();