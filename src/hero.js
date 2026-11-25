import gsap from 'gsap';

/* ------------------------------------------------------------------
   Copy for the three versions (from Figma, "3 Headings + Demo").
   `words` holds the highlighted phrase. More than one entry makes it rotate.
------------------------------------------------------------------- */
export const VERSIONS = {
  v1: {
    line1: 'Your app. Our enterprise-ready',
    prefix: '',
    words: ['editing engine.'],
    lead: 'Embed the TinyMCE rich text editor in minutes and extend it with 50+ plugins.<br>SOC&nbsp;2&nbsp;Type&nbsp;2, HIPAA, GDPR and self-hosting are in place.',
  },
  v2: {
    line1: 'You build the app.',
    prefix: 'We bring',
    words: ['the editor.'],
    // The second sentence is 770 px wide, so this paragraph gets a wider box than the usual 720 px.
    lead: 'A rich text editor in a few lines of code, with 400+ APIs to make it yours.<br>SOC&nbsp;2&nbsp;Type&nbsp;2, GDPR and self-hosting come with it, so your engineers stay on your product.',
    leadWidth: 800,
  },
  v3: {
    line1: 'Your editor. Our engine.',
    prefix: 'Enterprise-grade',
    words: ['governance.', 'security.', 'accessibility.', 'support.', 'self-hosting.'],
    lead: 'Embeddable rich text editor in minutes, 50+ plugins out of the box. Every paste comes out as clean HTML, with SOC&nbsp;2&nbsp;Type&nbsp;2, HIPAA and GDPR behind it.',
  },
};

/* ------------------------------------------------------------------
   Options to compare. In all of them the whole headline is on the page from the
   first moment; there is never an empty space where the phrase goes.

   `opening` – the phrase loads as ordinary headline text, and then:
     type  – it is selected, removed, and typed again on the pale highlight.
     style – it is selected and turns into the highlight. Nothing is typed.

   The rest only matters on versions whose words rotate. A centred line has to
   shift whenever the new word is a different length, which makes the words
   before the phrase jump sideways. These settings trade that jump against how
   far off-centre the line is allowed to sit:

   `follow` – how much of the shift the line makes. 1 = stays perfectly centred
              (biggest jump), 0 = never moves (line sits off-centre instead),
              0.5 = moves half-way.
   `anchor` – which word the line is centred for when it does not fully follow:
              'first' = the first word, 'middle' = half-way between the shortest
              and the longest word, so the error is split left and right.
   `fit`    – makes the rotating words closer to the same width, so a centred
              line has less to make up. Each word gets its own letter-spacing
              and its own padding inside the highlight: long words are set a
              little tighter with less padding, short words a little looser
              with more.
                ls     – how far letter-spacing may move either way (0.02 = 2%)
                padMin – smallest left padding a long word may get (18 is normal)
                padMax – largest left padding a short word may get
                dot    – false drops the full stop from every word. It makes all
                         of them shorter by the same amount, so it does not bring
                         them closer together.
------------------------------------------------------------------- */
const FIT = { ls: 0.02, padMin: 10, padMax: 34 };
export const STARTS = {
  type: { opening: 'type', follow: 1 },
  style: { opening: 'style', follow: 1 },
  style2: { opening: 'style', follow: 0, anchor: 'first' },
  style3: { opening: 'style', follow: 0, anchor: 'middle' },
  style4: { opening: 'style', follow: 1, fit: FIT },
  style5: { opening: 'style', follow: 0, anchor: 'middle', fit: FIT },
};

/* ------------------------------------------------------------------
   Timing, in seconds. Tune the feel here.
------------------------------------------------------------------- */
export const TIMING = {
  beforeStart: 0.7, // how long the plain headline sits before the caret arrives
  settle: 0.4, // "style" only: selection relaxing into the pale highlight
  hold: 2.3, // how long a finished word stays before the next swap
  select: 0.32, // selection sweeping across the word
  selectHold: 0.2, // word stays selected
  remove: 0.16, // selection collapsing (the word is deleted)
  blink: 0.18, // one half of a caret blink while it waits to type
  blinks: 2, // how many times the caret blinks before typing
  key: 0.062, // average time per typed character
  keyJitter: 0.03, // random variation per character
};

/* Pill geometry from Figma: 18 px left, 20 px right, 5 px gap to a 3 px caret. */
const PAD_L = 18;
const PAD_R = 20;
const CARET_GAP = 5;
const CARET_W = 3;
const SIZE = 64; // headline font size, px
const BASE_LS = -0.025; // headline letter-spacing, em
/* Browsers trim the (negative) letter-spacing after the last character and Figma does not.
   Adding it back keeps the pill the exact width drawn in Figma: 64 px × 2.5% = 1.6 px. */
