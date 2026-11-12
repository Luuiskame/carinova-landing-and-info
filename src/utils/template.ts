/**
 * Fills the {placeholders} of a sentence: fill('Hola, {name}', { name: 'Paul' }) → "Hola, Paul".
 *
 * Pages hand their scripts the sentences of the page's language this way (as data attributes), so a
 * script carries no text of its own and never needs both languages.
 */
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (placeholder, name: string) => (name in values ? String(values[name]) : placeholder));
