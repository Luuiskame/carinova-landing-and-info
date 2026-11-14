/**
 * Brazilian Portuguese wording of ../services.ts: the same exports, in Portuguese. Ids, icons,
 * availability, links and the numbers of the worked examples are taken from the Spanish file; prices
 * and times are worked out from the same rates. Only the words are written here, keyed by id, so
 * adding a service or an example in Spanish without its Portuguese text fails loudly.
 */
import * as es from '../services.ts';
import type { ProcessStep, Service, ServiceAxis, ServiceAxisId, ShoppingExample } from '../services.ts';
import { sentence } from '../carinova.ts';
import { formatUSD } from '../../utils/rates.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours } from './carinova.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;

/** "a, b e c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** "celulares US$30, tablets US$40, …" */
const devicePrices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');

/** The text of an id, or an error that names what is missing. */
const textOf = <T>(table: Record<string, T>, id: string, kind: string): T => {
  const text = table[id];
  if (!text) throw new Error(`The ${kind} "${id}" has no Portuguese text (src/data/pt/services.ts).`);
  return text;
};

const AXIS_TEXT: Record<ServiceAxisId, Pick<ServiceAxis, 'name' | 'question' | 'rule'>> = {
  transporte: {
    name: 'Modalidade de transporte',
    question: 'Como o seu pacote viaja?',
    rule: 'Dois caminhos, um só destino: rapidez ou economia, você escolhe.',
  },
  solucion: {
    name: 'Solução comercial',
    question: 'Quem faz a compra?',
    rule: 'Você compra ou sua família envia, ou nós compramos para você.',
  },
  distribucion: {
    name: 'Distribuição final',
    question: 'Como você recebe na Nicarágua?',
    rule: 'Nas nossas filiais ou na sua casa, com um custo adicional.',
  },
};

export const SERVICE_AXES: Array<ServiceAxis> = es.SERVICE_AXES.map((axis) => ({ ...axis, ...AXIS_TEXT[axis.id] }));

interface ServiceText {
  name: string;
  summary: string;
  description: string;
  facts: Array<string>;
  /** Text of the service's link, when it has one. */
  link?: string;
  whatsappText?: string;
}

