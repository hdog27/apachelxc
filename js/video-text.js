(function () {
  var title = document.querySelector('[data-video-title]');
  if (!title) return;

  var words = Array.prototype.slice.call(
    title.querySelectorAll('[data-video-word]')
  );
  if (!words.length) return;

  function xml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function updateWordMask(word) {
    var label = word.getAttribute('data-video-word') || '';
    var mask = word.querySelector('.metadata-video-word-mask');
    if (!mask) return;

    var rect = word.getBoundingClientRect();
    var styles = window.getComputedStyle(word);
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));
    var fontSize = parseFloat(styles.fontSize) || 38;
    var fontWeight = styles.fontWeight || '700';
    var fontFamily = styles.fontFamily || 'sans-serif';
    var letterSpacing = styles.letterSpacing === 'normal' ? '0' : styles.letterSpacing;

    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height +
      "' viewBox='0 0 " + width + " " + height + "'>" +
      "<text x='50%' y='50%' fill='white' text-anchor='middle' dominant-baseline='middle' " +
      "font-size='" + fontSize + "px' font-weight='" + xml(fontWeight) + "' " +
      "font-family='" + xml(fontFamily) + "' letter-spacing='" + xml(letterSpacing) + "'>" +
      xml(label) + "</text></svg>";

    var url = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    mask.style.maskImage = url;
    mask.style.webkitMaskImage = url;
  }

  function setupWord(word, index) {
    var video = word.querySelector('video');
    if (!video) return;

    updateWordMask(word);

    function tuneVideo() {
      var offset = parseFloat(video.getAttribute('data-offset') || '0');
      video.defaultPlaybackRate = 0.45;
      video.playbackRate = 0.45;

      if (isFinite(video.duration) && video.duration > 0 && offset > 0) {
        try {
          video.currentTime = Math.min(offset, Math.max(0, video.duration - .25));
        } catch (e) {}
      }
    }

    function ready() {
      updateWordMask(word);
      tuneVideo();
      word.classList.add('is-ready');
    }

    video.addEventListener('loadedmetadata', tuneVideo, { once: true });

    if (video.readyState >= 2) ready();
    else video.addEventListener('loadeddata', ready, { once: true });
  }

  words.forEach(setupWord);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      words.forEach(updateWordMask);
    }, 80);
  }, { passive: true });
})();