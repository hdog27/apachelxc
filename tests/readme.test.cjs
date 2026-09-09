const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
function setup() {
  const dom = new JSDOM('<div id="body"></div>', { runScripts: 'outside-only', url: 'https://hmax.space/projects' });
  for (const script of ['js/vendor/marked.umd.js', 'js/vendor/purify.min.js', 'js/readme.js']) dom.window.eval(fs.readFileSync(script, 'utf8'));
  const body = dom.window.document.getElementById('body');
  return { dom, body, render: (md, prefix = 'test') => dom.window.renderRepoReadme(body, md, {
    html_url: 'https://github.com/example/lab/blob/main/docs/README.md',
    download_url: 'https://raw.githubusercontent.com/example/lab/main/docs/README.md'
  }, prefix) };
}
test('renders GFM tables, inline HTML images, relative links and scoped duplicate headings', () => {
  const { body, render } = setup();
  render('# Setup\n\n[Jump](#setup)\n\n# Setup\n\n[Second](#setup-1)\n\n| Item | Value |\n| --- | --- |\n| **Rule** | Block |\n\n<p align="center"><img src="screenshots/demo.png" width="1000" alt="Demo"></p>\n\n[Guide](guide.md)');
  assert.equal(body.querySelectorAll('table').length, 1);
  assert.equal(body.querySelector('td strong').textContent, 'Rule');
  assert.equal(body.querySelector('img').src, 'https://raw.githubusercontent.com/example/lab/main/docs/screenshots/demo.png');
  assert.equal(body.querySelector('img').hasAttribute('width'), false);
  assert.equal(body.querySelector('a').getAttribute('href'), '#test-setup');
  assert.ok(body.querySelector('#test-setup-1'));
  assert.equal(body.querySelectorAll('a')[2].target, '_blank');
  assert.equal(body.querySelectorAll('a')[2].href, 'https://github.com/example/lab/blob/main/docs/guide.md');
});
test('removes active HTML, handlers, unsafe URLs and imported identifiers', () => {
  const { body, render } = setup();
  render('<script>alert(1)</script><iframe src="https://evil.example"></iframe><form><input name="location"></form><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)" id="location">bad</a><p style="position:fixed" onclick="alert(1)">text</p>');
  assert.equal(body.querySelector('script,iframe,form,input,[onerror],[onclick],[style],[id="location"]'), null);
  assert.equal(body.querySelector('a').hasAttribute('href'), false);
  assert.equal(body.querySelector('img'), null);
});
test('keeps source code literal and Unicode readable', () => {
  const { body, render } = setup();
  render('# Café\n\n```html\n<img src="x" onerror="bad()">\n```');
  assert.equal(body.querySelector('h3').textContent, 'Café');
  assert.match(body.querySelector('code').textContent, /<img/);
  assert.equal(body.querySelector('img'), null);
});
test('resolves emoji headings and unambiguous shortened upstream TOCs', () => {
  const { body, render } = setup();
  render('[Map](#-attack-overview)\n\n[Step](#step-10--configure-language)\n\n## 🗺️ Attack Overview\n\n### Step 10 — Configure Language & Style');
  for (const link of body.querySelectorAll('a')) {
    assert.ok(link.getAttribute('href').startsWith('#test-'));
    assert.ok(body.ownerDocument.getElementById(link.getAttribute('href').slice(1)));
  }
});
