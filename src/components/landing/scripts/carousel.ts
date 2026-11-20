// The cards of "Lo que dicen nuestros clientes", one at a time (the reviews, or the three places
// kept for them while there are none): they advance by themselves with a horizontal
// glide (the current one leaves on the side the text starts from, the next one comes in from the
// other). The time each stays grows with its text. They stop under the pointer, with the focus,
// while a finger is on them, off screen and in a hidden tab; a swipe or the arrow keys move them.
// Where movement is reduced, or with a single card, all are shown one under the other.
//
// Fetched when the page is idle (boot.ts): the first card is in view from the start.
import { fill } from '~/utils/template';

import { $, $$, need, pageData, reducedMotion } from './dom';

const text = pageData<{ carousel: string; slide: string; slideLabel: string }>('carousel');

const section = need('#clientes');
const track = need('#t-track');
const viewport = need('#t-viewport');
const cards = $$('.t-card', track);

/** In a page written from right to left, "next" comes in from the left. */
const forwards = document.documentElement.dir === 'rtl' ? -1 : 1;
const SHIFT = 'var(--t-shift)';
const BACK = 'calc(var(--t-shift) * -1)';
const side = (direction: number) => (direction * forwards > 0 ? SHIFT : BACK);

const state = { hovered: false, focused: false, pressed: false, visible: false };
let index = 0;
let timer = 0;
let startX: number | null = null;

const stacked = () => reducedMotion.matches || cards.length < 2;
const paused = () => state.hovered || state.focused || state.pressed || !state.visible || document.hidden;
/** Long enough to read it: between five and a half and eleven seconds. */
const readingTime = (card: HTMLElement) =>
  Math.round(Math.min(11000, Math.max(5500, 2500 + 45 * (card.textContent ?? '').replace(/\s+/g, ' ').trim().length)));

const sync = () => {
  section.classList.toggle('is-paused', paused());
  clearTimeout(timer);
  if (!stacked() && !paused()) timer = window.setTimeout(() => show(index + 1), readingTime(cards[index]));
};

function show(next: number, { announce = false, direction = 1 } = {}): void {
  const from = index;
  index = ((next % cards.length) + cards.length) % cards.length;
  if (from !== index && !stacked()) {
    // The next one always comes in from the right side, whatever it did last.
    const incoming = cards[index];
    incoming.style.transition = 'none';
    incoming.classList.remove('is-leaving');
    incoming.style.setProperty('--enter', side(direction));
    void incoming.offsetWidth;
    incoming.style.transition = '';
    cards[from].style.setProperty('--exit', side(-direction));
  }
  cards.forEach((card, position) => {
    const shown = stacked() || position === index;
    const leaving = !stacked() && position === from && from !== index;
    if (!shown && !leaving && card.classList.contains('is-leaving')) {
      // One that already left goes back to its place without crossing the screen.
      card.style.transition = 'none';
      card.classList.remove('is-leaving');
      void card.offsetWidth;
      card.style.transition = '';
    }
    card.classList.toggle('is-active', shown);
    card.classList.toggle('is-leaving', leaving);
    card.toggleAttribute('inert', !shown);
    card.setAttribute('aria-hidden', String(!shown));
  });
  section.classList.toggle('is-stacked', stacked());
  viewport.tabIndex = stacked() ? -1 : 0;
  track.setAttribute('aria-live', announce ? 'polite' : 'off');
  sync();
}

const step = (direction: number) => show(index + direction, { announce: true, direction });

if (cards.length) {
  viewport.setAttribute('aria-roledescription', text.carousel);
  cards.forEach((card, position) => {
    card.setAttribute('aria-roledescription', text.slide);
    card.setAttribute('aria-label', fill(text.slideLabel, { number: position + 1, total: cards.length }));
  });

  viewport.addEventListener('keydown', (event) => {
    if (stacked() || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return;
    event.preventDefault();
    step((event.key === 'ArrowRight' ? 1 : -1) * forwards);
  });
  // Only the card that is shown stops it, not the whole band: it keeps advancing while the page is read.
  const overCard = (node: EventTarget | null) => Boolean((node as Element | null)?.closest?.('.t-card.is-active'));
  track.addEventListener('pointerover', (event) => {
    if (event.pointerType === 'mouse' && overCard(event.target)) {
      state.hovered = true;
      sync();
    }
  });
  track.addEventListener('pointerout', (event) => {
    if (event.pointerType === 'mouse' && !overCard(event.relatedTarget)) {
      state.hovered = false;
      sync();
    }
  });
  section.addEventListener('focusin', (event) => {
    state.focused = (event.target as Element).matches(':focus-visible');
    sync();
  });
  section.addEventListener('focusout', (event) => {
    if (!section.contains(event.relatedTarget as Node | null)) {
      state.focused = false;
      sync();
    }
  });
  viewport.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    state.pressed = true;
    sync();
  });
  // On the window: a finger lifted outside the card resumes it too.
  window.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const distance = event.clientX - startX;
    startX = null;
    state.pressed = false;
    if (Math.abs(distance) > 40 && !stacked()) step((distance < 0 ? 1 : -1) * forwards);
    else sync();
  });
  window.addEventListener('pointercancel', () => {
    if (startX === null) return;
    startX = null;
    state.pressed = false;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener?.('change', () => show(index));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        state.visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.35 }
    ).observe($('#t-viewport') ?? viewport);
  } else state.visible = true;

  show(0);
}
