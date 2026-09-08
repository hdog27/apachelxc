<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'contact';
$page_title       = 'Contact | hmax.space';
$page_description = 'Get in touch.';
$page_css         = 'contact.css';
$body_class       = 'contact-page';

$contact_email = '';
$resume_path   = __DIR__ . '/files/resume.pdf';

require __DIR__ . '/includes/header.php';
?>
<main class="card contact-card">
  <header class="contact-hero">
    <p class="contact-eyebrow">CONTACT</p>
    <h1>Get in touch</h1>
    <p class="status-line">B.S. Cybersecurity in progress, associate's degree and Network Defense certification completed. Open to internships and entry-level security roles.</p>
  </header>

  <section class="contact-about" aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <p>I work on network security, log collection and analysis, and self-hosted infrastructure. Most of it is built and documented in the homelab on this site, including the server hosting this page.</p>
    <p>I’m always learning and expanding the lab as I go. Most of what’s here came from building something, breaking it, and figuring out how to make it better.</p>

    <div class="credential-card" aria-label="Cisco certification">
      <div class="credential-mark">CISCO</div>
      <div>
        <span class="credential-label">CERTIFICATION</span>
        <strong>Cisco Networking Academy — Network Defense</strong>
        <small>Completed network security / defense coursework and credentialing.</small>
      </div>
    </div>
  </section>

  <section class="contact-cta" aria-label="Contact links">
    <div class="contact-links">
      <a class="contact-btn" href="https://github.com/hdog27" target="_blank" rel="noopener">GitHub</a>
      <a class="contact-btn primary" href="https://www.linkedin.com/in/harrison-smith1234/" target="_blank" rel="noopener">LinkedIn</a>
<?php if ($contact_email !== ''): ?>
      <a class="contact-btn" href="mailto:<?= htmlspecialchars($contact_email) ?>">Email</a>
<?php endif; ?>
<?php if (is_readable($resume_path)): ?>
      <a class="contact-btn" href="/files/resume.pdf?v=<?= @filemtime($resume_path) ?>" target="_blank" rel="noopener">Resume (PDF)</a>
<?php endif; ?>
    </div>

<?php if ($contact_email === '' && !is_readable($resume_path)): ?>
    <p class="contact-note">For work, internships, or project questions, LinkedIn is the best way to reach me.</p>
<?php endif; ?>
  </section>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
