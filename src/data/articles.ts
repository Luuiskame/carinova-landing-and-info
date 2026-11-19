/**
 * What Carinova Bot knows: the catalogue of the article search of the home page, from the page
 * Carinova wrote on 2026-11-18. Each rule is a kind of article, the words people type for it
 * (Spanish, English, Portuguese and French in `terms`, compared as whole words; Chinese in
 * `cjk`, found anywhere in the text) and how it travels:
 *
 * - `prohibited`: not carried.
 * - `sea`: it cannot fly, so it travels by sea.
 * - `air`: a device with a price per unit, by air only (`electronic` is its id in RATES).
 * - `volume`: by sea, and it can be quoted by its measurements.
 * - `allowed`: general merchandise, by air or by sea.
 * - `review`: the team has to look at it.
 *
 * The rules are tried in order and the first that matches wins; `unless` takes away what only
 * looks like it ("pistola de agua", "batería de cocina", "juego de mesa"). To add an article, add
 * its word to the rule it belongs to. The text is compared without accents, in lower case and
 * without punctuation (utils/articles.ts), so that is how the words are written.
 *
 * The search answers with this catalogue first and with the lists of /articulos-prohibidos
 * (RESTRICTED_ITEMS, in every language of the site) for what it does not know; what neither knows
 * gets "requires review", never "allowed".
 *
 * No imports: the home page loads this file only when someone searches, and the unit tests run it
 * on plain Node.
 */
export type ArticleStatus = 'prohibited' | 'sea' | 'air' | 'volume' | 'allowed' | 'review';

export interface ArticleRule {
  /** Its name is `landing.cat[id]` in the dictionaries; a device is named by RATES. */
  id: string;
  status: ArticleStatus;
  /** A device with a price per unit: its id in RATES.electronics. */
  electronic?: string;
  /** A device: a case, a charger or a game for it is an accessory, not the device. */
  device?: boolean;
  /** A games console: what goes with it is a game. */
  console?: boolean;
  /** Alternatives of a regular expression, matched as whole words. */
  terms?: string;
  /** Alternatives matched anywhere: Chinese is written without spaces. */
  cjk?: string;
  /** What the text must not say. */
  unless?: string;
}

