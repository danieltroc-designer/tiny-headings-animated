import gsap from 'gsap';

/* ------------------------------------------------------------------
   Copy for the three versions (from Figma, "3 Headings + Demo").
   `words` holds the typed phrase. More than one entry makes it rotate.
------------------------------------------------------------------- */
export const VERSIONS = {
  v1: {
    line1: 'Your app. Our enterprise-ready',
    prefix: '',
    words: ['editing engine.'],
    lead: 'Embed the TinyMCE rich text editor in minutes and extend it with 50+ plugins.<br>SOC 2 Type 2, HIPAA, GDPR and self-hosting are in place.',
  },
  v2: {
    line1: 'Your editor. Our engine.',
    prefix: 'Enterprise-grade',
    words: ['governance.', 'security.', 'accessibility.', 'support.', 'self-hosting.'],
    lead: 'Embeddable rich text editor in minutes, 50+ plugins out of the box. Every paste comes out as clean HTML, with SOC 2 Type 2, HIPAA and GDPR behind it.',
  },
  v3: {
    line1: 'You build the app.',
    prefix: 'We bring',
    words: ['the editor.'],
    lead: 'A rich text editor in a few lines of code, with 400+ APIs to make it yours. SOC 2 Type 2, GDPR and self-hosting come with it, so your engineers stay on your product.',
  },
};

/* ------------------------------------------------------------------
   Timing, in seconds. Tune the feel here.
------------------------------------------------------------------- */
export const TIMING = {
  rise: 0.9, // each word of the headline rising in
  riseStagger: 0.055,
  beforeSelect: 0.45, // pause between the headline landing and the selection
  select: 0.32, // selection sweeping across the phrase
  selectHold: 0.2, // phrase stays selected
  remove: 0.16, // selection collapsing (the phrase is deleted)
  blink: 0.18, // one half of a caret blink while it waits to type
  blinks: 2, // how many times the caret blinks before typing
  key: 0.062, // average time per typed character
  keyJitter: 0.03, // random variation per character
  hold: 2.3, // how long a finished word stays before the next swap (V2)
};

/* Pill geometry from Figma: 18 px left, 20 px right, 5 px gap to a 3 px caret. */
const PAD_L = 18;
const PAD_R = 20;
const CARET_GAP = 5;
const CARET_W = 3;
/* Browsers trim the (negative) letter-spacing after the last character and Figma does not.
   Adding it back keeps the pill the exact width drawn in Figma: 64 px × 2.5%. */
const TRAIL = 1.6;

const FLAG = `<svg class="caret-flag" viewBox="0 0 17 17" aria-hidden="true"><path d="M11.2347 0C14.1246 0.0163268 16.98 2.37143 16.98 5.80309C16.98 5.80309 16.9978 6.67505 17 7.72983V8.17071C16.9995 8.36937 16.9978 8.57075 16.9961 8.77105L16.9922 9.07042C16.9795 9.91294 16.9495 10.6973 16.8867 11.1055C16.4871 13.7273 14.4898 15.5392 11.7365 15.9985C9.25521 16.4742 7.7842 16.7496 7.30847 16.8416C7.10474 16.8835 6.20381 17 5.81301 17C2.78773 17 0.0427414 14.7794 0 11.1969V10.6085L0.000554162 10.5073V10.2863C0.00166596 9.90043 0.00277435 9.42745 0.00499455 8.94088L0.00666059 8.64749C0.011101 7.71732 0.0194276 6.78932 0.0344148 6.36262C0.136 3.74898 1.98006 1.63664 5.48995 0.960109L9.95965 0.108854C10.3677 0.033201 10.8184 0 11.2347 0Z"/></svg>`;

const wrapWords = (text) =>
  text
    .split(' ')
    .map((w) => `<span class="w"><span class="w-in">${w}</span></span>`)
    .join(' ');

/* Small deterministic random, so the typing rhythm is the same on every replay. */
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

export class Hero {
  constructor({ h1, lead, measure, reduceMotion = false }) {
    this.h1 = h1;
    this.lead = lead;
    this.measureEl = measure;
    this.reduceMotion = reduceMotion;
    this.live = new Set();
    this.cache = new Map();
  }

  /* ---------- measuring ---------- */

  /** Width of every prefix of `word` in headline type: [0, w1, w2, … full]. */
  widths(word) {
    if (this.cache.has(word)) return this.cache.get(word);
    const el = this.measureEl;
    el.textContent = word;
    const node = el.firstChild;
    const range = document.createRange();
    const out = [0];
    for (let i = 1; i <= word.length; i++) {
      range.setStart(node, 0);
      range.setEnd(node, i);
      out.push(range.getBoundingClientRect().width);
    }
    out[word.length] = el.getBoundingClientRect().width;
    this.cache.set(word, out);
    return out;
  }

