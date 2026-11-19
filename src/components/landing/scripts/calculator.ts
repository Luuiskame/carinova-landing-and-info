// The calculator of the home page ("Calculador Iterativo"). The page already shows the first
// estimate (Calculator.astro renders it with the same code); this script takes over when the
// section is near or is touched: it prices the cargo by air and by sea as the visitor describes
// it, says what is missing, and on a phone keeps a bar with the price in sight.
//
// The rules of the estimate are utils/quote.ts (they have unit tests); the rates and every sentence
// come with the page (ScriptData "calculator"). Nothing here is a price or a word.
import { calculateQuote, type Quote, type QuoteError, type QuoteInput, type QuoteRates } from '~/utils/quote';
import { fill } from '~/utils/template';

import { $$, need, pageData, reducedMotion, smooth } from './dom';
import { amount, formulaText, type FormulaText } from './quote-view';

type Mode = 'air' | 'sea';

interface Config {
  rates: QuoteRates;
  /** "2–4 días": the delivery time of each way, and of the express service once it has one. */
  days: Record<Mode, string>;
  expressDays: Record<Mode, string>;
  text: FormulaText &
    Record<QuoteError, string> &
    Record<
      | 'air'
      | 'sea'
      | 'standard'
      | 'express'
      | 'estimate'
      | 'toQuote'
      | 'save'
      | 'extra'
      | 'dimensionsOptional'
      | 'dimensionsRequired'
      | 'dimensionsNoApply'
      | 'dimensionsSea'
      | 'unitIn'
      | 'unitCm',
      string
    >;
}

const { rates, days, expressDays, text } = pageData<Config>('calculator');

const form = need<HTMLFormElement>('#quote-form');
const ticket = need('#ticket');
const category = need<HTMLSelectElement>('#category');
const quantity = need<HTMLInputElement>('#quantity');
const weight = need<HTMLInputElement>('#weight');
const weightUnit = need<HTMLSelectElement>('#weight-unit');
const dimensionUnit = need<HTMLSelectElement>('#dimension-unit');
const sides = ['length', 'width', 'height'].map((id) => need<HTMLInputElement>(`#${id}`));
const errorBox = need('#quote-error');
const dock = need('#quote-dock');

const modeInput = (mode: Mode) => need<HTMLInputElement>(`#alts input[name="mode"][value="${mode}"]`);
const serviceInput = (service: string) => need<HTMLInputElement>(`#service input[name="service"][value="${service}"]`);
const currentMode = (): Mode => (modeInput('sea').checked ? 'sea' : 'air');
const currentService = () => (serviceInput('express').checked ? 'express' : 'standard');
const isDevice = (value: string) => Object.prototype.hasOwnProperty.call(rates.devices, value);

const input = (): QuoteInput => ({
  mode: currentMode(),
  service: currentService(),
  category: category.value,
  quantity: quantity.value,
  weight: weight.value,
  weightUnit: weightUnit.value,
  length: sides[0].value,
  width: sides[1].value,
  height: sides[2].value,
  dimensionUnit: dimensionUnit.value,
});

const daysOf = (mode: Mode, service: string) => (service === 'express' ? expressDays[mode] : days[mode]);
const modeName = (mode: Mode) => (mode === 'sea' ? text.sea : text.air);
const serviceName = (service: string) => (service === 'express' ? text.express : text.standard);

let quote: Quote = calculateQuote(input(), rates);
let shown: number | null = quote.total;
let frame = 0;
let liveTimer = 0;

/** The amount of the chosen way: it counts up or down to the new one, unless movement is reduced. */
const showTotal = (value: number | null, animate: boolean, pending: boolean) => {
  const target = need(`#total-${currentMode()}`);
  cancelAnimationFrame(frame);
  ticket.classList.toggle('is-empty', value === null && !pending);
  if (pending || value === null) {
    target.textContent = pending ? text.toQuote : '—';
    shown = null;
    return;
  }
  const from = shown;
  if (!animate || reducedMotion.matches || from === null || from === value) {
    target.textContent = amount(value);
    shown = value;
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / 320);
    shown = from + (value - from) * (1 - (1 - progress) ** 3);
    target.textContent = amount(progress === 1 ? value : shown);
    if (progress < 1) frame = requestAnimationFrame(step);
    else shown = value;
  };
  frame = requestAnimationFrame(step);
};

/** Both ways are priced for the same cargo: the chosen one is the estimate, the other says the difference. */
const renderWays = (data: QuoteInput, animate: boolean) => {
  for (const mode of ['air', 'sea'] as const) {
    const selected = mode === data.mode;
    const unavailable = modeInput(mode).disabled;
    const result = selected ? quote : calculateQuote({ ...data, mode }, rates);
    const card = need(`.alt[data-alt="${mode}"]`);
    card.classList.toggle('is-selected', selected);
    card.classList.toggle('is-unavailable', unavailable);
    card.classList.toggle('is-pending', result.valid && result.pending);
    need(`#days-${mode}`).textContent = daysOf(mode, data.service ?? '');
    if (!selected) {
      need(`#total-${mode}`).textContent = !result.valid
        ? '—'
        : result.pending
          ? text.toQuote
          : amount(result.total ?? 0);
    }
    let detail = '';
    if (selected) detail = formulaText(data, result, text);
    else if (unavailable) {
      detail =
        mode === 'sea'
          ? text.uiErrorElectronics
          : data.category === 'restricted'
            ? text.uiErrorRestrictedAir
            : text.uiErrorVolumeMode;
    } else if (result.valid && quote.valid && !result.pending && !quote.pending) {
      const difference = Math.round(((result.total ?? 0) - (quote.total ?? 0)) * 100) / 100;
      if (difference < 0) detail = fill(text.save, { amount: amount(-difference) });
      else if (difference > 0) detail = fill(text.extra, { amount: amount(difference) });
    }
    need(`#detail-${mode}`).textContent = detail;
  }
  showTotal(quote.valid && !quote.pending ? quote.total : null, animate, quote.valid && quote.pending);
};

