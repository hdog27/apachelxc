(function(){
  // Load final cross-page polish stylesheet once.
  try{
    if(!document.querySelector('link[data-site-polish]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='/css/site-polish.css?v=4';
      l.setAttribute('data-site-polish','1');
      document.head.appendChild(l);
    }
  }catch(e){}

  // Remove redundant Cyber Lab copy called out in the mobile review.
  try{
    var explain=document.querySelector('.lab-intro-panel .lab-explain');
    if(explain) explain.remove();
    var locationNote=document.querySelector('.connection-panel .location-note');
    if(locationNote) locationNote.remove();
    var routeCopy=document.querySelector('.route-panel .section-copy p:last-child');
    if(routeCopy && !routeCopy.classList.contains('panel-label')) routeCopy.remove();
  }catch(e){}

  // Move page-load / unique-visitor count near the top instead of burying it
  // under the education/media section.
  try{
    var count=document.querySelector('.visit-counter');
    var hero=document.querySelector('.identity-hero');
    if(count&&hero){
      count.classList.add('visit-counter-top');
      hero.parentNode.insertBefore(count,hero.nextSibling);
    }
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

  // Autoplay the featured project demo wherever browser policy permits.
  // iOS requires muted + playsInline to be set as DOM properties before play().
  try{
    var video=document.querySelector('.project-featured video');
    if(video){
      video.muted=true;
      video.defaultMuted=true;
      video.autoplay=true;
      video.loop=true;
      video.playsInline=true;
      video.setAttribute('muted','');
      video.setAttribute('autoplay','');
      video.setAttribute('loop','');
      video.setAttribute('playsinline','');
      var tryPlay=function(){var p=video.play();if(p&&p.catch)p.catch(function(){});};
      if(video.readyState>=2) tryPlay();
      else video.addEventListener('canplay',tryPlay,{once:true});
      document.addEventListener('visibilitychange',function(){if(!document.hidden)tryPlay();});
    }
  }catch(e){}

  // Do not CSS-scale the already-rendered WebGL globe; that makes it soft.
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