const SERVICE_TEXT: Record<string, ServiceText> = {
  aereo: {
    name: 'Aéreo',
    summary: `${formatUSD(air.pricePerLb)} por libra · ${air.transit}`,
    description:
      'Pensado para o que você quer receber logo. Usa uma tarifa base por libra e, para determinados eletrônicos, uma tarifa fixa por unidade.',
    facts: [
      `Previsão de entrega: ${air.transit}, ${RATES.transitFrom}.`,
      `Tarifa base de ${formatUSD(air.pricePerLb)} por libra.`,
      `Eletrônicos por unidade: ${devicePrices}.`,
      `Não viajam de avião, mas viajam por via marítima: ${listOf(RESTRICTED_ITEMS.seaOnly.items.map((item) => lowercaseFirst(item.name)))}.`,
      'A tarifa aplicável é confirmada de acordo com o tipo de mercadoria, a embalagem e as condições do serviço.',
    ],
    link: 'Calcular envio aéreo',
  },
  maritimo: {
    name: 'Marítimo',
    summary: `${formatUSD(sea.pricePerLb)} por libra ou ${formatUSD(sea.pricePerCubicFoot)} por pé³ · ${sea.transit}`,
    description:
      'Ideal para cargas grandes, compras planejadas e envios em que o custo vem em primeiro lugar. A cotação é feita por peso ou por volume.',
    facts: [
      `Previsão de entrega: ${sea.transit}, ${RATES.transitFrom}.`,
      `Tarifa base pelo peso: ${formatUSD(sea.pricePerLb)} por libra.`,
      `Tarifa pelo volume: ${formatUSD(sea.pricePerCubicFoot)} por pé cúbico.`,
      'A base por peso ou por volume é definida de acordo com a carga, a embalagem e as condições do serviço.',
    ],
    link: 'Calcular envio marítimo',
  },
  encomiendas: {
    name: 'Encomendas',
    summary: 'O que você ou sua família mandam para o nosso armazém.',
    description:
      'Trazemos qualquer pacote que chegue ao nosso armazém em seu nome: suas compras on-line ou a caixa que sua família manda dos Estados Unidos.',
    facts: [
      'Compre em qualquer loja que entregue dentro dos Estados Unidos.',
      'Sua família ou seus amigos também podem mandar uma caixa para o seu endereço em Miami.',
      'Viaja por via aérea ou marítima, como você preferir.',
    ],
    link: 'Ver como funciona',
  },
  'compras-asistidas': {
    name: 'Compras assistidas',
    summary: 'Você escolhe o produto e nós fazemos a compra para você.',
    description: 'Escolha a loja e compartilhe conosco o link do produto: nós fazemos a compra para você.',
    facts: [
      'Antes de comprar, confirmamos a disponibilidade, se o item pode entrar e o custo total.',
      'O custo da compra, os impostos e o frete são confirmados antes de realizarmos a operação.',
      'Chega ao nosso armazém e viaja como qualquer encomenda.',
    ],
    link: 'Preparar minha solicitação',
    whatsappText: 'Pedir uma compra assistida',
  },
  'retiro-en-sucursal': {
    name: 'Retirada na filial',
    summary: `${listOf(cities)} · ${branchHours.days.toLowerCase()}`,
    description: 'Quando o seu pacote estiver disponível para entrega, você o retira na filial mais perto de você.',
    facts: [`Filiais em ${listOf(cities)}.`, sentence(`Abrimos de ${describeHours(branchHours)}`)],
    link: 'Ver filiais',
  },
  'entrega-a-domicilio': {
    name: 'Entrega em domicílio',
    summary: 'Para todo o país, com um custo adicional.',
    description:
      'Fazemos entregas em todo o país, sujeitas a agendamento e cobertura. A entrega em domicílio tem um custo adicional conforme o destino e as condições operacionais.',
    facts: ['O endereço, a cobertura e o custo são confirmados ao combinar a entrega.'],
    whatsappText: 'Perguntar sobre entrega em domicílio',
  },
};

export const SERVICES: Array<Service> = es.SERVICES.map((service) => {
  const text = textOf(SERVICE_TEXT, service.id, 'service');
  return {
    ...service,
    name: text.name,
    summary: text.summary,
    description: text.description,
    facts: text.facts,
    link: service.link && { ...service.link, text: text.link ?? service.link.text },
    whatsappText: service.whatsappText && text.whatsappText,
  };
});

export const servicesOf = (axis: ServiceAxisId) => SERVICES.filter((service) => service.axis === axis);

const receivingNow = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const receivingSoon = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
/** " Los Angeles, em breve." or nothing, once every warehouse is open. */
const soonNote = receivingSoon.length ? ` ${listOf(receivingSoon)}, em breve.` : '';

/** In the order of ../services.ts: the steps have no id. */
const STEP_TEXT: Array<Pick<ProcessStep, 'title' | 'summary' | 'details'> & { link: string }> = [
  {
    title: 'Crie sua conta',
    summary: `Confirme seu e-mail e receba seu Carinova ID junto com seu endereço nos EUA: o endereço de recebimento em ${listOf(receivingNow)}.`,
    details: [
      'Você preenche um formulário curto e confirma seu e-mail com o link que enviamos.',
      'Ao confirmar, você vê seu Carinova ID e seu endereço nos Estados Unidos, e também os enviamos por e-mail.',
      'Depois, você entra com seu e-mail e um código de uso único: não há senha para lembrar.',
    ],
    link: CTA.signup.text,
  },
  {
    title: `Compre e envie para ${listOf(receivingNow)}`,
    summary: 'Use o endereço da sua conta ao comprar. Confira antes se o seu item é permitido.',
    details: [
      `Envie sua compra para o endereço do nosso armazém em ${listOf(receivingNow)} indicado na sua conta.${soonNote}`,
      'Ao pagar na loja, escreva seu nome e seu sobrenome exatamente como aparecem no seu endereço.',
      'Antes de comprar, confira se o item pode entrar: há itens proibidos, outros que ainda não temos autorização para trazer e outros que só viajam por via marítima.',
      'Prefere que a gente compre para você? Peça uma compra assistida.',
    ],
    link: 'Verificar um item',
  },
  {
    title: 'Receba na Nicarágua',
    summary: `Retire em ${cities.join(' ou ')}. Entregas em todo o país com um custo adicional.`,
    details: [
      `Trazemos por via aérea em ${air.transit} ou por via marítima em ${sea.transit}, ${RATES.transitFrom}.`,
      'Você acompanha cada etapa pela sua conta, com a referência do seu pacote.',
      sentence(`Nossas filiais abrem de ${describeHours(branchHours)}`),
      'A entrega em domicílio é combinada conforme o destino e a cobertura.',
    ],
    link: 'Ver filiais',
  },
];

