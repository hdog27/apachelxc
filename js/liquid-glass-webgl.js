(function () {
  'use strict';

  // Reference-engine experiment based on archisvaze/liquid-glass webgl.html.
  // One fullscreen WebGL context renders every visible outer card. The shader
  // math is the reference repo's rounded-rect / thickness / bezel / IOR model;
  // this file only adapts that renderer to the site's existing cards/layout.
  const BACKDROP_URL = '/images/liquid-glass-test-bg.jpg';
  const BASE_CARD_SELECTOR = '.card, .panel, .identity-hero';
  const MOBILE_BREAKPOINT = 820;
  const SHADOW_MARGIN = 42;

  const SETTINGS = {
    thickness: 68,
    bezel: 60,
    ior: 3.2,
    blur: 1.5,
    // archisvaze's shader already has a single-sample fast path below 0.5.
    // Use it on phones to cut texture work without changing refraction math.
    mobileBlur: 0.3,
    specular: 0.68,
    tint: 0.08,
    shadow: 0.5
  };

  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    varying vec2 vUv;

    uniform vec2 uResolution;
    uniform vec2 uGlassCenter;
    uniform vec2 uGlassSize;
    uniform float uRadius;
    uniform float uBezel;
    uniform float uThickness;
    uniform float uIOR;
    uniform float uBlur;
    uniform float uSpecular;
    uniform float uTint;
    uniform float uShadow;
    uniform sampler2D uBgTex;
    uniform float uBgAspect;

    float sdRoundedRect(vec2 p, vec2 halfSize, float r) {
      vec2 q = abs(p) - halfSize + r;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }

    float surfaceHeight(float t) {
      float s = 1.0 - t;
      return pow(1.0 - s*s*s*s, 0.25);
    }

    vec3 sampleBg(vec2 screenUV) {
      float screenAspect = uResolution.x / uResolution.y;
      vec2 uv = screenUV;

      if (uBgAspect > screenAspect) {
        float s = screenAspect / uBgAspect;
        uv.x = uv.x * s + (1.0 - s) * 0.5;
      } else {
        float s = uBgAspect / screenAspect;
        uv.y = uv.y * s + (1.0 - s) * 0.5;
      }

      uv.y = 1.0 - uv.y;
      return texture2D(uBgTex, clamp(uv, 0.0, 1.0)).rgb;
    }

    vec3 sampleBgBlurred(vec2 uv, float radius) {
      if (radius < 0.5) return sampleBg(uv);

      vec3 sum = vec3(0.0);
      vec2 px = 1.0 / uResolution;
      vec2 offsets[16];
      offsets[0]  = vec2(-0.94201, -0.39906);
      offsets[1]  = vec2( 0.94558, -0.76890);
      offsets[2]  = vec2(-0.09418, -0.92938);
      offsets[3]  = vec2( 0.34495,  0.29387);
      offsets[4]  = vec2(-0.91588, -0.45771);
      offsets[5]  = vec2(-0.81544,  0.48568);
      offsets[6]  = vec2(-0.38277, -0.56071);
      offsets[7]  = vec2(-0.12675,  0.84686);
      offsets[8]  = vec2( 0.89642,  0.41254);
      offsets[9]  = vec2( 0.18150, -0.30020);
      offsets[10] = vec2(-0.01445, -0.16001);
      offsets[11] = vec2( 0.59614,  0.71118);
      offsets[12] = vec2( 0.49742, -0.47280);
      offsets[13] = vec2( 0.80685,  0.04588);
      offsets[14] = vec2(-0.32490, -0.03965);
      offsets[15] = vec2(-0.60975,  0.06566);

      for (int i = 0; i < 16; i++) {
        sum += sampleBg(uv + offsets[i] * radius * px);
      }
      return sum / 16.0;
    }

    void main() {
      vec2 screenPx = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
      vec2 p = screenPx - uGlassCenter;
      vec2 halfSize = uGlassSize * 0.5;

      float sd = sdRoundedRect(p, halfSize, uRadius);

      if (sd > 0.0) {
        float shadowFalloff = exp(-sd * sd / 800.0);
        float shadowAlpha = uShadow * shadowFalloff * 0.6;
        gl_FragColor = vec4(0.0, 0.0, 0.0, shadowAlpha);
        return;
      }

      float distFromEdge = -sd;
      float maxBezel = max(1.0, min(uRadius, min(halfSize.x, halfSize.y)) - 1.0);
      float bezel = min(uBezel, maxBezel);
      float t = clamp(distFromEdge / bezel, 0.0, 1.0);

      float h = surfaceHeight(t);
      float dt = 0.001;
      float h2 = surfaceHeight(min(t + dt, 1.0));
      float dh = (h2 - h) / dt;

      float slopeAngle = atan(dh * (uThickness / bezel));
      float sinR = sin(slopeAngle) / uIOR;
      sinR = clamp(sinR, -1.0, 1.0);
      float thetaR = asin(sinR);
      float displacement = h * uThickness * (tan(slopeAngle) - tan(thetaR));

      vec2 grad;
      float eps = 0.5;
      grad.x = sdRoundedRect(p + vec2(eps, 0.0), halfSize, uRadius) - sd;
      grad.y = sdRoundedRect(p + vec2(0.0, eps), halfSize, uRadius) - sd;
      grad = normalize(grad + vec2(0.00001));

      vec2 offset = -grad * displacement / uResolution;
      vec2 screenUV = screenPx / uResolution;
      vec2 refractedUV = screenUV + offset;

      vec3 color = sampleBgBlurred(refractedUV, uBlur);

      vec2 lightDir = normalize(vec2(0.5, -0.7));
      float rimDot = abs(dot(grad, lightDir));
      float rimFalloff = 1.0 - smoothstep(0.0, bezel * 0.4, distFromEdge);
      float specHighlight = pow(rimDot * rimFalloff, 1.5);
      color += vec3(specHighlight * uSpecular);

      float innerShadow = 1.0 - smoothstep(0.0, bezel * 0.6, distFromEdge);
      color *= mix(1.0, 0.7, innerShadow * 0.3);

      float innerRim = smoothstep(0.0, 2.0, distFromEdge) *
                       (1.0 - smoothstep(2.0, 5.0, distFromEdge));
      color += vec3(innerRim * 0.15 * uSpecular);

      color = mix(color, vec3(1.0), uTint);

      float alpha = smoothstep(0.0, 1.5, distFromEdge);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed');
    }
    return shader;
  }

  function isCyberLabMobile() {
    return document.body.classList.contains('cyberlab') &&
      window.matchMedia('(max-width: ' + MOBILE_BREAKPOINT + 'px)').matches;
  }

  function getOuterCards() {
    // cyberlab-layout.css visually merges Metadata + Connection into .lab-grid
    // on phones. Render that rounded wrapper as the glass surface and naturally
    // exclude its child .panel elements as nested candidates.
    const selector = isCyberLabMobile()
      ? BASE_CARD_SELECTOR + ', .lab-grid'
      : BASE_CARD_SELECTOR;
    const candidates = Array.from(document.querySelectorAll(selector));
    const candidateSet = new Set(candidates);

    return candidates.filter((card) => {
      let parent = card.parentElement;
      while (parent && parent !== document.body) {
        if (candidateSet.has(parent)) return false;
        parent = parent.parentElement;
      }
      return true;
    });
  }

  function liftNormalPageContent(wallpaper, canvas) {
    Array.from(document.body.children).forEach((child) => {
      if (child === wallpaper || child === canvas) return;
      if (getComputedStyle(child).position === 'static') {
        child.classList.add('liquid-page-content');
      }
    });
  }

  function viewportPageOffset() {
    const vv = window.visualViewport;
    if (vv && Number.isFinite(vv.pageLeft) && Number.isFinite(vv.pageTop)) {
      return { x: vv.pageLeft, y: vv.pageTop };
    }
    return {
      x: window.scrollX || window.pageXOffset || 0,
      y: window.scrollY || window.pageYOffset || 0
    };
  }

  function start() {
    const cards = getOuterCards();
    if (!cards.length) return;

    const wallpaper = document.createElement('div');
    wallpaper.id = 'liquid-glass-wallpaper';
    wallpaper.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.id = 'liquid-glass-stage';
    canvas.setAttribute('aria-hidden', 'true');

    document.body.insertBefore(canvas, document.body.firstChild);
    document.body.insertBefore(wallpaper, canvas);
    liftNormalPageContent(wallpaper, canvas);

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance'
    });

    // Some in-app browsers disable WebGL. Keep the wallpaper and the site's
    // original CSS cards instead of turning the entire page black.
    if (!gl) {
      console.warn('Liquid Glass WebGL unavailable; using normal card fallback.');
      canvas.remove();
      document.documentElement.classList.add('liquid-webgl-unavailable');
      return;
    }

    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
      }
    } catch (error) {
      console.error('Liquid Glass reference shader failed:', error);
      canvas.remove();
      document.documentElement.classList.add('liquid-webgl-unavailable');
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW
    );

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      center: gl.getUniformLocation(program, 'uGlassCenter'),
      size: gl.getUniformLocation(program, 'uGlassSize'),
      radius: gl.getUniformLocation(program, 'uRadius'),
      bezel: gl.getUniformLocation(program, 'uBezel'),
      thickness: gl.getUniformLocation(program, 'uThickness'),
      ior: gl.getUniformLocation(program, 'uIOR'),
      blur: gl.getUniformLocation(program, 'uBlur'),
      specular: gl.getUniformLocation(program, 'uSpecular'),
      tint: gl.getUniformLocation(program, 'uTint'),
      shadow: gl.getUniformLocation(program, 'uShadow'),
      bgTex: gl.getUniformLocation(program, 'uBgTex'),
      bgAspect: gl.getUniformLocation(program, 'uBgAspect')
    };

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.decoding = 'async';
    const cardGeometry = new Map();

    function measureCardGeometry() {
      const page = viewportPageOffset();
      cardGeometry.clear();

      cards.forEach((card) => {
        if (!card.isConnected) return;
        const rect = card.getBoundingClientRect();
        const style = getComputedStyle(card);

        cardGeometry.set(card, {
          left: rect.left + page.x,
          top: rect.top + page.y,
          width: rect.width,
          height: rect.height,
          radius: Math.max(1, parseFloat(style.borderTopLeftRadius) || 20)
        });
      });
    }

    image.addEventListener('error', () => {
      console.error('Liquid Glass wallpaper failed to load:', BACKDROP_URL);
      canvas.remove();
      document.documentElement.classList.add('liquid-webgl-unavailable');
    }, { once: true });

    image.addEventListener('load', () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(u.bgTex, 0);
      gl.uniform1f(u.bgAspect, image.naturalWidth / image.naturalHeight);

      measureCardGeometry();
      cards.forEach((card) => card.classList.add('liquid-webgl-surface'));
      document.documentElement.classList.add('archis-webgl-ready');
      requestAnimationFrame(render);
    }, { once: true });

    image.src = BACKDROP_URL;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.SCISSOR_TEST);

    let lastWidth = 0;
    let lastHeight = 0;
    let running = true;
    let geometryTimer = 0;

    function resize(stageRect) {
      const mobile = stageRect.width <= MOBILE_BREAKPOINT;
      // 1.25x was visibly stair-stepping on Retina phones. 1.75x is a useful
      // quality bump without going all the way to native 3x resolution.
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 1.5);
      const width = Math.max(1, Math.round(stageRect.width * dpr));
      const height = Math.max(1, Math.round(stageRect.height * dpr));

      if (width !== lastWidth || height !== lastHeight) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        lastWidth = width;
        lastHeight = height;
      }
      return { dpr, mobile };
    }

    function render() {
      if (!running || !canvas.isConnected) return;

      // One viewport measurement remains, but card layout is no longer queried
      // during scrolling. Their document-space boxes are cached and translated
      // with the current page offset instead.
      const stageRect = canvas.getBoundingClientRect();
      if (stageRect.width <= 1 || stageRect.height <= 1) {
        requestAnimationFrame(render);
        return;
      }

      const size = resize(stageRect);
      const dpr = size.dpr;
      const mobile = size.mobile;
      const page = viewportPageOffset();

      gl.useProgram(program);
      gl.clearColor(0, 0, 0, 0);
      gl.scissor(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(u.resolution, stageRect.width, stageRect.height);
      gl.uniform1f(u.thickness, SETTINGS.thickness);
      gl.uniform1f(u.bezel, SETTINGS.bezel);
      gl.uniform1f(u.ior, SETTINGS.ior);
      gl.uniform1f(u.blur, mobile ? SETTINGS.mobileBlur : SETTINGS.blur);
      gl.uniform1f(u.specular, SETTINGS.specular);
      gl.uniform1f(u.tint, SETTINGS.tint);
      gl.uniform1f(u.shadow, SETTINGS.shadow);
      gl.uniform1f(u.bgAspect, image.naturalWidth / image.naturalHeight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      for (const card of cards) {
        if (!card.isConnected) continue;
        const geometry = cardGeometry.get(card);
        if (!geometry) continue;

        const left = geometry.left - page.x - stageRect.left;
        const top = geometry.top - page.y - stageRect.top;
        const width = geometry.width;
        const height = geometry.height;
        const right = left + width;
        const bottom = top + height;

        if (
          bottom < -SHADOW_MARGIN ||
          top > stageRect.height + SHADOW_MARGIN ||
          right < -SHADOW_MARGIN ||
          left > stageRect.width + SHADOW_MARGIN
        ) continue;

        const centerX = left + width * 0.5;
        const centerY = top + height * 0.5;

        const sx = Math.max(0, Math.floor((left - SHADOW_MARGIN) * dpr));
        const sy = Math.max(
          0,
          Math.floor((stageRect.height - (top + height + SHADOW_MARGIN)) * dpr)
        );
        const sr = Math.min(
          canvas.width,
          Math.ceil((left + width + SHADOW_MARGIN) * dpr)
        );
        const st = Math.min(
          canvas.height,
          Math.ceil((stageRect.height - (top - SHADOW_MARGIN)) * dpr)
        );
        const sw = Math.max(0, sr - sx);
        const sh = Math.max(0, st - sy);
        if (!sw || !sh) continue;

        gl.scissor(sx, sy, sw, sh);
        gl.uniform2f(u.center, centerX, centerY);
        gl.uniform2f(u.size, width, height);
        gl.uniform1f(u.radius, geometry.radius);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      requestAnimationFrame(render);
    }

    function scheduleGeometryMeasure(delay) {
      window.clearTimeout(geometryTimer);
      geometryTimer = window.setTimeout(measureCardGeometry, delay == null ? 60 : delay);
    }

    // Geometry is refreshed only when layout can actually change. Ordinary
    // scrolling never asks every card for getBoundingClientRect().
    window.addEventListener('resize', () => scheduleGeometryMeasure(100), { passive: true });
    window.addEventListener('load', () => scheduleGeometryMeasure(0), { once: true });
    document.addEventListener('toggle', () => scheduleGeometryMeasure(20), true);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => scheduleGeometryMeasure(100), { passive: true });
    }

    let resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => scheduleGeometryMeasure(40));
      cards.forEach((card) => resizeObserver.observe(card));
      resizeObserver.observe(document.documentElement);
    }

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      document.documentElement.classList.remove('archis-webgl-ready');
      document.documentElement.classList.add('liquid-webgl-unavailable');
    });

    window.addEventListener('pagehide', () => {
      running = false;
      window.clearTimeout(geometryTimer);
      if (resizeObserver) resizeObserver.disconnect();
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.loseContext();
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
