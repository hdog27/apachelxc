const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'js/vendor'), { recursive: true });
for (const [source, target] of [
  ['marked/lib/marked.umd.js', 'marked.umd.js'],
  ['marked/LICENSE', 'marked-LICENSE'],
  ['dompurify/dist/purify.min.js', 'purify.min.js'],
  ['dompurify/LICENSE', 'dompurify-LICENSE']
]) fs.copyFileSync(path.join(root, 'node_modules', source), path.join(root, 'js/vendor', target));
