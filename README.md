# TinyMCE hero prototypes

Three versions of the tiny.cloud homepage hero, built 1:1 from the Figma page
**3 Headings + Demo**, to judge the animated headline in a real browser.

- **V1** — Your app. Our enterprise-ready **editing engine.**
- **V2** — Your editor. Our engine. Enterprise-grade **governance. / security. / accessibility. / support. / self-hosting.** (the last word keeps swapping)
- **V3** — You build the app. We bring **the editor.**

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
- **Start** picks how the headline opens: **Type** or **Style** (see below). The choice is remembered in the browser.
- The round arrow replays the whole page entrance.
- Keyboard: `1`, `2`, `3` switch versions, `S` toggles the start, `R` replays.
- The address ends in `#v1`, `#v2` or `#v3`, so a link opens on a specific version.

## The headline animation

Built with [GSAP](https://gsap.com). There are two openings to compare, and both end on the frame drawn in Figma (cobalt phrase on the pale pill, caret with the logo shape at the end).

**Type** (default) — the phrase is missing at first:

1. The headline rises in word by word, with an empty space where the phrase goes.
2. **Blink** — the caret, with the logo shape on top, appears and blinks twice.
3. **Type** — the phrase is typed as plain text.
4. **Select** — the selection sweeps across it and relaxes into the pale highlight.

**Style** — the phrase is already written:

1. The headline rises in, with the phrase as plain text.
2. **Select** — the caret appears and drags a selection across the phrase.
3. The selection relaxes into the pale highlight. Nothing is typed.

After either opening, V2 keeps swapping its last word: select → remove → blink → type, forever.

### Where to change things

| What | Where |
| --- | --- |
| Headline copy, the rotating words, the paragraph | `VERSIONS` in `src/hero.js` |
| Speed of each step, pause between swaps | `TIMING` in `src/hero.js` |
| The two openings | `openTyping()` and `openStyling()` in `src/hero.js` |
| The word swap (V2) | `replace()` in `src/hero.js` |
| Page entrance (nav, demo, buttons) | `playPage()` in `src/main.js` |
| Colours, sizes, layout | `src/styles.css` |

## Notes

- Layout is a fixed 1440 px frame. Narrower windows scale the whole frame down; wider windows centre it and let the backgrounds run to the edges. There is no mobile layout yet.
- Type is Inter 3.19 (the `inter-ui` package), the same version the Figma file uses, so text widths match the design.
- With "reduce motion" switched on in the operating system, the headline shows its finished state and V2 swaps words without typing.
- The demo content is an image exported from Figma (`public/assets/demo-newsletter@2x.png`); the tabs above it are not interactive.
- Second logo row: Atlassian and Shopify were hidden in the Figma logo grid; Oasis LMS, MinuteMe and Catapult come from the testimonials further down the page, recoloured to match.

## Deploying to Vercel

Import the repository in Vercel. It detects Vite on its own: build command `npm run build`, output directory `dist`. No settings or environment variables are needed.
