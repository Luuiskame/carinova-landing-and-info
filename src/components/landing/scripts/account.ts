// The account inside the dialog of the home page, as Carinova's page draws it: creating an
// account, signing in, "Mi cuenta", a new shipment, tracking a package and the note on privacy.
//
// Carinova's file ran these views on an account simulated in the browser. Here they run on the
// site's API (worker/api.ts), and follow it where it differs from what the file imagined:
//
// - An account is created by POST /api/signup, which e-mails a confirmation link: the view that
//   follows is the file's "Confirmá tu correo". A company's starts with a request to Carinova
//   (POST /api/business), as on /empresas.
// - Signing in is by a one-time code sent by e-mail (POST /api/login, POST /api/login/verify),
//   never a password. The first step answers the same whether or not the e-mail has an account.
// - "Mi cuenta" is GET /api/account and GET /api/account/activity. What the session allows is
//   decided by the Worker with a cookie scripts cannot read; the page only knows a session exists.
// - Tracking looks for the code among the customer's own packages: nobody's packages are found by
//   a number alone, so a visitor is asked to sign in first.
// - A new shipment ("prealerta") has no endpoint: it ends in the WhatsApp message Carinova's file
//   itself falls back to.
//
// Fetched the first time one of these views is opened (boot.ts). The sentences come with the page
// (Account.astro → ScriptData "account").
import { getJson, postJson } from '~/utils/forms';
import { fill } from '~/utils/template';
import { whatsappLink } from '~/utils/whatsapp';

import {
  closeDialog,
  config as dialogs,
  contactFields,
  contactLines,
  contactOf,
  contactProblem,
  content,
  departmentLabel,
  errorBox,
  heading,
  showError,
  showMessage,
  showView,
  styles,
} from './dialogs';
import { $, $$, esc, icon, need, pageData, smooth } from './dom';
import { loadCalculator } from './lazy';

interface Config {
  locale: string;
  whatsapp: string;
  country: string;
  /** A department of the forms → the name the API knows it by in this language. */
  states: Record<string, string>;
  dates: string;
  codeDigits: number;
  resendSeconds: number;
  accountPage: string;
  privacyPage: string;
  addresses: Array<{ city: string; address?: string; pending?: string }>;
  statuses: Record<string, string>;
  text: Record<string, string>;
}

/** What the API says of the customer who is signed in (worker/store.ts → Account). */
interface Customer {
  code: string;
  firstName: string;
  lastName: string;
}
/** A package as its owner sees it (worker/store.ts → AccountPackage). */
interface Package {
  reference: string;
  description: string;
  carrierTracking: string;
  status: string;
  events: Array<{ status: string; at: string }>;
}

type Tab = 'register' | 'login';

const config = pageData<Config>('account');
const { text, locale } = config;
const page = document.documentElement;

let accountKind: 'personal' | 'business' = 'personal';
let customer: Customer | null = null;
/** What the visitor was doing when the account got in the way: it goes on once they are signed in. */
let continuation: (() => void) | null = null;
/** Why signing in is asked for, when it was not the visitor's own idea. */
let loginReason = '';
let trackingCode = '';

// ───────── The session ─────────
const signedIn = (): boolean => page.dataset.session === 'in';
/** The page shows what a customer sees, or what a visitor sees (SessionState.astro, landing.css). */
const setSession = (on: boolean): void => {
  page.dataset.session = on ? 'in' : 'out';
  if (!on) customer = null;
};

/** The customer of the session: 401 means it ended, anything else that the API is not answering. */
const loadCustomer = async (): Promise<Customer | 'signed-out' | 'unavailable'> => {
  if (customer) return customer;
  const { status, result } = await getJson('/api/account');
  if (status === 200 && result?.account) return (customer = result.account as Customer);
  if (status !== 401) return 'unavailable';
  setSession(false);
  return 'signed-out';
};

// ───────── What the views share ─────────
const whatsapp = (message?: string): string => whatsappLink(config.whatsapp, message);
const set = (html: string): void => {
  content.innerHTML = html;
};
const value = (data: FormData, name: string): string => String(data.get(name) ?? '').trim();
const isEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const clearError = (id = 'form-error'): void => {
  const box = document.getElementById(id);
  if (box) box.hidden = true;
};

