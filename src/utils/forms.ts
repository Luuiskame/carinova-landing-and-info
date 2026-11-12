/**
 * What the forms of the site share in the browser (sign-up, sign-in, companies): showing an error
 * under its field, the "sending…" state of a button and posting JSON to the API. Each form's rules
 * live on the server; here only "is it filled in" is checked, to save the visitor a round trip.
 *
 * A field's error element is the last id of its `aria-describedby`, so screen readers announce the
 * error with the field.
 */

export type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** The fields a person fills in: not the disabled or hidden ones, not the honeypot. */
export const controlsOf = (form: HTMLFormElement): Array<Control> =>
  Array.from(form.querySelectorAll<Control>('input[name], select[name], textarea[name]')).filter(
    (control) => !control.disabled && control.type !== 'hidden' && control.name !== 'contact_time'
  );

const errorOf = (control: Control): HTMLElement | null => {
  const id = control.getAttribute('aria-describedby')?.split(' ').pop();
  return id ? document.getElementById(id) : null;
};

/** An error goes away as soon as its field is touched. */
export const clearError = (control: Control | null): void => {
  if (!control?.name) return;
  control.removeAttribute('aria-invalid');
  const error = errorOf(control);
  if (error) error.hidden = true;
};

/**
 * Shows each message under its field and moves the focus to the first one. Returns how many fields
 * have an error, for the form's status line.
 */
export const showErrors = (form: HTMLFormElement, fields: Record<string, string>): number => {
  let first: Control | undefined;
  let count = 0;
  for (const control of controlsOf(form)) {
    const message = fields[control.name];
    const error = errorOf(control);
    if (!message || !error) continue;
    control.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    error.hidden = false;
    first ??= control;
    count += 1;
  }
  first?.focus();
  return count;
};

/** The required fields that are still empty, each with the message to show. */
export const missingFields = (
  form: HTMLFormElement,
  message: string,
  /** Fields with a message of their own, by name (the terms checkbox). */
  special: Record<string, string> = {}
): Record<string, string> => {
  const missing: Record<string, string> = {};
  for (const control of controlsOf(form)) {
    if (control.validity.valueMissing) missing[control.name] = special[control.name] ?? message;
  }
  return missing;
};

/** Disables a button while its request is on the way and shows its `data-busy-label`. */
export const setBusy = (button: HTMLButtonElement | null, busy: boolean): void => {
  if (!button) return;
  button.dataset.label ??= button.textContent ?? '';
  button.disabled = busy;
  button.textContent = busy ? (button.dataset.busyLabel ?? '') : button.dataset.label;
};

export interface Answer {
  /** HTTP status; 0 when there was no connection. */
  status: number;
  // The shape depends on the endpoint.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: Record<string, any> | null;
}

const answerOf = async (request: Promise<Response>): Promise<Answer> => {
  try {
    const response = await request;
    return { status: response.status, result: await response.json().catch(() => null) };
  } catch {
    return { status: 0, result: null };
  }
};

/** Posts JSON to the site's API. The session cookie, if there is one, goes along: same origin. */
export const postJson = (path: string, body: unknown): Promise<Answer> =>
  answerOf(
    fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  );

export const getJson = (path: string): Promise<Answer> =>
  answerOf(fetch(path, { headers: { Accept: 'application/json' } }));
