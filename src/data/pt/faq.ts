/**
 * Brazilian Portuguese wording of ../faq.ts: the same questions, in the same groups and the same
 * order, with the same ones on the home page (src/i18n/translations.test.ts compares them). Prices,
 * times and lists come from the Portuguese data, which takes every fact from the Spanish data; the
 * names of the stages of a package come from the Portuguese dictionary.
 */
import { LOGIN_CODE_DIGITS, PACKAGE_STAGES } from '../account.ts';
import { CARINOVA_ID_EXAMPLE, sentence, type RestrictedItem } from '../carinova.ts';
import { FAQ_STORE_COUNT, type FaqGroup, type LinkTo } from '../faq.ts';
import { ui } from '../../i18n/ui/pt.ts';
import {
  CUBIC_CM_PER_CUBIC_FOOT,
  describeVolume,
  formatNumber,
  formatUSD,
  quoteByVolume,
  quoteByWeight,
} from '../../utils/rates.ts';
import { BRANCHES, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, STORES, describeHours } from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city).join(' e ');
const [hours] = BRANCHES[0].hours;
const receiving = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join(', ');
/** "Armas, Drones" → "armas; drones": the items carry commas of their own. */
const inline = (items: Array<RestrictedItem>) =>
  items.map((item) => item.name.charAt(0).toLowerCase() + item.name.slice(1)).join('; ');
