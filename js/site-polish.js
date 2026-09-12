(function(){
  // Load final cross-page polish stylesheet once.
  try{
    if(!document.querySelector('link[data-site-polish]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='/css/site-polish.css?v=8';
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

  // Move page-load / unique-visitor count near the top instead of burying it.
  try{
    var count=document.querySelector('.visit-counter');
    var hero=document.querySelector('.identity-hero');
    if(count&&hero){
      count.classList.add('visit-counter-top');
      hero.parentNode.insertBefore(count,hero.nextSibling);
    }
  }catch(e){}

  // NOTE: VPN kitty rendering intentionally lives only in /js/vpn-kitty.js.
  // Do not add another implementation here; multiple renderers were the cause
  // of the disappearing/glitching mascot.

  // Autoplay muted project demos wherever browser policy permits.
  try{
    var videos=Array.prototype.slice.call(document.querySelectorAll('video[data-autoplay-video]'));
    var tryPlay=function(video){
      var p=video.play();
      if(p&&p.catch)p.catch(function(){});
    };
    videos.forEach(function(video){
      video.muted=true;
      video.defaultMuted=true;
      video.autoplay=true;
      video.loop=true;
      video.playsInline=true;
      video.setAttribute('muted','');
      video.setAttribute('autoplay','');
      video.setAttribute('loop','');
      video.setAttribute('playsinline','');
      video.setAttribute('webkit-playsinline','');
      if(video.readyState>=2) tryPlay(video);
      else video.addEventListener('canplay',function(){tryPlay(video);},{once:true});
    });
    var tryAll=function(){videos.forEach(tryPlay);};
    document.addEventListener('visibilitychange',function(){
      if(!document.hidden)tryAll();
    });
    window.addEventListener('pageshow',tryAll);
    document.addEventListener('touchstart',tryAll,{once:true,passive:true});
    document.addEventListener('pointerdown',tryAll,{once:true,passive:true});
  }catch(e){}
})();