export const ARTICLE_RULES: Array<ArticleRule> = [
  // Not carried at all
  {
    id: 'drugs',
    status: 'prohibited',
    terms:
      'marihuana|mariguana|marijuana|cannabis|maconha|thc|cocaina|cocaine|heroina|heroin|metanfetaminas?|methamphetamines?|extasis|ecstasy|mdma|lsd|psilocibina|psilocybin|hongos alucinogenos|magic mushrooms|drogas? ilegal(?:es)?|illegal drugs?|stupefiants?',
    cjk: '大麻|毒品|可卡因|冰毒|海洛因',
  },
  {
    id: 'explosives',
    status: 'prohibited',
    terms:
      'fuegos artificiales|pirotecnia|pirotecnicos?|cohetes?|petardos?|bengalas?|fireworks?|firecrackers?|sparklers?|explosivos?|explosives?|dinamita|dynamite|polvora|gunpowder|fogos de artificio|feux d artifice|granadas? de mano|grenades?',
    cjk: '烟花|鞭炮|爆竹|炸药|火药',
    unless: 'de juguete|toy rockets?|lego|maqueta|cohetes? espaciales? de juguete',
  },
  {
    id: 'weapons',
    status: 'prohibited',
    terms:
      'armas?|armas? de fuego|armas? blancas?|pistolas?|revolver(?:es)?|rifles?|escopetas?|fusil(?:es)?|carabinas?|subfusil(?:es)?|ametralladoras?|municion(?:es)?|balas?|balin(?:es)?|perdigon(?:es)?|cartuchos? (?:de )?(?:escopeta|calibre|caza|bala|municion)|silenciador(?:es)?|supresor(?:es)?|miras? telescopicas?|cargador(?:es)? (?:de |para )?(?:armas?|pistolas?|rifles?|glock|ar 15)|fundas? (?:de |para )?(?:pistolas?|armas?)|pistoleras?|culatas?|glock|beretta|smith wesson|sig sauer|ar 15|ak 47|tasers?|paralizador(?:es)?|electroshock|gas pimienta|spray de pimienta|pepper spray|gas lacrimogeno|tear gas|airsoft|paintball|ballestas?|crossbows?|nudilleras?|manoplas?|brass knuckles|guns?|firearms?|pistols?|handguns?|revolvers?|shotguns?|ammo|ammunition|bullets?|silencers?|suppressors?|holsters?|rifle scopes?|gun scopes?|stun guns?|weapons?|espingardas?|municao|municoes|coldres?|armes?|pistolets?|fusils?|carabines?',
    cjk: '枪|手枪|步枪|猎枪|弹药|子弹|武器|电击枪|防狼喷雾|弩',
    unless:
      '(?:pistolas?|guns?|pistolets?) (?:de |para |a |d )?(?:agua|water|eau|silicona?|silicone|calor|heat|pegamento|glue|colle|hot glue|masaje|massage|clavos|nail|clous|pintura|paint|peinture|pintar|spray|juguete|toy|jouet|nerf|grapas|staple|temperatura|termometro|thermometer|aire caliente|hot air|soldar|soldadura|solder|calafateo|caulk|burbujas|bubbles?|lavado|presion|pressure|lavar|tatuar|tattoo|limpieza|sellador|sealant|remaches|rivet|impacto|impact)|nerf|de juguete|juguetes?|toys?|massage guns?|glue guns?|heat guns?|water guns?|nail guns?|spray guns?|staple guns?|caulk(?:ing)? guns?|bubble guns?|tattoo guns?|guns? n roses|top gun|arma tu|para armar',
  },
  {
    id: 'vapes',
    status: 'prohibited',
    terms:
      'vapes?|vaper(?:s)?|vapeador(?:es)?|vapeo|vapear|vaporizador(?:es)? (?:de |para )?(?:hierbas?|tabaco|cannabis|nicotina)|cigarr(?:o|illo)s? electronicos?|e ?cig(?:arette)?s?|e cigarettes?|electronic cigarettes?|cigarettes? electroniques?|cigarros? eletronicos?|vapoteuses?|pods? (?:de |para )?(?:vape|vapeo|nicotina)|vape pods?|juul|elf ?bars?|lost mary|geek ?bars?|smok|vaporesso|voopoo|uwell|puff ?bars?|hqd|liquidos? (?:de |para )?(?:vape|vapeo|cigarr(?:o|illo)s? electronicos?)|e ?liquids?|e liquides?|sales de nicotina|nic salts?|esencias? (?:de |para )?vape',
    cjk: '电子烟|烟弹|雾化烟',
  },
  {
    id: 'tobacco',
    status: 'prohibited',
    terms:
      'tabacos?|cigarros?|cigarrillos?|habanos?|puros? (?:cubanos?|habanos?|de tabaco)|tabaco de mascar|nicotina|bolsas? de nicotina|bolsitas? de nicotina|nicotine(?: pouches?)?|zyn|snus|iqos|heets|terea|shisha|tabaco para (?:narguile|narguila|hookah|pipa)|tobacco|cigarettes?|cigars?|cigarillos?|chewing tobacco|snuff|charutos?|fumo|tabac|cigares?',
    cjk: '烟草|香烟|卷烟|雪茄|尼古丁|烟丝',
  },
  {
    id: 'aircraft',
    status: 'prohibited',
    terms:
      '(?:accesorios?|repuestos?|piezas?|partes?|componentes?|instrumentos?|motor(?:es)?|helices?|llantas?|ruedas?) (?:de |para )(?:un |una )?(?:avion(?:es)?|aeronaves?|avionetas?|helicopteros?)|avionica|helices? de avion|aircraft (?:parts?|accessor(?:y|ies)|components?)|(?:airplane|aeroplane|plane|aviation) parts?|avionics|pecas? (?:de |para )(?:aviao|avioes|aeronaves?)|acessorios? (?:de |para )(?:aviao|aeronaves?)|pieces? (?:d |pour )?avions?|accessoires? (?:d |pour )?avions?',
    cjk: '飞机配件|飞机零件|航空配件|航空零件',
    unless:
      'juguete|toys?|escala|maqueta|lego|model kits?|\\brc\\b|control remoto|radio control|papel|paper|origami|modelismo',
  },
  {
    id: 'radio',
    status: 'prohibited',
    terms:
      'transmisor(?:es)?|radio ?transmisor(?:es)?|emisoras?|walkie ?talkies?|walky ?talky|radios? de dos vias|radios? bidireccional(?:es)?|radio ?aficionad[oa]s?|banda ciudadana|baofeng|transceptor(?:es)?|transceivers?|ham radios?|two way radios?|cb radios?|radio transmitters?|transmissor(?:es)?(?: de radio)?|radio ?comunicador(?:es)?|emetteurs? radio|talkie walkies?',
    cjk: '无线电发射器|对讲机|发射机|无线电台',
    unless: '^(?!.*\\bfm\\b).*\\b(?:bluetooth|wifi|wi fi|hdmi|video|audio|tv|usb)\\b',
  },
  {
    id: 'drones',
    status: 'prohibited',
    terms:
      'drones?|dron(?:es)?|cuadricopteros?|quadcopters?|multirrotor(?:es)?|multirotors?|dji (?:mini|mavic|air|avata|phantom|neo|flip|fpv|inspire|matrice|spark)|tello|autel(?: evo)?|parrot anafi|fpv',
    cjk: '无人机|航拍器|四轴飞行器',
  },

  // By sea only
  {
    id: 'lithium',
    status: 'sea',
    terms:
      '(?:baterias?|pilas?|celdas?) (?:de )?(?:litio|lithium|li ion|ion de litio|lipo)|(?:litio|lithium|li ion|lipo) (?:baterias?|pilas?|batter(?:y|ies))|lithium (?:ion )?batter(?:y|ies)|power ?banks?|powerbanks?|bancos? de (?:energia|bateria|carga)|baterias? (?:externas?|portatil(?:es)?|de respaldo|de repuesto|recargables?)|cargador(?:es)? portatil(?:es)?|portable chargers?|external batter(?:y|ies)|spare batter(?:y|ies)|rechargeable batter(?:y|ies)|baterias? (?:de |para )(?:el |la |un |una |mi )?(?:celular(?:es)?|telefonos?|iphone|smartphones?|laptops?|computadoras?|notebooks?|camaras?|drones?|dron|tablets?|ipad|macbook|bicicletas?|scooters?|patinetas?|patinetes?|herramientas?|taladros?|aspiradoras?)|18650|21700|26650|cr ?2032|cr ?2025|cr ?2016|cr ?123a?|carregador(?:es)? portatil(?:es)?|batteries? (?:au |de )?lithium|batteries? externes?|chargeurs? portables?',
    cjk: '锂电池|充电宝|移动电源|锂离子电池',
  },
  {
    id: 'emobility',
    status: 'sea',
    terms:
      '(?:bicicletas?|bicis?|scooters?|patinetas?|patinetes?|monopatin(?:es)?|skateboards?|monociclos?|triciclos?|carritos? montables?) electric(?:a|o|as|os)|e ?bikes?|e ?scooters?|electric (?:bikes?|bicycles?|scooters?|skateboards?|unicycles?)|hoverboards?|segways?|onewheel|bicicletas? eletricas?|patinetes? eletricos?|trottinettes? electriques?|velos? electriques?|gyroroues?',
    cjk: '电动自行车|电动滑板车|平衡车|电动车',
  },
  {
    id: 'alcohol',
    status: 'prohibited',
    terms:
      'bebidas? alcoholicas?|bebidas? con alcohol|licor(?:es)?|liquors?|ron|rum|whisky|whiskey|vodka|tequila|ginebra|gin|vinos?|wines?|cervezas?|beers?|champan|champagne|prosecco|mezcal|brandy|cognac|aguardiente|sake|bebidas? alcoolicas?|cachaca|bieres?|vins?|spiritueux',
    cjk: '酒(?!精)|啤酒|葡萄酒|白酒|威士忌|伏特加|红酒',
    unless:
      'sin alcohol|alcohol free|non alcoholic|copas?|vasos?|glass(?:es)?|cavas?|racks?|openers?|descorchador(?:es)?|sacacorchos|decantador(?:es)?|bar set|cerveceria|mugs?|jarras?|vinagre',
  },
  {
    id: 'medicines',
    status: 'review',
    terms:
      'medicamentos?|medicinas?|medicines?|medications?|pastillas?|pildoras?|pills?|capsulas?|capsules?|jarabes?|antibioticos?|antibiotics?|insulinas?|insulin|analgesicos?|painkillers?|ibuprofeno|ibuprofen|acetaminofen|acetaminophen|paracetamol|tylenol|advil|aspirinas?|aspirin|recetas? medicas?|prescriptions?|vacunas?|vaccines?|inyeccion(?:es)?|injections?|jeringas?|syringes?|ozempic|wegovy|mounjaro|viagra|cialis|remedios?|spray nasal|nasal sprays?|inhalador(?:es)?|inhalers?|gotas (?:para los ojos|oftalmicas|para el oido)|eye drops|antialergicos?|antihistaminicos?|claritin|zyrtec|benadryl|omeprazol|metformina|medicaments?|remedes?|farmacos?',
    cjk: '药品|药物|处方药|胶囊|注射|抗生素|胰岛素',
    unless:
      'frenos?|brakes?|pastillas? de (?:menta|chocolate|jabon|freno)|mints?|caramelos?|dulces?|pastilleros?|pill (?:box|organizer)s?|organizador(?:es)? de pastillas|jarabes? de (?:arce|maple|chocolate|fresa|cafe|goma)|maple syrup|pancake',
  },
  {
    id: 'flammables',
    status: 'sea',
    terms:
      'inflamables?|flammables?|inflamave(?:l|is)|inflammables?|alcohol|alcohol en gel|alcohol gel|gel (?:antibacterial|desinfectante|sanitizante)|antibacterial en gel|hand sanitizers?|sanitizers?|isopropyl alcohol|rubbing alcohol|esmaltes?|pintaunas|lacas? de unas|nail polish(?:es)?|nail lacquers?|quitaesmaltes?|removedor(?:es)? de esmalte|acetona|acetone|nail polish remover|thinner|diluyentes?|solventes?|solvents?|aguarras|trementina|turpentine|gasolina|gasoline|petrol|diesel|queroseno|keroseno|kerosene|butano|propano|butane|propane|(?:cilindros?|tanques?|bombonas?|garrafas?) de gas|encendedor(?:es)?|fosforeras?|mecheros?|lighters?|zippo|fosforos|cerillos|cerillas|matches|liquido (?:para )?encendedor|lighter fluid|liquido para encender|carbon de encendido|barnices|barniz|varnish(?:es)?|pinturas? (?:de aceite|al aceite|esmalte|en esmalte)|oil (?:based )?paints?|(?:pegamento|cemento) de contacto|contact cement|pegamento para pvc|pvc cement|aceites? esencial(?:es)?|essential oils?|oleos? essenciais?|huiles? essentielles?|combustibles?|gel combustible|isqueiros?|briquets?|allumettes|vernis a ongles|dissolvant|alcool',
    cjk: '易燃|酒精|指甲油|洗甲水|丙酮|打火机|火柴|汽油|柴油|煤油|丁烷|丙烷|稀释剂|精油|天那水',
    unless:
      'sin alcohol|alcohol free|libre de alcohol|sin acetona|acetone free|parrillas?|grills?|bbq|asador(?:es)?|estufas?|calentador(?:es)?|heaters?|cocinas? de gas|hornos?|fogon(?:es)?|sopletes?',
  },
  {
    id: 'perfumes',
    status: 'sea',
    terms:
      'perfumes?|perfumeria|colonias?|agua de colonia|fragancias?|fragrances?|eau de (?:parfum|toilette|cologne)|edp|edt|parfums?|colognes?|body mists?|splash(?:es)? corporal(?:es)?|body splash(?:es)?|after ?shave|locion(?:es)? (?:para )?(?:despues de afeitar|after shave)|perfume arabe|lattafa|armaf|afnan',
    cjk: '香水|古龙水|香氛',
    unless:
      '(?:sin|libre de) (?:perfume|fragancia)|fragrance free|unscented|perfumeros? vacios?|empty (?:perfume )?bottles?|velas?|candles?|ambientador(?:es)?|jabon(?:es)?|soaps?|detergentes?|suavizantes?|cremas?|lotions?|locion corporal|shampoo|champu|desodorantes? en barra',
  },
  {
    id: 'aerosols',
    status: 'sea',
    terms:
      'aerosol(?:es)?|aerossois|aerossol|aerosols?|body ?sprays?|spray corporal|desodorantes? (?:en )?(?:spray|aerosol)|antitranspirantes? (?:en )?(?:spray|aerosol)|(?:deodorant|antiperspirant) sprays?|spray deodorants?|sprays?|lacas?|hair ?sprays?|fijador(?:es)? (?:en spray|para (?:el )?(?:pelo|cabello))|espumas? de afeitar|shaving (?:foam|cream)|cremas? de afeitar|champu seco|shampoo seco|dry shampoo|aire comprimido|compressed air|wd ?40|lubricante en aerosol|repelentes? (?:en )?(?:spray|aerosol)|bug spray|insecticidas? en (?:spray|aerosol)|raid|ambientador(?:es)? (?:en )?(?:spray|aerosol)|air fresheners?|lysol|pinturas? (?:en )?(?:spray|aerosol)|spray paints?|silicona en spray|protector(?:es)? solar(?:es)? en spray|sunscreen sprays?|spray bronceador|bombes? (?:de peinture|aerosol)|peinture en bombe|crema chantilly en lata|whipped cream|mousses? (?:para|de) (?:pelo|cabello)|mousse capilar|desodorante axe|axe body',
    cjk: '气雾剂|喷雾|发胶|剃须泡沫|喷漆',
    unless:
      'nasal|bucal|inhalador(?:es)?|inhalers?|botellas?|bottles?|vacios?|empty|toallitas|wipes|spray guns?|pistolas? (?:de|para) pintar|pistolas? de pintura|pulverizador(?:es)?|atomizador(?:es)? vacios?|spray mops?|trapeador(?:es)?|mopas?|laca para muebles',
  },

  // The team has to look at them
  {
    id: 'chemicals',
    status: 'review',
    terms:
      'cloro|lejia|bleach|acidos?|acids?|acido muriatico|soda caustica|lye|hidroxido de sodio|amoniaco|ammonia|pesticidas?|pesticides?|herbicidas?|herbicides?|insecticidas?|insecticides?|fungicidas?|raticidas?|venenos?|poisons?|quimicos?|chemicals?|productos? quimicos?|pool chlorine|peroxido|destapacanos|drano|mercurio|produtos? quimicos?|produits? chimiques?',
    cjk: '漂白剂|化学品|农药|杀虫剂',
    unless:
      'hialuronico|hyaluronic|salicilico|salicylic|glicolico|glycolic|folico|folic|retinoico|retinoic|azelaico|azelaic|lactico|lactic|kojico|kojic|ascorbico|ascorbic|mandelico|mandelic|serum|cremas?|creams?|tonicos?|toners?|limpiador facial|cleanser|vitaminas?|exfoliantes?|the ordinary|cerave|kit de quimica|juego de quimica|quimica para ninos|libros?|books?',
  },
  {
    id: 'vehiclebattery',
    status: 'review',
    terms:
      'baterias? (?:de |para )(?:el |la |mi )?(?:carros?|autos?|automovil(?:es)?|motos?|motocicletas?|camion(?:es)?|camionetas?|vehiculos?|barcos?|lanchas?|golf)|car batter(?:y|ies)|baterias? de 12 ?v|acumulador(?:es)?|baterias? automotrices?',
    cjk: '汽车电池|电瓶',
  },
  {
    id: 'music',
    status: 'allowed',
    terms:
      'guitarras?|guitars?|bajos? electricos?|bass guitars?|ukuleles?|violin(?:es)?|violins?|pianos?|teclados? musicales?|sintetizador(?:es)?|synths?|baterias? (?:acusticas?|electronicas?|musical(?:es)?|de musica)|drum (?:kit|set)s?|tambor(?:es)?|drums?|platillos|cymbals?|flautas?|flutes?|trompetas?|trumpets?|saxofon(?:es)?|saxophones?|clarinetes?|armonicas?|harmonicas?|amplificador(?:es)?|amplifiers?|amps?|pedal(?:es)? de efectos?|cuerdas de guitarra|guitar strings|instrumentos? musicales?|musical instruments?|violao|instruments? de musique',
    cjk: '乐器|吉他|钢琴|小提琴|鼓',
  },
  {
    id: 'alkaline',
    status: 'allowed',
    terms:
      'pilas? (?:alcalinas?|aa|aaa|c|d|9 ?v)|pilas? recargables? (?:aa|aaa)|alkaline batter(?:y|ies)|aa batter(?:y|ies)|aaa batter(?:y|ies)|duracell|energizer|pilhas? alcalinas?|piles? alcalines?',
    cjk: '碱性电池|五号电池|七号电池',
  },
  {
    id: 'battery',
    status: 'review',
    terms: 'baterias?|batter(?:y|ies)|pilas?|pilhas?|piles?',
    cjk: '电池',
    unless:
      'cocina|cookware|ollas|sartenes|acusticas?|electronicas?|musical(?:es)?|de musica|drums?|tambor(?:es)?|platillos|instrumentos?',
  },
  {
    id: 'regulated',
    status: 'review',
    terms:
      'narguiles?|narguilas?|hookahs?|cachimbas?|pipas? de agua|bongs?|cbd|cannabidiol|delta ?8|kratom|papel(?:es)? para fumar|papelillos?|rolling papers?|grinders? (?:para|de) (?:hierba|tabaco)|moledor(?:es)? de hierba',
    cjk: '水烟|烟斗',
  },
  {
    id: 'freshfood',
    status: 'review',
    terms:
      'carnes?|meats?|pollo|chicken|cerdo|pork|beef|pescados?|fish|mariscos?|seafood|camaron(?:es)?|shrimp|quesos?|cheeses?|leche fresca|lacteos?|dairy|yogur(?:t)?s?|huevos?|eggs?|frutas?|fruits?|verduras?|vegetales?|vegetables?|hortalizas|embutidos?|jamon(?:es)?|salchichas?|chorizos?|semillas?|seeds?|plantas?|plants?|esquejes?|bulbos?|flores? (?:naturales|frescas)|fresh flowers|tierra (?:para plantas|de jardin)|soil|abono organico|alimentos? perecederos?|perishables?|animales? vivos?|live animals?|carne seca|beef jerky|jerky|sementes|graines',
    cjk: '生鲜|鲜肉|水果|蔬菜|种子|植物|鲜花|奶酪|海鲜|活体动物',
    unless:
      'macetas?|macetero|pots?|artificial(?:es)?|fake|para plantar|regaderas?|watering|bombillos?|focos?|light bulbs?|lamparas?|chia|girasol tostad|sunflower seeds|comida (?:de |para )|alimentos? (?:de |para )|pet food|dog food|cat food|(?:frutas?|fruits?) (?:secas|deshidratadas|dried)|dried fruits?|fruit snacks?|gomitas|leche en polvo|formula|proteinas?|protein|huevos? de (?:pascua|chocolate)|easter eggs?|kinder|ralladores?|graters?|tablas? de quesos|cheese boards?|peluches?|juguetes?|toys?|disfraz',
  },
  {
    id: 'valuables',
    status: 'review',
    terms:
      'dinero|efectivo|cash|billetes?|money|lingotes?|gold bars?|bullion|monedas? (?:de oro|de plata|antiguas|de coleccion)|oro|gold|joyas? de oro|joyeria fina|fine jewelry|diamantes?|diamonds?|cheques?|dinheiro|argent liquide|especes',
    cjk: '现金|钞票|金条|黄金|钻石',
    unless:
      'color oro|dorad[oa]s?|gold (?:tone|plated|color|colour)|banad[oa]s? en oro|chapad[oa]s? (?:de|en) oro|fantasia|bisuteria|costume|oro rosa|rose gold|golden|goldfish|billeteras?|wallets?|cajas? fuertes?|safes?|alcancias?|piggy banks?|monederos?|money clips?|contador(?:es)? de billetes|money counters?|monopoly|toy money|dinero de juguete|diamond painting|pintura de diamantes|diamantes? de imitacion|rhinestones?|zirconias?|cubic zirconia|gold ?fish',
  },

  // Devices with a price per unit (by air only)
  {
    id: 'phone',
    status: 'air',
    electronic: 'celular',
    device: true,
    terms:
      'celular(?:es)?|smartphones?|telefonos?(?: celular(?:es)?| inteligentes?| movil(?:es)?)?|telephones?(?: portables?)?|phones?|iphones?(?: \\d+)?|samsung galaxy|galaxy (?:s|a|m|note) ?\\d+|galaxy z (?:flip|fold) ?\\d*|google pixel|pixel \\d+|motorola|moto [gez] ?\\d*|xiaomi|redmi(?: note)?|poco [xfm] ?\\d+|oneplus|huawei|honor \\d+|oppo|realme|nokia|cell ?phones?|mobile phones?|movil(?:es)?|telefone celular',
    cjk: '手机|智能手机|苹果手机',
    unless:
      'fijos?|inalambricos?|de casa|de escritorio|landlines?|cordless|de juguete|toys?|cunas?|cribs?|galaxy (?:tab|watch|buds|book|fit|ring)|huawei (?:watch|band|matebook|matepad|freebuds)|xiaomi (?:scooter|band|watch|pad|tv|robot|aspiradora|buds)|redmi (?:pad|buds|watch)|motorola (?:radio|walkie|talkabout)|pixel (?:watch|buds|tablet)',
  },
  {
    id: 'tablet',
    status: 'air',
    electronic: 'tablet',
    device: true,
    terms:
      'tablets?|tabletas?|ipads?(?: mini| air| pro)?|galaxy tab|samsung tab|fire (?:hd|tablet)|kindle(?: paperwhite| fire)?|lenovo tab|matepad|xiaomi pad|redmi pad|surface (?:pro|go)|tablettes?|pixel tablet',
    cjk: '平板电脑|平板',
    unless:
      'chocolate|turron|tabletas? de (?:chocolate|vitaminas|pastillas)|de juguete|toys?|tablets? (?:de dibujo|graficas?)|drawing tablets?|wacom',
  },
  {
    id: 'laptop',
    status: 'air',
    electronic: 'laptop',
    device: true,
    terms:
      'laptops?|portatil(?:es)?|computadoras? portatil(?:es)?|computador(?:es)? portatil(?:es)?|notebooks?|netbooks?|macbooks?(?: air| pro)?|chromebooks?|ultrabooks?|thinkpad|ideapad|zenbook|vivobook|expertbook|inspiron|xps \\d+|pavilion|envy|spectre|elitebook|probook|omen|victus|legion(?! go)|predator|aspire|swift \\d|alienware|rog (?:strix|zephyrus|flow)|tuf gaming|surface laptop|matebook|galaxy book|ordinateurs? portables?',
    cjk: '笔记本电脑|手提电脑',
    unless:
      '(?:cargador(?:es)?|baterias?|parlantes?|bocinas?|altavoz|speakers?|aire acondicionado|ventilador(?:es)?|estufas?|refrigerador(?:es)?|neveras?|lamparas?|discos?|ssd|monitor(?:es)?|proyector(?:es)?|impresoras?|cunas?|corral(?:es)?|banos?|inodoros?|radios?|dvd|tv|televisor(?:es)?|lavadoras?|hornos?) portatil(?:es)?|papel|paper|cuadernos?|journals?|spiral|espiral|libretas?|moleskine|de juguete|toys?',
  },
  {
    id: 'xbox',
    status: 'air',
    electronic: 'xbox',
    device: true,
    console: true,
    terms: 'xbox(?: one| series [xs]| 360)?',
  },
  {
    id: 'playstation',
    status: 'air',
    electronic: 'playstation',
    device: true,
    console: true,
    terms: 'playstation(?: ?\\d)?|play station|ps ?[345]|ps vita|ps portal|psp',
  },

  // By sea, and it can be quoted by volume
  {
    id: 'baby',
    status: 'allowed',
    terms:
      'bebes?|baby|babies|panal(?:es)?|diapers?|toallitas? humedas?|baby wipes|wipes|biberon(?:es)?|pachas?|baby bottles?|chupon(?:es)?|chupetes?|chupetas?|pacifiers?|coches? (?:de |para )bebe|carriolas?|cochecitos?|strollers?|sillas? (?:de bebe )?(?:para |de )(?:carros?|autos?|coches?)|car ?seats?|portabebes?|baby carriers?|corral(?:es)?|playards?|pack n play|andaderas?|cunas? portatil(?:es)?|monitor(?:es)? de bebe|baby monitors?|extractor(?:es)? de leche|breast pumps?|mamelucos?|baberos?|bibs?|formulas? (?:infantil(?:es)?|para bebe)|baby formula|similac|enfamil|leche de formula|fraldas?|mamadeiras?|couches?|biberons?|poussettes?',
    cjk: '婴儿|宝宝|尿布|纸尿裤|奶瓶|奶嘴|婴儿车|安全座椅|奶粉',
  },
  {
    id: 'furniture',
    status: 'volume',
    terms:
      'muebles?|mobiliario|sofas?|sofa cama|sofacama|sillon(?:es)?|loveseats?|couch(?:es)?|futon(?:es)?|colchon(?:es)?|mattress(?:es)?|camas?|camarotes?|literas?|bases? de cama|box springs?|bed frames?|beds?|comedor(?:es)?|juegos? de (?:comedor|sala)|salas? completas?|mesas?|tables?|mesitas?|escritorios?|desks?|sillas?|chairs?|taburetes?|butacas?|mecedoras?|roperos?|armarios?|closets?|comodas?|gaveteros?|dressers?|wardrobes?|libreros?|estantes?|estanterias?|bookcases?|bookshel(?:f|ves)|repisas?|vitrinas?|aparador(?:es)?|muebles? de tv|centros? de entretenimiento|cunas?|cribs?|gabinetes?|cabinets?|puffs?|ottomans?|moveis|movel|colchao|cadeiras?|meubles?|canapes?|matelas|chaises?|armoires?',
    cjk: '家具|沙发|床垫|床|桌子|椅子|衣柜|书架',
    unless:
      'juegos? de mesa|board games?|jeux de societe|ping pong|tenis de mesa|sillas? de ruedas|wheelchairs?|sillas? de comer|high chairs?|camas? (?:de |para )(?:perros?|gatos?|mascotas?)|pet beds?|dog beds?|cat beds?|colchon(?:es)? inflables?|air mattress(?:es)?|colchonetas?|yoga|camping|sabanas?|sheets?|cubrecamas?|edredon(?:es)?|almohadas?|ropa de cama|bedding|cojin(?:es)?|tapetes?|manteles?|tablecloths?|lamparas?|lamps?|cobijas?|duvets?|comforters?|de juguete|toys?|munecas?|dolls?|plegables?|folding',
  },
  {
    id: 'appliances',
    status: 'volume',
    terms:
      'refrigeradoras?|refrigerador(?:es)?|refri|neveras?|congelador(?:es)?|freezers?|fridges?|refrigerators?|lavadoras?|washers?|washing machines?|secadoras?|dryers?|estufas?|cocinas? (?:de gas|electricas?|de \\d+ (?:quemadores|hornillas))|stoves?|hornos? (?:electricos?|de gas|empotrados?)|lavavajillas|lavaplatos|dishwashers?|aires? acondicionados?|air conditioners?|mini ?splits?|calentador(?:es)? de agua|water heaters?|caminadoras?|treadmills?|elipticas?|bicicletas? estaticas?|exercise bikes?|maquinas? de ejercicio|home gym|geladeiras?|maquinas? de lavar|refrigerateurs?|lave linge|machines? a laver',
    cjk: '冰箱|洗衣机|烘干机|空调|烤箱|洗碗机|跑步机|热水器',
    unless: 'pelo|cabello|hair|manos|hands|unas|nails|de juguete|toys?|maquillaje|skincare|munecas?',
  },

  // General merchandise
  {
    id: 'techaccessories',
    status: 'allowed',
    terms:
      'fundas?|carcasas?|protector(?:es)? de pantalla|screen protectors?|micas?|vidrios? templados?|cristal(?:es)? templados?|tempered glass|popsockets?|phone cases?|cases? para|capinhas?|coques?',
    unless:
      'almohadas?|pillows?|cojin(?:es)?|cushions?|sofas?|colchon(?:es)?|edredon(?:es)?|asientos?|seats?|guitarras?|lentes|gafas|anteojos|glasses|nordica|duvet|planchar|tabla',
  },
  {
    id: 'games',
    status: 'allowed',
    terms:
      'videojuegos?|video ?games?|juegos? (?:de|para) (?:xbox|ps5|ps4|playstation|nintendo|switch|pc)|consolas?|nintendo(?: switch)?|switch (?:2|oled|lite)|steam deck|rog ally|legion go|meta quest|oculus|quest [23]|gafas? vr|vr headsets?|game ?boy|control(?:es)? (?:de |para )?(?:xbox|ps5|ps4|playstation|switch|juego)|mandos?|joysticks?|gamepads?|dualsense|dualshock|joy ?cons?|amiibo|tarjetas? (?:de regalo )?(?:xbox|playstation|psn|nintendo|steam)|gift cards?|videogames?|jeux videos?|manettes?|consoles?',
    cjk: '游戏机|游戏|任天堂|手柄|主机',
  },
  {
    id: 'electronics',
    status: 'allowed',
    terms:
      'transmisor(?:es)? (?:bluetooth|de audio|wifi|hdmi|de video)|bluetooth transmitters?|audifonos?|auricular(?:es)?|headphones|earphones|earbuds|airpods(?: pro| max)?|galaxy buds|beats|bocinas?|parlantes?|altavoz|altavoces|speakers?|jbl|bose|sonos|barras? de sonido|soundbars?|smart ?watch(?:es)?|reloj(?:es)? inteligentes?|apple watch|galaxy watch|fitbit|garmin|amazfit|smart ?bands?|pulseras? inteligentes?|camaras?|cameras?|gopro|insta360|dji (?:osmo|pocket|action|mic|rs)|osmo pocket|lentes? (?:de |para )camaras?|camera lens(?:es)?|objetivos? (?:de )?camara|tripodes?|tripods?|ring ?lights?|aros? de luz|microfonos?|microphones?|monitor(?:es)?|monitors?|televisor(?:es)?|televisiones?|televisions?|tvs?|smart tvs?|pantallas? (?:de tv|smart|led|oled|qled|\\d{2})|proyector(?:es)?|projectors?|impresoras?|printers?|routers?|modems?|computadoras? de escritorio|computadoras?|computador(?:es)?|computers?|pc gamer|desktops?|imac|mac mini|mac studio|cpu|torres? (?:gamer|de pc)|tarjetas? (?:de video|graficas?|madre)|graphics cards?|gpu|rtx|ssd|discos? duros?|hard drives?|memorias? usb|usb|pendrives?|memorias?|micro ?sd|tarjetas? sd|sd cards?|teclados?|keyboards?|mouse|raton(?:es)?|alexa|echo dot|google home|nest|chromecast|fire tv|fire stick|roku|apple tv|e ?readers?|calculadoras?|calculators?|electronica|electronicos?|electronics|gadgets?|cargador(?:es)?|chargers?|cables?|adaptador(?:es)?|adapters?|camaras? de seguridad|security cameras?|ring doorbell|timbre inteligente|aspiradoras? robot|robots? aspirador(?:es)?|roomba|cepillos? de dientes electricos?|electric toothbrush(?:es)?|oral b|planchas? (?:de |para )(?:pelo|cabello)|alisadoras?|secadoras? (?:de |para )(?:pelo|cabello)|secador(?:es)? de pelo|hair ?dryers?|rizador(?:es)?|tenazas?|dyson|afeitadoras?|rasuradoras? electricas?|maquinas? de afeitar electricas?|electric shavers?|trimmers?|recortadoras?|barberas?|depiladoras?|masajeador(?:es)?|pistolas? de masaje|massage guns?|fones? de ouvido|caixas? de som|ecouteurs|enceintes?|casques?|telefonos? fijos?|telefonos? inalambricos?|landlines?|radios?|reproductor(?:es)?|mp3|ipods?|tocadiscos|turntables?|blu ?ray|dvd|regletas?|power strips?|tiras? led|led strips?|apple|samsung|sony|lg|lenovo|hp|dell|asus|acer|logitech|razer|anker|belkin|wacom|drawing tablets?|tablets? graficas?',
    cjk: '耳机|蓝牙耳机|音箱|音响|智能手表|手环|相机|摄像头|显示器|电视|投影仪|打印机|路由器|电脑|台式机|硬盘|键盘|鼠标|充电器|数据线|电子产品|吹风机|剃须刀|电动牙刷',
  },
  {
    id: 'sports',
    status: 'allowed',
    terms:
      'deportes?|deportivos?|sports?|pesas|weights|mancuernas?|dumbbells?|kettlebells?|barras? (?:olimpicas?|de pesas|para dominadas)|discos? de pesas|bandas? (?:elasticas?|de resistencia)|resistance bands?|colchonetas?|yoga mats?|mats? de yoga|esterillas?|guantes? de boxeo|boxing gloves|sacos? de boxeo|punching bags?|raquetas?|rackets?|palos? de golf|golf clubs?|pelotas? de (?:tenis|golf|futbol|basquet|beisbol|voleibol|ping pong)|balon(?:es)? de (?:futbol|basquet|voleibol)|bates?|bats?|guantes? de beisbol|cascos?|helmets?|bicicletas?|bicycles?|bikes?|bicis?|canas? de pescar|fishing rods?|carretes?|reels?|camping|tiendas? de campana|tents?|sacos? de dormir|sleeping bags?|hieleras?|coolers?|cuerdas? para saltar|jump ropes?|gimnasio|gym|fitness|esportes?|halteres|bicyclettes?|raquettes?',
    cjk: '运动器材|运动用品|体育用品|哑铃|瑜伽垫|健身|球拍|自行车|帐篷|钓鱼竿|睡袋',
  },
  {
    id: 'clothing',
    status: 'allowed',
    terms:
      'ropas?|vestimenta|prendas?|camisas?|camisetas?|camisolas?|playeras?|polos?|t ?shirts?|blusas?|tops?|pantalon(?:es)?|pantalonetas?|jeans?|blue ?jeans|joggers?|shorts?|bermudas?|vestidos?|faldas?|enaguas?|chaquetas?|chamarras?|abrigos?|sueter(?:es)?|sweaters?|sudaderas?|hoodies?|buzos?|ropa interior|calzon(?:es)?|calzoncillos?|boxers?|brasieres?|brasier|brassieres?|bras?|sosten(?:es)?|lenceria|lingerie|pijamas?|pyjamas?|calcetin(?:es)?|medias|socks?|leggings?|licras?|uniformes?|trajes? de bano|vestidos? de bano|bikinis?|swimsuits?|swimwear|trajes?|sacos?|blazers?|corbatas?|zapatos?|zapatillas?|tenis|sneakers?|shoes?|calzado|botas?|botin(?:es)?|boots?|sandalias?|sandals?|chinelas?|chancletas?|flip flops|tacon(?:es)?|heels|mocasin(?:es)?|crocs|gorras?|caps?|sombreros?|hats?|gorros?|cinturon(?:es)?|belts?|guantes?|gloves?|bufandas?|scarf|scarves|clothes|clothing|apparel|shirts?|pants|trousers|dress(?:es)?|skirts?|jackets?|coats?|underwear|roupas?|calcas?|sapatos?|vetements?|chemises?|pantalons?|robes?|chaussures?|baskets|nike|adidas|puma|reebok|new balance|under armour|converse|vans|skechers|asics|fila|gymshark|lululemon|shein|zara|h m|forever 21|old navy|gap|levis|levi s|tommy hilfiger|calvin klein|ralph lauren|lacoste|hollister|abercrombie|american eagle|jordans?|yeezy',
    cjk: '衣服|服装|衬衫|T恤|t恤|裤子|裙子|连衣裙|外套|夹克|鞋|运动鞋|靴子|凉鞋|内衣|袜子|帽子|围巾',
  },
  {
    id: 'accessories',
    status: 'allowed',
    terms:
      'bolsos?|carteras?|bolsas? de mano|handbags?|purses?|mochilas?|backpacks?|maletas?|valijas?|maletin(?:es)?|suitcases?|luggage|equipaje|billeteras?|wallets?|monederos?|cangureras?|rinoneras?|fanny packs?|lentes? de sol|lentes?|gafas(?: de sol)?|anteojos|sunglasses|eyeglasses|reloj(?:es)?|watch(?:es)?|joyeria|bisuteria|jewelry|jewellery|aretes?|pendientes|earrings?|collar(?:es)?|necklaces?|pulseras?|bracelets?|anillos?|rings?|cadenas?|dijes?|charms?|llaveros?|keychains?|paraguas|sombrillas?|umbrellas?|diademas?|scrunchies?|bolsas?|bags?|montres?|bijoux|lunettes|oculos|carteira|relogios?|pandora|michael kors|coach|kate spade|guess|fossil|ray ?ban|oakley',
    cjk: '手提包|背包|钱包|手表|太阳镜|眼镜|首饰|项链|耳环|戒指|手链|雨伞|行李箱',
  },
  {
    id: 'beauty',
    status: 'allowed',
    terms:
      'maquillajes?|makeup|make up|cosmeticos?|cosmetics|bases? de maquillaje|base liquida|labial(?:es)?|lapiz labial|lapices labiales|pintalabios|lipsticks?|lip ?gloss|brillos? labial(?:es)?|balsamos? labial(?:es)?|lip balms?|rimel|mascaras? de pestanas|mascara|sombras?|paletas? de sombras|eyeshadows?|rubor(?:es)?|blush|polvos?|corrector(?:es)?|concealers?|delineador(?:es)?|eyeliners?|brochas?|brushes?|esponjas?|beauty blender|cremas?|creams?|locion(?:es)? (?:corporal(?:es)?|hidratantes?)|body lotions?|lotions?|hidratantes?|moisturizers?|serums?|acido hialuronico|hyaluronic acid|niacinamidas?|niacinamide|retinol|acido salicilico|salicylic acid|skincare|skin care|cuidado de la piel|mascarillas?|face masks?|sheet masks?|protector(?:es)? solar(?:es)?|bloqueador(?:es)?|sunscreens?|sunblock|champu|shampoo|acondicionador(?:es)?|conditioners?|jabon(?:es)?|soaps?|gel de bano|body wash|desodorantes?|deodorants?|antitranspirantes?|pastas? dentales?|cremas? dentales?|toothpaste|cepillos? de dientes|toothbrush(?:es)?|hilo dental|floss|enjuague bucal|mouthwash|tintes? (?:para|de) (?:pelo|cabello)|hair dyes?|tratamientos? capilar(?:es)?|aceites? (?:para el |de )?(?:pelo|cabello)|hair oils?|unas postizas|press on|pestanas postizas|false lashes|cera depilatoria|rastrillos?|razors?|toallas? sanitarias?|tampones|copas? menstrual(?:es)?|cuidado personal|personal care|belleza|beauty|maquiagem|maquillage|cerave|the ordinary|neutrogena|la roche posay|olay|maybelline|loreal|l oreal|nyx|elf|e l f|fenty|rare beauty|clinique|estee lauder|dove|nivea|bath (?:and |y )?body works|victoria s secret',
    cjk: '化妆品|口红|粉底|眼影|睫毛膏|护肤|面霜|乳液|精华|面膜|防晒霜|洗发水|护发素|沐浴露|香皂|牙膏|牙刷|洗面奶',
  },
  {
    id: 'supplements',
    status: 'allowed',
    terms:
      'vitaminas?|vitamins?|suplementos?|supplements?|multivitaminicos?|multivitamins?|omega ?3|colagenos?|collagen|proteinas?(?: en polvo)?|protein(?: powder)?|whey|creatinas?|creatine|pre ?entrenos?|pre ?workouts?|melatonina|melatonin|biotina|biotin|probioticos?|probiotics?|magnesio|magnesium|zinc|hierro|calcio|calcium|centrum|gomitas? (?:de )?vitaminas|vitamin gummies|complementos? alimenticios?|suplementos? alimenticios?|complements? alimentaires?|vitamines?',
    cjk: '维生素|保健品|营养品|蛋白粉|鱼油|胶原蛋白',
  },
  {
    id: 'home',
    status: 'allowed',
    terms:
      'hogar|home decor|decoracion|decor|utensilios?(?: de cocina)?|bateria de cocina|juegos? de ollas|ollas?|sartenes?|sarten|cookware|pots|pans|platos?|plates|vajillas?|vasos?|copas?|tazas?|mugs?|cups?|cubiertos?|cutlery|cuchillos?|knives|knife|tablas? de picar|cutting boards?|termos?|thermos|botellas?|bottles?|tupperware|recipientes?|contenedor(?:es)?|containers?|licuadoras?|blenders?|cafeteras?|coffee makers?|keurig|nespresso|freidoras?(?: de aire)?|air ?fryers?|microondas|microwaves?|ollas? (?:arroceras?|de presion|instantaneas?|electricas?)|arroceras?|instant pot|tostadoras?|toasters?|batidoras?|mixers?|procesador(?:es|as)? de alimentos|food processors?|exprimidor(?:es)?|extractor(?:es)? de jugo|juicers?|sabanas?|bed ?sheets?|ropa de cama|bedding|edredon(?:es)?|cobijas?|frazadas?|mantas?|blankets?|duvets?|comforters?|almohadas?|pillows?|cojin(?:es)?|cushions?|toallas?|towels?|cortinas?|curtains?|alfombras?|tapetes?|rugs?|lamparas?|lamps?|bombillos?|focos?|bombillas?|light bulbs?|espejos?|mirrors?|cuadros?|marcos?|portarretratos?|picture frames?|reloj(?:es)? de pared|velas?|candles?|difusor(?:es)?|organizador(?:es)?|organizers?|ganchos?|percheros?|aspiradoras?|vacuums?|planchas?(?: de ropa| a vapor)?|irons?|vaporizador(?:es)? para ropa|garment steamers?|ventilador(?:es)?|fans|purificador(?:es)? de aire|air purifiers?|humidificador(?:es)?|humidifiers?|deshumidificador(?:es)?|limpieza|cleaning|escobas?|trapeador(?:es)?|mops?|detergentes?|suavizantes?|maquinas? de coser|sewing machines?|telas?|fabrics?|manualidades|crafts|hilos?|cocina|kitchen|cozinha|panelas?|cuisine|casseroles?|vaisselle',
    cjk: '厨具|锅|碗|盘子|杯子|餐具|刀具|床单|被子|枕头|毛巾|窗帘|地毯|台灯|镜子|装饰|家居|吸尘器|电风扇|搅拌机|咖啡机|空气炸锅|微波炉|蜡烛',
  },
  {
    id: 'tools',
    status: 'allowed',
    terms:
      'pistolas? (?:de )?(?:silicona?|silicone|calor|pegamento|clavos|grapas|soldar|aire caliente|impacto)|glue guns?|hot glue|heat guns?|nail guns?|staple guns?|herramientas?|tools?|taladros?|drills?|destornillador(?:es)?|screwdrivers?|martillos?|hammers?|llaves? (?:inglesas?|de tubo|allen|de impacto|de torque|mixtas?)|wrenches?|alicates?|pinzas|pliers|sierras?|saws?|cajas? de herramientas|toolbox(?:es)?|tornillos?|screws?|clavos|nails|brocas?|drill bits?|lijadoras?|sanders?|esmeril(?:es)?|grinders?|pulidoras?|polishers?|multimetros?|multimeters?|cintas? metricas?|tape measures?|soldador(?:es)?|soldering|compresor(?:es)?|compressors?|generador(?:es)?|generators?|repuestos?|piezas? (?:de |para )(?:carros?|autos?|motos?|vehiculos?|camion(?:es)?)|autopartes|auto ?parts|car parts|spare parts|llantas?|neumaticos?|tires?|tyres?|rin(?:es)?|aros?|frenos?|brakes?|pastillas? de freno|brake pads?|bujias?|spark plugs?|filtros?|filters?|amortiguador(?:es)?|shocks|faros?|headlights?|retrovisor(?:es)?|aceites? de motor|motor oil|lubricantes?|pinturas?|rodillos?|ferreteria|hardware|cerraduras?|locks?|candados?|padlocks?|bisagras?|tuberias?|pvc|plomeria|plumbing|breakers?|interruptor(?:es)?|tomacorrientes?|enchufes?|extension(?:es)?|extension cords?|ferramentas?|outils?|perceuses?',
    cjk: '工具|电钻|螺丝刀|锤子|扳手|钳子|锯|汽车配件|轮胎|零件|五金|机油',
  },
  {
    id: 'toys',
    status: 'allowed',
    terms:
      'juguetes?|toys?|munecas?|munecos?|dolls?|barbie|peluches?|plush(?:ies)?|stuffed animals?|legos?|bloques? de construccion|juegos? de mesa|board games?|rompecabezas|puzzles?|carritos?|hot wheels|pelotas?|balls?|balon(?:es)?|nerf|pistolas? de agua|water guns?|figuras? de accion|action figures?|funko(?: pop)?|pokemon|cartas coleccionables|trading cards|play ?doh|plastilina|slime|juegos? didacticos?|didacticos?|triciclos?|patin(?:es)?|roller skates?|skates?|skateboards?|patinetas?|monopatin(?:es)?|scooters?|columpios?|resbaladeras?|trampolin(?:es)?|piscinas? inflables?|inflables?|disfraces?|disfraz|costumes?|brinquedos?|jouets?|poupees?|jeux de societe|juegos?',
    cjk: '玩具|娃娃|毛绒|乐高|积木|拼图|桌游|玩偶',
  },
  {
    id: 'books',
    status: 'allowed',
    terms:
      'libros?|books?|novelas?|revistas?|magazines?|comics?|mangas?|biblias?|bibles?|cuadernos?|libretas?|agendas?|planners?|journals?|lapices|lapiz|lapiceros?|boligrafos?|plumas?|pens?|pencils?|marcador(?:es)?|markers?|resaltador(?:es)?|highlighters?|crayon(?:es)?|crayolas?|colores|utiles(?: escolares)?|school supplies|papeleria|stationery|papel|paper|folders?|carpetas?|engrapadoras?|staplers?|livros?|cadernos?|canetas?|livres?|cahiers?|stylos?|papeterie',
    cjk: '书籍|图书|小说|杂志|漫画|本子|铅笔|钢笔|文具|圣经|书',
  },
  {
    id: 'documents',
    status: 'allowed',
    terms:
      'documentos?|documents?|papeles|cartas?|letters?|sobres?|envelopes?|titulos?|diplomas?|certificados?|pasaportes?|passports?',
    cjk: '文件|证件|信件',
  },
  {
    id: 'pets',
    status: 'allowed',
    terms:
      'mascotas?|pets?|(?:comida|alimentos?|concentrado|croquetas?|juguetes?|camas?|collar(?:es)?|correas?|arneses?|platos?|comederos?|bebederos?|jaulas?|transportadoras?|ropa|shampoo|champu|arena|premios|snacks?) (?:de |para )(?:mi |el |la )?(?:perros?|gatos?|mascotas?|cachorros?|gatitos?|aves?|pajaros?|peces?|hamster|conejos?)|pet food|dog food|cat food|dog toys?|cat toys?|dog beds?|cat beds?|pet beds?|leash(?:es)?|cat litter|arena para gatos?|rascador(?:es)?|scratching posts?|acuarios?|peceras?|aquariums?|pet carriers?|purina|pedigree|royal canin|pet ?shop|animaux',
    cjk: '宠物|猫粮|狗粮|猫砂|狗绳|宠物玩具',
  },
  {
    id: 'packagedfood',
    status: 'allowed',
    terms:
      'alimentos? (?:empacados?|enlatados?|no perecederos?)|snacks?|dulces?|chocolates?|golosinas?|candy|candies|caramelos?|chicles?|gum|galletas?|cookies?|crackers?|cereal(?:es)?|avena|oatmeal|granola|cafe|coffee|te (?:verde|negro|helado)|tea|especias?|spices?|condimentos?|sazonador(?:es)?|salsas?|sauces?|enlatados?|canned (?:food|goods)|conservas?|frutas? (?:secas|deshidratadas)|dried fruits?|frutos secos|nueces|nuts|almendras?|almonds?|mani|cacahuates?|peanuts?|mantequilla de mani|peanut butter|nutella|miel|honey|azucar|sugar|harinas?|flour|pastas?|arroz|rice|sopas? instantaneas?|ramen|maruchan|aceites? de (?:oliva|coco|cocina)|olive oil|leche en polvo|powdered milk|gomitas?|gummies|jalea|mermeladas?|jams?|chia|comida empacada|comida enlatada|alimentos|food|comida|biscoitos?|doces|bonbons?|biscuits?',
    cjk: '零食|糖果|巧克力|饼干|咖啡|茶叶|调料|罐头|坚果|蜂蜜|方便面|食品',
  },
];

