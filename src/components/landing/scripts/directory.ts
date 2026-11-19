// The directory behind "Y más": a hundred stores of the United States in ten categories, with a
// search across all of them. Touching a store opens the same choice as the stores of the home page
// (buy it yourself, or Personal Shopper), with the way back to the directory; a store that is not
// listed is asked for through the form.
//
// This file, the list (src/data/landing.ts) and the addresses of the hundred logos are fetched only
// when the directory is opened; each logo is then a file of its own, fetched as it scrolls into
// view. In the original all of it, logos included, was 420 KB inside the page's script.
import { LOGO_SCALE, STORE_DIRECTORY } from '~/data/landing';
import { plain } from '~/utils/restricted';
import { fill } from '~/utils/template';

import { LOGO_URLS } from '../logos';
import { config, heading, showChoice, showShopper, showStoreTile, showView, tileOf } from './dialogs';
import { $$, esc, icon, need, reducedMotion } from './dom';

const { text, kinds } = config;
const content = need('#modal-content');

/** What the visitor chose, kept while the page is open: coming back from a store finds it as it was. */
const state = { category: 'all', query: '' };

const total = STORE_DIRECTORY.reduce((sum, category) => sum + category.stores.length, 0);
/** "amazon.com": how a store's address is searched. */
const siteOf = (url: string): string => new URL(url).hostname.replace(/^www\./, '');

const render = (): void => {
  const chips = [
    ['all', text.dirAll, total] as const,
    ...STORE_DIRECTORY.map((category) => [category.id, kinds[category.id], category.stores.length] as const),
  ]
    .map(
      ([id, name, count]) =>
        `<button class="dir-chip" type="button" data-cat="${id}" aria-pressed="${state.category === id}">${esc(name)}<span aria-hidden="true">${count}</span></button>`
    )
    .join('');

  content.innerHTML =
    heading(text.dirEyebrow, fill(text.dirTitle, { count: total }), text.dirIntro) +
    `<div class="dir-tools"><label class="input-icon">${icon('search')}<input class="input" id="dir-query" type="search" autocomplete="off" enterkeyhint="search" maxlength="60" dir="auto" placeholder="${esc(text.dirSearch)}" aria-label="${esc(text.dirSearch)}"></label>` +
    `<div class="dir-chips" role="group" aria-label="${esc(text.dirFilters)}">${chips}</div></div>` +
    `<p class="sr-only" id="dir-status" role="status"></p><div id="dir-results"></div>` +
    `<div class="dir-foot"><p>${esc(text.dirOtherText)}</p><button class="btn btn-primary" type="button" id="dir-other"><span>${esc(text.dirOther)}</span>${icon('arrow')}</button></div>`;

  const input = need<HTMLInputElement>('#dir-query', content);
  const results = need('#dir-results', content);
  const status = need('#dir-status', content);
  input.value = state.query;

  const draw = () => {
    const query = plain(state.query);
    let count = 0;
    const groups = STORE_DIRECTORY.filter(
      (category) => query || state.category === 'all' || state.category === category.id
    )
      .map((category) => {
        const found = category.stores.filter(
          (store) => !query || plain(store.name).includes(query) || siteOf(store.url).includes(query)
        );
        count += found.length;
        if (!found.length) return '';
        const tiles = found
          .map((store) => {
            const logo = LOGO_URLS[store.id];
            return (
              `<li><button class="store dir-store" type="button" data-key="${store.id}" data-cat="${category.id}">` +
              (logo
                ? `<img class="store-logo" src="${esc(logo)}" alt="" decoding="async" loading="lazy" style="--inv:${LOGO_SCALE[store.id] ?? 0.55}">`
                : '') +
              `<span class="store-name${logo ? ' sr-only' : ''}">${esc(store.name)}</span><span class="store-go" aria-hidden="true">${icon('arrow')}</span></button></li>`
            );
          })
          .join('');
        return `<section class="dir-group" aria-labelledby="dir-${category.id}"><h3 class="dir-heading" id="dir-${category.id}">${icon(category.icon)}${esc(kinds[category.id])}</h3><ul class="dir-grid">${tiles}</ul></section>`;
      })
      .join('');
    results.innerHTML = groups || `<p class="dir-empty">${esc(fill(text.dirEmpty, { query: state.query.trim() }))}</p>`;
    status.textContent = fill(text.dirCount, { count });
    // A logo that does not arrive gives way to the store's name.
    for (const image of $$<HTMLImageElement>('img.store-logo', results)) {
      image.addEventListener(
        'error',
        () => {
          image.nextElementSibling?.classList.remove('sr-only');
          image.remove();
        },
        { once: true }
      );
    }
  };

  const pick = (category: string) => {
    state.category = category;
    for (const chip of $$('.dir-chip', content))
      chip.setAttribute('aria-pressed', String(chip.dataset.cat === category));
  };
  need('.dir-chips', content).addEventListener('click', (event) => {
    const chip = (event.target as Element).closest<HTMLElement>('.dir-chip');
    if (!chip) return;
    state.query = '';
    input.value = '';
    pick(chip.dataset.cat ?? 'all');
    draw();
    chip.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    content.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });
  input.addEventListener('input', () => {
    state.query = input.value;
    // A search looks through every category.
    if (input.value.trim() && state.category !== 'all') pick('all');
    draw();
  });
  results.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('.dir-store');
    if (!button) return;
    const store = STORE_DIRECTORY.flatMap((category) => category.stores).find((item) => item.id === button.dataset.key);
    if (!store) return;
    // A store that is also on the home page opens as it does there, with what it is.
    const tile = tileOf(store.id);
    if (tile) showStoreTile(tile, show);
    else
      showChoice({
        name: store.name,
        url: store.url,
        logo: LOGO_URLS[store.id],
        description: kinds[button.dataset.cat ?? ''],
        back: show,
      });
  });
  need('#dir-other', content).addEventListener('click', showShopper);
  draw();
};

/** Opens the directory in the dialog. */
export const show = (): void => showView(render, 'directory');
