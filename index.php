<?php
header('Content-Type: text/html');
require_once __DIR__ . '/vendor/autoload.php';
use GeoIp2\Database\Reader;

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];

// MaxMind GeoLite2 lookup for city/country (local, no external API call)
$city = 'Unknown';
$country = 'Unknown';
try {
    $geoReader = new Reader('/var/lib/GeoIP/GeoLite2-City.mmdb');
    $record = $geoReader->city($ip);
    $city = $record->city->name ?? 'Unknown';
    $country = $record->country->name ?? 'Unknown';
} catch (\Exception $e) {
    // Private/reserved IP or not found in database - leave as Unknown
}

// ip-api.com kept only for ISP name + VPN/proxy/hosting detection
$geo = @file_get_contents("http://ip-api.com/json/{$ip}?fields=isp,proxy,hosting");
$data = json_decode($geo);
$isp = $data->isp ?? 'Unknown';
$vpn = ($data && (($data->proxy ?? false) || ($data->hosting ?? false))) ? 'VPN/Proxy Detected' : 'No VPN Detected';
$ua = $_SERVER['HTTP_USER_AGENT'];

// Detect OS + version
if (preg_match('/Windows NT ([\d.]+)/i', $ua, $wm)) {
    $nt = $wm[1];
    $win_map = ['10.0'=>'10/11','6.3'=>'8.1','6.2'=>'8','6.1'=>'7'];
    $win_ver = $win_map[$nt] ?? $nt;
    $os = 'Windows ' . $win_ver;
    $os_emoji = '🖥️';
} elseif (preg_match('/iPhone.*CPU iPhone OS ([\d_]+)/i', $ua, $im)) {
    $os = 'iPhone iOS ' . str_replace('_', '.', $im[1]);
    $os_emoji = '📱';
} elseif (preg_match('/iPad.*CPU OS ([\d_]+)/i', $ua, $im)) {
    $os = 'iPad iOS ' . str_replace('_', '.', $im[1]);
    $os_emoji = '📱';
} elseif (preg_match('/Android ([\d.]+)/i', $ua, $am)) {
    $os = 'Android ' . $am[1];
    $os_emoji = '📱';
} elseif (preg_match('/Mac OS X ([\d_]+)/i', $ua, $mm)) {
    $os = 'macOS ' . str_replace('_', '.', $mm[1]);
    $os_emoji = '💻';
} elseif (preg_match('/Linux/i', $ua)) {
    $os = 'Linux';
    $os_emoji = '🖥️';
} else {
    $os = 'Unknown OS';
    $os_emoji = '🖥️';
}

// Detect Browser + version
if (preg_match('/Edg\/([\d.]+)/i', $ua, $em)) {
    $browser = 'Edge ' . $em[1];
    $browser_emoji = '🌐';
} elseif (preg_match('/OPR\/([\d.]+)|Opera\/([\d.]+)/i', $ua, $om)) {
    $browser = 'Opera ' . ($om[1] ?: $om[2]);
    $browser_emoji = '🌐';
} elseif (preg_match('/Firefox\/([\d.]+)/i', $ua, $fm)) {
    $browser = 'Firefox ' . $fm[1];
    $browser_emoji = '🦊';
} elseif (preg_match('/Chrome\/([\d.]+)/i', $ua, $cm)) {
    $browser = 'Chrome ' . $cm[1];
    $browser_emoji = '🌐';
} elseif (preg_match('/Version\/([\d.]+).*Safari/i', $ua, $sm)) {
    $browser = 'Safari ' . $sm[1];
    $browser_emoji = '🌐';
} else {
    $browser = 'Unknown Browser';
    $browser_emoji = '🌐';
}

// Detect device type
if (preg_match('/Mobile|Android.*Mobile/i', $ua)) {
    $device_type = 'Mobile';
} elseif (preg_match('/iPad|Tablet/i', $ua)) {
    $device_type = 'Tablet';
} else {
    $device_type = 'Desktop';
}

