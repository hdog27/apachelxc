(function(){
  // Load final cross-page polish stylesheet once.
  try{
    if(!document.querySelector('link[data-site-polish]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='/css/site-polish.css?v=2';
      l.setAttribute('data-site-polish','1');
      document.head.appendChild(l);
    }
  }catch(e){}

  // Remove the redundant explanatory line under the Metadata Security Lab.
  try{
    var explain=document.querySelector('.lab-intro-panel .lab-explain');
    if(explain) explain.remove();
  }catch(e){}

  // Deterministic VPN kitty. Do not rely on competing CSS animations for the
  // sprite coordinates; advance the 8 frames directly instead.
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

      var old=wrap.querySelector('.vpn-cat');
      if(old) old.remove();

      var cat=document.createElement('span');
      cat.className='vpn-cat vpn-cat-manual';
      cat.setAttribute('aria-hidden','true');
      cat.style.display='inline-block';
      cat.style.width='48px';
      cat.style.height='48px';
      cat.style.flex='0 0 48px';
      cat.style.backgroundImage="url('/images/kitty-custom-v2.png?v=2')";
      cat.style.backgroundRepeat='no-repeat';
      cat.style.backgroundSize='384px 480px';
      cat.style.backgroundPosition='0 0';
      cat.style.imageRendering='pixelated';
      cat.style.position='relative';
      cat.style.zIndex='8';
      wrap.insertBefore(cat,badge);

      var vpnOn=badge.getAttribute('data-vpn')==='1';
      var frame=0;
      var phase=vpnOn?'idle':'cry';
      var cryLoops=0;
      var lastFrame=0;

      function rowY(){
        if(phase==='cry') return -384;
        if(phase==='hack') return -432;
        return 0;
      }
      function animateCat(now){
        if(!cat.isConnected) return;
        if(!lastFrame || now-lastFrame>=105){
          lastFrame=now;
          cat.style.backgroundPosition=(-frame*48)+'px '+rowY()+'px';
          frame++;
          if(frame>=8){
            frame=0;
            if(phase==='cry'){
              cryLoops++;
              if(cryLoops>=2) phase='hack';
            }
          }
        }
        requestAnimationFrame(animateCat);
      }
      requestAnimationFrame(animateCat);
    }
  }catch(e){}

  // The previous distance-aware pass CSS-scaled the already-rendered WebGL
  // canvases, which made the Earth look soft/pixelated. Undo any such transform;
  // route-globe.js renders its own zoom natively at device resolution.
  try{
    var overlay=document.getElementById('route-intro');
    if(overlay){
      var canvases=overlay.querySelectorAll('canvas');
      for(var i=0;i<canvases.length;i++){
        canvases[i].getAnimations().forEach(function(a){a.cancel();});
        canvases[i].style.transform='none';
      }
    }
  }catch(e){}
})();
