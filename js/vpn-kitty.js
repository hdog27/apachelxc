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

  var originalParent = wrap.parentNode;
  var originalNextSibling = wrap.nextSibling;
  var bannerRow = document.querySelector('.lab-intro-panel .banner-row');
  var mobileQuery = window.matchMedia('(max-width: 700px)');

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
  var DESKTOP_DISPLAY_SIZE = 48;
  var MOBILE_DISPLAY_SIZE = 64;
  var displaySize = mobileQuery.matches ? MOBILE_DISPLAY_SIZE : DESKTOP_DISPLAY_SIZE;
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
  cat.style.setProperty('margin', '0', 'important');
  cat.style.setProperty('padding', '0', 'important');
  cat.style.setProperty('border', '0', 'important');
  cat.style.setProperty('overflow', 'hidden', 'important');
  cat.style.setProperty('background-repeat', 'no-repeat', 'important');
  cat.style.setProperty('image-rendering', 'pixelated', 'important');
  wrap.insertBefore(cat, badge);

  var frameTimer = null;
  var stateTimer = null;
  var currentRow = SAD_ROW;
  var currentFrame = 0;
  var currentState = 'loading';

  function setCatSize() {
    cat.style.setProperty('width', displaySize + 'px', 'important');
    cat.style.setProperty('height', displaySize + 'px', 'important');
    cat.style.setProperty('min-width', displaySize + 'px', 'important');
    cat.style.setProperty('min-height', displaySize + 'px', 'important');
    cat.style.setProperty('max-width', displaySize + 'px', 'important');
    cat.style.setProperty('max-height', displaySize + 'px', 'important');
    cat.style.setProperty('flex', '0 0 ' + displaySize + 'px', 'important');
  }

  function applyResponsiveLayout() {
    var mobile = mobileQuery.matches;
    displaySize = mobile ? MOBILE_DISPLAY_SIZE : DESKTOP_DISPLAY_SIZE;
    setCatSize();

    if (mobile && bannerRow) {
      bannerRow.parentNode.insertBefore(wrap, bannerRow.nextSibling);
      wrap.setAttribute('data-kitty-placement', 'mobile-hero');
      wrap.style.setProperty('gap', '12px', 'important');
      wrap.style.setProperty('width', 'calc(100% - 20px)', 'important');
      wrap.style.setProperty('max-width', '280px', 'important');
      wrap.style.setProperty('min-height', '80px', 'important');
      wrap.style.setProperty('margin', '12px auto 4px', 'important');
      wrap.style.setProperty('padding', '8px 12px', 'important');
      wrap.style.setProperty('box-sizing', 'border-box', 'important');
      wrap.style.setProperty('border', '1px solid rgba(78, 226, 255, 0.24)', 'important');
      wrap.style.setProperty('border-radius', '14px', 'important');
      wrap.style.setProperty('background', 'rgba(4, 15, 30, 0.76)', 'important');
      wrap.style.setProperty('box-shadow', '0 10px 28px rgba(0, 0, 0, 0.28)', 'important');
      return;
    }

    if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
      originalParent.insertBefore(wrap, originalNextSibling);
    } else {
      originalParent.appendChild(wrap);
    }
    wrap.removeAttribute('data-kitty-placement');
    wrap.style.setProperty('gap', '10px', 'important');
    wrap.style.setProperty('width', '100%', 'important');
    wrap.style.setProperty('max-width', 'none', 'important');
    wrap.style.setProperty('min-height', '54px', 'important');
    wrap.style.setProperty('margin', '0', 'important');
    wrap.style.setProperty('padding', '0', 'important');
    wrap.style.setProperty('border', '0', 'important');
    wrap.style.setProperty('border-radius', '0', 'important');
    wrap.style.setProperty('background', 'transparent', 'important');
    wrap.style.setProperty('box-shadow', 'none', 'important');
  }

  function showFrame(row, frame, state) {
    var idle = state === 'idle';
    var scale = displaySize / FRAME_SIZE;
    cat.style.setProperty(
      'background-image',
      'url("' + (idle ? IDLE_SPRITE_URL : STATUS_SPRITE_URL) + '")',
      'important'
    );
    cat.style.setProperty(
      'background-size',
      (256 * scale) + 'px ' + ((idle ? 320 : 64) * scale) + 'px',
      'important'
    );
    cat.style.setProperty(
      'background-position',
      (-frame * displaySize) + 'px ' + (-row * displaySize) + 'px',
      'important'
    );
  }

  function play(row, state) {
    if (frameTimer !== null) window.clearInterval(frameTimer);
    var frame = 0;
    currentRow = row;
    currentFrame = frame;
    currentState = state;
    cat.setAttribute('data-kitty-state', state);
    showFrame(row, frame, state);
    frameTimer = window.setInterval(function () {
      frame = (frame + 1) % FRAME_COUNT;
      currentFrame = frame;
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

  applyResponsiveLayout();
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

  function handleViewportChange() {
    applyResponsiveLayout();
    showFrame(currentRow, currentFrame, currentState);
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  window.addEventListener('pagehide', function () {
    if (frameTimer !== null) window.clearInterval(frameTimer);
    if (stateTimer !== null) window.clearTimeout(stateTimer);
    if (mobileQuery.removeEventListener) {
      mobileQuery.removeEventListener('change', handleViewportChange);
    } else {
      mobileQuery.removeListener(handleViewportChange);
    }
  }, { once: true });
})();
