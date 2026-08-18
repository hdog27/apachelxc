<?php
// ==========================================================================
// footer.php - closing scripts + tags for every page.
// main.js (shared nav behaviour) loads everywhere. Pages may request extra
// scripts by defining $page_js (array of filenames in /js) before including.
// Social links live inside each page's card (see the Cyber Lab / Contact
// cards) so they are not duplicated here.
// ==========================================================================
?>
<p class="site-disclaimer">None of the information shown on this site is stored publicly, shared, or used maliciously.</p>
<p class="site-credit">Built by <strong>Harrison</strong>, <a href="https://github.com/1Fragz1" target="_blank" rel="noopener">Zachary Lavornia</a> and <a href="https://www.linkedin.com/in/morgan-stone-90b514419/" target="_blank" rel="noopener">Morgan Stone</a></p>
<script src="/js/kitty.js?v=<?= @filemtime(__DIR__ . "/../js/kitty.js") ?>"></script>
<script src="/js/main.js?v=<?= @filemtime(__DIR__ . "/../js/main.js") ?>"></script>
<?php if (!empty($page_js)) foreach ($page_js as $js): ?>
<script src="/js/<?= htmlspecialchars($js) ?>?v=<?= @filemtime(__DIR__ . "/../js/" . $js) ?>"></script>
<?php endforeach; ?>
</body>
</html>
