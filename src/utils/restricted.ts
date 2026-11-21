// The search of "¿Puede ingresar?": does what a visitor typed name something on Carinova's lists of
// what it cannot bring (RESTRICTED_ITEMS in src/data/carinova.ts)? Shared by the tracker's script (in
// the browser), the home page's "Carinova Bot" and the unit tests, so all compare words the same
// way. Nothing imported: the tests run this file on plain Node.
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
 * Where a search (already `plain`) names a word of the lists (already `plain`): the start and the
 * end of each place. Whole words are compared, so "armario" is not "arma"; a word written without
 * spaces is looked for anywhere in the search, because nothing separates it from its neighbours.
 */
const placesOf = (search: string, word: string): Array<[start: number, end: number]> => {
  const places: Array<[number, number]> = [];
  if (!word) return places;
  const unspaced = UNSPACED.test(word);
  const text = unspaced ? search : ` ${search} `;
  const needle = unspaced ? word : ` ${word} `;
  // In the padded text a match starts on the space before the word: the same number in `search`.
  for (let at = text.indexOf(needle); at >= 0; at = text.indexOf(needle, at + 1)) {
    places.push([at, at + word.length]);
  }
  return places;
};

export interface SearchGroup {
  id: string;
  title: string;
  summary: string;
  items: Array<{ name: string; match: Array<string> }>;
}

/**
 * The item of the lists a search names, with its group. Null when it names nothing on them.
 *
 * - The phrase that says the most decides what the article is: "alcohol en gel" is the gel that
 *   travels by sea, not the drink that "alcohol" by itself means, and "cigarrillo electrónico" is the
 *   electronic cigarette, not tobacco. So a word that sits inside a longer phrase that was also
 *   found does not count.
 * - Between two different articles ("una moto con su batería de litio") the strictest group
 *   answers: the groups come from the strictest to the mildest.
 */
export const findRestricted = (
  query: string,
  groups: ReadonlyArray<SearchGroup>
): { group: SearchGroup; name: string } | null => {
  const search = plain(query);
  if (!search) return null;

  const found: Array<{ group: SearchGroup; name: string; rank: number; start: number; end: number }> = [];
  groups.forEach((group, rank) => {
    for (const item of group.items) {
      for (const candidate of item.match) {
        for (const [start, end] of placesOf(search, plain(candidate))) {
          found.push({ group, name: item.name, rank, start, end });
        }
      }
    }
  });

  const inside = (one: (typeof found)[number], other: (typeof found)[number]) =>
    other.start <= one.start && one.end <= other.end && other.end - other.start > one.end - one.start;
  const [best] = found
    .filter((one) => !found.some((other) => inside(one, other)))
    .sort((a, b) => a.rank - b.rank || b.end - b.start - (a.end - a.start));
  return best ? { group: best.group, name: best.name } : null;
};