export const PROCESS_STEPS: Array<ProcessStep> = es.PROCESS_STEPS.map((step, index) => {
  const text = STEP_TEXT[index];
  if (!text)
    throw new Error(`Step ${index + 1} of "¿Cómo funciona?" has no Portuguese text (src/data/pt/services.ts).`);
  return {
    ...step,
    title: text.title,
    summary: text.summary,
    details: text.details,
    link: step.link && { ...step.link, text: text.link },
  };
});

const ACCOUNT_TEXT: Record<string, { title: string; summary: string }> = {
  'carinova-id': { title: 'Carinova ID', summary: 'Um por pessoa ou empresa, para todos os seus envios.' },
  direccion: { title: 'Seu endereço nos Estados Unidos', summary: `${listOf(receivingNow)}.${soonNote}` },
  paquetes: {
    title: 'Seus pacotes',
    summary: 'O que recebemos no armazém e o que já enviamos, com o status de cada um.',
  },
  pagos: { title: 'Seus pagamentos', summary: 'Suas faturas e os pagamentos que confirmamos.' },
};

export const ACCOUNT_PARTS: typeof es.ACCOUNT_PARTS = es.ACCOUNT_PARTS.map((part) => ({
  ...part,
  ...textOf(ACCOUNT_TEXT, part.id, 'account part'),
}));

const EXAMPLE_TEXT: Record<string, Pick<ShoppingExample, 'category' | 'item' | 'source'>> = {
  ropa: {
    category: 'Roupas e calçados',
    item: 'Duas blusas, uma calça e um tênis: 3 lb',
    source: 'Na SHEIN e na Nike',
  },
  celulares: { category: 'Celulares e tablets', item: 'Um celular novo', source: 'Na Amazon' },
  laptops: { category: 'Notebooks e consoles', item: 'Um notebook', source: 'Na Best Buy' },
  hogar: { category: 'Casa e cozinha', item: 'Um jogo de panelas de 18 lb', source: 'No Walmart' },
  muebles: {
    category: 'Móveis',
    item: 'Uma cadeira de escritório, em uma caixa de 28 × 26 × 14 polegadas',
    source: 'Na Home Depot',
  },
  encomienda: {
    category: 'Encomendas familiares',
    item: 'Uma caixa de 8 lb com roupas e presentes',
    source: 'Da sua família nos Estados Unidos',
  },
};

export const SHOPPING_EXAMPLES: Array<ShoppingExample> = es.SHOPPING_EXAMPLES.map((example) => ({
  ...example,
  ...textOf(EXAMPLE_TEXT, example.id, 'example'),
}));

export const quoteExample = es.exampleQuoter(
  RATES,
  {
    airWeight: 'Aéreo, por libra',
    seaWeight: 'Marítimo, por peso',
    seaVolume: 'Marítimo, por volume',
    unit: 'Aéreo, tarifa por unidade',
    unitNote: 'A tarifa por unidade não se soma à tarifa por libra.',
  },
  'pt'
);

export const FORMULA_EXAMPLE: typeof es.FORMULA_EXAMPLE = { ...es.FORMULA_EXAMPLE, item: 'Um palete de carga' };
