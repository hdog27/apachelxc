(function () {
  'use strict';

  // v2 experiment: prove one card first. The page background and this shader
  // use the exact same image. No procedural stars, no DOM rasterization, no
  // scroll-time fallback to a different glass effect.
  const BACKDROP_URL = '/images/liquid-glass-test-bg.jpg';

  const vertexSource = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;

    uniform vec2 uCardResolution;
    uniform vec2 uCardOrigin;
    uniform vec2 uBackdropResolution;
    uniform vec2 uImageResolution;
    uniform float uRadius;
    uniform sampler2D uBackdrop;

    float roundedBox(vec2 p, vec2 halfSize, float radius) {
      vec2 q = abs(p) - halfSize + radius;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
    }

    // Match CSS background-position:center + background-size:cover exactly.
    vec2 coverUv(vec2 pixel) {
      vec2 screenUv = pixel / uBackdropResolution;
      float viewportAspect = uBackdropResolution.x / uBackdropResolution.y;
      float imageAspect = uImageResolution.x / uImageResolution.y;
      vec2 uv = screenUv;

      if (imageAspect > viewportAspect) {
        uv.x = 0.5 + (screenUv.x - 0.5) * (viewportAspect / imageAspect);
      } else {
        uv.y = 0.5 + (screenUv.y - 0.5) * (imageAspect / viewportAspect);
      }

      return clamp(uv, 0.0, 1.0);
    }

    vec3 sampleBackdrop(vec2 pixel) {
      return texture2D(uBackdrop, coverUv(pixel)).rgb;
    }

    void main() {
      vec2 localPixel = gl_FragCoord.xy;
      vec2 globalPixel = uCardOrigin + localPixel;
      vec2 halfSize = uCardResolution * 0.5;
      vec2 p = localPixel - halfSize;
      float radius = min(uRadius, min(halfSize.x, halfSize.y) - 1.0);
      float sd = roundedBox(p, halfSize - vec2(1.0), radius);

      // SDF gradient gives a continuous rounded-card surface normal. There is
      // no "nearest card" selection, so there cannot be a center seam/triangle.
      float eps = 1.25;
      vec2 grad = vec2(
        roundedBox(p + vec2(eps, 0.0), halfSize - vec2(1.0), radius) -
          roundedBox(p - vec2(eps, 0.0), halfSize - vec2(1.0), radius),
        roundedBox(p + vec2(0.0, eps), halfSize - vec2(1.0), radius) -
          roundedBox(p - vec2(0.0, eps), halfSize - vec2(1.0), radius)
      );
      vec2 normal = normalize(grad + vec2(0.0001));

      // Most of the bend lives near the rim; the middle stays readable.
      float edgeWidth = min(86.0, min(halfSize.x, halfSize.y) * 0.72);
      float edge = 1.0 - smoothstep(0.0, edgeWidth, max(-sd, 0.0));
      float bend = pow(edge, 1.7);
      vec2 displacement = -normal * (2.0 + 21.0 * bend);

      vec3 base = sampleBackdrop(globalPixel + displacement);
      vec3 soft = (
        base +
        sampleBackdrop(globalPixel + displacement + vec2(1.5, 0.0)) +
        sampleBackdrop(globalPixel + displacement - vec2(1.5, 0.0)) +
        sampleBackdrop(globalPixel + displacement + vec2(0.0, 1.5)) +
        sampleBackdrop(globalPixel + displacement - vec2(0.0, 1.5))
      ) / 5.0;

      vec3 split;
      split.r = sampleBackdrop(globalPixel + displacement * 1.10).r;
      split.g = base.g;
      split.b = sampleBackdrop(globalPixel + displacement * 0.90).b;

      vec3 glass = mix(base, soft, 0.22);
      glass = mix(glass, split, 0.34 * bend);

      // Keep the test card slightly darker than the raw wallpaper instead of
      // applying the lighter blue/purple wash from the previous renderer.
      glass *= 0.92;
      glass += vec3(0.008, 0.016, 0.028);

      vec2 lightDirection = normalize(vec2(-0.55, 0.83));
      float specular = pow(max(0.0, dot(normal, lightDirection)), 24.0) * bend;
      glass += vec3(0.72, 0.88, 1.0) * specular * 0.10;
      glass += vec3(0.18, 0.34, 0.58) * pow(bend, 2.3) * 0.08;

      gl_FragColor = vec4(glass, 1.0);
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

  function start() {
    // Keep this experiment isolated to the Cyber Lab landing page.
    if (!document.body.classList.contains('cyberlab')) return;

    // Prove the architecture on exactly one card before expanding it.
    const target = document.querySelector('.identity-hero');
    if (!target) return;

    const image = new Image();
    image.decoding = 'async';
    image.src = BACKDROP_URL;

    image.addEventListener('error', () => {
      console.error('Liquid glass test image is missing:', BACKDROP_URL);
    }, { once: true });

    image.addEventListener('load', () => init(target, image), { once: true });
  }

  function init(target, image) {
    const backdrop = document.createElement('div');
    backdrop.id = 'liquid-glass-test-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(backdrop, document.body.firstChild);

    // The WebGL canvas lives INSIDE the card now. The browser compositor moves
    // the canvas with the card during momentum scrolling, so the lens cannot
    // visually detach from the card even if JS is briefly throttled on iOS.
    const canvas = document.createElement('canvas');
    canvas.className = 'liquid-card-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    target.insertBefore(canvas, target.firstChild);

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      canvas.remove();
      backdrop.remove();
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
      console.error('Liquid glass shader failed:', error);
      canvas.remove();
      backdrop.remove();
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

    const uniforms = {
      cardResolution: gl.getUniformLocation(program, 'uCardResolution'),
      cardOrigin: gl.getUniformLocation(program, 'uCardOrigin'),
      backdropResolution: gl.getUniformLocation(program, 'uBackdropResolution'),
      imageResolution: gl.getUniformLocation(program, 'uImageResolution'),
      radius: gl.getUniformLocation(program, 'uRadius'),
      backdrop: gl.getUniformLocation(program, 'uBackdrop')
    };

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(uniforms.backdrop, 0);

    target.classList.add('liquid-webgl-surface');
    document.documentElement.classList.add('archis-webgl-ready');

    let lastDpr = 0;
    let running = true;

    function render() {
      if (!running || !canvas.isConnected) return;

      const canvasRect = canvas.getBoundingClientRect();
      const backdropRect = backdrop.getBoundingClientRect();

      if (
        canvasRect.width <= 1 || canvasRect.height <= 1 ||
        backdropRect.width <= 1 || backdropRect.height <= 1
      ) {
        requestAnimationFrame(render);
        return;
      }

      const dprCap = canvasRect.width < 768 ? 2 : 1.75;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const width = Math.max(1, Math.round(canvasRect.width * dpr));
      const height = Math.max(1, Math.round(canvasRect.height * dpr));

      if (canvas.width !== width || canvas.height !== height || lastDpr !== dpr) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        lastDpr = dpr;
      }

      // Both rects are measured in the same CSS viewport coordinate system.
      // The shader therefore samples the same point of the same wallpaper that
      // is physically behind this card.
      const originX = (canvasRect.left - backdropRect.left) * dpr;
      const originY = (backdropRect.bottom - canvasRect.bottom) * dpr;
      const style = getComputedStyle(target);
      const radius = Math.max(1, (parseFloat(style.borderTopLeftRadius) || 20) * dpr);

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform2f(uniforms.cardResolution, width, height);
      gl.uniform2f(uniforms.cardOrigin, originX, originY);
      gl.uniform2f(
        uniforms.backdropResolution,
        backdropRect.width * dpr,
        backdropRect.height * dpr
      );
      gl.uniform2f(uniforms.imageResolution, image.naturalWidth, image.naturalHeight);
      gl.uniform1f(uniforms.radius, radius);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    }

    // These direct renders supplement rAF during Safari viewport/scroll chrome
    // changes. The canvas itself is already glued to the card by layout.
    const renderImmediately = () => {
      if (running) render();
    };

    window.addEventListener('scroll', renderImmediately, { passive: true });
    window.addEventListener('resize', renderImmediately, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('scroll', renderImmediately, { passive: true });
      window.visualViewport.addEventListener('resize', renderImmediately, { passive: true });
    }

    window.addEventListener('pagehide', () => { running = false; }, { once: true });
    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
