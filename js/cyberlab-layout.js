(function () {
  'use strict';

  try {
    if (!document.querySelector('link[data-cyberlab-layout-css]')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/css/cyberlab-layout.css?v=1';
      css.setAttribute('data-cyberlab-layout-css', '1');
      document.head.appendChild(css);
    }
  } catch (e) {}

  var shell = document.querySelector('.cyber-shell');
  var labGrid = document.querySelector('.lab-grid');
  var connectionPanel = document.querySelector('.connection-panel');
  var routePanel = document.querySelector('.route-panel');
  var routeSummary = routePanel && routePanel.querySelector('.route-summary');
  var rayId = routePanel && routePanel.querySelector('.ray-id');
  var dashboard = document.querySelector('.dashboard-grid');
  var noisePanel = document.querySelector('.noise-panel');
  var projectPanel = document.querySelector('.project-panel');
  var fingerprintPanel = document.querySelector('.fingerprint-panel');
  var deviceBox = fingerprintPanel && fingerprintPanel.querySelector('.device-box');
  var exposureWrap = fingerprintPanel && fingerprintPanel.querySelector('.exposure-wrap');
  var protocolPanel = document.querySelector('.protocol-panel');
  var protocolCards = protocolPanel && protocolPanel.querySelector('.protocol-cards');
  var protocolInnerDetails = protocolPanel && protocolPanel.querySelector('.cyber-details');
  var controlsPanel = document.querySelector('.controls-panel');
  var currentlyPanel = document.querySelector('.currently-panel');

  if (!shell || !labGrid || !connectionPanel || !routePanel || !dashboard || !noisePanel || !projectPanel || !fingerprintPanel || !protocolPanel) return;

  function marker(name, node) {
    var m = document.createComment(name);
    node.parentNode.insertBefore(m, node);
    return m;
  }

  var routeSummaryHome = routeSummary ? marker('route-summary-home', routeSummary) : null;
  var rayHome = rayId ? marker('ray-home', rayId) : null;
  var noiseHome = marker('noise-home', noisePanel);
  var projectHome = marker('project-home', projectPanel);
  var deviceHome = deviceBox ? marker('device-home', deviceBox) : null;
  var exposureHome = exposureWrap ? marker('exposure-home', exposureWrap) : null;
  var cardsHome = protocolCards ? marker('protocol-cards-home', protocolCards) : null;
  var protocolDetailsHome = protocolInnerDetails ? marker('protocol-details-home', protocolInnerDetails) : null;

  var mobileRoute = null;
  var rawBrowserDetails = null;
  var transportDetails = null;
  var mobile = false;

  function restoreAfter(markerNode, node) {
    if (!markerNode || !markerNode.parentNode || !node) return;
    markerNode.parentNode.insertBefore(node, markerNode.nextSibling);
  }

  function updateTransportSummary() {
    if (!transportDetails || !protocolCards) return;
    var label = transportDetails.querySelector('[data-transport-summary]');
    if (!label) return;
    var values = Array.from(protocolCards.querySelectorAll(':scope > div strong')).slice(0, 3).map(function (el) {
      return (el.textContent || '').trim();
    }).filter(Boolean);
    label.textContent = values.length ? values.join(' · ') : 'Open connection details';
  }

  function makeMobile() {
    if (mobile) return;
    mobile = true;
    document.body.classList.add('cyberlab-mobile-organized');

    // One compact top story: demo + connection + request path.
    if (routeSummary || rayId) {
      mobileRoute = document.createElement('div');
      mobileRoute.className = 'mobile-route-inline';
      var routeLabel = document.createElement('span');
      routeLabel.className = 'mobile-route-label';
      routeLabel.textContent = 'REQUEST PATH';
      mobileRoute.appendChild(routeLabel);
      if (routeSummary) mobileRoute.appendChild(routeSummary);
      if (rayId) mobileRoute.appendChild(rayId);
      connectionPanel.appendChild(mobileRoute);
    }

    // Put the two strongest live/interactive sections immediately after the top card.
    shell.insertBefore(noisePanel, fingerprintPanel);

    // Move featured build below security controls on mobile instead of interrupting the live demo flow.
    if (currentlyPanel) shell.insertBefore(projectPanel, currentlyPanel);
    else if (controlsPanel) controlsPanel.insertAdjacentElement('afterend', projectPanel);

    // Browser Exposure should lead with the interactive signal meter; raw values become optional detail.
    if (exposureWrap && deviceBox) {
      var sectionCopy = fingerprintPanel.querySelector('.section-copy');
      if (sectionCopy) sectionCopy.insertAdjacentElement('afterend', exposureWrap);
      rawBrowserDetails = document.createElement('details');
      rawBrowserDetails.className = 'mobile-raw-browser';
      rawBrowserDetails.innerHTML = '<summary>Raw browser values</summary>';
      rawBrowserDetails.appendChild(deviceBox);
      exposureWrap.insertAdjacentElement('afterend', rawBrowserDetails);
    }

    // Transport is useful evidence, but secondary to the live scanner/browser demos.
    if (protocolCards) {
      transportDetails = document.createElement('details');
      transportDetails.className = 'mobile-transport-details';
      transportDetails.innerHTML = '<summary><span data-transport-summary>Open connection details</span><small>HTTPS, HTTP, TLS, Cloudflare and request headers</small></summary>';
      transportDetails.appendChild(protocolCards);
      if (protocolInnerDetails) transportDetails.appendChild(protocolInnerDetails);
      protocolPanel.appendChild(transportDetails);
      updateTransportSummary();
      window.setTimeout(updateTransportSummary, 800);
      window.setTimeout(updateTransportSummary, 1800);
    }
  }

  function makeDesktop() {
    if (!mobile) return;
    mobile = false;
    document.body.classList.remove('cyberlab-mobile-organized');

    restoreAfter(routeSummaryHome, routeSummary);
    restoreAfter(rayHome, rayId);
    if (mobileRoute) mobileRoute.remove();
    mobileRoute = null;

    restoreAfter(noiseHome, noisePanel);
    restoreAfter(projectHome, projectPanel);

    if (rawBrowserDetails) rawBrowserDetails.remove();
    rawBrowserDetails = null;
    restoreAfter(deviceHome, deviceBox);
    restoreAfter(exposureHome, exposureWrap);

    if (transportDetails) transportDetails.remove();
    transportDetails = null;
    restoreAfter(cardsHome, protocolCards);
    restoreAfter(protocolDetailsHome, protocolInnerDetails);
  }

  var mq = window.matchMedia('(max-width: 820px)');
  function applyLayout() {
    if (mq.matches) makeMobile();
    else makeDesktop();
  }
  applyLayout();
  if (mq.addEventListener) mq.addEventListener('change', applyLayout);
  else if (mq.addListener) mq.addListener(applyLayout);

  // Give XML-RPC its own explanation instead of the generic WordPress-discovery wording.
  function patchXmlRpcDetail(row) {
    if (!row) return;
    var code = row.querySelector('code');
    var path = code ? (code.textContent || '').trim() : '';
    if (!/^\/xmlrpc\.php(?:[/?]|$)/i.test(path)) return;

    window.setTimeout(function () {
      var detail = document.getElementById('probe-detail');
      if (!detail || detail.hidden) return;
      var shownPath = detail.querySelector('#probe-detail-path');
      if (!shownPath || !/^\/xmlrpc\.php(?:[/?]|$)/i.test((shownPath.textContent || '').trim())) return;

      var title = detail.querySelector('#probe-detail-title');
      var summary = detail.querySelector('#probe-detail-summary');
      var why = detail.querySelector('#probe-detail-why');
      var classification = detail.querySelector('#probe-detail-class');
      if (title) title.textContent = 'WordPress XML-RPC probe';
      if (summary) summary.textContent = "This scanner was checking for WordPress's XML-RPC endpoint. hmax.space does not run WordPress.";
      if (why) why.textContent = 'WordPress exposes /xmlrpc.php for remote publishing and pingbacks. Automated scanners probe it to identify WordPress sites and sometimes test for brute-force or pingback-abuse opportunities.';
      if (classification) classification.textContent = 'WORDPRESS XML-RPC DISCOVERY';
    }, 0);
  }

  document.addEventListener('click', function (event) {
    patchXmlRpcDetail(event.target.closest && event.target.closest('.probe-row'));
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    patchXmlRpcDetail(event.target.closest && event.target.closest('.probe-row'));
  });
})();
