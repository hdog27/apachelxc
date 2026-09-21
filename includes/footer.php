<?php
// ==========================================================================
// footer.php - closing scripts + tags for every page.
// main.js (shared nav behaviour) loads everywhere. Pages may request extra
// scripts by defining $page_js (array of filenames in /js) before including.
// Social links live inside each page's card (see the Cyber Lab / Contact
// cards) so they are not duplicated here.
// ==========================================================================
?>
<p class="site-disclaimer">This lab processes connection data and logs browser signals. <a href="/safe#privacy">What is collected and shared</a>.</p>
<p class="site-credit">Built by <strong>Harrison</strong>, <a href="https://github.com/1Fragz1" target="_blank" rel="noopener">Zachary Lavornia</a> and <a href="https://www.linkedin.com/in/morgan-stone-90b514419/" target="_blank" rel="noopener">Morgan Stone</a></p>
<script src="/js/kitty.js?v=<?= @filemtime(__DIR__ . "/../js/kitty.js") ?>"></script>
<script src="/js/main.js?v=<?= @filemtime(__DIR__ . "/../js/main.js") ?>"></script>
<?php if (in_array(($body_class ?? ''), ['projects-page', 'cyberlab'], true)): ?>
<script src="/js/vendor/htmx.min.js?v=<?= @filemtime(__DIR__ . "/../js/vendor/htmx.min.js") ?>"></script>
<?php endif; ?>
<?php if (($body_class ?? '') === 'cyberlab'): ?>
<script src="/js/globe-hq-pre.js?v=<?= @filemtime(__DIR__ . "/../js/globe-hq-pre.js") ?>"></script>
<?php endif; ?>
<?php if (!empty($page_js)) foreach ($page_js as $js): ?>
<script src="/js/<?= htmlspecialchars($js) ?>?v=<?= @filemtime(__DIR__ . "/../js/" . $js) ?>"></script>
<?php endforeach; ?>
<script src="/js/site-polish.js?v=<?= @filemtime(__DIR__ . "/../js/site-polish.js") ?>"></script>
<?php if (($body_class ?? '') === 'cyberlab'): ?>
<script src="/js/cyberlab-layout.js?v=<?= @filemtime(__DIR__ . "/../js/cyberlab-layout.js") ?>"></script>
<script src="/js/cyberlab-deferred.js?v=<?= @filemtime(__DIR__ . "/../js/cyberlab-deferred.js") ?>"></script>
<?php else: ?>
<script src="/js/liquid-glass-webgl.js?v=<?= @filemtime(__DIR__ . "/../js/liquid-glass-webgl.js") ?>"></script>
<script src="/js/liquid-glass-nav-webgl.js?v=<?= @filemtime(__DIR__ . "/../js/liquid-glass-nav-webgl.js") ?>"></script>
<script src="/js/liquid-glass-debug.js?v=<?= @filemtime(__DIR__ . "/../js/liquid-glass-debug.js") ?>"></script>
<?php endif; ?>
</body>
</html>
