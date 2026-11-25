import 'inter-ui/inter-latin.css'; // Inter 3.19, the version the Figma file is set in
import '@fontsource/fira-code/500.css';
import './styles.css';
import { Hero, VERSIONS, STARTS } from './hero.js';

/* Nothing on the page is faded or slid in. Everything, including the whole headline,
   is visible from the first paint, with or without JavaScript. The only motion is
   inside the headline's highlighted phrase. */

const DESIGN_WIDTH = 1440;
const frame = document.getElementById('frame');
const versionButtons = [...document.querySelectorAll('.switch-btn[data-version]')];
const startButtons = [...document.querySelectorAll('.switch-btn[data-start]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Scale the 1440 px frame down to fit narrower windows. Wider windows keep it at 1:1, centred. */
const fit = () => {
  const scale = Math.min(1, document.documentElement.clientWidth / DESIGN_WIDTH);
  frame.style.zoom = scale === 1 ? '' : scale;
};
fit();
window.addEventListener('resize', fit);

/* Which option to play. Remembered per browser; "type" is the default. */
let start = 'type';
try {
  const saved = localStorage.getItem('hero-start');
  if (STARTS.includes(saved)) start = saved;
} catch {
  /* storage is a convenience only */
}

const hero = new Hero({
  h1: document.getElementById('h1'),
  lead: document.getElementById('lead'),
  measure: document.getElementById('measure'),
  reduceMotion,
  start,
});
if (import.meta.env.DEV) window.__hero = hero; // handy in the console: __hero.replace('governance.', 'security.')

let current = VERSIONS[location.hash.slice(1)] ? location.hash.slice(1) : 'v1';

/** Draws a version and plays its headline from the start. */
function show(id = current) {
  if (!VERSIONS[id]) return;
  current = id;
  hero.render(id);
  versionButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.version === id)));
  startButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.start === hero.start)));
  try {
    history.replaceState(null, '', `#${id}`);
  } catch {
    /* the hash is a convenience only */
  }
}

function setStart(mode) {
  if (!STARTS.includes(mode) || mode === hero.start) return;
  hero.start = mode;
  try {
    localStorage.setItem('hero-start', mode);
  } catch {
    /* storage is a convenience only */
  }
  show();
}

versionButtons.forEach((b) => b.addEventListener('click', () => show(b.dataset.version)));
startButtons.forEach((b) => b.addEventListener('click', () => setStart(b.dataset.start)));
document.getElementById('replay').addEventListener('click', () => show());
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const key = e.key.toLowerCase();
  if (['1', '2', '3'].includes(key)) show(`v${key}`);
  if (key === 's') setStart(hero.start === 'type' ? 'style' : 'type');
  if (key === 'r') show();
});
window.addEventListener('hashchange', () => location.hash.slice(1) !== current && show(location.hash.slice(1)));

/* Draw at once, then again when the headline typeface has loaded, because the
   highlight is sized from the measured width of each word. */
show();
document.fonts.load('600 64px Inter').then(() => show());
