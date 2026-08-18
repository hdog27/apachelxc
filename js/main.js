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

// ---- Projects: embed GitHub README -----------------------------------------
function loadRepoReadme(container) {
  var user = container.dataset.user;
  var repo = container.dataset.repo;
  var body = container.querySelector('.repo-embed-body');
  fetch('https://api.github.com/repos/' + user + '/' + repo + '/readme', { headers: { Accept: 'application/vnd.github.v3+json' } })
    .then(function (res) { if (!res.ok) throw new Error('not found'); return res.json(); })
    .then(function (data) {
      var raw = decodeURIComponent(escape(atob(data.content)));
      body.innerHTML = simpleMarkdown(raw);
    })
    .catch(function () {
      body.innerHTML = '<p>Could not load README right now, <a href="https://github.com/' + user + '/' + repo + '" target="_blank" rel="noopener">view it on GitHub</a>.</p>';
    });
}
function simpleMarkdown(md) {
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function safeUrl(u) { return /^https?:\/\//i.test(u) ? u : '#'; }
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, function (m, a, u) { return '<img src="' + safeUrl(u) + '" alt="' + a + '" loading="lazy">'; })
      .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, function (m, t, u) { return '<a href="' + safeUrl(u) + '" target="_blank" rel="noopener">' + t + '</a>'; })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
  var out = [], para = [], code = [], list = null, inCode = false, quote = false;
  function flush() { if (para.length) { var h = '<p>' + inline(para.join(' ')) + '</p>'; out.push(quote ? '<blockquote>' + h + '</blockquote>' : h); para = []; } quote = false; }
  function endList() { if (list) { out.push('</' + list + '>'); list = null; } }
  function startList(t) { if (list !== t) { endList(); out.push('<' + t + '>'); list = t; } }
  md.replace(/\r\n/g, '\n').split('\n').forEach(function (line) {
    if (/^\s*```/.test(line)) {
      if (inCode) { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = []; inCode = false; }
      else { flush(); endList(); inCode = true; }
      return;
    }
    if (inCode) { code.push(line); return; }
    if (!line.trim()) { flush(); endList(); return; }
    var h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flush(); endList(); out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>'); return; }
    var b = line.match(/^\s*[-*+]\s+(.*)$/);
    if (b) { flush(); startList('ul'); out.push('<li>' + inline(b[1]) + '</li>'); return; }
    var n = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (n) { flush(); startList('ol'); out.push('<li>' + inline(n[1]) + '</li>'); return; }
    var q = line.match(/^\s*>\s?(.*)$/);
    if (q) { if (!quote) flush(); quote = true; endList(); para.push(q[1].trim()); return; }
    if (/^\s*([-*_]\s*){3,}$/.test(line)) { flush(); endList(); out.push('<hr>'); return; }
    if (quote) flush();
    endList(); para.push(line.trim());
  });
  if (inCode && code.length) out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
  flush(); endList();
  return out.join('\n');
}
document.querySelectorAll('.repo-embed').forEach(loadRepoReadme);



(function(){var w=document.querySelector(".hm-nav-wrap"),c=document.querySelector(".card"),n=document.querySelector(".top-nav");if(!w||!c||!n)return;function place(){if(window.matchMedia("(max-width:640px)").matches){if(w.parentNode!==c)c.insertBefore(w,c.firstChild);}else if(w.parentNode!==n){n.appendChild(w);}}place();window.addEventListener("resize",place);})();

(function(){var s=document.querySelector(".hm-nav-select");if(!s)return;function buzz(){if(navigator.vibrate)navigator.vibrate(8);}s.addEventListener("pointerdown",buzz);s.addEventListener("change",function(){if(navigator.vibrate)navigator.vibrate([6,18,10]);});})();

(function(){var b=document.querySelector(".hm-bar"),d=document.querySelector(".hm-drawer"),sc=document.querySelector(".hm-scrim");if(!b||!d)return;document.querySelectorAll(".top-nav .nav-btn").forEach(function(a){var c=a.cloneNode(true);c.className=a.classList.contains("active")?"active":"";d.appendChild(c);});function set(o){b.classList.toggle("open",o);d.classList.toggle("open",o);sc.classList.toggle("open",o);b.querySelector(".hm-burger").setAttribute("aria-expanded",o);}b.querySelector(".hm-burger").addEventListener("click",function(){set(!d.classList.contains("open"));});sc.addEventListener("click",function(){set(false);});document.addEventListener("keydown",function(e){if(e.key==="Escape")set(false);});})();
