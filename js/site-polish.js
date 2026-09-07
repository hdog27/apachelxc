(function(){
  // Load final cross-page polish stylesheet once.
  try{
    if(!document.querySelector('link[data-site-polish]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='/css/site-polish.css?v=5';
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

  // Custom VPN kitty: use a real <img> inside an overflow-hidden 48x48 window.
  // This avoids the Safari/background-position issue that made the custom
  // Aseprite sheet disappear. The uploaded sheet is 256x320, 32px frames:
  // sad_cry y=256, hacker_type y=288. It is rendered at 1.5x (48px frames).
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

      wrap.style.display='flex';
      wrap.style.alignItems='center';
      wrap.style.justifyContent='center';
      wrap.style.gap='10px';
      wrap.style.width='100%';
      wrap.style.minHeight='52px';
      wrap.style.marginTop='8px';
      wrap.style.position='relative';
      wrap.style.zIndex='7';

      var oldCats=wrap.querySelectorAll('.vpn-cat,.vpn-cat-window');
      for(var oc=0;oc<oldCats.length;oc++) oldCats[oc].remove();

      var viewport=document.createElement('span');
      viewport.className='vpn-cat-window';
      viewport.setAttribute('aria-hidden','true');
      viewport.style.display='inline-block';
      viewport.style.width='48px';
      viewport.style.height='48px';
      viewport.style.flex='0 0 48px';
      viewport.style.position='relative';
      viewport.style.overflow='hidden';
      viewport.style.zIndex='8';

      var sheet=document.createElement('img');
      sheet.alt='';
      sheet.draggable=false;
      sheet.src='/images/kitty-custom-v2.png?v=5';
      sheet.style.position='absolute';
      sheet.style.left='0';
      sheet.style.top='0';
      sheet.style.width='384px';
      sheet.style.height='480px';
      sheet.style.maxWidth='none';
      sheet.style.maxHeight='none';
      sheet.style.margin='0';
      sheet.style.padding='0';
      sheet.style.border='0';
      sheet.style.imageRendering='pixelated';
      sheet.style.transform='translate3d(0,0,0)';
      sheet.style.willChange='transform';

      viewport.appendChild(sheet);
      wrap.insertBefore(viewport,badge);

      var vpnOn=badge.getAttribute('data-vpn')==='1';
      var frame=0;
      var phase=vpnOn?'idle':'cry';
      var cryLoops=0;
      var lastFrame=0;
      var raf=0;

      function rowPx(){
        if(phase==='cry') return 384;   // 256 * 1.5
        if(phase==='hack') return 432;  // 288 * 1.5
        return 0;
      }
      function paint(){
        sheet.style.transform='translate3d('+(-frame*48)+'px,'+(-rowPx())+'px,0)';
      }
      function animateCat(now){
        if(!viewport.isConnected) return;
        if(!lastFrame || now-lastFrame>=105){
          lastFrame=now;
          paint();
          frame++;
          if(frame>=8){
            frame=0;
            if(phase==='cry'){
              cryLoops++;
              if(cryLoops>=2) phase='hack';
            }
          }
        }
        raf=requestAnimationFrame(animateCat);
      }

      sheet.addEventListener('load',function(){
        paint();
        if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if(!raf) raf=requestAnimationFrame(animateCat);
      },{once:true});

      // Visible fallback if the custom asset ever fails to load.
      sheet.addEventListener('error',function(){
        viewport.textContent='🐱';
        viewport.style.fontSize='34px';
        viewport.style.lineHeight='48px';
        viewport.style.textAlign='center';
      },{once:true});
    }
  }catch(e){}

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
      var tryPlay=function(){var p=video.play();if(p&&p.catch)p.catch(function(){});};
      if(video.readyState>=2) tryPlay();
      else video.addEventListener('canplay',tryPlay,{once:true});
      document.addEventListener('visibilitychange',function(){if(!document.hidden)tryPlay();});
    }
  }catch(e){}
})();
