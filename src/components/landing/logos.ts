// The logos of the stores (src/assets/images/tiendas), by the store's id: the address of each file
// as the build publishes it. Shared by the page, which draws the stores of "Personal Shopper", and
// by the script of the directory, which is loaded only when "Y más" is opened.
//
// `no-inline`: a small file would otherwise be written into whoever asks for it as data, which is
// how the original page came to weigh what it did. Each logo stays a file of its own, fetched when
// it is about to be seen and cached from then on.
const files = import.meta.glob<string>('../../assets/images/tiendas/*.{svg,webp}', {
  eager: true,
  query: '?url&no-inline',
  import: 'default',
});

export const LOGO_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1).replace(/\.\w+$/, ''), url])
);
