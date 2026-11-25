import 'inter-ui/inter-latin.css'; // Inter 3.19, the version the Figma file is set in
import '@fontsource/fira-code/500.css';
import './styles.css';
import { Hero, VERSIONS } from './hero.js';

/* Nothing on the page is animated in. Everything is visible from the first paint,
   with or without JavaScript. The only motion is the word swap in the headline. */

const DESIGN_WIDTH = 1440;
const frame = document.getElementById('frame');
const buttons = [...document.querySelectorAll('.switch-btn[data-version]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Scale the 1440 px frame down to fit narrower windows. Wider windows keep it at 1:1, centred. */
const fit = () => {
  const scale = Math.min(1, document.documentElement.clientWidth / DESIGN_WIDTH);
  frame.style.zoom = scale === 1 ? '' : scale;
};
fit();
window.addEventListener('resize', fit);

const hero = new Hero({
  h1: document.getElementById('h1'),
  lead: document.getElementById('lead'),
  measure: document.getElementById('measure'),
  reduceMotion,
});
if (import.meta.env.DEV) window.__hero = hero; // handy in the console: __hero.replace('governance.', 'security.')

let current = VERSIONS[location.hash.slice(1)] ? location.hash.slice(1) : 'v1';

/** Shows a version straight away, in its finished state. */
function show(id) {
  if (!VERSIONS[id]) return;
  current = id;
  hero.render(id);
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.version === id)));
  try {
    history.replaceState(null, '', `#${id}`);
  } catch {
    /* the hash is a convenience only */
  }
}

buttons.forEach((b) => b.addEventListener('click', () => b.dataset.version !== current && show(b.dataset.version)));
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (['1', '2', '3'].includes(e.key) && `v${e.key}` !== current) show(`v${e.key}`);
});
window.addEventListener('hashchange', () => location.hash.slice(1) !== current && show(location.hash.slice(1)));

/* Draw at once, then again when the headline typeface has loaded, because the
   highlight is sized from the measured width of each word. */
show(current);
document.fonts.load('600 64px Inter').then(() => show(current));
