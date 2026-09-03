import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Accessibilité : si l'utilisateur demande moins d'animation, on accélère
// la timeline globale plutôt que de la supprimer. Les états finaux et les
// callbacks onComplete (routage, affichage des vues) restent donc intacts.
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(80);
}

// ══════════════════════════════════════════════
//   DAR SAFIA — CATALOGUE OFFICIEL (45 PARFUMS)
//   Images standard de haute joaillerie & parfumerie
// ══════════════════════════════════════════════
export const perfumeCatalog = [
  // ─── FEMME & FLORAUX / GOURMANDS ───
  {
    id: 1,
    name: 'Prada Paradoxe',
    brand: 'Prada',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'amber'],
    price: 23500,
    priceFormatted: '23 500 DA',
    volume: '90ml Eau de Parfum',
    badge: 'Coup de Cœur',
    rating: '4.9',
    reviewsCount: 142,
    desc: "Une célébration de l'expression multidimensionnelle féminine. Un bouquet de fleurs blanches immortalisé par un accord d'ambre chaud et de musc révolutionnaire.",
    story: "Conçu par les maîtres parfumeurs Nadège Le Garlantezec et Antoine Maisondieu, Paradoxe réconcilie la fraîcheur du néroli avec la sensualité d'un ambre exclusif.",
    img: '/img/perfumes/rose.webp',
    top: 'Néroli de Calabre, Bergamote, Mandarine',
    heart: 'Jasmin Sambac, Fleur d’Oranger, Cœur de Néroli',
    base: 'Ambrofix, Musc Blanc Serenolide, Benjoin de Siam',
    longevity: '48h',
    sillage: 'Puissant & Rayonnant',
    concentration: 'Eau de Parfum (22%)'
  },
  {
    id: 2,
    name: 'Prada Paradoxe Intense',
    brand: 'Prada',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'amber'],
    price: 25500,
    priceFormatted: '25 500 DA',
    volume: '90ml Eau de Parfum Intense',
    badge: 'Intense',
    rating: '5.0',
    reviewsCount: 98,
    desc: "L'intensité réinventée. Une signature florale ambrée magnifiée par une surdose de jasmin précieux et une profondeur boisée d'une sensualité captivante.",
    story: "L'expression la plus intense de Paradoxe, où la délicatesse florale rencontre la puissance d'accords ambrés profonds pour une présence inoubliable.",
    img: '/img/perfumes/rose.webp',
    top: 'Essence de Néroli, Bergamote, Accord Poire',
    heart: 'Jasmin Grandiflorum, Accord Mousse, Fleur d’Oranger',
    base: 'Ambrofix, Vanille Bourbon, Accord Boisé Sombre',
    longevity: '48h+',
    sillage: 'Intense & Envoûtant',
    concentration: 'Eau de Parfum Intense (26%)'
  },
  {
    id: 3,
    name: 'Valentino Donna Born In Roma',
    brand: 'Valentino',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'amber'],
    price: 24800,
    priceFormatted: '24 800 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Best Seller',
    rating: '4.9',
    reviewsCount: 215,
    desc: "Une élégance haute couture romaine mêlée à une touche d'audace contemporaine. Trois variétés de jasmin sublimées par une vanille Bourbon d'une rare noblesse.",
    story: "Inspiré par la grandeur éternelle de la cité de Rome et l'esprit rebelle de la haute couture Valentino.",
    img: '/img/perfumes/rose.webp',
    top: 'Cassis, Poivre Rose, Bergamote Italienne',
    heart: 'Jasmin Sambac, Jasmin Grandiflorum, Thé au Jasmin',
    base: 'Vanille Bourbon, Bois de Gaïac, Cachemire',
    longevity: '36h',
    sillage: 'Chic & Remarquable',
    concentration: 'Eau de Parfum (20%)'
  },
  {
    id: 4,
    name: 'Valentino Donna Born In Roma Intense',
    brand: 'Valentino',
    gender: 'femme',
    category: 'amber',
    catLabels: ['femme', 'amber', 'floral'],
    price: 26800,
    priceFormatted: '26 800 DA',
    volume: '100ml Eau de Parfum Intense',
    badge: 'Haute Intensité',
    rating: '4.9',
    reviewsCount: 87,
    desc: "L'ode magnétique aux nuits éternelles de Rome. Une vanille envoûtante s'embrase au contact du benjoin ambré et du jasmin solaire.",
    story: "Une célébration nocturne de la passion romaine dans sa concentration la plus riche et luxueuse.",
    img: '/img/perfumes/amber.webp',
    top: 'Vanille Bourbon, Bergamote Solaire',
    heart: 'Trio de Jasmins Nobles, Accord Floral Nuit',
    base: 'Résine de Benjoin, Bois Précieux',
    longevity: '48h',
    sillage: 'Magnétique',
    concentration: 'Eau de Parfum Intense (25%)'
  },
  {
    id: 5,
    name: 'Rabanne Fame In Love',
    brand: 'Paco Rabanne',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'gourmand'],
    price: 22800,
    priceFormatted: '22 800 DA',
    volume: '80ml Parfum',
    badge: 'Nouveauté',
    rating: '4.8',
    reviewsCount: 76,
    desc: "L'essence irrésistible de la féminité parisienne. Une mangue pulpeuse et succulente mariée à un jasmin d'une clarté lumineuse et un encens addictif.",
    story: "Hommage à l'esprit glamour et avant-gardiste de la maison Rabanne, un sillage fruité-floral d'une gourmandise irrésistible.",
    img: '/img/perfumes/rose.webp',
    top: 'Mangue Sucrée, Bergamote Lumineuse',
    heart: 'Jasmin Lumineux Pur, Fleur d’Encens',
    base: 'Bois de Santal Onctueux, Vanille Noire',
    longevity: '36h',
    sillage: 'Addictif',
    concentration: 'Parfum Concentré'
  },
  {
    id: 6,
    name: 'Lancôme Idôle Peach & Rose',
    brand: 'Lancôme',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'fresh'],
    price: 22800,
    priceFormatted: '22 800 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Élégance',
    rating: '4.8',
    reviewsCount: 164,
    desc: "Un souffle de liberté et de grâce. Une rose moderne infusée de pêche veloutée et de vanille aérienne qui caresse la peau d'une fraîcheur éclatante.",
    story: "Créé par des femmes pour les femmes qui conquièrent leur propre destinée avec douceur et détermination.",
    img: '/img/perfumes/fresh.webp',
    top: 'Pêche Blanche Juteuse, Poire Fondante',
    heart: 'Rose Ispahan Soufflée, Jasmin Pétale',
    base: 'Vanille de Madagascar, Muscs Propres, Cèdre',
    longevity: '36h',
    sillage: 'Lumineux & Propre',
    concentration: 'Eau de Parfum'
  },
  {
    id: 7,
    name: 'Viktor & Rolf Flowerbomb (La Bomba)',
    brand: 'Viktor & Rolf',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'gourmand'],
    price: 21500,
    priceFormatted: '21 500 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Culte',
    rating: '4.9',
    reviewsCount: 310,
    desc: "Une véritable explosion florale opulente et voluptueuse. Des milliers de fleurs transformées en une traînée de charme ensorcelante et gourmande.",
    story: "Le parfum mythique qui a transformé la haute parfumerie en une bombe d'émotions positives et florales.",
    img: '/img/perfumes/ruby.webp',
    top: 'Thé Vert, Bergamote, Osmanthus',
    heart: 'Orchidée Cattleya, Rose Centifolia, Jasmin Sambac',
    base: 'Patchouli Pur, Vanille Gourmande, Musc',
    longevity: '48h',
    sillage: 'Opulent & Inoubliable',
    concentration: 'Eau de Parfum'
  },
  {
    id: 8,
    name: 'Rochas Audace',
    brand: 'Rochas',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'amber'],
    price: 12800,
    priceFormatted: '12 800 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Artisanal',
    rating: '4.7',
    reviewsCount: 52,
    desc: "Le chic parisien incarné avec panache. Un accord chypré floral vintage aux notes riches de prune veloutée, de mousse de chêne et de fleurs d'oranger.",
    story: "L'élégance audacieuse et intemporelle de la haute couture française des années dorées.",
    img: '/img/perfumes/emerald.webp',
    top: 'Fleur d’Oranger, Prune Mirabelle, Bergamote',
    heart: 'Ylang-Ylang, Jasmin Mystique, Rose Poudrée',
    base: 'Mousse de Chêne, Ambre Gris, Bois de Santal',
    longevity: '36h',
    sillage: 'Chic & Vintage',
    concentration: 'Eau de Parfum'
  },
  {
    id: 9,
    name: 'Dolce & Gabbana Devotion (Femme)',
    brand: 'Dolce & Gabbana',
    gender: 'femme',
    category: 'gourmand',
    catLabels: ['femme', 'gourmand', 'fresh'],
    price: 13900,
    priceFormatted: '13 900 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Gourmandise',
    rating: '4.9',
    reviewsCount: 180,
    desc: "Une déclaration d'amour solaire aux racines italiennes. Un citron confit croustillant ouvre la voie à une fleur d'oranger rayonnante et une vanille bourbon onctueuse.",
    story: "Inspiré par le Sacré-Cœur emblématique de D&G, symbole de dévotion inconditionnelle et de passion gourmande.",
    img: '/img/perfumes/ruby.webp',
    top: 'Citron d’Italie Confit, Zestes Sucrés',
    heart: 'Fleur d’Oranger Lumineuse, Panna Cotta',
    base: 'Vanille de Madagascar Précieuse',
    longevity: '36h',
    sillage: 'Solaire & Gourmand',
    concentration: 'Eau de Parfum'
  },
  {
    id: 10,
    name: 'Chloé Le Parfum',
    brand: 'Chloé',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral'],
    price: 21500,
    priceFormatted: '21 500 DA',
    volume: '100ml Le Parfum',
    badge: 'Iconique',
    rating: '4.9',
    reviewsCount: 195,
    desc: "La pure quintessence de la rose Chloé magnifiée à son apogée. Un parfum raffiné, intemporel et follement envoûtant.",
    story: "La liberté d'esprit et l'élégance naturelle de la femme Chloé sublimées par une rose damascena éclatante.",
    img: '/img/perfumes/rose.webp',
    top: 'Litchi Rosé, Pivoine Royale, Freesia',
    heart: 'Rose Damascena Intense, Muguet Frais',
    base: 'Bois de Cèdre de Virginie, Ambre Doré',
    longevity: '36h',
    sillage: 'Poudré & Distingué',
    concentration: 'Le Parfum'
  },
  {
    id: 11,
    name: 'My Burberry Blush',
    brand: 'Burberry',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'fresh'],
    price: 15500,
    priceFormatted: '15 500 DA',
    volume: '90ml Eau de Parfum',
    badge: 'Printemps Éternel',
    rating: '4.8',
    reviewsCount: 88,
    desc: "Inspiré par le premier réveil d'un jardin londonien à l'aube. Une énergie pétillante de grenade givrée et de pétales de rose saupoudrés de rosée.",
    story: "Capturant les premières lueurs du jour sur les jardins royaux de Londres, frais et pétillant.",
    img: '/img/perfumes/rose.webp',
    top: 'Grenade Glacée, Citron Pétillant',
    heart: 'Pétales de Rose, Pomme Verte Croquante, Géranium',
    base: 'Jasmin Blanc, Glycine',
    longevity: '30h',
    sillage: 'Frais & Pétillant',
    concentration: 'Eau de Parfum'
  },
  {
    id: 12,
    name: 'My Burberry (Eau de Parfum)',
    brand: 'Burberry',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral'],
    price: 14800,
    priceFormatted: '14 800 DA',
    volume: '90ml Eau de Parfum',
    badge: 'Classique',
    rating: '4.8',
    reviewsCount: 112,
    desc: "L'icône absolue du trench-coat Burberry en parfum. Un bouquet floral grand style empreint d'une pluie printanière sur des roses de Damas.",
    story: "L'esprit de l'artisanat britannique et du trench-coat iconique, réinterprété en haute parfumerie.",
    img: '/img/perfumes/amber.webp',
    top: 'Pois de Senteur, Bergamote, Mandarine',
    heart: 'Géranium d’Afrique, Freesia, Coing Doré',
    base: 'Rose de Damas, Rose Centifolia, Patchouli',
    longevity: '36h',
    sillage: 'Grand Style',
    concentration: 'Eau de Parfum'
  },
  {
    id: 13,
    name: "Givenchy L'Interdit Rouge",
    brand: 'Givenchy',
    gender: 'femme',
    category: 'amber',
    catLabels: ['femme', 'amber', 'floral'],
    price: 21000,
    priceFormatted: '21 000 DA',
    volume: '80ml Eau de Parfum Rouge',
    badge: 'Sensualité Brûlante',
    rating: '4.9',
    reviewsCount: 220,
    desc: "L'attraction de l'interdit poussée à l'obsession. Une tubéreuse blanche charnelle enflammée par une orange sanguine ardente et un accord épicé rouge.",
    story: "L'audace de franchir la ligne rouge. Une sensualité incandescente qui consume tout sur son passage.",
    img: '/img/perfumes/ruby.webp',
    top: 'Orange Sanguine de Sicile, Gingembre Rouge',
    heart: 'Tubéreuse d’Inde, Jasmin Sambac, Piment Doux',
    base: 'Patchouli d’Indonésie, Bois de Santal, Vétiver',
    longevity: '48h',
    sillage: 'Incandescent & Fatal',
    concentration: 'Eau de Parfum Rouge'
  },
  {
    id: 14,
    name: "Givenchy L'Interdit Rouge Ultime",
    brand: 'Givenchy',
    gender: 'femme',
    category: 'amber',
    catLabels: ['femme', 'amber', 'gourmand'],
    price: 22500,
    priceFormatted: '22 500 DA',
    volume: '80ml Eau de Parfum Ultime',
    badge: 'Ultime Réserve',
    rating: '5.0',
    reviewsCount: 94,
    desc: "Le summum du magnétisme. L'accord floral blanc iconique s'enveloppe de coques de cacao recyclées et d'un patchouli sombre d'une richesse infinie.",
    story: "L'ultime tentation où la fleur blanche charnelle s'unit à la gourmandise sombre du cacao torréfié.",
    img: '/img/perfumes/ruby.webp',
    top: 'Fleur d’Oranger de Tunisie, Coques de Cacao Torréfié',
    heart: 'Tubéreuse Sombre, Jasmin Grandiflorum',
    base: 'Patchouli Cacao, Ambroxan, Vétiver Bourbon',
    longevity: '48h+',
    sillage: 'Addiction Sombre',
    concentration: 'Eau de Parfum Ultime'
  },
  {
    id: 15,
    name: 'Givenchy Irrésistible',
    brand: 'Givenchy',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'fresh'],
    price: 20800,
    priceFormatted: '20 800 DA',
    volume: '80ml Eau de Parfum',
    badge: 'Féminité Radieuse',
    rating: '4.8',
    reviewsCount: 140,
    desc: "Une invitation magnétique au lâcher-prise. Une rose antimorose ultra-lumineuse qui danse avec un bois blond éclatant et une poire délicieusement juteuse.",
    story: "Une bouffée d'énergie joyeuse pour celles qui s'expriment librement et avec élégance.",
    img: '/img/perfumes/rose.webp',
    top: 'Poire Sucrée, Ambrette d’Équateur',
    heart: 'Rose Essential Grasse, Iris Précieux',
    base: 'Bois de Cèdre de Virginie, Muscs Blancs',
    longevity: '36h',
    sillage: 'Radieux & Dansant',
    concentration: 'Eau de Parfum'
  },
  {
    id: 16,
    name: "Dior J'adore Intense",
    brand: 'Christian Dior',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'amber'],
    price: 29000,
    priceFormatted: '29 000 DA',
    volume: '100ml Eau de Parfum Intense',
    badge: 'Haute Parfumerie',
    rating: '5.0',
    reviewsCount: 340,
    desc: "L'or liquide de la Maison Dior. Un bouquet floral magistral composé d'absolus de fleur d'oranger, de jasmin de Grasse et de rose centifolia.",
    story: "Le chef-d'œuvre de la parfumerie Dior composé comme une ode à la féminité majestueuse.",
    img: '/img/perfumes/amber.webp',
    top: 'Fleur d’Oranger Solaire, Ylang-Ylang des Comores',
    heart: 'Jasmin Grandiflorum de Grasse, Rose de Mai',
    base: 'Bois de Santal Onctueux, Vanille d’Or',
    longevity: '48h',
    sillage: 'Impérial & Solaire',
    concentration: 'Eau de Parfum Intense'
  },
  {
    id: 17,
    name: 'Jean Paul Gaultier Divine Couture',
    brand: 'Jean Paul Gaultier',
    gender: 'femme',
    category: 'gourmand',
    catLabels: ['femme', 'gourmand', 'floral'],
    price: 23800,
    priceFormatted: '23 800 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Couture Divine',
    rating: '4.9',
    reviewsCount: 155,
    desc: "Un hommage éclatant à toutes les femmes divines. Une alliance spectaculaire de lys blanc majestueux, de meringue gourmande et d'un souffle marin salé unique.",
    story: "Le corset iconique de Gaultier transformé en un bijou d'or pour une fragrance sensationnelle et salée-sucrée.",
    img: '/img/perfumes/ruby.webp',
    top: 'Calypso Marin, Bergamote, Fruits Rouges',
    heart: 'Lys Majestueux, Jasmin Étoilé, Ylang-Ylang',
    base: 'Meringue Sucrée, Musc Blanc, Patchouli Doré',
    longevity: '48h',
    sillage: 'Divin & Sucré-Salé',
    concentration: 'Eau de Parfum'
  },
  {
    id: 18,
    name: "L'Instant de Guerlain Femme",
    brand: 'Guerlain',
    gender: 'femme',
    category: 'amber',
    catLabels: ['femme', 'amber', 'floral'],
    price: 13900,
    priceFormatted: '13 900 DA',
    volume: '75ml Eau de Parfum',
    badge: 'Trésor Guerlain',
    rating: '4.8',
    reviewsCount: 96,
    desc: "L'instant où tout peut basculer dans la passion. Un miel d'agrumes lumineux se fond dans un magnolia opulent et un sillage d'ambre cristallin.",
    story: "Créé par la plus ancienne maison de parfum au monde, un moment d'émotion pure figé dans le temps.",
    img: '/img/perfumes/amber.webp',
    top: 'Miel d’Agrumes, Bergamote, Mandarine',
    heart: 'Magnolia Blanc, Ylang-Ylang, Jasmin Sambac',
    base: 'Ambre Cristallin, Benjoin, Bois de Santal',
    longevity: '36h',
    sillage: 'Raffiné & Chaleureux',
    concentration: 'Eau de Parfum'
  },
  {
    id: 19,
    name: "Dolce & Gabbana L'Impératrice",
    brand: 'Dolce & Gabbana',
    gender: 'femme',
    category: 'fresh',
    catLabels: ['femme', 'fresh', 'floral'],
    price: 9800,
    priceFormatted: '9 800 DA',
    volume: '100ml Eau de Toilette',
    badge: 'Best Value',
    rating: '4.8',
    reviewsCount: 280,
    desc: "Une explosion fruitée et magnétique qui captive instantanément. Pastèque succulente, kiwi exotique et cyclamen rose sur fond de muscs veloutés.",
    story: "Inspiré de la carte de tarot de L'Impératrice, symbole de séduction irrésistible et de vitalité.",
    img: '/img/perfumes/fresh.webp',
    top: 'Kiwi Juteux, Rhubarbe Rose, Poivre Rose',
    heart: 'Pastèque Gorgée d’Eau, Cyclamen Rose, Jasmin',
    base: 'Bois de Citronnier, Musc Propre, Santal',
    longevity: '24h',
    sillage: 'Fruité & Exotique',
    concentration: 'Eau de Toilette'
  },
  {
    id: 20,
    name: 'Mademoiselle Rochas',
    brand: 'Rochas',
    gender: 'femme',
    category: 'floral',
    catLabels: ['femme', 'floral', 'gourmand'],
    price: 9800,
    priceFormatted: '9 800 DA',
    volume: '90ml Eau de Parfum',
    badge: 'Chic Parisien',
    rating: '4.7',
    reviewsCount: 75,
    desc: "L'incarnation de la jeune Parisienne pétillante et espiègle. Pomme d'amour croquante, rose délicate et fond de santal caressant.",
    story: "Le chic français sans effort, plein de charme, de malice et d'élégance naturelle.",
    img: '/img/perfumes/rose.webp',
    top: 'Pomme d’Amour, Cassis Noir, Feuilles de Lierre',
    heart: 'Rose Pétillante, Jasmin d’Égypte, Violette',
    base: 'Bois de Santal, Ambre Gris, Chantilly Musquée',
    longevity: '30h',
    sillage: 'Gourmand & Espiègle',
    concentration: 'Eau de Parfum'
  },
  {
    id: 21,
    name: 'Versace Dylan Blue Pour Femme',
    brand: 'Versace',
    gender: 'femme',
    category: 'fresh',
    catLabels: ['femme', 'fresh', 'floral'],
    price: 13500,
    priceFormatted: '13 500 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Méditerranéen',
    rating: '4.8',
    reviewsCount: 168,
    desc: "Une force sensuelle et élégante inspirée des rivages méditerranéens. Sorbet cassis rafraîchissant, pomme Granny Smith et bois blancs soyeux.",
    story: "Un hommage à la féminité puissante selon Donatella Versace, entre fraîcheur aquatique et sensualité boisée.",
    img: '/img/perfumes/fresh.webp',
    top: 'Sorbet Cassis Noir, Pomme Granny Smith, Trèfle',
    heart: 'Églantine Sauvage, Pêche Givrée, Pétalia, Jasmin',
    base: 'Styrax, Bois Blancs Précieux, Musc, Patchouli',
    longevity: '36h',
    sillage: 'Sensuel & Marin',
    concentration: 'Eau de Parfum'
  },

  // ─── HOMME & BOISÉS / ÉPICÉS / ORIENTAUX ───
  {
    id: 22,
    name: 'Emporio Armani Stronger With You (You Powerfully)',
    brand: 'Giorgio Armani',
    gender: 'homme',
    category: 'amber',
    catLabels: ['homme', 'amber', 'woody'],
    price: 21000,
    priceFormatted: '21 000 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Charisme Pur',
    rating: '4.9',
    reviewsCount: 260,
    desc: "L'énergie masculine affirmée et séduisante. Cardamome épicée, poivre rose vibrant et un accord inimitable de marron glacé fumé à la vanille.",
    story: "L'histoire d'un amour puissant et inconditionnel, célébrant la confiance et le magnétisme contemporain.",
    img: '/img/perfumes/amber.webp',
    top: 'Cardamome du Guatemala, Poivre Rose, Violette',
    heart: 'Sauge Sclarée Aromatique, Lavande de Provence',
    base: 'Accord Marron Glacé, Vanille Jungle Essence, Cèdre',
    longevity: '48h',
    sillage: 'Chaud & Addictif',
    concentration: 'Eau de Parfum'
  },
  {
    id: 23,
    name: 'Givenchy Gentleman Society Ambrée',
    brand: 'Givenchy',
    gender: 'homme',
    category: 'amber',
    catLabels: ['homme', 'amber', 'woody'],
    price: 20500,
    priceFormatted: '20 500 DA',
    volume: '100ml Eau de Parfum Extrême',
    badge: 'Prestige',
    rating: '4.9',
    reviewsCount: 115,
    desc: "Rejoignez l'élite olfactive. Un accord inédit de narcisse sauvage couplé à un quatuor de vétivers nobles et une vanille Tasuki d'une profondeur absolue.",
    story: "Pour les hommes d'honneur qui définissent leurs propres règles avec distinction et savoir-être.",
    img: '/img/perfumes/emerald.webp',
    top: 'Sauge Sclarée, Noix de Muscade, Cardamome',
    heart: 'Narcisse Sauvage de France, Café Torréfié, Iris',
    base: 'Quatuor de Vétivers, Vanille Tasuki, Cèdre',
    longevity: '48h',
    sillage: 'Aristocratique',
    concentration: 'Eau de Parfum Extrême'
  },
  {
    id: 24,
    name: 'Jean Paul Gaultier Scandal Pour Homme Elixir',
    brand: 'Jean Paul Gaultier',
    gender: 'homme',
    category: 'gourmand',
    catLabels: ['homme', 'gourmand', 'amber'],
    price: 23500,
    priceFormatted: '23 500 DA',
    volume: '100ml Parfum Concentré',
    badge: 'Coup de Poing',
    rating: '5.0',
    reviewsCount: 190,
    desc: "Le roi du ring olfactif. Un caramel brûlé au beurre salé percutant mêlé à la fève tonka suave et un vétiver puissant qui fait succomber les foules.",
    story: "Couronné champion de la séduction, ce concentré d'audace frappe avec force et volupté.",
    img: '/img/perfumes/oud.webp',
    top: 'Sauge Royale, Mandarine Sanguine',
    heart: 'Caramel Salé Onctueux, Fève Tonka Intense',
    base: 'Vétiver Sombre, Cèdre Noir',
    longevity: '48h+',
    sillage: 'Dévastateur & Gourmand',
    concentration: 'Parfum Concentré'
  },
  {
    id: 25,
    name: "Prada Paradigme / L'Homme",
    brand: 'Prada',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'fresh'],
    price: 21800,
    priceFormatted: '21 800 DA',
    volume: '100ml Eau de Toilette Haute',
    badge: 'Signature Chic',
    rating: '4.9',
    reviewsCount: 145,
    desc: "La perfection architecturale en flacon. Un iris noble majestueux marié au néroli lumineux et à l'ambre chaud pour une allure aristocratique impeccable.",
    story: "L'exploration de la dualité masculine selon Miuccia Prada, épurée, sophistiquée et luxueuse.",
    img: '/img/perfumes/emerald.webp',
    top: 'Néroli Doré, Poivre Noir, Cardamome',
    heart: 'Iris Pallida d’Italie, Violette, Géranium',
    base: 'Ambre Chaud, Bois de Cèdre, Patchouli Pur',
    longevity: '36h',
    sillage: 'Raffinement Absolu',
    concentration: 'Eau de Toilette Haute'
  },
  {
    id: 26,
    name: 'Montblanc Explorer Platinum / Extrême',
    brand: 'Montblanc',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'fresh'],
    price: 12800,
    priceFormatted: '12 800 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Aventure',
    rating: '4.8',
    reviewsCount: 130,
    desc: "L'appel des sommets glaciaires. Pamplemousse givré, sauge aromatique vivifiante et cèdre majestueux composent une ode à la conquête.",
    story: "Inspiré par les expéditions vers les sommets les plus vertigineux du mont Blanc.",
    img: '/img/perfumes/emerald.webp',
    top: 'Pamplemousse Givré, Feuilles de Violette',
    heart: 'Sauge Sclarée Pure, Poivre Rose Alpin',
    base: 'Bois de Cèdre Platinum, Ambre Minéral',
    longevity: '36h',
    sillage: 'Vibrant & Frais',
    concentration: 'Eau de Parfum'
  },
  {
    id: 27,
    name: "Hermès Terre d'Hermès Intense",
    brand: 'Hermès',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'fresh'],
    price: 18800,
    priceFormatted: '18 800 DA',
    volume: '100ml Eau Intense Vétiver',
    badge: 'Légende',
    rating: '5.0',
    reviewsCount: 380,
    desc: "La force minérale et tellurique portée à incandescence. La puissance du vétiver haïtien sublimée par des agrumes solaires et du poivre du Sichuan.",
    story: "La structure originelle de Terre d'Hermès revisitée par Christine Nagel, où le vétiver prend racine dans une terre fertile et chaude.",
    img: '/img/perfumes/emerald.webp',
    top: 'Bergamote Verte, Pamplemousse Hespéridé',
    heart: 'Poivre du Sichuan, Géranium Sauvage, Silex Minéral',
    base: 'Vétiver Intense d’Haïti, Résine d’Oliban, Cèdre',
    longevity: '48h',
    sillage: 'Noble & Tellurique',
    concentration: 'Eau Intense'
  },
  {
    id: 28,
    name: 'Giorgio Armani Acqua Di Giò Eau de Parfum',
    brand: 'Giorgio Armani',
    gender: 'homme',
    category: 'fresh',
    catLabels: ['homme', 'fresh', 'woody'],
    price: 18800,
    priceFormatted: '18 800 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Indétrônable',
    rating: '4.9',
    reviewsCount: 450,
    desc: "L'immensité de la mer Méditerranée encapsulée. Des notes marines cristallines vivifiées par la mandarine verte de Calabre et un patchouli guatémaltèque durable.",
    story: "L'île de Pantelleria et ses roches volcaniques léchées par des vagues turquoise, un souffle de liberté absolue.",
    img: '/img/perfumes/fresh.webp',
    top: 'Notes Marines Océaniques, Mandarine Verte',
    heart: 'Sauge Sclarée, Lavande de Provence, Géranium',
    base: 'Patchouli du Guatemala, Vétiver Minéral',
    longevity: '36h',
    sillage: 'Océanique & Magnétique',
    concentration: 'Eau de Parfum'
  },
  {
    id: 29,
    name: 'Givenchy Gentleman Eau de Parfum',
    brand: 'Givenchy',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'amber'],
    price: 16200,
    priceFormatted: '16 200 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Gentleman Noir',
    rating: '4.9',
    reviewsCount: 180,
    desc: "Le charme nocturne à l'état pur. Un iris précieux sombrement enveloppé de poivre noir, de baume de Tolu et de vanille noire de Madagascar.",
    story: "Pour l'homme raffiné dont l'élégance naturelle n'a besoin d'aucun artifice pour séduire.",
    img: '/img/perfumes/noir.webp',
    top: 'Poivre Noir de Madagascar, Bergamote, Lavande',
    heart: 'Iris d’Italie Sombre, Cannelle, Clou de Girofle',
    base: 'Vanille Noire, Baume de Tolu, Patchouli, Benjoin',
    longevity: '48h',
    sillage: 'Sombre & Velouté',
    concentration: 'Eau de Parfum'
  },
  {
    id: 30,
    name: 'Jean Paul Gaultier Le Beau Narcisse / Le Parfum',
    brand: 'Jean Paul Gaultier',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'gourmand'],
    price: 23500,
    priceFormatted: '23 500 DA',
    volume: '125ml Le Parfum Intense',
    badge: 'Séduction Solaire',
    rating: '4.9',
    reviewsCount: 225,
    desc: "Le fruit défendu du jardin d'Éden de Gaultier. Noix de coco sensuelle, bois de santal chaud et fève tonka addictive pour un sillage aphrodisiaque.",
    story: "Une tentation irrésistible sous le soleil d'un jardin tropical où tout est permis.",
    img: '/img/perfumes/amber.webp',
    top: 'Ananas Givré, Gingembre Sauvage, Cyprès',
    heart: 'Bois de Coco Grillé, Fève Tonka Suave',
    base: 'Bois de Santal Royal, Ambre Gris',
    longevity: '48h',
    sillage: 'Aphrodisiaque',
    concentration: 'Le Parfum Intense'
  },
  {
    id: 31,
    name: 'Paco Rabanne Invictus Victory Elixir',
    brand: 'Paco Rabanne',
    gender: 'homme',
    category: 'amber',
    catLabels: ['homme', 'amber', 'woody'],
    price: 22800,
    priceFormatted: '22 800 DA',
    volume: '100ml Parfum Intense',
    badge: 'Victoire Ultime',
    rating: '4.9',
    reviewsCount: 240,
    desc: "La quintessence de la puissance masculine. Un encens mystique associé à une vanille noire envoûtante et une fève tonka magnétique.",
    story: "La consécration de la victoire pour ceux qui ne reculent devant aucun défi.",
    img: '/img/perfumes/noir.webp',
    top: 'Cardamome Noire, Poivre Rose, Lavandin Vert',
    heart: 'Encens Mystique, Patchouli d’Indonésie',
    base: 'Gousse de Vanille Noire, Fève Tonka Sombre',
    longevity: '48h+',
    sillage: 'Triomphal & Puissant',
    concentration: 'Parfum Intense'
  },
  {
    id: 32,
    name: 'Yves Saint Laurent MYSLF Le Parfum',
    brand: 'Yves Saint Laurent',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'floral'],
    price: 23800,
    priceFormatted: '23 800 DA',
    volume: '100ml Le Parfum',
    badge: 'Haute Signature',
    rating: '5.0',
    reviewsCount: 165,
    desc: "L'affirmation audacieuse de l'homme contemporain. Une fleur d'oranger intense et texturée, intensifiée par des bois noirs et un accord poivré vibrant.",
    story: "Être soi-même sans compromis. L'intensité masculine d'une génération libre et passionnée.",
    img: '/img/perfumes/noir.webp',
    top: 'Poivre Noir Vibrant, Bergamote de Calabre',
    heart: 'Fleur d’Oranger Intense de Tunisie',
    base: 'Bois Riches Ambrés, Patchouli Cœur, Vanille Bourbon',
    longevity: '48h',
    sillage: 'Moderne & Noir',
    concentration: 'Le Parfum'
  },
  {
    id: 33,
    name: 'Yves Saint Laurent MYSLF Eau de Parfum',
    brand: 'Yves Saint Laurent',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'fresh'],
    price: 20500,
    priceFormatted: '20 500 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Modernité',
    rating: '4.9',
    reviewsCount: 290,
    desc: "La nouvelle icône masculine signée YSL. Une fraîcheur éclatante de bergamote combinée à un cœur floral pur et des bois sensuels.",
    story: "La réinvention de la masculinité dans un sillage fluide et infiniment raffiné.",
    img: '/img/perfumes/oud.webp',
    top: 'Cœur de Bergamote de Calabre, Vert de Bergamote',
    heart: 'Absolu de Fleur d’Oranger de Tunisie',
    base: 'Cœur de Patchouli d’Indonésie, Ambrofix',
    longevity: '36h',
    sillage: 'Épuré & Sensuel',
    concentration: 'Eau de Parfum'
  },
  {
    id: 34,
    name: "Yves Saint Laurent La Nuit de L'Homme Eau de Parfum",
    brand: 'Yves Saint Laurent',
    gender: 'homme',
    category: 'amber',
    catLabels: ['homme', 'amber', 'woody'],
    price: 21000,
    priceFormatted: '21 000 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Séducteur Nocturne',
    rating: '4.9',
    reviewsCount: 370,
    desc: "Le philtre de séduction le plus célèbre du monde. Cardamome orientale, bois de cèdre noble et fève tonka dans une concentration riche et envoûtante.",
    story: "Quand la nuit tombe sur Paris, l'homme YSL devient le maître irrésistible de toutes les attractions.",
    img: '/img/perfumes/noir.webp',
    top: 'Cardamome Aromatique, Pamplemousse',
    heart: 'Essence de Cèdre de Virginie, Sauge Sclarée',
    base: 'Fève Tonka Suave, Bois de Santal, Vétiver',
    longevity: '48h',
    sillage: 'Hypnotique',
    concentration: 'Eau de Parfum'
  },
  {
    id: 35,
    name: 'Montblanc Legend Elixir / Red',
    brand: 'Montblanc',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'fresh'],
    price: 13000,
    priceFormatted: '13 000 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Intrépide',
    rating: '4.8',
    reviewsCount: 140,
    desc: "La passion et l'énergie à l'état pur. Une orange sanguine vive confrontée à la sauge aromatique et des bois d'acajou nobles.",
    story: "Le rouge symbolisant le courage, la détermination et la force des esprits pionniers.",
    img: '/img/perfumes/ruby.webp',
    top: 'Orange Sanguine Juteuse, Cardamome, Pamplemousse',
    heart: 'Sauge Aromatique, Bois de Cèdre, Baies de Genièvre',
    base: 'Bois d’Acajou Sombre, Fève Tonka, Cèdre de l’Atlas',
    longevity: '36h',
    sillage: 'Vigoureux',
    concentration: 'Eau de Parfum'
  },
  {
    id: 36,
    name: 'Lacoste L.12.12 Original Aqua',
    brand: 'Lacoste',
    gender: 'homme',
    category: 'fresh',
    catLabels: ['homme', 'fresh'],
    price: 11500,
    priceFormatted: '11 500 DA',
    volume: '100ml Eau de Toilette',
    badge: 'Fraîcheur Pure',
    rating: '4.7',
    reviewsCount: 85,
    desc: "L'énergie d'un plongeon en eaux claires. Pamplemousse rose étincelant, poivre rose piquant et accords aquatiques dynamisants.",
    story: "Inspiré par le polo iconique L.12.12 et la fraîcheur d'un court de tennis au lever du jour.",
    img: '/img/perfumes/fresh.webp',
    top: 'Pamplemousse Rose, Poivre Rose, Mandarine',
    heart: 'Accord Aquatique Cristallin, Sauge Sclarée',
    base: 'Bois de Cèdre, Vétiver Haïtien, Muscs Propres',
    longevity: '24h',
    sillage: 'Sport & Vivifiant',
    concentration: 'Eau de Toilette'
  },
  {
    id: 37,
    name: 'Kenzo Homme Indigo / Santal Marin',
    brand: 'Kenzo',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'fresh'],
    price: 12800,
    priceFormatted: '12 800 DA',
    volume: '110ml Eau de Parfum',
    badge: 'Poésie Océane',
    rating: '4.8',
    reviewsCount: 92,
    desc: "Une rencontre poétique entre la mer indomptée et le bois chauffé au soleil. Accords marins salés, cuir souple et santal apaisant.",
    story: "Le flacon bambou penché par le vent marin, sculpté comme une ode à la liberté naturelle.",
    img: '/img/perfumes/emerald.webp',
    top: 'Accords Marins Iodés, Poivre Rose, Cardamome',
    heart: 'Cuir Chaud, Figue Sauvage, Patchouli',
    base: 'Bois de Santal Doré, Akigalawood, Vétiver',
    longevity: '36h',
    sillage: 'Marin & Boisé',
    concentration: 'Eau de Parfum'
  },
  {
    id: 38,
    name: 'Dior Sauvage Le Parfum',
    brand: 'Christian Dior',
    gender: 'homme',
    category: 'amber',
    catLabels: ['homme', 'amber', 'woody'],
    price: 25800,
    priceFormatted: '25 800 DA',
    volume: '100ml Le Parfum',
    badge: 'Légende Dior',
    rating: '5.0',
    reviewsCount: 520,
    desc: "L'interprétation la plus dense et mystérieuse de Sauvage. Une mandarine juteuse et nocturne embrasée par un santal crémeux du Sri Lanka et une fève tonka fumée.",
    story: "L'heure bleue dans le désert où le ciel s'embrase et libère la magie des grands espaces sauvages.",
    img: '/img/perfumes/noir.webp',
    top: 'Mandarine Sauvage, Bergamote de Reggio',
    heart: 'Bois de Santal du Sri Lanka, Cèdre de Virginie',
    base: 'Fève Tonka Noire, Absolu de Vanille Papouasie',
    longevity: '48h+',
    sillage: 'Monumental',
    concentration: 'Le Parfum'
  },
  {
    id: 39,
    name: 'Dior Sauvage Elixir 100ml',
    brand: 'Christian Dior',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'amber'],
    price: 39000,
    priceFormatted: '39 000 DA',
    volume: '100ml Elixir Concentré',
    badge: 'Chef-d’Œuvre',
    rating: '5.0',
    reviewsCount: 680,
    desc: "La quintessence absolue de la parfumerie masculine. Une concentration sans précédent où des épices enivrantes rencontrent une lavande de Nyons sur mesure et des bois profonds.",
    story: "Composé par François Demachy comme une liqueur rare de haute précision, d'une puissance et d'une noblesse incomparables.",
    img: '/img/perfumes/noir.webp',
    top: 'Cannelle Royale, Noix de Muscade, Cardamome, Pamplemousse',
    heart: 'Cœur de Lavande de Nyons AOP',
    base: 'Bois de Réglisse Sombre, Santal, Ambre, Patchouli',
    longevity: '72h',
    sillage: 'Légendaire & Infini',
    concentration: 'Elixir Concentré (35%)'
  },
  {
    id: 40,
    name: 'Dolce & Gabbana K (King) 200ml Eau de Parfum',
    brand: 'Dolce & Gabbana',
    gender: 'homme',
    category: 'woody',
    catLabels: ['homme', 'woody', 'fresh'],
    price: 18500,
    priceFormatted: '18 500 DA',
    volume: '200ml Format XXL King',
    badge: 'Format XXL (200ml)',
    rating: '4.8',
    reviewsCount: 160,
    desc: "Le parfum de l'homme qui règne sur son quotidien. Orange sanguine explosive, essence de piment fort épicé et cèdre noble de l'Atlas.",
    story: "Couronné par un bouchon artisanal en forme de couronne royale, pour les souverains du quotidien.",
    img: '/img/perfumes/oud.webp',
    top: 'Orange Sanguine de Sicile, Citron Torréfié, Genièvre',
    heart: 'Essence de Piment Fort, Lavande, Sauge Sclarée',
    base: 'Bois de Cèdre de l’Atlas, Patchouli, Vétiver',
    longevity: '36h',
    sillage: 'Royal & Conquérant',
    concentration: 'Eau de Parfum'
  },
  {
    id: 41,
    name: 'Lacoste Booster',
    brand: 'Lacoste',
    gender: 'homme',
    category: 'fresh',
    catLabels: ['homme', 'fresh'],
    price: 9200,
    priceFormatted: '9 200 DA',
    volume: '125ml Eau de Toilette',
    badge: 'Énergie Pure',
    rating: '4.7',
    reviewsCount: 95,
    desc: "Le coup de fouet tonique légendaire. Menthe poivrée vivifiante, eucalyptus rafraîchissant et vétiver énergisant pour les esprits sportifs.",
    story: "La fraîcheur aromatique vintage indémodable qui réveille les sens dès le matin.",
    img: '/img/perfumes/emerald.webp',
    top: 'Menthe Poivrée, Eucalyptus, Orange d’Italie',
    heart: 'Lavande, Basilic Aromatique, Noix de Muscade',
    base: 'Vétiver, Bois de Cèdre, Santal Blanc',
    longevity: '24h',
    sillage: 'Tonique & Vivifiant',
    concentration: 'Eau de Toilette'
  },
  {
    id: 42,
    name: 'Dolce & Gabbana The One Eau de Parfum Intense',
    brand: 'Dolce & Gabbana',
    gender: 'homme',
    category: 'amber',
    catLabels: ['homme', 'amber', 'woody'],
    price: 14500,
    priceFormatted: '14 500 DA',
    volume: '100ml Eau de Parfum Intense',
    badge: 'Élégance Noire',
    rating: '4.9',
    reviewsCount: 230,
    desc: "Le magnétisme obscur d'un smoking impeccable. Néroli doré, cardamome envoûtante et cuir noir fumé composent un sillage de haute séduction.",
    story: "L'incarnation de l'homme sophistiqué dont le regard capte l'attention de toute une assemblée.",
    img: '/img/perfumes/noir.webp',
    top: 'Néroli Doré, Cardamome, Cyprès Frais',
    heart: 'Benjoin Chaud, Sauge Sclarée, Muscade',
    base: 'Cuir Noir Profond, Patchouli Sombre, Ciste',
    longevity: '48h',
    sillage: 'Cuiré & Magnétique',
    concentration: 'Eau de Parfum Intense'
  },
  {
    id: 43,
    name: 'Jean Paul Gaultier Scandal Absolu',
    brand: 'Jean Paul Gaultier',
    gender: 'unisexe',
    category: 'amber',
    catLabels: ['unisexe', 'amber', 'gourmand'],
    price: 20500,
    priceFormatted: '20 500 DA',
    volume: '100ml Concentré Absolu',
    badge: 'Scandale Absolu',
    rating: '4.9',
    reviewsCount: 175,
    desc: "L'audace portée à son comble. Une tubéreuse opulente embrasse une figue noire gourmande et un bois de santal d'une richesse stupéfiante.",
    story: "Un parfum libre et décomplexé sans distinction de genre, pour les amateurs d'excès assumés.",
    img: '/img/perfumes/ruby.webp',
    top: 'Figue Noire Gourmande, Mandarine Dorée',
    heart: 'Tubéreuse Opulente, Fleur d’Oranger Solaire',
    base: 'Bois de Santal Crémeux, Ambre Chaud',
    longevity: '48h',
    sillage: 'Opulent & Envoûtant',
    concentration: 'Concentré Absolu'
  },
  {
    id: 44,
    name: 'Jean Paul Gaultier Scandal Intense 150ml',
    brand: 'Jean Paul Gaultier',
    gender: 'homme',
    category: 'gourmand',
    catLabels: ['homme', 'gourmand', 'amber'],
    price: 24800,
    priceFormatted: '24 800 DA',
    volume: '150ml Format Géant',
    badge: 'Format XXL (150ml)',
    rating: '5.0',
    reviewsCount: 195,
    desc: "L'addiction en format généreux. Caramel salé gourmand, fève tonka envoûtante et vétiver viril pour des mois de présence inoubliable.",
    story: "Le parfum de tous les succès dans un flacon géant de 150ml d'une générosité impériale.",
    img: '/img/perfumes/amber.webp',
    top: 'Sauge Sclarée Royale, Mandarine',
    heart: 'Caramel Doré Fumé, Fève Tonka',
    base: 'Vétiver Sombre, Cèdre Majestueux',
    longevity: '48h+',
    sillage: 'Puissant & XXL',
    concentration: 'Eau de Parfum Intense'
  },
  {
    id: 45,
    name: 'Azzaro Wanted by Night',
    brand: 'Azzaro',
    gender: 'homme',
    category: 'amber',
    catLabels: ['homme', 'amber', 'woody'],
    price: 14800,
    priceFormatted: '14 800 DA',
    volume: '100ml Eau de Parfum',
    badge: 'Nuit Blanche',
    rating: '4.8',
    reviewsCount: 210,
    desc: "L'arme de séduction des créatures nocturnes. Cannelle chaude, cèdre rouge de Virginie et tabac blond envoûtant composent une aura incandescente.",
    story: "Créé pour l'homme de la nuit qui vit intensément et transforme chaque soirée en fête mémorable.",
    img: '/img/perfumes/noir.webp',
    top: 'Cannelle Jaune, Mandarine Verte, Lavande',
    heart: 'Cèdre Rouge, Encens Mystique, Cumin',
    base: 'Tabac Blond de Virginie, Cyprès, Cuir',
    longevity: '48h',
    sillage: 'Chaud & Boisé',
    concentration: 'Eau de Parfum'
  }
];

