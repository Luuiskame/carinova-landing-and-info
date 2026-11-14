# Photographs of the solution cards (home page)

Three cards of "Una solución para cada necesidad" have room for a photograph. A card shows its
photograph when this folder has a file named after it; while it has none, it shows its drawing.

| File name (any of `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`) | Card               |
| ------------------------------------------------------------ | ------------------ |
| `compra-asistida`                                            | 02 Compra asistida |
| `encomiendas`                                                | 03 Encomiendas     |
| `negocios`                                                   | 04 Para negocios   |

The first card (Compras online) shows the stores' carousel instead.

## What to put here

- One file per card, in landscape (about 4:3), at least 1,300 px wide. The card shows it 200 px
  tall and crops it to fit (`object-cover`), so keep the subject near the centre.
- Real photographs Carinova has the right to use (its own, or licensed). No store logos.
- Nothing needs to be resized or compressed by hand: the build makes each photograph in three
  widths (320, 480 and 640 px), in AVIF and WebP, and the page loads the one that fits the screen,
  only when the card is about to be seen. A 3 MB original ends up as files of 10 to 40 KB.

## What a photograph says

Each photograph has a description for people who cannot see it and for search engines: `imageAlt`
of its card in `src/i18n/ui/<language>.ts` → `solutions.cards`. Write what the picture shows; change
it if the photograph shows something else.

The code that reads this folder: `src/components/carinova/Solutions.astro`.
