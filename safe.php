<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'safe';
$page_title       = 'Is this site safe? | hmax.space';
$page_description = 'A plain-English explanation of the security protections on this website, and how you can check them yourself.';
$grade            = 'A';
$scan_url         = 'https://securityheaders.com/?q=hmax.space&followRedirects=on';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h1>Is this site safe?</h1>
  <p class="subtext">Short answer: yes, and you don't have to take my word for it.</p>

  <p class="grade-badge">Security headers grade: <strong><?= htmlspecialchars($grade) ?></strong></p>
  <p><a href="<?= htmlspecialchars($scan_url) ?>" target="_blank" rel="noopener">Run the scan yourself &rarr;</a><br>
  <em>It's a third-party scanner. I can't influence the result.</em></p>

  <hr class="divider">

  <h2>But the Cyber Lab showed you my IP address</h2>
  <p>Yep, that's the point. Every website you visit can see that much. Most of them just don't show you.</p>
  <p>What that page displays is read from the request your own browser sent. It isn't hacking, and it isn't anything unusual. It's a demonstration of how much is handed over automatically, by every visit, to every site.</p>

  <hr class="divider">

  <h2>What that actually means</h2>
  <p>Every website sends invisible instructions to your browser along with the page. Most sites send almost none. These tell your browser to be strict about what it will run and where it will connect.</p>

  <h3>The protections on this site</h3>
  <ul class="safe-list">
    <li><strong>Forced encryption</strong> | your browser is told to only ever connect over HTTPS, so the connection can't be quietly downgraded on a public network.</li>
    <li><strong>Content Security Policy</strong> | a list of exactly which scripts and sources are allowed to run. Anything not on the list is blocked, including injected code. This is the protection most sites skip.</li>
    <li><strong>No inline scripts</strong> | the strictest version of the above. Code has to live in its own file, which removes the most common way attacks get injected into a page.</li>
    <li><strong>Clickjacking protection</strong> | other sites can't invisibly embed this one to trick you into clicking something.</li>
    <li><strong>No MIME sniffing</strong> | your browser won't guess a file's type and accidentally run something as code.</li>
    <li><strong>Referrer limiting</strong> | sites you click through to don't get told exactly which page you came from.</li>
    <li><strong>Hardware blocked</strong> | camera, microphone and GPS are denied at the page level. This site cannot request them.</li>
  </ul>

  <hr class="divider">
  <p class="subtext">Being graded well on protections is not the same as being flawless. It means the basics are in place and you can verify that independently.</p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
