<?php
// mod_remoteip (zz-remoteip.conf) already resolves the true client IP:
// it rewrites REMOTE_ADDR from CF-Connecting-IP, but ONLY when the request
// arrives from RemoteIPTrustedProxy (127.0.0.1 = the cloudflared tunnel).
// A direct hit on the origin keeps the attacker's own IP, so the header
// cannot be forged from outside. Trust REMOTE_ADDR; don't re-check here.
$remote = $_SERVER['REMOTE_ADDR'] ?? '';
$ip = filter_var($remote, FILTER_VALIDATE_IP) ? $remote : '0.0.0.0';
