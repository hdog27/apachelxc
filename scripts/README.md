# README embed maintenance

The website keeps the GitHub README panels. `js/readme.js` renders GitHub-flavored Markdown with Marked, sanitizes the result with DOMPurify, resolves relative images/links against the README source, and scopes heading anchors to each panel.

The browser bundles and upstream licenses are committed under `js/vendor`. No Node.js installation or npm command is needed on the Apache LXC to deploy these files. The dependency versions are pinned in `package-lock.json`.

For development with Node.js 24:

```sh
npm ci --ignore-scripts
npm run vendor:readme
npm test
```

After updating dependencies, regenerate the bundles, run the tests and commit the lockfile plus bundles together. README fetch failures retain a link to GitHub. Imported HTML uses an explicit allowlist; do not bypass sanitization to support additional markup.

The privacy explanation in `safe.php` describes the checked-in logging and third-party calls. Recheck it when telemetry changes. Actual log rotation, cache cleanup and Suricata deployment must be verified on the host; this repository does not establish those operational settings.