/** A case, a charger, a game… beside a device: the article is the accessory, not the device. */
export const DEVICE_EXTRAS =
  /\b(?:fundas?|cases?|carcasas?|estuches?|covers?|protector(?:es)?|micas?|vidrios? templados?|cristal(?:es)? templados?|screen protectors?|tempered glass|cargador(?:es)?|chargers?|cables?|adaptador(?:es)?|adapters?|soportes?|stands?|holders?|mounts?|bases? de carga|docks?|correas?|straps?|lapiz|lapices|pencils?|stylus|teclados?|keyboards?|mouse|raton(?:es)?|audifonos?|auricular(?:es)?|earbuds|headphones|airpods|skins?|stickers?|calcomanias?|repuestos?|replacement|pantallas? (?:de )?repuesto|bolsos?|mochilas?|sleeves?|capas?|capinhas?|peliculas?|carregador(?:es)?|cabos?|suportes?|coques?|etuis?|chargeurs?|supports?|anillos?|ring holders?|popsockets?|gimbals?|tripodes?|selfie|coolers?|enfriador(?:es)?|base enfriadora|juegos?|videojuegos?|games?|control(?:es)?|controllers?|mandos?|joysticks?|gamepads?|dualsense|dualshock|volantes?|headsets?|vr|tarjetas? de regalo|gift cards?|membresias?|suscripcion(?:es)?|game pass|ps plus)\b|手机壳|保护壳|保护套|充电器|数据线|贴膜|支架|键盘|鼠标|游戏|手柄/;

