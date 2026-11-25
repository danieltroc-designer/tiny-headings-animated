# TinyMCE hero prototypes

Three versions of the tiny.cloud homepage hero, built 1:1 from the Figma page
**3 Headings + Demo**, to judge the headline and its typed word swap in a real browser.

- **V1** — Your app. Our enterprise-ready **editing engine.**
- **V2** — You build the app. We bring **the editor.**
- **V3** — Your editor. Our engine. Enterprise-grade **governance. / security. / accessibility. / support. / self-hosting.** (the last word keeps rotating)

V2 and V3 swapped places on 25 Nov 2026: the rotating headline used to be V2. The frames on the Figma page "3 Headings + Demo" were renamed to match.

The nav, hero, demo and customer logos are real. Everything below the logos is a
placeholder: section heights and background colours match the design, content is blocked out.

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`.

## Using the prototype

- The **V1 / V2 / V3** buttons on the right edge switch versions. They float over the page and never move the layout.
- **Start** picks one of six options for the headline: **Type**, **Style** and **Style 2** to **5** (see below). The choice is remembered in the browser.
- The round arrow plays the headline again from the start.
- Keyboard: `1`, `2`, `3` switch versions, `S` cycles through the start options, `R` plays again.
- The address ends in `#v1`, `#v2` or `#v3`, so a link opens on a specific version.

## Motion

Nothing is faded or slid in. The whole page, including every word of the headline, is visible from the first paint, and the headline is in the HTML itself, so it shows even if JavaScript fails. There is never an empty space where the phrase goes at load.

The motion is inside the headline's last phrase, built with [GSAP](https://gsap.com). In both options the phrase loads as ordinary dark headline text, and after a short pause:

**Type** (default)

1. **Select** — the caret, with the logo shape on top, appears at the end of the phrase and selects it.
2. **Remove** — the selection collapses.
3. **Blink** — the caret blinks twice.
4. **Type** — the same phrase is typed again, in cobalt on the pale highlight.

**Style**

1. **Select** — the caret appears at the start of the phrase and drags a selection across it.
2. The selection relaxes into the pale highlight. Nothing is typed.

Both end on the frame drawn in Figma. V3 then keeps rotating its last word (governance, security, accessibility, support, self-hosting) with the Type sequence: select → remove → blink → type, with a pause of a little over two seconds on each word.

**Style 2 to 5** — steadier takes on V3

With Type and Style the line stays centred, so every time the new word is a different length, "Enterprise-grade" jumps sideways, by up to 65 px. The other options reduce that in two ways, alone or together. They all open like Style, and they only differ on V3.

- **Hold the line still** (Style 2, 3, 5): the line is centred once and then stays put, so it sits a little off-centre on some words.
- **Make the words closer in width** (Style 4, 5): long words are set tighter with less padding inside the highlight, short words looser with more. The limits are 2% of letter-spacing either way and 10 to 34 px of left padding (18 px is normal). That brings the widest and narrowest highlight from 131 px apart to 57 px apart. Making them exactly equal would need about 60 px of padding on each side of the short words.

| Option | What it does | Biggest jump | Furthest off-centre |
| --- | --- | --- | --- |
| Type, Style | Always centred, words untouched | 65 px | 0 |
| Style 2 | Line never moves; centred for the first word | 0 | 59 px (always to the left) |
| Style 3 | Line never moves; centred between the shortest and longest word | 0 | 33 px (either way) |
| Style 4 | Always centred; words nudged towards the same width | 29 px | 0 |
| Style 5 | Words nudged towards the same width, and the line never moves | 0 | 15 px (either way) |

In Style 4 and 5 the first word is nudged too, so "governance." is set slightly tighter than in Figma.

### Where to change things

| What | Where |
| --- | --- |
| Headline copy, the rotating words, the paragraph | `VERSIONS` in `src/hero.js` |
| Speed of each step, pause between swaps | `TIMING` in `src/hero.js` |
| The Type sequence and the word swap | `retype()` and `replace()` in `src/hero.js` |
| The Style sequence | `restyle()` in `src/hero.js` |
| The options: how much the line may move, and the limits for nudging word widths | `STARTS` and `FIT` in `src/hero.js` |
| Colours, sizes, layout | `src/styles.css` |

## Notes

- Layout is a fixed 1440 px frame. Narrower windows scale the whole frame down; wider windows centre it and let the backgrounds run to the edges. There is no mobile layout yet.
- Type is Inter 3.19 (the `inter-ui` package), the same version the Figma file uses, so text widths match the design.
- With "reduce motion" switched on in the operating system, the headline loads finished and V3 changes words without the typing effect.
- The demo content is an image exported from Figma (`public/assets/demo-newsletter@2x.png`); the tabs above it are not interactive.
- Second logo row: Atlassian and Shopify were hidden in the Figma logo grid; Oasis LMS, MinuteMe and Catapult come from the testimonials further down the page, recoloured to match.

## Deploying to Vercel

Import the repository in Vercel. It detects Vite on its own: build command `npm run build`, output directory `dist`. No settings or environment variables are needed.
