// The row of reviews of "Lo que dicen nuestros clientes". The row scrolls by itself (it is a list
// with a scroll of its own: a finger, a trackpad, a mouse wheel); this script adds what makes it
// plain that there is more and easy to reach: the two arrows, which move the row by the cards that
// are whole in view, the bar that says how far along it is, and the arrow keys.
//
// Nothing moves by itself (D-130): a visitor reads a review for as long as they want.
//
// Fetched when the page is idle (boot.ts): the first cards are in view from the start.
import { $$, need, smooth } from './dom';

const viewport = need('#t-viewport');
const track = need('#t-track');
const controls = need('#t-controls');
const bar = need('#t-bar');
const previous = need<HTMLButtonElement>('#t-prev');
const next = need<HTMLButtonElement>('#t-next');

/** In a page written from right to left the row runs the other way, and so do its numbers. */
const forwards = document.documentElement.dir === 'rtl' ? -1 : 1;

/** How far the row can go, in pixels, and how far it has gone, from 0 to 1. */
const reach = (): number => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
const progress = (): number => (reach() ? Math.min(1, Math.abs(viewport.scrollLeft) / reach()) : 0);

/** One step of an arrow: the cards that are whole in view, and never less than one. */
const stride = (): number => {
  const [first, second] = $$('.t-card', track);
  if (!first) return viewport.clientWidth;
  const pitch = second ? Math.abs(second.offsetLeft - first.offsetLeft) : first.offsetWidth;
  const gap = pitch - first.offsetWidth;
  const row = viewport.clientWidth - 2 * (parseFloat(getComputedStyle(track).paddingInlineStart) || 0);
  return Math.max(1, Math.floor((row + gap) / pitch)) * pitch;
};

const move = (direction: number): void =>
  viewport.scrollBy({ left: direction * forwards * stride(), behavior: smooth() });

/** A button at the end of its way says so and stays where it is: disabling it would drop the focus. */
const setEnd = (button: HTMLButtonElement, atEnd: boolean): void => {
  button.setAttribute('aria-disabled', String(atEnd));
};

let queued = 0;
const sync = (): void => {
  queued = 0;
  const at = progress();
  // With every card in view there is nothing to move: the arrows and the bar stay out of sight.
  controls.classList.toggle('is-ready', reach() > 1);
  bar.style.setProperty('--t-size', String(Math.min(1, viewport.clientWidth / (viewport.scrollWidth || 1))));
  bar.style.setProperty('--t-at', String(at));
  setEnd(previous, at <= 0.005);
  setEnd(next, at >= 0.995);
};
const later = (): void => {
  queued ||= requestAnimationFrame(sync);
};

previous.addEventListener('click', () => move(-1));
next.addEventListener('click', () => move(1));
viewport.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  event.preventDefault();
  // The right arrow moves the row towards the right of the screen, whichever way the page is written.
  viewport.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * stride(), behavior: smooth() });
});
viewport.addEventListener('scroll', later, { passive: true });
// The row changes when the window does, and when the font arrives and the cards take their size.
addEventListener('resize', later);
if ('ResizeObserver' in window) new ResizeObserver(later).observe(track);

sync();
