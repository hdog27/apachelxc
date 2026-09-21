(function () {
  var title = document.querySelector('[data-video-title]');
  if (!title) return;

  var mask = title.querySelector('.metadata-video-title-mask');
  var video = mask && mask.querySelector('video');
  if (!mask || !video) return;

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function updateMask() {
    var rect = title.getBoundingClientRect();
    var styles = window.getComputedStyle(title);
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));
    var fontSize = parseFloat(styles.fontSize) || 38;
    var fontWeight = styles.fontWeight || '700';
    var fontFamily = styles.fontFamily || 'sans-serif';

    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height +
      "' viewBox='0 0 " + width + " " + height + "'>" +
      "<text x='50%' y='50%' fill='white' text-anchor='middle' dominant-baseline='middle' " +
      "font-size='" + fontSize + "px' font-weight='" + escapeXml(fontWeight) + "' " +
      "font-family='" + escapeXml(fontFamily) + "'>Metadata Security Lab</text></svg>";

    var url = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    mask.style.maskImage = url;
    mask.style.webkitMaskImage = url;
  }

  function show() {
    updateMask();
    mask.classList.add('is-ready');
    title.classList.add('has-video');
  }

  function slowVideo() {
    video.defaultPlaybackRate = 0.30;
    video.playbackRate = 0.30;
  }

  updateMask();
  window.addEventListener('resize', updateMask, { passive: true });

  video.addEventListener('loadedmetadata', slowVideo, { once: true });
  if (video.readyState >= 1) slowVideo();

  if (video.readyState >= 2) show();
  else video.addEventListener('loadeddata', show, { once: true });
})();