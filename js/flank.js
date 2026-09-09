(function(){
  var box=document.getElementById('device-box'),
      L=document.getElementById('flank-l'), R=document.getElementById('flank-r');
  if(!box||!L||!R) return;

  var extraStorage=null;

  function clean(v){
    return String(v==null?'':v).replace(/\s+/g,' ').trim();
  }

  function shortGpu(v){
    v=clean(v);
    var m=v.match(/(?:NVIDIA\s+)?(?:GeForce\s+)?((?:RTX|GTX)\s*\d{3,4}(?:\s*Ti|\s*SUPER)?)/i);
    if(m) return m[1].replace(/\s+/g,' ');
    m=v.match(/(Radeon\s+(?:RX\s*)?\d{3,4}\w*)/i);
    if(m) return m[1];
    m=v.match(/(Intel(?:\(R\))?\s+(?:Iris|UHD|HD)[^,;)]+)/i);
    if(m) return clean(m[1]).replace(/\(R\)/gi,'');
    if(/apple/i.test(v) && /gpu/i.test(v)) return 'Apple GPU';
    return '';
  }

  function shortZone(){
    try{
      var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
      var p=z.split('/').pop().replace(/_/g,' ');
      return p.length<=14?p:'';
    }catch(e){ return ''; }
  }

  function osName(){
    var ua=navigator.userAgent||'';
    if(/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if(/Android/i.test(ua)) return 'Android';
    if(/Windows/i.test(ua)) return 'Windows';
    if(/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
    if(/Linux/i.test(ua)) return 'Linux';
    return '';
  }

  function storageQuota(){
    if(!extraStorage) return '';
    var gb=extraStorage/1073741824;
    if(gb>=10) return Math.round(gb)+' GB';
    if(gb>=1) return gb.toFixed(1).replace(/\.0$/,'')+' GB';
    var mb=extraStorage/1048576;
    return mb>=1?Math.round(mb)+' MB':'';
  }

  function add(items,seen,label,value){
    value=clean(value);
    if(!value||/hidden|unknown|unavailable|not reported|none exposed|n\/a/i.test(value)) return;
    if(value.length>18||seen[label]) return;
    seen[label]=1;
    items.push([label,value]);
  }

  function build(){
    var txt=box.innerText||box.textContent||'', items=[], seen={};

    add(items,seen,'CPU THREADS',navigator.hardwareConcurrency?String(navigator.hardwareConcurrency):'');
    add(items,seen,'RAM EST.',navigator.deviceMemory?(navigator.deviceMemory+' GB'):'');

    var gpuMatch=txt.match(/GPU:\s*([^\n]+)/i);
    add(items,seen,'GPU',gpuMatch?shortGpu(gpuMatch[1]):'');

    add(items,seen,'SCREEN',screen.width+'×'+screen.height);
    add(items,seen,'TIME ZONE',shortZone());
    add(items,seen,'WEB QUOTA',storageQuota());
    add(items,seen,'OS',osName());

    if(navigator.maxTouchPoints>0) add(items,seen,'TOUCH',navigator.maxTouchPoints+' pt');

    L.innerHTML=''; R.innerHTML='';
    items.slice(0,6).forEach(function(p,i){
      var d=document.createElement('div'), b=document.createElement('b');
      d.className='flank-item';
      b.textContent=p[0];
      d.appendChild(b);
      d.appendChild(document.createTextNode(p[1]));
      (i%2?R:L).appendChild(d);
    });
  }

  build();
  new MutationObserver(build).observe(box,{childList:true,subtree:true,characterData:true});

  if(navigator.storage&&navigator.storage.estimate){
    navigator.storage.estimate().then(function(x){
      if(x&&x.quota){ extraStorage=x.quota; build(); }
    }).catch(function(){});
  }
})();

// Load the Cyber Lab teaching interactions after the core page scripts.
// Kept separate from rtc.js so the existing telemetry path is unchanged.
(function(){
  if(document.querySelector('script[data-cyberlab-interactions]')) return;
  var s=document.createElement('script');
  s.src='/js/cyberlab-interactions.js?v=1';
  s.defer=true;
  s.setAttribute('data-cyberlab-interactions','1');
  document.head.appendChild(s);
})();
