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
  var NO_VPN_BODY_ROW = 4;
  var SAD_ROW = 8;
  var HACKER_ROW = 9;
  var SPRITE_URL = '/images/kitty-custom-v2.png';

  var cat = document.createElement('div');
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
  cat.style.setProperty('position', 'relative', 'important');
  cat.style.setProperty('overflow', 'visible', 'important');
  cat.style.setProperty('image-rendering', 'pixelated', 'important');

  function makeLayer(className) {
    var layer = document.createElement('span');
    layer.className = className;
    layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('display', 'block', 'important');
    layer.style.setProperty('position', 'absolute', 'important');
    layer.style.setProperty('inset', '0', 'important');
    layer.style.setProperty('width', DISPLAY_SIZE + 'px', 'important');
    layer.style.setProperty('height', DISPLAY_SIZE + 'px', 'important');
    layer.style.setProperty('background-image', 'url("' + SPRITE_URL + '")', 'important');
    layer.style.setProperty('background-repeat', 'no-repeat', 'important');
    layer.style.setProperty('background-size', (256 * SCALE) + 'px ' + (320 * SCALE) + 'px', 'important');
    layer.style.setProperty('image-rendering', 'pixelated', 'important');
    return layer;
  }

  var bodyLayer = makeLayer('vpn-kitty-body');
  var effectLayer = makeLayer('vpn-kitty-effect');
  cat.appendChild(bodyLayer);
  cat.appendChild(effectLayer);

  function makeTear(left) {
    var tear = document.createElement('span');
    tear.setAttribute('aria-hidden', 'true');
    tear.style.setProperty('display', 'none', 'important');
    tear.style.setProperty('position', 'absolute', 'important');
    tear.style.setProperty('left', left + 'px', 'important');
      tear.style.setProperty('top', '25px', 'important');
      tear.style.setProperty('width', '3px', 'important');
      tear.style.setProperty('height', '7px', 'important');
    tear.style.setProperty('background', '#6ee7ff', 'important');
    tear.style.setProperty('box-shadow', '0 5px 0 #38bdf8', 'important');
    tear.style.setProperty('z-index', '3', 'important');
    return tear;
  }

  var tearLeft = makeTear(13);
  var tearRight = makeTear(32);
  cat.appendChild(tearLeft);
  cat.appendChild(tearRight);

  var laptop = document.createElement('span');
  laptop.setAttribute('aria-hidden', 'true');
  laptop.style.setProperty('display', 'none', 'important');
  laptop.style.setProperty('position', 'absolute', 'important');
  laptop.style.setProperty('left', '6px', 'important');
  laptop.style.setProperty('bottom', '-3px', 'important');
  laptop.style.setProperty('width', '36px', 'important');
  laptop.style.setProperty('height', '15px', 'important');
  laptop.style.setProperty('background', '#10152a', 'important');
  laptop.style.setProperty('border', '2px solid #8b5cf6', 'important');
  laptop.style.setProperty('box-sizing', 'border-box', 'important');
  laptop.style.setProperty('box-shadow', '0 3px 0 -1px #38bdf8', 'important');
  laptop.style.setProperty('z-index', '4', 'important');

  var terminalGlow = document.createElement('span');
  terminalGlow.setAttribute('aria-hidden', 'true');
  terminalGlow.style.setProperty('display', 'block', 'important');
  terminalGlow.style.setProperty('position', 'absolute', 'important');
  terminalGlow.style.setProperty('left', '5px', 'important');
  terminalGlow.style.setProperty('top', '3px', 'important');
  terminalGlow.style.setProperty('width', '14px', 'important');
  terminalGlow.style.setProperty('height', '2px', 'important');
  terminalGlow.style.setProperty('background', '#3dff77', 'important');
  terminalGlow.style.setProperty('box-shadow', '5px 5px 0 #c30189', 'important');
  laptop.appendChild(terminalGlow);
  cat.appendChild(laptop);

  wrap.insertBefore(cat, badge);

  var frameTimer = null;
  var stateTimer = null;

  function showLayerFrame(layer, row, frame) {
    layer.style.setProperty(
      'background-position',
      (-frame * DISPLAY_SIZE) + 'px ' + (-row * DISPLAY_SIZE) + 'px',
      'important'
    );
  }

  function showFrame(row, frame, state) {
    showLayerFrame(bodyLayer, state === 'idle' ? IDLE_ROW : NO_VPN_BODY_ROW, frame);
    showLayerFrame(effectLayer, row, frame);

    var sad = state === 'sad';
    var hack = state === 'hack';
    tearLeft.style.setProperty('display', sad ? 'block' : 'none', 'important');
    tearRight.style.setProperty('display', sad ? 'block' : 'none', 'important');
    laptop.style.setProperty('display', hack ? 'block' : 'none', 'important');
    laptop.style.setProperty('visibility', hack ? 'visible' : 'hidden', 'important');
    laptop.style.setProperty('opacity', hack ? '1' : '0', 'important');
    laptop.style.setProperty('transform', hack ? 'translateY(0)' : 'translateY(20px)', 'important');
    bodyLayer.style.setProperty('transform', hack ? 'translateY(-4px)' : 'none', 'important');

    if (sad) {
      var fall = (frame % 4) * 2;
      tearLeft.style.setProperty('transform', 'translateY(' + fall + 'px)', 'important');
      tearRight.style.setProperty('transform', 'translateY(' + ((fall + 3) % 8) + 'px)', 'important');
    }

    if (hack) terminalGlow.style.setProperty('opacity', frame % 2 ? '0.35' : '1', 'important');
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