// ══════════════════════════════════════════════
//   CONFIGURATION
// ══════════════════════════════════════════════
// Numéro de la conciergerie WhatsApp — défini via la variable
// d'environnement VITE_WHATSAPP_PHONE (voir .env.example).
// Format international sans "+" ni espaces, ex. 213770123456.
// NB : forme exacte `import.meta.env.VITE_*` — Vite la remplace statiquement
// au build ; l'optional chaining empêcherait cette substitution.
const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '';

if (!WHATSAPP_PHONE) {
  console.error(
    '[Dar Safia] VITE_WHATSAPP_PHONE non défini : les liens de commande WhatsApp sont désactivés. ' +
    'Copiez .env.example vers .env et renseignez le numéro de la conciergerie.'
  );
}

/** Construit une URL wa.me, ou null si le numéro n'est pas configuré. */
function buildWhatsAppUrl(message) {
  if (!WHATSAPP_PHONE) return null;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Échappe une chaîne destinée à être insérée dans du HTML.
 * À utiliser pour TOUTE donnée saisie par l'utilisateur avant un innerHTML.
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

// Largeurs réellement générées par scripts/optimize-images.mjs, par dossier.
// Doit rester synchronisé avec les `widths` des JOBS de ce script : déclarer
// ici une largeur qui n'est pas produite ferait pointer le srcset vers un 404.
const SRCSET_WIDTHS = {
  '/img/perfumes/': [400, 800],
  '/img/branding/': [1200, 1800, 2400]
};

/**
 * Construit un srcset à partir d'une image dérivée par le pipeline.
 * '/img/perfumes/rose.webp' -> '/img/perfumes/rose-400.webp 400w, …-800.webp 800w'
 * Retourne '' pour toute image hors pipeline (aucun srcset émis).
 */
function imgSrcset(src) {
  const match = /^(.*)\.webp$/.exec(src || '');
  if (!match) return '';
  const prefix = Object.keys(SRCSET_WIDTHS).find(dir => src.startsWith(dir));
  if (!prefix) return '';
  return SRCSET_WIDTHS[prefix].map(w => `${match[1]}-${w}.webp ${w}w`).join(', ');
}

export function getWhatsAppOrderLink(perfumeName, price) {
  return buildWhatsAppUrl(
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite commander le parfum suivant :\n• Parfum : ${perfumeName}\n• Prix : ${price}\n\nMerci de me renseigner sur la disponibilité et la livraison express 58 Wilayas.`
  );
}

export function getWhatsAppGeneralLink() {
  return buildWhatsAppUrl(
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite des conseils personnalisés pour choisir un parfum de votre collection ou me renseigner sur une collaboration.`
  );
}

/**
 * Ouvre la conciergerie WhatsApp, ou prévient l'utilisateur si le numéro
 * n'est pas configuré (plutôt que d'ouvrir un onglet vers une URL morte).
 */
function openWhatsApp(message) {
  const url = buildWhatsAppUrl(message);
  if (!url) {
    showToast('La conciergerie WhatsApp est momentanément indisponible.', 'error');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Renseigne le href WhatsApp d'un lien, ou le désactive proprement
 * (aria-disabled + retrait du href) si le numéro n'est pas configuré.
 */
function setWhatsAppHref(anchor, message) {
  if (!anchor) return;
  const url = buildWhatsAppUrl(message);
  if (url) {
    anchor.href = url;
    anchor.removeAttribute('aria-disabled');
  } else {
    anchor.removeAttribute('href');
    anchor.setAttribute('aria-disabled', 'true');
  }
}

// ══════════════════════════════════════════════
//   GLOBAL STATE
// ══════════════════════════════════════════════
const BAG_STORAGE_KEY = 'darsafia.bag.v1';

/** Recharge le panier depuis localStorage (tolère un stockage indisponible). */
function loadBag() {
  try {
    const raw = localStorage.getItem(BAG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistBag() {
  try {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagItems));
  } catch {
    // Stockage plein ou navigation privée : le panier reste en mémoire.
  }
}

let bagItems = loadBag();
let activeFilter = 'all';
let searchQuery = '';
let currentView = 'home'; // 'home' or 'product'
let selectedPerfumeId = 1;
let selectedVolume = '100ml';

// ══════════════════════════════════════════════
//   DOM UTILS
// ══════════════════════════════════════════════
function qs(sel, parent = document) { return parent.querySelector(sel); }
function qsa(sel, parent = document) { return [...parent.querySelectorAll(sel)]; }

// ══════════════════════════════════════════════
//   PRÉFÉRENCES UTILISATEUR (MOTION / POINTER)
// ══════════════════════════════════════════════
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');

/** L'utilisateur a demandé à réduire les animations au niveau système. */
export function prefersReducedMotion() { return reducedMotionQuery.matches; }

/** Appareil tactile / sans survol réel : pas d'effets dépendant du hover. */
function isCoarsePointer() { return coarsePointerQuery.matches; }

export function showToast(message, type = 'success') {
  const stack = qs('#toastStack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');

  // Le gabarit statique passe par innerHTML ; le message, potentiellement
  // saisi par l'utilisateur, est inséré en textContent (pas d'injection HTML).
  const icon = document.createElement('div');
  icon.className = 'toast-icon';
  icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

  const msg = document.createElement('span');
  msg.className = 'toast-msg';
  msg.textContent = message;

  toast.append(icon, msg);
  stack.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// ══════════════════════════════════════════════
//   LUXURY AMBIENT AUDIO ENGINE (432Hz Soundscape)
// ══════════════════════════════════════════════
let audioCtx = null;
let isAudioPlaying = false;
let ambientGain = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientFilter = null;
let lfo = null;

function initAmbientMusic() {
  const musicToggle = qs('#musicToggleBtn');
  const soundWaves = qs('#soundWaveAnim');
  const musicLabel = qs('#musicTrackLabel');

  function startAmbientSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Master Gain
      ambientGain = audioCtx.createGain();
      ambientGain.gain.setValueAtTime(0, audioCtx.currentTime);
      ambientGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 2.5);
      ambientGain.connect(audioCtx.destination);

      // Lowpass Warmth Filter
      ambientFilter = audioCtx.createBiquadFilter();
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.setValueAtTime(450, audioCtx.currentTime);
      ambientFilter.connect(ambientGain);

      // LFO for slow breathing movement
      lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(120, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(ambientFilter.frequency);
      lfo.start();

      // Drone Chord 1 (F# / 185Hz / 432 tuning)
      ambientOsc1 = audioCtx.createOscillator();
      ambientOsc1.type = 'sine';
      ambientOsc1.frequency.setValueAtTime(185.0, audioCtx.currentTime);
      ambientOsc1.connect(ambientFilter);
      ambientOsc1.start();

      // Drone Chord 2 (C# / 277.18Hz - Warm Fifth)
      ambientOsc2 = audioCtx.createOscillator();
      ambientOsc2.type = 'triangle';
      ambientOsc2.frequency.setValueAtTime(277.18, audioCtx.currentTime);
      ambientOsc2.connect(ambientFilter);
      ambientOsc2.start();

      isAudioPlaying = true;
      musicToggle?.classList.add('playing');
      soundWaves?.classList.add('active');
      if (musicLabel) musicLabel.textContent = 'Maison Ambience • En Lecture';
      showToast('Ambiance sonore Dar Safia activée ✨');
    } catch (e) {
      console.warn('Audio autoplay prevented or error:', e);
    }
  }

  function stopAmbientSound() {
    if (ambientGain && audioCtx) {
      ambientGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      setTimeout(() => {
        try {
          ambientOsc1?.stop();
          ambientOsc2?.stop();
          lfo?.stop();
          ambientOsc1?.disconnect();
          ambientOsc2?.disconnect();
          lfo?.disconnect();
        } catch (_) {}
      }, 1300);
    }
    isAudioPlaying = false;
    musicToggle?.classList.remove('playing');
    soundWaves?.classList.remove('active');
    if (musicLabel) musicLabel.textContent = 'Musique d’Ambiance';
  }

  musicToggle?.addEventListener('click', () => {
    if (isAudioPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  });

  // Optional: Click anywhere on first user gesture enables audio readiness
  document.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, { once: true });
}

// ══════════════════════════════════════════════
//   CATEGORY THEMATIC SYSTEM FOR PDP
// ══════════════════════════════════════════════
export function getCategoryTheme(p) {
  const cat = p.category || 'floral';
  const name = p.name.toLowerCase();
  
  if (name.includes('rouge') || name.includes('scandal') || name.includes('bomba') || name.includes('red') || name.includes('divine')) {
    return {
      type: 'ruby',
      familyLabel: 'Collection Rouge & Incandescence',
      badgeIcon: '🔥',
      accentColor: '#E63946',
      accentLt: '#FF6B6B',
      accentGlow: 'rgba(230,57,70,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(139,0,0,0.45) 0%, rgba(36,10,12,0.95) 70%, #120808 100%)',
      moodQuote: "Une sensualité ardente et captivante, sculptée dans le rouge passion et l'or pur.",
      pyramidColors: ['#FF6B6B', '#E63946', '#9B2226'],
      barGradient: 'linear-gradient(90deg, #9B2226, #E63946, #FF6B6B)'
    };
  }
  
  if (cat === 'fresh' || name.includes('aqua') || name.includes('giò') || name.includes('marine') || name.includes('blue') || name.includes('impératrice')) {
    return {
      type: 'fresh',
      familyLabel: 'Collection Azur & Fraîcheur Marine',
      badgeIcon: '🌊',
      accentColor: '#00B4D8',
      accentLt: '#90E0EF',
      accentGlow: 'rgba(0,180,216,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(0,119,182,0.35) 0%, rgba(10,25,35,0.95) 70%, #081015 100%)',
      moodQuote: "L'énergie cristalline des vagues méditerranéennes et la pureté des embruns marins vivifiants.",
      pyramidColors: ['#90E0EF', '#00B4D8', '#0077B6'],
      barGradient: 'linear-gradient(90deg, #0077B6, #00B4D8, #90E0EF)'
    };
  }

  if (name.includes('explorer') || name.includes('terre') || name.includes('booster') || name.includes('audace') || name.includes('society') || name.includes('paradigme')) {
    return {
      type: 'emerald',
      familyLabel: 'Collection Émeraude & Vétiver Noble',
      badgeIcon: '🌿',
      accentColor: '#2A9D8F',
      accentLt: '#52B788',
      accentGlow: 'rgba(42,157,143,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(20,82,40,0.4) 0%, rgba(12,28,18,0.95) 70%, #09130c 100%)',
      moodQuote: "La fraîcheur aromatique et la grandeur des forêts nobles baignées de rosée matinale.",
      pyramidColors: ['#74C69D', '#2A9D8F', '#1B4332'],
      barGradient: 'linear-gradient(90deg, #1B4332, #2A9D8F, #74C69D)'
    };
  }

  if (cat === 'woody' || name.includes('sauvage') || name.includes('oud') || name.includes('gentleman') || name.includes('nuit') || name.includes('myslf')) {
    return {
      type: 'noir',
      familyLabel: 'Collection Nuit Obscure & Bois Majestueux',
      badgeIcon: '🌑',
      accentColor: '#D4AF37',
      accentLt: '#F3E5AB',
      accentGlow: 'rgba(212,175,55,0.25)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(30,20,15,0.75) 0%, rgba(15,10,8,0.98) 70%, #0a0706 100%)',
      moodQuote: "Le magnétisme obscur et l'élégance suprême des bois précieux et du cuir impérial.",
      pyramidColors: ['#E6C280', '#D4AF37', '#6E5320'],
      barGradient: 'linear-gradient(90deg, #6E5320, #D4AF37, #F3E5AB)'
    };
  }

  if (cat === 'gourmand' || cat === 'amber' || name.includes('intense') || name.includes('vanille') || name.includes('guerlain') || name.includes('wanted')) {
    return {
      type: 'amber',
      familyLabel: 'Collection Ambre Royal & Vanille Dorée',
      badgeIcon: '✨',
      accentColor: '#E5A93C',
      accentLt: '#F5CB5C',
      accentGlow: 'rgba(229,169,60,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(85,45,15,0.5) 0%, rgba(28,17,11,0.96) 70%, #120a06 100%)',
      moodQuote: "Un élixir d'ambre chaud et de gourmandise envoûtante qui rayonne avec éclat.",
      pyramidColors: ['#F5CB5C', '#E5A93C', '#945600'],
      barGradient: 'linear-gradient(90deg, #945600, #E5A93C, #F5CB5C)'
    };
  }

  // Default Floral / Romantic
  return {
    type: 'floral',
    familyLabel: 'Collection Haute Parfumerie Florale',
    badgeIcon: '🌸',
    accentColor: '#E892A2',
    accentLt: '#F8BBD0',
    accentGlow: 'rgba(232,146,162,0.3)',
    bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(70,20,30,0.45) 0%, rgba(26,14,18,0.95) 70%, #12090d 100%)',
    moodQuote: "L'éclat intemporel des fleurs les plus rares cueillies à l'aube dans les jardins de Grasse.",
    pyramidColors: ['#F8BBD0', '#E892A2', '#880E4F'],
    barGradient: 'linear-gradient(90deg, #880E4F, #E892A2, #F8BBD0)'
  };
}

// ══════════════════════════════════════════════
//   PRODUCT DETAIL PAGE VIEW SYSTEM (SMOOTH ROUTING)
// ══════════════════════════════════════════════
export function showProductPage(id, updateHash = true) {
  const p = perfumeCatalog.find(item => item.id === parseInt(id, 10)) || perfumeCatalog[0];
  selectedPerfumeId = p.id;
  currentView = 'product';

  if (updateHash) {
    window.location.hash = `product-${p.id}`;
  }

  const mainView = qs('#homeMainView');
  const productView = qs('#productDetailView');

  if (mainView && productView) {
    // Smooth cross-fade transition
    gsap.to(mainView, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.inOut',
      onComplete: () => {
        mainView.style.display = 'none';
        productView.style.display = 'block';
        productView.style.opacity = '0';
        renderProductDetailContent(p);

        window.scrollTo({ top: 0, behavior: 'instant' });

        gsap.to(productView, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        gsap.fromTo('.pdp-hero-banner, .pdp-gallery-card, .pdp-info-card, .pdp-story-section',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
        );
      }
    });
  }
}

export function showHomePage(updateHash = true) {
  currentView = 'home';
  if (updateHash) {
    window.location.hash = '';
  }

  const mainView = qs('#homeMainView');
  const productView = qs('#productDetailView');

  if (mainView && productView) {
    gsap.to(productView, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.inOut',
      onComplete: () => {
        productView.style.display = 'none';
        mainView.style.display = 'block';
        mainView.style.opacity = '0';
        gsap.to(mainView, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        ScrollTrigger.refresh();
      }
    });
  }
}

function renderProductDetailContent(p) {
  const container = qs('#productDetailContainer');
  if (!container) return;

  const theme = getCategoryTheme(p);
  const productView = qs('#productDetailView');
  if (productView) {
    productView.style.setProperty('--theme-accent', theme.accentColor);
    productView.style.setProperty('--theme-lt', theme.accentLt);
    productView.style.setProperty('--theme-glow', theme.accentGlow);
    productView.style.setProperty('--theme-bg', theme.bgGradient);
    productView.style.setProperty('--theme-bar', theme.barGradient);
  }

  // Find 3 recommended related perfumes in same category or gender
  const related = perfumeCatalog
    .filter(item => item.id !== p.id && (item.gender === p.gender || item.category === p.category))
    .slice(0, 3);

  container.innerHTML = `
    <!-- Thematic Atmosphere Banner -->
    <div class="pdp-hero-banner" style="background:${theme.bgGradient};">
      <div class="pdp-hero-bg" style="background-image:url('${p.img}')"></div>
      <div class="pdp-hero-overlay"></div>
      <div class="pdp-hero-content">
        <div class="pdp-hero-left">
          <nav class="pdp-breadcrumbs">
            <a href="#hero" class="pdp-crumb-home">Accueil</a>
            <span class="pdp-crumb-sep">◆</span>
            <a href="#collection" class="pdp-crumb-catalog">Catalogue</a>
            <span class="pdp-crumb-sep">◆</span>
            <span class="pdp-crumb-current">${p.name}</span>
          </nav>
          <div class="pdp-theme-universe-tag" style="color:${theme.accentLt}; border-color:${theme.accentGlow}; background:${theme.accentGlow};">
            <span>${theme.badgeIcon}</span>
            <span>${theme.familyLabel}</span>
          </div>
        </div>
        <button class="pdp-back-floating" id="pdpBackBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          <span>Retour au Catalogue</span>
        </button>
      </div>
    </div>

    <!-- Main 2-Column Product Showcase -->
    <div class="pdp-main-grid">

      <!-- Left Column: Luxury Bottle Showcase -->
      <div class="pdp-gallery-card">
        <div class="pdp-main-img-wrap" style="box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 45px ${theme.accentGlow};">
          <img src="${p.img}" srcset="${imgSrcset(p.img)}" sizes="(max-width: 900px) 92vw, 520px"
               alt="${p.name}" class="pdp-main-img" id="pdpMainImg" decoding="async" />
          ${p.badge ? `<div class="pdp-badge-top" style="background:linear-gradient(135deg, ${theme.accentColor}, ${theme.accentLt});">${p.badge}</div>` : ''}
          <div class="pdp-auth-shield" style="border-color:${theme.accentGlow};">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span style="color:${theme.accentLt};">100% Original &amp; Certifié Dar Safia</span>
          </div>
        </div>

        <div class="pdp-thumbs-row">
          <button class="pdp-thumb-btn active" data-img="${p.img}">
            <img src="${p.img}" alt="${p.name} vue 1" />
          </button>
          <button class="pdp-thumb-btn" data-img="/img/branding/branding-05.webp">
            <img src="/img/branding/branding-05.webp" alt="Coffret Luxe" />
          </button>
          <button class="pdp-thumb-btn" data-img="/img/branding/branding-04.webp">
            <img src="/img/branding/branding-04.webp" alt="Vaporisateur" />
          </button>
        </div>

        <!-- Performance Metrics with Thematic Visual Bars -->
        <div class="pdp-metrics-box">
          <div class="pdp-metric-item">
            <div class="pdp-m-icon" style="background:${theme.accentGlow}; color:${theme.accentLt};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div class="pdp-m-data">
              <span class="pdp-m-val" style="color:${theme.accentLt};">${p.longevity}</span>
              <span class="pdp-m-lbl">Tenue sur Peau</span>
              <div class="pdp-m-bar"><div class="pdp-m-bar-fill" style="width:${parseInt(p.longevity) >= 48 ? '95' : parseInt(p.longevity) >= 36 ? '80' : '65'}%; background:${theme.barGradient};"></div></div>
            </div>
          </div>
          <div class="pdp-metric-item">
            <div class="pdp-m-icon" style="background:${theme.accentGlow}; color:${theme.accentLt};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C12 2 4 7 4 12a8 8 0 0016 0c0-5-8-10-8-10z"/></svg>
            </div>
            <div class="pdp-m-data">
              <span class="pdp-m-val" style="color:${theme.accentLt};">${p.sillage.split('&')[0]}</span>
              <span class="pdp-m-lbl">Projection &amp; Sillage</span>
              <div class="pdp-m-bar"><div class="pdp-m-bar-fill" style="width:88%; background:${theme.barGradient};"></div></div>
            </div>
          </div>
          <div class="pdp-metric-item">
            <div class="pdp-m-icon" style="background:${theme.accentGlow}; color:${theme.accentLt};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="pdp-m-data">
              <span class="pdp-m-val" style="color:${theme.accentLt};">100%</span>
              <span class="pdp-m-lbl">Authenticité Garantie</span>
              <div class="pdp-m-bar"><div class="pdp-m-bar-fill" style="width:100%; background:${theme.barGradient};"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Details, Selection & WhatsApp Checkout -->
      <div class="pdp-info-card">
        <div class="pdp-header">
          <div class="pdp-meta-line">
            <span class="pdp-brand-tag" style="color:${theme.accentLt};">${p.brand}</span>
            <span class="pdp-gender-tag" style="border-color:${theme.accentGlow}; color:${theme.accentLt};">${p.gender === 'femme' ? 'Pour Femme' : p.gender === 'homme' ? 'Pour Homme' : 'Unisexe'}</span>
            <span class="pdp-conc-tag">${p.concentration}</span>
          </div>
          <h1 class="pdp-title">${p.name}</h1>
          
          <div class="pdp-rating-row">
            <div class="pdp-stars" style="color:${theme.accentLt};">★★★★★</div>
            <span class="pdp-score">${p.rating} / 5</span>
            <span class="pdp-reviews-link">(${p.reviewsCount} avis vérifiés)</span>
          </div>

          <div class="pdp-price-wrap" style="border-color:${theme.accentGlow};">
            <span class="pdp-price-main" style="color:${theme.accentLt};">${p.priceFormatted}</span>
            <span class="pdp-stock-status">
              <span class="pdp-dot-live"></span>
              En Stock • Livraison 58 Wilayas (24h-48h)
            </span>
          </div>
        </div>

        <p class="pdp-desc-text">${p.desc}</p>

        <!-- Mood Atmospheric Accent -->
        <div class="pdp-mood-box" style="border-left: 3px solid ${theme.accentColor}; background:${theme.accentGlow};">
          <span class="pdp-mood-icon">${theme.badgeIcon}</span>
          <p class="pdp-mood-text" style="color:${theme.accentLt};"><em>« ${theme.moodQuote} »</em></p>
        </div>

        <!-- Format Selector -->
        <div class="pdp-section-block">
          <label class="pdp-block-label">Format Disponible :</label>
          <div class="pdp-size-selector">
            <button class="pdp-size-btn active" data-size="${p.volume}">
              <strong>${p.volume}</strong>
              <small>Flacon Standard Original</small>
            </button>
            <button class="pdp-size-btn" data-size="Coffret Prestige">
              <strong>Coffret Prestige</strong>
              <small>Écrin Velours + 2 Échantillons Offerts</small>
            </button>
          </div>
        </div>

        <!-- Visual Olfactory Pyramid -->
        <div class="pdp-pyramid-block">
          <h3 class="pdp-block-label">Architecture &amp; Pyramide Olfactive :</h3>
          <div class="pdp-pyramid-visual">
            <div class="pdp-pyr-level pdp-pyr-top" style="border-color:${theme.accentGlow};">
              <div class="pdp-pyr-icon" style="background:${theme.accentGlow};">🌿</div>
              <div class="pdp-pyr-info">
                <span class="pdp-pyr-name" style="color:${theme.accentLt};">Notes de Tête (Première Impression)</span>
                <span class="pdp-pyr-notes">${p.top}</span>
              </div>
            </div>
            <div class="pdp-pyr-connector" style="background:${theme.accentColor};"></div>
            <div class="pdp-pyr-level pdp-pyr-heart" style="border-color:${theme.accentGlow};">
              <div class="pdp-pyr-icon" style="background:${theme.accentGlow};">🌸</div>
              <div class="pdp-pyr-info">
                <span class="pdp-pyr-name" style="color:${theme.accentLt};">Notes de Cœur (Signature &amp; Personnalité)</span>
                <span class="pdp-pyr-notes">${p.heart}</span>
              </div>
            </div>
            <div class="pdp-pyr-connector" style="background:${theme.accentColor};"></div>
            <div class="pdp-pyr-level pdp-pyr-base" style="border-color:${theme.accentGlow};">
              <div class="pdp-pyr-icon" style="background:${theme.accentGlow};">🪵</div>
              <div class="pdp-pyr-info">
                <span class="pdp-pyr-name" style="color:${theme.accentLt};">Notes de Fond (Sillage &amp; Persistance)</span>
                <span class="pdp-pyr-notes">${p.base}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action CTAs -->
        <div class="pdp-cta-group">
          <a href="${getWhatsAppOrderLink(p.name, p.priceFormatted) || '#'}" target="_blank" rel="noopener noreferrer" class="btn-gold pdp-wa-btn" style="box-shadow: 0 8px 25px rgba(37,211,102,0.45);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Commander sur WhatsApp</span>
          </a>
          <button class="btn-ghost pdp-bag-btn" id="pdpAddBagBtn" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceFormatted}" style="border-color:${theme.accentGlow};">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Ajouter au Panier</span>
          </button>
        </div>

        <!-- Trust List with icons -->
        <div class="pdp-trust-list">
          <div class="pdp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span>Livraison Express 58 Wilayas (24h à 48h)</span>
          </div>
          <div class="pdp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Paiement sécurisé à la réception du colis</span>
          </div>
          <div class="pdp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Authenticité 100% Garantie &amp; Flacon d'Origine</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Scent Story Section -->
    <div class="pdp-story-section" style="border-color:${theme.accentGlow};">
      <div class="pdp-story-inner">
        <div class="pdp-story-deco" style="color:${theme.accentLt};">◆</div>
        <span class="eyebrow-tag" style="color:${theme.accentLt};">— L'Histoire du Flacon</span>
        <h2 class="section-h">L'Inspiration de <em style="color:${theme.accentLt}; font-style:italic;">${p.name}</em></h2>
        <p class="pdp-story-content">${p.story}</p>
        <div class="pdp-story-deco" style="color:${theme.accentLt};">◆</div>
      </div>
    </div>

    <!-- Related Perfumes Carousel -->
    <div class="pdp-related-section">
      <div class="section-header">
        <span class="eyebrow-tag" style="color:${theme.accentLt};">— Dans la Même Famille</span>
        <h2 class="section-h">Vous Aimerez <em class="italic-gold">Aussi</em></h2>
      </div>
      <div class="products pdp-related-grid">
        ${related.map(item => `
          <article class="pcard" data-id="${item.id}" data-category="${item.category}">
            <div class="pcard-img-wrap">
              <img src="${item.img}" alt="${item.name}" class="pcard-img" />
              <div class="pcard-shine"></div>
              <div class="pcard-hover-layer">
                <button class="pcard-qv" data-id="${item.id}">
                  <span>Découvrir la Fiche</span>
                </button>
              </div>
              ${item.badge ? `<div class="pcard-badge">${item.badge}</div>` : ''}
              <div class="pcard-gender-tag">${item.gender === 'femme' ? 'Pour Femme' : item.gender === 'homme' ? 'Pour Homme' : 'Unisexe'}</div>
            </div>
            <div class="pcard-body">
              <div class="pcard-meta-top">
                <span class="pcard-brand">${item.brand}</span>
                <span class="pcard-vol">${item.volume}</span>
              </div>
              <h3 class="pcard-name">${item.name}</h3>
              <div class="pcard-footer">
                <span class="pcard-price">${item.priceFormatted}</span>
                <button class="btn-add" data-id="${item.id}" data-name="${item.name}" data-price="${item.priceFormatted}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  // Attach interactive events inside the PDP
  qs('#pdpBackBtn')?.addEventListener('click', () => showHomePage(true));
  qs('.pdp-crumb-home')?.addEventListener('click', () => showHomePage(true));
  qs('.pdp-crumb-catalog')?.addEventListener('click', () => {
    showHomePage(true);
    setTimeout(() => {
      qs('#collection')?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  });

  // PDP Thumbnail image switcher
  qsa('.pdp-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const newImg = btn.dataset.img;
      const mainImg = qs('#pdpMainImg');
      if (mainImg && newImg) {
        gsap.to(mainImg, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            // Le srcset doit suivre la source, sinon le navigateur continue
            // de servir les variantes de l'image précédente.
            mainImg.srcset = imgSrcset(newImg);
            mainImg.src = newImg;
            gsap.to(mainImg, { opacity: 1, duration: 0.3 });
          }
        });
      }
    });
  });

  // Size selector buttons
  qsa('.pdp-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.pdp-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // PDP Add to bag
  qs('#pdpAddBagBtn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    addToBag(btn.dataset.name, btn.dataset.price);
  });

  // Related products card tilt
  attach3DCardTilt();
}

