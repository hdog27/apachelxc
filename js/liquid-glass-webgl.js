(function () {
  'use strict';

  const MAX_GLASS = 16;
  const selector = [
    '.card', '.panel', '.identity-hero', '.project-featured', '.project-card',
    '.projects-hero', '.contact-card', '.credential-card', '.device-box',
    '.repo-embed', '.protocol-cards > div'
  ].join(',');

  const vertexSource = `
    attribute vec2 aPosition;
    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
  `;

  const fragmentSource = `
    precision highp float;
    #define MAX_GLASS 16
    uniform vec2 uResolution;
    uniform float uTime;
    uniform int uGlassCount;
    uniform vec4 uGlassRects[MAX_GLASS];
    uniform float uGlassRadii[MAX_GLASS];

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float roundedBox(vec2 p, vec2 halfSize, float radius) {
      vec2 q = abs(p) - halfSize + radius;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
    }

    vec3 backdrop(vec2 pixel) {
      vec2 uv = pixel / uResolution;
      vec3 color = vec3(.018, .052, .095);
      float leftGlow = max(0.0, 1.0 - length((uv - vec2(.16,.18)) * vec2(1.0,.72)) / .72);
      float rightGlow = max(0.0, 1.0 - length((uv - vec2(.88,.24)) * vec2(1.0,.8)) / .65);
      color += vec3(.025,.22,.58) * leftGlow * leftGlow;
      color += vec3(.20,.07,.34) * rightGlow * rightGlow;

      vec2 moving = pixel + vec2(0.0, uTime * 7.0);
      vec2 cell = floor(moving / 38.0);
      vec2 local = fract(moving / 38.0) - .5;
      float chance = step(.947, hash(cell));
      vec2 starPos = vec2(hash(cell + 7.1), hash(cell + 19.7)) - .5;
      float star = chance * smoothstep(.075, .0, length(local - starPos));
      float twinkle = .55 + .45 * sin(uTime * (1.2 + hash(cell) * 2.4) + hash(cell + 4.0) * 6.283);
      color += vec3(.72,.88,1.0) * star * twinkle;
      return color;
    }

    void main() {
      vec2 pixel = gl_FragCoord.xy;
      float bestSd = 100000.0;
      vec2 bestCenter = vec2(0.0);
      vec2 bestHalf = vec2(1.0);
      float bestRadius = 1.0;

      for (int i = 0; i < MAX_GLASS; i++) {
        if (i >= uGlassCount) break;
        vec4 rect = uGlassRects[i];
        vec2 center = rect.xy + rect.zw * .5;
        vec2 halfSize = rect.zw * .5;
        float sd = roundedBox(pixel - center, halfSize, uGlassRadii[i]);
        if (sd < bestSd) {
          bestSd = sd;
          bestCenter = center;
          bestHalf = halfSize;
          bestRadius = uGlassRadii[i];
        }
      }

      if (bestSd > 24.0) {
        gl_FragColor = vec4(backdrop(pixel), 1.0);
        return;
      }

      float eps = 1.25;
      vec2 p = pixel - bestCenter;
      vec2 normal = normalize(vec2(
        roundedBox(p + vec2(eps,0.0), bestHalf, bestRadius) - roundedBox(p - vec2(eps,0.0), bestHalf, bestRadius),
        roundedBox(p + vec2(0.0,eps), bestHalf, bestRadius) - roundedBox(p - vec2(0.0,eps), bestHalf, bestRadius)
      ));
      float inside = smoothstep(2.0, -2.0, bestSd);
      float edgeDepth = 1.0 - smoothstep(0.0, min(70.0, min(bestHalf.x,bestHalf.y)), -bestSd);
      float lens = pow(edgeDepth, 1.6) * inside;
      vec2 displacement = -normal * (5.0 + 23.0 * lens);

      vec3 base = backdrop(pixel + displacement);
      vec3 split;
      split.r = backdrop(pixel + displacement * 1.11).r;
      split.g = base.g;
      split.b = backdrop(pixel + displacement * .89).b;
      vec3 glass = mix(base, split, .62);
      glass = mix(glass, vec3(.06,.12,.19), .13);

      vec2 lightDirection = normalize(vec2(-.55,.83));
      float specular = pow(max(0.0, dot(normal, lightDirection)), 22.0) * lens;
      float rim = pow(lens, 2.2);
      glass += vec3(.72,.9,1.0) * specular * .62;
      glass += vec3(.36,.65,.94) * rim * .18;

      float shadow = exp(-max(bestSd, 0.0) * max(bestSd, 0.0) / 130.0) * step(0.0, bestSd) * .32;
      vec3 outside = backdrop(pixel) * (1.0 - shadow);
      gl_FragColor = vec4(mix(outside, glass, inside * .92), 1.0);
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  function start() {
    const canvas = document.createElement('canvas');
    canvas.id = 'liquid-glass-stage';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) { canvas.remove(); return; }

    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch (error) {
      console.error('Liquid Glass shader failed:', error);
      canvas.remove();
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const countLocation = gl.getUniformLocation(program, 'uGlassCount');
    const rectsLocation = gl.getUniformLocation(program, 'uGlassRects[0]');
    const radiiLocation = gl.getUniformLocation(program, 'uGlassRadii[0]');
    const rectData = new Float32Array(MAX_GLASS * 4);
    const radiusData = new Float32Array(MAX_GLASS);
    let surfaces = [];
    let lastScan = 0;

    function scan() {
      surfaces = Array.from(document.querySelectorAll(selector)).filter((surface) => {
        const rect = surface.getBoundingClientRect();
        return rect.width > 2 && rect.height > 2;
      }).slice(0, MAX_GLASS);
      surfaces.forEach((surface) => surface.classList.add('liquid-webgl-surface'));
    }

    function resize() {
      const dprLimit = innerWidth < 768 ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprLimit);
      const width = Math.round(innerWidth * dpr);
      const height = Math.round(innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      return dpr;
    }

    function render(now) {
      const dpr = resize();
      if (now - lastScan > 1000) { scan(); lastScan = now; }
      rectData.fill(0); radiusData.fill(0);
      const visibleSurfaces = surfaces.filter((surface) => {
        const rect = surface.getBoundingClientRect();
        return rect.bottom > -30 && rect.top < innerHeight + 30 && rect.right > -30 && rect.left < innerWidth + 30;
      }).slice(0, MAX_GLASS);
      visibleSurfaces.forEach((surface, index) => {
        const rect = surface.getBoundingClientRect();
        const style = getComputedStyle(surface);
        rectData.set([rect.left*dpr, (innerHeight-rect.bottom)*dpr, rect.width*dpr, rect.height*dpr], index*4);
        radiusData[index] = (parseFloat(style.borderRadius) || 20) * dpr;
      });
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, now * .001);
      gl.uniform1i(countLocation, visibleSurfaces.length);
      gl.uniform4fv(rectsLocation, rectData);
      gl.uniform1fv(radiiLocation, radiusData);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    scan();
    document.documentElement.classList.add('archis-webgl-ready');
    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
