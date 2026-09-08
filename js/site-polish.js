(function(){
  // Load final cross-page polish stylesheet once.
  try{
    if(!document.querySelector('link[data-site-polish]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='/css/site-polish.css?v=7';
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

  // -----------------------------------------------------------------------
  // VPN kitty renderer.
  //
  // IMPORTANT: this uses ONE persistent canvas and ONE persistent sprite image.
  // We never swap <img src>, never CSS-crop the sheet, and never recreate the
  // element per frame. That avoids the repaint/decode flicker seen on Safari.
  //
  // Verified sheet layout:
  //   256x320 total
  //   32x32 frames
  //   idle        row y=0
  //   sad_cry     row y=256
  //   hacker_type row y=288
  // -----------------------------------------------------------------------
  try{
    var badge=document.querySelector('.vpn-badge[data-vpn]');
    if(badge){
      var wrap=badge.parentNode && badge.parentNode.classList &&
        badge.parentNode.classList.contains('vpn-status-wrap') ? badge.parentNode : null;

      if(!wrap){
        wrap=document.createElement('div');
        wrap.className='vpn-status-wrap';
        badge.parentNode.insertBefore(wrap,badge);
        wrap.appendChild(badge);
      }

      // Remove every old kitty implementation from earlier attempts.
      var legacy=wrap.querySelectorAll(
        '.vpn-cat,.vpn-cat-window,.vpn-kitty-host,[data-vpn-kitty],[data-vpn-kitty-frame]'
      );
      for(var i=0;i<legacy.length;i++) legacy[i].remove();

      wrap.style.setProperty('display','flex','important');
      wrap.style.setProperty('align-items','center','important');
      wrap.style.setProperty('justify-content','center','important');
      wrap.style.setProperty('gap','10px','important');
      wrap.style.setProperty('width','100%','important');
      wrap.style.setProperty('min-height','54px','important');
      wrap.style.setProperty('margin-top','8px','important');
      wrap.style.setProperty('position','relative','important');
      wrap.style.setProperty('z-index','20','important');

      var host=document.createElement('span');
      host.className='vpn-kitty-canvas-host';
      host.setAttribute('data-vpn-kitty','1');
      host.setAttribute('aria-hidden','true');
      host.dataset.kittyStatus='initializing';
      host.style.setProperty('display','inline-flex','important');
      host.style.setProperty('align-items','center','important');
      host.style.setProperty('justify-content','center','important');
      host.style.setProperty('width','48px','important');
      host.style.setProperty('height','48px','important');
      host.style.setProperty('min-width','48px','important');
      host.style.setProperty('min-height','48px','important');
      host.style.setProperty('flex','0 0 48px','important');
      host.style.setProperty('position','relative','important');
      host.style.setProperty('overflow','visible','important');
      host.style.setProperty('z-index','21','important');

      var canvas=document.createElement('canvas');
      canvas.className='vpn-kitty-canvas';
      canvas.setAttribute('data-vpn-kitty-frame','1');
      canvas.style.setProperty('display','block','important');
      canvas.style.setProperty('width','48px','important');
      canvas.style.setProperty('height','48px','important');
      canvas.style.setProperty('min-width','48px','important');
      canvas.style.setProperty('min-height','48px','important');
      canvas.style.setProperty('max-width','48px','important');
      canvas.style.setProperty('max-height','48px','important');
      canvas.style.setProperty('margin','0','important');
      canvas.style.setProperty('padding','0','important');
      canvas.style.setProperty('border','0','important');
      canvas.style.setProperty('opacity','1','important');
      canvas.style.setProperty('visibility','visible','important');
      canvas.style.setProperty('image-rendering','pixelated','important');

      // Use DPR backing resolution while keeping the visible kitty 48 CSS px.
      var dpr=Math.max(1,Math.min(window.devicePixelRatio||1,3));
      canvas.width=Math.round(48*dpr);
      canvas.height=Math.round(48*dpr);

      var c=canvas.getContext('2d');
      c.imageSmoothingEnabled=false;
      c.webkitImageSmoothingEnabled=false;
      c.mozImageSmoothingEnabled=false;

      host.appendChild(canvas);
      wrap.insertBefore(host,badge);

      var sprite=new Image();
      sprite.decoding='sync';
      sprite.src='/images/kitty-custom-v2.png?v=canvas1';

      var vpnOn=badge.getAttribute('data-vpn')==='1';
      var phase=vpnOn?'idle':'sad';
      var frame=0;
      var sadLoops=0;
      var last=0;
      var running=false;

      function sourceY(){
        if(phase==='sad') return 256;
        if(phase==='hack') return 288;
        return 0;
      }

      function drawFrame(){
        if(!sprite.complete || !sprite.naturalWidth) return;
        c.setTransform(1,0,0,1,0,0);
        c.clearRect(0,0,canvas.width,canvas.height);
        c.imageSmoothingEnabled=false;
        c.drawImage(
          sprite,
          frame*32, sourceY(), 32, 32,
          0, 0, canvas.width, canvas.height
        );
      }

      function advance(now){
        if(!host.isConnected) return;
        if(!last || now-last>=115){
          last=now;
          drawFrame();
          frame++;
          if(frame>=8){
            frame=0;
            if(phase==='sad'){
              sadLoops++;
              if(sadLoops>=2) phase='hack';
            }
          }
        }
        requestAnimationFrame(advance);
      }

      function start(){
        if(running) return;
        running=true;
        host.dataset.kittyStatus='canvas-active';
        frame=0;
        drawFrame();

        if(window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          return;
        }
        requestAnimationFrame(advance);
      }

      sprite.onload=start;
      sprite.onerror=function(){
        host.dataset.kittyStatus='sprite-load-error';
        // Draw a visible fallback directly onto the same canvas.
        c.clearRect(0,0,canvas.width,canvas.height);
        c.fillStyle='#ff9492';
        c.font=Math.round(28*dpr)+'px sans-serif';
        c.textAlign='center';
        c.textBaseline='middle';
        c.fillText('🐱',canvas.width/2,canvas.height/2);
      };

      // Cached image may already be complete before onload assignment fires.
      if(sprite.complete && sprite.naturalWidth) start();
    }
  }catch(e){
    console.error('VPN kitty canvas init failed',e);
  }

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
