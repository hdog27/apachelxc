(function(){
  // route-globe.js creates its texture with `new Image()` and points it at the
  // older 2048px Blue Marble asset. Intercept only that exact assignment and
  // substitute a public-domain NASA 8192x4096 texture. Everything else using
  // Image on the site behaves normally.
  try {
    var NativeImage = window.Image;
    function HmaxImage(width, height) {
      var img = new NativeImage(width, height);
      var proto = Object.getPrototypeOf(img);
      var desc = Object.getOwnPropertyDescriptor(proto, 'src');
      if (!desc || !desc.set || !desc.get) return img;

      Object.defineProperty(img, 'src', {
        configurable: true,
        enumerable: true,
        get: function(){ return desc.get.call(img); },
        set: function(value){
          var v = String(value || '');
          if (v.indexOf('Land_shallow_topo_2048.jpg') !== -1) {
            v = 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Nasa_land_ocean_ice_8192.jpg';
          }
          desc.set.call(img, v);
        }
      });
      return img;
    }
    HmaxImage.prototype = NativeImage.prototype;
    window.Image = HmaxImage;
  } catch (e) {}
})();