/** Where a form offers to go on by WhatsApp when the API does not answer. */
const fallbackBox = '<div class="fallback" id="form-fallback" hidden></div>';
const hideFallback = (): void => {
  const box = $('#form-fallback', content);
  if (box) box.hidden = true;
};
const showFallback = (message: () => string): void => {
  const box = $('#form-fallback', content);
  if (!box) return;
  box.innerHTML =
    `<p>${esc(text.fallback)}</p>` +
    `<button class="btn btn-wa btn-block" type="button" id="fallback-whatsapp">${icon('chat')}<span>${esc(text.continueWhatsapp)}</span></button>`;
  box.hidden = false;
  need('#fallback-whatsapp', box).addEventListener('click', () => showMessage(message()));
};

/** A button while its request is on the way: "Procesando…", and no second click. */
const busy = (button: HTMLButtonElement, label: string | null): void => {
  const holder = $('span', button) ?? button;
  if (label === null) {
    button.disabled = false;
    holder.textContent = button.dataset.label ?? '';
    return;
  }
  button.dataset.label ??= holder.textContent ?? '';
  button.disabled = true;
  holder.textContent = label;
};

/** What the API said went wrong, as the form says it: a busy moment, or "not now" with the way to go on by WhatsApp. */
const failed = (status: number, message: () => string, boxId = 'form-error'): void => {
  if (status === 429) return showError(text.busy, '', boxId);
  showError(text.unavailable, '', boxId);
  showFallback(message);
};

/** The first of the API's complaints about a form that the form has a field for. */
const fieldError = (fields: Record<string, string> | undefined, ids: Record<string, string>): boolean => {
  const name = Object.keys(ids).find((field) => fields?.[field]) ?? Object.keys(fields ?? {})[0];
  if (!name || !fields?.[name]) return false;
  showError(fields[name], ids[name] ?? '');
  return true;
};

let toastTimer = 0;
/** A short notice at the foot of the page that goes away by itself. */
const toast = (message: string): void => {
  const node = $('#toast');
  if (!node) return;
  window.clearTimeout(toastTimer);
  node.textContent = message;
  node.hidden = false;
  toastTimer = window.setTimeout(() => (node.hidden = true), 4000);
};

/** The button under a view that has nothing left to fill in: the team, by WhatsApp. */
const teamButton = (): string =>
  `<a class="btn btn-primary btn-block modal-action" href="${esc(whatsapp())}" target="_blank" rel="noopener">${esc(text.contactTeam)}</a>`;

// ───────── Creating an account, and signing in ─────────
const tabs = (tab: Tab): string =>
  `<div class="tabs" role="tablist">` +
  (['register', 'login'] as const)
    .map(
      (id) =>
        `<button type="button" role="tab" id="tab-${id}" data-auth-tab="${id}" aria-selected="${tab === id}" aria-controls="account-panel" tabindex="${tab === id ? '0' : '-1'}">${esc(id === 'register' ? text.createAccount : text.signIn)}</button>`
    )
    .join('') +
  `</div>`;

const accountTypeFields = (): string =>
  `<fieldset class="account-type"><legend>${esc(text.accountType)}</legend><div class="account-type-options">` +
  (
    [
      ['personal', 'user', text.personal, text.personalText],
      ['business', 'briefcase', text.business, text.businessText],
    ] as const
  )
    .map(
      ([kind, mark, title, about]) =>
        `<label class="account-type-option"><input type="radio" name="accountType" value="${kind}"${accountKind === kind ? ' checked' : ''}>` +
        `<span class="account-type-card"><span class="account-type-icon" aria-hidden="true">${icon(mark)}</span>` +
        `<span class="account-type-text"><strong>${esc(title)}</strong><small>${esc(about)}</small></span></span></label>`
    )
    .join('') +
  `</div></fieldset>`;

const businessFields = (): string =>
  `<div class="grid-2" id="business-account-fields"${accountKind === 'business' ? '' : ' hidden'}>` +
  `<label class="field"><span>${esc(text.companyName)}</span><input class="input" name="company" id="register-company" maxlength="100" autocomplete="organization" dir="auto" placeholder="${esc(text.companyPlaceholder)}"${accountKind === 'business' ? ' required' : ''}></label>` +
  `<label class="field"><span>${esc(text.rucOptional)}</span><input class="input" name="ruc" id="register-ruc" maxlength="30" autocomplete="off" spellcheck="false" dir="ltr"></label></div>`;

