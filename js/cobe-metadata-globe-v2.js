import createGlobe from '/js/vendor/cobe/index.esm.js';

(function () {
  'use strict';

  var canvas = document.getElementById('metadata-cobe');
  var slot = document.getElementById('banner-globe-slot');
  var routeDataEl = document.getElementById('route-data');
  if (!canvas || !slot || !routeDataEl) return;

  var data = {};
  try { data = JSON.parse(routeDataEl.textContent || '{}'); } catch (e) {}

  var visitor = null;
  var lat = Number(data.lat), lon = Number(data.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) visitor = [lat, lon];

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

  var cloud = COLOS[String(data.cfColo || '').toUpperCase()] || null;
  var home = [44.47, -71.57];

  var markers = [];
  if (visitor) markers.push({ location: visitor, size: 0.045, color: [0.49, 0.91, 0.53] });
  if (cloud) markers.push({ location: cloud, size: 0.04, color: [0.64, 0.44, 0.97] });
  markers.push({ location: home, size: 0.045, color: [0.35, 0.65, 1.0] });

  var arcs = [];
  if (visitor && cloud) {
    arcs.push({ from: visitor, to: cloud, color: [0.49, 0.91, 0.53] });
    arcs.push({ from: cloud, to: home, color: [0.35, 0.65, 1.0] });
  } else if (visitor) {
    arcs.push({ from: visitor, to: home, color: [0.35, 0.65, 1.0] });
  }

  var globe = null;
  var raf = 0;
  var phi = 0;
  var destroyed = false;

  function start() {
    if (globe || destroyed) return;

    var rect = slot.getBoundingClientRect();
    var size = Math.max(150, Math.round(rect.width || 230));
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: phi,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6.5,
      mapBaseBrightness: 0.0,
      baseColor: [0.30, 0.30, 0.30],
      markerColor: [0.49, 0.91, 0.53],
      glowColor: [0.18, 0.24, 0.34],
      scale: 1,
      offset: [0, 0],
      markers: markers,
      arcs: arcs,
      arcColor: [0.35, 0.65, 1.0],
      arcWidth: 0.4,
      arcHeight: 0.25,
      markerElevation: 0.02
    });

    slot.classList.add('cobe-ready');

    function animate() {
      if (destroyed) return;
      if (!document.hidden && globe && globe.update) {
        phi += 0.0038;
        globe.update({ phi: phi });
      }
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
  }

  if (window.__hmaxIntroDone) start();
  else window.addEventListener('hmax:intro-complete', start, { once: true });

  window.addEventListener('pagehide', function () {
    destroyed = true;
    if (raf) cancelAnimationFrame(raf);
    if (globe && globe.destroy) globe.destroy();
  }, { once: true });
})();