/** "iPhone con funda" is still an iPhone; "funda con soporte para iPhone" is an accessory. */
export const DEVICE_BUNDLE = /\b(?:con|with|com|avec|incluye|includes?|bundle|combo|pack)\b/;

/**
 * Words of Russian and Arabic for the kinds of article people ask about most, by the rule's id.
 * Carinova's catalogue is written in the languages its page came in; the site has these two as
 * well, and what cannot be brought already answers in them from the lists of
 * /articulos-prohibidos. Whole words, compared the way those lists are (utils/restricted.ts).
 */
export const ARTICLE_WORDS: Record<string, Array<string>> = {
  phone: [
    'телефон',
    'телефоны',
    'смартфон',
    'смартфоны',
    'мобильный телефон',
    'айфон',
    'هاتف',
    'الهاتف',
    'هواتف',
    'جوال',
    'الجوال',
    'موبايل',
    'ايفون',
    'هاتف محمول',
    'هاتف ذكي',
  ],
  tablet: ['планшет', 'планшеты', 'айпад', 'تابلت', 'جهاز لوحي', 'ايباد'],
  laptop: ['ноутбук', 'ноутбуки', 'макбук', 'لابتوب', 'حاسوب محمول', 'كمبيوتر محمول', 'ماك بوك'],
  furniture: [
    'мебель',
    'диван',
    'диваны',
    'кровать',
    'матрас',
    'стол',
    'стул',
    'шкаф',
    'кресло',
    'اثاث',
    'الاثاث',
    'اريكة',
    'كنبة',
    'سرير',
    'مرتبة',
    'طاولة',
    'كرسي',
    'خزانة',
  ],
  appliances: ['холодильник', 'стиральная машина', 'кондиционер', 'ثلاجة', 'غسالة', 'مكيف'],
  clothing: [
    'одежда',
    'обувь',
    'кроссовки',
    'платье',
    'футболка',
    'джинсы',
    'куртка',
    'ملابس',
    'حذاء',
    'احذية',
    'فستان',
    'قميص',
  ],
  toys: ['игрушка', 'игрушки', 'لعبة اطفال', 'العاب اطفال', 'دمية'],
  books: ['книга', 'книги', 'كتاب', 'كتب'],
  beauty: ['косметика', 'шампунь', 'مكياج', 'شامبو'],
};

/** In those two languages: what beside a device makes the article an accessory… */
export const ACCESSORY_WORDS = [
  'чехол',
  'чехлы',
  'зарядка',
  'зарядное устройство',
  'кабель',
  'наушники',
  'защитное стекло',
  'игра',
  'игры',
  'геймпад',
  'غطاء',
  'جراب',
  'حافظة',
  'شاحن',
  'كابل',
  'سماعة',
  'سماعات',
  'واقي شاشة',
];

/** …unless it comes with the device: "телефон с чехлом", "هاتف مع غطاء". */
export const BUNDLE_WORDS = ['с', 'со', 'в комплекте', 'مع'];
