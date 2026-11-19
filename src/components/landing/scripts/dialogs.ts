// The dialog of the home page and its views, as Carinova designed them: the choice a store opens
// (buy it yourself, or have Carinova buy it), the two forms that end in a WhatsApp message
// (Personal Shopper and Carinova Business), the message ready to send, and the conditions of the
// service. The directory of stores is one more view, in a file of its own (directory.ts).
//
// Fetched, with its stylesheet, the first time something opens the dialog (boot.ts). Nothing here
// talks to a server: a request is a message the visitor sends from their own WhatsApp. The
// sentences come with the page (ScriptData "dialogs"). The views of the account are a file of
// their own (account.ts), which does talk to the site's API.
import stylesheet from '~/assets/styles/landing-dialog.css?url';
import { fill } from '~/utils/template';
import { whatsappLink } from '~/utils/whatsapp';

import { $, $$, esc, icon, need, pageData } from './dom';
import { loadDirectory } from './lazy';

export interface DialogConfig {
  whatsapp: string;
  limits: { links: number; quantity: number; phoneDigits: [number, number]; urlLength: number };
  /** Where in Nicaragua: the name the messages use and how the form writes it ("Managua (MG)"). */
  departments: Array<{ value: string; label: string }>;
  defaultDepartment: string;
  /** What each store of the home page is, by its id. */
  stores: Record<string, string>;
  /** The names of the directory's categories. */
  kinds: Record<string, string>;
  text: Record<string, string>;
}

export const config = pageData<DialogConfig>('dialogs');
const { text, limits, departments } = config;
/** A department as the forms and the messages write it: "Managua (MG)". */
export const departmentLabel = (name: string): string => departments.find((item) => item.value === name)?.label ?? name;

const modal = need<HTMLDialogElement>('#modal');
export const content = need('#modal-content');
const coarsePointer = matchMedia('(pointer: coarse)');

/**
 * The stylesheet of the dialogs, asked for by this script and not by the page: a stylesheet the
 * page names in its <head> holds up the first paint, and nobody has opened a dialog yet. A view is
 * drawn once it has arrived (or has failed to: the dialog still works, plainer).
 */
export const styles = new Promise<void>((resolve) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = stylesheet;
  link.onload = link.onerror = () => resolve();
  document.head.append(link);
});

// ───────── The dialog ─────────
let lastFocused: HTMLElement | null = null;
let afterClose: (() => void) | null = null;
let closingFromHistory = false;
let awaitingBack = false;

const runAfterClose = () => {
  const next = afterClose;
  afterClose = null;
  next?.();
};

/** A view starts at its first field; on a phone, at its title, so the keyboard does not cover it. */
const focusFirst = () => {
  const field = coarsePointer.matches
    ? null
    : $(
        'input:not([type=hidden]):not([type=checkbox]):not([disabled]):not([readonly]),select:not([disabled]),textarea:not([readonly])',
        content
      );
  (field ?? $('#modal-title', content) ?? modal).focus({ preventScroll: true });
};

/** Draws a view in the dialog and opens it if it is closed. `variant` is its width (landing-dialog.css). */
export const showView = (render: () => void, variant = ''): void => {
  const opening = !modal.open;
  if (opening) lastFocused = document.activeElement as HTMLElement | null;
  modal.className = `modal${variant ? ` is-${variant}` : ''}`;
  render();
  if (opening) {
    modal.showModal();
    // The phone's "back" closes the dialog instead of leaving the page.
    try {
      history.pushState({ carinovaModal: true }, '');
    } catch {
      /* The history is optional. */
    }
  }
  content.scrollTop = 0;
  requestAnimationFrame(focusFirst);
};

export const closeDialog = (then: (() => void) | null = null): void => {
  afterClose = then;
  if (modal.open) modal.close();
  else runAfterClose();
};