/** Where the customer lives: the API keeps it with the account. */
const addressFields =
  `<div class="grid-2">` +
  `<label class="field"><span>${esc(text.city)}</span><input class="input" name="city" id="register-city" required maxlength="60" autocomplete="address-level2" dir="auto"></label>` +
  `<label class="field"><span>${esc(text.address)}</span><input class="input" name="address1" id="register-address" required maxlength="120" autocomplete="address-line1" dir="auto"></label></div>`;

/** The fields of the two forms, by the name the API complains about them with. */
const SIGNUP_FIELDS: Record<string, string> = {
  firstName: 'register-first',
  lastName: 'register-last',
  email: 'register-email',
  phone: 'register-phone',
  state: 'register-department',
  city: 'register-city',
  address1: 'register-address',
  terms: 'account-consent',
};
const BUSINESS_FIELDS: Record<string, string> = {
  company: 'register-company',
  contactName: 'register-first',
  email: 'register-email',
  phone: 'register-phone',
  city: 'register-city',
};

/** After a sign-in: what the visitor was doing goes on, or their account opens. */
const proceed = (): void => {
  const next = continuation;
  continuation = null;
  loginReason = '';
  if (next) next();
  else void showDashboard();
};

const switchTab = (tab: Tab): void => showView(() => renderAccount(tab), 'wide');

function renderAccount(tab: Tab): void {
  const login = tab === 'login';
  set(
    heading(text.eyebrow, login ? text.loginTitle : text.registerTitle, login ? text.loginIntro : text.registerIntro) +
      tabs(tab) +
      `<div id="account-panel" role="tabpanel" aria-labelledby="tab-${tab}">` +
      (login ? `<p class="note">${esc(loginReason || text.codeIntro)}</p>` : '') +
      `<form id="account-form" class="form" novalidate>` +
      (login
        ? `<label class="field"><span>${esc(text.email)}</span><input class="input" name="email" id="account-email" type="email" inputmode="email" autocomplete="email" required maxlength="160" placeholder="${esc(text.emailPlaceholder)}"></label>`
        : accountTypeFields() +
          contactFields('register') +
          businessFields() +
          addressFields +
          `<label class="check-label"><input type="checkbox" name="consent" id="account-consent" required><span>${esc(text.consent)}</span></label>`) +
      errorBox() +
      fallbackBox +
      `<button class="btn btn-primary btn-block" type="submit" id="account-submit">${esc(login ? text.sendCode : text.submitRegistration)}</button></form></div>`
  );

  for (const button of $$('[data-auth-tab]', content)) {
    button.addEventListener('click', () => {
      if (button.dataset.authTab !== tab) switchTab(button.dataset.authTab === 'login' ? 'login' : 'register');
    });
  }
  need('.tabs', content).addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = tab === 'register' ? 'login' : 'register';
    switchTab(next);
    requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.focus());
  });
  for (const radio of $$<HTMLInputElement>('input[name="accountType"]', content)) {
    radio.addEventListener('change', () => {
      accountKind = radio.value === 'business' ? 'business' : 'personal';
      need('#business-account-fields', content).hidden = accountKind !== 'business';
      need<HTMLInputElement>('#register-company', content).required = accountKind === 'business';
    });
  }

  const form = need<HTMLFormElement>('#account-form', content);
  const button = need<HTMLButtonElement>('#account-submit', content);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hideFallback();
    void (login ? askCode(form, button) : register(form, button));
  });
}

/** The first step of signing in: a code is e-mailed to the address, if it has an account. */
async function askCode(form: HTMLFormElement, button: HTMLButtonElement): Promise<void> {
  const email = value(new FormData(form), 'email').toLowerCase();
  if (!isEmail(email)) return showError(text.invalidEmail, 'account-email');
  clearError();
  busy(button, text.sending);
  const { status, result } = await postJson('/api/login', { email, lang: locale });
  if (!button.isConnected) return;
  busy(button, null);
  if (status === 200) return showView(() => renderCode(email), 'wide');
  if (status === 422 && fieldError(result?.fields, { email: 'account-email' })) return;
  failed(status, () => text.msgHello);
}

