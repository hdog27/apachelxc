(function(){
  'use strict';

  var badge=document.querySelector('.vpn-badge[data-vpn]');
  if(!badge) return;

  // These are native animated PNGs generated directly from the verified
  // 256x320 Aseprite export. Browser handles animation; JS never redraws frames.
  var IDLE='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACGFjVEwAAAAEAAAAAHzNZtAAAAAaZmNUTAAAAAAAAAAwAAAAMAAAAAAAAAAAAEUAyAAA8l87CAAAAW1JREFUeJztmLFOwzAQhu8QM6V7K4FUob4ESx+ApUsnhjAws/IQMDPQoRMLCxKMLH0JCkgMDBFiQDyBGUKCSW3Hdw0qUf5viRwnZzv339kXIgAAAAAAAAAAAACggKUvGGPMkhFmsR2fTamtTekgo8HQ2adZRG6z3+mqbW1IB/1vRHvAZnrx7fHb7DIaDJ3SqsL+8lqiXeWS0PTgZ87JTZypp/e3YP/r54coDlQecGEvJsQ8HS/dO727Vo/b+BhQSagcAxrm6f6vdu4FqYQa7wEsYN3UloVsds4WRETEzPRyslf5/OHVJfW2tlVjtcMDxhhjb2DJcZYkfLl/lbNdv9MtMl5MNlpbGt09f6TZ5KhotzaNRq20LKGc2OODC99GRpR5gShOQlExwMxct4R8tE5Cf7IPhChLh2i106iqDMzjwSWlqrrAVw9IdG/TeAmpdpxQgX///BB811VGSgPXprbfIYXBionU/Vum8RL6AhXfm9N6lkkAAAAAGmZjVEwAAAABAAAAGwAAABkAAAAKAAAAFwAXAMgAABntc3oAAAEnZmRBVAAAAAJ4nGNgoCNghDH+////H0OSkZERXYwUgGwmIyMjIxMlhpEKWGC2O6loYEj+////Pzm+g5kpyy+IIsaCrGjeTKivt0IoJxUNrMFLCCBbggwYsflsnh/C/KRNxHns9uuXeOUff3zPQN84I6QA2Zf4wOHnwRhiVdvWovBRghE9zsgBh5/bYrWQ7sE4ahlVAAu2kgMXUOi7ycDAwMDAyMjIcL9QjaD6uBVzGWT4BBgYGCAZnWXfnRsMDAyQ1JiUDsnAuJI7JeUy3VMjo6OyOtwb1Mhniv23GBZFJMP5yBmbYNlIKhg0mRpvFUNtgNIsgAUlOZaiBx8DAyQIH398D7GI3s0ClIyDr4lACGCrPB9/fI/SaMKaS8lpCmAD6O0XugYjAAxBhKbv6ysHAAAAGmZjVEwAAAADAAAAHgAAAAYAAAAJAAAAJABFAMgAAJihNJ4AAACoZmRBVAAAAAR4nMWRKw7CUBBFzyVoPh4SSBrSTWC6ADQKAaIayyJAI6hA1SBhA6wCDAKBJKxgMO1LIY+kFMFRM8l8MmcEYGYGEAUhydoAYI+X3vIEgCQu84G35ngbuniSbug0WgBcH3ckCaBuZhYFoSucxgIgGZl3aNZXiW6z7Y6sVZ7yI4LvVJehvzqzHc9cvjjsgFfVeled80l1GYo/Li7Ol8MfVT8BFz84g5OnFVQAAAAaZmNUTAAAAAUAAAAbAAAAGQAAAAoAAAAXABcAyAAAGbHS6QAAAUFmZEFUAAAABnicY2SAgv////9nQAOMjIyM6GKkAGQzGRkZGVlgAk4qGlgVk2MhzExZfkEUMSZyXEwuYEHmzJsJ9fVWCOWkooE1eAkBZB8hA0ZswTjPD2F+0ibiQvH265d45R9/fI/qM2wA2WJ84PDzYAyxqm1rUfh0jTOUYESPM3LA4ee2KHyY7x5/fE9fnw1fywimRmSg0HeTgYGBgYGRkZHhfqEaQfVxK+YyyPAJwPkD57OkdEgGxpW3KCyXGRgdldXhJlMj6Sv232JYFJEM5yNn7IHL1DBAbBGFDeDL1CwollAhGHEBWX5BOqfGfXduMDAwYK+pSQHowcfAgJo4Hn98zwBPy/////8PsxBbcBKq13DVZ48/vmdgYIC0QeibGpE5+Bo/sODGBbA1BR5/fI/SQsMaNuQ064jRQ9dgBABLEYxuTFXrswAAAABJRU5ErkJggg==';
  var SAD='data:image/png;base64,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';
  var HACK='data:image/png;base64,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';

  var wrap=badge.parentNode && badge.parentNode.classList &&
    badge.parentNode.classList.contains('vpn-status-wrap') ? badge.parentNode : null;

  if(!wrap){
    wrap=document.createElement('div');
    wrap.className='vpn-status-wrap';
    badge.parentNode.insertBefore(wrap,badge);
    wrap.appendChild(badge);
  }

  // One authoritative mascot. Remove every previous experiment.
  var old=wrap.querySelectorAll(
    '.vpn-cat,.vpn-cat-window,.vpn-kitty-host,.vpn-kitty-canvas-host,'+
    '[data-vpn-kitty],[data-vpn-kitty-frame]'
  );
  for(var i=0;i<old.length;i++) old[i].remove();

  wrap.style.setProperty('display','flex','important');
  wrap.style.setProperty('align-items','center','important');
  wrap.style.setProperty('justify-content','center','important');
  wrap.style.setProperty('gap','10px','important');
  wrap.style.setProperty('width','100%','important');
  wrap.style.setProperty('min-height','54px','important');
  wrap.style.setProperty('position','relative','important');
  wrap.style.setProperty('z-index','30','important');

  var cat=document.createElement('img');
  cat.className='vpn-kitty-native';
  cat.setAttribute('data-vpn-kitty','native-apng');
  cat.setAttribute('aria-hidden','true');
  cat.alt='';
  cat.draggable=false;
  cat.width=48;
  cat.height=48;

  // Lock dimensions against global .card img rules.
  cat.style.setProperty('display','block','important');
  cat.style.setProperty('width','48px','important');
  cat.style.setProperty('height','48px','important');
  cat.style.setProperty('min-width','48px','important');
  cat.style.setProperty('min-height','48px','important');
  cat.style.setProperty('max-width','48px','important');
  cat.style.setProperty('max-height','48px','important');
  cat.style.setProperty('flex','0 0 48px','important');
  cat.style.setProperty('object-fit','contain','important');
  cat.style.setProperty('margin','0','important');
  cat.style.setProperty('padding','0','important');
  cat.style.setProperty('border','0','important');
  cat.style.setProperty('opacity','1','important');
  cat.style.setProperty('visibility','visible','important');
  cat.style.setProperty('position','relative','important');
  cat.style.setProperty('z-index','31','important');
  cat.style.setProperty('image-rendering','pixelated','important');

  wrap.insertBefore(cat,badge);

  var vpnOn=badge.getAttribute('data-vpn')==='1';
  if(vpnOn){
    cat.src=IDLE;
    cat.dataset.kittyState='idle';
  }else{
    cat.src=SAD;
    cat.dataset.kittyState='sad';
    // 8 frames * 115 ms * 2 loops = 1840 ms.
    // One source switch only; hacker APNG then loops natively forever.
    window.setTimeout(function(){
      if(!cat.isConnected) return;
      cat.src=HACK;
      cat.dataset.kittyState='hack';
    },1840);
  }
})();
