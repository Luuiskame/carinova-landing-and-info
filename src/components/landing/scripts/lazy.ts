// The parts of the home page that are fetched when they are needed, each once: the calculator, the
// article search with its catalogue, the dialogs, the directory of stores and the carousel of
// reviews. A part that fails to arrive (a connection that drops) can be asked for again.
const once = <Module>(load: () => Promise<Module>): (() => Promise<Module>) => {
  let loading: Promise<Module> | null = null;
  return () => {
    loading ??= load().catch((error: unknown) => {
      loading = null;
      throw error;
    });
    return loading;
  };
};

export const loadCalculator = once(() => import('./calculator'));
export const loadArticles = once(() => import('./articles'));
export const loadDialogs = once(() => import('./dialogs'));
export const loadDirectory = once(() => import('./directory'));
export const loadCarousel = once(() => import('./carousel'));