/** The second step: the code that arrived by e-mail. */
function renderCode(email: string): void {
  set(
    heading(text.eyebrow, text.loginTitle, text.loginIntro) +
      tabs('login') +
      `<div id="account-panel" role="tabpanel" aria-labelledby="tab-login">` +
      `<p class="note">${esc(text.codeSentBefore)}<strong dir="ltr">${esc(email)}</strong>${esc(text.codeSentAfter)}</p>` +
      `<form id="code-form" class="form" novalidate>` +
      `<label class="field"><span>${esc(text.code)}</span><input class="input num" name="code" id="account-code" inputmode="numeric" autocomplete="one-time-code" required maxlength="${config.codeDigits + 2}" dir="ltr"></label>` +
      errorBox() +
      fallbackBox +
      `<button class="btn btn-primary btn-block" type="submit" id="account-submit">${esc(text.submitLogin)}</button></form>` +
      `<div class="dash-actions"><button class="link" type="button" id="code-resend" data-label="${esc(text.resend)}">${esc(text.resend)}</button>` +
      `<button class="link" type="button" id="code-change">${esc(text.changeEmail)}</button></div>` +
      `<p class="copy-feedback" id="code-status" role="status"></p>` +
      `<p class="modal-footnote">${esc(text.codeNote)}</p></div>`
  );

  for (const tab of $$('[data-auth-tab]', content)) {
    tab.addEventListener('click', () => switchTab(tab.dataset.authTab === 'login' ? 'login' : 'register'));
  }
  need('#code-change', content).addEventListener('click', () => switchTab('login'));

  // "Enviar otro código" waits a little, so a slow e-mail is not answered with three more.
  const resend = need<HTMLButtonElement>('#code-resend', content);
  let timer = 0;
  const countdown = (seconds: number): void => {
    window.clearInterval(timer);
    let left = seconds;
    const tick = (): void => {
      // The view was replaced: nothing left to count for.
      if (!resend.isConnected) return window.clearInterval(timer);
      resend.disabled = left > 0;
      resend.textContent = left > 0 ? fill(text.resendIn, { seconds: left }) : text.resend;
      if (left <= 0) window.clearInterval(timer);
      left -= 1;
    };
    tick();
    if (seconds > 0) timer = window.setInterval(tick, 1000);
  };
  countdown(config.resendSeconds);
  resend.addEventListener('click', async () => {
    resend.disabled = true;
    const { status } = await postJson('/api/login', { email, lang: locale });
    if (!resend.isConnected) return;
    if (status !== 200) {
      resend.disabled = false;
      return failed(status, () => text.msgHello);
    }
    clearError();
    need('#code-status', content).textContent = text.resent;
    countdown(config.resendSeconds);
  });

  const form = need<HTMLFormElement>('#code-form', content);
  const button = need<HTMLButtonElement>('#account-submit', content);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideFallback();
    const code = value(new FormData(form), 'code');
    if (!code) return showError(text.codeMissing, 'account-code');
    clearError();
    busy(button, text.sending);
    const { status, result } = await postJson('/api/login/verify', { email, code });
    if (!button.isConnected) return;
    if (status === 200 && result?.ok) {
      // Signed in: the Worker set the session's cookies with this answer.
      window.clearInterval(timer);
      setSession(true);
      customer = (result.account as Customer | undefined) ?? null;
      return proceed();
    }
    busy(button, null);
    if (status === 401) return showError(text.codeInvalid, 'account-code');
    failed(status, () => text.msgHello);
  });
}

