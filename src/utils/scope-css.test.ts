// The home page's stylesheet, reduced to what draws some markup and fenced into it (D-137): what is
// kept, what each selector becomes, and that nothing of the real stylesheet can reach outside.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { parseCss, scopeCss } from './scope-css.ts';

const markup = '<header class="bar on-navy"><a class="btn btn-primary" id="go">Go</a><svg class="icon"></svg></header>';
const scoped = (css: string, extraClasses: Array<string> = []) =>
  scopeCss(css, { scope: 's', markup, extraClasses }).replace(/^\.s\{[^}]*\}@media \(min-width:96rem\)\{[^}]*\}\}/, '');

test('reads rules, groups and at-rules kept whole, without the comments', () => {
  const nodes = parseCss(
    `/* a { } */ .a { content: '}'; } @media (min-width: 1px) { .b { c: d } } @font-face { font-family: X; } @keyframes k { from { opacity: 0 } }`
  );
  assert.deepEqual(
    nodes.map((node) => node.kind),
    ['rule', 'group', 'whole', 'whole']
  );
  assert.equal(nodes[0].kind === 'rule' && nodes[0].body, "content: '}';");
});

test('keeps only the rules whose classes and ids are in the markup', () => {
  const css = scoped(
    '.btn { a: 1 } .hero .btn { b: 2 } .bar .btn, .other { c: 3 } #go { d: 4 } #gone { e: 5 } .late { f: 6 }',
    ['late']
  );
  assert.equal(
    css,
    '.btn:where(.s,.s *){a: 1}.bar .btn:where(.s,.s *){c: 3}#go:where(.s,.s *){d: 4}.late:where(.s,.s *){f: 6}'
  );
});

test('keeps only the rules whose kinds of element are in the markup (and the document)', () => {
  assert.equal(
    scoped('a { a: 1 } .bar svg { b: 2 } fieldset > legend { c: 3 } input, a.btn { d: 4 } html body a { e: 5 }'),
    'a:where(.s,.s *){a: 1}.bar svg:where(.s,.s *){b: 2}a.btn:where(.s,.s *){d: 4}html body a:where(.s,.s *){e: 5}'
  );
});

test('what is inside brackets is not needed', () => {
  assert.equal(scoped('.btn:not(.hero) { a: 1 }'), '.btn:not(.hero):where(.s,.s *){a: 1}');
  assert.equal(
    scoped(':lang(zh) :is(h1, .hero-title) { a: 1 }'),
    ':lang(zh) :is(h1, .hero-title):where(.s,.s *){a: 1}'
  );
  assert.equal(scoped("[data-x='.hero'] { a: 1 }"), "[data-x='.hero']:where(.s,.s *){a: 1}");
});

test('the fence goes before a pseudo-element', () => {
  assert.equal(
    scoped('.btn::after { a: 1 } .btn:hover::before { b: 2 }'),
    '.btn:where(.s,.s *)::after{a: 1}.btn:hover:where(.s,.s *)::before{b: 2}'
  );
});

test('the document becomes the scope; a state of the document is left out', () => {
  assert.equal(scoped(':root { --x: 1px } body { color: red } html { a: b }'), '.s{--x: 1px}.s{color: red}.s{a: b}');
  assert.equal(scoped('html:has(dialog[open]) { overflow: hidden } html.has-dock { a: b }'), '');
  assert.equal(
    scoped("html:not([data-session='in']) [data-auth='in'] { display: none }"),
    "html:not([data-session='in']) [data-auth='in']:where(.s,.s *){display: none}"
  );
  assert.equal(scoped("[dir='rtl'] svg.icon { scale: -1 1 }"), "[dir='rtl'] svg.icon:where(.s,.s *){scale: -1 1}");
  // What the home page sets on every element of a language reaches the scope too, which the parts
  // inherit from: the Arabic page's font, as the home page's body has it.
  assert.equal(scoped(':lang(ar) { --font: system-ui }'), ':lang(ar):where(.s,.s *){--font: system-ui}');
});

test('groups keep what is kept inside them, and go when nothing is', () => {
  assert.equal(
    scoped('@media (min-width: 9px) { .btn { a: 1 } .hero { b: 2 } } @supports (x: y) { .hero { c: 3 } }'),
    '@media (min-width: 9px){.btn:where(.s,.s *){a: 1}}'
  );
});

test('rem is a share of the home page root size', () => {
  assert.equal(
    scoped('.btn { font-size: 0.9375rem; margin: -.5rem 1rem; width: clamp(2rem, 1.5rem + 2vw, 3rem); gap: 2em }'),
    '.btn:where(.s,.s *){font-size: calc(0.9375 * var(--scope-rem)); margin: calc(-.5 * var(--scope-rem)) calc(1 * var(--scope-rem)); width: clamp(calc(2 * var(--scope-rem)), calc(1.5 * var(--scope-rem)) + 2vw, calc(3 * var(--scope-rem))); gap: 2em}'
  );
  assert.match(
    scopeCss('', { scope: 's', markup }),
    /^\.s\{display:contents;--scope-rem:1rem\}@media \(min-width:96rem\)\{\.s\{--scope-rem:0\.8rem\}\}$/
  );
});

test('fonts are kept; animations only when a kept rule uses them', () => {
  const css = scoped(
    "@font-face { font-family: 'F'; } .btn { animation: in 1s } .hero { animation: out 1s } @keyframes in { from { opacity: 0 } } @keyframes out { to { opacity: 0 } }"
  );
  assert.equal(
    css,
    "@font-face{font-family: 'F';}.btn:where(.s,.s *){animation: in 1s}@keyframes in{from { opacity: 0 }}"
  );
});

test('nothing of the home page stylesheet reaches outside the scope', () => {
  const landing = readFileSync(new URL('../assets/styles/landing.css', import.meta.url), 'utf8');
  // Every class, id and kind of element of the stylesheet in the markup: everything that can be kept is kept.
  const names = new Set(Array.from(landing.matchAll(/[.#](-?[_a-zA-Z][\w-]*)/g), (match) => match[1]));
  const kinds = new Set(
    Array.from(landing.matchAll(/(?:^|[\s>+~,(])([a-z][a-z0-9]*)(?=[\s.:[#>+~,){])/gm), (match) => match[1])
  );
  const all = `<div class="${[...names].join(' ')}">${[...names].map((name) => `<i id="${name}"></i>`).join('')}${[...kinds].map((kind) => `<${kind}></${kind}>`).join('')}</div>`;
  const css = scopeCss(landing, { scope: 's', markup: all });
  const selectors: Array<string> = [];
  /** A list of selectors split at the commas that are not inside brackets. */
  const split = (list: string) => {
    let depth = 0;
    let current = '';
    for (const character of list) {
      depth += character === '(' || character === '[' ? 1 : character === ')' || character === ']' ? -1 : 0;
      if (character === ',' && depth === 0) {
        selectors.push(current);
        current = '';
      } else current += character;
    }
    selectors.push(current);
  };
  const visit = (nodes: ReturnType<typeof parseCss>) => {
    for (const node of nodes) {
      if (node.kind === 'rule') split(node.selector);
      if (node.kind === 'group') visit(node.children);
    }
  };
  visit(parseCss(css));
  assert.ok(selectors.length > 400, `${selectors.length} selectors`);
  for (const selector of selectors) {
    assert.ok(selector === '.s' || /:where\(\.s,\.s \*\)(::[\w-]+(\([^)]*\))?)?$/.test(selector), selector);
  }
});
