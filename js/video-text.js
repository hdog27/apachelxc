(function(){
  var title=document.querySelector('[data-video-title]');
  if(!title)return;
  var mask=title.querySelector('.metadata-video-title-mask');
  var video=mask&&mask.querySelector('video');
  if(!mask||!video)return;

  function buildMask(){
    var r=title.getBoundingClientRect();
    var w=Math.max(320,Math.round(r.width||700));
    var h=Math.max(64,Math.round(r.height||90));
    var fs=Math.max(28,Math.min(42,w*.058));
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+
      '<rect width="100%" height="100%" fill="black"/>'+
      '<text x="50%" y="52%" fill="white" text-anchor="middle" dominant-baseline="middle" '+
      'font-family="Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" '+
      'font-size="'+fs+'" font-weight="900" letter-spacing="-1.4">Metadata Security Lab</text></svg>';
    var url='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
    mask.style.webkitMaskImage=url;
    mask.style.maskImage=url;
  }

  function showVideo(){
    buildMask();
    mask.classList.add('is-ready');
    title.classList.add('has-video');
  }

  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){
    video.pause();
    return;
  }

  buildMask();
  if(video.readyState>=2)showVideo();
  else video.addEventListener('loadeddata',showVideo,{once:true});
  window.addEventListener('resize',buildMask,{passive:true});
})();