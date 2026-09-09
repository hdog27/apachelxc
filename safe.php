<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'safe';
$page_title       = 'Is this site safe? | hmax.space';
$page_description = 'A plain-English explanation of the security protections on this website, and how you can check them yourself.';
$page_css         = 'content-wide.css';
$body_class       = 'wide-content-page';
$scan_url         = 'https://securityheaders.com/?q=hmax.space&followRedirects=on';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h1>Is this site safe?</h1>
  <p class="subtext">This is a metadata demonstration. Here is what it collects, where that information goes, and which protections you can check.</p>

  <p class="grade-badge">Security headers: <strong>check the current deployment</strong></p>
  <p><a href="<?= htmlspecialchars($scan_url) ?>" target="_blank" rel="noopener">Run the scan yourself &rarr;</a><br>
  <em>This independent scan checks response headers, not the complete security of the application.</em></p>

  <hr class="divider">

  <h2>But the Cyber Lab showed you my IP address</h2>
  <p>Yep, that's the point. Every website you visit can see that much. Most of them just don't show you.</p>
  <p>The server sees connection metadata such as your IP address and browser request headers. JavaScript also actively queries browser APIs for the device signals shown in the demo; those values are not all part of the initial request.</p>

  <h2 id="privacy">What is collected and shared</h2>
  <ul class="safe-list">
    <li><strong>Connection logs</strong> | the application writes your IP address, approximate location, network provider, VPN/proxy lookup label and browser description to a server-side visit log.</li>
    <li><strong>Browser signals</strong> | the Cyber Lab sends WebRTC candidates, reported CPU thread count, approximate RAM, GPU description, screen details, timezone and languages to this site's logging endpoint. These are logged with your IP; they do not stay only in your browser.</li>
    <li><strong>Location and proxy lookup</strong> | local MaxMind databases supply IP-based location and network information. When the provider-name heuristic does not match, the server may send your IP to IP2Location over HTTPS for a proxy lookup. Successful results are reused for up to 24 hours.</li>
    <li><strong>WebRTC</strong> | the browser contacts Google's STUN service to gather connection candidates. That service receives the network address used to contact it. A candidate can be an address or a privacy-preserving local hostname; its presence alone does not prove a VPN leak.</li>
    <li><strong>Other services</strong> | Cloudflare handles requests in front of the site. Project embeds fetch READMEs from GitHub and images from their source hosts. The Cyber Lab includes a Kaspersky map. These services receive connection information when your browser contacts them.</li>
    <li><strong>Counting and retention</strong> | visitor counting stores IP-derived hashes on disk and uses a 30-day repeat-counting window. Hashing is not the same as anonymizing an IP. The application does not set an automatic deletion period for visit logs or cache files; server-side retention settings are not published here.</li>
  </ul>
  <p>RAM is a browser-provided estimate and CPU count means reported logical processors, not necessarily physical cores. Web storage quota estimates how much storage the browser allows this origin to use; it is not your drive size or free disk space. Values can be limited or unavailable for privacy reasons.</p>
  <p>VPN/proxy labels are fallible hints from a provider-name match or database. A positive result is not proof of VPN use, and a negative result does not rule it out.</p>

  <hr class="divider">

  <h2>What that actually means</h2>
  <p>Security response headers tell compatible browsers which content to allow and how to handle connections. The repository configures the controls below; the scan above lets you check what the live server actually sends.</p>

  <h3>The protections on this site</h3>
  <ul class="safe-list">
    <li><strong>Forced encryption</strong> | your browser is told to only ever connect over HTTPS, so the connection can't be quietly downgraded on a public network.</li>
    <li><strong>Content Security Policy</strong> | restricts script and resource sources, reducing some injection risks. It does not replace validation, output escaping or safe handling of imported content.</li>
    <li><strong>Inline script restrictions</strong> | the configured script policy permits same-origin script files and does not allow arbitrary inline scripts. This is one layer of protection, not a guarantee against injected code.</li>
    <li><strong>Clickjacking protection</strong> | other sites can't invisibly embed this one to trick you into clicking something.</li>
    <li><strong>No MIME sniffing</strong> | your browser won't guess a file's type and accidentally run something as code.</li>
    <li><strong>Referrer limiting</strong> | sites you click through to don't get told exactly which page you came from.</li>
    <li><strong>Hardware blocked</strong> | camera, microphone and GPS are denied at the page level. This site cannot request them.</li>
  </ul>

  <hr class="divider">
  <p class="subtext">Being graded well on protections is not the same as being flawless. It means the basics are in place and you can verify that independently.</p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