// Detect rendering engine
if (preg_match('/AppleWebKit\/([\d.]+)/i', $ua, $wk)) {
    $engine = 'WebKit ' . $wk[1];
} elseif (preg_match('/Gecko\/([\d.]+)/i', $ua, $gk)) {
    $engine = 'Gecko ' . $gk[1];
} else {
    $engine = '';
}

$device = $os_emoji . ' <strong>' . htmlspecialchars($os) . '</strong>'
    . ' &nbsp;|&nbsp; ' . $browser_emoji . ' <strong>' . htmlspecialchars($browser) . '</strong>'
    . ' &nbsp;|&nbsp; 📲 <strong>' . $device_type . '</strong>'
    . ($engine ? ' &nbsp;|&nbsp; ⚙️ <strong>' . htmlspecialchars($engine) . '</strong>' : '');

$log = date('Y-m-d H:i:s') . " - IP: $ip - Location: $city, $country - ISP: $isp - VPN: $vpn - Device: $device\n";
file_put_contents('/var/log/visits.log', $log, FILE_APPEND);
$visit_count = file_exists('/var/log/visits.log') ? count(file('/var/log/visits.log')) : 0;
?>
<!DOCTYPE html>
<html>
<head>
  <style>

.top-nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;justify-content:center;gap:8px;padding:12px 16px;background:rgba(20,25,35,0.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,0.18);box-shadow:0 4px 20px rgba(0,0,0,0.25);}
.nav-btn{background:transparent;border:none;color:#dce8f5;font:inherit;font-size:.95rem;padding:8px 18px;border-radius:999px;cursor:pointer;transition:background .2s ease,color .2s ease;}
.nav-btn:hover{background:rgba(255,255,255,.10);}
.nav-btn.active{background:rgba(255,255,255,.22);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25);}
.tab-panel{display:none;}
.tab-panel.active{display:block;}
body{padding-top:64px;}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background-image: url('background.jpg');
      background-size: cover;
      background-position: center;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }
    .card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 26px;
      padding: 50px;
      max-width: 752px;
      width: 100%;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
      color: white;
      text-align: center;
    }
    .cat {
      font-family: monospace;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 32px;
      color: rgba(255,255,255,0.9);
    }
    h1 {
      text-decoration: none;
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 16px;
      text-shadow: 0 10px 40px rgba(0,0,0,0.4);
      line-height: 1.5;
    }
    .ip-highlight {
        font-size: clamp(16px, 3vw, 30px) !important;
        font-weight: 900 !important;
        text-decoration: underline !important;
        color: #ffe066 !important;
        display: block !important;
        word-break: break-all !important;
        overflow-wrap: anywhere !important;
        margin: 12px 0;
        text-align: center;
    }
    .info-row {
      font-size: 15px;
      margin: 8px 0;
      color: rgba(255,255,255,0.85);
    }
    .vpn-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 8px;
    }
    .vpn-yes { background: rgba(255,80,80,0.4); border: 1px solid rgba(255,80,80,0.6); }
    .vpn-no { background: rgba(80,255,120,0.2); border: 1px solid rgba(80,255,120,0.4); }
    .divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.2);
      margin: 24px 0;
    }
    p
     {
      font-size: 18px;
      line-height: 1.7;
      color: rgba(255,255,255,0.85);
      margin-bottom: 16px;
    }
    .device-box {
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 12px;
      font-family: monospace;
      color: rgba(255,255,255,0.6);
      word-break: break-all;
      text-align: left;
      margin: 12px 0;
    }
    a
     { color: #a8d8ff; text-decoration: underline; font-weight: 600; }
    .visit-counter {
        font-size: 14px !important;
        color: rgba(255,255,255,0.6) !important;
        margin: 0 !important;
        padding: 4px 0;
    }
    .social-links {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 12px;
        flex-wrap: wrap;
    }
    .social-links a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255,255,255,0.7);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.2);
        transition: background 0.2s;
    }
    .social-links a:hover {
        background: rgba(255,255,255,0.1);
        color: white;
        text-decoration: none;
    }
    .footer {
      font-size: 16px;
      color: rgba(255,255,255,0.5);
      margin-top: 24px;
    }
  
