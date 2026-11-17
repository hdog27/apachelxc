<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'contact';
$page_title       = 'Contact | hmax.space';
$page_description = 'Contact Harrison Smith, CompTIA CySA+ and Security+ certified cybersecurity student focused on security engineering and Linux administration.';
$page_css         = 'contact.css';
$body_class       = 'contact-page';

$contact_email = '';
$resume_path   = __DIR__ . '/files/resume.pdf';

require __DIR__ . '/includes/header.php';
?>
<main class="card contact-card">
  <header class="contact-hero">
    <div class="contact-hero-copy">
      <p class="contact-eyebrow">CONTACT</p>
      <h1>Get in touch</h1>
      <p class="status-line">CompTIA CySA+ and Security+ certified. B.S. Cybersecurity in progress, with an associate's degree and Cisco Networking Academy Network Security course credential completed.</p>
    </div>
    <?php require __DIR__ . '/includes/csap-badge.php'; ?>
  </header>

  <section class="contact-about" aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <p>I work on network security, log collection and analysis, and self-hosted infrastructure. Most of it is built and documented in the homelab on this site, including the server hosting this page.</p>
    <p>I’m always learning and expanding the lab as I go. Most of what’s here came from building something, breaking it, and figuring out how to make it better.</p>

    <div class="credential-card" aria-label="CompTIA CySA+ certification">
      <img class="credential-badge" src="/images/comptia-cysa-plus.png" alt="CompTIA CySA+ Certified badge" width="80" height="80" loading="lazy">
      <div>
        <span class="credential-label">CERTIFICATION</span>
        <strong>CompTIA CySA+</strong>
        <small>Earned November 15, 2026 · Expires November 15, 2029</small>
        <small>Threat detection, vulnerability management, incident response, and security operations.</small>
        <a class="credential-verify" href="https://www.credly.com/badges/32601b4e-70a5-4fc2-ac0d-ac48beceb7c2/public_url" target="_blank" rel="noopener">Verify CySA+ on Credly ↗</a>
      </div>
    </div>

    <div class="credential-card" aria-label="CompTIA Security+ certification">
      <img class="credential-badge" src="/images/comptia-security-plus.png" alt="CompTIA Security+ Certified badge" width="80" height="80" loading="lazy">
      <div>
        <span class="credential-label">CERTIFICATION</span>
        <strong>CompTIA Security+</strong>
        <small>Earned October 28, 2026 · Expires October 28, 2029</small>
        <small>Core security controls, risk management, network defense, and incident response.</small>
        <a class="credential-verify" href="https://verify.comptia.org" target="_blank" rel="noopener">Verify Security+ ↗</a>
        <small class="credential-code">Verification code: 2c1126afeb7b48e1b700b72828fcc090</small>
      </div>
    </div>

    <div class="credential-card" aria-label="Cisco Networking Academy course credential">
      <img class="credential-badge" src="/images/cisco-network-security.svg" alt="Cisco Networking Academy Network Security verified badge" width="80" height="80" loading="lazy">
      <div>
        <span class="credential-label">COURSE CREDENTIAL</span>
        <strong>Cisco Networking Academy — Network Security</strong>
        <small>Completed Cisco Networking Academy Network Security coursework.</small>
        <a class="credential-verify" href="https://www.credly.com/badges/c8facc0b-67a6-4e9c-b28a-10064f439f9e/public_url" target="_blank" rel="noopener">Verify Network Security on Credly ↗</a>
      </div>
    </div>
  </section>

  <section class="contact-about contact-education" aria-labelledby="education-heading">
    <h2 id="education-heading">Education</h2>

    <div class="credential-card">
      <div>
        <span class="credential-label">BACHELOR'S DEGREE · IN PROGRESS</span>
        <strong>B.S. Cybersecurity</strong>
        <small>Rhode Island College · Expected May 2027</small>
        <a class="credential-verify" href="https://www.ric.edu/academics/undergraduate-degree-programs/cybersecurity-bs" target="_blank" rel="noopener" aria-label="View Rhode Island College's B.S. Cybersecurity program (opens in a new tab)">View program ↗</a>
      </div>
    </div>

    <div class="credential-card">
      <div>
        <span class="credential-label">ASSOCIATE DEGREE</span>
        <strong>A.S. Cybersecurity</strong>
        <small>Community College of Rhode Island · Earned December 2025</small>
        <a class="credential-verify" href="https://ccri.edu/programs/cybersecurity-as/" target="_blank" rel="noopener" aria-label="View CCRI's A.S. Cybersecurity program (opens in a new tab)">View program ↗</a>
      </div>
    </div>

    <div class="credential-card">
      <div>
        <span class="credential-label">ACADEMIC CERTIFICATE</span>
        <strong>Cyber Defense Certificate</strong>
        <small>Community College of Rhode Island · Completed</small>
        <a class="credential-verify" href="https://www.ccri.edu/programs/cyber-defense-certificate/" target="_blank" rel="noopener" aria-label="View CCRI's Cyber Defense Certificate program (opens in a new tab)">View program ↗</a>
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