need('#modal-close').addEventListener('click', () => closeDialog());
modal.addEventListener('close', () => {
  lastFocused?.focus?.({ preventScroll: true });
  if (!closingFromHistory && history.state?.carinovaModal) {
    awaitingBack = true;
    history.back();
  } else runAfterClose();
  closingFromHistory = false;
});
window.addEventListener('popstate', () => {
  if (awaitingBack) {
    awaitingBack = false;
    runAfterClose();
    return;
  }
  if (modal.open) {
    closingFromHistory = true;
    modal.close();
  }
});
// A click on the veil around the dialog closes it.
modal.addEventListener('click', (event) => {
  if (event.target !== modal) return;
  const box = modal.getBoundingClientRect();
  const outside =
    event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  if (outside) closeDialog();
});
content.addEventListener('input', (event) => {
  const field = event.target as Element;
  if (field.getAttribute('aria-invalid') === 'true') field.removeAttribute('aria-invalid');
});

// ───────── What the views share ─────────
export const heading = (eyebrow: string, title: string, intro = ''): string =>
  `<p class="modal-eyebrow">${esc(eyebrow)}</p><h2 class="modal-title" id="modal-title" tabindex="-1">${esc(title)}</h2>` +
  (intro ? `<p class="modal-intro">${esc(intro)}</p>` : '');

export const errorBox = (id = 'form-error'): string =>
  `<p id="${id}" class="form-error" role="alert" tabindex="-1" hidden>${icon('alert')}<span></span></p>`;

/** Says what is wrong with a form and takes the visitor to the field. */
export const showError = (message: string, fieldId = '', boxId = 'form-error'): void => {
  const box = need(`#${boxId}`, content);
  need('span', box).textContent = message;
  box.hidden = false;
  for (const node of $$('[aria-invalid="true"]', content)) node.removeAttribute('aria-invalid');
  const field = fieldId ? document.getElementById(fieldId) : null;
  if (field) {
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  } else box.focus();
};

/** What a form keeps when it is drawn again (a product added or removed). */
const snapshot = (): Array<{ id: string; value: string; checked: boolean; type: string }> =>
  $$<HTMLInputElement>('input,select,textarea', content)
    .filter((field) => !field.readOnly && field.id)
    .map((field) => ({ id: field.id, value: field.value, checked: field.checked, type: field.type }));
const restore = (fields: ReturnType<typeof snapshot>): void => {
  for (const saved of fields) {
    const field = document.getElementById(saved.id) as HTMLInputElement | null;
    if (!field) continue;
    if (saved.type === 'checkbox' || saved.type === 'radio') field.checked = saved.checked;
    else field.value = saved.value;
  }
};

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
}

/** Who asks: the fields the two forms start with. `prefix` keeps their ids apart. */
export const contactFields = (prefix: string): string =>
  `<div class="grid-2">` +
  `<label class="field"><span>${esc(text.firstName)}</span><input class="input" name="firstName" id="${prefix}-first" required maxlength="80" autocomplete="given-name" dir="auto" placeholder="${esc(text.firstNamePlaceholder)}"></label>` +
  `<label class="field"><span>${esc(text.lastName)}</span><input class="input" name="lastName" id="${prefix}-last" required maxlength="80" autocomplete="family-name" dir="auto" placeholder="${esc(text.lastNamePlaceholder)}"></label>` +
  `</div><div class="grid-2">` +
  `<label class="field"><span>${esc(text.email)}</span><input class="input" name="email" id="${prefix}-email" type="email" inputmode="email" required maxlength="160" autocomplete="email" placeholder="${esc(text.emailPlaceholder)}"></label>` +
  `<label class="field"><span>${esc(text.phone)}</span><input class="input" name="phone" id="${prefix}-phone" type="tel" inputmode="tel" required maxlength="25" autocomplete="tel" placeholder="${esc(text.phonePlaceholder)}"></label>` +
  `</div><label class="field"><span>${esc(text.department)}</span><select class="input" name="department" id="${prefix}-department" required>` +
  `<option value="">${esc(text.departmentPlaceholder)}</option>` +
  departments.map(({ value: name, label }) => `<option value="${esc(name)}">${esc(label)}</option>`).join('') +
  `</select></label>`;

