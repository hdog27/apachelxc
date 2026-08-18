(function(){
  var k=document.querySelector('.hm-sneak'), d=document.querySelector('.hm-drawer');
  if(!k||!d) return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var x=0,busy=false,timer=null;
  function set(c){ k.className='hm-sneak '+c; }
  function move(px){ x=px; k.style.transform='translateX('+px+'px)'; }
  function idle(){ set('k-idle-r'); move(0); busy=false; }
  function stroll(){
    busy=true; set('k-walk-r'); k.style.transition='transform 1.1s linear'; move(16);
    setTimeout(function(){ set('k-walk-l'); move(0);
      setTimeout(function(){ k.style.transition=''; idle(); },1150); },1250);
  }
  function peek(){ busy=true; set('k-idle-l');
    setTimeout(function(){ set('k-idle-r'); busy=false; },2600); }
  function hop(){
    busy=true; set('k-jump-r'); k.style.transition='transform .28s ease-out';
    k.style.transform='translateX('+x+'px) translateY(-13px)';
    setTimeout(function(){ set('k-fall-r'); k.style.transition='transform .3s ease-in';
      k.style.transform='translateX('+x+'px)';
      setTimeout(function(){ k.style.transition=''; idle(); },320); },300);
  }
  var acts=[peek,peek,stroll,hop,peek,stroll];
  function loop(){
    timer=setTimeout(function(){
      if(d.classList.contains('open')&&!busy) acts[Math.floor(Math.random()*acts.length)]();
      loop();
    }, 6000+Math.random()*9000);
  }
  new MutationObserver(function(){
    if(d.classList.contains('open')){ idle(); }
    else { clearTimeout(timer); k.style.transition=''; idle(); loop(); }
  }).observe(d,{attributes:true,attributeFilter:['class']});
  idle(); loop();
})();

(function(){var r=document.querySelector(".hm-runner"),d=document.querySelector(".hm-drawer");if(!r)return;if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.addEventListener("click",function(e){var a=e.target.closest("a");if(!a)return;if(a.target==="_blank")return;var h=a.getAttribute("href")||"";if(!h||h.charAt(0)==="#"||h.indexOf(":")>-1)return;if(a.hostname&&a.hostname!==location.hostname)return;if(a.pathname===location.pathname)return;try{sessionStorage.setItem("kittyRun","1")}catch(x){}},true);try{if(sessionStorage.getItem("kittyRun")){sessionStorage.removeItem("kittyRun");setTimeout(function(){r.classList.add("run");setTimeout(function(){r.classList.remove("run")},1850)},120);}}catch(x){}})();

(function(){
  var d=document.querySelector(".hm-drawer"),
      k=document.querySelector(".hm-sneak"),
      c=document.querySelector(".hm-deskcat");
  function ready(el){
    el.style.pointerEvents="auto";
    el.style.cursor="pointer";
    el.style.webkitTapHighlightColor="transparent";
    el.style.outline="none";
  }
  function jump(el,row){
    if(!el||el.dataset.jumping)return;
    el.dataset.jumping="1";
    var anim=el.style.animation, posY=el.style.backgroundPositionY;
    el.style.animation="none";
    el.style.backgroundPositionY=row;
    el.style.backgroundPositionX="0px";
    el.style.transition="transform .26s ease-out";
    el.style.transform="translateY(-15px)";
    setTimeout(function(){
      el.style.transition="transform .3s ease-in";
      el.style.transform="";
      setTimeout(function(){
        el.style.transition="";
        el.style.backgroundPositionY=posY;
        el.style.backgroundPositionX="";
        el.style.animation=anim;
        delete el.dataset.jumping;
      },310);
    },270);
  }
  if(k){
    ready(k);
    k.addEventListener("click",function(){jump(k,"-128px");});
    if(d){new MutationObserver(function(){
      if(d.classList.contains("open"))setTimeout(function(){jump(k,"-128px");},430);
    }).observe(d,{attributes:true,attributeFilter:["class"]});}
  }
  if(c){
    ready(c);
    c.addEventListener("click",function(){jump(c,"-108px");});
  }
})();

(function(){var bar=document.querySelector(".hm-bar"),r=document.querySelector(".hm-runner");
if(!bar||!r)return;
if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
new MutationObserver(function(){
 if(!r.classList.contains("run"))return;
 var t0=performance.now(),vw=document.documentElement.clientWidth,n=0;
 var iv=setInterval(function(){
  var el=performance.now()-t0;
  if(el>1700){clearInterval(iv);return;}
  var x=-56+(vw+60)*(el/1700)+18;
  var p=document.createElement("span");
  p.className="hm-paw";
  p.style.left=x+"px";
  p.style.top=(n%2?"58%":"70%");
  p.style.setProperty("--r",(n%2?-14:12)+"deg");
  bar.appendChild(p);
  setTimeout(function(){p.remove();},1300);
  n++;
 },130);
}).observe(r,{attributes:true,attributeFilter:["class"]});
})();

(function(){var c=document.querySelector(".hm-deskcat");if(!c)return;
if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var R={idleR:"0px",walkR:"-54px",jumpR:"-108px",fallR:"-162px",idleL:"-216px",walkL:"-270px"};
var busy=false;
function setRow(y,frames,dur){c.style.backgroundPositionY=y;c.style.animation=(frames===8?"dkIdle "+dur+"s steps(8) infinite":"dk"+frames+" "+dur+"s steps("+frames+") infinite");}
function idle(dir){busy=false;c.style.animation="";c.style.backgroundPositionY=dir==="l"?R.idleL:R.idleR;c.style.animation="dkIdle .95s steps(8) infinite";}
function hop(){if(busy)return;busy=true;c.style.animation="none";c.style.backgroundPositionY=R.jumpR;c.style.backgroundPositionX="0px";c.style.transition="transform .3s cubic-bezier(.3,-0.4,.6,1)";c.style.transform="translateY(-18px)";
setTimeout(function(){c.style.backgroundPositionY=R.fallR;c.style.transition="transform .32s cubic-bezier(.4,0,.7,1.3)";c.style.transform="";setTimeout(function(){c.style.transition="";c.style.backgroundPositionX="";idle("r");},330);},310);}
function turn(){if(busy)return;busy=true;idle("l");setTimeout(function(){idle("r");},2400);}
function pace(){if(busy)return;busy=true;c.style.animation="none";c.style.backgroundPositionY=R.walkL;c.style.animation="dk4 .5s steps(4) infinite";c.style.transition="transform 1s linear";c.style.transform="translateX(-26px)";
setTimeout(function(){c.style.backgroundPositionY=R.walkR;c.style.transform="";setTimeout(function(){c.style.transition="";idle("r");},1050);},1050);}
var acts=[hop,turn,pace,turn,hop,turn];
(function loop(){setTimeout(function(){if(!busy)acts[Math.floor(Math.random()*acts.length)]();loop();},5000+Math.random()*7000);})();
c.addEventListener("click",function(){busy=false;hop();});
})();
