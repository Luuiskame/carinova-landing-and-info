/**
 * What the pages and the components say, in Brazilian Portuguese. Same shape as ./es.ts (`UI`): every
 * entry of the Spanish dictionary, translated. The customer is addressed as "você".
 */
import { LOGIN_CODE_DIGITS, LOGIN_CODE_MINUTES, SESSION_DAYS } from '../../data/account.ts';
import { CONTACT, sentence } from '../../data/carinova.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, describeHours } from '../../data/pt/carinova.ts';
import { CONFIRM_LINK_HOURS } from '../../data/signup.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, formatNumber, formatUSD } from '../../utils/rates.ts';
import type { UI } from './es.ts';
import { landing } from './landing/pt.ts';

// The facts the sentences below are written around, in this language.
const { air, sea } = RATES;
const cityNames = BRANCHES.map((branch) => branch.city);
const cities = cityNames;
/** The city Carinova was born in, as this language writes it. */
const bluefields = BRANCHES.find((branch) => branch.id === 'bluefields')?.city ?? 'Bluefields';
const [hours] = BRANCHES[0].hours;
/** The warehouse that receives packages today (the one that is open). */
const [warehouse] = RECEPTION_POINTS.filter((point) => point.available);
/** Whether every branch opens at the same times: then the hours can be said once. */
const sameHours = BRANCHES.every((branch) => JSON.stringify(branch.hours) === JSON.stringify(BRANCHES[0].hours));

