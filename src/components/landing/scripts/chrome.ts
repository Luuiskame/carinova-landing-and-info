// The script of the home page's header and footer on another page of the site (D-137,
// LandingChrome.astro): the language menu, the menu, the "Crear cuenta" that joins the bar and the
// year of the footer, as boot.ts does them on the home page.
//
// It imports nothing from the home page's scripts, on purpose: a file that two pages' scripts
// share becomes a file of its own, and the home page would have to fetch it before it starts
// (D-107). What it repeats of boot.ts is the header's part, which must behave the same on both.

/** Where the browser keeps the language the visitor chose: the name Carinova's page gave it. */
const LANGUAGE_KEY = 'carinova-language';

const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector);
const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): Array<T> =>
  Array.from(root.querySelectorAll<T>(selector));

const langButton = $<HTMLButtonElement>('#lang-button');
const langMenu = $('#lang-menu');
const menuButton = $<HTMLButtonElement>('#menu-button');
const mobileMenu = $('#mobile-menu');

const closeLanguages = (returnFocus = false) => {
  if (!langButton || !langMenu || langMenu.hidden) return;
  langMenu.hidden = true;
  langButton.setAttribute('aria-expanded', 'false');
  if (returnFocus) langButton.focus();
};
const openLanguages = (focusCurrent: boolean) => {
  if (!langButton || !langMenu) return;
  langMenu.hidden = false;
  langButton.setAttribute('aria-expanded', 'true');
  if (focusCurrent) ($<HTMLElement>('[aria-current="true"]', langMenu) ?? $<HTMLElement>('a', langMenu))?.focus();
};
/** The room the menu has, from where it starts to the bottom of the screen (boot.ts says why). */
const roomForMenu = () => {
  if (!mobileMenu || mobileMenu.hidden) return;
  const room = Math.floor(window.innerHeight - mobileMenu.getBoundingClientRect().top);
  mobileMenu.style.setProperty('--menu-room', `${room}px`);
};
const setMenu = (open: boolean) => {
  if (!menuButton || !mobileMenu) return;
  mobileMenu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', (open ? menuButton.dataset.close : menuButton.dataset.open) ?? '');
  $('use', menuButton)?.setAttribute('href', open ? '#i-close' : '#i-menu');
  roomForMenu();
};
const closeMenu = () => {
  if (mobileMenu && !mobileMenu.hidden) setMenu(false);
};

if (langButton && langMenu) {
  // Each language is a page of its own: the link carries the section the visitor is reading, so
  // the other language opens there, and the choice is kept for the next visit to the home page.
  langMenu.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-lang]');
    if (!link) return;
    try {
      localStorage.setItem(LANGUAGE_KEY, JSON.stringify(link.dataset.lang));
    } catch {
      /* Without storage the language still changes. */
    }
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const reading = $$('main > [id]')
      .filter((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.4)
      .at(-1);
    // At the top of the page there is no place to keep.
    if (!reading || window.scrollY < 80) return;
    event.preventDefault();
    window.location.assign(`${link.href.split('#')[0]}#${reading.id}`);
  });
  langButton.addEventListener('click', () => {
    if (langMenu.hidden) {
      closeMenu();
      openLanguages(false);
    } else closeLanguages();
  });
  langButton.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openLanguages(true);
    }
  });
  langMenu.addEventListener('keydown', (event) => {
    const items = $$<HTMLElement>('a', langMenu);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      items[moves[event.key]].focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeLanguages(true);
    } else if (event.key === 'Tab') closeLanguages();
  });
}
if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    closeLanguages();
    setMenu(mobileMenu.hidden);
  });
  mobileMenu.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) closeMenu();
  });
  window.addEventListener('resize', roomForMenu);
  window.addEventListener('scroll', roomForMenu, { passive: true });
}
document.addEventListener('click', (event) => {
  const target = event.target as Element;
  if (!target.closest('.lang-wrap')) closeLanguages();
  if (!target.closest('.header-inner')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  // A dialog of the page that is open takes the Esc key for itself.
  if (event.key !== 'Escape' || $('dialog[open]')) return;
  if (mobileMenu && !mobileMenu.hidden) {
    closeMenu();
    menuButton?.focus();
  }
  closeLanguages();
});

// "Crear cuenta" joins the bar once the page's opening is out of sight, and leaves it at the
// page's closing call, which has its own: the first and the last sections of the page.
if ('IntersectionObserver' in window) {
  const header = $('.site-header');
  const opening = $('main > :first-child');
  const closing = $('main > :last-child');
  if (header && opening && closing && opening !== closing) {
    let pastOpening = false;
    let atClosing = false;
    const update = () => header.classList.toggle('show-cta', pastOpening && !atClosing);
    new IntersectionObserver(([entry]) => {
      pastOpening = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(opening);
    new IntersectionObserver(([entry]) => {
      atClosing = entry.isIntersecting;
      update();
    }).observe(closing);
  }
}

// The year of the footer is today's, not the one of the day the page was built.
{
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}
