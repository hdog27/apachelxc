<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'contact';
$page_title       = 'Contact | hmax.space';
$page_description = 'Get in touch.';

// --- fill these in when ready; each block only renders once set/present ---
$contact_email = '';                       // e.g. 'hello@hmax.space'
$resume_path   = __DIR__ . '/files/resume.pdf';

require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h1>Contact</h1>

  <p class="status-line">B.S. Cybersecurity in progress, associate's degree and Network Defense certification completed.<br>Open to internships and entry-level security roles.</p>

  <hr class="divider">

  <h2>About</h2>
  <p>I work on network security, log collection and analysis, and self-hosted infrastructure. Most of it is built and documented in the homelab on this site, including the server hosting this page.</p>
  <p>I don't know everything &mdash; there are plenty of people far more experienced in this field than me. I just enjoy it, and I try to learn more every day.</p>

  <hr class="divider">

  <div class="contact-links">
    <a class="contact-btn" href="https://github.com/hdog27" target="_blank" rel="noopener">GitHub</a>
    <a class="contact-btn" href="https://www.linkedin.com/in/harrison-smith1234/" target="_blank" rel="noopener">LinkedIn</a>
<?php if ($contact_email !== ''): ?>
    <a class="contact-btn" href="mailto:<?= htmlspecialchars($contact_email) ?>">Email</a>
<?php endif; ?>
<?php if (is_readable($resume_path)): ?>
    <a class="contact-btn" href="/files/resume.pdf?v=<?= @filemtime($resume_path) ?>" target="_blank" rel="noopener">Resume (PDF)</a>
<?php endif; ?>
  </div>

<?php if ($contact_email === '' && !is_readable($resume_path)): ?>
  <p class="subtext">For business inquiries, reach out on LinkedIn.</p>
<?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
