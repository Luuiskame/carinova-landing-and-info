// The home page's own parts (its header, its footer, its WhatsApp button) on another page of the
// site (D-137). They are drawn by landing.css, which is written for a page of its own: it styles
// `body`, every `h2`, every `a` and every `svg`, and puts its tokens on `:root`. On a page of the
// rest of the site those rules would reach the page's content, which is drawn by Tailwind. So such
// a page gets only the rules that draw the parts it shows, fenced into them:
//
// - A rule is kept when the classes, the ids and the kinds of element its selector names are in
//   the parts' markup (or a script gives the parts those classes): the rules of the rest of the
//   home page are left out. What is inside `:not()`, `:is()` and `[…]` is not needed.
// - Each selector reaches only the element that carries the scope class and what is inside it:
//   `:where(.scope, .scope *)` is added to the element the selector picks. `:where()` weighs
//   nothing, so the kept rules weigh against each other exactly as on the home page.
// - What the home page sets on `:root` (its tokens) and on `html` and `body` (its font, its colour,
//   its line) is set on the scope element, and the parts inherit it from there. A rule that on the
//   home page also reaches the document itself reaches the scope element as well: `:lang(ar)`
//   gives the Arabic page the device's font there, and the parts inherit it, as the home page's
//   do from its body. The scope element is a wrapper that draws no box of its own (`display:
//   contents`): the parts sit in the page as if it were not there (a header that sticks to the top
//   still sticks).
// - `rem` is written as a share of the home page's root size (`--scope-rem`). The other pages make
//   the root 20 px on screens from 1536 px wide (Layout.astro); the home page leaves it alone.
//
// It reads the stylesheet with a small parser of its own: rules, the at-rules that hold rules
// (@media, @supports) and those kept whole (@font-face, @keyframes). landing.css does not nest
// rules; this does not read nested rules either (src/utils/scope-css.test.ts).

/** A rule, an at-rule that holds rules, or an at-rule kept as it is written. */
type Node =
  | { kind: 'rule'; selector: string; body: string }
  | { kind: 'group'; prelude: string; children: Array<Node> }
  | { kind: 'whole'; name: string; text: string };

/** The at-rules whose block holds rules. */
const GROUPS = new Set(['media', 'supports', 'container', 'layer']);

/** A stylesheet as rules and at-rules (comments left out). */
export const parseCss = (css: string): Array<Node> => {
  let at = 0;

  const skipComment = (): boolean => {
    if (!css.startsWith('/*', at)) return false;
    const end = css.indexOf('*/', at + 2);
    at = end < 0 ? css.length : end + 2;
    return true;
  };
  /** A string in quotes, whole, from its opening quote. */
  const readString = (): string => {
    const quote = css[at];
    const start = at++;
    while (at < css.length && css[at] !== quote) at += css[at] === '\\' ? 2 : 1;
    at++;
    return css.slice(start, at);
  };
  /** Up to the first of `stops` outside brackets, quotes and comments. */
  const readUntil = (stops: string): string => {
    let out = '';
    let depth = 0;
    while (at < css.length) {
      if (skipComment()) continue;
      const character = css[at];
      if (character === '"' || character === "'") {
        out += readString();
        continue;
      }
      if (depth === 0 && stops.includes(character)) break;
      if (character === '(' || character === '[') depth++;
      if (character === ')' || character === ']') depth--;
      out += character;
      at++;
    }
    return out;
  };
  /** What a block holds, from after its `{` to its `}` (which is read and left out). */
  const readBlock = (): string => {
    let out = '';
    let depth = 1;
    while (at < css.length) {
      if (skipComment()) continue;
      const character = css[at];
      if (character === '"' || character === "'") {
        out += readString();
        continue;
      }
      if (character === '{') depth++;
      if (character === '}' && --depth === 0) {
        at++;
        break;
      }
      out += character;
      at++;
    }
    return out;
  };
  const readNodes = (): Array<Node> => {
    const nodes: Array<Node> = [];
    while (at < css.length) {
      if (skipComment()) continue;
      if (/\s/.test(css[at])) {
        at++;
        continue;
      }
      if (css[at] === '}') {
        at++;
        break;
      }
      const prelude = readUntil('{;}').trim();
      if (css[at] !== '{') {
        // A statement without a block (@import, @charset): kept as it is written.
        if (css[at] === ';') at++;
        if (prelude) nodes.push({ kind: 'whole', name: /^@([\w-]+)/.exec(prelude)?.[1] ?? '', text: `${prelude};` });
        continue;
      }
      at++;
      if (prelude.startsWith('@')) {
        const name = /^@([\w-]+)/.exec(prelude)?.[1] ?? '';
        if (GROUPS.has(name)) nodes.push({ kind: 'group', prelude, children: readNodes() });
        else nodes.push({ kind: 'whole', name, text: `${prelude}{${readBlock().trim()}}` });
      } else nodes.push({ kind: 'rule', selector: prelude, body: readBlock().trim() });
    }
    return nodes;
  };

  return readNodes();
};

