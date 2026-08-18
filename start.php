<?php
require_once __DIR__ . '/includes/metadata.php';
$current_page     = 'start';
$page_title       = 'How do I get started? | hmax.space';
$page_description = 'How to start a homelab and get into cybersecurity, from someone still learning.';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h1>How do I get started?</h1>
  <p class="subtext">This is what I'd tell someone starting today. It's not the only way.</p>

  <h2>1. Get a cheap box you can leave on</h2>
  <p>A used mini PC is the sweet spot. Cheap, quiet, low power, and you can leave it running 24/7 without thinking about it. An old laptop or desktop works too. You do not need a rack, and you should not buy one yet.</p>

  <h2>2. Put a hypervisor on it</h2>
  <p>I run Proxmox. It lets you carve one machine into a bunch of separate VMs and containers, so when you break something you delete it and start again instead of rebuilding the whole box.</p>
  <p>Plenty of people go with plain Linux and Docker instead. That's a completely valid path, and it's less to learn up front.</p>

  <h2>3. Run one thing</h2>
  <p>Proxmox has a big community of helper scripts that install common services for you. Browse the list, pick something you actually want, install it.</p>
  <p>DNS-level ad blocking is the usual first project, and it's a good one &mdash; Pi-hole or Unbound. It's useful from day one, everyone in the house notices it working, and it quietly teaches you what DNS is doing.</p>

  <h2>4. Then break it</h2>
  <p>The learning is in the fixing. Something stops resolving, a container won't start, you lock yourself out. That's the actual curriculum. Nothing here came from a tutorial going smoothly.</p>

  <hr class="divider">

  <h2>The cybersecurity side</h2>
  <p>Build the thing first. It's very hard to secure infrastructure you've never run, and most security concepts land much faster once you've got something of your own to apply them to.</p>
  <p>Once you have a couple of services up: put a real firewall in front of them, split your network into VLANs so your smart devices can't talk to your computers, and start collecting logs somewhere you can search them.</p>
  <p>For attacking, keep it isolated and keep it yours. Deliberately vulnerable targets like DVWA, OWASP Juice Shop and Metasploitable exist to be attacked. Run them in a segment with no route anywhere else, and only ever against hardware you own.</p>

  <hr class="divider">
  <p>If you want to see where this ends up: the <a href="/homelab">rack and everything running on it</a>, or the <a href="/projects">projects</a> that came out of it.</p>

  <hr class="divider">
  <p class="subtext">Build it yourself rather than copying someone else's setup. The copying is the part where you don't learn anything.</p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
