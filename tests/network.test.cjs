const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

test('network explorer selects a component and renders its evidence safely', () => {
  const dom = new JSDOM(`
    <div class="architecture-workspace">
      <button data-network-node="opnsense" class="active" aria-pressed="true">OPNsense</button>
      <button data-network-node="cyberlab" aria-pressed="false">CyberLAB</button>
      <aside class="network-detail">
        <p id="detail-kicker"></p>
        <h2 id="detail-title"></h2>
        <p id="detail-summary"></p>
        <ul id="detail-points"></ul>
        <div id="detail-links"></div>
      </aside>
    </div>
  `, { runScripts: 'outside-only', url: 'https://hmax.space/network' });

  dom.window.matchMedia = () => ({ matches: false });
  const script = fs.readFileSync(path.join(__dirname, '..', 'js', 'network.js'), 'utf8');
  dom.window.eval(script);
  dom.window.document.querySelector('[data-network-node="cyberlab"]').click();

  assert.equal(dom.window.document.getElementById('detail-title').textContent, 'CyberLAB');
  assert.match(dom.window.document.getElementById('detail-summary').textContent, /authorized offensive testing/i);
  assert.equal(dom.window.document.querySelectorAll('#detail-points li').length, 4);
  assert.equal(dom.window.document.querySelectorAll('#detail-links a').length, 2);
  assert.equal(dom.window.document.querySelector('[data-network-node="cyberlab"]').getAttribute('aria-pressed'), 'true');
  assert.equal(dom.window.document.querySelector('[data-network-node="opnsense"]').getAttribute('aria-pressed'), 'false');
});