const update = (animate = true) => {
  const device = isDevice(category.value);
  const volume = category.value === 'volume';
  const seaOnly = volume || category.value === 'restricted';
  // A device travels by air only; volume and what cannot fly, by sea only.
  modeInput('air').disabled = seaOnly;
  modeInput('sea').disabled = device;
  if (device && currentMode() !== 'air') modeInput('air').checked = true;
  if (seaOnly && currentMode() !== 'sea') modeInput('sea').checked = true;

  const data = input();
  quote = calculateQuote(data, rates);
  weight.disabled = device || volume;
  weightUnit.disabled = device || volume;
  dimensionUnit.disabled = device;
  for (const side of sides) side.disabled = device;
  need('#weight-suffix').textContent = data.weightUnit ?? '';
  for (const suffix of $$('.dimension-suffix'))
    suffix.textContent = data.dimensionUnit === 'cm' ? text.unitCm : text.unitIn;
  need('#dimensions-hint').textContent = device
    ? text.dimensionsNoApply
    : volume
      ? text.dimensionsRequired
      : data.mode === 'sea'
        ? text.dimensionsSea
        : text.dimensionsOptional;

  renderWays(data, animate);

  const mode = currentMode();
  const price = quote.pending ? text.toQuote : `US$${amount(quote.total ?? 0)}`;
  errorBox.hidden = quote.valid;
  need('span', errorBox).textContent = quote.error ? text[quote.error] : '';
  need('#dock-total').textContent = quote.valid ? (quote.pending ? text.toQuote : amount(quote.total ?? 0)) : '—';
  dock.classList.toggle('is-pending', quote.pending);
  need('#dock-days').textContent = [serviceName(data.service ?? ''), daysOf(mode, data.service ?? '')]
    .filter(Boolean)
    .join(' · ');
  need('#dock-mode').textContent = modeName(mode);
  need('#dock-mode-icon').setAttribute('href', mode === 'air' ? '#i-plane' : '#i-ship');
  const count = Number(data.quantity);
  need<HTMLButtonElement>('#quantity-minus').disabled = !(count > 1);
  need<HTMLButtonElement>('#quantity-plus').disabled = count >= rates.maxQuantity;

  // Said to a screen reader once the visitor stops typing.
  clearTimeout(liveTimer);
  liveTimer = window.setTimeout(() => {
    need('#quote-live').textContent = quote.valid
      ? [
          `${text.estimate}: ${price}`,
          modeName(mode),
          serviceName(data.service ?? ''),
          daysOf(mode, data.service ?? ''),
        ]
          .filter(Boolean)
          .join(' · ')
      : quote.error
        ? text[quote.error]
        : '';
  }, 700);
};

/** The ticket blinks once: something outside the form changed it. */
const flash = () => {
  ticket.classList.remove('is-updated');
  void ticket.offsetWidth;
  ticket.classList.add('is-updated');
};

/**
 * Sets the calculator from outside: a rate of the opening ("Marítimo", "Electrónicos") or the
 * answer of the article search ("Cotizar este artículo").
 */
export const apply = ({ mode, category: kind }: { mode?: string; category?: string }) => {
  serviceInput('standard').checked = true;
  if (kind) category.value = kind;
  if (mode === 'air' || mode === 'sea') {
    // A way of shipping the current kind of cargo cannot take puts the cargo back to general merchandise.
    const current = category.value;
    if (
      !kind &&
      ((mode === 'sea' && isDevice(current)) || (mode === 'air' && (current === 'volume' || current === 'restricted')))
    ) {
      category.value = 'general';
    }
    modeInput(mode).checked = true;
  }
  update();
  flash();
};

form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('input', () => update());
form.addEventListener('change', () => update());
need('#alts').addEventListener('change', () => update());
need('#service').addEventListener('change', () => update());
need('#quantity-minus').addEventListener('click', () => {
  quantity.value = String(Math.max(1, (Math.floor(Number(quantity.value)) || 1) - 1));
  update();
});
need('#quantity-plus').addEventListener('click', () => {
  quantity.value = String(Math.min(rates.maxQuantity, (Math.floor(Number(quantity.value)) || 0) + 1));
  update();
});

// On a phone the ticket is under the form: while the form is on screen and the ticket is not, a
// bar keeps the price in sight, and leads to the ticket.
if ('IntersectionObserver' in window) {
  const narrow = matchMedia('(max-width: 1079px)');
  let formOnScreen = false;
  let ticketOnScreen = false;
  const sync = () => {
    const show = narrow.matches && formOnScreen && !ticketOnScreen;
    dock.hidden = !show;
    document.documentElement.classList.toggle('has-dock', show);
  };
  new IntersectionObserver(
    ([entry]) => {
      formOnScreen = entry.intersectionRatio >= 0.06;
      sync();
    },
    { threshold: [0, 0.06] }
  ).observe(form);
  new IntersectionObserver(
    ([entry]) => {
      ticketOnScreen = entry.intersectionRatio >= 0.3;
      sync();
    },
    { threshold: [0, 0.3] }
  ).observe(ticket);
  narrow.addEventListener?.('change', sync);
}
dock.addEventListener('click', () => ticket.scrollIntoView({ behavior: smooth(), block: 'center' }));

// What the visitor typed before this script arrived counts from now on.
update(false);