const trailFor = (ls) => Math.max(0, -ls * SIZE);
const BASE_SHAPE = { ls: BASE_LS, padL: PAD_L, padR: PAD_R, trail: trailFor(BASE_LS) };

const FLAG = `<svg class="caret-flag" viewBox="0 0 17 17" aria-hidden="true"><path d="M11.2347 0C14.1246 0.0163268 16.98 2.37143 16.98 5.80309C16.98 5.80309 16.9978 6.67505 17 7.72983V8.17071C16.9995 8.36937 16.9978 8.57075 16.9961 8.77105L16.9922 9.07042C16.9795 9.91294 16.9495 10.6973 16.8867 11.1055C16.4871 13.7273 14.4898 15.5392 11.7365 15.9985C9.25521 16.4742 7.7842 16.7496 7.30847 16.8416C7.10474 16.8835 6.20381 17 5.81301 17C2.78773 17 0.0427414 14.7794 0 11.1969V10.6085L0.000554162 10.5073V10.2863C0.00166596 9.90043 0.00277435 9.42745 0.00499455 8.94088L0.00666059 8.64749C0.011101 7.71732 0.0194276 6.78932 0.0344148 6.36262C0.136 3.74898 1.98006 1.63664 5.48995 0.960109L9.95965 0.108854C10.3677 0.033201 10.8184 0 11.2347 0Z"/></svg>`;

/* Small deterministic random, so the typing rhythm is the same every time. */
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

/**
 * The headline. All of its words are on the page as soon as it renders; nothing fades or
 * slides in. The motion is the opening (see STARTS) and, on versions with several words,
 * the word swap that follows.
 */
export class Hero {
  constructor({ h1, lead, measure, reduceMotion = false, start = 'type' }) {
    this.h1 = h1;
    this.lead = lead;
    this.measureEl = measure;
    this.reduceMotion = reduceMotion;
    this.start = start;
    this.live = new Set();
    this.cache = new Map();
  }

  /* ---------- measuring ---------- */

