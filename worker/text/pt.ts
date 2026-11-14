/** What the Worker says, in Brazilian Portuguese. Same shape as ./es.ts (`ServerText`). */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import { BUSINESS_LIMITS } from '../../src/data/business.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import { SIGNUP_LIMITS } from '../validation.ts';
import type { ServerText } from './es.ts';

export const text: ServerText = {
  tagline: 'Carinova · Envios que unem · Dos Estados Unidos para a Nicarágua',

  // worker/api.ts
  api: {
    emailMissing: 'Digite seu e-mail.',
    emailInvalid: 'Confira seu e-mail: ele não parece válido.',
    emailRejected: 'Não conseguimos enviar uma mensagem para este e-mail. Confira se ele está escrito corretamente.',
  },

  // worker/auth/emails.ts
  loginCode: {
    subject: 'Seu código para entrar na Carinova',
    preheader: (code: string) => `Seu código é ${code}. Ele expira em ${LOGIN_CODE_MINUTES} minutos.`,
    hello: (name: string) => `Olá, ${name},`,
    intro: 'Use este código para entrar na sua conta da Carinova:',
    expires: `Ele expira em ${LOGIN_CODE_MINUTES} minutos e só pode ser usado uma vez.`,
    never:
      'Digite-o apenas no nosso site. Nunca vamos pedi-lo pelo WhatsApp, por telefone nem por e-mail: se alguém pedir, não o informe.',
    notYou: 'Se não foi você, ignore esta mensagem: sem este código ninguém consegue entrar na sua conta.',
  },

  // worker/business/validate.ts
  businessForm: {
    company: 'Digite o nome da sua empresa.',
    companyLength: `O nome da empresa deve ter de 2 a ${BUSINESS_LIMITS.company} caracteres.`,
    contactName: 'Digite seu nome.',
    contactNameInvalid: `Use apenas letras no seu nome (entre 2 e ${BUSINESS_LIMITS.contactName} caracteres).`,
    email: 'Digite seu e-mail.',
    emailInvalid: 'Confira seu e-mail: ele não parece válido.',
    phone: 'Digite seu telefone.',
    phoneInvalid: (example: string) =>
      `Digite o número completo, por exemplo ${example}. Se for de outro país, comece com + e o código do país.`,
    country: 'Escolha um país.',
    city: 'Digite sua cidade.',
    cityLength: `Sua cidade deve ter de 2 a ${BUSINESS_LIMITS.city} caracteres.`,
    volume: 'Escolha uma das opções.',
    message: 'Conte para nós do que a sua empresa precisa.',
    messageShort: 'Conte um pouco mais sobre o que a sua empresa precisa.',
    messageLong: `Use no máximo ${BUSINESS_LIMITS.message} caracteres.`,
  },

  // worker/signup/emails.ts
  verification: {
    subject: 'Confirme seu e-mail para criar sua conta Carinova',
    preheader: 'Só mais um passo e sua conta fica pronta.',
    hello: (name: string) => `Olá, ${name},`,
    intro:
      'Recebemos seu cadastro na Carinova. Confirme seu e-mail para criar sua conta e receber seu Carinova ID e seu endereço em Miami.',
    button: 'Confirmar meu e-mail',
    expires: `O link expira em ${CONFIRM_LINK_HOURS} horas.`,
    fallback: (openLink: string) => `Se o botão não funcionar, ${openLink}.`,
    fallbackLink: 'abra este link',
    notYou: 'Se não foi você, ignore esta mensagem: nenhuma conta será criada.',
    textIntro:
      'Recebemos seu cadastro na Carinova. Abra este link para confirmar seu e-mail, criar sua conta e receber seu Carinova ID e seu endereço em Miami:',
  },

  // worker/signup/emails.ts
  welcome: {
    subject: (code: string) => `Sua conta Carinova está pronta: ${code}`,
    preheader: (code: string) => `Seu Carinova ID é ${code}. Aqui está seu endereço em Miami.`,
    title: (name: string) => `Sua conta está pronta, ${name}!`,
    thisIsId: 'Este é o seu Carinova ID.',
    keepId: 'Guarde-o: é com ele que identificamos sua conta.',
    idLabel: 'Seu Carinova ID',
    address: 'Seu endereço em Miami',
    addressIntro: 'Use-o como endereço de entrega quando comprar em lojas dos Estados Unidos:',
    before: 'Antes de fazer suas compras',
    seeList: 'Ver esta lista no nosso site',
    listOnSite: 'A lista no nosso site',
    firstShipment: 'Antes do seu primeiro envio',
    quote:
      'Calcule quanto custa trazer sua compra: por via aérea, por via marítima ou com a tarifa por unidade de alguns eletrônicos.',
    quoteText: 'Calcule quanto custa trazer sua compra',
    online: 'Sua conta on-line',
    onlineText:
      'No nosso site você sempre encontra seu Carinova ID, seu endereço, seus pacotes e seus pagamentos. Você entra com seu e-mail e um código que enviamos, sem senha.',
    questions: 'Tem dúvidas?',
    writeUs: (number: string) => `Escreva para nós no WhatsApp: ${number}`,
  },

  // worker/signup/validate.ts
  signupForm: {
    country: 'Escolha um país.',
    labels: { firstName: 'nome', lastName: 'sobrenome' },
    nameMissing: (label: string) => `Digite seu ${label}.`,
    nameInvalid: (label: string) => `Use apenas letras no seu ${label} (entre 2 e ${SIGNUP_LIMITS.name} caracteres).`,
    emailMissing: 'Digite seu e-mail.',
    emailInvalid: 'Confira seu e-mail: ele não parece válido.',
    phoneMissing: 'Digite seu telefone.',
    phoneInvalid: (example: string) =>
      `Digite o número completo, por exemplo ${example}. Se for de outro país, comece com + e o código do país.`,
    addressMissing: 'Digite seu endereço.',
    addressShort: 'Seu endereço parece incompleto.',
    tooLong: (max: number) => `Use no máximo ${max} caracteres.`,
    cityMissing: 'Digite sua cidade.',
    cityLength: `Sua cidade deve ter de 2 a ${SIGNUP_LIMITS.city} caracteres.`,
    state: (label: string) => `Escolha seu ${label.toLowerCase()}.`,
    postalMissing: 'Digite seu código postal.',
    postalInvalid: (example: string) => `Confira o código postal (exemplo: ${example}).`,
    terms: 'Para continuar, aceite os termos e a política de privacidade.',
  },
};
