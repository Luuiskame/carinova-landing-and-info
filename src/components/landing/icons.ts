import type { ReviewSource } from '../../data/carinova.ts';

/**
 * The icons of the home page: the ones of the page Carinova wrote on 2026-11-18, by the id each has
 * in the page's sprite (Sprite.astro draws them once; Icon.astro and the scripts point at them with
 * `<use href="#id">`). Line icons take their colour from the text; the part that is filled
 * (`--ia`, `--iao`) is tinted by whoever uses the icon (landing.css).
 *
 * The flags of the language menu are 4:3. The ones of the United States, France, China and
 * Palestine follow flag-icons (MIT, github.com/lipis/flag-icons); Nicaragua's and Brazil's are
 * simplified for the size of an icon. Every shape of a flag names its colour: a shape that names
 * none is not drawn here (landing.css: `svg { fill: none }`).
 */
export const ICONS = {
  'i-plane': {
    viewBox: '0 0 24 24',
    body: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  },
  'i-plane-off': {
    viewBox: '0 0 24 24',
    body: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/><path d="M2.5 2.5l19 19"/>',
  },
  'i-ship': {
    viewBox: '0 0 24 24',
    body: '<path d="M12 10.2V14"/><path d="M12 2v3"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.4 20A11.6 11.6 0 0 0 21 14l-8.2-3.6a2 2 0 0 0-1.6 0L3 14a11.6 11.6 0 0 0 2.8 7.8"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  },
  'i-box': {
    viewBox: '0 0 24 24',
    body: '<path d="M3.3 7 12 12v10l-8-4.3A2 2 0 0 1 3 16V8a2 2 0 0 1 .3-1z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M11 21.7a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7z"/><path d="M12 22V12"/><path d="m3.3 7 7.7 4.7a2 2 0 0 0 2 0L20.7 7"/><path d="m7.5 4.3 9 5.15"/>',
  },
  'i-device': {
    viewBox: '0 0 24 24',
    body: '<rect x="7.5" y="4.5" width="9" height="11.5" rx="1" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect width="14" height="20" x="5" y="2" rx="2.5"/><path d="M12 18.6h.01" stroke-width="2.6"/>',
  },
  'i-calculator': {
    viewBox: '0 0 24 24',
    body: '<rect x="7.5" y="5.5" width="9" height="4" rx="1" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="4" y="2" width="16" height="20" rx="2.5"/><rect x="7.5" y="5.5" width="9" height="4" rx="1"/><path d="M8.5 13.6h.01M12 13.6h.01M15.5 13.6h.01M8.5 17.6h.01M12 17.6h.01M15.5 17.6h.01" stroke-width="2.6"/>',
  },
  'i-plus': { viewBox: '0 0 24 24', body: '<path d="M5 12h14M12 5v14"/>' },
  'i-minus': { viewBox: '0 0 24 24', body: '<path d="M5 12h14"/>' },
  'i-arrow': { viewBox: '0 0 24 24', body: '<path d="M5 12h14M13 6l6 6-6 6"/>' },
  'i-chevron': { viewBox: '0 0 24 24', body: '<path d="m9 18 6-6-6-6"/>' },
  'i-check': { viewBox: '0 0 24 24', body: '<path d="M20 6 9 17l-5-5"/>' },
  'i-alert': {
    viewBox: '0 0 24 24',
    body: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
  },
  'i-help': {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="10" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01" stroke-width="2.6"/>',
  },
  'i-ban': {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="9" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
  },
  'i-user': { viewBox: '0 0 24 24', body: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>' },
  'i-logout': {
    viewBox: '0 0 24 24',
    body: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  },
  'i-menu': { viewBox: '0 0 24 24', body: '<path d="M4 6h16M4 12h16M4 18h16"/>' },
  'i-close': { viewBox: '0 0 24 24', body: '<path d="M18 6 6 18M6 6l12 12"/>' },
  'i-search': {
    viewBox: '0 0 24 24',
    body: '<circle cx="11" cy="11" r="8" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  },
  'i-copy': {
    viewBox: '0 0 24 24',
    body: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>',
  },
  'i-chat': {
    viewBox: '0 0 24 24',
    body: '<path d="M3.4 20.6 4.7 16.5A9 9 0 1 1 8 19.7z"/><path fill="currentColor" stroke="none" d="M8.9 8.3c.2-.5.6-.6.9-.6h.6c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c-.1.1-.1.3 0 .5a6.4 6.4 0 0 0 2.6 2.4c.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .5-.1 1-.5 1.4-.4.4-1.1.6-1.8.5a8.3 8.3 0 0 1-5.8-4.8c-.3-.9-.2-2.3.2-3.1z"/>',
  },
  'i-briefcase': {
    viewBox: '0 0 24 24',
    body: '<path d="M2.5 9A2.5 2.5 0 0 1 5 6.5h14A2.5 2.5 0 0 1 21.5 9v3.5h-19z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="2.5" y="6.5" width="19" height="14" rx="2.5"/><path d="M8.5 6.5V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M2.5 12.5h19M10.5 11v3h3v-3"/>',
  },
  'i-quote': {
    viewBox: '0 0 24 24',
    body: '<g transform="rotate(180 12 12)"><rect x="5" y="6" width="5" height="5" rx="1" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="14" y="6" width="5" height="5" rx="1" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4.5A5.5 5.5 0 0 1 5.5 17"/><path d="M19 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4.5a5.5 5.5 0 0 1-4.5 5.5"/></g>',
  },
  'i-globe': {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  },
  'i-weapon': {
    viewBox: '0 0 24 24',
    body: '<rect x="2.5" y="6" width="19" height="4.6" rx="1.3" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="2.5" y="6" width="19" height="4.6" rx="1.3"/><path d="M5.2 10.6 3.6 19a.8.8 0 0 0 .8 1h3a1 1 0 0 0 1-.8l1.1-4.6h2.3a1 1 0 0 0 1-.8l.6-3.2"/><path d="M9.6 10.6a2.2 2.2 0 0 0 2.1 2.4"/><path d="M18.5 6V4.8"/>',
  },
  'i-cigarette': {
    viewBox: '0 0 24 24',
    body: '<rect x="2" y="13" width="5" height="4" rx="1" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="2" y="13" width="20" height="4" rx="1"/><path d="M7 13v4"/><path d="M17.5 10.5c0-1.6 1.6-1.6 1.6-3.2S17.5 5.7 17.5 4.2M20.8 10.5c0-1.2 1.2-1.2 1.2-2.4"/>',
  },
  'i-vape': {
    viewBox: '0 0 24 24',
    body: '<rect x="2.5" y="12" width="6" height="5" rx="1.6" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="2.5" y="12" width="15" height="5" rx="2"/><path d="M8.5 12v5M17.5 13.3h2.6a1.2 1.2 0 0 1 0 2.4h-2.6"/><path d="M15.6 9.7a1.6 1.6 0 0 1 1.8-2.3 2.1 2.1 0 0 1 3.8.4 1.5 1.5 0 0 1 .1 2.9h-4.7a1.1 1.1 0 0 1-1-1z"/>',
  },
  'i-alcohol': {
    viewBox: '0 0 24 24',
    body: '<path d="M9.5 21h5a2 2 0 0 0 2-2v-8.3a3 3 0 0 0-.8-2L14 6.9V3h-4v3.9L8.3 8.7a3 3 0 0 0-.8 2V19a2 2 0 0 0 2 2z"/><path d="M7.5 13h9v4h-9z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M10 5h4"/>',
  },
  'i-propeller': {
    viewBox: '0 0 24 24',
    body: '<g transform="rotate(0 12 12)"><path d="M12 10C10.3 7.3 10.5 4 12 2.6c1.5 1.4 1.7 4.7 0 7.4z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M12 10C10.3 7.3 10.5 4 12 2.6c1.5 1.4 1.7 4.7 0 7.4z"/></g><g transform="rotate(120 12 12)"><path d="M12 10C10.3 7.3 10.5 4 12 2.6c1.5 1.4 1.7 4.7 0 7.4z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M12 10C10.3 7.3 10.5 4 12 2.6c1.5 1.4 1.7 4.7 0 7.4z"/></g><g transform="rotate(240 12 12)"><path d="M12 10C10.3 7.3 10.5 4 12 2.6c1.5 1.4 1.7 4.7 0 7.4z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M12 10C10.3 7.3 10.5 4 12 2.6c1.5 1.4 1.7 4.7 0 7.4z"/></g><circle cx="12" cy="12" r="2"/>',
  },
  'i-radio': {
    viewBox: '0 0 24 24',
    body: '<path d="M12 10.5 16 21H8z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M12 10.5 8 21M12 10.5 16 21M9.2 17.6h5.6"/><circle cx="12" cy="8.3" r="1.6"/><path d="M8.7 4.9a4.8 4.8 0 0 0 0 6.8M15.3 4.9a4.8 4.8 0 0 1 0 6.8M5.9 2.4a8.6 8.6 0 0 0 0 11.8M18.1 2.4a8.6 8.6 0 0 1 0 11.8"/>',
  },
  'i-drone': {
    viewBox: '0 0 24 24',
    body: '<rect x="9" y="9.5" width="6" height="5" rx="1.6" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="9" y="9.5" width="6" height="5" rx="1.6"/><path d="M9.6 10.1 7.4 7.9M14.4 10.1l2.2-2.2M9.6 13.9l-2.2 2.2M14.4 13.9l2.2 2.2"/><circle cx="5.7" cy="6.2" r="2.6"/><circle cx="18.3" cy="6.2" r="2.6"/><circle cx="5.7" cy="17.8" r="2.6"/><circle cx="18.3" cy="17.8" r="2.6"/>',
  },
  'i-flame': {
    viewBox: '0 0 24 24',
    body: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  },
  'i-battery': {
    viewBox: '0 0 24 24',
    body: '<rect x="4.5" y="9" width="4" height="6" rx="1" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="2.5" y="7" width="17" height="10" rx="2.2"/><path d="M21.5 10.5v3"/><path d="M12.6 9.2 10.5 12.2h3.2l-2.1 2.9"/>',
  },
  'i-spray': {
    viewBox: '0 0 24 24',
    body: '<path d="M6.5 14h8v5.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="6.5" y="9.5" width="8" height="12" rx="2"/><path d="M8.5 9.5V7.5h4v2M9.3 7.5V5h2.4v2.5M11.7 6h1.8"/><path d="M16.3 4.6h.01M18.4 6.2h.01M16.3 7.8h.01M20.4 4.2h.01M20.4 8.2h.01" stroke-width="2.6"/>',
  },
  'i-perfume': {
    viewBox: '0 0 24 24',
    body: '<path d="M5.5 15h13v3a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="5.5" y="9" width="13" height="12" rx="3"/><path d="M9.5 9V6.5h5V9M10.5 6.5V3.5h3v3"/>',
  },
  'i-aerosol': {
    viewBox: '0 0 24 24',
    body: '<path d="M7 12.5h8V17H7z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M7 10a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v10.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/><path d="M9.6 7V4.4h2.8V7M12.4 5.6h2.1M7 12.5h8M7 17h8"/><path d="M17.6 4.4h.01M19.5 5.9h.01M17.6 7.3h.01" stroke-width="2.6"/>',
  },
  'i-sofa': {
    viewBox: '0 0 24 24',
    body: '<path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11"/><path d="M3 13.5a2 2 0 0 1 4 0V15h10v-1.5a2 2 0 0 1 4 0V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M6 19v1.5M18 19v1.5"/>',
  },
  'i-bag': {
    viewBox: '0 0 24 24',
    body: '<path d="M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  },
  'i-hanger': {
    viewBox: '0 0 24 24',
    body: '<path d="M12 8.5 2.9 15.4A1.4 1.4 0 0 0 3.7 18h16.6a1.4 1.4 0 0 0 .8-2.6z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M12 8.5V8a2 2 0 1 0-2-2"/><path d="M12 8.5 2.9 15.4A1.4 1.4 0 0 0 3.7 18h16.6a1.4 1.4 0 0 0 .8-2.6z"/>',
  },
  'i-cart': {
    viewBox: '0 0 24 24',
    body: '<path d="M5.7 8H21l-1.7 6.6a1.7 1.7 0 0 1-1.6 1.3H9.1a1.7 1.7 0 0 1-1.7-1.4z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.3l2.2 11a1.7 1.7 0 0 0 1.7 1.4h8.6a1.7 1.7 0 0 0 1.6-1.3L21 8H5.7"/>',
  },
  'i-sneaker': {
    viewBox: '0 0 24 24',
    body: '<path d="M2.5 15h19v2a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M2.5 17v-7a1 1 0 0 1 1.2-1l2.6.6a2.6 2.6 0 0 0 2.7-1.2L10 7l2.6 3.2a7 7 0 0 0 4.6 2.5l2.4.3a2.2 2.2 0 0 1 1.9 2.2V17a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1z"/><path d="M2.5 15h19M11.1 9.2l-1.3 1.6M13.2 11.3l-1.3 1.5"/>',
  },
  'i-laptop': {
    viewBox: '0 0 24 24',
    body: '<rect x="6" y="6.5" width="12" height="7" rx="0.6" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="4" y="4.5" width="16" height="11" rx="1.6"/><path d="M4 15.5 2.6 18.9a.8.8 0 0 0 .7 1.1h17.4a.8.8 0 0 0 .7-1.1L20 15.5M10 18h4"/>',
  },
  'i-gavel': {
    viewBox: '0 0 24 24',
    body: '<g transform="rotate(45 14.5 8.5)"><rect x="11" y="4" width="7" height="9" rx="1.4" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><rect x="11" y="4" width="7" height="9" rx="1.4"/><path d="M11 6.6h7M11 10.4h7"/></g><path d="m11.3 11.9-7.4 7.4"/><path d="M13 21h8"/>',
  },
  'i-store': {
    viewBox: '0 0 24 24',
    body: '<path d="M2.5 10 4.5 4h15l2 6a3.17 3.17 0 0 1-6.33 0 3.17 3.17 0 0 1-6.34 0 3.17 3.17 0 0 1-6.33 0z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M4 10v10h16V10M2.5 10 4.5 4h15l2 6"/><path d="M2.5 10a3.17 3.17 0 0 0 6.33 0 3.17 3.17 0 0 0 6.34 0 3.17 3.17 0 0 0 6.33 0M9.5 20v-5h5v5"/>',
  },
  'i-users': {
    viewBox: '0 0 24 24',
    body: '<circle cx="9" cy="7" r="4" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  },
  'i-warehouse': {
    viewBox: '0 0 24 24',
    body: '<path d="M7 12.5h10V21H7z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M3 21V9.3a1 1 0 0 1 .5-.9l8-4.6a1 1 0 0 1 1 0l8 4.6a1 1 0 0 1 .5.9V21"/><path d="M7 21v-8.5h10V21M7 15.5h10M7 18.3h10M2 21h20"/>',
  },
  'i-tag': {
    viewBox: '0 0 24 24',
    body: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" style="fill:var(--ia,currentColor);fill-opacity:var(--iao,.22);stroke:none"/><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  },
  'i-clock': { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  'i-calendar': {
    viewBox: '0 0 24 24',
    body: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  },
  // A review's card: the link that leads to it on its source, and the stars of a review from Google
  'i-external': { viewBox: '0 0 24 24', body: '<path d="M7 17 17 7M9 7h8v8"/>' },
  'i-star': {
    viewBox: '0 0 24 24',
    body: '<path fill="currentColor" d="M12 2.5l2.25 6.91h7.26l-5.88 4.27 2.25 6.91L12 16.32l-5.88 4.27 2.25-6.91-5.88-4.27h7.27z"/>',
  },
  'flag-ni': {
    viewBox: '0 0 640 480',
    body: '<path fill="#0067c6" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><circle cx="320" cy="240" r="56" fill="#fff" stroke="#c09a00" stroke-width="12"/><path fill="#4aa3df" d="M320 204 352 259H288z"/><path fill="#2f8a3c" d="M288 259l14-22 9 11 9-14 9 14 9-11 14 22z"/>',
  },
  'flag-us': {
    viewBox: '0 0 640 480',
    body: '<path fill="#bd3d44" d="M0 0h640v480H0"/><path stroke="#fff" stroke-width="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/><path fill="#192f5d" d="M0 0h364.8v258.5H0"/><marker id="flag-us-star" markerHeight="30" markerWidth="30"><path fill="#fff" d="m14 0 9 27L0 10h28L5 27z"/></marker><path fill="none" marker-mid="url(#flag-us-star)" d="m0 0 16 11h61 61 61 61 60L47 37h61 61 60 61L16 63h61 61 61 61 60L47 89h61 61 60 61L16 115h61 61 61 61 60L47 141h61 61 60 61L16 166h61 61 61 61 60L47 192h61 61 60 61L16 218h61 61 61 61 60z"/>',
  },
  'flag-br': {
    viewBox: '0 0 640 480',
    body: '<path fill="#009b3a" d="M0 0h640v480H0z"/><path fill="#fedf00" d="M64 240 320 64l256 176-256 176z"/><circle cx="320" cy="240" r="112" fill="#002776"/><path fill="none" stroke="#fff" stroke-width="20" d="M214 214c72-22 150-8 214 40"/>',
  },
  'flag-fr': {
    viewBox: '0 0 640 480',
    body: '<path fill="#000091" d="M0 0h213.3v480H0z"/><path fill="#fff" d="M213.3 0h213.4v480H213.3z"/><path fill="#e1000f" d="M426.7 0H640v480H426.7z"/>',
  },
  'flag-cn': {
    viewBox: '0 0 640 480',
    body: '<path fill="#ee1c25" d="M0 0h640v480H0z"/><g fill="#ff0"><path transform="matrix(71.9991 0 0 72 120 120)" d="M-.6.8 0-1 .6.8-1-.3h2z"/><path transform="matrix(-12.33562 -20.5871 20.58684 -12.33577 240.3 48)" d="M-.6.8 0-1 .6.8-1-.3h2z"/><path transform="matrix(-3.38573 -23.75998 23.75968 -3.38578 288 95.8)" d="M-.6.8 0-1 .6.8-1-.3h2z"/><path transform="matrix(6.5991 -23.0749 23.0746 6.59919 288 168)" d="M-.6.8 0-1 .6.8-1-.3h2z"/><path transform="matrix(14.9991 -18.73557 18.73533 14.99929 240 216)" d="M-.6.8 0-1 .6.8-1-.3h2z"/></g>',
  },
  's-facebook': {
    viewBox: '0 0 24 24',
    body: '<path fill="currentColor" stroke="none" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>',
  },
  's-instagram': {
    viewBox: '0 0 24 24',
    body: '<path fill="currentColor" stroke="none" d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/>',
  },
  's-tiktok': {
    viewBox: '0 0 24 24',
    body: '<path fill="currentColor" stroke="none" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
  },
  'flag-ru': {
    viewBox: '0 0 640 480',
    body: '<path fill="#fff" d="M0 0h640v160H0z"/><path fill="#0039a6" d="M0 160h640v160H0z"/><path fill="#d52b1e" d="M0 320h640v160H0z"/>',
  },
  // Arabic, by the developer's word (2026-11-23): Palestine's flag
  'flag-ps': {
    viewBox: '0 0 640 480',
    body: '<path fill="#009639" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 0h640v320H0z"/><path fill="#000" d="M0 0h640v160H0z"/><path fill="#ed2e38" d="m0 0 320 240L0 480Z"/>',
  },
  // Google's "G", in its four colours: the source of a review (drawn once a review comes from Google)
  's-google': {
    viewBox: '0 0 24 24',
    body: '<g stroke="none"><path fill="#4285f4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34a853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#fbbc05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#ea4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></g>',
  },
} as const;

export type IconId = keyof typeof ICONS;

/** The logo that names the source of a review on its card (the reviews: src/data/carinova.ts). */
export const REVIEW_SOURCE_ICONS = { facebook: 's-facebook', google: 's-google' } as const satisfies Record<
  ReviewSource,
  IconId
>;

/** What only a review from Google draws (its logo, its stars): left out of the page until one is there (Sprite.astro). */
export const GOOGLE_ONLY_ICONS: ReadonlyArray<IconId> = ['s-google', 'i-star'];

/**
 * The icons a visitor sees before scrolling: the ones of the bar of notices, the header, the opening
 * and the WhatsApp button. Their drawings come first in the page (Sprite.astro); the flag of the
 * page's language joins them there.
 */
export const FIRST_SCREEN_ICONS: ReadonlyArray<IconId> = [
  // The bar of notices: one per kind of notice, its link, "next" and "close"
  'i-tag',
  'i-clock',
  'i-globe',
  'i-calendar',
  'i-arrow',
  'i-chevron',
  'i-close',
  // The header
  'i-user',
  'i-menu',
  // The three rates of the opening
  'i-plane',
  'i-ship',
  'i-device',
  // The floating WhatsApp button
  'i-chat',
];