/** Creates the account: a person's with the sign-up, a company's with a request to Carinova. */
async function register(form: HTMLFormElement, button: HTMLButtonElement): Promise<void> {
  const data = new FormData(form);
  const contact = contactOf(form);
  const problem = contactProblem(contact, 'register');
  if (problem) return showError(...problem);
  const business = accountKind === 'business';
  const company = business ? value(data, 'company') : '';
  const ruc = business ? value(data, 'ruc') : '';
  const city = value(data, 'city');
  const address = value(data, 'address1');
  if (business && !company) return showError(text.invalidCompany, 'register-company');
  if (!city) return showError(text.requiredFields, 'register-city');
  if (!address) return showError(text.requiredFields, 'register-address');
  if (!data.get('consent')) return showError(text.consentRequired, 'account-consent');
  clearError();

  /** What the visitor asked for, in lines: what Carinova reads when it comes as a request or by WhatsApp. */
  const lines = (): Array<string> => [
    text.msgRegister,
    fill(text.msgAccountType, { type: business ? text.business : text.personal }),
    ...(business ? [fill(text.msgCompany, { company }), ...(ruc ? [fill(text.msgRuc, { ruc })] : [])] : []),
    ...contactLines(contact),
    fill(text.msgAddress, { address: `${address}, ${city}` }),
  ];

  busy(button, text.sending);
  const { status, result } = business
    ? await postJson('/api/business', {
        company,
        contactName: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        phone: contact.phone,
        country: config.country,
        city,
        message: lines().join('\n'),
        lang: locale,
      })
    : await postJson('/api/signup', {
        country: config.country,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        address1: address,
        city,
        state: config.states[contact.department] ?? contact.department,
        terms: true,
        lang: locale,
      });
  if (!button.isConnected) return;
  busy(button, null);

  if (status === 200 && result?.ok) {
    return showView(() =>
      set(
        (business
          ? heading(text.eyebrow, text.requestTitle, text.requestText)
          : heading(text.eyebrow, text.verifyTitle, fill(text.verifyText, { email: contact.email }))) + teamButton()
      )
    );
  }
  if (status === 422 && fieldError(result?.fields, business ? BUSINESS_FIELDS : SIGNUP_FIELDS)) return;
  failed(status, () => [text.msgHello, ...lines()].join('\n'));
}

/** The account's views for a visitor: creating one, or signing in. A customer gets their account. */
export const showAccount = (tab: Tab = 'register', kind?: string): void => {
  if (kind === 'personal' || kind === 'business') accountKind = kind;
  if (signedIn()) return void showDashboard();
  switchTab(tab);
};

// ───────── "Mi cuenta" ─────────
const packageCard = (item: Package): string =>
  `<button class="dash-card dash-package" type="button" data-code="${esc(item.reference)}">` +
  `<strong dir="ltr">${esc(item.reference)}</strong>` +
  `<p>${esc([item.description, config.statuses[item.status] ?? text.pending].filter(Boolean).join(' · '))}</p></button>`;

export async function showDashboard(): Promise<void> {
  const found = await loadCustomer();
  if (found === 'signed-out') return switchTab('login');
  if (found === 'unavailable') return showView(() => set(heading(text.myAccount, text.unavailable) + teamButton()));

  showView(() => {
    set(
      heading(text.myAccount, fill(text.welcome, { name: found.firstName }), text.accountIntro) +
        `<div class="id-card"><small>${esc(text.carinovaId)}</small><strong dir="ltr">${esc(found.code)}</strong></div>` +
        `<h3>${esc(text.myAddresses)}</h3><div class="dash-grid">` +
        config.addresses
          .map(
            ({ city, address, pending }) =>
              `<div class="dash-card"><strong>${esc(city)}</strong><p${address ? ' dir="ltr"' : ''}>${esc(
                address ? fill(address, { first: found.firstName, last: found.lastName }) : (pending ?? '')
              )}</p></div>`
          )
          .join('') +
        `</div><h3>${esc(text.myShipments)}</h3><div id="dash-shipments" role="status"><p class="empty">${esc(text.sending)}</p></div>` +
        `<h3>${esc(text.myRequests)}</h3><p class="empty">${esc(text.noRequests)}</p>` +
        `<div class="dash-actions"><button class="btn btn-primary" type="button" id="account-new-shipment">${esc(text.newShipment)}</button>` +
        `<button class="link" type="button" id="logout">${icon('logout')}<span>${esc(text.logout)}</span></button></div>`
    );
    need('#account-new-shipment', content).addEventListener('click', () => void showPrealert());
    need('#logout', content).addEventListener('click', () => void signOut());
  });

  // The packages arrive after the view: the account is there to read meanwhile.
  const shipments = $('#dash-shipments', content);
  const { status, result } = await getJson('/api/account/activity');
  if (!shipments?.isConnected) return;
  if (status === 401) {
    setSession(false);
    return switchTab('login');
  }
  const packages = status === 200 && Array.isArray(result?.packages) ? (result.packages as Array<Package>) : [];
  shipments.innerHTML = packages.length
    ? `<div class="dash-grid">${packages.map(packageCard).join('')}</div>` +
      `<p class="dash-more"><a class="link" href="${esc(config.accountPage)}">${esc(text.allActivity)}</a></p>`
    : `<p class="empty">${esc(status === 200 ? text.noShipments : text.unavailable)}</p>`;
  for (const card of $$('.dash-package', shipments)) {
    card.addEventListener('click', () => showTracking(card.dataset.code ?? '', true));
  }
}

