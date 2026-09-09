// ==========================================================================
// main.js - shared client behaviour.
// Navigation is now real links (server-rendered active state), so no tab
// switching here. This handles the homelab rack hotspots and the projects
// README embeds; each block no-ops if its elements aren't on the page.
// ==========================================================================

// ---- Homelab rack hotspots -------------------------------------------------
document.querySelectorAll('.hotspot').forEach(function (spot) {
  function toggle(e) {
    e.stopPropagation();
    var wasOpen = spot.classList.contains('open');
    document.querySelectorAll('.hotspot.open').forEach(function (s) { s.classList.remove('open'); });
    if (!wasOpen) {
      spot.classList.add('open');
      var tip = spot.querySelector('.hotspot-tooltip');
      tip.style.left = '50%'; tip.style.right = 'auto'; tip.style.transform = 'translateX(-50%)';
      tip.style.bottom = '130%'; tip.style.top = 'auto';
      var rect = tip.getBoundingClientRect();
      var margin = 8;
      if (rect.left < margin) { tip.style.left = '0'; tip.style.transform = 'none'; }
      else if (rect.right > window.innerWidth - margin) { tip.style.left = 'auto'; tip.style.right = '0'; tip.style.transform = 'none'; }
      if (rect.top < margin) { tip.style.bottom = 'auto'; tip.style.top = '130%'; }
    }
  }
  spot.addEventListener('click', toggle);
  spot.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } });
});
document.addEventListener('click', function () {
  document.querySelectorAll('.hotspot.open').forEach(function (s) { s.classList.remove('open'); });
});

(function(){var w=document.querySelector(".hm-nav-wrap"),c=document.querySelector(".card"),n=document.querySelector(".top-nav");if(!w||!c||!n)return;function place(){if(window.matchMedia("(max-width:640px)").matches){if(w.parentNode!==c)c.insertBefore(w,c.firstChild);}else if(w.parentNode!==n){n.appendChild(w);}}place();window.addEventListener("resize",place);})();

(function(){var s=document.querySelector(".hm-nav-select");if(!s)return;function buzz(){if(navigator.vibrate)navigator.vibrate(8);}s.addEventListener("pointerdown",buzz);s.addEventListener("change",function(){if(navigator.vibrate)navigator.vibrate([6,18,10]);});})();

(function(){var b=document.querySelector(".hm-bar"),d=document.querySelector(".hm-drawer"),sc=document.querySelector(".hm-scrim");if(!b||!d)return;document.querySelectorAll(".top-nav .nav-btn").forEach(function(a){var c=a.cloneNode(true);c.className=a.classList.contains("active")?"active":"";d.appendChild(c);});function set(o){b.classList.toggle("open",o);d.classList.toggle("open",o);sc.classList.toggle("open",o);b.querySelector(".hm-burger").setAttribute("aria-expanded",o);}b.querySelector(".hm-burger").addEventListener("click",function(){set(!d.classList.contains("open"));});sc.addEventListener("click",function(){set(false);});document.addEventListener("keydown",function(e){if(e.key==="Escape")set(false);});})();