// ══════════════════════════════════════════════
//   RENDER PRODUCTS GRID & 3D ANIMATIONS
// ══════════════════════════════════════════════
function renderProducts() {
  const container = qs('#productsGrid');
  const countEl = qs('#productsCount');
  if (!container) return;

  const filtered = perfumeCatalog.filter(item => {
    const matchesFilter = (activeFilter === 'all') || 
      item.gender === activeFilter ||
      item.category === activeFilter ||
      (item.catLabels && item.catLabels.includes(activeFilter));

    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery) ||
      item.brand.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery) ||
      item.top.toLowerCase().includes(searchQuery) ||
      item.heart.toLowerCase().includes(searchQuery) ||
      item.base.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  if (countEl) {
    countEl.textContent = `${filtered.length} parfums d'exception`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-products-msg">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8862B" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <h3>Aucun parfum trouvé</h3>
        <p>Essayez avec d'autres mots-clés ou réinitialisez les filtres.</p>
        <button class="btn-gold reset-filters-btn" id="resetFiltersBtn"><span>Voir toute la collection</span></button>
      </div>
    `;
    qs('#resetFiltersBtn')?.addEventListener('click', () => {
      activeFilter = 'all';
      searchQuery = '';
      if (qs('#catalogSearchInput')) qs('#catalogSearchInput').value = '';
      qsa('.filter-tab').forEach(t => t.classList.toggle('active', t.dataset.f === 'all'));
      renderProducts();
    });
    return;
  }

  container.innerHTML = filtered.map(p => `
    <article class="pcard" data-id="${p.id}" data-category="${p.category}">
      <div class="pcard-img-wrap">
        <img src="${p.img}" srcset="${imgSrcset(p.img)}" sizes="(max-width: 700px) 88vw, 340px"
             alt="${p.name}" class="pcard-img" loading="lazy" decoding="async" />
        <div class="pcard-shine"></div>
        <div class="pcard-hover-layer">
          <button class="pcard-qv" data-id="${p.id}" aria-label="Voir la fiche complète de ${p.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Fiche Complète</span>
          </button>
          <a href="${getWhatsAppOrderLink(p.name, p.priceFormatted) || '#'}" target="_blank" rel="noopener noreferrer" class="pcard-wa-btn" title="Commander sur WhatsApp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </a>
        </div>
        ${p.badge ? `<div class="pcard-badge">${p.badge}</div>` : ''}
        <div class="pcard-gender-tag">${p.gender === 'femme' ? 'Pour Femme' : p.gender === 'homme' ? 'Pour Homme' : 'Unisexe'}</div>
      </div>
      <div class="pcard-body">
        <div class="pcard-meta-top">
          <span class="pcard-brand">${p.brand}</span>
          <span class="pcard-vol">${p.volume}</span>
        </div>
        <h3 class="pcard-name">${p.name}</h3>
        <p class="pcard-note-line">${p.top.split(',').slice(0, 2).join(' · ')} · ${p.base.split(',')[0]}</p>
        <div class="pcard-footer">
          <div class="pcard-price-stack">
            <span class="pcard-price">${p.priceFormatted}</span>
            <span class="pcard-auth-tag">100% Authentique</span>
          </div>
          <div class="pcard-btns">
            <button class="btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceFormatted}" title="Ajouter au Panier">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  attach3DCardTilt();

  gsap.fromTo('.pcard', 
    { y: 35, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.035, ease: 'power2.out' }
  );
}

function attach3DCardTilt() {
  const cards = qsa('.pcard');
  cards.forEach(card => {
    // Clicking anywhere on card opens full Product Page
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add, .pcard-wa-btn')) return;
      const id = card.dataset.id;
      if (id) showProductPage(id, true);
    });

    // Le tilt 3D est un ornement : on le désactive pour les utilisateurs
    // qui demandent moins d'animation, et sur les appareils tactiles.
    if (prefersReducedMotion() || isCoarsePointer()) return;

    let rect = null;
    let frame = 0;

    card.addEventListener('mouseenter', () => {
      // Rect mesuré une seule fois à l'entrée : évite un reflow par mousemove.
      rect = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Écriture des styles groupée dans une frame d'animation.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = ((y - centerY) / centerY) * -8;
        const rotY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        const shine = card.querySelector('.pcard-shine');
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(228, 189, 104, 0.28), transparent 70%)`;
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      const shine = card.querySelector('.pcard-shine');
      if (shine) shine.style.background = 'none';
    });
  });
}

// ══════════════════════════════════════════════
//   PRELOADER & HERO ENTRANCE
// ══════════════════════════════════════════════
function initPreloader() {
  const pl = qs('#preloader');
  const bar = qs('#plBar');
  const pct = qs('#plPercent');
  if (!pl || !bar || !pct) return;

  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 22 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
    }
    bar.style.width = `${progress}%`;
    pct.textContent = `${Math.floor(progress)}%`;

    if (progress === 100) {
      setTimeout(() => {
        gsap.to(pl, {
          opacity: 0,
          y: -20,
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => {
            pl.remove();
            document.body.classList.remove('no-scroll');
            initHeroAnimations();
          }
        });
      }, 250);
    }
  }, 50);
}

function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.hero-line--v-left, .hero-line--v-right', { scaleY: 1, duration: 1.2, stagger: 0.1 }, 0)
    .to('.hero-line--h-top, .hero-line--h-bottom', { scaleX: 1, duration: 1.0, stagger: 0.15 }, 0.2)
    .to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0.4)
    .to('#htLine1', { opacity: 1, y: 0, duration: 0.9 }, 0.6)
    .to('#htLine2', { opacity: 1, y: 0, duration: 0.9 }, 0.8)
    .to('#htLine3', { opacity: 1, y: 0, duration: 0.8 }, 1.0)
    .to('#heroDesc', { opacity: 1, y: 0, duration: 0.8 }, 1.1)
    .to('#heroActions', { opacity: 1, y: 0, duration: 0.8 }, 1.25)
    .to('#heroMetrics', { opacity: 1, y: 0, duration: 0.8 }, 1.35)
    .to('#scrollPrompt', { opacity: 1, duration: 0.8 }, 1.5);

  gsap.fromTo('#heroImg', { scale: 1.12 }, { scale: 1.0, duration: 3.5, ease: 'power2.out' });

  qsa('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    gsap.to({ v: 0 }, {
      v: target,
      duration: 2.5,
      ease: 'power2.out',
      delay: 1.4,
      onUpdate: function () {
        el.textContent = Math.floor(this.targets()[0].v);
      }
    });
  });
}

// ══════════════════════════════════════════════
//   CUSTOM CURSOR
// ══════════════════════════════════════════════
function initCursor() {
  const cur = qs('#cursor');
  const label = qs('#cursorLabel');
  if (!cur || !label) return;

  // Curseur personnalisé réservé aux pointeurs fins (souris / trackpad).
  // On écoute la media query pour rester correct après rotation ou
  // branchement d'une souris, plutôt que de tester innerWidth une seule fois.
  const applyPointerMode = () => {
    cur.style.display = isCoarsePointer() ? 'none' : '';
  };
  applyPointerMode();
  coarsePointerQuery.addEventListener('change', applyPointerMode);

  window.addEventListener('mousemove', e => {
    gsap.to(cur, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'none' });
  });

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('button, a, .pcard, .filter-tab, .tcard, .collab-card, .pdp-thumb-btn');
    if (t) {
      cur.classList.add('hovering');
      label.textContent = t.dataset.label || (t.classList.contains('pcard') ? 'DÉCOUVRIR' : 'EXPLORER');
    }
  });

  document.addEventListener('mouseout', e => {
    const t = e.target.closest('button, a, .pcard, .filter-tab, .tcard, .collab-card, .pdp-thumb-btn');
    if (t) cur.classList.remove('hovering');
  });
}

// ══════════════════════════════════════════════
//   POST-SALE UP-SELLING & VIP CONCIERGE ENGINE
// ══════════════════════════════════════════════
let activeUpsellPerfume = null;
let activeDuoPerfume = null;

export function openUpsellModal(perfume) {
  activeUpsellPerfume = perfume;

  // Select matching complementary Duo perfume
  if (perfume.gender === 'femme') {
    // If female -> suggest romantic or intense night companion
    activeDuoPerfume = perfumeCatalog.find(p => p.id === 2 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.id === 4 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.gender === 'homme') || 
                       perfumeCatalog[0];
  } else if (perfume.gender === 'homme') {
    // If male -> suggest night powerhouse or female gift companion
    activeDuoPerfume = perfumeCatalog.find(p => p.id === 39 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.id === 24 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.gender === 'femme') || 
                       perfumeCatalog[1];
  } else {
    activeDuoPerfume = perfumeCatalog.find(p => p.id !== perfume.id && p.category === 'amber') || perfumeCatalog[2];
  }

  const backdrop = qs('#upsellModalBackdrop');
  if (!backdrop) return;

  // Fill current item recap
  qs('#upsellCurrentImg').src = perfume.img;
  qs('#upsellCurrentName').textContent = `${perfume.name} • ${perfume.brand} (${perfume.volume})`;
  qs('#upsellCurrentPrice').textContent = perfume.priceFormatted;

  // Fill Duo offer
  const duoOrigPrice = activeDuoPerfume.price;
  const duoDiscPrice = Math.round(duoOrigPrice * 0.8); // 20% discount on second bottle

  qs('#upsellDuoImg').src = activeDuoPerfume.img;
  qs('#upsellDuoName').textContent = `${activeDuoPerfume.name} (${activeDuoPerfume.brand}) — 100ml`;
  qs('#upsellDuoOrigPrice').textContent = `${duoOrigPrice.toLocaleString('fr-DZ')} DA`;
  qs('#upsellDuoDiscPrice').textContent = `${duoDiscPrice.toLocaleString('fr-DZ')} DA (-20%)`;

  // Reset checkboxes
  const chkDuo = qs('#chkDuoPack');
  const chkAtomizer = qs('#chkAtomizer');
  const chkSamples = qs('#chkSamples');
  const chkGiftWrap = qs('#chkGiftWrap');

  if (chkDuo) chkDuo.checked = false;
  if (chkAtomizer) chkAtomizer.checked = false;
  if (chkSamples) chkSamples.checked = false;
  if (chkGiftWrap) chkGiftWrap.checked = true;

  updateUpsellUI();
  backdrop.classList.add('open');
}

function updateUpsellUI() {
  if (!activeUpsellPerfume) return;

  const chkDuo = qs('#chkDuoPack')?.checked || false;
  const chkAtomizer = qs('#chkAtomizer')?.checked || false;
  const chkSamples = qs('#chkSamples')?.checked || false;
  const chkGiftWrap = qs('#chkGiftWrap')?.checked || false;

  // Highlight selected cards
  qsa('.upsell-card').forEach(card => {
    const chk = card.querySelector('.upsell-chk');
    if (chk && chk.checked) card.classList.add('selected');
    else card.classList.remove('selected');
  });

  // Calculate live total & savings
  let total = activeUpsellPerfume.price;
  let savings = 0;

  if (chkDuo && activeDuoPerfume) {
    const duoOrigPrice = activeDuoPerfume.price;
    const duoDiscPrice = Math.round(duoOrigPrice * 0.8);
    total += duoDiscPrice;
    savings += (duoOrigPrice - duoDiscPrice);
  }

  if (chkAtomizer) total += 3500;
  if (chkSamples) total += 1800;

  // Update total DOM
  const totalValEl = qs('#upsellTotalVal');
  if (totalValEl) totalValEl.textContent = `${total.toLocaleString('fr-DZ')} DA`;

  const savingTag = qs('#upsellSavingTag');
  if (savingTag) {
    if (savings > 0) {
      savingTag.style.display = 'inline-block';
      savingTag.textContent = `✨ Vous Économisez ${savings.toLocaleString('fr-DZ')} DA sur cette commande`;
    } else {
      savingTag.style.display = 'none';
    }
  }

  // Construct personalized WhatsApp VIP message
  const itemsList = [`• ${activeUpsellPerfume.name} (${activeUpsellPerfume.brand}) : ${activeUpsellPerfume.priceFormatted}`];

  if (chkDuo && activeDuoPerfume) {
    const duoDiscPrice = Math.round(activeDuoPerfume.price * 0.8);
    itemsList.push(`• [OFFRE DUO -20%] ${activeDuoPerfume.name} (${activeDuoPerfume.brand}) : ${duoDiscPrice.toLocaleString('fr-DZ')} DA (au lieu de ${activeDuoPerfume.priceFormatted})`);
  }
  if (chkAtomizer) {
    itemsList.push(`• [ACCESSOIRE] Vaporisateur Nomade Rechargeable Or Brossé 10ml : 3 500 DA`);
  }
  if (chkSamples) {
    itemsList.push(`• [DÉCOUVERTE] Coffret 3 Échantillons Rares Niche (3 x 3ml) : 1 800 DA`);
  }
  if (chkGiftWrap) {
    itemsList.push(`• [CADEAU INCLUS] Écrin Cadeau Dar Safia & Ruban de Soie Doré : 0 DA (Offert)`);
  }

  const waSummary = itemsList.join('\n');
  setWhatsAppHref(
    qs('#upsellConfirmWaBtn'),
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite valider ma commande VIP avec les sélections suivantes :\n\n${waSummary}\n\n• MONTANT TOTAL : ${total.toLocaleString('fr-DZ')} DA\n• LIVRAISON : Express 58 Wilayas (Paiement à la livraison)\n\nMerci de me confirmer la préparation et l'expédition de mon colis !`
  );
}

function initUpsellModal() {
  const backdrop = qs('#upsellModalBackdrop');
  const close = qs('#closeUpsellModal');
  const skipBtn = qs('#upsellSkipBtn');

  // Checkbox change handlers
  ['#chkDuoPack', '#chkAtomizer', '#chkSamples', '#chkGiftWrap'].forEach(sel => {
    qs(sel)?.addEventListener('change', () => updateUpsellUI());
  });

  // Skip button: opens single perfume on WhatsApp
  skipBtn?.addEventListener('click', () => {
    if (activeUpsellPerfume) {
      backdrop?.classList.remove('open');
      openWhatsApp(
        `Bonjour Maison Dar Safia ✨\n\nJe souhaite commander le parfum suivant :\n• Parfum : ${activeUpsellPerfume.name} (${activeUpsellPerfume.brand})\n• Prix : ${activeUpsellPerfume.priceFormatted}\n• Volume : ${activeUpsellPerfume.volume}\n\nMerci de m'indiquer la disponibilité et les modalités de livraison express 58 Wilayas.`
      );
    }
  });

  // Close handlers
  close?.addEventListener('click', () => backdrop?.classList.remove('open'));
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
}

// ══════════════════════════════════════════════
//   LUXURY SHOPPING BAG & SLIDE-IN DRAWER
// ══════════════════════════════════════════════
function addToBag(perfumeOrName, priceFormatted) {
  let item = null;
  if (typeof perfumeOrName === 'object') {
    item = perfumeOrName;
  } else {
    // Find in catalog or fallback
    const found = perfumeCatalog.find(p => p.name === perfumeOrName);
    if (found) item = found;
    else {
      item = {
        id: 'addon-' + Date.now(),
        name: perfumeOrName,
        priceFormatted: priceFormatted,
        price: parseInt(String(priceFormatted).replace(/\D/g, '')) || 3500,
        img: '/img/logo/LOGO WEBP4.webp',
        brand: 'Dar Safia'
      };
    }
  }

  // Check if item already in bag, increment qty
  const existing = bagItems.find(i => i.name === item.name);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    bagItems.push({
      id: item.id,
      name: item.name,
      brand: item.brand || 'Dar Safia',
      price: item.price || parseInt(String(item.priceFormatted).replace(/\D/g, '')) || 0,
      priceFormatted: item.priceFormatted || `${item.price} DA`,
      img: item.img || '/img/logo/LOGO WEBP4.webp',
      qty: 1
    });
  }

  persistBag();
  updateBagBadge();
  renderBagDrawer();
  showToast(`« ${item.name} » ajouté à votre panier`);
}