export const contactOf = (form: HTMLFormElement): Contact => {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? '').trim();
  return {
    firstName: value('firstName'),
    lastName: value('lastName'),
    email: value('email').toLowerCase(),
    phone: value('phone'),
    department: value('department'),
  };
};

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').length;
  return /^[+\d\s().-]+$/.test(value) && digits >= limits.phoneDigits[0] && digits <= limits.phoneDigits[1];
};

/** What is wrong with who asks, and in which field; null when nothing is. */
export const contactProblem = (contact: Contact, prefix: string): [string, string] | null => {
  if (!contact.firstName) return [text.invalidName, `${prefix}-first`];
  if (!contact.lastName) return [text.invalidName, `${prefix}-last`];
  if (!isEmail(contact.email)) return [text.invalidEmail, `${prefix}-email`];
  if (!isPhone(contact.phone)) return [text.invalidPhone, `${prefix}-phone`];
  if (!departments.some((item) => item.value === contact.department))
    return [text.invalidDepartment, `${prefix}-department`];
  return null;
};

const CHANNELS: Record<string, string> = {
  whatsapp: text.channelWhatsapp,
  phone: text.channelPhone,
  email: text.channelEmail,
};
const channelField = (prefix: string): string =>
  `<label class="field"><span>${esc(text.contactChannel)}</span><select class="input" name="channel" id="${prefix}-channel">` +
  Object.entries(CHANNELS)
    .map(([id, name]) => `<option value="${id}">${esc(name)}</option>`)
    .join('') +
  `</select></label>`;

/** The lines of a message that say who asks, and how they want to be answered when the form asked. */
export const contactLines = (contact: Contact, channel?: string): Array<string> => [
  fill(text.msgContact, { name: `${contact.firstName} ${contact.lastName}`.trim() }),
  fill(text.msgEmail, { email: contact.email }),
  fill(text.msgPhone, { phone: contact.phone }),
  fill(text.msgDepartment, { department: departmentLabel(contact.department) }),
  ...(channel === undefined ? [] : [fill(text.msgChannel, { channel: CHANNELS[channel] ?? CHANNELS.whatsapp })]),
];

// ───────── The message, ready to send ─────────
export const showMessage = (message: string): void =>
  showView(() => {
    const link = whatsappLink(config.whatsapp, message);
    // WhatsApp does not take a link that long: the visitor copies the message and pastes it in the chat.
    const long = link.length > 6500;
    content.innerHTML =
      heading(text.messageEyebrow, text.preparedTitle, text.preparedText) +
      `<label class="message-label" for="prepared-message">${esc(text.completeMessage)}</label>` +
      `<textarea class="message" id="prepared-message" readonly dir="auto">${esc(message)}</textarea>` +
      `<div class="message-actions"><a class="btn btn-wa btn-block" href="${esc(long ? whatsappLink(config.whatsapp) : link)}" target="_blank" rel="noopener">${icon('chat')}<span>${esc(long ? text.openSalesChat : text.continueWhatsapp)}</span></a>` +
      `<button class="btn btn-secondary btn-block" type="button" id="copy-message">${icon('copy')}<span>${esc(text.copyMessage)}</span></button></div>` +
      `<p class="copy-feedback" id="copy-feedback" role="status"></p>` +
      (long ? `<p class="note">${esc(text.longMessage)}</p>` : '') +
      `<p class="modal-footnote">${esc(text.whatsappNote)}</p>`;
    need('#copy-message', content).addEventListener('click', async () => {
      const feedback = need('#copy-feedback', content);
      try {
        await navigator.clipboard.writeText(message);
        feedback.textContent = text.messageCopied;
      } catch {
        const area = need<HTMLTextAreaElement>('#prepared-message', content);
        area.focus();
        area.select();
        feedback.textContent = text.copyManually;
      }
    });
  });

// ───────── Personal Shopper: the product links ─────────
interface Product {
  key: number;
  url: string;
  name: string;
  quantity: string;
}
let products: Array<Product> = [{ key: 1, url: '', name: '', quantity: '1' }];

const readProducts = (): Array<Product> =>
  $$('[data-product]', content).map((row) => ({
    key: Number(row.dataset.product),
    url: need<HTMLInputElement>('[data-product-url]', row).value,
    name: need<HTMLInputElement>('[data-product-name]', row).value,
    quantity: need<HTMLInputElement>('[data-product-quantity]', row).value,
  }));

