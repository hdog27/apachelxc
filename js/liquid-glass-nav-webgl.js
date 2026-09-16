(function () {
  'use strict';

  if (window.matchMedia('(max-width: 640px)').matches) return;

  const nav = document.querySelector('.top-nav');
  const buttons = Array.from(document.querySelectorAll('.top-nav .nav-btn'));
  if (!nav || !buttons.length) return;

  const BACKDROP_URL = '/images/liquid-glass-test-bg.jpg';
  const SHADOW_MARGIN = 24;
  const SETTINGS = {
    thickness: 50,
    bezel: 60,
    ior: 3.0,
    blur: 1.5,
    specular: 0.55,
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

  // Same archisvaze/liquid-glass refraction model used by the main card renderer.
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
      float sinR = clamp(sin(slopeAngle) / uIOR, -1.0, 1.0);
      float thetaR = asin(sinR);
      float displacement = h * uThickness * (tan(slopeAngle) - tan(thetaR));

      vec2 grad;
      float eps = 0.5;
      grad.x = sdRoundedRect(p + vec2(eps, 0.0), halfSize, uRadius) - sd;
      grad.y = sdRoundedRect(p + vec2(0.0, eps), halfSize, uRadius) - sd;
      grad = normalize(grad + vec2(0.00001));

      vec2 offset = -grad * displacement / uResolution;
      vec2 screenUV = screenPx / uResolution;
      vec3 color = sampleBgBlurred(screenUV + offset, uBlur);

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
      throw new Error(gl.getShaderInfoLog(shader) || 'Nav liquid-glass shader compilation failed');
    }
    return shader;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'liquid-glass-nav-stage';
  canvas.setAttribute('aria-hidden', 'true');
  nav.insertBefore(canvas, nav.firstChild);

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    canvas.remove();
    return;
  }

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Nav liquid-glass program link failed');
    }
  } catch (error) {
    console.error(error);
    canvas.remove();
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

  const geometry = new Map();
  let imageReady = false;
  let resizeTimer = 0;
  const image = new Image();
  image.decoding = 'async';

  function measure() {
    geometry.clear();
    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      geometry.set(button, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        radius: Math.max(1, parseFloat(style.borderTopLeftRadius) || 10)
      });
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    return dpr;
  }

  function render() {
    if (!imageReady || !canvas.isConnected) return;

    const dpr = resize();
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.scissor(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(u.resolution, window.innerWidth, window.innerHeight);
    gl.uniform1f(u.thickness, SETTINGS.thickness);
    gl.uniform1f(u.bezel, SETTINGS.bezel);
    gl.uniform1f(u.ior, SETTINGS.ior);
    gl.uniform1f(u.blur, SETTINGS.blur);
    gl.uniform1f(u.specular, SETTINGS.specular);
    gl.uniform1f(u.tint, SETTINGS.tint);
    gl.uniform1f(u.shadow, SETTINGS.shadow);
    gl.uniform1f(u.bgAspect, image.naturalWidth / image.naturalHeight);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    for (const button of buttons) {
      const rect = geometry.get(button);
      if (!rect) continue;

      const sx = Math.max(0, Math.floor((rect.left - SHADOW_MARGIN) * dpr));
      const sy = Math.max(0, Math.floor((window.innerHeight - (rect.top + rect.height + SHADOW_MARGIN)) * dpr));
      const sr = Math.min(canvas.width, Math.ceil((rect.left + rect.width + SHADOW_MARGIN) * dpr));
      const st = Math.min(canvas.height, Math.ceil((window.innerHeight - (rect.top - SHADOW_MARGIN)) * dpr));
      const sw = Math.max(0, sr - sx);
      const sh = Math.max(0, st - sy);
      if (!sw || !sh) continue;

      gl.scissor(sx, sy, sw, sh);
      gl.uniform2f(u.center, rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
      gl.uniform2f(u.size, rect.width, rect.height);
      gl.uniform1f(u.radius, rect.radius);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  image.addEventListener('load', () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u.bgTex, 0);
    gl.uniform1f(u.bgAspect, image.naturalWidth / image.naturalHeight);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.SCISSOR_TEST);

    imageReady = true;
    measure();
    buttons.forEach((button) => button.classList.add('liquid-nav-webgl-surface'));
    document.documentElement.classList.add('archis-nav-webgl-ready');
    render();
  }, { once: true });

  image.addEventListener('error', () => {
    canvas.remove();
  }, { once: true });

  image.src = BACKDROP_URL;

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      render();
    }, 80);
  }, { passive: true });

  window.addEventListener('pagehide', () => {
    window.clearTimeout(resizeTimer);
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) loseContext.loseContext();
  }, { once: true });
})();
