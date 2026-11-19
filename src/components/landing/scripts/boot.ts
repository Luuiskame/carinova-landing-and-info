// The script every visit to the home page runs: the header (the language menu, the menu, the button
// that appears once the opening is out of sight, which section is on screen), the rate that
// alternates in the opening, the titles that must fit on one line, and the doors to everything
// else. The calculator, the article search, the dialogs and the reviews are other files, fetched
// when they are about to be used (lazy.ts): a visitor who reads the page and leaves downloads none
// of them.
import { $, $$, reducedMotion, whenIdle } from './dom';
import { loadArticles, loadCalculator, loadCarousel, loadDialogs } from './lazy';

// ───────── Header: the language menu and the menu ─────────
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
const setMenu = (open: boolean) => {
  if (!menuButton || !mobileMenu) return;
  mobileMenu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', (open ? menuButton.dataset.close : menuButton.dataset.open) ?? '');
  $('use', menuButton)?.setAttribute('href', open ? '#i-close' : '#i-menu');
};
const closeMenu = () => {
  if (mobileMenu && !mobileMenu.hidden) setMenu(false);
};

if (langButton && langMenu) {
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
}
document.addEventListener('click', (event) => {
  const target = event.target as Element;
  if (!target.closest('.lang-wrap')) closeLanguages();
  if (!target.closest('.header-inner')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || $<HTMLDialogElement>('#modal')?.open) return;
  if (mobileMenu && !mobileMenu.hidden) {
    closeMenu();
    menuButton?.focus();
  }
  closeLanguages();
});

if ('IntersectionObserver' in window) {
  // "Crear cuenta" joins the bar once the opening's own button is out of sight, and leaves it at the closing call.
  const header = $('.site-header');
  const heroActions = $('.hero-actions');
  const finalActions = $('.final-actions');
  if (header && heroActions && finalActions) {
    let pastHero = false;
    let atClosing = false;
    const update = () => header.classList.toggle('show-cta', pastHero && !atClosing);
    new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(heroActions);
    new IntersectionObserver(([entry]) => {
      atClosing = entry.isIntersecting;
      update();
    }).observe(finalActions);
  }

  // The link of the section that is on screen is the current one.
  const spies = $$('[data-spy]');
  const visible = new Set<string>();
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      for (const link of spies) {
        if (visible.has(link.dataset.spy ?? '')) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  for (const link of spies) {
    const section = document.getElementById(link.dataset.spy ?? '');
    if (section) spy.observe(section);
  }
}

// ───────── The opening: the sea rate alternates between its two prices ─────────
// It stops under the pointer, with the focus and off screen. Where movement is reduced both prices
// are shown, one under the other (landing.css), and nothing alternates.
{
  const rotator = $('[data-rotator]');
  const card = rotator?.closest<HTMLElement>('.hero-rate');
  if (rotator && card) {
    const faces = $$('.rate-face', rotator);
    let index = 0;
    let paused = false;
    let onScreen = true;
    let timer = 0;
    const show = (next: number) => {
      const incoming = faces[next];
      // The one that comes in always comes from below.
      incoming.style.transition = 'none';
      incoming.classList.remove('is-leaving');
      void incoming.offsetWidth;
      incoming.style.transition = '';
      faces.forEach((face, position) => {
        face.classList.toggle('is-active', position === next);
        face.classList.toggle('is-leaving', position === index && position !== next);
      });
      index = next;
    };
    const start = () => {
      clearInterval(timer);
      if (reducedMotion.matches) {
        for (const face of faces) face.classList.remove('is-leaving');
        return;
      }
      timer = window.setInterval(() => {
        if (!paused && onScreen && !document.hidden) show((index + 1) % faces.length);
      }, 4000);
    };
    card.addEventListener('pointerenter', () => (paused = true));
    card.addEventListener('pointerleave', () => (paused = false));
    card.addEventListener('focusin', () => (paused = true));
    card.addEventListener('focusout', () => (paused = false));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting)).observe(card);
    }
    reducedMotion.addEventListener?.('change', start);
    start();
  }
}

