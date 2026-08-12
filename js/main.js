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
      body.innerHTML = '<p>Could not load README right now &mdash; <a href="https://github.com/' + user + '/' + repo + '" target="_blank" rel="noopener">view it on GitHub</a>.</p>';
    });
}
function simpleMarkdown(md) {
  var html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, function (m, c) { return '<pre><code>' + c.trim() + '</code></pre>'; })
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\s*-\s+(.*)$/gim, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/gim, '<ul>$1</ul>');
  return '<p>' + html + '</p>';
}
document.querySelectorAll('.repo-embed').forEach(loadRepoReadme);
