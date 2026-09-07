(function(){
  // Load final cross-page polish stylesheet once.
  try{
    if(!document.querySelector('link[data-site-polish]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='/css/site-polish.css?v=1';
      l.setAttribute('data-site-polish','1');
      document.head.appendChild(l);
    }
  }catch(e){}

  // rtc.js used to skip creating the cat when a wrapper already existed.
  // Repair that state without disturbing the badge or fingerprint logic.
  try{
    var badge=document.querySelector('.vpn-badge[data-vpn]');
    if(badge){
      var wrap=badge.parentNode && badge.parentNode.classList && badge.parentNode.classList.contains('vpn-status-wrap') ? badge.parentNode : null;
      if(!wrap){
        wrap=document.createElement('div');
        wrap.className='vpn-status-wrap';
        badge.parentNode.insertBefore(wrap,badge);
        wrap.appendChild(badge);
      }
      if(!wrap.querySelector('.vpn-cat')){
        var cat=document.createElement('span');
        cat.className='vpn-cat '+(badge.getAttribute('data-vpn')==='1'?'vpn-cat-safe':'vpn-cat-risk');
        cat.setAttribute('aria-hidden','true');
        wrap.insertBefore(cat,badge);
      }
    }
  }catch(e){}

  // Distance-aware intro zoom. The globe code still controls the route/camera;
  // this only adjusts the first part of the visual scale and eases back to 1x.
  try{
    var overlay=document.getElementById('route-intro');
    var dataEl=document.getElementById('route-data');
    if(overlay&&dataEl){
      var d=JSON.parse(dataEl.textContent||'{}');
      var lat=Number(d.lat),lon=Number(d.lon);
      if(isFinite(lat)&&isFinite(lon)){
        var hlat=42.0,hlon=-71.5;
        function r(v){return v*Math.PI/180;}
        var a=r(lat),b=r(hlat),dl=r(hlon-lon);
        var c=Math.sin(a)*Math.sin(b)+Math.cos(a)*Math.cos(b)*Math.cos(dl);
        c=Math.max(-1,Math.min(1,c));
        var deg=Math.acos(c)*180/Math.PI;
        // Nearby = much tighter. Opposite side = only slightly tighter.
        var startScale=2.25-(Math.min(deg,180)/180)*.95;
        startScale=Math.max(1.30,Math.min(2.25,startScale));
        var canvases=overlay.querySelectorAll('canvas');
        for(var i=0;i<canvases.length;i++){
          canvases[i].style.transformOrigin='50% 50%';
          canvases[i].animate([
            {transform:'scale('+startScale.toFixed(3)+')',offset:0},
            {transform:'scale('+startScale.toFixed(3)+')',offset:.12},
            {transform:'scale(1)',offset:.34},
            {transform:'scale(1)',offset:1}
          ],{duration:4700,easing:'ease-in-out',fill:'both'});
        }
      }
    }
  }catch(e){}
})();