// ───────── Titles of one line: their size gives way until they fit ─────────
// All the titles are measured first and sized after, so the page is laid out once, and only when
// the browser is idle (they are below the opening), when the font arrives and when the window changes.
//
// What is measured is the words, not the box that holds them: the box cuts what does not fit until
// this has run (landing.css), so its own width says nothing about them.
{
  const titles = $$('.one-line');
  const words = document.createRange();
  const fit = () => {
    for (const title of titles) title.style.fontSize = '';
    const sizes = titles.map((title) => {
      const box = title.parentElement;
      if (!box) return null;
      const style = getComputedStyle(box);
      const room = Math.min(
        title.clientWidth,
        box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      );
      words.selectNodeContents(title);
      const needed = words.getBoundingClientRect().width;
      return room && needed > room ? (parseFloat(getComputedStyle(title).fontSize) * room * 0.98) / needed : null;
    });
    titles.forEach((title, position) => {
      const size = sizes[position];
      if (size) title.style.fontSize = `${size}px`;
    });
  };
  if (titles.length) {
    whenIdle(fit);
    document.fonts?.ready.then(fit);
    let frame = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
  }
}

// ───────── The doors to what is fetched when it is used ─────────

/** Where a link leads by itself: what happens when the part it opens cannot be fetched. */
const follow = (link: HTMLAnchorElement) => {
  if (link.target === '_blank') window.open(link.href, '_blank', 'noopener');
  else window.location.assign(link.href);
};

/** The elements that open the dialog: the stores, and whatever says which view it opens. */
const DOORS = '.store[data-store], [data-dialog]';

document.addEventListener('click', (event) => {
  const door = (event.target as Element).closest<HTMLAnchorElement>(DOORS);
  // A click that asks for a new tab or a new window is left alone.
  if (
    !door ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  loadDialogs()
    .then((dialogs) => dialogs.open(door))
    .catch(() => follow(door));
});
// The dialogs start to arrive as soon as a door is about to be used, so they open without a wait.
for (const type of ['pointerover', 'focusin', 'touchstart'] as const) {
  document.addEventListener(
    type,
    (event) => {
      if ((event.target as Element).closest?.(DOORS)) void loadDialogs().catch(() => {});
    },
    { passive: true }
  );
}

// The article search: its catalogue arrives when the field is about to be used.
{
  const form = $<HTMLFormElement>('#article-form');
  const query = $<HTMLInputElement>('#article-query');
  if (form && query) {
    const search = (text: string) =>
      loadArticles()
        .then((articles) => articles.search(text))
        .catch(() => window.location.assign(form.action));
    form.addEventListener('focusin', () => void loadArticles().catch(() => {}), { once: true });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void search(query.value);
    });
    for (const chip of $$<HTMLButtonElement>('[data-article]')) {
      chip.addEventListener('click', () => {
        query.value = chip.dataset.article ?? '';
        void search(query.value);
      });
    }
  }
}

// The calculator: its first estimate is already in the page. Its script arrives when the section
// is near, when something in it is touched, or when a rate of the opening sends the visitor to it.
{
  const calculator = $('.calculator');
  if (calculator) {
    const arrive = () => void loadCalculator().catch(() => {});
    if ('IntersectionObserver' in window) {
      const near = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          near.disconnect();
          arrive();
        },
        { rootMargin: '600px 0px' }
      );
      near.observe(calculator);
    } else whenIdle(arrive);
    for (const type of ['focusin', 'pointerdown', 'input', 'change'] as const) {
      calculator.addEventListener(type, arrive, { once: true, passive: true });
    }
    for (const rate of $$('[data-set-mode], [data-set-category]')) {
      rate.addEventListener('click', () => {
        const { setMode, setCategory } = rate.dataset;
        void loadCalculator()
          .then((module) => module.apply({ mode: setMode, category: setCategory }))
          .catch(() => {});
      });
    }
  }
}

// The reviews, when the page has them: the cards start to advance when they are near.
{
  const reviews = $('#clientes');
  if (reviews) whenIdle(() => void loadCarousel().catch(() => {}));
}
