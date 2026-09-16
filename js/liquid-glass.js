import { LiquidGlass } from './vendor/liquidglass.js';

const selector = [
  '.card', '.panel', '.identity-hero', '.project-featured', '.project-card',
  '.projects-hero', '.contact-card', '.credential-card', '.device-box',
  '.repo-embed', '.protocol-cards > div'
].join(',');

const instances = [];

function configFor(card) {
  const compact = card.matches('.credential-card, .device-box, .repo-embed, .protocol-cards > div');
  return {
    blurAmount: compact ? 0.14 : 0.22,
    refraction: compact ? 0.62 : 0.82,
    chromAberration: compact ? 0.035 : 0.065,
    edgeHighlight: 0.16,
    specular: 0.3,
    fresnel: 0.92,
    distortion: compact ? 0.025 : 0.052,
    cornerRadius: parseFloat(getComputedStyle(card).borderRadius) || 22,
    zRadius: compact ? 26 : 44,
    opacity: 0.98,
    saturation: 0.2,
    tintStrength: 0.11,
    brightness: 0.025,
    shadowOpacity: 0.38,
    shadowSpread: compact ? 12 : 20,
    shadowOffsetY: compact ? 7 : 12,
    floating: true,
    button: false,
    bevelMode: 0
  };
}

async function startLiquidGlass() {
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
    try {
      instances.push(await LiquidGlass.init({ root, glassElements }));
    } catch (error) {
      console.error('WebGL Liquid Glass failed to initialise:', error);
    }
  }
}

function boot() {
  requestAnimationFrame(() => requestAnimationFrame(startLiquidGlass));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.addEventListener('pagehide', () => {
  instances.forEach((instance) => instance.destroy());
}, { once: true });