.rack-hotspot-wrap{position:relative;max-width:480px;margin:20px auto;}
.rack-photo{width:100%;height:auto;display:block;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.35);}
.hotspot{position:absolute;transform:translate(-50%,-50%);cursor:pointer;}
.hotspot-dot{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.6);color:#fff;font-size:0.8rem;font-weight:600;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);box-shadow:0 0 0 4px rgba(255,255,255,0.08);transition:background .2s ease;}
.hotspot.open .hotspot-dot,.hotspot:hover .hotspot-dot{background:rgba(255,255,255,0.45);}
.hotspot-tooltip{position:absolute;bottom:130%;left:50%;transform:translateX(-50%);min-width:150px;max-width:210px;background:rgba(20,25,35,0.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:10px 12px;color:#dce8f5;font-size:0.78rem;line-height:1.3;box-shadow:0 4px 20px rgba(0,0,0,0.3);opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:10;}
.hotspot-tooltip strong{display:block;color:#fff;margin-bottom:4px;font-size:0.85rem;}
.hotspot.open .hotspot-tooltip{opacity:1;pointer-events:auto;}
.homelab-intro{margin-bottom:16px;}

.top-nav{background:rgba(20,25,35,0.4);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 4px 24px rgba(0,0,0,0.3);padding:14px 16px;gap:10px;flex-wrap:wrap;}
.nav-btn{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);letter-spacing:0.03em;padding:10px 22px;transition:background .2s ease,box-shadow .2s ease,transform .15s ease;}
.nav-btn:hover{background:rgba(255,255,255,0.14);transform:translateY(-1px);}
.nav-btn.active{background:rgba(120,180,255,0.22);border-color:rgba(150,200,255,0.5);box-shadow:0 0 16px rgba(120,180,255,0.45),inset 0 0 0 1px rgba(255,255,255,0.25);}
@media (max-width:600px){
  .top-nav{padding:16px 10px;gap:10px;}
  .nav-btn{font-size:1.05rem;padding:14px 22px;}
  body{padding-top:120px;}
}
.contact-links{display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;}
.contact-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);color:#fff;text-decoration:none;font-size:0.95rem;transition:background .2s ease;}
.contact-btn:hover{background:rgba(255,255,255,0.22);}
.services-list{margin-top:12px;}
.service-item{margin-bottom:16px;padding-left:14px;border-left:2px solid rgba(255,255,255,0.25);}
.service-item h4{margin:0 0 4px;color:#fff;font-size:1rem;}
.service-item p{margin:0;color:#dce8f5;font-size:0.9rem;line-height:1.4;}

/* Bigger, bolder section titles */
h2{font-size:28px;font-weight:700;margin-bottom:16px;text-shadow:0 10px 40px rgba(0,0,0,0.4);letter-spacing:0.02em;}
h3{font-size:22px;font-weight:700;margin:26px 0 10px;text-shadow:0 8px 30px rgba(0,0,0,0.35);letter-spacing:0.02em;}
.service-item h4{font-size:1.1rem;margin:0 0 8px;}

/* More transparent, more "liquid" nav */
.top-nav{background:rgba(20,25,35,0.22);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:0 4px 24px rgba(0,0,0,0.3);padding:14px 16px;gap:10px;flex-wrap:wrap;}
.nav-btn{position:relative;overflow:hidden;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);text-transform:uppercase;font-weight:600;letter-spacing:0.08em;padding:10px 22px;transition:background .2s ease,transform .15s ease;}

/* Light gradient sweep on hover */
.nav-btn::before{content:'';position:absolute;top:0;left:-75%;width:50%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,0.4),transparent);transform:skewX(-20deg);transition:left 0.6s ease;pointer-events:none;}
.nav-btn:hover::before,.nav-btn:focus-visible::before{left:125%;}
.nav-btn:hover{background:rgba(255,255,255,0.12);transform:translateY(-1px);}

/* Pulsing glow on the active tab (visible on mobile too, no hover needed) */
@keyframes navGlow{
  0%,100%{box-shadow:0 0 12px rgba(120,180,255,0.35),inset 0 0 0 1px rgba(255,255,255,0.25);}
  50%{box-shadow:0 0 22px rgba(120,180,255,0.6),inset 0 0 0 1px rgba(255,255,255,0.35);}
}
.nav-btn.active{background:rgba(120,180,255,0.2);border-color:rgba(150,200,255,0.5);animation:navGlow 2.5s ease-in-out infinite;}