/** What is wrong with the products, and in which field; null when nothing is. */
const productsProblem = (items: Array<Product>): [string, string] | null => {
  if (items.length < 1 || items.length > limits.links) return [text.invalidLinks, ''];
  for (const [index, item] of items.entries()) {
    const number = index + 1;
    try {
      const url = new URL(item.url.trim());
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        !url.hostname ||
        item.url.length > limits.urlLength
      ) {
        throw new Error('not a product link');
      }
    } catch {
      return [fill(text.invalidUrl, { number }), `product-url-${item.key}`];
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > limits.quantity) {
      return [fill(text.invalidProductQuantity, { number }), `product-quantity-${item.key}`];
    }
  }
  return null;
};

const renderShopper = (): void => {
  const rows = products
    .map(
      (item, index) =>
        `<fieldset class="product" data-product="${item.key}"><legend>${esc(fill(text.productNumber, { number: index + 1 }))}</legend>` +
        `<button class="product-remove" type="button" data-remove-product="${item.key}" aria-label="${esc(fill(text.removeProduct, { number: index + 1 }))}"${products.length === 1 ? ' disabled' : ''}>${icon('close')}</button>` +
        `<label class="field"><span>${esc(text.productLink)}</span><input class="input" type="url" inputmode="url" data-product-url id="product-url-${item.key}" value="${esc(item.url)}" required maxlength="${limits.urlLength}" placeholder="${esc(text.productUrlPlaceholder)}"></label>` +
        `<div class="grid-2"><label class="field"><span>${esc(text.productName)}</span><input class="input" data-product-name id="product-name-${item.key}" value="${esc(item.name)}" maxlength="120" dir="auto" placeholder="${esc(text.productNamePlaceholder)}"></label>` +
        `<label class="field"><span>${esc(text.productQuantity)}</span><input class="input num" data-product-quantity id="product-quantity-${item.key}" type="number" inputmode="numeric" value="${esc(item.quantity)}" min="1" max="${limits.quantity}" step="1" required></label></div></fieldset>`
    )
    .join('');

  content.innerHTML =
    heading(text.shopperEyebrow, text.shopperTitle, text.shopperIntro) +
    `<form class="form" id="shopper-form" novalidate>${contactFields('shopper')}` +
    `<div id="shopper-products" class="products">${rows}</div>` +
    `<div class="product-tools"><span>${esc(fill(text.linkCount, { count: products.length }))}</span>` +
    `<button class="btn btn-secondary btn-sm" type="button" id="add-product"${products.length >= limits.links ? ' disabled' : ''}>${icon('plus')}<span>${esc(text.addLink)}</span></button></div>` +
    channelField('shopper') +
    `<label class="field"><span>${esc(text.details)}</span><textarea class="input" name="details" id="shopper-details" maxlength="2000" dir="auto" placeholder="${esc(text.shopperDetails)}"></textarea></label>` +
    `<label class="check-label"><input type="checkbox" name="consent" id="shopper-consent" required><span>${esc(text.requestConsent)}</span></label>` +
    `${errorBox()}<button class="btn btn-primary btn-block" type="submit">${esc(text.prepareRequest)}</button></form>`;

  const form = need<HTMLFormElement>('#shopper-form', content);
  const redraw = () => {
    const saved = snapshot();
    renderShopper();
    restore(saved);
  };
  need('#add-product', content).addEventListener('click', () => {
    if (products.length >= limits.links) return;
    products = readProducts();
    const key = Math.max(...products.map((item) => item.key)) + 1;
    products.push({ key, url: '', name: '', quantity: '1' });
    redraw();
    document.getElementById(`product-url-${key}`)?.focus();
  });
  for (const button of $$('[data-remove-product]', content)) {
    button.addEventListener('click', () => {
      products = readProducts().filter((item) => item.key !== Number(button.dataset.removeProduct));
      redraw();
      $('#add-product', content)?.focus();
    });
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const contact = contactOf(form);
    const items = readProducts();
    const problem = contactProblem(contact, 'shopper') ?? productsProblem(items);
    if (problem) return showError(...problem);
    const data = new FormData(form);
    if (!data.get('consent')) return showError(text.consentRequired, 'shopper-consent');
    products = items;
    const details = String(data.get('details') ?? '').trim();
    showMessage(
      [
        text.msgHello,
        text.msgShopper,
        ...contactLines(contact, String(data.get('channel') ?? '')),
        fill(text.msgItems, { count: items.length }),
        ...items.map(
          (item, index) =>
            `${fill(text.msgProduct, {
              number: index + 1,
              name: item.name.trim() || fill(text.productNumber, { number: index + 1 }),
              quantity: item.quantity,
            })}\n${item.url.trim()}`
        ),
        ...(details ? [fill(text.msgDetails, { details })] : []),
      ].join('\n')
    );
  });
};

