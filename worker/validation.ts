/**
 * What every form of the site is checked with: cleaning what was typed and recognising an e-mail
 * address. The rules of each form are in its own folder (signup/validate.ts, business/validate.ts).
 */

/** Longest e-mail address there can be. */
export const EMAIL_MAX = 254;

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

// Letters of any alphabet plus what real names contain. No digits or URL characters, so a name
// can never smuggle a link into the e-mails we send.
export const NAME = /^\p{L}[\p{L}\p{M}'’. -]*$/u;

/**
 * One line of text as it will be stored: trimmed, whitespace collapsed, control characters dropped.
 * Keeps one character past `max`, so "too long" can still be told from "fits".
 */
export const clean = (value: unknown, max: number): string =>
  (typeof value === 'string' ? value : '')
    .normalize('NFC')
    .replace(/\p{Cc}/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max + 1);

/** Like `clean`, for text of several lines: line breaks stay, at most one empty line in a row. */
export const cleanLines = (value: unknown, max: number): string =>
  (typeof value === 'string' ? value : '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[^\P{Cc}\n]/gu, '')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max + 1);

/** What was typed as an e-mail address: lower case, without the spaces around it. */
export const cleanEmail = (value: unknown): string => clean(value, EMAIL_MAX).toLowerCase();

export const isEmail = (email: string): boolean => email.length <= EMAIL_MAX && EMAIL.test(email);

/** The address as accounts are kept by (lower case), or null when it is not an e-mail address. */
export const normalizeEmail = (value: unknown): string | null => {
  const email = cleanEmail(value);
  return email && isEmail(email) ? email : null;
};
