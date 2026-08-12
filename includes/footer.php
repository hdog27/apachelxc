<?php
// ==========================================================================
// footer.php - closing scripts + tags for every page.
// main.js (shared nav behaviour) loads everywhere. Pages may request extra
// scripts by defining $page_js (array of filenames in /js) before including.
// Social links live inside each page's card (see the Cyber Lab / Contact
// cards) so they are not duplicated here.
// ==========================================================================
?>
<script src="/js/main.js"></script>
<?php if (!empty($page_js)) foreach ($page_js as $js): ?>
<script src="/js/<?= htmlspecialchars($js) ?>"></script>
<?php endforeach; ?>
</body>
</html>