function updateBagBadge() {
  const totalCount = bagItems.reduce((acc, i) => acc + (i.qty || 1), 0);
  const badge = qs('#bagBadge');
  if (badge) {
    badge.textContent = totalCount;
    if (totalCount > 0) {
      gsap.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
  }
  const drawerCount = qs('#bagDrawerCount');
  if (drawerCount) {
    drawerCount.textContent = `${totalCount} ${totalCount > 1 ? 'articles' : 'article'}`;
  }
}

function renderBagDrawer() {
  const container = qs('#bagItemsList');
  const subtotalEl = qs('#bagSubtotalVal');
  const delivText = qs('#bagDelivText');
  const delivFill = qs('#bagDelivFill');
  const checkoutBtn = qs('#bagCheckoutWaBtn');
  if (!container) return;

  if (bagItems.length === 0) {
    container.innerHTML = `
      <div class="bag-empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(200,155,60,0.4)" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p style="margin-top:12px;">Votre panier est actuellement vide.</p>
        <button class="btn-ghost" id="bagExploreBtn" style="margin-top:16px; font-size:.75rem; padding:8px 16px;">
          <span>Explorer les Parfums</span>
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0 DA';
    if (delivFill) delivFill.style.width = '0%';
    if (delivText) delivText.innerHTML = 'Ajoutez 2 parfums pour bénéficier de la <strong>Livraison Gratuite 58 Wilayas</strong> !';

    qs('#bagExploreBtn')?.addEventListener('click', () => {
      qs('#bagDrawerBackdrop')?.classList.remove('open');
      if (currentView === 'product') showHomePage(true);
      qs('#collection')?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  // Render items
  // Le panier est restauré depuis localStorage : on échappe systématiquement.
  container.innerHTML = bagItems.map((item, idx) => `
    <div class="bag-item-card" data-idx="${idx}">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" class="bag-item-img" />
      <div class="bag-item-info">
        <strong class="bag-item-name">${escapeHtml(item.name)}</strong>
        <span class="bag-item-price">${(item.price * item.qty).toLocaleString('fr-DZ')} DA ${item.qty > 1 ? `<small style="opacity:.7">(${item.qty}x ${escapeHtml(item.priceFormatted)})</small>` : ''}</span>
      </div>
      <button class="bag-item-remove" data-idx="${idx}" title="Supprimer du panier">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('');

  // Remove buttons
  qsa('.bag-item-remove', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const removed = bagItems.splice(idx, 1);
      if (removed.length) showToast(`« ${removed[0].name} » retiré du panier`);
      persistBag();
      updateBagBadge();
      renderBagDrawer();
    });
  });

  // Calculate totals
  const subtotal = bagItems.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0);
  const totalCount = bagItems.reduce((acc, i) => acc + (i.qty || 1), 0);

  if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString('fr-DZ')} DA`;

  // Delivery calculation (Free if >= 2 perfumes or >= 35,000 DA)
  const isFreeDelivery = totalCount >= 2 || subtotal >= 35000;
  if (delivFill) {
    const progress = isFreeDelivery ? 100 : Math.min(90, Math.round((subtotal / 35000) * 100));
    delivFill.style.width = `${progress}%`;
  }
  if (delivText) {
    if (isFreeDelivery) {
      delivText.innerHTML = '🎉 <strong>Félicitations !</strong> Vous bénéficiez de la <strong>Livraison Gratuite 58 Wilayas</strong> !';
    } else {
      delivText.innerHTML = `Ajoutez 1 création de plus pour débloquer la <strong>Livraison Gratuite 58 Wilayas</strong> !`;
    }
  }

  // Construct WhatsApp checkout message
  const summary = bagItems.map(i => `• ${i.name} (${i.brand}) x${i.qty || 1} : ${(i.price * (i.qty || 1)).toLocaleString('fr-DZ')} DA`).join('\n');
  setWhatsAppHref(
    checkoutBtn,
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite finaliser ma commande depuis mon Panier de Prestige :\n\n${summary}\n\n• SOUS-TOTAL : ${subtotal.toLocaleString('fr-DZ')} DA\n• LIVRAISON : ${isFreeDelivery ? 'OFFERTE (58 Wilayas)' : 'Calculée par la conciergerie'}\n• OPTION : Écrin Luxe & Ruban Doré Inclus\n\nMerci de me confirmer la validation et l'adresse de livraison !`
  );
}