const stages = PACKAGE_STAGES.map((stage) => ui.statuses.package[stage.id].name.toLowerCase()).join(', ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'Conta e Carinova ID',
    items: [
      {
        title: 'Como obtenho meu Carinova ID?',
        description: `Complete ${link('/registro', 'o cadastro')} com seu e-mail e seu telefone, e confirme seu e-mail com o link que enviamos. Ao confirmar, a plataforma gera automaticamente o seu Carinova ID único (por exemplo, ${CARINOVA_ID_EXAMPLE}).`,
        featured: 1,
      },
      {
        title: 'O que é o Carinova ID?',
        description:
          'É o identificador da sua conta. Há um por pessoa ou por empresa, e ele é o mesmo para todos os nossos serviços: aéreo, marítimo, encomendas e compras assistidas.',
      },
      {
        title: `O que é um endereço nos EUA em ${receiving.join(' e ')} e como funciona?`,
        description: `É um endereço nos Estados Unidos em seu nome: você o informa como endereço de entrega quando compra on-line, e o que chega ao nosso armazém nós trazemos para a Nicarágua. Na Carinova ele vem com a sua conta: ao criá-la, você recebe seu Carinova ID e seu endereço. ${link('/casillero-en-miami', 'Conheça o endereço nos EUA')}.`,
      },
      {
        title: 'Como entro na minha conta?',
        description: `Toque em ${link('/ingresar', 'Entrar')} e digite o e-mail com que você se cadastrou: enviamos um código de ${LOGIN_CODE_DIGITS} dígitos e você entra com ele, sem senha. Na ${link('/mi-cuenta', 'sua conta')} estão seu Carinova ID, seu endereço nos Estados Unidos, seus pacotes e seus pagamentos.`,
      },
      {
        title: 'Quanto custa criar minha conta?',
        description: `Criar sua conta é grátis: você só paga o envio de cada pacote. ${link('/registro', 'Crie a sua on-line')} e receba seu Carinova ID.`,
      },
      {
        title: 'Posso abrir uma conta para a minha empresa?',
        description: `Sim: há um Carinova ID por pessoa ou por empresa. Conte sobre a sua empresa no ${link('/empresas', 'formulário para empresas')} e entraremos em contato, ou escreva para nós pelo WhatsApp.`,
      },
      {
        title: 'Para onde envio minhas compras nos EUA?',
        description: `Sua conta mostra o endereço e as instruções de recebimento do nosso armazém em ${receiving.join(' e ')}. Use exatamente esses dados para que possamos identificar seu envio.${
          soonReception.length ? ` Em breve você também vai poder receber em ${soonReception.join(' e ')}.` : ''
        }`,
        featured: 2,
      },
    ],
  },
  {
    id: 'servicios',
    title: 'Serviços',
    items: [
      {
        title: 'Qual é a diferença entre aéreo e marítimo?',
        description: `O aéreo é mais rápido: ${air.transit}, a ${formatUSD(air.pricePerLb)} por libra. O marítimo é mais econômico: ${sea.transit}, a ${formatUSD(sea.pricePerLb)} por libra ou ${formatUSD(sea.pricePerCubicFoot)} por pé cúbico; é indicado para cargas grandes e compras planejadas. Os prazos contam ${RATES.transitFrom}.`,
      },
      {
        title: 'O que é uma encomenda?',
        description:
          'Qualquer pacote que chega ao nosso armazém em seu nome: suas compras on-line ou a caixa que sua família manda dos Estados Unidos. Viaja por via aérea ou marítima, como você preferir.',
      },
      {
        title: 'Vocês podem comprar um produto para mim?',
        description: `Sim. Escolha a loja e compartilhe o link conosco. A compra assistida exige a confirmação da disponibilidade, da admissibilidade e dos custos do produto, do serviço e do transporte. ${link('/#personal-shopper', 'Prepare sua solicitação')}.`,
        featured: 8,
      },
      {
        title: 'Em quais lojas posso comprar?',
        description: `Em qualquer loja on-line que entregue dentro dos Estados Unidos: ${stores} e muitas outras.`,
      },
      {
        title: 'Como comprar na Amazon, SHEIN ou Temu a partir da Nicarágua?',
        description: `Crie sua conta, use o endereço da sua conta como endereço de entrega ao pagar na loja e nós trazemos seu pacote para a Nicarágua, por via aérea ou marítima. Se preferir que a gente compre para você, peça uma compra assistida. ${link('/tiendas', 'Ver lojas')}.`,
      },
    ],
  },
  {
    id: 'tarifas',
    title: 'Tarifas e pagamentos',
    items: [
      {
        title: 'Quanto custa enviar um pacote dos Estados Unidos para a Nicarágua?',
        description: `Por via aérea, ${formatUSD(air.pricePerLb)} por libra; por via marítima, ${formatUSD(sea.pricePerLb)} por libra ou ${formatUSD(sea.pricePerCubicFoot)} por pé cúbico. Por exemplo, um pacote de 5 libras por via aérea custa ${formatUSD(quoteByWeight(5, air.pricePerLb).total)}. ${link('/cotizador', 'Calcule seu envio')}.`,
      },
      {
        title: 'Como a tarifa é calculada?',
        description: `Aéreo: ${formatUSD(air.pricePerLb)} por libra, com tarifas por unidade para eletrônicos específicos. Marítimo: ${formatUSD(sea.pricePerLb)} por libra ou ${formatUSD(sea.pricePerCubicFoot)} por pé cúbico. A base de cobrança é definida de acordo com a mercadoria e as condições do serviço. Faça a conta na nossa ${link('/cotizador', 'calculadora')}.`,
        featured: 4,
      },
      {
        title: 'Como se calcula o pé cúbico?',
        description: `Multiplique o comprimento, a largura e a altura da caixa em polegadas e divida o resultado por 1,728; se medir em centímetros, divida por ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}. Por exemplo: ${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit }),
          'pt'
        )}.`,
      },
      {
        title: 'Quais eletrônicos têm tarifa por unidade?',
        description: `Nos envios aéreos: ${devices}. A tarifa por unidade não se soma à tarifa por libra.`,
      },
      {
        title: 'Inclui seguro e impostos?',
        description:
          'As tarifas incluem seguro e impostos quando se aplicam ao envio. A cobertura, os limites, as exclusões e as cobranças adicionais estão sujeitos às condições do serviço. Confirme os termos aplicáveis antes de contratar.',
        featured: 5,
      },
      {
        title: 'O preço estimado é o que vou pagar?',
        description:
          'Não necessariamente. A calculadora mostra uma tarifa de referência, sem incluir a compra do produto nem o serviço de entrega em domicílio. O valor final é confirmado depois da conferência das dimensões, do peso, do conteúdo, da modalidade e das condições específicas.',
        featured: 9,
      },
      {
        title: 'Quando e como eu pago?',
        description: `Você paga o envio ao retirar seu pacote ou ao combinar a entrega. Escreva para nós para saber as formas de pagamento disponíveis. Na ${link('/mi-cuenta', 'sua conta')} você vê suas faturas e os pagamentos que confirmamos.`,
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Prazos e rastreamento',
    items: [
      {
        title: `Quanto tempo leva um envio de ${receiving.join(' e ')} para a Nicarágua?`,
        description: `Por via aérea, ${air.transit}; por via marítima, ${sea.transit}. Os prazos contam ${RATES.transitFrom} e podem variar conforme o trânsito, a alfândega e o destino.`,
      },
      {
        title: 'A partir de quando os prazos começam a contar?',
        description: `A partir do recebimento físico do pacote, não da data da compra. Aéreo: ${air.transit}. Marítimo: ${sea.transit}. São estimativas sujeitas ao trânsito, à alfândega e ao destino.`,
        featured: 3,
      },
      {
        title: 'Como rastreio vários pacotes com um mesmo Carinova ID?',
        description: `O Carinova ID corresponde à sua conta. Ao ${link('/ingresar', 'entrar')}, você vê cada pacote com sua referência e seus status de rastreamento. Por segurança, o número da conta sozinho não autoriza ninguém a consultar dados privados.`,
        featured: 10,
      },
      {
        title: 'Quais status meu pacote pode ter?',
        description: `Em ordem: ${stages}. Cada mudança fica registrada no histórico do pacote, na ${link('/mi-cuenta', 'sua conta')}.`,
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'Itens restritos',
    items: [
      {
        title: 'Quais itens posso trazer?',
        description: `Depende do tipo de mercadoria, dos seus componentes e das regras de transporte. Não recebemos nem transportamos: ${inline(RESTRICTED_ITEMS.prohibited.items)}. Ainda não temos autorização para trazer: ${inline(RESTRICTED_ITEMS.notYet.items)}. ${link('/articulos-prohibidos', 'Confira as listas completas')} e, se o seu item não estiver nelas, pergunte para nós antes de comprar.`,
        featured: 6,
      },
      {
        title: 'Posso trazer perfumes ou aerossóis?',
        description: `Sim, por via marítima: ${inline(RESTRICTED_ITEMS.seaOnly.items)} não entram por via aérea.`,
      },
      {
        title: 'Posso trazer um carro ou uma moto?',
        description: `Ainda não: por enquanto não temos autorização para trazer ${inline(RESTRICTED_ITEMS.notYet.items)}.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Retirada e entrega',
    items: [
      {
        title: 'Onde retiro meu pacote?',
        description: `${sentence(`Nas nossas filiais de ${cities}, de ${describeHours(hours)}`)} ${link('/sucursales', 'Ver endereços e horários')}.`,
      },
      // One per branch outside the capital: people ask about their own city.
      ...BRANCHES.slice(1).map((branch) => ({
        title: `Vocês fazem envios para ${branch.city}?`,
        description: `Sim: temos uma filial de retirada em ${branch.city}, além de ${BRANCHES[0].city}. ${link(`/sucursales#${branch.id}`, `Ver a filial de ${branch.city}`)}.`,
      })),
      {
        title: 'Vocês fazem entregas em domicílio?',
        description:
          'Fazemos entregas em todo o país, sujeitas a agendamento e cobertura. A entrega em domicílio tem um custo adicional conforme o destino e as condições operacionais.',
        featured: 7,
      },
      {
        title: 'Outra pessoa pode retirar meu pacote?',
        description:
          'Sim. Avise-nos pelo WhatsApp antes da retirada, com o nome da pessoa autorizada; ela precisará apresentar o documento de identidade.',
      },
      {
        title: 'Por quanto tempo vocês guardam meu pacote?',
        description:
          'Recomendamos retirá-lo assim que estiver disponível para entrega. Pacotes que não são retirados a tempo podem gerar taxas de armazenagem, conforme os nossos termos.',
      },
    ],
  },
];
