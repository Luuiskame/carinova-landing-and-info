/**
 * Compares what a translation says with what the Spanish original says, piece by piece: the unit
 * tests (translations.test.ts) use it to tell whether a language has every sentence of the site, in
 * the right shape, and whether it was really translated.
 *
 * - `compareShape`: the same keys, lists of the same length, functions that take the same values
 *   and still use them, the same {placeholders}, and the same facts (numbers, ids, addresses).
 * - `leaves`: every sentence, with where it is.
 * - `sameAs`: how much of a translation reads exactly like another language.
 *
 * No imports: it runs on plain Node.
 */

export interface Rules {
  /** Properties that are facts, not words: they must read the same in every language. */
  facts: ReadonlySet<string>;
  /** Properties each language fills in its own way: not compared. */
  free: ReadonlySet<string>;
  /** Properties that hold names and addresses, not sentences: left out when measuring a translation. */
  names: ReadonlySet<string>;
}

/** The site's data (src/data): ids, addresses and codes are facts. */
export const DATA_RULES: Rules = {
  facts: new Set([
    'id',
    'icon',
    'url',
    'domain',
    'path',
    'code',
    'axis',
    'homeAnchor',
    'opens',
    'closes',
    'dayOfWeek',
    'whatsapp',
    'mapsUrl',
    'transitDays',
    'featured',
  ]),
  // The words an article is searched by: each language adds its own to the Spanish ones.
  free: new Set(['match']),
  names: new Set([
    'match',
    'states',
    'examples',
    'line1',
    'line2',
    'city',
    'state',
    'country',
    'postalCode',
    'phone',
    'tariff',
    'basis',
    'device',
    'unit',
    'RESTRICTED_ORDER',
  ]),
};

/** What the pages and the Worker say (src/i18n/ui, worker/text): only the names of icons are facts. */
export const TEXT_RULES: Rules = { facts: new Set(['icon']), free: new Set(), names: new Set() };

const kindOf = (value: unknown): string => (Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value);

/** "{name}", "{index}"… sorted: a sentence keeps the ones of its original. */
const placeholders = (text: string): string => (text.match(/\{[a-z]+\}/gi) ?? []).sort().join(' ');

/** The values a sentence is tried with: words no sentence has by itself. */
const sample = (count: number): Array<string> => Array.from({ length: count }, (_item, index) => `qz${index}qz`);

/** The keys of an object that hold something: a key set to `undefined` is the same as no key. */
const keysOf = (object: Record<string, unknown>): Array<string> =>
  Object.keys(object).filter((key) => object[key] !== undefined);

/**
 * What is wrong with `candidate` as a translation of `reference`: an empty list when nothing is.
 * `path` names where each difference is ("homeHero.facts[1]").
 */
export const compareShape = (reference: unknown, candidate: unknown, rules: Rules, path = ''): Array<string> => {
  const here = path || '(root)';
  const kind = kindOf(reference);
  if (kindOf(candidate) !== kind) return [`${here}: is ${kindOf(candidate)}, the original is ${kind}`];

  if (kind === 'array') {
    const original = reference as Array<unknown>;
    const translated = candidate as Array<unknown>;
    if (original.length !== translated.length) {
      return [`${here}: has ${translated.length} items, the original has ${original.length}`];
    }
    return original.flatMap((item, index) => compareShape(item, translated[index], rules, `${path}[${index}]`));
  }

  if (kind === 'object') {
    const original = reference as Record<string, unknown>;
    const translated = candidate as Record<string, unknown>;
    const problems: Array<string> = [];
    for (const key of keysOf(original)) {
      const child = path ? `${path}.${key}` : key;
      if (rules.free.has(key)) continue;
      if (translated[key] === undefined) problems.push(`${child}: missing`);
      else if (rules.facts.has(key)) {
        if (JSON.stringify(translated[key]) !== JSON.stringify(original[key])) {
          problems.push(`${child}: a fact changed (${JSON.stringify(translated[key])})`);
        }
      } else problems.push(...compareShape(original[key], translated[key], rules, child));
    }
    for (const key of keysOf(translated)) {
      if (original[key] === undefined) problems.push(`${path ? `${path}.${key}` : key}: not in the original`);
    }
    return problems;
  }

  if (kind === 'function') {
    const original = reference as (...values: Array<string>) => unknown;
    const translated = candidate as (...values: Array<string>) => unknown;
    if (original.length !== translated.length) {
      return [`${here}: takes ${translated.length} values, the original takes ${original.length}`];
    }
    // A sentence built from values must still show each value the original shows.
    const values = sample(original.length);
    let before: unknown;
    let after: unknown;
    try {
      before = original(...values);
      after = translated(...values);
    } catch {
      // Not a sentence of plain values (it takes an object): its arity is all that can be compared.
      return [];
    }
    if (typeof before !== 'string') {
      return kindOf(before) === kindOf(after) ? [] : [`${here}: returns ${kindOf(after)}`];
    }
    if (typeof after !== 'string') return [`${here}: returns ${kindOf(after)}, the original returns a sentence`];
    const shown = before.toLowerCase();
    const result = after.toLowerCase();
    return values
      .filter((value) => shown.includes(value) && !result.includes(value))
      .map((value) => `${here}: leaves out value ${values.indexOf(value) + 1}`);
  }

  if (kind === 'string') {
    const original = reference as string;
    const translated = candidate as string;
    const problems: Array<string> = [];
    if (original.trim() !== '' && translated.trim() === '') problems.push(`${here}: empty`);
    if (placeholders(original) !== placeholders(translated)) {
      problems.push(
        `${here}: its placeholders are "${placeholders(translated)}", the original's "${placeholders(original)}"`
      );
    }
    return problems;
  }

  // Numbers and switches are facts.
  return reference === candidate ? [] : [`${here}: is ${String(candidate)}, the original is ${String(reference)}`];
};

/** Every sentence of a piece of the site, with where it is; facts, names and addresses are left out. */
export const leaves = (value: unknown, rules: Rules, path = ''): Array<{ path: string; text: string }> => {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => leaves(item, rules, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      rules.facts.has(key) || rules.names.has(key) ? [] : leaves(child, rules, path ? `${path}.${key}` : key)
    );
  }
  return [];
};

/** A sentence with words in it: at least two letters in a row, in any script. */
const hasWords = (text: string): boolean => /\p{L}{2}/u.test(text);

/**
 * The sentences of `candidate` that read exactly like the ones of `other` in the same place, among
 * the ones that have words: what a translation left untouched. Names that are the same in every
 * language ("Nicaragua", "WhatsApp", a store's name) are part of the count: a translation has few.
 */
export const sameAs = (candidate: unknown, other: unknown, rules: Rules): { same: Array<string>; total: number } => {
  const theirs = new Map(leaves(other, rules).map(({ path, text }) => [path, text]));
  const mine = leaves(candidate, rules).filter(({ text }) => hasWords(text));
  return {
    same: mine.filter(({ path, text }) => theirs.get(path) === text).map(({ path }) => path),
    total: mine.length,
  };
};

/** How much of the sentences that have words is written in a script: 0 to 1. */
export const shareIn = (value: unknown, script: RegExp, rules: Rules): number => {
  const sentences = leaves(value, rules).filter(({ text }) => hasWords(text));
  return sentences.length === 0 ? 1 : sentences.filter(({ text }) => script.test(text)).length / sentences.length;
};