function initBagModal() {
  const bagDrawerBackdrop = qs('#bagDrawerBackdrop');
  const closeBagBtn = qs('#closeBagDrawer');

  // Open Bag Drawer
  function openBagDrawer() {
    renderBagDrawer();
    bagDrawerBackdrop?.classList.add('open');
  }

  function closeBagDrawer() {
    bagDrawerBackdrop?.classList.remove('open');
  }

  qs('#bagBtn')?.addEventListener('click', openBagDrawer);
  closeBagBtn?.addEventListener('click', closeBagDrawer);
  bagDrawerBackdrop?.addEventListener('click', (e) => {
    if (e.target === bagDrawerBackdrop) closeBagDrawer();
  });

  // Global Add to Bag buttons delegation
  document.addEventListener('click', e => {
    const addBtn = e.target.closest('.btn-add');
    if (addBtn) {
      e.stopPropagation();
      const id = addBtn.dataset.id;
      const perfume = perfumeCatalog.find(p => String(p.id) === String(id));
      if (perfume) addToBag(perfume);
      else addToBag(addBtn.dataset.name, addBtn.dataset.price);
    }
  });

  // Drawer quick-add addon buttons
  qsa('.bag-add-addon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      addToBag(name, `${price.toLocaleString('fr-DZ')} DA`);
    });
  });

  // Intercept WhatsApp direct buy buttons to trigger Up-Sell VIP Concierge
  document.addEventListener('click', e => {
    // 1. PDP "Commander sur WhatsApp"
    const pdpWaBtn = e.target.closest('.pdp-wa-btn');
    if (pdpWaBtn) {
      e.preventDefault();
      const perfume = perfumeCatalog.find(p => p.id === selectedPerfumeId) || perfumeCatalog[0];
      openUpsellModal(perfume);
      return;
    }

    // 2. Catalog card "WhatsApp" button
    const pcardWaBtn = e.target.closest('.pcard-wa-btn');
    if (pcardWaBtn) {
      e.preventDefault();
      const pcard = pcardWaBtn.closest('.pcard');
      const id = pcard?.dataset.id;
      const perfume = perfumeCatalog.find(p => String(p.id) === String(id)) || perfumeCatalog[0];
      openUpsellModal(perfume);
      return;
    }
  });

  initUpsellModal();
}

