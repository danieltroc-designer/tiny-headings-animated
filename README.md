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
- **Start** picks one of three options for the headline: **Type**, **Style** or **Style 2** (see below). The choice is remembered in the browser.
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

**Style 2** — a steadier V3

With Type and Style the line stays centred, so every time the new word is a different length, "Enterprise-grade" slides sideways (up to about 65 px between "accessibility." and "support.").

Style 2 opens like Style, but the line is centred once, for the first word, and then stays put. "Enterprise-grade" never moves; shorter or longer words only change where the line ends. The cost is that the line is no longer exactly centred on the shorter words: with "support." it sits about 59 px left of centre. On V1 and V2, which have one phrase, Style 2 is identical to Style.

### Where to change things

| What | Where |
| --- | --- |
| Headline copy, the rotating words, the paragraph | `VERSIONS` in `src/hero.js` |
| Speed of each step, pause between swaps | `TIMING` in `src/hero.js` |
| The Type sequence and the word swap | `retype()` and `replace()` in `src/hero.js` |
| The Style sequence | `restyle()` in `src/hero.js` |
| The options, and which ones keep the line steady | `STARTS` in `src/hero.js` |
| Colours, sizes, layout | `src/styles.css` |

## Notes

- Layout is a fixed 1440 px frame. Narrower windows scale the whole frame down; wider windows centre it and let the backgrounds run to the edges. There is no mobile layout yet.
- Type is Inter 3.19 (the `inter-ui` package), the same version the Figma file uses, so text widths match the design.
- With "reduce motion" switched on in the operating system, the headline loads finished and V3 changes words without the typing effect.
- The demo content is an image exported from Figma (`public/assets/demo-newsletter@2x.png`); the tabs above it are not interactive.
- Second logo row: Atlassian and Shopify were hidden in the Figma logo grid; Oasis LMS, MinuteMe and Catapult come from the testimonials further down the page, recoloured to match.

## Deploying to Vercel

Import the repository in Vercel. It detects Vite on its own: build command `npm run build`, output directory `dist`. No settings or environment variables are needed.
