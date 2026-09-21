(function () {
  var title = document.querySelector('[data-video-title]');
  if (!title) return;

  var mask = title.querySelector('.metadata-video-title-mask');
  var video = mask && mask.querySelector('video');
  if (!mask || !video) return;

  function updateSvgMask() {
    var rect = title.getBoundingClientRect();
    var width = Math.max(320, Math.round(rect.width || 700));
    var fontSize = Math.max(28, Math.min(42, width * 0.058));

    var svgMask =
      "<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>" +
      "<text x='50%' y='50%' font-size='" + fontSize + "px' font-weight='bold' " +
      "text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'>" +
      "Metadata Security Lab</text></svg>";

    var dataUrlMask = 'url("data:image/svg+xml,' + encodeURIComponent(svgMask) + '")';

    mask.style.maskImage = dataUrlMask;
    mask.style.webkitMaskImage = dataUrlMask;
    mask.style.maskSize = 'contain';
    mask.style.webkitMaskSize = 'contain';
    mask.style.maskRepeat = 'no-repeat';
    mask.style.webkitMaskRepeat = 'no-repeat';
    mask.style.maskPosition = 'center';
    mask.style.webkitMaskPosition = 'center';
  }

  function showVideoText() {
    updateSvgMask();
    mask.classList.add('is-ready');
    title.classList.add('has-video');
  }

  updateSvgMask();
  window.addEventListener('resize', updateSvgMask);

  if (video.readyState >= 2) {
    showVideoText();
  } else {
    video.addEventListener('loadeddata', showVideoText, { once: true });
  }
})();