// ══════════════════════════════════════════════
//   FILTER & SEARCH
// ══════════════════════════════════════════════
function initFilterAndSearch() {
  qsa('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.f;
      renderProducts();
    });
  });

  const searchInput = qs('#catalogSearchInput');
  if (searchInput) {
    // Debounce : évite de re-rendre les 45 fiches à chaque frappe.
    let searchTimer = null;
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.trim().toLowerCase();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = value;
        renderProducts();
      }, 160);
    });
  }
}

// ══════════════════════════════════════════════
//   COLLABORATION FORM
// ══════════════════════════════════════════════
function initCollaborationForm() {
  const form = qs('#collabForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = qs('#collabType')?.value || 'Collaboration';
    const name = qs('#collabName')?.value || '';
    const contact = qs('#collabContact')?.value || '';
    const notes = qs('#collabNotes')?.value || '';

    showToast('Votre demande a été préparée. Redirection vers WhatsApp Conciergerie...');
    setTimeout(() => {
      openWhatsApp(
        `Bonjour Maison Dar Safia ✨\n\nDemande de Collaboration / Partenariat :\n• Type : ${type}\n• Nom / Marque : ${name}\n• Contact : ${contact}\n• Message : ${notes}`
      );
      form.reset();
    }, 1000);
  });
}

