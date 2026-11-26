// The row of reviews of "Lo que dicen nuestros clientes": it moves by itself. Every few seconds it
// slides on by one card, the way a finger would push it, and after the last card the first one
// comes in again from the same side: the row never runs back to its start (D-136, asked by the
// developer on 2026-11-25: no arrows and no bar under it, transitions that happen by themselves).
// Nothing is drawn to move it, and nothing is needed: the row is a list with a scroll of its own,
// so a finger, a trackpad, a mouse wheel and the arrow keys move it as before.
//
// It waits while the visitor reads or moves it: under the mouse, with the keyboard's focus in it,
// while a finger is on it, and for a whole turn after the visitor moved it; while the tab is hidden
// and while the row is not on screen. Where movement is reduced it does not move by itself. It
// rests 5 to 8 seconds, longer when the card that leaves next has more to read (`dwell`).
//
// The endless row: the first cards come again after the last, as copies that screen readers and
// the keyboard do not reach. When the row comes to rest on a copy it is set at once on the card the
// copy repeats, which looks exactly the same, so the next turn goes on from there.
//
// Fetched when the page is idle (boot.ts): the first cards are in view from the start.
import { $$, need, reducedMotion, smooth } from './dom';

const viewport = need('#t-viewport');
const track = need('#t-track');
/** The cards of the page (the copies come after them). */
const cards = $$('.t-card', track);

/** In a page written from right to left the row runs the other way, and so do its numbers. */
const forwards = document.documentElement.dir === 'rtl' ? -1 : 1;

/** From one card to the next, in pixels: a card and the gap after it. */
const pitch = (): number =>
  cards.length > 1 ? Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) : viewport.clientWidth || 1;
/** How far the row has gone from its start, in pixels and in cards. */
const travelled = (): number => Math.abs(viewport.scrollLeft);
const position = (): number => Math.round(travelled() / pitch());

const go = (index: number, behavior: ScrollBehavior): void =>
  viewport.scrollTo({ left: forwards * index * pitch(), behavior });
/**
 * A move that is not seen: the row has no `scroll-behavior` of its own, so "auto" is at once.
 * ("instant" says the same, but an older browser throws at a word it does not know there.)
 */
const JUMP: ScrollBehavior = 'auto';

let copies: Array<HTMLElement> = [];
/** Whether the cards do not all fit in view, so that there is somewhere to move to. */
let endless = false;

/** The copies that make the row endless: enough to fill the screen after the last card. */
const lay = (): void => {
  const at = position() % Math.max(1, cards.length);
  for (const copy of copies) copy.remove();
  copies = [];
  endless = cards.length > 1 && viewport.scrollWidth - viewport.clientWidth > 1;
  if (endless) {
    const count = Math.min(cards.length, Math.ceil(viewport.clientWidth / pitch()) + 1);
    copies = cards.slice(0, count).map((card) => {
      const copy = card.cloneNode(true) as HTMLElement;
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      for (const element of [copy, ...$$('[id], [aria-describedby], a, button', copy)]) {
        element.removeAttribute('id');
        element.removeAttribute('aria-describedby');
        if (element.matches('a, button')) element.tabIndex = -1;
      }
      return copy;
    });
    track.append(...copies);
  }
  go(at, JUMP);
};

/** The row was just set on a copy on purpose, to go back from the first card to the last. */
let backwards = false;
/** Resting on a copy: the same picture, on the card it repeats. */
const settle = (): void => {
  if (backwards) {
    backwards = false;
    return;
  }
  const at = position();
  if (endless && at >= cards.length) go(at - cards.length, JUMP);
};

// What holds the row still.
let hovered = false;
let focused = false;
let touched = false;
let onScreen = false;
let moving = false;
const free = (): boolean =>
  endless && onScreen && !hovered && !focused && !touched && !moving && !document.hidden && !reducedMotion.matches;

/**
 * How long the row rests: a little longer when the card that leaves next has more to read, from 5
 * to 8 seconds. Whoever needs longer holds the row (the mouse, a finger, the keys).
 */
const dwell = (): number => {
  const leaving = [...cards, ...copies][position()];
  const length = leaving?.querySelector('blockquote')?.textContent?.trim().length ?? 0;
  return Math.min(8_000, Math.max(5_000, 3_000 + 15 * length));
};

let timer = 0;
let safety = 0;
/** Counts the rest again from now, if nothing holds the row; otherwise it waits to be let go. */
const resume = (): void => {
  window.clearTimeout(timer);
  timer = free() ? window.setTimeout(advance, dwell()) : 0;
};
const rest = (): void => {
  window.clearTimeout(safety);
  moving = false;
  settle();
  resume();
};
function advance(): void {
  if (!free()) return;
  moving = true;
  go(position() + 1, 'smooth');
  // A move that the browser cut short or never started must not hold the row for good.
  safety = window.setTimeout(rest, 2_000);
}

// The end of a move: the browser says so where it can; elsewhere, a moment without scrolling.
if ('onscrollend' in window) viewport.addEventListener('scrollend', rest);
else {
  let quiet = 0;
  viewport.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(quiet);
      quiet = window.setTimeout(rest, 160);
    },
    { passive: true }
  );
}

viewport.addEventListener('pointerenter', (event) => {
  if (event.pointerType !== 'mouse') return;
  hovered = true;
  resume();
});
viewport.addEventListener('pointerleave', (event) => {
  if (event.pointerType !== 'mouse') return;
  hovered = false;
  resume();
});
viewport.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse') return;
  touched = true;
  resume();
});
for (const type of ['pointerup', 'pointercancel'] as const) {
  addEventListener(type, (event) => {
    if (event.pointerType === 'mouse' || !touched) return;
    touched = false;
    resume();
  });
}
// The keyboard's focus holds the row; a click that only focuses it does not.
viewport.addEventListener('focusin', (event) => {
  focused = (event.target as Element).matches(':focus-visible');
  resume();
});
viewport.addEventListener('focusout', (event) => {
  if (viewport.contains(event.relatedTarget as Node | null)) return;
  focused = false;
  resume();
});
viewport.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  event.preventDefault();
  // Whoever moves the row with the keys is reading it: it waits until the focus leaves.
  focused = true;
  // The right arrow moves the row towards the right of the screen, whichever way the page is written.
  const step = (event.key === 'ArrowRight' ? 1 : -1) * forwards;
  let at = position();
  // Back from the first card: from the copy of the first, which looks the same, to the last card.
  if (endless && step < 0 && at === 0) {
    at = cards.length;
    backwards = true;
    go(at, JUMP);
  }
  go(at + step, smooth());
});
document.addEventListener('visibilitychange', resume);
reducedMotion.addEventListener?.('change', resume);

if ('IntersectionObserver' in window) {
  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      // The photos of every card come as soon as the row is on screen, so a card has its photo by
      // the time it slides in (D-127).
      if (onScreen) for (const photo of $$<HTMLImageElement>('img[loading="lazy"]', track)) photo.loading = 'eager';
      resume();
    },
    { threshold: 0.5 }
  ).observe(viewport);
}

// The row changes when the window does: the copies are laid out again for the new width.
let lastWidth = viewport.clientWidth;
let frame = 0;
const reshape = (): void => {
  frame = 0;
  if (viewport.clientWidth === lastWidth) return;
  lastWidth = viewport.clientWidth;
  lay();
  resume();
};
if ('ResizeObserver' in window) {
  new ResizeObserver(() => {
    frame ||= requestAnimationFrame(reshape);
  }).observe(viewport);
} else addEventListener('resize', () => (frame ||= requestAnimationFrame(reshape)));

lay();
resume();