/** The Personal Shopper form, starting with one empty product. */
export const showShopper = (): void => {
  products = [{ key: 1, url: '', name: '', quantity: '1' }];
  showView(renderShopper, 'wide');
};

// ───────── Carinova Business ─────────
const GOODS: Record<string, string> = {
  general: text.goodsGeneral,
  electronics: text.goodsElectronics,
  volume: text.goodsVolume,
  other: text.goodsOther,
};
const FREQUENCIES: Record<string, string> = {
  first: text.frequencyFirst,
  monthly: text.frequencyMonthly,
  weekly: text.frequencyWeekly,
  seasonal: text.frequencySeasonal,
};
const options = (items: Record<string, string>): string =>
  Object.entries(items)
    .map(([id, name]) => `<option value="${id}">${esc(name)}</option>`)
    .join('');

const showBusiness = (): void =>
  showView(() => {
    content.innerHTML =
      heading(text.businessEyebrow, text.businessTitle, text.businessIntro) +
      `<form id="business-form" class="form" novalidate>${contactFields('business')}` +
      `<label class="field"><span>${esc(text.company)}</span><input class="input" name="company" id="business-company" required maxlength="120" autocomplete="organization" dir="auto" placeholder="${esc(text.companyPlaceholder)}"></label>` +
      `<div class="grid-2"><label class="field"><span>${esc(text.merchandise)}</span><select class="input" name="merchandise" id="business-merchandise">${options(GOODS)}</select></label>` +
      `<label class="field"><span>${esc(text.frequency)}</span><select class="input" name="frequency" id="business-frequency">${options(FREQUENCIES)}</select></label></div>` +
      channelField('business') +
      `<label class="field"><span>${esc(text.details)}</span><textarea class="input" name="details" id="business-details" required maxlength="2000" dir="auto" placeholder="${esc(text.businessPlaceholder)}"></textarea></label>` +
      `<label class="check-label"><input name="consent" id="business-consent" type="checkbox" required><span>${esc(text.requestConsent)}</span></label>` +
      `${errorBox()}<button class="btn btn-primary btn-block" type="submit">${esc(text.prepareRequest)}</button></form>`;

    const form = need<HTMLFormElement>('#business-form', content);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const contact = contactOf(form);
      const problem = contactProblem(contact, 'business');
      if (problem) return showError(...problem);
      const data = new FormData(form);
      const value = (name: string) => String(data.get(name) ?? '').trim();
      if (!value('company')) return showError(text.requiredFields, 'business-company');
      if (!value('details')) return showError(text.requiredFields, 'business-details');
      if (!data.get('consent')) return showError(text.consentRequired, 'business-consent');
      showMessage(
        [
          text.msgHello,
          text.msgBusiness,
          ...contactLines(contact, value('channel')),
          fill(text.msgCompany, { company: value('company') }),
          fill(text.msgFrequency, { frequency: FREQUENCIES[value('frequency')] ?? '' }),
          fill(text.msgMerchandise, { merchandise: GOODS[value('merchandise')] ?? '' }),
          fill(text.msgDetails, { details: value('details') }),
        ].join('\n')
      );
    });
  }, 'wide');

