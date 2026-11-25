# TinyMCE hero prototypes

Three versions of the tiny.cloud homepage hero, built 1:1 from the Figma page
**3 Headings + Demo**, to judge the headline and its typed word swap in a real browser.

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
- Keyboard: `1`, `2`, `3` switch versions.
- The address ends in `#v1`, `#v2` or `#v3`, so a link opens on a specific version.

## Motion

Nothing is animated in. The whole page, including the full headline, is visible from the first paint, and the headline is in the HTML itself, so it shows even if JavaScript fails.

The only motion is the word swap in V2, built with [GSAP](https://gsap.com). "Enterprise-grade governance." is on the page at load; after a pause the last word changes:

1. **Select** — the word is selected, from the caret back to its start.
2. **Remove** — the selection collapses.
3. **Blink** — the caret, with the logo shape on top, blinks twice.
4. **Type** — the next word is typed in cobalt on the pale highlight.

It cycles through governance, security, accessibility, support and self-hosting. V1 and V3 have a single phrase, so they are completely still.

### Where to change things

| What | Where |
| --- | --- |
| Headline copy, the rotating words, the paragraph | `VERSIONS` in `src/hero.js` |
| Speed of each step, pause between swaps | `TIMING` in `src/hero.js` |
| The word swap | `replace()` in `src/hero.js` |
| Colours, sizes, layout | `src/styles.css` |

## Notes

- Layout is a fixed 1440 px frame. Narrower windows scale the whole frame down; wider windows centre it and let the backgrounds run to the edges. There is no mobile layout yet.
- Type is Inter 3.19 (the `inter-ui` package), the same version the Figma file uses, so text widths match the design.
- With "reduce motion" switched on in the operating system, V2 changes words without the typing effect.
- The demo content is an image exported from Figma (`public/assets/demo-newsletter@2x.png`); the tabs above it are not interactive.
- Second logo row: Atlassian and Shopify were hidden in the Figma logo grid; Oasis LMS, MinuteMe and Catapult come from the testimonials further down the page, recoloured to match.

## Deploying to Vercel

Import the repository in Vercel. It detects Vite on its own: build command `npm run build`, output directory `dist`. No settings or environment variables are needed.