  /** Width of every prefix of `word` in headline type at letter-spacing `ls`: [0, w1, w2, … full]. */
  measure(word, ls) {
    const key = `${word}|${ls}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const el = this.measureEl;
    el.style.letterSpacing = `${ls}em`;
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
    this.cache.set(key, out);
    return out;
  }

  widths(word) {
    return this.measure(word, this.shape(word).ls);
  }

  /** Letter-spacing and padding for `word`. The same for every word unless the option has `fit`. */
  shape(word) {
    if (!this.shapes) this.shapes = this.fitShapes();
    return this.shapes.get(word) || BASE_SHAPE;
  }

  /** Works out, per word, how much tighter or looser to set it so the highlights end up as close in width as allowed. */
  fitShapes() {
    const map = new Map();
    const { fit } = this.option;
    if (!fit || this.words.length < 2) return map;
    const text = (w, ls) => this.measure(w, ls).at(-1) + trailFor(ls);
    const pill = (w, ls, padL) => padL + text(w, ls) + padL + (PAD_R - PAD_L);
    const narrowest = this.words.map((w) => pill(w, BASE_LS - fit.ls, fit.padMin));
    const widest = this.words.map((w) => pill(w, BASE_LS + fit.ls, fit.padMax));
    // Aim half-way between what the longest word can shrink to and what the shortest can grow to.
    const target = (Math.max(...narrowest) + Math.min(...widest)) / 2;
    this.words.forEach((w, i) => {
      const natural = pill(w, BASE_LS, PAD_L);
      const shrink = target < natural;
      const room = shrink ? natural - narrowest[i] : widest[i] - natural;
      const share = room > 0 ? Math.min(1, Math.abs(target - natural) / room) : 0;
      const ls = Math.round((BASE_LS + (shrink ? -1 : 1) * share * fit.ls) * 10000) / 10000;
      // Letter-spacing takes its share; padding then makes up exactly what is left, within its limits.
      const padL = Math.min(fit.padMax, Math.max(fit.padMin, (target - text(w, ls) - (PAD_R - PAD_L)) / 2));
      map.set(w, { ls, padL, padR: padL + (PAD_R - PAD_L), trail: trailFor(ls) });
    });
    return map;
  }

  /** Puts `word` into a text layer with that word's own letter-spacing and left padding. */
  dress(el, word) {
    const s = this.shape(word);
    el.textContent = word;
    el.style.letterSpacing = `${s.ls}em`;
    el.style.left = `${s.padL}px`;
  }

  pillWidth(word, chars = word.length) {
    const s = this.shape(word);
    return s.padL + this.widths(word)[chars] + s.trail + s.padR;
  }

  slotWidth(word) {
    return this.pillWidth(word) + CARET_GAP + CARET_W;
  }

  get option() {
    return STARTS[this.start] || STARTS.type;
  }

  /** Space the line reserves for the phrase. Anything less than the word's own width leaves the line off-centre. */
  lineWidth(word) {
    const { follow = 1, anchor = 'first' } = this.option;
    const own = this.slotWidth(word);
    if (follow >= 1) return own;
    const all = this.words.map((w) => this.slotWidth(w));
    const ref = anchor === 'middle' ? (Math.min(...all) + Math.max(...all)) / 2 : all[0];
    return ref + (own - ref) * follow;
  }

  /** Clip value that shows the first `chars` characters of `word`. */
  reveal(word, chars = word.length) {
    const w = this.widths(word)[chars];
    return `${w + (chars === word.length ? 8 : 0.5)}px`;
  }

  /* ---------- lifecycle ---------- */

  destroy() {
    this.live.forEach((a) => a.kill());
    this.live.clear();
    this.blinkTl?.kill();
    this.blinkTl = null;
    clearInterval(this.reducedTimer);
  }

  /** Draws version `id` in its finished state and, if it has several words, starts swapping them. */
  render(id) {
    this.destroy();
    this.cache.clear();
    const v = VERSIONS[id];
    this.version = v;
    this.index = 0;
    this.shapes = null;
    const fit = this.option.fit;
    this.words = v.words.map((w) => (fit && fit.dot === false ? w.replace(/\.$/, '') : w));

    const all = v.words.length > 1 ? v.words.join(' / ') : v.words[0];
    this.h1.setAttribute('aria-label', `${v.line1} ${v.prefix ? v.prefix + ' ' : ''}${all}`);
    this.h1.innerHTML = `
      <span class="h1-line h1-line--1" aria-hidden="true">${v.line1}</span>
      <span class="h1-line h1-line--2" aria-hidden="true">
        ${v.prefix ? `<span class="h1-static">${v.prefix}</span>` : ''}
        <span class="slot">
          <span class="pill"><span class="t t-blue"></span></span>
          <span class="t t-ink"></span>
          <span class="sel"><span class="t t-sel"></span></span>
          <span class="caret"><span class="caret-line"></span>${FLAG}</span>
        </span>
      </span>`;
    this.lead.innerHTML = v.lead;
    this.lead.style.width = v.leadWidth ? `${v.leadWidth}px` : '';

    const q = (s) => this.h1.querySelector(s);
    this.el = {
      slot: q('.slot'),
      pill: q('.pill'),
      blue: q('.t-blue'),
      ink: q('.t-ink'),
      sel: q('.sel'),
      selText: q('.t-sel'),
      caret: q('.caret'),
      flag: q('.caret-flag'),
    };

    const first = this.words[0];
    const rotates = this.words.length > 1;

    if (this.reduceMotion) {
      // No typing or restyling: the finished headline, and the word simply changes.
      this.setRest(first);
      if (rotates) {
        this.reducedTimer = setInterval(() => {
          this.index = (this.index + 1) % this.words.length;
          this.setRest(this.words[this.index]);
        }, 3000);
      }
    } else {
      this.setPlain(first);
      const tl = this.option.opening === 'style' ? this.restyle(first) : this.retype(first);
      tl.eventCallback('onComplete', () => {
        this.live.delete(tl);
        this.loop();
      });
      this.live.add(tl);
    }
  }

  /** The finished frame, as drawn in Figma: cobalt word on the pale pill, caret at the end. */
  setRest(word) {
    const { slot, pill, blue, ink, sel, selText, caret } = this.el;
    const pw = this.pillWidth(word);
    gsap.set(slot, { width: this.lineWidth(word) });
    gsap.set(pill, { width: pw, autoAlpha: 1 });
    this.dress(blue, word);
    gsap.set(blue, { '--reveal': this.reveal(word) });
    this.dress(ink, word);
    gsap.set(ink, { autoAlpha: 0 });
    this.dress(selText, word);
    gsap.set(sel, { width: pw, autoAlpha: 1, '--sel-l': '100%', '--sel-r': '0%' });
    gsap.set(caret, { x: pw + CARET_GAP, autoAlpha: 1 });
  }

  /** How both options load: the phrase as ordinary headline text. No pill, no caret yet. */
  setPlain(word) {
    this.setRest(word);
    gsap.set(this.el.pill, { autoAlpha: 0 });
    gsap.set(this.el.ink, { autoAlpha: 1 });
    gsap.set(this.el.caret, { x: 0, autoAlpha: 0 });
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

  /** Caret fades in with the logo flag popping out of it. */
  caretIn(tl) {
    const { caret, flag } = this.el;
    tl.to(caret, { autoAlpha: 1, duration: 0.14, ease: 'none' }).fromTo(
      flag,
      { scale: 0 },
      { scale: 1, duration: 0.42, ease: 'back.out(2.4)' },
      '<',
    );
  }

  /* ---------- "type" option: the written phrase is selected and typed again ---------- */

  retype(word) {
    const tl = gsap.timeline({ delay: TIMING.beforeStart });
    // The caret arrives at the end of the phrase, then the usual swap runs with the same word.
    tl.set(this.el.caret, { x: this.pillWidth(word) + CARET_GAP });
    this.caretIn(tl);
    tl.to({}, { duration: 0.2 }).add(this.replace(word, word));
    return tl;
  }

  /* ---------- "style" option: the written phrase is selected and becomes the highlight ---------- */

  restyle(word) {
    const T = TIMING;
    const { pill, ink, sel, caret } = this.el;
    const pw = this.pillWidth(word);
    const tl = gsap.timeline({ delay: T.beforeStart });

    // The caret arrives at the start of the phrase.
    tl.set(caret, { x: 0 });
    this.caretIn(tl);
    tl.to({}, { duration: 0.1 });

    // It drags a selection across the phrase…
    tl.addLabel('select')
      .set(sel, { '--sel-l': '0%', '--sel-r': '100%' }, 'select')
      .to(sel, { '--sel-r': '0%', duration: T.select, ease: 'power2.inOut' }, 'select')
      .to(caret, { x: pw + CARET_GAP, duration: T.select, ease: 'power2.inOut' }, 'select')
      // …and behind the selection the plain text is swapped for the styled one.
      .set(ink, { autoAlpha: 0 })
      .set(pill, { autoAlpha: 1 })
      .to({}, { duration: T.selectHold })
      .addLabel('settle')
      .to(sel, { autoAlpha: 0, duration: T.settle, ease: 'power2.out' })
      .set(sel, { autoAlpha: 1, '--sel-l': '100%', '--sel-r': '0%' })
      .call(() => this.startBlink());
    return tl;
  }

  /* ---------- the word swap: select → remove → blink → type ---------- */

  replace(fromWord, toWord) {
    const T = TIMING;
    const { slot, pill, blue, ink, sel, selText, caret, flag } = this.el;
    const tl = gsap.timeline();

    tl.call(() => {
      this.stopBlink();
      this.dress(selText, fromWord);
    })
      .set(sel, { width: this.pillWidth(fromWord), autoAlpha: 1, '--sel-l': '100%', '--sel-r': '0%' })
      .set(caret, { autoAlpha: 1 });

    // 1. Select: the selection grows from the caret back to the start of the word.
    tl.addLabel('select')
      .to(sel, { '--sel-l': '0%', duration: T.select, ease: 'power2.inOut' }, 'select')
      .to(caret, { x: 0, duration: T.select, ease: 'power2.inOut' }, 'select')
      // Hidden behind the selection: swap what sits underneath.
      .set(ink, { autoAlpha: 0 })
      .set(pill, { width: 0, autoAlpha: 0 })
      .set(blue, { '--reveal': '0px' })
      .call(() => {
        this.dress(blue, toWord);
      })
      .to({}, { duration: T.selectHold });

    // 2. Remove: the selection collapses onto the caret, and the line settles to the new width.
    tl.addLabel('remove')
      .to(sel, { '--sel-r': '100%', duration: T.remove, ease: 'power2.in' }, 'remove')
      .to(slot, { width: this.lineWidth(toWord), duration: 0.6, ease: 'power3.inOut' }, 'remove');

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
    tl.addLabel('type', t).set(pill, { autoAlpha: 1 }, t);
    const rand = seeded(toWord.length * 97 + toWord.charCodeAt(0));
    for (let i = 1; i <= toWord.length; i++) {
      const pw = this.pillWidth(toWord, i);
      tl.set(blue, { '--reveal': this.reveal(toWord, i) }, t);
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

  /** Waits, swaps to the next word, and repeats. */
  loop() {
    const words = this.words;
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
      this.live.add(tl);
    });
    this.live.add(wait);
  }
}
