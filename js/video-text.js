(function () {
  var title = document.querySelector('[data-video-title]');
  if (!title) return;

  var mask = title.querySelector('.metadata-video-title-mask');
  if (!mask) return;

  /*
   * Fixed SVG viewBox + textLength keeps the title proportional at every
   * viewport size. This avoids the mobile mask collapsing/cropping.
   */
  var svgMask =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 180' preserveAspectRatio='xMidYMid meet'>" +
    "<text x='600' y='92' fill='white' text-anchor='middle' dominant-baseline='middle' " +
    "font-family='Arial,sans-serif' font-size='118' font-weight='800' " +
    "textLength='1110' lengthAdjust='spacingAndGlyphs'>Metadata Security Lab</text></svg>";

  var dataUrlMask = 'url("data:image/svg+xml,' + encodeURIComponent(svgMask) + '")';

  mask.style.maskImage = dataUrlMask;
  mask.style.webkitMaskImage = dataUrlMask;
  mask.style.maskSize = 'contain';
  mask.style.webkitMaskSize = 'contain';
  mask.style.maskRepeat = 'no-repeat';
  mask.style.webkitMaskRepeat = 'no-repeat';
  mask.style.maskPosition = 'center';
  mask.style.webkitMaskPosition = 'center';

  mask.classList.add('is-ready');
  title.classList.add('has-video');
})();