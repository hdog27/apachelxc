(function () {
  'use strict';

  // Cyber Lab boot coordinator. The route globe owns the GPU during the intro.
  // Everything below is non-critical and starts only after the intro signals
  // completion (or after a conservative failsafe if the signal never arrives).
  var started = false;
  var fallbackTimer = 0;

  var deferredScripts = [
    '/js/liquid-glass-webgl.js',
    '/js/liquid-glass-nav-webgl.js',
    '/js/rtc.js',
    '/js/flank.js',
    '/js/confetti.js',
    '/js/rain.js',
    '/js/ghosts.js',
    '/js/vpn-kitty.js'
  ];

  function loadScript(src) {
    return new Promise(function (resolve) {
      if (document.querySelector('script[data-cyberlab-deferred-src="' + src + '"]')) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.setAttribute('data-cyberlab-deferred-src', src);
      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);
    });
  }

  function startDeferred() {
    if (started) return;
    started = true;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    window.removeEventListener('hmax:intro-complete', startDeferred);

    // Keep execution ordered. Glass gets first shot at initialization, then the
    // browser fingerprint / teaching effects start.
    deferredScripts.reduce(function (chain, src) {
      return chain.then(function () { return loadScript(src); });
    }, Promise.resolve());
  }

  if (window.__hmaxIntroDone) {
    startDeferred();
    return;
  }

  window.addEventListener('hmax:intro-complete', startDeferred, { once: true });

  // Failsafe for browsers that abort the intro without dispatching the event.
  // This is deliberately longer than the normal globe animation.
  fallbackTimer = window.setTimeout(startDeferred, 9000);
})();