// ───────── The choice a store opens ─────────
export interface StoreChoice {
  name: string;
  /** The store's own site. */
  url: string;
  logo?: string;
  /** What the store is, or the category it is listed under. */
  description?: string;
  /** Where "back" leads: the directory, when the store was opened from it. */
  back?: () => void;
}

/** "Lo compro yo" (the store's site) or "Lo compramos por vos" (the Personal Shopper form). */
export const showChoice = ({ name, url, logo, description, back }: StoreChoice): void =>
  showView(() => {
    content.innerHTML =
      (back
        ? `<button class="dir-back" type="button" id="choice-back">${icon('chevron')}<span>${esc(text.dirBack)}</span></button>`
        : '') +
      `<header class="store-head"><div class="store-head-logo">${logo ? `<img src="${esc(logo)}" alt="">` : icon('store')}</div>` +
      `<div class="store-head-text"><p class="modal-eyebrow">${esc(text.shopperEyebrow)}</p><h2 class="modal-title" id="modal-title" tabindex="-1">${esc(name)}</h2>` +
      (description ? `<p class="store-head-desc">${esc(description)}</p>` : '') +
      `</div></header><div class="choices">` +
      `<section class="choice" aria-labelledby="choice-self"><span class="choice-icon" aria-hidden="true">${icon('cart')}</span><div class="choice-body"><h3 id="choice-self">${esc(text.choiceSelfTitle)}</h3><p>${esc(text.choiceSelfText)}</p></div>` +
      `<a class="btn btn-secondary choice-action" href="${esc(url)}" target="_blank" rel="noopener"><span>${esc(text.storeGo)}</span>${icon('arrow')}</a></section>` +
      `<section class="choice is-featured" aria-labelledby="choice-assist-title"><span class="choice-icon" aria-hidden="true">${icon('bag')}</span><div class="choice-body"><h3 id="choice-assist-title">${esc(text.choiceAssistTitle)}</h3><p>${esc(text.choiceAssistText)}</p></div>` +
      `<button class="btn btn-primary choice-action" type="button" id="choice-assist"><span>${esc(text.shopperContinue)}</span>${icon('arrow')}</button></section></div>`;
    need('#choice-assist', content).addEventListener('click', showShopper);
    if (back) need('#choice-back', content).addEventListener('click', back);
  }, 'choice');

/** The choice of a store of the home page: its tile says which one. */
const showStoreTile = (tile: HTMLAnchorElement, back?: () => void): void =>
  showChoice({
    name: $('.store-name', tile)?.textContent?.trim() ?? '',
    url: tile.href,
    logo: $<HTMLImageElement>('img.store-logo', tile)?.src,
    description: config.stores[tile.dataset.store ?? ''],
    back,
  });

// ───────── The conditions of the service ─────────
const showConditions = (): void =>
  showView(() => {
    content.replaceChildren(need<HTMLTemplateElement>('#landing-conditions').content.cloneNode(true));
  });

// ───────── The directory of stores ─────────
export const showDirectory = (): void => {
  // The directory and its logos are a file of their own: most visitors never open it.
  void loadDirectory()
    .then((directory) => directory.show())
    .catch(() => {
      const link = $<HTMLAnchorElement>('#store-more');
      if (link) window.location.assign(link.href);
    });
};

/** The message of something the page itself prepared (the article search), ready to send. */
export const openMessage = async (message: string): Promise<void> => {
  await styles;
  showMessage(message);
};

/** Opens the view a door of the page asks for: a store's tile, or `data-dialog`. */
export const open = async (door: HTMLElement): Promise<void> => {
  await styles;
  if (door.matches('.store[data-store]')) return showStoreTile(door as HTMLAnchorElement);
  const views: Record<string, () => void> = {
    conditions: showConditions,
    business: showBusiness,
    shopper: showShopper,
    directory: showDirectory,
  };
  views[door.dataset.dialog ?? '']?.();
};

/** A store of the home page by its id, for the directory: it opens with its logo and what it is. */
export const tileOf = (id: string): HTMLAnchorElement | null => $<HTMLAnchorElement>(`.store[data-store="${id}"]`);
export { showStoreTile };
