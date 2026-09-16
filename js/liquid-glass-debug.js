(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  if (params.get('glassdebug') !== '1') return;

  const box = document.createElement('pre');
  box.id = 'liquid-glass-debug';
  box.style.cssText = [
    'position:fixed',
    'right:8px',
    'bottom:8px',
    'z-index:2147483647',
    'max-width:min(92vw,520px)',
    'max-height:48vh',
    'overflow:auto',
    'margin:0',
    'padding:10px 12px',
    'border:1px solid rgba(126,231,135,.55)',
    'border-radius:10px',
    'background:rgba(0,0,0,.88)',
    'color:#b8f7bd',
    'font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace',
    'white-space:pre-wrap',
    'pointer-events:none'
  ].join(';');
  document.body.appendChild(box);

  function rendererInfo(gl) {
    if (!gl) return 'none';
    try {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (!ext) return 'hidden';
      return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'unknown';
    } catch (_) {
      return 'error';
    }
  }

  function update() {
    const root = document.documentElement;
    const canvas = document.getElementById('liquid-glass-stage');
    const wallpaper = document.getElementById('liquid-glass-wallpaper');
    let gl = null;
    let glError = 'n/a';
    let lost = 'n/a';
    let maxTex = 'n/a';

    if (canvas) {
      try {
        gl = canvas.getContext('webgl');
        if (gl) {
          lost = String(gl.isContextLost());
          glError = String(gl.getError());
          maxTex = String(gl.getParameter(gl.MAX_TEXTURE_SIZE));
        }
      } catch (err) {
        glError = 'exception: ' + err.message;
      }
    }

    const cards = document.querySelectorAll('.card, .panel, .identity-hero');
    const glassCards = document.querySelectorAll('.liquid-webgl-surface');
    const wallpaperStyle = wallpaper ? getComputedStyle(wallpaper) : null;

    box.textContent = [
      'LIQUID GLASS DEBUG',
      'ready class: ' + root.classList.contains('archis-webgl-ready'),
      'wallpaper node: ' + Boolean(wallpaper),
      'wallpaper image: ' + (wallpaperStyle ? wallpaperStyle.backgroundImage : 'n/a'),
      'canvas node: ' + Boolean(canvas),
      'canvas size: ' + (canvas ? canvas.width + 'x' + canvas.height : 'n/a'),
      'webgl context: ' + Boolean(gl),
      'context lost: ' + lost,
      'gl error: ' + glError,
      'max texture: ' + maxTex,
      'renderer: ' + rendererInfo(gl),
      'cards found: ' + cards.length,
      'glass cards: ' + glassCards.length,
      'viewport: ' + innerWidth + 'x' + innerHeight + ' @' + (devicePixelRatio || 1) + 'x',
      'visibility: ' + document.visibilityState,
      'ua: ' + navigator.userAgent
    ].join('\n');
  }

  update();
  setInterval(update, 500);
})();