// ══════════════════════════════════════════════
//   REVIEW MODAL
// ══════════════════════════════════════════════
function initReviewModal() {
  const reviewBackdrop = qs('#reviewModalBackdrop');
  const openReviewBtn = qs('#openReviewModalBtn');
  const closeReviewBtn = qs('#closeReviewModal');
  const reviewForm = qs('#reviewForm');

  openReviewBtn?.addEventListener('click', () => reviewBackdrop?.classList.add('open'));
  closeReviewBtn?.addEventListener('click', () => reviewBackdrop?.classList.remove('open'));

  reviewBackdrop?.addEventListener('click', (e) => {
    if (e.target === reviewBackdrop) reviewBackdrop.classList.remove('open');
  });

  reviewForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const reviewerName = qs('#reviewAuthorName')?.value || 'Client Vérifié';
    const perfumeLoved = qs('#reviewPerfumeChoice')?.value || 'Parfum Dar Safia';
    const reviewContent = qs('#reviewText')?.value || '';

    showToast(`Merci ${reviewerName} ! Votre avis a été publié avec succès.`);
    reviewBackdrop?.classList.remove('open');
    reviewForm.reset();

    const grid = qs('#testimonialsGrid');
    if (grid) {
      // Toutes les valeurs proviennent du formulaire : elles sont échappées
      // avant insertion pour éviter toute injection HTML/script.
      const newCard = document.createElement('div');
      newCard.className = 'tcard tcard--featured in-view';
      newCard.innerHTML = `
        <div class="tcard-stars">★★★★★</div>
        <blockquote class="tcard-quote">"${escapeHtml(reviewContent)}"</blockquote>
        <div class="tcard-author">
          <div class="tcard-avatar">${escapeHtml(reviewerName.charAt(0).toUpperCase())}</div>
          <div>
            <strong class="tcard-name">${escapeHtml(reviewerName)}</strong>
            <span class="tcard-title">Client Vérifié · ${escapeHtml(perfumeLoved)}</span>
          </div>
        </div>
      `;
      grid.prepend(newCard);
    }
  });
}

