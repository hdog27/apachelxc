(function(){
  var box=document.getElementById('device-box'),
      L=document.getElementById('flank-l'), R=document.getElementById('flank-r');
  if(!box||!L||!R) return;
  var BAD=/hidden|unknown|not available|n\/a|undefined|null/i;
  function shortVer(v){ return v.replace(/(\d+\.\d+)[\d.]+/g,'$1'); }
  function build(){
    var txt=box.innerText||box.textContent||'', items=[], seen={};
    (txt.split('\n')[0]||'').split('|').forEach(function(seg){
      var s=seg.replace(/[^\x20-\x7E]/g,'').trim();
      if(!s||BAD.test(s)) return;
      var parts=s.split(/\s+/);
      if(parts.length<2) return;
      var label=parts.shift(), val=shortVer(parts.join(' '));
      if(val.length>16||seen[label]) return;
      seen[label]=1; items.push([label,val]);
    });
    var re=/([A-Za-z][A-Za-z0-9 ()\/]{1,18}):\s*([^|\n]+)/g, m;
    while((m=re.exec(txt))){
      var k=m[1].trim().replace(/\s*\(approx\)/i,''),
          v=m[2].trim().replace(/\s+/g,' ');
      if(/webrtc|screen|tz|timezone/i.test(k)) continue;
      if(BAD.test(v)||v.length>16||seen[k]) continue;
      seen[k]=1; items.push([k,shortVer(v)]);
    }
    if(!items.length) return;
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
})();