export const ui: UI = {
  // components/carinova/AccountPanel.astro
  accountPanel: {
    loading: 'Abrindo sua conta…',
    noscript: 'Para ver sua conta, você precisa ativar o JavaScript no seu navegador.',
    eyebrow: 'Minha conta',
    idLabel: 'Seu Carinova ID',
    idNote: 'Tenha-o em mãos quando nos escrever ou for retirar seus pacotes.',
    sections: 'Seções da sua conta',
    packagesIntro: 'O que recebemos no nosso armazém e o que já enviamos, com o status de cada um.',
    filterLabel: 'Filtrar pacotes',
    filters: { all: 'Todos', warehouse: 'No armazém', shipped: 'Despachados', delivered: 'Entregues' },
    packagesEmpty:
      'Ainda não recebemos pacotes em seu nome. Quando o primeiro chegar ao nosso armazém, você vai vê-lo aqui, com o status.',
    packagesNone: 'Você não tem pacotes neste grupo.',
    packagesAsk: 'Perguntar sobre meus pacotes',
    history: 'Ver histórico',
    packageAsk: 'Perguntar sobre este pacote',
    paymentsIntro: 'Suas faturas e os pagamentos que confirmamos.',
    invoicesEmpty: 'Você ainda não tem faturas. Quando emitirmos a primeira, você vai vê-la aqui.',
    payments: 'Pagamentos',
    invoiceAsk: 'Pagar ou perguntar sobre esta fatura',
    paymentsNote:
      'Para pagar ou nos avisar de um pagamento, escreva para nós com o número da fatura. Um pagamento aparece como confirmado quando nossa equipe o verifica.',
    activityError: 'Não conseguimos carregar seus pacotes e seus pagamentos.',
    retry: 'Tentar de novo',
    detailsTitle: 'Meus dados',
    detailsIntro: 'Você criou sua conta com estes dados.',
    name: 'Nome',
    email: 'E-mail',
    phone: 'Telefone',
    address: 'Endereço',
    since: 'Cliente desde',
    changed: 'Algo mudou?',
    update: 'Pedir para atualizar meus dados',
    nextTitle: 'O que você quer fazer?',
    howItWorks: 'Ver como funciona',
    restricted: 'Ver o que pode entrar',
    signOut: 'Sair',
    signingOut: 'Saindo…',
    errorTitle: 'Não conseguimos abrir sua conta',
    errorText: 'Verifique sua conexão e tente de novo. Se continuar falhando, escreva para nós no WhatsApp.',
    script: {
      hello: 'Olá, {name}',
      documentTitle: 'Minha conta {code} | Carinova',
      received: 'Recebido no armazém',
      warehouse: 'Armazém',
      weight: 'Peso',
      pounds: '{weight} lb',
      pieces: 'Volumes',
      pickup: 'Retirada em',
      delivery: 'Entrega',
      homeDelivery: 'Em domicílio',
      store: 'Loja',
      carrier: 'Chegou com',
      issued: 'Emitida em {date}',
      due: 'vence em {date}',
      total: 'Total',
      paid: 'Pago',
      balance: 'Saldo',
      forPackage: '{description} ({reference})',
      balanceDue: 'Saldo a pagar: {amount}',
      inReview: 'Pagamentos em análise: {amount}',
      nothingDue: 'Você não tem saldo a pagar.',
    },
  },

  // components/carinova/Branches.astro
  branches: {
    tagline: 'Filiais',
    title: `Retire em ${cities.join(' ou ')}`,
    directions: 'Como chegar',
    branch: (city: string) => `(filial de ${city})`,
  },

  // components/carinova/BusinessForm.astro
  businessForm: {
    title: 'Fale sobre a sua empresa',
    intro: 'Preencha estes dados e entraremos em contato.',
    noscript:
      'Para enviar o formulário, você precisa ativar o JavaScript no seu navegador. Você também pode nos escrever pelo WhatsApp.',
    company: 'Nome da empresa',
    contactName: 'Seu nome',
    email: 'E-mail',
    phone: 'Telefone',
    phoneHint: 'De preferência, o número que você usa no WhatsApp.',
    country: 'País',
    city: 'Cidade',
    volume: 'Volume estimado',
    optional: '(opcional)',
    choose: 'Escolha uma opção',
    message: 'Do que a sua empresa precisa?',
    messageHint: 'O que você traz, de onde e com que frequência.',
    honeypot: 'Deixe este campo vazio',
    submit: 'Enviar solicitação',
    sending: 'Enviando…',
    sentTitle: 'Recebemos sua solicitação',
    sentText:
      'Obrigado. Nossa equipe vai analisá-la e entrará em contato pelo e-mail ou pelo telefone que você nos informou.',
    home: 'Voltar ao início',
    privacyNote: [
      'Ao enviar, usamos estes dados para entrar em contato com você, como explica a nossa ',
      'Política de privacidade',
      '.',
    ],
    messages: {
      missing: 'Preencha este campo.',
      unavailable: 'O formulário não está disponível no momento. Escreva para nós no WhatsApp e atenderemos você.',
      busy: 'Recebemos tentativas demais seguidas. Aguarde um minuto e tente de novo.',
      failed:
        'Não conseguimos enviar sua solicitação. Verifique sua conexão e tente de novo, ou escreva para nós no WhatsApp.',
      oneError: 'Há um campo para corrigir.',
      manyErrors: 'Há {count} campos para corrigir.',
    },
  },

  // components/carinova/QuoteCalculator.astro
  quoteCalculator: {
    title: 'Monte sua estimativa',
    badge: 'Sem cadastro',
    mode: 'Como você quer trazer?',
    basis: 'Forma de cobrança',
    basisHint: 'Escolha uma única base de cálculo: o peso, o volume e a tarifa por unidade não se somam.',
    byWeight: 'Pelo peso (libra)',
    byVolume: 'Pelo volume (pé cúbico)',
    perUnit: (name: string) => `${name} (por unidade)`,
    weightEach: 'Peso de cada pacote (lb)',
    packages: 'Quantidade de pacotes',
    kilos: 'Você tem o peso em quilos? 1 kg = 2.2 lb.',
    dimensions: ['Comprimento', 'Largura', 'Altura'],
    unit: 'Medidas em',
    units: { cm: 'Centímetros', pulg: 'Polegadas' },
    pieces: 'Quantidade de volumes',
    quantity: 'Quantidade de unidades',
    estimate: 'Estimativa da tarifa base',
    what: 'O que você está cotando?',
    send: 'Enviar minha cotação pelo WhatsApp',
    reset: 'Limpar',
    estimateNote: 'Cálculo de referência com as tarifas base em vigor.',
    footnote:
      'Estimativa de referência, não uma cotação contratual. O total final depende da conferência do peso, das dimensões, do conteúdo, das tarifas aplicáveis e de eventuais cobranças adicionais. Não inclui o custo dos produtos nem a entrega em domicílio.',
    script: {
      delivery: 'Previsão de entrega: {transit}, {from}.',
      explainWeight:
        'Peso de cada pacote multiplicado pela quantidade, com um mínimo faturável de {minimum} lb por envio. O peso e a base aplicável são validados no recebimento.',
      explainVolume:
        'Comprimento × largura × altura, convertido em pés cúbicos (1 pé = 30.48 cm = 12 polegadas), sem mínimos nem arredondamentos.',
      explainUnit: 'Tarifa aérea por unidade do item escolhido. A tarifa por libra não é somada a ela.',
      comparison: 'Só para comparar: no envio {mode}, o mesmo peso custaria {total} ({transit}).',
      check: 'Confira os dados',
      checkHint: 'Use valores maiores que zero.',
      needData: 'Informe o peso, as medidas ou a quantidade para ver a estimativa.',
      weightShipment: 'um envio {mode} de {weight} lb',
      weightShipmentMany: 'um envio {mode} de {count} pacotes de {weight} lb cada',
      volumeShipment: 'um envio {mode} de {count} volume(s) de {measurements} {unit}',
      unitShipment: '{units} por envio {mode}',
      unitCm: 'cm',
      unitIn: 'polegadas',
      announce: 'Estimativa: {total}',
    },
  },

  // components/carinova/RateCards.astro
  rateCards: {
    tagline: 'Preços',
    title: 'Dois caminhos. Um só destino.',
    subtitle:
      'As tarifas incluem seguro e impostos quando se aplicam ao envio. Os prazos contam a partir do recebimento físico do seu pacote.',
    cities: BRANCHES.map((branch) => branch.city).join(' e '),
    perPound: 'por libra',
    perCubicFoot: 'por pé³',
    airFacts: ['Pensado para o que você quer receber logo.', 'Alguns eletrônicos têm tarifa fixa por unidade.'],
    seaFacts: [
      'Ideal para cargas grandes e compras planejadas.',
      'A base por peso ou por volume é definida de acordo com a carga, a embalagem e as condições do serviço.',
    ],
    calculate: (name: string) => `Calcular envio ${name.toLowerCase()}`,
    calculateUnits: 'Calcular por unidade',
    electronicsNote: 'Tarifa por unidade nos envios aéreos. Não se soma à tarifa por libra.',
    pickup: 'Retirada na filial:',
    homeDelivery: 'Entrega em domicílio',
    howTitle: 'Como calculamos',
    howIntro: 'Uma base de cálculo por vez: o peso, o volume e a tarifa por unidade não se somam.',
    byPound: {
      title: 'Por libra',
      applies: 'Aéreo e marítimo',
      rule: 'Peso em libras × tarifa por libra, sem mínimos nem arredondamentos. O peso é validado no recebimento.',
    },
    byCubicFoot: {
      title: 'Por pé cúbico',
      applies: 'Só marítimo',
      rule: `Comprimento × largura × altura da caixa ÷ 1,728 se você medir em polegadas, ou ÷ ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)} se medir em centímetros = pés cúbicos; × ${formatUSD(sea.pricePerCubicFoot)}.`,
      link: 'Experimente na calculadora',
    },
    byUnit: {
      title: 'Por unidade',
      applies: 'Eletrônicos, por via aérea',
      rule: 'Quantidade × tarifa do aparelho. A tarifa por libra não é somada a ela.',
    },
  },

  // components/carinova/ServiceBadge.astro
  serviceBadge: { soon: 'Em breve', extra: 'Custo adicional' },

  // components/carinova/ShippingModes.astro
  shippingModes: {
    eyebrow: 'Envio aéreo e marítimo para a Nicarágua',
    title: ['Duas modalidades.', 'Um destino.'],
    intro:
      'Escolha como você quer receber. Mais velocidade quando você precisa, mais economia quando dá para planejar. Compare antes de decidir.',
    air: {
      tag: 'Para chegar antes',
      overline: 'Envio aéreo',
      title: 'Quando o tempo importa.',
      text: 'Ideal para compras e encomendas que você quer receber logo.',
    },
    sea: {
      tag: 'Para planejar melhor',
      overline: 'Envio marítimo',
      title: 'Mais espaço para os seus planos.',
      text: 'Para compras planejadas e cargas maiores.',
    },
    baseRate: 'Preço base',
    perPound: '/lb',
    orPerCubicFoot: (price: string) => `ou ${price} por pé cúbico`,
    electronics: 'Eletrônicos: tarifa por unidade',
    delivery: 'Previsão de entrega',
    details: (name: string) => `Ver os detalhes do envio ${name.toLowerCase()}`,
    important: 'Atenção:',
  },

  // components/carinova/SigninDialog.astro
  signinDialog: { label: 'Entre na sua conta', close: 'Fechar' },

  // components/carinova/SigninForm.astro
  signinForm: {
    title: 'Entre com seu e-mail',
    intro: `Enviamos um código de ${LOGIN_CODE_DIGITS} dígitos para o seu e-mail. Você não precisa de senha.`,
    noscript: 'Para entrar, você precisa ativar o JavaScript no seu navegador.',
    email: 'E-mail',
    emailHint: 'O e-mail com que você criou sua conta.',
    send: 'Enviar um código',
    sending: 'Enviando…',
    noAccount: 'Ainda não tem conta?',
    codeTitle: 'Digite seu código',
    codeSent: [
      'Se ',
      ` tiver uma conta, enviamos para ele um código de ${LOGIN_CODE_DIGITS} dígitos. Ele expira em ${LOGIN_CODE_MINUTES} minutos.`,
    ],
    code: `Código (${LOGIN_CODE_DIGITS} dígitos)`,
    enter: CTA.signin.text,
    entering: 'Entrando…',
    notes: [
      'Pode levar alguns minutos para chegar. Se não encontrar, confira a pasta de spam ou de lixo eletrônico.',
      'Nunca vamos pedir este código pelo WhatsApp nem por telefone.',
    ],
    notArriving: 'Se não chegar, talvez esse e-mail não tenha uma conta.',
    openYours: 'Crie a sua',
    resend: 'Enviar outro código',
    change: 'Usar outro e-mail',
    signedIn: 'Você já entrou neste navegador.',
    messages: {
      emailMissing: 'Digite seu e-mail.',
      codeMissing: `Digite o código de ${LOGIN_CODE_DIGITS} dígitos.`,
      codeInvalid: 'O código não está correto ou já expirou. Confira ou peça outro.',
      resendIn: 'Enviar outro código ({seconds} s)',
      resent: 'Pronto: se o e-mail tiver uma conta, enviamos outro código para ele. O anterior não vale mais.',
      unavailable: 'O acesso não está disponível no momento. Escreva para nós no WhatsApp e ajudaremos você.',
      busy: 'Recebemos tentativas demais seguidas. Aguarde um minuto e tente de novo.',
      failed: 'Não conseguimos nos conectar. Verifique sua conexão e tente de novo.',
    },
  },

  // components/carinova/SignupConfirm.astro
  signupConfirm: {
    readyTitle: 'Confirme seu e-mail',
    readyText:
      'Só mais um passo: confirme seu e-mail para criar sua conta e ver seu Carinova ID e seu endereço nos Estados Unidos.',
    confirm: 'Confirmar e criar minha conta',
    confirming: 'Criando sua conta…',
    noscript: 'Para confirmar seu e-mail, você precisa ativar o JavaScript no seu navegador.',
    doneTitle: 'Sua conta está pronta!',
    doneIntro: 'Este é o seu Carinova ID. Guarde-o: é com ele que identificamos sua conta.',
    emailed: 'Também enviamos estes dados para o seu e-mail.',
    beforeTitle: 'Antes de você comprar',
    beforeText: 'Veja o que não podemos trazer.',
    nextTitle: 'E agora?',
    nextText: 'Faça a cotação do seu primeiro envio ou veja como funciona, com exemplos.',
    howToBuy: 'Ver como funciona',
    signedIn:
      'Você já entrou neste navegador: na sua conta você sempre encontra seu Carinova ID, seu endereço, seus pacotes e seus pagamentos.',
    signedOut: 'Para ver estes dados quando quiser, entre na sua conta com seu e-mail.',
    invalidTitle: 'Este link não é válido',
    invalidText:
      'Talvez esteja incompleto. Abra-o novamente a partir do e-mail que enviamos ou faça o cadastro de novo.',
    expiredTitle: 'Este link expirou',
    expiredText: `Os links de confirmação valem por ${CONFIRM_LINK_HOURS} horas. Cadastre-se de novo e enviaremos outro.`,
    signupAgain: 'Fazer o cadastro de novo',
    errorTitle: 'Não conseguimos criar sua conta',
    errorText: 'O problema é nosso, não seu. Tente de novo e, se continuar falhando, escreva para nós no WhatsApp.',
    retry: 'Tentar de novo',
    retrying: 'Tentando…',
    existingTitle: 'Você já tem uma conta',
    existingIntro: 'Este e-mail já tem uma conta na Carinova. Este é o seu Carinova ID:',
    documentTitle: 'Sua conta {code} | Carinova',
  },

  // components/carinova/SignupForm.astro
  signupForm: {
    signedIn: 'Você já entrou na sua conta neste navegador.',
    title: 'Seus dados',
    intro: 'Leva só alguns minutos.',
    noscript:
      'Para se cadastrar on-line, você precisa ativar o JavaScript no seu navegador. Você também pode criar sua conta pelo WhatsApp.',
    country: 'País',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    email: 'E-mail',
    emailHint: 'Vamos enviar um link para confirmar sua conta.',
    phone: 'Telefone',
    phoneHint: 'De preferência, o número que você usa no WhatsApp.',
    address1: 'Endereço',
    address2: 'Apto. / Complemento',
    optional: '(opcional)',
    city: 'Cidade',
    choose: 'Escolha uma opção',
    postalCode: 'Código postal',
    honeypot: 'Deixe este campo vazio',
    sending: 'Enviando…',
    afterSubmit: 'Ao enviar, mandamos um e-mail para você confirmar sua conta.',
    accept: ['Aceito os ', 'Termos e condições', ' e a ', 'Política de privacidade', '.'],
    sentTitle: 'Confira seu e-mail',
    sentTo: [
      'Enviamos um link para ',
      '. Abra-o para confirmar sua conta e receber seu Carinova ID e seu endereço nos Estados Unidos.',
    ],
    sentNotes: [
      'Pode levar alguns minutos para chegar.',
      'Se não encontrar, confira a pasta de spam ou de lixo eletrônico.',
      `O link expira em ${CONFIRM_LINK_HOURS} horas.`,
    ],
    edit: 'Digitou o e-mail errado? Corrija',
    messages: {
      missing: 'Preencha este campo.',
      terms: 'Para continuar, aceite os termos e a política de privacidade.',
      unavailable:
        'O cadastro on-line não está disponível no momento. Escreva para nós no WhatsApp e criaremos sua conta.',
      busy: 'Recebemos tentativas demais seguidas. Aguarde um minuto e tente de novo.',
      failed:
        'Não conseguimos enviar seu cadastro. Verifique sua conexão e tente de novo, ou escreva para nós no WhatsApp.',
      oneError: 'Há um campo para corrigir.',
      manyErrors: 'Há {count} campos para corrigir.',
    },
  },

  // components/carinova/UsAddressCard.astro
  usAddressCard: {
    title: 'Seu endereço nos Estados Unidos',
    intro: 'Use-o como endereço de entrega quando comprar em lojas dos Estados Unidos.',
    warehouse: 'Armazém',
    soonTitle: (city: string) => `${city}: em breve`,
    soonText: (city: string, state: string) =>
      `Em breve você também vai poder receber suas compras em ${city}, ${state}. Quando o armazém estiver aberto, o endereço dele vai aparecer aqui.`,
    meanwhile: (city: string) => `Enquanto isso, use seu endereço de ${city}.`,
  },

  // pages/404.astro
  notFoundPage: {
    metaTitle: 'Página não encontrada',
    title: 'Não encontramos esta página',
    lead: 'Você procurava outra coisa?',
    text: [
      'Talvez o link esteja digitado errado ou a página não exista mais. Tente a partir da ',
      'página inicial',
      ' ou continue o que você veio fazer:',
    ],
  },

  // pages/articulos-prohibidos.astro
  restrictedPage: {
    tagline: 'Itens proibidos e restritos',
    title: 'Pode entrar na Nicarágua?',
    metaTitle: 'Itens proibidos: o que não pode ser enviado para a Nicarágua',
    description:
      'O que a Carinova não pode trazer dos Estados Unidos para a Nicarágua: itens proibidos, itens que ainda não temos autorização para trazer e produtos que não viajam por via aérea, mas viajam por via marítima. Confira antes de comprar.',
    subtitle:
      'Há itens que não recebemos nem transportamos, outros que ainda não temos autorização para trazer e outros que só viajam por via marítima. Confira as listas antes de comprar ou enviar.',
    closing: {
      title: 'Não tem certeza sobre um produto?',
      subtitle: 'Pergunte antes de comprar e diremos se podemos trazê-lo.',
      lead: 'Envie o produto para nós:',
    },
  },

  // pages/como-comprar.astro
  howToBuyPage: {
    tagline: 'Como funciona',
    title: 'Como comprar nos Estados Unidos a partir da Nicarágua',
    description:
      'Passo a passo para comprar em lojas dos Estados Unidos e receber na Nicarágua, com exemplos de quanto custa trazer roupas, celulares, notebooks, itens para a casa, móveis e encomendas.',
    subtitle:
      'Três passos claros, da sua primeira compra até ter o seu pacote na Nicarágua, e exemplos de quanto custa trazer roupas, celulares, notebooks, itens para a casa, móveis e encomendas.',
    steps: 'Os passos',
    examples: {
      tagline: 'Exemplos por categoria',
      title: 'Quanto custa trazer…?',
      subtitle:
        'Seis compras de exemplo, calculadas com as nossas tarifas. Abra qualquer uma na calculadora e troque os dados pelos da sua compra.',
      open: 'Abrir na calculadora',
    },
    closing: {
      title: 'Comece criando sua conta',
      subtitle: 'Com seu Carinova ID e seu endereço nos Estados Unidos, você já pode comprar em qualquer loja.',
      lead: 'Quer que a gente oriente você na sua primeira compra?',
    },
    total: 'Total',
  },

  // pages/cotizador.astro
  quotePage: {
    tagline: 'Tarifas e calculadora',
    metaTitle: 'Quanto custa enviar um pacote para a Nicarágua: tarifas e calculadora',
    description: `Quanto custa enviar um pacote dos Estados Unidos para a Nicarágua: aéreo ${formatUSD(air.pricePerLb)} por libra, marítimo ${formatUSD(sea.pricePerLb)} por libra ou ${formatUSD(sea.pricePerCubicFoot)} por pé³, e eletrônicos com tarifa por unidade. Calcule sem se cadastrar.`,
    title: 'Quanto custa enviar um pacote para a Nicarágua?',
    subtitle:
      'Cote seu envio em segundos: calcule quanto custa trazer sua compra ou sua encomenda dos Estados Unidos, sem se cadastrar.',
    closing: {
      title: 'Já sabe quanto vai custar?',
      subtitle: 'Crie sua conta e receba seu Carinova ID e seu endereço nos Estados Unidos para começar a comprar.',
      lead: 'Seu envio é especial?',
    },
  },

  // pages/empresas.astro
  businessPage: {
    tagline: 'Carinova para empresas',
    metaTitle: 'Cargas e envios para empresas dos Estados Unidos para a Nicarágua',
    description:
      'Soluções logísticas dos Estados Unidos para a Nicarágua para empresas: importação e abastecimento, envios recorrentes e atendimento corporativo, por via aérea ou marítima. Conte para nós do que você precisa.',
    title: 'Suas operações também merecem se mover melhor.',
    subtitle:
      'Do primeiro abastecimento ao crescimento da sua empresa, exploramos soluções logísticas adaptadas às características da sua carga.',
    offers: 'O que exploramos com a sua empresa',
    also: 'E o que você tem como qualquer cliente',
    benefits: [
      {
        icon: 'tabler:packages',
        title: 'Carga aérea e marítima',
        text: `Aéreo a ${formatUSD(air.pricePerLb)} por libra, em ${air.transit}. Marítimo a ${formatUSD(sea.pricePerLb)} por libra ou ${formatUSD(sea.pricePerCubicFoot)} por pé cúbico, em ${sea.transit}.`,
      },
      {
        icon: 'tabler:id-badge-2',
        title: 'Um Carinova ID para a sua empresa',
        text: `O mesmo ID para todos os envios da sua empresa, com retirada em ${cityNames.join(' ou ')}.`,
      },
    ],
    quote: 'Cotar um envio',
    next: 'O que acontece depois?',
    steps: [
      { title: 'Recebemos sua solicitação', description: 'Ela chega direto à nossa equipe.' },
      {
        title: 'Entramos em contato',
        description: 'Por e-mail ou pelo WhatsApp, para entender do que a sua empresa precisa.',
      },
      {
        title: 'Abrimos a conta da sua empresa',
        description: 'Com o Carinova ID dela e o endereço em Miami, pronta para receber.',
      },
    ],
    helpTitle: 'Prefere escrever para nós?',
    helpText: 'Também abrimos a conta da sua empresa pelo WhatsApp.',
    helpLink: 'Abrir a conta da minha empresa',
    closing: {
      title: 'Quer saber quanto custa a sua carga?',
      subtitle: 'Faça a cotação por libra ou por pé cúbico em segundos.',
      lead: 'Prefere falar com um consultor?',
    },
  },

  // pages/index.astro
  homePage: {
    service: 'Envios dos Estados Unidos para a Nicarágua',
    title: `Envios dos Estados Unidos para a Nicarágua | Endereço nos EUA em ${warehouse.city} | Carinova`,
    description: `Envios dos Estados Unidos para a Nicarágua com seu próprio endereço nos EUA em ${warehouse.city}: aéreo em ${air.transit} a ${formatUSD(air.pricePerLb)} por libra e marítimo em ${sea.transit} a partir de ${formatUSD(sea.pricePerLb)}. Retire em ${cityNames.join(' ou ')}.`,
  },

  // pages/ingresar.astro
  signinPage: {
    tagline: 'Minha conta',
    metaTitle: 'Entrar na minha conta',
    description:
      'Entre na sua conta da Carinova com seu e-mail: enviamos um código e você entra sem senha. Lá estão seu Carinova ID, seu endereço nos Estados Unidos, seus pacotes e seus pagamentos.',
    title: 'Entre na sua conta',
    subtitle: 'Resolva tudo em um só lugar: seu Carinova ID, seu endereço, seus pacotes e seus pagamentos.',
    howTitle: 'Como funciona',
    how: [
      {
        icon: 'tabler:mail',
        title: 'Sem senha',
        text: 'Não há nada para lembrar nem para roubar: cada vez que você entra, enviamos um código novo para o seu e-mail.',
      },
      {
        icon: 'tabler:clock',
        title: 'Um código para uma só vez',
        text: `Ele vale uma única vez e expira em ${LOGIN_CODE_MINUTES} minutos.`,
      },
      {
        icon: 'tabler:shield-lock',
        title: 'Sua sessão, neste navegador',
        text: `Você continua conectado por ${SESSION_DAYS} dias ou até sair. Em um aparelho compartilhado, saia ao terminar.`,
      },
    ],
    helpTitle: 'Não consegue entrar?',
    helpText: 'Escreva para nós com seu Carinova ID ou com o e-mail da sua conta.',
  },

  // pages/mi-cuenta.astro
  accountPage: {
    tagline: 'Minha conta',
    metaTitle: 'Minha conta: Carinova ID, pacotes e pagamentos',
    description: `Entre na sua conta Carinova: seu Carinova ID, seu endereço nos Estados Unidos, seus pacotes com o status de cada um e seus pagamentos. Retire em ${cityNames.join(' ou ')}.`,
    title: 'Sua conta Carinova',
    subtitle: 'Resolva tudo em um só lugar: seu Carinova ID, seu endereço, seus pacotes e seus pagamentos.',
    signin: 'Entre na sua conta',
    noAccount: 'Ainda não tem conta?',
    includes: 'O que você encontra na sua conta',
    looksLike: 'É assim que ela aparece',
    idFacts: [
      'O sistema gera o seu quando você confirma seu e-mail.',
      'É o mesmo para aéreo, marítimo, encomendas e compras assistidas.',
    ],
    company: 'Você é uma empresa?',
    companyLink: 'Conheça a Carinova para empresas',
    fullAddress: 'Você vê o endereço completo ao entrar.',
    stages: 'Cada pacote, com sua etapa:',
    paymentFacts: [
      'Cada fatura com seu valor e seu status.',
      'Um pagamento aparece como confirmado quando nossa equipe o verifica.',
    ],
    pickup: 'Você retira em',
    homeDelivery: 'Entrega em domicílio',
    branches: 'Ver filiais',
    closing: {
      title: 'Crie sua conta em poucos minutos',
      subtitle: 'Você preenche um formulário curto, confirma seu e-mail e pronto: já tem seu Carinova ID.',
      lead: 'Tem dúvidas antes de se cadastrar?',
    },
  },

  // pages/nosotros.astro
  aboutPage: {
    tagline: 'Quem somos',
    metaTitle: 'Quem somos e de onde viemos',
    description: `A Carinova é uma empresa nicaraguense de envios dos Estados Unidos para a Nicarágua, nascida em ${bluefields}. Conheça nossas raízes, o que fazemos e onde nos encontrar em ${cityNames.join(' e ')}.`,
    title: `Somos a Carinova, a transportadora que nasceu em ${bluefields}`,
    subtitle: `Uma empresa nicaraguense que traz suas compras, as encomendas da sua família e a carga do seu negócio dos Estados Unidos, com filiais em ${cityNames.join(' e ')}.`,
    roots: {
      title: 'Nossas raízes',
      text: 'A Carinova nasceu em Bluefields, na Costa Caribe Sul da Nicarágua. Levamos no nosso DNA o calor humano, o compromisso e a força da nossa terra multicultural, e trabalhamos todos os dias para encurtar distâncias e entregar seus pacotes com a confiança e o carinho que nos caracterizam.',
      emblemAlt: 'Emblema da Carinova: três figuras sustentam uma chama dentro de um círculo',
    },
    whatTagline: 'O que fazemos',
    whatTitle: 'Aproximamos as lojas dos Estados Unidos da Nicarágua',
    what: `Com a sua conta você recebe seu Carinova ID e um endereço em ${warehouse.city} para comprar em qualquer loja. Recebemos seus pacotes lá, trazemos por via aérea ou marítima e você retira em ${cityNames.join(' ou ')}.`,
    servicesLink: 'Ver os serviços em detalhe',
    factsTagline: 'Em poucas palavras',
    factsTitle: 'A Carinova em dados',
    facts: {
      origin: 'Nascemos em',
      originValue: `${bluefields}, Costa Caribe Sul da Nicarágua`,
      route: 'Nossa rota',
      routeValue: 'Dos Estados Unidos para a Nicarágua',
      reception: 'Recebemos suas compras em',
      branches: 'Filiais na Nicarágua',
      transport: 'Como viajam seus pacotes',
      contact: 'Atendimento pelo WhatsApp',
      networks: 'Siga-nos no',
    },
    valuesTagline: 'Nossos valores',
    valuesTitle: 'O que nos move',
    values: [
      {
        title: 'Trabalho em equipe',
        description:
          'Como no nosso emblema: três figuras sustentando juntas a mesma chama. Cada envio é trabalho de equipe, de Miami até a sua filial.',
      },
      {
        title: 'Alcance internacional',
        description:
          'O círculo que as envolve é a ponte que cruzamos todos os dias entre os Estados Unidos e a Nicarágua.',
      },
      {
        title: 'Compromisso',
        description: 'A chama é a nossa promessa: cuidar de cada pacote como se fosse nosso.',
      },
    ],
    where: 'Onde estamos',
    reviewsTagline: 'Avaliações',
    reviewsTitle: 'O que dizem nossos clientes',
    faqTitle: 'Perguntas sobre a Carinova',
    faq: [
      {
        title: 'O que é a Carinova?',
        description:
          'A Carinova é uma empresa nicaraguense de envios. Trazemos compras pessoais, encomendas familiares e carga empresarial dos Estados Unidos para a Nicarágua, por via aérea ou marítima.',
      },
      {
        title: 'De onde é a Carinova?',
        description: `A Carinova nasceu em ${bluefields}, na Costa Caribe Sul da Nicarágua, e hoje tem filiais em ${cityNames.join(' e ')}.`,
      },
      {
        title: 'Onde ficam as filiais da Carinova e qual é o horário de atendimento?',
        description: sentence(`Em ${cityNames.join(' e ')}. Atendemos de ${describeHours(hours)}`),
      },
      {
        title: 'De onde a Carinova traz os pacotes?',
        description: `Recebemos os pacotes no nosso depósito em ${warehouse.city}, ${warehouse.state}, e os trazemos para a Nicarágua por via aérea em ${air.transit} ou por via marítima em ${sea.transit}, contados a partir da chegada do pacote ao depósito.`,
      },
      {
        title: 'Como falo com a Carinova?',
        description: `Pelo WhatsApp, no número <span dir="ltr">${CONTACT.whatsappDisplay}</span>, ou em qualquer uma das nossas filiais.`,
      },
      {
        title: 'Onde leio avaliações de clientes da Carinova?',
        description:
          'Na página de avaliações deste site estão as que nossos clientes publicaram, tal como foram escritas e com o link para onde cada uma foi publicada.',
      },
    ],
    careers: {
      title: 'Faça parte da nossa equipe.',
      text: 'Buscamos pessoas comprometidas com o atendimento e a excelência operacional.',
      link: 'Saiba como se candidatar',
    },
    closing: {
      title: 'Vamos fazer seu primeiro envio',
      subtitle: 'Crie sua conta on-line ou faça a cotação do seu envio antes de comprar.',
      lead: 'Quer nos conhecer melhor?',
    },
  },

  // What a review's card says (the reviews themselves are never translated)
  reviews: {
    recommends: 'Recomenda a Carinova',
    rating: '{rating} de 5 estrelas',
    seeOn: 'Ver no {source}',
    allOn: 'Todas as avaliações no {source}',
    readAll: 'Ler a avaliação completa',
    seeAll: 'Ver todas as avaliações',
    moreTitle: 'Há mais avaliações',
    moreText: 'Leia tudo o que nossos clientes contam sobre seus envios.',
  },

  // pages/opiniones.astro
  reviewsPage: {
    tagline: 'Avaliações',
    metaTitle: 'Avaliações de clientes',
    description:
      'Avaliações reais de clientes da Carinova sobre seus envios dos Estados Unidos para a Nicarágua, tal como foram publicadas no {sources}. Leia antes do seu primeiro envio.',
    title: 'O que dizem os clientes da Carinova',
    subtitle:
      'Avaliações reais de quem já trouxe suas compras dos Estados Unidos para a Nicarágua conosco, tal como foram publicadas no {sources}.',
    listTitle: 'Avaliações dos nossos clientes',
    filterLabel: 'Mostrar avaliações de',
    all: 'Todas',
    howTitle: 'Como mostramos as avaliações',
    how: [
      {
        title: 'Publicadas por seus autores',
        text: 'Cada avaliação foi publicada por seu autor, com o próprio nome, no {sources}.',
      },
      {
        title: 'Nenhuma palavra alterada',
        text: 'Copiamos cada uma como foi escrita e no idioma original, sem corrigir nem traduzir.',
      },
      {
        title: 'Com o link para a origem',
        text: 'Cada uma leva à página da Carinova onde foi publicada. Lá estão todas, inclusive as mais novas.',
      },
    ],
    writeTitle: 'Já recebeu seu pacote? Conte como foi',
    writeText: 'Sua avaliação ajuda outras pessoas a decidir e nos ajuda a melhorar.',
    writeOn: 'Avaliar no {source}',
    nextTitle: 'Antes do seu primeiro envio',
    next: {
      how: 'Veja como funciona, passo a passo',
      quote: 'Calcule quanto custa o seu envio',
      branches: 'Veja onde retirar o seu pacote',
      about: 'Saiba quem somos',
    },
    closing: {
      title: 'Faça seu primeiro envio com a Carinova',
      subtitle: 'Crie sua conta on-line e receba seu Carinova ID e seu endereço nos Estados Unidos.',
      lead: 'Quer nos perguntar algo antes?',
    },
  },

  // pages/preguntas-frecuentes.astro
  faqPage: {
    tagline: 'Ajuda',
    title: 'Perguntas frequentes sobre envios para a Nicarágua',
    description:
      'Endereço nos EUA e Carinova ID, serviços, tarifas, prazos, itens restritos e retirada: respostas às dúvidas mais comuns sobre os envios dos Estados Unidos para a Nicarágua com a Carinova.',
    subtitle: 'Tudo sobre sua conta, os serviços, as tarifas, os prazos de entrega e a retirada dos seus pacotes.',
    topics: 'Assuntos',
    closing: {
      title: 'Não encontrou sua resposta?',
      subtitle: 'Escreva para nós e ajudaremos você, ou comece criando sua conta.',
      lead: 'Conte sua dúvida:',
    },
  },

  // pages/registro.astro
  signupPage: {
    tagline: 'Minha conta',
    title: 'Crie sua conta',
    description: `Crie sua conta on-line e receba seu Carinova ID e seu endereço nos EUA em ${warehouse.city}, para comprar em qualquer loja e receber em ${cityNames.join(' ou ')}.`,
    subtitle:
      'Um só cadastro. Ao confirmar seu e-mail, o sistema gera automaticamente seu Carinova ID e mostra seu endereço nos Estados Unidos.',
    existing: 'Já tem conta?',
    next: 'O que acontece depois?',
    steps: [
      { title: 'Confirme seu e-mail', description: 'Enviamos um link. Abra-o para ativar sua conta.' },
      {
        title: 'Receba seu Carinova ID e seu endereço nos Estados Unidos',
        description: 'Você os vê na tela ao confirmar, e eles também chegam por e-mail.',
      },
      {
        title: 'Compre, e nós trazemos',
        description: `Use seu endereço na loja, acompanhe seu pacote na sua conta e retire-o em ${cityNames.join(' ou ')}.`,
      },
    ],
    helpTitle: 'Prefere que a gente ajude você?',
    helpText: 'Escreva para nós e criamos sua conta pelo WhatsApp.',
  },

  // pages/servicios.astro
  servicesPage: {
    tagline: 'Serviços',
    metaTitle: 'Envios aéreos e marítimos para a Nicarágua, encomendas e compras assistidas',
    description:
      'Envios aéreos e marítimos dos Estados Unidos para a Nicarágua, encomendas, compras assistidas, retirada na filial e entrega em domicílio. Escolha como o seu pacote viaja e como você o recebe.',
    title: 'Envios aéreos e marítimos dos Estados Unidos para a Nicarágua',
    subtitle: 'Cada envio combina três decisões: como ele viaja, quem faz a compra e como você o recebe.',
    kinds: 'Tipos de serviço',
    closing: {
      title: 'Não sabe o que é melhor para você?',
      subtitle: 'Faça a cotação e compare o aéreo com o marítimo, ou crie sua conta e comece a comprar.',
      lead: 'Quer a nossa orientação?',
    },
  },

  // pages/sucursales.astro
  branchesPage: {
    tagline: 'Filiais',
    title: `Filiais em ${cityNames.join(' e ')}`,
    description: `Endereços, horários e WhatsApp da Carinova em ${cityNames.join(' e ')}.${sameHours ? ` ${sentence(`Abrimos de ${describeHours(hours)}`)}` : ''}`,
    subtitle: sameHours
      ? sentence(`Por enquanto, você retira em ${cityNames.join(' e ')}, de ${describeHours(hours)}`)
      : `Por enquanto, você retira em ${cityNames.join(' e ')}.`,
    closing: {
      title: 'Sua próxima compra, pronta para retirar',
      subtitle: 'Crie sua conta e faça a cotação do seu envio antes de comprar.',
      lead: 'Não sabe em qual filial é melhor retirar?',
    },
  },

  // components/carinova/Tracker.astro and TrackingSection.astro
  tracker: {
    switchLabel: 'O que você quer consultar?',
    tabs: { track: 'Rastrear pacote', check: 'Pode entrar?' },
    track: {
      title: 'Rastreie seu pacote',
      visitor:
        'Entre na sua conta para ver seus pacotes: o que recebemos no armazém, o que está a caminho e o que você já pode retirar.',
      signin: 'Entre para ver seus pacotes',
      noAccount: 'Ainda não tem conta?',
      customer: 'Digite a referência do seu pacote ou deixe o campo vazio para ver os que estão a caminho.',
      label: 'Referência do pacote ou número de rastreamento',
      placeholder: 'Ex.: PKG-000123',
      submit: 'Rastrear',
      all: 'Ver todos os meus pacotes e pagamentos',
      privacy: 'Por segurança, o Carinova ID sozinho não autoriza ninguém a consultar dados privados.',
    },
    check: {
      title: 'Pode entrar na Nicarágua?',
      intro:
        'Pesquise o item que você quer trazer. O resultado é uma orientação inicial, não uma autorização de importação nem de transporte.',
      label: 'O que você quer trazer?',
      placeholder: 'Ex.: notebook, perfume, sapatos…',
      examples: 'Experimente:',
      lists: 'Ver as listas completas',
      ask: 'Perguntar pelo WhatsApp',
      note: 'Não substitui a validação da alfândega, as licenças nem a confirmação da Carinova.',
      script: {
        idleTitle: 'Pergunte antes de comprar.',
        idleText: 'Digite o nome do item para receber uma orientação.',
        unknownTitle: 'Não aparece nas nossas listas',
        unknownText:
          'Isso não significa que possa entrar: há itens que precisam de licenças ou de uma análise. Pergunte para nós antes de comprar.',
      },
    },
  },

  // The trail of a page (PageLayout.astro), the link to the reviews of the home page's footer, and "or".
  nav: {
    home: 'Início',
    reviews: 'Avaliações',
    or: ' ou ',
  },

  // components/common/Metadata.astro: what a page without its own title or description says
  meta: {
    title: `Envios dos Estados Unidos para a Nicarágua | Endereço nos EUA em ${warehouse.city} | Carinova`,
    description: `Envios dos Estados Unidos para a Nicarágua com seu próprio endereço nos EUA em ${warehouse.city}, por via aérea ou marítima. Crie sua conta on-line e retire em ${cityNames.join(' ou ')}.`,
  },

  // The statuses of packages, invoices and payments (src/data/account.ts), by their id
  statuses: {
    package: {
      received: { name: 'Recebido no armazém', text: 'Recebimento físico nos Estados Unidos' },
      processing: { name: 'Em preparação', text: 'Triagem e coordenação' },
      in_transit: { name: 'Em trânsito', text: 'A caminho da Nicarágua' },
      ready: { name: 'Disponível para entrega', text: 'Retirada ou entrega combinada' },
      delivered: { name: 'Entregue', text: 'Você recebeu' },
      returned: { name: 'Devolvido', text: 'Devolvido ao remetente' },
      cancelled: { name: 'Cancelado', text: 'O envio foi cancelado' },
    },
    invoice: {
      unpaid: { name: 'Pagamento pendente', text: 'Ainda não registramos nenhum pagamento' },
      in_review: { name: 'Pagamento em análise', text: 'Recebemos seu pagamento e estamos confirmando' },
      partial: { name: 'Pagamento parcial', text: 'Confirmamos uma parte do valor' },
      paid: { name: 'Paga', text: 'Confirmamos seu pagamento' },
      void: { name: 'Cancelada', text: 'Esta fatura não vale mais' },
    },
    payment: {
      pending: { name: 'Em análise', text: 'Estamos confirmando' },
      confirmed: { name: 'Confirmado', text: 'Nós o recebemos' },
      rejected: { name: 'Recusado', text: 'Não conseguimos confirmá-lo' },
    },
    paymentMethod: {
      cash: 'Dinheiro',
      bank_transfer: 'Transferência bancária',
      card: 'Cartão',
      other: 'Outro meio',
    },
  },

  // What Carinova explores with a company and the options of its form (src/data/business.ts), by their id
  business: {
    solutions: {
      importacion: {
        title: 'Importação e abastecimento',
        text: 'Análise do tipo de mercadoria, da modalidade, do peso, do volume e dos requisitos documentais antes da cotação.',
      },
      recurrentes: {
        title: 'Envios recorrentes',
        text: 'Avaliação comercial da frequência, da consolidação possível e das necessidades de abastecimento, sujeita a viabilidade.',
      },
      corporativa: {
        title: 'Atendimento corporativo',
        text: 'Definição do escopo, da rastreabilidade necessária, da cobertura e das condições de serviço conforme a operação.',
      },
    },
    disclaimer:
      'As modalidades empresariais e suas condições são estruturadas caso a caso, após avaliação de viabilidade e conformidade.',
    volumes: {
      'under-100': 'Menos de 100 lb por mês',
      '100-500': 'De 100 a 500 lb por mês',
      'over-500': 'Mais de 500 lb por mês',
      pallets: 'Carga em paletes ou contêiner',
      unknown: 'Ainda não sei',
    },
  },

  // pages/rastreo.astro and components/carinova/PackageLookup.astro
  trackPage: {
    tagline: 'Rastreamento',
    metaTitle: 'Rastreamento de pacotes dos Estados Unidos para a Nicarágua',
    description:
      'Acompanhe seus pacotes dos Estados Unidos para a Nicarágua com a Carinova: recebido no armazém, em preparação, em trânsito, disponível para entrega e entregue. Entre na sua conta e rastreie cada envio pela referência.',
    title: 'Rastreie seu pacote',
    subtitle: 'Entre na sua conta e acompanhe cada envio pela referência, etapa por etapa.',
    stagesTitle: 'As etapas do seu pacote',
    stagesIntro: 'É assim que cada envio avança, do nosso armazém nos Estados Unidos até as suas mãos.',
    results: {
      active: 'Seus pacotes a caminho',
      found: 'O resultado da sua busca',
      loading: 'Buscando seus pacotes…',
      empty:
        'Ainda não recebemos pacotes em seu nome. Quando o primeiro chegar ao nosso armazém, você vai vê-lo aqui, com a etapa.',
      none: 'Você não tem pacotes a caminho no momento.',
      notFoundHint: 'Verifique se está escrita corretamente: a referência começa com PKG e aparece na sua conta.',
      askMissing: 'Perguntar sobre esta referência',
      ask: 'Perguntar sobre este pacote',
      history: 'Ver histórico',
      error: 'Não conseguimos carregar seus pacotes. Verifique sua conexão e tente de novo.',
      retry: 'Tentar de novo',
      script: {
        notFound: 'Não encontramos nenhum pacote com a referência {reference} na sua conta.',
        summary: '{reference} · {service}',
      },
    },
    closing: {
      title: 'Ainda não tem conta?',
      subtitle: 'Crie sua conta e acompanhe cada compra desde que ela chega ao nosso armazém.',
      lead: 'Não encontra seu pacote?',
    },
  },

  // components/carinova/ProductLinkForm.astro
  productLink: {
    label: 'Link do produto',
    placeholder: 'https://loja.com/produto',
    submit: 'Preparar solicitação',
    hint: 'O WhatsApp abre com sua solicitação pronta para enviar. Nada é comprado até confirmarmos o custo total.',
    invalid: 'Cole o link completo do produto: ele começa com https://',
  },

  // pages/casillero-en-miami.astro
  lockerPage: {
    tagline: 'Endereço nos EUA',
    metaTitle: `Endereço nos EUA em ${warehouse.city} para envios à Nicarágua`,
    description: `Abra grátis seu endereço nos EUA em ${warehouse.city} com a Carinova: um endereço nos Estados Unidos para comprar na Amazon, na SHEIN ou na Temu e receber em ${cityNames.join(' ou ')}. Aéreo em ${air.transit}, marítimo em ${sea.transit}.`,
    title: `Seu endereço nos EUA em ${warehouse.city}, para a Nicarágua`,
    subtitle: `Um endereço nos Estados Unidos em seu nome, para comprar em qualquer loja e receber em ${cityNames.join(' ou ')}. Ele vem com a sua conta Carinova.`,
    whatTitle: `O que é um endereço nos EUA em ${warehouse.city} e como funciona?`,
    what: [
      'É um endereço nos Estados Unidos que você usa como se morasse lá: você o informa como endereço de entrega quando compra on-line, a loja entrega seu pacote no nosso armazém e nós o trazemos para a Nicarágua.',
      'Na Nicarágua ele é chamado de "casillero", e também de caixa postal virtual ou internacional: é a mesma coisa. Na Carinova você não contrata esse endereço à parte: ele vem com a sua conta.',
      'Ao criar sua conta, você recebe seu Carinova ID e seu endereço. O Carinova ID é como identificamos cada pacote que chega em seu nome.',
    ],
    addressTitle: 'Onde recebemos suas compras',
    addressNote: 'Você vê o endereço completo ao criar sua conta.',
    includesTitle: 'O que seu endereço nos EUA inclui',
    includesLink: 'Ver tudo o que há na sua conta',
    costTitle: 'Quanto custa um endereço nos EUA?',
    cost: 'Criar sua conta é grátis: você só paga o envio de cada pacote, por libra ou, no marítimo, também por pé cúbico.',
    costLink: 'Calcular quanto custa meu envio',
    stepsTitle: 'Como usar seu endereço nos EUA',
    stepsLink: 'Ver cada passo com exemplos',
    faqTitle: 'Perguntas sobre o endereço nos EUA e sua conta',
    closing: {
      title: 'Abra seu endereço nos EUA em poucos minutos',
      subtitle: 'Crie sua conta on-line e receba seu Carinova ID e seu endereço nos Estados Unidos.',
      lead: 'Tem dúvidas antes de abrir?',
    },
  },

  // pages/tiendas.astro
  storesPage: {
    tagline: 'Lojas',
    metaTitle: 'Comprar na Amazon, SHEIN e Temu a partir da Nicarágua',
    description: `Como comprar na Amazon, SHEIN, Temu, Walmart e outras lojas dos Estados Unidos a partir da Nicarágua: use o endereço da sua conta Carinova ou peça que a gente compre para você, e receba em ${cityNames.join(' ou ')}.`,
    title: 'Compre em lojas dos Estados Unidos a partir da Nicarágua',
    subtitle:
      'Amazon, SHEIN, Temu, Walmart e muitas outras: você compra com o endereço da sua conta e nós trazemos para a Nicarágua.',
    howTitle: 'Como comprar em uma loja dos Estados Unidos',
    howLink: 'Ver cada passo com exemplos',
    restrictedLink: 'Ver quais itens não podem entrar',
    storesTitle: 'Lojas onde você pode comprar',
    storesIntro:
      'Você pode comprar em qualquer loja on-line que entregue dentro dos Estados Unidos. Estas são algumas das mais procuradas, por categoria.',
    categories: 'Categorias de lojas',
    buyAt: (store: string) => `${store}: compras a partir da Nicarágua`,
    visit: (store: string) => `Ir ao site da loja ${store}`,
    assist: 'Pedir que a gente compre para você',
    disclosure:
      'As lojas aparecem como exemplos, sem convênio nem endosso implícito. Preços, disponibilidade e condições de cada compra são consultados no site de cada loja.',
    assistTitle: 'Prefere que a gente compre para você?',
    assistIntro:
      'Na compra assistida, você escolhe o produto e a Carinova faz a compra. Cole o link do produto e prepare sua solicitação.',
    closing: {
      title: 'Pronto para sua primeira compra?',
      subtitle: 'Crie sua conta e use seu endereço nos Estados Unidos na loja que preferir.',
      lead: 'Tem dúvidas sobre uma loja?',
    },
  },

  // pages/index.astro and components/landing: the home page Carinova wrote (./landing)
  landing,
};
