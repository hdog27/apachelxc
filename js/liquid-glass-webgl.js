(function () {
  'use strict';

  // Temporary shared-image test for the liquid-glass renderer.
  // The CSS background and WebGL shader both use this exact same image so the
  // shader refracts real backdrop pixels instead of drawing a fake backdrop.
  const BACKDROP_URL = '/images/liquid-glass-test-bg.jpg';
  const MAX_GLASS = 16;
  const selector = [
    '.card', '.panel', '.identity-hero', '.project-featured', '.project-card',
    '.projects-hero', '.contact-card', '.credential-card', '.device-box',
    '.repo-embed', '.protocol-cards > div'
  ].join(',');

  const vertexSource = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    #define MAX_GLASS 16

    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
    uniform int uGlassCount;
    uniform vec4 uGlassRects[MAX_GLASS];
    uniform float uGlassRadii[MAX_GLASS];
    uniform sampler2D uBackdrop;

    float roundedBox(vec2 p, vec2 halfSize, float radius) {
      vec2 q = abs(p) - halfSize + radius;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
    }

    // Match CSS: background-position:center; background-size:cover.
    vec2 coverUv(vec2 pixel) {
      vec2 screenUv = pixel / uResolution;
      float viewportAspect = uResolution.x / uResolution.y;
      float imageAspect = uImageResolution.x / uImageResolution.y;
      vec2 uv = screenUv;

      if (imageAspect > viewportAspect) {
        uv.x = 0.5 + (screenUv.x - 0.5) * (viewportAspect / imageAspect);
      } else {
        uv.y = 0.5 + (screenUv.y - 0.5) * (imageAspect / viewportAspect);
      }

      return clamp(uv, 0.0, 1.0);
    }

    vec3 backdrop(vec2 pixel) {
      return texture2D(uBackdrop, coverUv(pixel)).rgb;
    }

    void main() {
      vec2 pixel = gl_FragCoord.xy;
      float found = 0.0;
      float sd = 100000.0;
      vec2 center = vec2(0.0);
      vec2 halfSize = vec2(1.0);
      float radius = 1.0;

      // Surfaces are filtered in JS so nested cards cannot become competing
      // lenses. That avoids the center seams/triangles caused by choosing the
      // "nearest" surface when two glass rectangles overlap.
      for (int i = 0; i < MAX_GLASS; i++) {
        if (i >= uGlassCount) break;
        vec4 rect = uGlassRects[i];
        vec2 thisCenter = rect.xy + rect.zw * 0.5;
        vec2 thisHalf = rect.zw * 0.5;
        float thisSd = roundedBox(pixel - thisCenter, thisHalf, uGlassRadii[i]);

        if (thisSd <= 0.0 && found < 0.5) {
          found = 1.0;
          sd = thisSd;
          center = thisCenter;
          halfSize = thisHalf;
          radius = uGlassRadii[i];
        }
      }

      if (found < 0.5) {
        gl_FragColor = vec4(0.0);
        return;
      }

      vec2 p = pixel - center;
      float epsilon = 1.2;
      vec2 normal = normalize(vec2(
        roundedBox(p + vec2(epsilon, 0.0), halfSize, radius) -
          roundedBox(p - vec2(epsilon, 0.0), halfSize, radius),
        roundedBox(p + vec2(0.0, epsilon), halfSize, radius) -
          roundedBox(p - vec2(0.0, epsilon), halfSize, radius)
      ) + vec2(0.0001));

      // Keep the center almost flat and bend the backdrop mostly near the rim.
      // This produces the glass edge without inventing a lighter card-wide
      // gradient or a second star field.
      float edge = smoothstep(-82.0, -2.0, sd);
      float bend = pow(edge, 1.85);
      vec2 displacement = -normal * (2.5 + 22.0 * bend);

      vec3 base = backdrop(pixel + displacement);
      vec3 split;
      split.r = backdrop(pixel + displacement * 1.11).r;
      split.g = base.g;
      split.b = backdrop(pixel + displacement * 0.89).b;

      vec3 glass = mix(base, split, 0.42);
      glass = mix(glass, vec3(0.025, 0.045, 0.075), 0.10);

      vec2 lightDirection = normalize(vec2(-0.55, 0.83));
      float specular = pow(max(0.0, dot(normal, lightDirection)), 24.0) * bend;
      glass += vec3(0.75, 0.91, 1.0) * specular * 0.10;
      glass += vec3(0.28, 0.53, 0.88) * pow(bend, 2.4) * 0.09;

      // Nearly opaque inside the lens so the undistorted CSS backdrop below it
      // cannot bleed through and create a doubled image.
      float alpha = 1.0 - smoothstep(-1.2, 0.0, sd) * 0.025;
      gl_FragColor = vec4(glass, alpha);
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function start() {
    const backdropElement = document.createElement('div');
    backdropElement.id = 'liquid-glass-test-backdrop';
    backdropElement.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(backdropElement, document.body.firstChild);

    const canvas = document.createElement('canvas');
    canvas.id = 'liquid-glass-stage';
    canvas.setAttribute('aria-hidden', 'true');
    backdropElement.insertAdjacentElement('afterend', canvas);

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      backdropElement.remove();
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
        throw new Error(gl.getProgramInfoLog(program));
      }
    } catch (error) {
      console.error('Liquid Glass shader failed:', error);
      backdropElement.remove();
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

    const locations = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      imageResolution: gl.getUniformLocation(program, 'uImageResolution'),
      count: gl.getUniformLocation(program, 'uGlassCount'),
      rects: gl.getUniformLocation(program, 'uGlassRects[0]'),
      radii: gl.getUniformLocation(program, 'uGlassRadii[0]'),
      backdrop: gl.getUniformLocation(program, 'uBackdrop')
    };

    const rectData = new Float32Array(MAX_GLASS * 4);
    const radiusData = new Float32Array(MAX_GLASS);
    let surfaces = [];

    function hasGlassAncestor(surface) {
      let parent = surface.parentElement;
      while (parent && parent !== document.body) {
        if (parent.matches && parent.matches(selector)) return true;
        parent = parent.parentElement;
      }
      return false;
    }

    function scan() {
      surfaces = Array.from(document.querySelectorAll(selector)).filter((surface) => {
        const rect = surface.getBoundingClientRect();
        return rect.width > 2 && rect.height > 2 && !hasGlassAncestor(surface);
      });

      surfaces.forEach((surface) => surface.classList.add('liquid-webgl-surface'));
    }

    scan();

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.decoding = 'async';

    image.addEventListener('error', () => {
      console.error('Liquid Glass test backdrop failed to load:', BACKDROP_URL);
      observer.disconnect();
      backdropElement.remove();
      canvas.remove();
    }, { once: true });

    image.addEventListener('load', () => {
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );
        gl.uniform1i(locations.backdrop, 0);
      } catch (error) {
        console.error('Liquid Glass backdrop upload failed:', error);
        observer.disconnect();
        backdropElement.remove();
        canvas.remove();
        return;
      }

      document.documentElement.classList.add('archis-texture-ready', 'archis-webgl-ready');
      requestAnimationFrame(render);
    }, { once: true });

    image.src = BACKDROP_URL;

    function render() {
      // Measure the canvas itself instead of assuming innerHeight/100vh. That
      // keeps WebGL coordinates and getBoundingClientRect() in the same space
      // when iOS Safari expands/collapses its browser chrome.
      const canvasRect = canvas.getBoundingClientRect();
      const mobile = canvasRect.width < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
      const width = Math.max(1, Math.round(canvasRect.width * dpr));
      const height = Math.max(1, Math.round(canvasRect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      rectData.fill(0);
      radiusData.fill(0);

      const visibleSurfaces = surfaces.filter((surface) => {
        const rect = surface.getBoundingClientRect();
        return (
          rect.bottom > canvasRect.top - 24 &&
          rect.top < canvasRect.bottom + 24 &&
          rect.right > canvasRect.left - 24 &&
          rect.left < canvasRect.right + 24
        );
      }).slice(0, MAX_GLASS);

      visibleSurfaces.forEach((surface, index) => {
        const rect = surface.getBoundingClientRect();
        const style = getComputedStyle(surface);
        rectData.set([
          (rect.left - canvasRect.left) * dpr,
          (canvasRect.bottom - rect.bottom) * dpr,
          rect.width * dpr,
          rect.height * dpr
        ], index * 4);
        radiusData[index] = (parseFloat(style.borderRadius) || 20) * dpr;
      });

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(locations.resolution, width, height);
      gl.uniform2f(locations.imageResolution, image.naturalWidth, image.naturalHeight);
      gl.uniform1i(locations.count, visibleSurfaces.length);
      gl.uniform4fv(locations.rects, rectData);
      gl.uniform1fv(locations.radii, radiusData);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
