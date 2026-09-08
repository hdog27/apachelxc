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

  // Autoplay the featured project demo wherever browser policy permits.
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
      var tryPlay=function(){
        var p=video.play();
        if(p&&p.catch)p.catch(function(){});
      };
      if(video.readyState>=2) tryPlay();
      else video.addEventListener('canplay',tryPlay,{once:true});
      document.addEventListener('visibilitychange',function(){
        if(!document.hidden)tryPlay();
      });
    }
  }catch(e){}
})();
