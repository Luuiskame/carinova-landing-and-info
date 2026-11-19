/**
 * Brazilian Portuguese wording of ../carinova.ts: the same exports with the same shapes, for the
 * Portuguese version of the site (src/i18n). Facts are not repeated here: every price, number,
 * address and id is taken from the Spanish file and only the words around it are written again, so
 * the languages cannot disagree on a fact. src/i18n/translations.test.ts checks that nothing is left
 * untranslated.
 *
 * Like ../carinova.ts, the Worker bundles this file: relative imports with the .ts extension only.
 */
import * as es from '../carinova.ts';
import type { Branch, DayOfWeek, OpeningHours, RestrictedGroupId, Store, StoreCategoryId } from '../carinova.ts';

/** "a, b e c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export const TAGLINE = 'Envios que unem';
export const HEADLINE: [string, string] = ['De lá', 'para cá.'];
export const VALUE_PROPOSITION =
  'Trazemos suas compras pessoais, encomendas familiares e cargas empresariais dos Estados Unidos até a Nicarágua.';

export const CTA: typeof es.CTA = {
  signup: { ...es.CTA.signup, text: 'Criar conta' },
  quote: { ...es.CTA.quote, text: 'Cote seu envio' },
  help: { text: 'Ajuda pelo WhatsApp' },
  account: { ...es.CTA.account, text: 'Ir para minha conta', short: 'Minha conta' },
  signin: { ...es.CTA.signin, text: 'Entrar', short: 'Entrar' },
  track: { ...es.CTA.track, text: 'Rastreie seu pacote' },
};

/** "08:00" → "8h", "17:30" → "17h30" (the way Brazil writes times). */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours}h${minutes ? String(minutes).padStart(2, '0') : ''}`;
};

/** "das 8h", "da 1h": the article agrees with the hour. */
const fromTime = (time: string): string => `${Number(time.split(':')[0]) === 1 ? 'da' : 'das'} ${formatTime(time)}`;
/** "às 17h", "à 1h" */
const toTime = (time: string): string => `${Number(time.split(':')[0]) === 1 ? 'à' : 'às'} ${formatTime(time)}`;

/** "8h – 17h" */
export const formatHours = ({ opens, closes }: OpeningHours): string => `${formatTime(opens)} – ${formatTime(closes)}`;

/** "segunda a sábado, das 8h às 17h": opening hours inside a sentence. */
export const describeHours = (hours: OpeningHours): string =>
  `${hours.days.toLowerCase()}, ${fromTime(hours.opens)} ${toTime(hours.closes)}`;

const WEEK: Array<DayOfWeek> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

/** The days a branch opens, from the structured list: "Segunda a sábado", or the days one by one. */
const daysOf = (days: Array<DayOfWeek>): string => {
  const order = days.map((day) => WEEK.indexOf(day)).sort((a, b) => a - b);
  const inARow = order.every((day, index) => index === 0 || day === order[index - 1] + 1);
  return capitalize(
    order.length > 2 && inARow
      ? `${DAY_NAMES[order[0]]} a ${DAY_NAMES[order[order.length - 1]]}`
      : listOf(order.map((day) => DAY_NAMES[day]))
  );
};

export const BRANCHES: Array<Branch> = es.BRANCHES.map((branch) => ({
  ...branch,
  // A real address is the same in every language; only the placeholder is words.
  address: branch.address === es.ADDRESS_PENDING ? 'Endereço a confirmar' : branch.address,
  hours: branch.hours.map((row) => ({ ...row, days: daysOf(row.dayOfWeek) })),
}));

const CITY_NAMES: Record<string, string> = { 'los-angeles': 'Los Angeles' };

export const RECEPTION_POINTS: typeof es.RECEPTION_POINTS = es.RECEPTION_POINTS.map((point) => ({
  ...point,
  city: CITY_NAMES[point.id] ?? point.city,
}));

/** When packages are received in the United States, in this language. */
export const RECEPTION_HOURS: OpeningHours = {
  ...es.RECEPTION_HOURS,
  days: daysOf(es.RECEPTION_HOURS.dayOfWeek),
};

/** "3 a 4 dias" */
const transit = ([min, max]: [number, number]): string => `${min} a ${max} dias`;

const DEVICE_NAMES: Record<string, { name: string; plural: string }> = {
  celular: { name: 'Celular', plural: 'Celulares' },
  tablet: { name: 'Tablet', plural: 'Tablets' },
  laptop: { name: 'Notebook', plural: 'Notebooks' },
  xbox: { name: 'Xbox', plural: 'Xbox' },
  playstation: { name: 'PlayStation', plural: 'PlayStation' },
};

export const RATES: typeof es.RATES = {
  ...es.RATES,
  transitFrom: 'a partir do recebimento físico do seu pacote',
  air: { ...es.RATES.air, name: 'Aéreo', badge: 'Mais rápido', transit: transit(es.RATES.air.transitDays) },
  sea: { ...es.RATES.sea, name: 'Marítimo', badge: 'Mais econômico', transit: transit(es.RATES.sea.transitDays) },
  electronics: {
    ...es.RATES.electronics,
    name: 'Eletrônicos',
    transit: transit(es.RATES.electronics.transitDays),
    items: es.RATES.electronics.items.map((item) => ({ ...item, ...DEVICE_NAMES[item.id] })),
  },
  notes: [
    'Os prazos contam a partir do recebimento físico do pacote e podem variar conforme o trânsito, a alfândega e o destino.',
    'São verificados o peso, as dimensões, a modalidade, a cobertura e as condições do serviço.',
    'As tarifas incluem seguro e impostos quando se aplicam ao envio. A cobertura, os limites, as exclusões e as cobranças adicionais estão sujeitos às condições do serviço.',
    'As tarifas de eletrônicos correspondem a envios aéreos, por unidade.',
    `Por peso, cada envio é cobrado por um mínimo de ${es.RATES.minimumLb} lb.`,
  ],
};

export const MIAMI_ADDRESS: typeof es.MIAMI_ADDRESS = {
  ...es.MIAMI_ADDRESS,
  notes: [
    'Escreva o nome e o sobrenome exatamente assim: é desse jeito que identificamos seus pacotes.',
    'Para envios marítimos, fale conosco pelo WhatsApp antes de comprar.',
  ],
};

/** The labels already carry both languages, as on Carinova's graphic. */
export const miamiAddressRows = es.miamiAddressRows;

/**
 * The names of the items, in the order of the Spanish lists, with the words a Portuguese speaker
 * may type for each one. The Spanish words still match too: the site's visitors mix languages.
 */
const RESTRICTED_TEXT: Record<
  RestrictedGroupId,
  { title: string; summary: string; items: Array<{ name: string; match: Array<string> }> }
> = {
  notYet: {
    title: 'Ainda sem autorização para trazer',
    summary: 'Ainda não temos autorização para trazê-los.',
    items: [
      {
        name: 'Carros',
        match: ['carro', 'carros', 'automovel', 'automoveis', 'veiculo', 'veiculos', 'caminhonete', 'picape'],
      },
      { name: 'Motos', match: ['moto', 'motos', 'motocicleta', 'motocicletas', 'scooter', 'motoneta'] },
      {
        name: 'Maquinário pesado',
        match: [
          'maquinario',
          'maquinario pesado',
          'maquinas pesadas',
          'escavadeira',
          'retroescavadeira',
          'trator',
          'empilhadeira',
        ],
      },
    ],
  },
  prohibited: {
    title: 'Proibidos para recebimento e transporte',
    summary: 'Não os recebemos nem os transportamos.',
    items: [
      {
        name: 'Armas, munições e seus acessórios',
        match: [
          'arma',
          'armas',
          'arma de fogo',
          'pistola',
          'pistolas',
          'revolver',
          'espingarda',
          'fuzil',
          'municao',
          'municoes',
          'bala',
          'balas',
        ],
      },
      {
        name: 'Tabaco, cigarros e derivados',
        match: ['tabaco', 'fumo', 'cigarro', 'cigarros', 'charuto', 'charutos', 'cigarrilha'],
      },
      {
        name: 'Cigarros eletrônicos',
        match: ['cigarro eletronico', 'cigarros eletronicos', 'vape', 'vapes', 'pod descartavel'],
      },
      {
        name: 'Bebidas alcoólicas',
        match: [
          'bebida alcoolica',
          'bebidas alcoolicas',
          'licor',
          'rum',
          'uisque',
          'whisky',
          'vodca',
          'vodka',
          'tequila',
          'cachaca',
          'cerveja',
          'cervejas',
          'vinho',
          'vinhos',
        ],
      },
      {
        name: 'Acessórios para aeronaves',
        match: ['aeronave', 'aeronaves', 'aviao', 'avioes', 'pecas de aviao', 'pecas de aeronave'],
      },
      {
        name: 'Transmissores de rádio',
        match: [
          'transmissor',
          'transmissores',
          'transmissor de radio',
          'transmissores de radio',
          'radiotransmissor',
          'walkie talkie',
        ],
      },
      { name: 'Drones', match: ['drone', 'drones'] },
    ],
  },
  seaOnly: {
    title: 'Não entram por via aérea, mas entram por via marítima',
    summary: 'Não podem viajar de avião: nós os trazemos por via marítima.',
    items: [
      {
        name: 'Produtos inflamáveis',
        match: ['inflamavel', 'inflamaveis', 'combustivel', 'gasolina', 'tinta', 'solvente', 'alcool', 'querosene'],
      },
      {
        name: 'Baterias de lítio soltas',
        match: [
          'bateria',
          'baterias',
          'bateria de litio',
          'baterias de litio',
          'litio',
          'power bank',
          'carregador portatil',
          'pilha',
          'pilhas',
        ],
      },
      { name: 'Body spray', match: ['body spray', 'body splash', 'colonia', 'deo colonia'] },
      { name: 'Perfumes', match: ['perfume', 'perfumes', 'fragrancia', 'fragrancias'] },
      {
        name: 'Aerossóis',
        match: ['aerossol', 'aerossois', 'spray', 'desodorante spray', 'desodorante aerossol', 'laque'],
      },
    ],
  },
};

export const RESTRICTED_ITEMS: typeof es.RESTRICTED_ITEMS = Object.fromEntries(
  es.RESTRICTED_ORDER.map((id) => {
    const text = RESTRICTED_TEXT[id];
    return [
      id,
      {
        title: text.title,
        summary: text.summary,
        items: es.RESTRICTED_ITEMS[id].items.map((item, index) => ({
          name: text.items[index].name,
          match: [...text.items[index].match, ...item.match],
        })),
      },
    ];
  })
) as typeof es.RESTRICTED_ITEMS;

export const RESTRICTED_ORDER = es.RESTRICTED_ORDER;

export const RESTRICTED_EXAMPLES = ['Perfume', 'Drone', 'Bateria de lítio', 'Moto', 'Cigarro eletrônico'];

const CATEGORY_NAMES: Record<StoreCategoryId, string> = {
  moda: 'Moda',
  tecnologia: 'Tecnologia',
  hogar: 'Casa',
  marketplaces: 'Marketplaces',
  belleza: 'Beleza',
};

export const STORE_CATEGORIES: typeof es.STORE_CATEGORIES = es.STORE_CATEGORIES.map((category) => ({
  ...category,
  name: CATEGORY_NAMES[category.id],
}));

const STORE_TEXT: Record<string, Pick<Store, 'tagline' | 'about'>> = {
  amazon: {
    tagline: 'Um universo de categorias em um só lugar.',
    about: 'Explore itens para a casa, livros, acessórios, tecnologia e muitos outros produtos.',
  },
  shein: {
    tagline: 'Moda e acessórios para todos os estilos.',
    about: 'Roupas, bolsas e acessórios. Confira tamanhos, materiais e disponibilidade.',
  },
  temu: {
    tagline: 'Produtos para descobrir e comparar.',
    about: 'Itens para a casa, acessórios e compras do dia a dia. Confira cada descrição.',
  },
  walmart: {
    tagline: 'Compras para a casa e a família.',
    about: 'Itens para a casa, organização, acessórios e uso pessoal.',
  },
  'best-buy': {
    tagline: 'Tecnologia para trabalhar e se divertir.',
    about: 'Notebooks, celulares, tablets e consoles. Confirme a tarifa por unidade e os requisitos das baterias.',
  },
  nike: {
    tagline: 'Roupas e calçados para você se mover do seu jeito.',
    about: 'Calçados, roupas esportivas e acessórios de várias categorias.',
  },
  apple: {
    tagline: 'Aparelhos e acessórios.',
    about: 'Celulares, tablets, notebooks e acessórios. Alguns produtos têm tarifa por unidade.',
  },
  target: {
    tagline: 'Ideias para a casa e o seu dia a dia.',
    about: 'Decoração, itens para a casa, presentes e outras categorias.',
  },
  ebay: {
    tagline: 'Produtos novos e usados.',
    about: 'Compras de vários vendedores. Confira o estado, os detalhes e as condições.',
  },
  sephora: {
    tagline: 'Beleza e cuidados pessoais.',
    about: 'Maquiagem e cuidados pessoais. Perfumes e aerossóis só viajam por via marítima.',
  },
  'home-depot': {
    tagline: 'Ideias para projetos e reformas.',
    about: 'Ferramentas e reformas para a casa. Confira o tamanho e as restrições.',
  },
  adidas: {
    tagline: 'Esporte e estilo de vida.',
    about: 'Calçados, roupas esportivas e acessórios.',
  },
};

export const STORES: Array<Store> = es.STORES.map((store) => ({ ...store, ...STORE_TEXT[store.id] }));

const hello = (text: string) => `Olá Carinova 👋 ${text}`;

/** One message per place, as in Spanish: the keys are the same and each text is still unique. */
export const WA_MESSAGES: typeof es.WA_MESSAGES = {
  floating: {
    '/': hello('Quero informações para trazer minhas compras dos Estados Unidos.'),
    '/como-comprar': hello('Tenho uma dúvida sobre como funciona o serviço.'),
    '/servicios': hello('Quero saber qual serviço é melhor para mim.'),
    '/cotizador': hello('Preciso de ajuda para cotar meu envio.'),
    '/sucursales': hello('Tenho uma pergunta sobre as filiais de vocês.'),
    '/casillero-en-miami': hello('Quero abrir meu endereço nos EUA em Miami.'),
    '/tiendas': hello('Quero comprar em uma loja dos Estados Unidos e tenho uma pergunta.'),
    '/rastreo': hello('Quero saber onde está meu pacote.'),
    '/mi-cuenta': hello('Estou na minha conta e tenho uma pergunta.'),
    '/registro': hello('Estou criando minha conta e tenho uma dúvida.'),
    '/registro/confirmar': hello('Estou confirmando meu e-mail e tenho uma dúvida.'),
    '/ingresar': hello('Quero entrar na minha conta e tenho uma dúvida.'),
    '/empresas': hello('Tenho uma pergunta sobre o serviço de vocês para empresas.'),
    '/preguntas-frecuentes': hello('Tenho uma pergunta que não encontrei no site de vocês.'),
    '/articulos-prohibidos': hello('Tenho uma dúvida sobre os itens que vocês não podem trazer.'),
    '/nosotros': hello('Quero conhecer mais sobre a Carinova.'),
    '/terminos': hello('Tenho uma pergunta sobre os termos e condições de vocês.'),
    '/privacidad': hello('Tenho uma pergunta sobre meus dados pessoais.'),
  },
  floatingDefault: hello('Venho do site de vocês e tenho uma pergunta.'),
  footer: hello('Venho do site de vocês e quero informações.'),
  channels: hello('Encontrei vocês pelo site e quero conversar.'),

  /** "Contactar al equipo", under the conditions of the service on the home page. */
  homeConditions: hello('Li as condições do serviço na página inicial de vocês e tenho uma dúvida.'),

  trackItemCheck: (item: string) =>
    hello(`Estou na página de rastreamento de vocês e quero saber se podem trazer: ${item}`),
  trackItemCheckEmpty: hello('Estou na página de rastreamento de vocês e quero perguntar sobre um item: '),
  trackPackage: (code: string, reference: string) =>
    hello(`Meu Carinova ID é ${code}. Estou rastreando meu pacote ${reference} e tenho uma pergunta.`),
  trackMissing: (code: string, reference: string) =>
    hello(`Meu Carinova ID é ${code}. Não encontro o pacote ${reference} na minha conta.`),
  trackClosing: hello('Não encontro meu pacote no rastreamento. Podem me ajudar?'),

  howToClosing: hello('Já vi como funciona e quero ajuda com meu primeiro envio.'),
  example: (category: string) =>
    hello(`Vi o exemplo de vocês de ${category.toLowerCase()} e quero trazer algo parecido.`),

  services: {
    aereo: hello('Quero enviar por via aérea. Podem me dar mais informações?'),
    maritimo: hello('Quero enviar por via marítima. Podem me dar mais informações?'),
    encomiendas: hello('Vão me mandar uma encomenda dos Estados Unidos. Como faço?'),
    'compras-asistidas': hello('Quero que vocês comprem um produto para mim. Este é o link: '),
    'retiro-en-sucursal': hello('Quero saber como retirar meu pacote na filial.'),
    'entrega-a-domicilio': hello('Quero combinar uma entrega em domicílio. Qual é a cobertura e quanto custa?'),
  },
  servicesClosing: hello('Quero ajuda para escolher o serviço do meu envio.'),

  lockerClosing: hello('Quero saber mais sobre o endereço nos EUA em Miami antes de criar minha conta.'),
  storesShopper: (link: string) =>
    hello(
      `Estou na página de lojas de vocês e quero uma compra assistida. Produto: ${link} Podem me confirmar a disponibilidade, se ele pode entrar e o custo total?`
    ),
  storePageAssist: (store: string) =>
    hello(`Vi a loja ${store} na página de lojas de vocês e quero que comprem para mim. Este é o link do produto: `),
  storesClosing: hello('Quero ajuda para comprar em uma loja dos Estados Unidos.'),

  quote: (shipment: string, total: string) =>
    hello(`Fiz uma cotação na calculadora de vocês para ${shipment}: ${total}. Podem me ajudar a confirmar?`),
  quoteEmpty: hello('Estou na calculadora de cotação de vocês e não sei que dados colocar.'),
  quoteClosing: hello('Quero cotar um envio especial (muito grande, frágil ou com vários itens).'),

  branch: (city: string) => hello(`Tenho uma pergunta para a filial de ${city}.`),
  branchesClosing: hello('Quero saber em qual filial é melhor retirar.'),

  accountClosing: hello('Tenho uma dúvida antes de criar minha conta.'),

  signupAssist: hello('Prefiro criar minha conta pelo WhatsApp.'),
  signupHelp: hello('Tentei me cadastrar no site de vocês e preciso de ajuda.'),
  confirmHelp: hello('Não consegui confirmar meu e-mail para criar minha conta.'),
  accountExisting: hello('Já tenho meu Carinova ID e quero perguntar sobre meus pacotes.'),
  customer: (code: string) => hello(`Meu Carinova ID é ${code} e tenho uma pergunta.`),
  welcomeEmail: (code: string) =>
    hello(`Meu Carinova ID é ${code}. Recebi o e-mail de boas-vindas e tenho uma dúvida.`),

  signinHelp: hello('Não consigo entrar na minha conta. Podem me ajudar?'),
  signinError: hello('Tentei entrar na minha conta no site de vocês e deu um erro.'),
  accountPackages: (code: string) => hello(`Meu Carinova ID é ${code}. Quero perguntar sobre meus pacotes.`),
  accountPackage: (code: string, reference: string) =>
    hello(`Meu Carinova ID é ${code}. Quero perguntar sobre meu pacote ${reference}.`),
  accountInvoice: (code: string, number: string) =>
    hello(`Meu Carinova ID é ${code}. Quero pagar ou perguntar sobre a fatura ${number}.`),
  accountUpdate: (code: string) => hello(`Meu Carinova ID é ${code} e quero atualizar meus dados.`),
  accountError: hello('Tentei abrir minha conta no site de vocês e deu um erro.'),

  accountCompany: hello('Quero abrir um Carinova ID para minha empresa.'),
  businessHelp: hello('Tentei enviar o formulário para empresas e preciso de ajuda.'),
  businessClosing: hello('Quero falar com um consultor sobre os envios da minha empresa.'),

  faqClosing: hello('Não encontrei minha resposta nas perguntas frequentes de vocês.'),
  restricted: hello('Antes de comprar, quero saber se vocês podem trazer este produto: '),
  aboutClosing: hello('Conheci a Carinova pelo site e quero começar a enviar com vocês.'),
  careers: hello('Quero fazer parte da equipe da Carinova. Tenho interesse na área de: '),
  notFound: hello('Cheguei a uma página do site de vocês que não existe.'),
};