/** A list of selectors, split at its commas (not at the ones inside brackets). */
const splitList = (list: string): Array<string> => {
  const parts: Array<string> = [];
  let depth = 0;
  let current = '';
  for (const character of list) {
    if (character === '(' || character === '[') depth++;
    if (character === ')' || character === ']') depth--;
    if (character === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += character;
  }
  parts.push(current.trim());
  return parts.filter(Boolean);
};

/** A selector without what is inside brackets: what is in `:not()`, `:is()` and `[…]` is not needed. */
const outsideBrackets = (selector: string): string => {
  let depth = 0;
  let out = '';
  for (const character of selector) {
    if (character === '(' || character === '[') depth++;
    if (depth === 0) out += character;
    if (character === ')' || character === ']') depth--;
  }
  return out;
};

/** The classes, the ids and the kinds of element a selector needs to pick anything. */
const needsOf = (selector: string): { classes: Array<string>; ids: Array<string>; tags: Array<string> } => {
  const bare = outsideBrackets(selector);
  return {
    classes: Array.from(bare.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g), (match) => match[1]),
    ids: Array.from(bare.matchAll(/#(-?[_a-zA-Z][\w-]*)/g), (match) => match[1]),
    tags: Array.from(bare.matchAll(/(?:^|[\s>+~])([a-zA-Z][\w-]*)/g), (match) => match[1].toLowerCase()),
  };
};

/** The selectors that name the document itself: their rules are set on the scope element. */
const ROOT = new Set([':root', 'html', 'body']);

/** Where a pseudo-element starts (`::before`), or the end: what is added goes before it. */
const pseudoElementAt = (selector: string): number => {
  let depth = 0;
  for (let index = 0; index < selector.length; index++) {
    const character = selector[index];
    if (character === '(' || character === '[') depth++;
    if (character === ')' || character === ']') depth--;
    if (depth === 0 && character === ':' && selector[index + 1] === ':') return index;
  }
  return selector.length;
};

/** A rule's declarations on one line, with `rem` as a share of the home page's root size. */
const declarationsOf = (body: string): string =>
  body
    .replace(/\s+/g, ' ')
    .replace(
      /(^|[^\w.-])(-?\d*\.?\d+)rem\b/g,
      (_, before: string, amount: string) => `${before}calc(${amount} * var(--scope-rem))`
    );

/** The names of the animations a stylesheet uses. */
const animationsOf = (css: string): Set<string> => {
  const names = new Set<string>();
  for (const [, value] of css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
    for (const word of value.split(/[\s,]+/)) names.add(word);
  }
  return names;
};

export interface ScopeOptions {
  /** The class of the elements inside which the parts are drawn. */
  scope: string;
  /** The parts' markup: what it names decides which rules are kept. */
  markup: string;
  /** Classes that a script gives the parts, which are not in their markup. */
  extraClasses?: ReadonlyArray<string>;
}

/**
 * The rules of a stylesheet written for a page of its own that draw the given markup, fenced into
 * the elements that carry the scope class.
 */
export const scopeCss = (css: string, { scope, markup, extraClasses = [] }: ScopeOptions): string => {
  const classes = new Set(extraClasses);
  for (const [, list] of markup.matchAll(/\sclass="([^"]*)"/g)) for (const name of list.split(/\s+/)) classes.add(name);
  const ids = new Set(Array.from(markup.matchAll(/\sid="([^"]*)"/g), (match) => match[1]));
  // The document's own elements are around the parts, wherever they are.
  const tags = new Set([
    'html',
    'body',
    ...Array.from(markup.matchAll(/<([a-zA-Z][\w-]*)/g), (match) => match[1].toLowerCase()),
  ]);
  const fence = `:where(.${scope},.${scope} *)`;

  /** A selector fenced into the scope, or null when it can pick nothing there. */
  const fenced = (selector: string): string | null => {
    if (ROOT.has(selector)) return `.${scope}`;
    const needs = needsOf(selector);
    if (
      !needs.classes.every((name) => classes.has(name)) ||
      !needs.ids.every((id) => ids.has(id)) ||
      !needs.tags.every((tag) => tags.has(tag))
    )
      return null;
    // A state of the whole document (`html:has(dialog[open])`) is the page's business, not the parts'.
    if (/^(?:html|body|:root)(?=[:.[#]|$)/.test(selector) && !/\s|>|~|\+/.test(outsideBrackets(selector))) return null;
    const at = pseudoElementAt(selector);
    return `${selector.slice(0, at)}${fence}${selector.slice(at)}`;
  };

  const write = (nodes: Array<Node>): string =>
    nodes
      .map((node) => {
        if (node.kind === 'group') {
          const inside = write(node.children);
          return inside ? `${node.prelude}{${inside}}` : '';
        }
        if (node.kind === 'whole') return node.name === 'font-face' ? node.text : '';
        const selectors = splitList(node.selector)
          .map(fenced)
          .filter((selector): selector is string => selector !== null);
        return selectors.length && node.body
          ? `${[...new Set(selectors)].join(',')}{${declarationsOf(node.body)}}`
          : '';
      })
      .join('');

  const nodes = parseCss(css);
  const rules = write(nodes);
  // The animations the kept rules use, and nothing else of the kind.
  const used = animationsOf(rules);
  const keyframes = nodes
    .filter((node): node is Extract<Node, { kind: 'whole' }> => node.kind === 'whole' && node.name === 'keyframes')
    .filter((node) => used.has(/^@keyframes\s+([\w-]+)/.exec(node.text)?.[1] ?? ''))
    .map((node) => node.text)
    .join('');

  const root = `.${scope}{display:contents;--scope-rem:1rem}@media (min-width:96rem){.${scope}{--scope-rem:0.8rem}}`;
  return `${root}${rules}${keyframes}`;
};
