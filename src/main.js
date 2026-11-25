import 'inter-ui/inter-latin.css'; // Inter 3.19, the version the Figma file is set in
import '@fontsource/fira-code/500.css';
import './styles.css';
import gsap from 'gsap';
import { Hero, VERSIONS, STARTS } from './hero.js';

const DESIGN_WIDTH = 1440;
const frame = document.getElementById('frame');
const h1 = document.getElementById('h1');
const lead = document.getElementById('lead');
const buttons = [...document.querySelectorAll('.switch-btn[data-version]')];
const startButtons = [...document.querySelectorAll('.switch-btn[data-start]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Scale the 1440 px frame down to fit narrower windows. Wider windows keep it at 1:1, centred. */
const fit = () => {
  const scale = Math.min(1, document.documentElement.clientWidth / DESIGN_WIDTH);
  frame.style.zoom = scale === 1 ? '' : scale;
};
fit();
window.addEventListener('resize', fit);

/* Which opening to play. Remembered per browser; "type" is the default. */
let start = 'type';
try {
  const saved = localStorage.getItem('hero-start');
  if (STARTS.includes(saved)) start = saved;
} catch {
  /* storage is a convenience only */
}

const hero = new Hero({ h1, lead, measure: document.getElementById('measure'), reduceMotion, start });
if (import.meta.env.DEV) window.__hero = hero;

let current = VERSIONS[location.hash.slice(1)] ? location.hash.slice(1) : 'v1';
let pageCtx;
let ticket = 0;

const markActive = () => {
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.version === current)));
  startButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.start === hero.start)));
  try {
    history.replaceState(null, '', `#${current}`);
  } catch {
    /* hash is a convenience only */
  }
};

/** Full page entrance: nav, headline, copy, demo. Used on load and by Replay. */
function playPage() {
  ticket++;
  pageCtx?.revert();
  window.scrollTo({ top: 0, behavior: 'instant' });
  hero.render(current);
  markActive();
  if (reduceMotion) return;

  pageCtx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.nav-left > *, .nav-links > *, .nav-right > *', { y: -10, autoAlpha: 0, duration: 0.6, stagger: 0.03 }, 0)
      .add(hero.intro(), 0.15)
      .from(lead, { y: 16, autoAlpha: 0, duration: 0.8 }, 0.6)
      .from('.ctas > *', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.72)
      .from('.stage', { y: 56, autoAlpha: 0, duration: 1.2, ease: 'power4.out' }, 0.8)
      .from('.tabs', { y: 10, autoAlpha: 0, duration: 0.7 }, 1.15)
      .from('.window', { y: 36, scale: 0.985, autoAlpha: 0, duration: 1.2, ease: 'power4.out', transformOrigin: '50% 0%' }, 1.1)
      .from('.stage-caption', { autoAlpha: 0, duration: 0.6 }, 1.7);
    if (import.meta.env.DEV) window.__page = tl; // handy for scrubbing in the console: __page.pause().seek(2.5, false)
  });
}

/** Switching versions or openings: only the headline and the paragraph change. */
function switchTo(id) {
  if (id === current || !VERSIONS[id]) return;
  current = id;
  restartHero();
}

function setStart(mode) {
  if (mode === hero.start || !STARTS.includes(mode)) return;
  hero.start = mode;
  try {
    localStorage.setItem('hero-start', mode);
  } catch {
    /* storage is a convenience only */
  }
  restartHero();
}

async function restartHero() {
  const id = current;
  markActive();
  const mine = ++ticket;

  if (reduceMotion) {
    hero.render(id);
    return;
  }

  hero.destroy();
  await gsap.to([h1, lead], { autoAlpha: 0, y: -8, duration: 0.2, ease: 'power2.in', overwrite: true });
  if (mine !== ticket) return;

  hero.render(id);
  gsap.set([h1, lead], { autoAlpha: 1, y: 0 });
  hero.intro();
  gsap.fromTo(lead, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', delay: 0.35 });
}

buttons.forEach((b) => b.addEventListener('click', () => switchTo(b.dataset.version)));
startButtons.forEach((b) => b.addEventListener('click', () => setStart(b.dataset.start)));
document.getElementById('replay').addEventListener('click', playPage);
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (['1', '2', '3'].includes(e.key)) switchTo(`v${e.key}`);
  if (e.key.toLowerCase() === 'r') playPage();
  if (e.key.toLowerCase() === 's') setStart(hero.start === 'type' ? 'style' : 'type');
});
window.addEventListener('hashchange', () => switchTo(location.hash.slice(1)));

/* Logos sit below the fold: fade them in the first time they scroll into view. */
function revealLogos() {
  const logos = document.querySelector('.logos');
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const items = logos.querySelectorAll('.logos-title, .logo-cell');
  gsap.set(items, { autoAlpha: 0, y: 14 });
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.045 });
    },
    { threshold: 0.25 },
  );
  io.observe(logos);
}

/* Words are measured in the real typeface, so wait for it before the first frame. */
const fontsReady = Promise.race([
  Promise.all([document.fonts.load('600 64px Inter'), document.fonts.load('400 18px Inter')]),
  new Promise((resolve) => setTimeout(resolve, 2500)),
]);

fontsReady.then(() => {
  playPage();
  revealLogos();
});
