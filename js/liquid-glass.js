import { LiquidGlass } from './vendor/liquidglass.js';

const selector = [
  '.card', '.panel', '.identity-hero', '.project-featured', '.project-card',
  '.projects-hero', '.contact-card', '.credential-card', '.device-box',
  '.repo-embed', '.protocol-cards > div', '.top-nav .nav-btn'
].join(',');

const instances = [];
const sceneGroups = [];
let pageScene = null;
let sceneFrame = 0;

function configFor(card) {
  const compact = card.matches('.credential-card, .device-box, .repo-embed, .protocol-cards > div');
  const navigation = card.matches('.top-nav .nav-btn');
  return {
    blurAmount: navigation ? 0.06 : (compact ? 0.1 : 0.15),
    refraction: navigation ? 0.78 : (compact ? 0.88 : 1),
    chromAberration: navigation ? 0.07 : (compact ? 0.09 : 0.13),
    edgeHighlight: 0.28,
    specular: 0.48,
    fresnel: 1,
    distortion: compact ? 0.07 : 0.12,
    cornerRadius: parseFloat(getComputedStyle(card).borderRadius) || (navigation ? 999 : 22),
    zRadius: navigation ? 24 : (compact ? 34 : 58),
    opacity: navigation ? 0.48 : 0.56,
    saturation: 0.28,
    tintStrength: navigation ? 0.14 : 0.1,
    brightness: -0.16,
    shadowOpacity: 0.38,
    shadowSpread: compact ? 12 : 20,
    shadowOffsetY: compact ? 7 : 12,
    floating: false,
    button: navigation,
    bevelMode: 0
  };
}

function random(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function paintScene(canvas, offsetX, offsetY, cssWidth, cssHeight) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.ceil(cssWidth * dpr));
  canvas.height = Math.max(1, Math.ceil(cssHeight * dpr));
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  const context = canvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  context.fillStyle = '#06111f';
  context.fillRect(0, 0, cssWidth, cssHeight);

  const glowA = context.createRadialGradient(window.innerWidth * .2 - offsetX, window.innerHeight * .12 - offsetY, 0, window.innerWidth * .2 - offsetX, window.innerHeight * .12 - offsetY, window.innerWidth * .62);
  glowA.addColorStop(0, 'rgba(28,112,225,.52)');
  glowA.addColorStop(.48, 'rgba(20,72,150,.2)');
  glowA.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = glowA;
  context.fillRect(0, 0, cssWidth, cssHeight);

  const glowB = context.createRadialGradient(window.innerWidth * .86 - offsetX, window.innerHeight * .22 - offsetY, 0, window.innerWidth * .86 - offsetX, window.innerHeight * .22 - offsetY, window.innerWidth * .48);
  glowB.addColorStop(0, 'rgba(83,46,190,.28)');
  glowB.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = glowB;
  context.fillRect(0, 0, cssWidth, cssHeight);

  context.lineWidth = 1;
  context.strokeStyle = 'rgba(82,151,225,.13)';
  const grid = 52;
  for (let x = ((-offsetX % grid) + grid) % grid; x < cssWidth; x += grid) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, cssHeight); context.stroke();
  }
  for (let y = ((-offsetY % grid) + grid) % grid; y < cssHeight; y += grid) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(cssWidth, y); context.stroke();
  }

  const tile = 1400;
  const firstTileX = Math.floor(offsetX / tile) - 1;
  const firstTileY = Math.floor(offsetY / tile) - 1;
  for (let tx = firstTileX; tx <= Math.ceil((offsetX + cssWidth) / tile); tx++) {
    for (let ty = firstTileY; ty <= Math.ceil((offsetY + cssHeight) / tile); ty++) {
      for (let i = 0; i < 115; i++) {
        const seed = (tx + 19) * 92821 + (ty + 31) * 68917 + i * 131;
        const x = tx * tile + random(seed) * tile - offsetX;
        const y = ty * tile + random(seed + 1) * tile - offsetY;
        const radius = .55 + random(seed + 2) * 1.45;
        context.beginPath();
        context.fillStyle = `rgba(${185 + Math.floor(random(seed + 3) * 70)},${210 + Math.floor(random(seed + 4) * 45)},255,${.48 + random(seed + 5) * .5})`;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
}

function createPageScene() {
  const canvas = document.createElement('canvas');
  canvas.id = 'liquid-page-scene';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  paintScene(canvas, 0, 0, window.innerWidth, window.innerHeight);
  return canvas;
}

function refreshScenes() {
  sceneFrame = 0;
  if (pageScene) paintScene(pageScene, 0, 0, window.innerWidth, window.innerHeight);
  sceneGroups.forEach(({ root, source, instance }) => {
    const rect = root.getBoundingClientRect();
    paintScene(source, rect.left, rect.top, Math.max(1, rect.width), Math.max(1, rect.height));
    instance.markChanged(source);
  });
}

function requestSceneRefresh() {
  if (!sceneFrame) sceneFrame = requestAnimationFrame(refreshScenes);
}

function createLocalScene(root) {
  const rect = root.getBoundingClientRect();
  const source = document.createElement('canvas');
  source.className = 'liquid-scene-source';
  source.setAttribute('aria-hidden', 'true');
  paintScene(source, rect.left, rect.top, Math.max(1, rect.width), Math.max(1, rect.height));
  root.insertBefore(source, root.firstChild);
  return source;
}

async function startLiquidGlass() {
  pageScene = createPageScene();
  const cards = Array.from(document.querySelectorAll(selector));
  if (!cards.length) return;

  cards.forEach((card) => {
    card.classList.add('liquid-refract');
    card.dataset.config = JSON.stringify(configFor(card));
  });

  const groups = new Map();
  cards.forEach((card) => {
    const root = card.parentElement;
    if (!root) return;
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(card);
  });

  for (const [root, glassElements] of groups) {
    root.classList.add('liquid-glass-root');
    const source = root.querySelector(':scope > .liquid-scene-source') || createLocalScene(root);
    try {
      const instance = await LiquidGlass.init({ root, glassElements });
      instances.push(instance);
      sceneGroups.push({ root, source, instance });
    } catch (error) {
      console.error('WebGL Liquid Glass failed to initialise:', error);
    }
  }
  window.addEventListener('scroll', requestSceneRefresh, { passive: true });
  window.addEventListener('resize', requestSceneRefresh, { passive: true });
}

function boot() {
  requestAnimationFrame(() => requestAnimationFrame(startLiquidGlass));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.addEventListener('pagehide', () => {
  instances.forEach((instance) => instance.destroy());
}, { once: true });