  pillWidth(word, chars = word.length) {
    return PAD_L + this.widths(word)[chars] + TRAIL + PAD_R;
  }

  slotWidth(word) {
    return this.pillWidth(word) + CARET_GAP + CARET_W;
  }

  /* ---------- lifecycle ---------- */

  track(anim) {
    this.live.add(anim);
    return anim;
  }

  destroy() {
    this.live.forEach((a) => a.kill());
    this.live.clear();
    this.blinkTl?.kill();
    this.blinkTl = null;
    clearInterval(this.reducedTimer);
  }

  render(id) {
    this.destroy();
    this.cache.clear();
    const v = VERSIONS[id];
    this.version = v;
    this.index = 0;

    const all = v.words.length > 1 ? v.words.join(' / ') : v.words[0];
    this.h1.setAttribute('aria-label', `${v.line1} ${v.prefix ? v.prefix + ' ' : ''}${all}`);
    this.h1.innerHTML = `
      <span class="h1-line h1-line--1" aria-hidden="true">${wrapWords(v.line1)}</span>
      <span class="h1-line h1-line--2" aria-hidden="true">
        ${v.prefix ? `<span class="h1-static">${wrapWords(v.prefix)}</span>` : ''}
        <span class="slot-mask"><span class="slot">
          <span class="pill"><span class="t t-blue"></span></span>
          <span class="t t-ink"></span>
          <span class="sel"><span class="t t-sel"></span></span>
          <span class="caret"><span class="caret-line"></span>${FLAG}</span>
        </span></span>
      </span>`;
    this.lead.innerHTML = v.lead;

    const q = (s) => this.h1.querySelector(s);
    this.el = {
      mask: q('.slot-mask'),
      slot: q('.slot'),
      pill: q('.pill'),
      blue: q('.t-blue'),
      ink: q('.t-ink'),
      sel: q('.sel'),
      selText: q('.t-sel'),
      caret: q('.caret'),
      flag: q('.caret-flag'),
    };

    if (this.reduceMotion) {
      this.setRest(v.words[0]);
      this.el.mask.classList.add('is-open');
      if (v.words.length > 1) {
        this.reducedTimer = setInterval(() => {
          this.index = (this.index + 1) % v.words.length;
          this.setRest(v.words[this.index]);
        }, 3000);
      }
    } else {
      this.setPlain(v.words[0]);
    }
  }

  /* ---------- static states ---------- */

  /** Opening frame: the phrase as ordinary headline text. No pill, no caret. */
  setPlain(word) {
    const { slot, pill, blue, ink, sel, selText, caret } = this.el;
    const pw = this.pillWidth(word);
    gsap.set(slot, { width: this.slotWidth(word) });
    gsap.set(pill, { width: pw, autoAlpha: 0 });
    blue.textContent = word;
    blue.style.setProperty('--reveal', '0px');
    ink.textContent = word;
    gsap.set(ink, { autoAlpha: 1 });
    selText.textContent = word;
    gsap.set(sel, { width: pw, '--sel-l': '100%', '--sel-r': '0%' });
    gsap.set(caret, { x: pw + CARET_GAP, autoAlpha: 0 });
  }

  /** Resting frame, as drawn in Figma: cobalt phrase on the pale pill, caret at the end. */
  setRest(word) {
    const { slot, pill, blue, ink, sel, selText, caret } = this.el;
    const pw = this.pillWidth(word);
    gsap.set(slot, { width: this.slotWidth(word) });
    gsap.set(pill, { width: pw, autoAlpha: 1 });
    blue.textContent = word;
    blue.style.setProperty('--reveal', `${this.widths(word)[word.length] + 8}px`);
    gsap.set(ink, { autoAlpha: 0 });
    selText.textContent = word;
    gsap.set(sel, { width: pw, '--sel-l': '100%', '--sel-r': '0%' });
    gsap.set(caret, { x: pw + CARET_GAP, autoAlpha: 1 });
  }

  /* ---------- caret ---------- */

  startBlink() {
    this.stopBlink();
    this.blinkTl = gsap
      .timeline({ repeat: -1 })
      .to(this.el.caret, { autoAlpha: 0, duration: 0.09, ease: 'none' }, 0.56)
      .to(this.el.caret, { autoAlpha: 1, duration: 0.09, ease: 'none' }, 1.1)
      .to({}, { duration: 0.01 }, 1.21);
  }

  stopBlink() {
    this.blinkTl?.kill();
    this.blinkTl = null;
  }

  /* ---------- the sequence: select → remove → blink → type ---------- */

