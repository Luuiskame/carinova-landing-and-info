// The search of "¿Puede ingresar?": does what a visitor typed name something on Carinova's lists of
// what it cannot bring (RESTRICTED_ITEMS in src/data/carinova.ts)? Shared by the tracker's script (in
// the browser) and the unit tests, so both compare words the same way. Nothing imported: the tests
// run this file on plain Node.
//
// The search only knows those lists. It never says an article is allowed: what is on none of them
// gets "No aparece en nuestras listas" and the way to ask.

/**
 * How a search is compared: lower case, without accents or vowel marks, words separated by one
 * space. It works in any script: "Batería de LITIO" → "bateria de litio", "Дрон!" → "дрон",
 * "بطّارية" → "بطارية".
 */
export const plain = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** Chinese and Japanese are written without spaces between words. */
const UNSPACED = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

/**
 * Whether a search (already `plain`) names a word of the lists (already `plain`). Whole words are
 * compared, so "armario" is not "arma"; a word written without spaces is looked for anywhere in
 * the search, because nothing separates it from its neighbours.
 */
export const mentions = (search: string, word: string): boolean =>
  word !== '' && (UNSPACED.test(word) ? search.includes(word) : ` ${search} `.includes(` ${word} `));

export interface SearchGroup {
  id: string;
  title: string;
  summary: string;
  items: Array<{ name: string; match: Array<string> }>;
}

/**
 * The first group (they come from the strictest to the mildest) with an item the search names, and
 * that item: the one whose matching word is the longest, so "cigarrillo electrónico" is the
 * electronic cigarette and not tobacco. Null when the search names nothing on the lists.
 */
export const findRestricted = (
  query: string,
  groups: ReadonlyArray<SearchGroup>
): { group: SearchGroup; name: string } | null => {
  const search = plain(query);
  if (!search) return null;
  for (const group of groups) {
    let best: { name: string; length: number } | null = null;
    for (const item of group.items) {
      for (const candidate of item.match) {
        const word = plain(candidate);
        if (mentions(search, word) && word.length > (best?.length ?? 0))
          best = { name: item.name, length: word.length };
      }
    }
    if (best) return { group, name: best.name };
  }
  return null;
};
