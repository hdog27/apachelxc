(function(){
  var link=document.querySelector('a[href="https://google.com"]');
  if(!link) return;
  link.addEventListener('click',function(e){
    e.preventDefault();
    var o=document.createElement('div');
    o.className='ld-overlay';
    o.innerHTML='<div class="ld-box" role="dialog" aria-modal="true">'+
      '<h3>Gotcha.</h3>'+
      '<p>That link said <b>Instagram</b>. It actually pointed at <code>google.com</code>.</p>'+
      '<p>Nothing happened, and nothing was sent anywhere. But that is exactly how phishing links work: the text you read and the address you go to are two different things.</p>'+
      '<p class="ld-tip">On a computer, hover a link and check the address in the bottom corner. On a phone, press and hold it. Do that before you tap anything that arrives by text or email.</p>'+
      '<button class="ld-close">Got it</button></div>';
    document.body.appendChild(o);
    function shut(){o.remove();document.removeEventListener('keydown',key);}
    function key(ev){if(ev.key==='Escape')shut();}
    o.querySelector('.ld-close').addEventListener('click',shut);
    o.addEventListener('click',function(ev){if(ev.target===o)shut();});
    document.addEventListener('keydown',key);
    o.querySelector('.ld-close').focus();
  });
})();