async function signOut(): Promise<void> {
  const { status } = await postJson('/api/logout', {});
  if (status !== 200) return showView(() => set(heading(text.myAccount, text.unavailable) + teamButton()));
  setSession(false);
  closeDialog();
  toast(text.logoutDone);
}

// ───────── A new shipment ─────────
/**
 * "Crear prealerta": what is coming and where it goes, with the estimate of the calculator. There is
 * no endpoint that takes it: the customer sends it to Carinova by WhatsApp, ready to send.
 */
export async function showPrealert(): Promise<void> {
  const calculator = await loadCalculator().catch(() => null);
  if (!calculator?.estimate().valid) {
    return closeDialog(() => $('#cotizador')?.scrollIntoView({ behavior: smooth() }));
  }
  const chosen = $<HTMLSelectElement>('#department')?.value ?? dialogs.defaultDepartment;
  showView(() => {
    set(
      heading(text.myAccount, text.newShipment, text.accountIntro) +
        `<form class="form" id="prealert-form" novalidate>` +
        `<label class="field"><span>${esc(text.merchandise)}</span><input class="input" name="description" id="prealert-description" required maxlength="120" dir="auto"></label>` +
        `<label class="field"><span>${esc(text.trackingCode)}</span><input class="input" name="reference" id="prealert-reference" required maxlength="120" autocomplete="off" dir="ltr"></label>` +
        `<label class="field"><span>${esc(text.department)}</span><select class="input" name="department" id="prealert-department">` +
        dialogs.departments
          .map(
            ({ value: name, label }) =>
              `<option value="${esc(name)}"${name === chosen ? ' selected' : ''}>${esc(label)}</option>`
          )
          .join('') +
        `</select></label>${errorBox()}` +
        `<button class="btn btn-primary btn-block" type="submit" id="prealert-submit">${esc(text.newShipment)}</button></form>`
    );
    const form = need<HTMLFormElement>('#prealert-form', content);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const description = value(data, 'description');
      const reference = value(data, 'reference');
      const department = value(data, 'department');
      if (!description) return showError(text.requiredFields, 'prealert-description');
      if (!reference) return showError(text.requiredFields, 'prealert-reference');
      if (!dialogs.departments.some((item) => item.value === department)) {
        return showError(text.invalidDepartment, 'prealert-department');
      }
      showMessage(
        [
          text.msgHello,
          text.msgPrealert,
          fill(text.msgMerchandise, { merchandise: description }),
          fill(text.msgReference, { reference }),
          fill(text.msgDepartment, { department: departmentLabel(department) }),
          ...calculator.quoteLines(),
        ].join('\n')
      );
    });
  });
}

/** "Empezar mi envío": a customer goes on to the new shipment; a visitor, to the account first. */
const startShipment = (): void => {
  if (signedIn()) return void showPrealert();
  continuation = () => void showPrealert();
  showAccount();
};

// ───────── Tracking ─────────
const sameCode = (a: string, b: string): boolean =>
  Boolean(a) && a.replace(/\s+/g, '').toUpperCase() === b.replace(/\s+/g, '').toUpperCase();

