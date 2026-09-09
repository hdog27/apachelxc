// GitHub README embeds: GFM rendering followed by an HTML allowlist.
(function () {
  'use strict';
  function renderReadme(body, markdown, source, prefix) {
    var fragment = DOMPurify.sanitize(marked.parse(markdown, { gfm: true }), {
      RETURN_DOM_FRAGMENT: true,
      ALLOWED_TAGS: ['p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'del', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'start', 'colspan', 'rowspan'],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false
    });
    var counts = new Map();
    var anchors = new Map();
    fragment.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (heading) {
      var slug = heading.textContent.toLowerCase().replace(/[\uFE0E\uFE0F]/g, '').replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, '').replace(/\s/g, '-');
      var count = counts.get(slug) || 0;
      counts.set(slug, count + 1);
      slug += count ? '-' + count : '';
      var id = prefix + '-' + slug;
      anchors.set(slug, id);
      // The project card already has a heading; keep imported headings below it.
      var replacement = document.createElement('h' + Math.min(6, Number(heading.tagName.slice(1)) + 2));
      replacement.id = id;
      replacement.append.apply(replacement, Array.from(heading.childNodes));
      heading.replaceWith(replacement);
    });
    function resolve(value, image) {
      if (!value.trim()) return null;
      try {
        var url = new URL(value, image ? source.download_url : source.html_url);
        return /^https?:$/.test(url.protocol) ? url.href : null;
      } catch (_) { return null; }
    }
    fragment.querySelectorAll('a').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        var slug;
        try { slug = decodeURIComponent(href.slice(1)); } catch (_) { slug = ''; }
        // Some upstream TOCs shorten a heading or omit a trailing emoji.
        // Resolve only an unambiguous prefix; otherwise keep the source link.
        if (slug && !anchors.has(slug)) {
          var candidates = Array.from(anchors.keys()).filter(function (key) { return key.startsWith(slug + '-'); });
          if (candidates.length === 1) slug = candidates[0];
        }
        if (anchors.has(slug)) {
          link.setAttribute('href', '#' + anchors.get(slug));
          return;
        }
      }
      var url = resolve(href, false);
      if (!url) { link.removeAttribute('href'); return; }
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
    fragment.querySelectorAll('img').forEach(function (img) {
      var url = resolve(img.getAttribute('src') || '', true);
      if (!url) { img.remove(); return; }
      img.src = url;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
    });
    body.replaceChildren(fragment);
    body.tabIndex = 0;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-label', 'README for ' + prefix);
    body.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!link || !link.getAttribute('href')?.startsWith('#' + prefix + '-')) return;
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target || !body.contains(target)) return;
      event.preventDefault();
      body.scrollTop += target.getBoundingClientRect().top - body.getBoundingClientRect().top;
    });
  }
  window.renderRepoReadme = renderReadme;
  document.querySelectorAll('.repo-embed').forEach(function (container, index) {
    var user = container.dataset.user;
    var repo = container.dataset.repo;
    var body = container.querySelector('.repo-embed-body');
    fetch('https://api.github.com/repos/' + encodeURIComponent(user) + '/' + encodeURIComponent(repo) + '/readme', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('README unavailable');
      return response.json();
    }).then(function (data) {
      var bytes = Uint8Array.from(atob(data.content.replace(/\s/g, '')), function (c) { return c.charCodeAt(0); });
      renderReadme(body, new TextDecoder().decode(bytes), data, 'readme-' + index);
    }).catch(function () {
      var link = document.createElement('a');
      link.href = 'https://github.com/' + encodeURIComponent(user) + '/' + encodeURIComponent(repo);
      link.textContent = 'Read it on GitHub';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      body.replaceChildren(document.createTextNode('README unavailable right now. '), link);
    });
  });
})();
