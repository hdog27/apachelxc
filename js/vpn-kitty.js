(function () {
  'use strict';

  var badge = document.querySelector('.vpn-badge[data-vpn]');
  if (!badge) return;

  var wrap = badge.parentNode && badge.parentNode.classList &&
    badge.parentNode.classList.contains('vpn-status-wrap') ? badge.parentNode : null;

  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'vpn-status-wrap';
    badge.parentNode.insertBefore(wrap, badge);
    wrap.appendChild(badge);
  }

  var old = wrap.querySelectorAll(
    '.vpn-cat,.vpn-cat-window,.vpn-kitty-host,.vpn-kitty-canvas-host,' +
    '.vpn-kitty-native,[data-vpn-kitty],[data-vpn-kitty-frame]'
  );
  for (var i = 0; i < old.length; i += 1) old[i].remove();

  wrap.style.setProperty('display', 'flex', 'important');
  wrap.style.setProperty('align-items', 'center', 'important');
  wrap.style.setProperty('justify-content', 'center', 'important');
  wrap.style.setProperty('gap', '10px', 'important');
  wrap.style.setProperty('width', '100%', 'important');
  wrap.style.setProperty('min-height', '54px', 'important');

  var FRAME_SIZE = 32;
  var DISPLAY_SIZE = 48;
  var SCALE = DISPLAY_SIZE / FRAME_SIZE;
  var FRAME_COUNT = 8;
  var FRAME_MS = 125;
  var IDLE_ROW = 0;
  var SAD_ROW = 0;
  var HACKER_ROW = 1;
  var IDLE_SPRITE_URL = '/images/kitty-custom-v2.png?v=01dedbeb';
  var STATUS_SPRITE_URL = '/images/kitty-status-v3.png?v=b97ad661';

  var cat = document.createElement('span');
  cat.className = 'vpn-kitty-sprite';
  cat.setAttribute('data-vpn-kitty', 'sprite-sheet');
  cat.setAttribute('data-kitty-state', 'loading');
  cat.setAttribute('aria-hidden', 'true');

  cat.style.setProperty('display', 'block', 'important');
  cat.style.setProperty('width', DISPLAY_SIZE + 'px', 'important');
  cat.style.setProperty('height', DISPLAY_SIZE + 'px', 'important');
  cat.style.setProperty('min-width', DISPLAY_SIZE + 'px', 'important');
  cat.style.setProperty('min-height', DISPLAY_SIZE + 'px', 'important');
  cat.style.setProperty('max-width', DISPLAY_SIZE + 'px', 'important');
  cat.style.setProperty('max-height', DISPLAY_SIZE + 'px', 'important');
  cat.style.setProperty('flex', '0 0 ' + DISPLAY_SIZE + 'px', 'important');
  cat.style.setProperty('margin', '0', 'important');
  cat.style.setProperty('padding', '0', 'important');
  cat.style.setProperty('border', '0', 'important');
  cat.style.setProperty('overflow', 'hidden', 'important');
  cat.style.setProperty('background-repeat', 'no-repeat', 'important');
  cat.style.setProperty('image-rendering', 'pixelated', 'important');
  wrap.insertBefore(cat, badge);

  var frameTimer = null;
  var stateTimer = null;

  function showFrame(row, frame, state) {
    var idle = state === 'idle';
    cat.style.setProperty(
      'background-image',
      'url("' + (idle ? IDLE_SPRITE_URL : STATUS_SPRITE_URL) + '")',
      'important'
    );
    cat.style.setProperty(
      'background-size',
      (256 * SCALE) + 'px ' + ((idle ? 320 : 64) * SCALE) + 'px',
      'important'
    );
    cat.style.setProperty(
      'background-position',
      (-frame * DISPLAY_SIZE) + 'px ' + (-row * DISPLAY_SIZE) + 'px',
      'important'
    );
  }

  function play(row, state) {
    if (frameTimer !== null) window.clearInterval(frameTimer);
    var frame = 0;
    cat.setAttribute('data-kitty-state', state);
    showFrame(row, frame, state);
    frameTimer = window.setInterval(function () {
      frame = (frame + 1) % FRAME_COUNT;
      showFrame(row, frame, state);
    }, FRAME_MS);
  }

  function start() {
    if (stateTimer !== null) window.clearTimeout(stateTimer);
    var vpnOn = badge.getAttribute('data-vpn') === '1';
    if (vpnOn) {
      play(IDLE_ROW, 'idle');
      return;
    }

    play(SAD_ROW, 'sad');
    stateTimer = window.setTimeout(function () {
      play(HACKER_ROW, 'hack');
    }, 2000);
  }

  start();
  badge.setAttribute('tabindex', '0');
  badge.setAttribute('aria-label', 'Replay VPN kitty animation');
  badge.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    start();
  });
  badge.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    start();
  });

  window.addEventListener('pagehide', function () {
    if (frameTimer !== null) window.clearInterval(frameTimer);
    if (stateTimer !== null) window.clearTimeout(stateTimer);
  }, { once: true });
})();