  replace(fromWord, toWord, { fromPlain = false } = {}) {
    const T = TIMING;
    const { slot, pill, blue, ink, sel, selText, caret, flag } = this.el;
    const fromPill = this.pillWidth(fromWord);
    const toWidths = this.widths(toWord);
    const rand = seeded(toWord.length * 97 + toWord.charCodeAt(0));
    const tl = gsap.timeline();

    // Set the scene. The caret arrives first if the phrase started as plain text.
    tl.call(() => {
      this.stopBlink();
      selText.textContent = fromWord;
    }).set(sel, { width: fromPill, '--sel-l': '100%', '--sel-r': '0%' });
    if (fromPlain) {
      tl.set(caret, { x: fromPill + CARET_GAP })
        .to(caret, { autoAlpha: 1, duration: 0.14, ease: 'none' })
        .fromTo(flag, { scale: 0 }, { scale: 1, duration: 0.42, ease: 'back.out(2.4)' }, '<')
        .to({}, { duration: 0.28 });
    } else {
      tl.set(caret, { autoAlpha: 1 });
    }

    // 1. Select: the selection grows from the caret back to the start of the phrase.
    tl.addLabel('select')
      .to(sel, { '--sel-l': '0%', duration: T.select, ease: 'power2.inOut' }, 'select')
      .to(caret, { x: 0, duration: T.select, ease: 'power2.inOut' }, 'select')
      // Hidden behind the selection: swap what sits underneath.
      .set(ink, { autoAlpha: 0 })
      .set(pill, { width: 0, autoAlpha: 0 })
      .set(blue, { '--reveal': '0px' })
      .call(() => {
        blue.textContent = toWord;
      })
      .to({}, { duration: T.selectHold });

    // 2. Remove: the selection collapses onto the caret, and the line settles to the new width.
    tl.addLabel('remove')
      .to(sel, { '--sel-r': '100%', duration: T.remove, ease: 'power2.in' }, 'remove')
      .to(slot, { width: this.slotWidth(toWord), duration: 0.6, ease: 'power3.inOut' }, 'remove');

    // 3. Blink: the caret waits with the logo flag on top.
    tl.addLabel('blink', `remove+=${T.remove}`).fromTo(
      flag,
      { scale: 0.45 },
      { scale: 1, duration: 0.5, ease: 'back.out(3)' },
      'blink',
    );
    let t = tl.labels.blink + T.blink;
    for (let i = 0; i < T.blinks; i++) {
      tl.to(caret, { autoAlpha: 0, duration: 0.07, ease: 'none' }, t);
      tl.to(caret, { autoAlpha: 1, duration: 0.07, ease: 'none' }, t + T.blink);
      t += T.blink * 2;
    }

    // 4. Type: one character at a time, the pill and caret following the text.
    t += 0.06;
    tl.set(pill, { autoAlpha: 1 }, t);
    for (let i = 1; i <= toWord.length; i++) {
      const w = toWidths[i];
      const pw = this.pillWidth(toWord, i);
      tl.set(blue, { '--reveal': `${w + (i === toWord.length ? 8 : 0.5)}px` }, t);
      tl.to(pill, { width: pw, duration: 0.055, ease: 'power3.out' }, t);
      tl.to(caret, { x: pw + CARET_GAP, duration: 0.055, ease: 'power3.out' }, t);

      const ch = toWord[i - 1];
      const next = toWord[i];
      let step = T.key + (rand() - 0.5) * 2 * T.keyJitter;
      if (ch === ' ' || ch === '-') step += 0.045; // a breath between words
      if (next === '.') step += 0.07; // and before the full stop
      t += step;
    }

    tl.call(() => this.startBlink(), null, t + 0.15);
    return tl;
  }

  /* ---------- entrances ---------- */

  /** Headline rises in word by word, then the phrase is selected and typed. */
  intro() {
    if (this.reduceMotion) return gsap.timeline();
    const T = TIMING;
    const v = this.version;
    const { mask, slot } = this.el;
    const risers = [...this.h1.querySelectorAll('.w-in'), slot];

    const tl = gsap.timeline();
    tl.fromTo(
      risers,
      { yPercent: 118 },
      { yPercent: 0, duration: T.rise, ease: 'power4.out', stagger: T.riseStagger },
    )
      .call(() => mask.classList.add('is-open'))
      .add(this.replace(v.words[0], v.words[0], { fromPlain: true }), `+=${T.beforeSelect}`)
      .call(() => this.loop());
    return this.track(tl);
  }

  /** V2 only: keep swapping the typed word. */
  loop() {
    const words = this.version.words;
    if (words.length < 2) return;
    const wait = gsap.delayedCall(TIMING.hold, () => {
      this.live.delete(wait);
      const from = words[this.index];
      this.index = (this.index + 1) % words.length;
      const tl = this.replace(from, words[this.index]);
      tl.eventCallback('onComplete', () => {
        this.live.delete(tl);
        this.loop();
      });
      this.track(tl);
    });
    this.track(wait);
  }
}