// ══════════════════════════════════════════════
//   BESPOKE SCENT FINDER QUIZ PROMAX (DIAGNOSTIC ENGINE)
// ══════════════════════════════════════════════
function initQuiz() {
  const backdrop = qs('#quizBackdrop');
  const close = qs('#quizClose');
  const progFill = qs('#quizProgFill');
  const stepBadge = qs('#quizStepBadge');
  const subheader = qs('#quizSubheader');
  const prevBtn = qs('#quizPrevBtn');
  const navRow = qs('#quizNavRow');
  const restartBtn = qs('#qrRestartBtn');

  let currentStep = 1;
  const userAnswers = {
    gender: null,
    moment: null,
    family: null,
    intensity: null
  };

  const stepSubheaders = {
    1: 'Définissez votre profil pour qui le parfum est destiné.',
    2: 'Sélectionnez le moment d’émotion et l’ambiance recherchée.',
    3: 'Indiquez les matières nobles et accords olfactifs que vous adorez.',
    4: 'Choisissez le niveau d’impact, de sillage et de persistance souhaité.'
  };

  function openQuiz() {
    backdrop?.classList.add('open');
    currentStep = 1;
    showStep(1);
  }

  function showStep(n) {
    currentStep = n;
    qsa('.quiz-step').forEach(s => s.classList.remove('active'));

    if (n === 'result') {
      qs('#qzResult')?.classList.add('active');
      if (progFill) progFill.style.width = '100%';
      if (stepBadge) stepBadge.textContent = 'Diagnostic Complété';
      if (subheader) subheader.textContent = 'Voici la création d’exception sculptée pour votre personnalité.';
      if (navRow) navRow.style.display = 'none';

      // Animate result entrance
      gsap.fromTo('.qr-box', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' });
    } else {
      qs(`#qzStep${n}`)?.classList.add('active');
      const progressPercent = ((n) / 4) * 100;
      if (progFill) progFill.style.width = `${progressPercent}%`;
      if (stepBadge) stepBadge.textContent = `Étape ${n} sur 4`;
      if (subheader && stepSubheaders[n]) subheader.textContent = stepSubheaders[n];
      if (navRow) navRow.style.display = n > 1 ? 'flex' : 'none';

      // Animate step options entrance
      gsap.fromTo(`#qzStep${n} .quiz-opt`, 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }

  // Previous button navigation
  prevBtn?.addEventListener('click', () => {
    if (typeof currentStep === 'number' && currentStep > 1) {
      showStep(currentStep - 1);
    }
  });

  // Restart button
  restartBtn?.addEventListener('click', () => {
    userAnswers.gender = null;
    userAnswers.moment = null;
    userAnswers.family = null;
    userAnswers.intensity = null;
    showStep(1);
  });

  // Attach buttons to open quiz
  qs('#quizNavBtn')?.addEventListener('click', openQuiz);
  qs('#heroQuizBtn')?.addEventListener('click', openQuiz);

  // Étape 1 : Genre / Destinataire
  qs('#qzStep1')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.gender = opt.dataset.a;
    showStep(2);
  });

  // Étape 2 : Moment / Atmosphère
  qs('#qzStep2')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.moment = opt.dataset.a;
    showStep(3);
  });

  // Étape 3 : Famille Olfactive
  qs('#qzStep3')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.family = opt.dataset.a;
    showStep(4);
  });

  // Étape 4 : Intensité & Sillage -> Calcul du Diagnostic
  qs('#qzStep4')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.intensity = opt.dataset.a;

    calculateDiagnosticResult();
  });

  function calculateDiagnosticResult() {
    // Score all 45 perfumes in the catalog
    const scoredList = perfumeCatalog.map(p => {
      let score = 50; // Base score
      const descLower = (p.desc + ' ' + p.top + ' ' + p.heart + ' ' + p.base + ' ' + p.story).toLowerCase();

      // 1. Gender criteria
      if (userAnswers.gender === 'femme') {
        if (p.gender === 'femme') score += 35;
        else if (p.gender === 'unisexe') score += 20;
        else score -= 15;
      } else if (userAnswers.gender === 'homme') {
        if (p.gender === 'homme') score += 35;
        else if (p.gender === 'unisexe') score += 20;
        else score -= 15;
      } else if (userAnswers.gender === 'unisexe') {
        if (p.gender === 'unisexe') score += 40;
        else score += 25;
      } else if (userAnswers.gender === 'cadeau') {
        score += (p.reviewsCount > 200 ? 30 : 18);
        if (p.badge?.includes('Best') || p.badge?.includes('Coup') || p.badge?.includes('Légende') || p.badge?.includes('Chef-d')) {
          score += 20;
        }
      }

      // 2. Olfactory Family criteria
      if (userAnswers.family) {
        if (p.category === userAnswers.family) {
          score += 40;
        }
        if (p.catLabels?.includes(userAnswers.family)) {
          score += 25;
        }
        // "spicy" est proposé dans le quiz mais n'existe pas comme `category`
        // au catalogue : on compense par un bonus mots-clés équivalent au
        // score qu'apporterait une correspondance de famille (+40/+25).
        if (userAnswers.family === 'spicy' && (descLower.includes('épic') || descLower.includes('poivre') || descLower.includes('cardamome') || descLower.includes('cuir') || descLower.includes('cannelle') || descLower.includes('muscade') || descLower.includes('safran') || descLower.includes('encens'))) {
          score += 55;
        }
        if (userAnswers.family === 'amber' && (descLower.includes('ambre') || descLower.includes('vanille') || descLower.includes('benjoin') || descLower.includes('tonka'))) {
          score += 25;
        }
        if (userAnswers.family === 'woody' && (descLower.includes('bois') || descLower.includes('cèdre') || descLower.includes('vétiver') || descLower.includes('santal') || descLower.includes('oud'))) {
          score += 25;
        }
        if (userAnswers.family === 'fresh' && (descLower.includes('marin') || descLower.includes('agrumes') || descLower.includes('bergamote') || descLower.includes('eau'))) {
          score += 25;
        }
        if (userAnswers.family === 'gourmand' && (descLower.includes('caramel') || descLower.includes('chocolat') || descLower.includes('cacao') || descLower.includes('sucre') || descLower.includes('gourmand'))) {
          score += 25;
        }
        if (userAnswers.family === 'floral' && (descLower.includes('rose') || descLower.includes('jasmin') || descLower.includes('fleur') || descLower.includes('iris'))) {
          score += 25;
        }
      }

      // 3. Moment / Atmosphere criteria
      if (userAnswers.moment === 'night') {
        if (p.badge?.includes('Intense') || p.badge?.includes('Nocturne') || p.name.includes('Nuit') || p.name.includes('Elixir') || p.category === 'amber' || p.category === 'woody') {
          score += 30;
        }
      } else if (userAnswers.moment === 'day') {
        if (p.category === 'floral' || p.category === 'fresh' || p.concentration.includes('Toilette') || p.badge?.includes('Élégance') || p.badge?.includes('Chic')) {
          score += 30;
        }
      } else if (userAnswers.moment === 'prestige') {
        if (p.price >= 22000 || p.badge?.includes('Prestige') || p.badge?.includes('Chef-d’Œuvre') || p.badge?.includes('Haute') || p.badge?.includes('Légende')) {
          score += 35;
        }
      } else if (userAnswers.moment === 'fresh') {
        if (p.category === 'fresh' || descLower.includes('fraîcheur') || descLower.includes('océan') || descLower.includes('mer')) {
          score += 35;
        }
      }

      // 4. Intensity criteria
      if (userAnswers.intensity === 'intense') {
        if (p.longevity === '48h+' || p.longevity === '72h' || p.concentration.includes('Elixir') || p.concentration.includes('Intense') || p.concentration.includes('Parfum Concentré')) {
          score += 30;
        }
      } else if (userAnswers.intensity === 'balanced') {
        if (p.concentration.includes('Eau de Parfum') || p.longevity === '36h' || p.longevity === '48h') {
          score += 25;
        }
      } else if (userAnswers.intensity === 'subtle') {
        if (p.concentration.includes('Toilette') || p.longevity === '24h' || p.longevity === '30h') {
          score += 25;
        }
      }

      return { perfume: p, score };
    });

    // Sort descending by score
    scoredList.sort((a, b) => b.score - a.score);

    const winner = scoredList[0].perfume;
    const alternatives = scoredList.slice(1, 3).map(item => item.perfume);

    // Calculate match percentage (between 95% and 99% for prime feeling)
    const matchScore = Math.min(99, Math.max(94, Math.round(92 + (scoredList[0].score / 250) * 7)));

    // Render result details
    qs('#qrMatchScore').textContent = `${matchScore}%`;
    qs('#qrTitle').textContent = winner.name;
    qs('#qrBrand').textContent = `Maison ${winner.brand} • ${winner.volume}`;
    qs('#qrImg').src = winner.img;
    qs('#qrImg').alt = winner.name;
    qs('#qrPrice').textContent = winner.priceFormatted;
    qs('#qrBadge').textContent = winner.badge || 'Signature d’Exception';
    qs('#qrDesc').textContent = winner.desc;

    qs('#qrTopNote').textContent = winner.top;
    qs('#qrHeartNote').textContent = winner.heart;
    qs('#qrBaseNote').textContent = winner.base;

    // WhatsApp button with customized message
    setWhatsAppHref(
      qs('#qrWhatsAppBtn'),
      `Bonjour Maison Dar Safia ✨\n\nJ'ai complété votre Diagnostic Olfactif sur-mesure (Score : ${matchScore}% de compatibilité).\n\nMa création idéale est :\n• Parfum : ${winner.name} (${winner.brand})\n• Prix : ${winner.priceFormatted}\n• Volume : ${winner.volume}\n\nMerci de me confirmer la disponibilité pour une commande et livraison express 58 Wilayas.`
    );

    // Link to Product Detail Page
    const qrLink = qs('#qrExplore');
    if (qrLink) {
      qrLink.onclick = () => {
        backdrop.classList.remove('open');
        showProductPage(winner.id, true);
      };
    }

    // Render alternatives
    const altGrid = qs('#qrAltGrid');
    if (altGrid) {
      altGrid.innerHTML = alternatives.map((alt, idx) => `
        <div class="qr-alt-card" data-id="${alt.id}">
          <img src="${alt.img}" alt="${alt.name}" class="qr-alt-img" />
          <div class="qr-alt-info">
            <strong class="qr-alt-name">${alt.name}</strong>
            <span class="qr-alt-price">${alt.priceFormatted}</span>
          </div>
        </div>
      `).join('');

      qsa('.qr-alt-card', altGrid).forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.id;
          backdrop.classList.remove('open');
          showProductPage(id, true);
        });
      });
    }

    showStep('result');
  }

  close?.addEventListener('click', () => backdrop?.classList.remove('open'));
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
}

// ══════════════════════════════════════════════
//   ROUTING & HASH NAVIGATION
// ══════════════════════════════════════════════
function initRouting() {
  function handleHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#product-')) {
      const id = hash.replace('#product-', '');
      showProductPage(id, false);
    } else if (!hash || hash === '#' || hash === '#hero' || hash === '#collection') {
      if (currentView === 'product') {
        showHomePage(false);
      }
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

// ══════════════════════════════════════════════
//   SCROLL EFFECTS & PARALLAX
// ══════════════════════════════════════════════
function initScrollEffects() {
  const header = qs('#siteHeader');
  const progress = qs('#navProgress');
  const navLinks = qsa('.nav-a');
  const sections = ['hero', 'heritage', 'collection', 'artistry', 'packaging', 'acclaim', 'collaborations', 'atelier'];

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');

    const doc = document.documentElement;
    const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
    if (progress) progress.style.width = `${scrolled * 100}%`;

    // Highlight active nav link based on visible section
    const headerH = header?.offsetHeight || 110;
    let currentSection = '';
    sections.forEach(id => {
      const el = qs(`#${id}`);
      if (el && el.getBoundingClientRect().top <= headerH + 80) {
        currentSection = id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });

  gsap.to('#heroImg', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  qsa('.reveal-on-scroll, .heritage-layout, .artistry-inner, .packaging-layout, .atelier-card').forEach(el => io.observe(el));
}

// ══════════════════════════════════════════════
//   MOBILE DRAWER NAVIGATION
// ══════════════════════════════════════════════
function initMobileMenu() {
  const hamburger = qs('#hamburgerBtn');
  const drawer = qs('#mobileDrawer');
  if (!hamburger || !drawer) return;

  function toggleMenu() {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    drawer.classList.add('open');
    hamburger.classList.add('active');
  }

  function closeMenu() {
    drawer.classList.remove('open');
    hamburger.classList.remove('active');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any link inside the mobile drawer
  qsa('.mobile-nav-a, .mobile-wa-btn', drawer).forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
}

// ══════════════════════════════════════════════
//   INITIALIZE
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initAmbientMusic();
  initFilterAndSearch();
  renderProducts();
  initBagModal();
  // Le panier est restauré depuis localStorage avant l'init : on synchronise
  // le compteur d'entête, sinon il resterait à 0 après un rechargement.
  updateBagBadge();
  initCollaborationForm();
  initReviewModal();
  initQuiz();
  initScrollEffects();
  initMobileMenu();
  initRouting();

  const mainWaBtn = qs('#floatingWaBtn');
  const generalWaLink = getWhatsAppGeneralLink();
  if (mainWaBtn && generalWaLink) mainWaBtn.href = generalWaLink;
  else mainWaBtn?.setAttribute('aria-disabled', 'true');

  // Smooth scroll for nav anchor links with proper offset
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.length <= 1) return;
    if (href.startsWith('#product-')) return; // Handled by PDP routing

    if (currentView === 'product') {
      showHomePage(false);
      // Wait for DOM to update then scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = qs(href);
          if (target) {
            const headerH = qs('#siteHeader')?.offsetHeight || 110;
            const y = target.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        });
      });
      e.preventDefault();
      return;
    }

    const target = qs(href);
    if (target) {
      e.preventDefault();
      const headerH = qs('#siteHeader')?.offsetHeight || 110;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      qs('#quizBackdrop')?.classList.remove('open');
      qs('#reviewModalBackdrop')?.classList.remove('open');
    }
  });
});
