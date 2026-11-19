// What the scripts of the home page share: finding elements, writing text into HTML safely, the
// icons, and what the page handed them (ScriptData.astro).

/** The first element that matches, or null. */
export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector);

/** Every element that matches. */
export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): Array<T> =>
  Array.from(root.querySelectorAll<T>(selector));

/** An element the page always has: its absence is a mistake in the page, said out loud. */
export const need = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T => {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`The home page has no ${selector}`);
  return element;
};

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Text as it is written inside HTML: whatever a visitor typed stays text. */
export const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ESCAPES[character]);

/** The icons that say "forwards": they turn round in a page written from right to left (Icon.astro marks the same ones). */
const FORWARD: ReadonlyArray<string> = ['arrow', 'chevron'];

/** An icon of the page's sprite, by its name without "i-". */
export const icon = (name: string): string =>
  `<svg aria-hidden="true"${FORWARD.includes(name) ? ' class="is-forward"' : ''}><use href="#i-${name}"></use></svg>`;

/** What a component handed its script: sentences in the page's language, rates, lists. */
export const pageData = <T>(name: string): T =>
  JSON.parse(document.getElementById(`landing-${name}`)?.textContent || '{}') as T;

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/** How a scroll the page starts moves: at once where movement is reduced. */
export const smooth = (): ScrollBehavior => (reducedMotion.matches ? 'auto' : 'smooth');

/** Runs something when the browser has nothing better to do, soon after the page is shown. */
export const whenIdle = (work: () => void): void => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(work, { timeout: 3000 });
  else setTimeout(work, 1200);
};