@media (max-width:600px){
  .top-nav{padding:18px 8px;gap:12px;}
  .nav-btn{font-size:1.25rem;padding:16px 26px;letter-spacing:0.05em;}
  body{padding-top:132px;}
}


@media (max-width:600px){
  .top-nav{padding:20px 8px;gap:14px;}
  .nav-btn{font-size:1.5rem;padding:20px 32px;letter-spacing:0.04em;}
  body{padding-top:220px;}
  .card{margin-top:10px;}
}

.project-item{margin-bottom:28px;text-align:left;}
.repo-embed{margin-top:12px;border:1px solid rgba(255,255,255,0.18);border-radius:12px;background:rgba(0,0,0,0.2);overflow:hidden;}
.repo-embed-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.12);font-size:0.85rem;}
.repo-embed-name{font-family:monospace;color:#dce8f5;}
.repo-embed-link{color:#9fd1ff;text-decoration:none;font-size:0.8rem;}
.repo-embed-link:hover{text-decoration:underline;}
.repo-embed-body{max-height:420px;overflow-y:auto;padding:16px;font-size:0.85rem;line-height:1.5;color:#dce8f5;text-align:left;}
.repo-embed-body h1,.repo-embed-body h2,.repo-embed-body h3{color:#fff;margin:14px 0 6px;font-size:1rem;}
.repo-embed-body code{background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;font-family:monospace;}
.repo-embed-body pre{background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;overflow-x:auto;}
.repo-embed-body a{color:#9fd1ff;}
.repo-embed-body ul{padding-left:20px;}

</style>
<title>hmax.space — Homelab &amp; Cyber Security Portfolio</title>
<meta property="og:type" content="website">
<meta property="og:url" content="https://hmax.space/">
<meta property="og:title" content="hmax.space — Homelab & Cyber Security Portfolio">
<meta property="og:description" content="Homelab builds, SIEM/Splunk projects, VLAN design, and a live web metadata security demo.">
<meta property="og:image" content="https://hmax.space/background.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="hmax.space — Homelab & Cyber Security Portfolio">
<meta name="twitter:description" content="Homelab builds, SIEM/Splunk projects, VLAN design, and a live web metadata security demo.">
<meta name="twitter:image" content="https://hmax.space/background.jpg">
</head>
<body>

<nav class="top-nav">
  <button class="nav-btn" data-tab="homelab">Homelab</button>
  <button class="nav-btn active" data-tab="cyberlab">Cyber Lab</button>
  <button class="nav-btn" data-tab="projects">Projects</button>
  <button class="nav-btn" data-tab="contact">Contact</button>
</nav>
<section id="tab-homelab" class="tab-panel">
  <div class="card homelab-card">
    <h2>Homelab</h2>
    <p class="homelab-intro">This is my own build, shaped by trial and error, not a shopping list to clone. Below is a quick tour of the hardware; the real story is in the services running on top of it.</p>

    <div class="rack-hotspot-wrap">
      <img src="/images/rack.jpg" alt="Homelab rack" class="rack-photo">
      <div class="hotspot" style="top:12%;left:50%;" tabindex="0"><span class="hotspot-dot">1</span><div class="hotspot-tooltip"><strong>Display</strong>Repurposed monitor for at-a-glance dashboards.</div></div>
      <div class="hotspot" style="top:28%;left:30%;" tabindex="0"><span class="hotspot-dot">2</span><div class="hotspot-tooltip"><strong>Managed PoE Switch</strong>VLAN segmentation and PoE for access points/cameras.</div></div>
      <div class="hotspot" style="top:40%;left:65%;" tabindex="0"><span class="hotspot-dot">3</span><div class="hotspot-tooltip"><strong>Spotify Car Thing</strong>Jailbroken, running Nocturne as a custom media controller.</div></div>
      <div class="hotspot" style="top:52%;left:35%;" tabindex="0"><span class="hotspot-dot">4</span><div class="hotspot-tooltip"><strong>Proxmox Mini PC</strong>Main virtualization host for the lab.</div></div>
      <div class="hotspot" style="top:64%;left:60%;" tabindex="0"><span class="hotspot-dot">5</span><div class="hotspot-tooltip"><strong>Hue Hub</strong>Smart lighting tied into the automation stack.</div></div>
      <div class="hotspot" style="top:76%;left:30%;" tabindex="0"><span class="hotspot-dot">6</span><div class="hotspot-tooltip"><strong>Protectli VP1410</strong>Purpose-built appliance running the firewall/router stack.</div></div>
      <div class="hotspot" style="top:86%;left:65%;" tabindex="0"><span class="hotspot-dot">7</span><div class="hotspot-tooltip"><strong>NAS</strong>Central storage for backups, media, and lab data.</div></div>
      <div class="hotspot" style="top:95%;left:45%;" tabindex="0"><span class="hotspot-dot">8</span><div class="hotspot-tooltip"><strong>PDU</strong>Remote power control for the rack.</div></div>
    </div>

    <h3>Services</h3>
    <div class="services-list">
      <div class="service-item">
        <h4>Virtualization Platform &mdash; Proxmox VE</h4>
        <p>Proxmox VE is the hypervisor underlying the entire lab, hosting every VM and container listed here. It's also where most of the day-to-day admin practice happens: snapshots, resource tuning, and template-based provisioning.</p>
      </div>
      <div class="service-item">
        <h4>Firewall &amp; Routing &mdash; OPNsense</h4>
        <p>OPNsense runs on the Protectli appliance and handles inter-VLAN routing and firewall policy for the lab. It's the enforcement point that keeps management, IoT, and training-range traffic segmented from each other.</p>
      </div>
      <div class="service-item">
        <h4>Security Monitoring &amp; SIEM &mdash; Splunk Enterprise</h4>
        <p>A Splunk Enterprise instance ingests logs from across the lab for correlation, alerting, and hands-on detection engineering practice. It's the primary tool used to build and test custom search queries and dashboards.</p>
      </div>
      <div class="service-item">
        <h4>Log Aggregation &mdash; Loki</h4>
        <p>Loki collects and indexes logs from services and containers that don't feed into Splunk, giving a lighter-weight option for quick troubleshooting. It's mainly used to practice log-based debugging without the overhead of a full SIEM pipeline.</p>
      </div>
      <div class="service-item">
        <h4>Network Management &mdash; UniFi Controller</h4>
        <p>A UniFi controller manages switching, access points, and VLAN segmentation, keeping management, IoT, and lab traffic isolated from one another. It's also where most network-design experimentation happens before rules get pushed to the firewall.</p>
      </div>
      <div class="service-item">
        <h4>Remote Access &mdash; Tailscale</h4>
        <p>Tailscale provides a zero-config mesh VPN for securely reaching lab services from anywhere without exposing ports to the public internet. Every device authenticates individually, so there's no single exposed entry point.</p>
      </div>
      <div class="service-item">
        <h4>Security Training Range</h4>
        <p>Deliberately vulnerable targets &mdash; OWASP Juice Shop, Metasploitable2, and DVWA &mdash; run in an isolated segment for practicing red-team techniques and building teaching demos. Keeping them fully separated from production services is itself part of the network-segmentation exercise.</p>
      </div>
      <div class="service-item">
        <h4>Self-Hosted Cloud Storage &mdash; Nextcloud</h4>
        <p>Nextcloud provides self-hosted file sync and storage as a hands-on alternative to commercial cloud services. It also doubles as a testbed for practicing backup and access-control workflows.</p>
      </div>
      <div class="service-item">
        <h4>Web &amp; Application Hosting</h4>
        <p>An Apache/PHP container hosts this site, including the Cyber Lab metadata logger showcased under that tab.</p>
      </div>
    </div>
  </div>
</section>
<section id="tab-cyberlab" class="tab-panel active">
  <div class="card">

    <h1>Web Server Metadata Security Lab</h1>

    <pre class="cat">

 .--.
 |o_o |
 |\_/ |
 //   \ \
(|     | )
/'\_   _/`\
\___)=(___/
    </pre>

    <p class="subtext">Apache server environment built for generating, collecting, and analyzing web access logs for cybersecurity analysis</p>


    <span class="ip-highlight"><?= htmlspecialchars($ip) ?></span>

    <p class="info-row">📍 Location: <strong><?= htmlspecialchars($city) ?>, <?= htmlspecialchars($country) ?></strong></p>
    <p class="info-row">🌐 ISP: <strong><?= htmlspecialchars($isp) ?></strong></p>
    <span class="vpn-badge <?= (($data->proxy ?? false) || ($data->hosting ?? false)) ? 'vpn-yes' : 'vpn-no' ?>">
      <?= htmlspecialchars($vpn) ?>
    </span>

    <hr class="divider">

    <p class="visit-counter">👁 This page has been visited <strong><?= number_format($visit_count) ?></strong> times</p>

    <hr class="divider">

    <p> This request also includes this automatically collected client-side metadata:</p>
    <div class="device-box" id="device-box"><?= $device ?><br><span id="rtc-info">Gathering WebRTC / hardware fingerprint...</span></div>

    <hr class="divider">

    <p>Any website you visit can see your IP address, estimate your location, and read your device info. This page logged all of it the moment you loaded it.</p>
    <p>As another example, this link appears to go to Instagram, but it actually takes you to Google:<br>
    <a href="https://google.com">Instagram</a><br>
    <em>Always hover over links first and check where they actually lead before clicking.</em></p>

    <hr class="divider">
    <div class="social-links">
      <a href="https://github.com/hdog27" target="_blank" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </a>
      <a href="https://www.linkedin.com/in/harrison-smith1234/" target="_blank" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
    </div>
    <p class="footer">Built by Harrison</p>
  </div>
</section>
<section id="tab-projects" class="tab-panel">
  <div class="card">
    <h2>Projects</h2>
    <div class="project-item">
      <h3>Evil Twin Captive Portal &mdash; Airgeddon-based</h3>
      <p>A red-team homelab build combining Airgeddon with a custom captive portal to demonstrate evil-twin Wi-Fi attacks for teaching and demo purposes.</p>
      <div class="repo-embed" data-user="hdog27" data-repo="airgeddon-evil-twin-captive-portal">
        <div class="repo-embed-header">
          <span class="repo-embed-name">hdog27/airgeddon-evil-twin-captive-portal</span>
          <a href="https://github.com/hdog27/airgeddon-evil-twin-captive-portal" target="_blank" rel="noopener" class="repo-embed-link">View on GitHub &rarr;</a>
        </div>
        <div class="repo-embed-body"><p class="repo-embed-loading">Loading README&hellip;</p></div>
      </div>
    </div>
    <div class="project-item">
      <h3>SIEM Build &mdash; Splunk</h3>
      <p>Write-up coming soon.</p>
    </div>
    <div class="project-item">
      <h3>VLAN Design</h3>
      <p>Write-up coming soon.</p>
    </div>
    <div class="project-item">
      <h3>Cloudflare Tunnel Setup</h3>
      <p>Write-up coming soon.</p>
    </div>
    <div class="project-item">
      <h3>Teaching Demos &amp; Red-Team Homelab Work</h3>
      <p>Write-up coming soon.</p>
    </div>
  </div>
</section>
<section id="tab-contact" class="tab-panel">
  <div class="card">
    <h2>Contact</h2>
    <div class="contact-links">
      <a class="contact-btn" href="https://github.com/hdog27" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        GitHub
      </a>
      <a class="contact-btn" href="https://www.linkedin.com/in/harrison-smith1234/" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.02-4.12 2.06 2.06 0 01-.02 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
        LinkedIn
      </a>
    </div>
  </div>
</section>
  <script>
  (async function () {
    const result = {};
    result.cores = navigator.hardwareConcurrency || 'Unavailable';
    result.ram = navigator.deviceMemory ? (navigator.deviceMemory + ' GB (approx)') : 'Hidden by browser';
    result.screenInfo = screen.width + 'x' + screen.height + ' @' + window.devicePixelRatio + 'x, ' + screen.colorDepth + '-bit';
    result.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    result.languages = navigator.languages ? navigator.languages.join(',') : navigator.language;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const dbgExt = gl.getExtension('WEBGL_debug_renderer_info');
      result.gpu = dbgExt ? gl.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL) : 'Unavailable';
    } catch (e) { result.gpu = 'Unavailable'; }

    result.localIps = [];
    try {
      const ips = new Set();
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pc.createDataChannel('');
      await new Promise((resolve) => {
        pc.onicecandidate = (e) => {
          if (!e.candidate) { resolve(); return; }
          const parts = e.candidate.candidate.split(' ');
          const ip = parts[4];
          if (ip) ips.add(ip);
        };
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));
        setTimeout(resolve, 1500);
      });
      pc.close();
      result.localIps = [...ips];
    } catch (e) {}

    const box = document.getElementById('rtc-info');
    if (box) {
      box.innerHTML =
        'CPU Cores: <strong>' + result.cores + '</strong> &nbsp;|&nbsp; ' +
        'RAM (approx): <strong>' + result.ram + '</strong><br>' +
        'GPU: <strong>' + result.gpu + '</strong><br>' +
        'Screen: <strong>' + result.screenInfo + '</strong> &nbsp;|&nbsp; TZ: <strong>' + result.timezone + '</strong><br>' +
        'WebRTC-leaked IP(s): <strong>' + (result.localIps.join(', ') || 'None found') + '</strong>';
    }

    fetch('/log_rtc.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    }).catch(function () {});
  })();
  </script>
<script>
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});
</script>
<script>
document.querySelectorAll('.hotspot').forEach(spot=>{
  function toggle(e){
    e.stopPropagation();
    const wasOpen = spot.classList.contains('open');
    document.querySelectorAll('.hotspot.open').forEach(s=>s.classList.remove('open'));
    if(!wasOpen){
      spot.classList.add('open');
      const tip = spot.querySelector('.hotspot-tooltip');
      tip.style.left='50%'; tip.style.right='auto'; tip.style.transform='translateX(-50%)';
      tip.style.bottom='130%'; tip.style.top='auto';
      const rect = tip.getBoundingClientRect();
      const margin = 8;
      if(rect.left < margin){ tip.style.left='0'; tip.style.transform='none'; }
      else if(rect.right > window.innerWidth - margin){ tip.style.left='auto'; tip.style.right='0'; tip.style.transform='none'; }
      if(rect.top < margin){ tip.style.bottom='auto'; tip.style.top='130%'; }
    }
  }
  spot.addEventListener('click', toggle);
  spot.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(e); } });
});
document.addEventListener('click', ()=>document.querySelectorAll('.hotspot.open').forEach(s=>s.classList.remove('open')));
</script>
<script>
async function loadRepoReadme(container){
  const user = container.dataset.user;
  const repo = container.dataset.repo;
  const body = container.querySelector('.repo-embed-body');
  try{
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}/readme`, {headers:{Accept:'application/vnd.github.v3+json'}});
    if(!res.ok) throw new Error('not found');
    const data = await res.json();
    const raw = decodeURIComponent(escape(atob(data.content)));
    body.innerHTML = simpleMarkdown(raw);
  }catch(err){
    body.innerHTML = '<p>Could not load README right now &mdash; <a href="https://github.com/'+user+'/'+repo+'" target="_blank" rel="noopener">view it on GitHub</a>.</p>';
  }
}
function simpleMarkdown(md){
  let html = md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```([\s\S]*?)```/g,(m,c)=>'<pre><code>'+c.trim()+'</code></pre>')
    .replace(/^### (.*$)/gim,'<h3>$1</h3>')
    .replace(/^## (.*$)/gim,'<h2>$1</h2>')
    .replace(/^# (.*$)/gim,'<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\s*-\s+(.*)$/gim,'<li>$1</li>')
    .replace(/\n{2,}/g,'</p><p>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/gim,'<ul>$1</ul>');
  return '<p>'+html+'</p>';
}
document.querySelectorAll('.repo-embed').forEach(loadRepoReadme);
</script>
</body>
</html>