function renderTracking(found: Package | null = null, error = ''): void {
  set(
    heading(text.trackEyebrow, text.trackTitle, text.trackIntro) +
      `<form id="tracking-form" class="form" novalidate>` +
      `<label class="field"><span>${esc(text.trackingCode)}</span><input class="input" id="tracking-code" name="trackingCode" placeholder="${esc(text.trackingPlaceholder)}" value="${esc(trackingCode)}" required maxlength="100" autocomplete="off" autocapitalize="characters" spellcheck="false" dir="ltr"></label>` +
      errorBox('tracking-error') +
      fallbackBox +
      `<button class="btn btn-primary btn-block" type="submit" id="tracking-submit"><span>${esc(text.trackButton)}</span></button></form>` +
      `<div id="tracking-result" role="status" aria-live="polite"></div>`
  );
  if (error) {
    const box = need('#tracking-error', content);
    need('span', box).textContent = error;
    box.hidden = false;
    // Whatever the reason, the team can look at it: the message says which package.
    if (error !== text.trackRequired && trackingCode) {
      showFallback(() => [text.msgHello, fill(text.msgTracking, { code: trackingCode })].join('\n'));
    }
  }
  if (found) {
    const date = new Intl.DateTimeFormat(config.dates, { dateStyle: 'medium', timeZone: 'America/Managua' });
    need('#tracking-result', content).innerHTML =
      `<div class="track-head"><strong dir="ltr">${esc(found.reference)}</strong><span>${esc(config.statuses[found.status] ?? text.pending)}</span></div>` +
      `<ol class="timeline">` +
      found.events
        .map((item) => {
          const at = Date.parse(item.at);
          return `<li>${esc(config.statuses[item.status] ?? text.pending)}${Number.isFinite(at) ? `<small>${esc(date.format(new Date(at)))}</small>` : ''}</li>`;
        })
        .join('') +
      `</ol>`;
  }
  const form = need<HTMLFormElement>('#tracking-form', content);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const field = need<HTMLInputElement>('#tracking-code', content);
    trackingCode = field.value.trim();
    if (!trackingCode) {
      renderTracking(null, text.trackRequired);
      const empty = need<HTMLInputElement>('#tracking-code', content);
      empty.setAttribute('aria-invalid', 'true');
      empty.focus();
      return;
    }
    void track();
  });
}

/** Looks for the code among the packages of the customer who is signed in. */
async function track(): Promise<void> {
  // A package is its owner's to see: a visitor signs in, and the search goes on by itself.
  const askToSignIn = (): void => {
    const code = trackingCode;
    continuation = () => showTracking(code, true);
    loginReason = text.trackSignIn;
    switchTab('login');
  };
  if (!signedIn()) return askToSignIn();

  const button = $<HTMLButtonElement>('#tracking-submit', content);
  if (button) busy(button, text.sending);
  const { status, result } = await getJson('/api/account/activity');
  if (button && !button.isConnected) return;
  if (status === 401) {
    setSession(false);
    return askToSignIn();
  }
  if (status !== 200 || !Array.isArray(result?.packages)) {
    renderTracking(null, text.trackUnavailable);
  } else {
    const found = (result.packages as Array<Package>).find(
      (item) => sameCode(trackingCode, item.reference) || sameCode(trackingCode, item.carrierTracking)
    );
    renderTracking(found ?? null, found ? '' : text.trackNotFound);
  }
  $('#tracking-error:not([hidden])', content)?.focus();
}

/** The tracking view; with `search`, already looking for `code`. */
export const showTracking = (code = '', search = false): void => {
  trackingCode = code;
  showView(() => renderTracking());
  if (search && code) void track();
};

// ───────── Privacy ─────────
/** Carinova's note on what a request is used for, and the way to the site's full policy. */
export const showPrivacy = (): void =>
  showView(() =>
    set(
      heading(text.privacyEyebrow, text.privacyTitle, text.privacyText) +
        `<p class="modal-more"><a class="link" href="${esc(config.privacyPage)}">${esc(text.privacyPolicy)}</a></p>`
    )
  );

/** Opens the view a door of the page asks for (`data-dialog`). */
export const open = async (door: HTMLElement): Promise<void> => {
  await styles;
  const view = door.dataset.dialog;
  if (view === 'tracking') return showTracking();
  if (view === 'privacy') return showPrivacy();
  if (view === 'prealert') return startShipment();
  // "Crear cuenta", the account's icon and the two buttons of the closing: nothing is left pending.
  continuation = null;
  loginReason = '';
  showAccount('register', door.dataset.accountKind);
};
