/**
 * ══════════════════════════════════════════════════════════════
 *   DAR SAFIA — MODÈLE DE DOMAINE DU CATALOGUE
 * ══════════════════════════════════════════════════════════════
 *
 * Contrat que les composants consomment. Il appartient à l'application,
 * PAS au CMS : Strapi devra s'y conformer, et non l'inverse. C'est ce qui
 * permettra de remplacer l'implémentation statique par un client Strapi
 * (phase 3) sans toucher un seul composant.
 *
 * Écart volontaire avec le tableau `perfumeCatalog` actuel de main.js —
 * chaque écart corrige un problème identifié pendant l'audit :
 *
 *  - `slug`        AJOUTÉ. Aucun identifiant d'URL aujourd'hui ; le routage
 *                  se fait sur un id numérique (#product-12), inexploitable
 *                  en SEO. Indispensable pour /parfums/dior-sauvage-elixir.
 *  - `price`       Devient un objet Money. `priceFormatted` ('23 500 DA')
 *                  était stocké en dur à côté du nombre : deux sources pour
 *                  la même donnée, et un formatage impossible à localiser
 *                  (l'arabe n'utilise pas le même séparateur de milliers).
 *                  Le formatage devient une fonction d'affichage.
 *  - `notes`       Devient structuré. Aujourd'hui `top`/`heart`/`base` sont
 *                  des chaînes jointes par virgules, donc impossibles à
 *                  filtrer ou à relier entre parfums. En base ce sont des
 *                  relations vers FragranceNote.
 *  - `catLabels`   SUPPRIMÉ. Dupliquait `gender` + `family` + accessoires,
 *                  et pouvait diverger d'eux. Le filtrage se dérive.
 *  - `image`       Devient un objet média avec variantes. Le pipeline produit
 *                  déjà plusieurs largeurs ; Strapi renverra une forme
 *                  comparable.
 *  - `rating`      Devient dérivé des avis, et OPTIONNEL. Les valeurs
 *                  actuelles ('4.9', 142 avis) sont inventées : un produit
 *                  sans avis réel ne doit afficher aucune note plutôt qu'une
 *                  note fabriquée.
 *  - `stock`       AJOUTÉ. Toutes les fiches affichent « En Stock » en dur.
 */

// ── Vocabulaire ────────────────────────────────────────────────

/** Genre visé. `unisexe` est une valeur à part entière, pas un défaut. */
export type Gender = 'femme' | 'homme' | 'unisexe';

/**
 * Familles olfactives. `spicy` est inclus : le quiz le propose déjà alors
 * qu'aucun parfum ne le porte, incohérence relevée pendant l'audit.
 */
export type FragranceFamily =
  | 'floral' | 'amber' | 'woody' | 'fresh' | 'gourmand' | 'spicy';

/** Étage de la pyramide olfactive. */
export type NoteLayer = 'top' | 'heart' | 'base';

export type Season = 'printemps' | 'ete' | 'automne' | 'hiver' | 'toutes';
export type Occasion = 'jour' | 'soir' | 'ceremonie' | 'bureau' | 'quotidien';

// ── Valeurs ────────────────────────────────────────────────────

/**
 * Montant. Le formatage est du ressort de l'affichage, jamais du stockage :
 * la locale change (fr-DZ, ar-DZ, en) alors que le montant, non.
 */
export interface Money {
  /** Montant en unité entière de la devise (pas en centimes : le dinar algérien n'est pas subdivisé en pratique). */
  amount: number;
  currency: 'DZD';
}

/** Image et ses variantes responsives produites par le pipeline. */
export interface Media {
  /** Variante par défaut. */
  url: string;
  /** Attribut srcset prêt à l'emploi, ou null si aucune variante. */
  srcset: string | null;
  /** Texte alternatif. Obligatoire : une image produit sans alt est un défaut d'accessibilité. */
  alt: string;
  width?: number;
  height?: number;
}

// ── Entités ────────────────────────────────────────────────────

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description?: string;
  country?: string;
  logo?: Media;
}

/** Note olfactive individuelle — entité à part pour permettre « autres parfums au jasmin ». */
export interface FragranceNote {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: Media;
}

/** Une note telle qu'elle apparaît dans la pyramide d'un parfum. */
export interface ProductNote {
  note: FragranceNote;
  layer: NoteLayer;
  /** Ordre d'affichage dans son étage. */
  position: number;
}

/** Format vendu. Remplace le champ texte libre `volume`. */
export interface ProductVariant {
  id: string;
  /** Contenance en millilitres. Numérique pour permettre le tri et le filtrage. */
  volumeMl: number;
  price: Money;
  /** Prix barré, si promotion. */
  compareAtPrice?: Money;
  stock: number;
  sku?: string;
}

/** Note agrégée. Absente tant qu'aucun avis réel n'existe. */
export interface RatingSummary {
  /** Moyenne sur 5. */
  average: number;
  count: number;
}

export interface Product {
  id: string;
  /** Identifiant d'URL, stable et lisible. */
  slug: string;
  name: string;
  brand: Brand;

  description: string;
  /** Récit éditorial, plus long que la description. */
  story?: string;

  gender: Gender;
  family: FragranceFamily;
  /** Familles secondaires, pour le filtrage transversal. */
  secondaryFamilies: FragranceFamily[];

  notes: ProductNote[];
  variants: ProductVariant[];

  images: Media[];
  video?: Media;

  concentration?: string;
  /** Tenue en heures. Numérique : '48h+' n'est pas triable. */
  longevityHours?: number;
  /** Puissance du sillage, de 1 (discret) à 5 (puissant). */
  sillage?: 1 | 2 | 3 | 4 | 5;

  seasons: Season[];
  occasions: Occasion[];

  /** Absente si le produit n'a pas encore d'avis. Ne jamais inventer. */
  rating?: RatingSummary;

  badge?: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;

  seo?: SeoMetadata;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  heroMedia?: Media;
  /** Univers visuel appliqué, clé de `universe` dans tokens.json. */
  theme?: string;
  seo?: SeoMetadata;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  ogImage?: Media;
}

// ── Accès aux données ──────────────────────────────────────────

export interface ProductQuery {
  gender?: Gender;
  family?: FragranceFamily;
  brandSlug?: string;
  collectionSlug?: string;
  /** Recherche plein texte sur nom, marque, description et notes. */
  search?: string;
  featured?: boolean;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'name';
  limit?: number;
  offset?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

/**
 * LA COUTURE QUI COMPTE.
 *
 * Les composants dépendent de cette interface, jamais d'un tableau importé
 * ni d'un client Strapi. Phase 2 fournit une implémentation statique à
 * partir des 45 parfums actuels ; phase 3 la remplace par Strapi. Si cette
 * règle tient, la bascule est un changement de configuration.
 *
 * Corollaire : aucun composant ne doit importer `perfumeCatalog`.
 */
export interface CatalogRepository {
  listProducts(query?: ProductQuery): Promise<Paginated<Product>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  /** Parfums proches — même famille ou même marque. */
  getRelatedProducts(slug: string, limit?: number): Promise<Product[]>;

  listBrands(): Promise<Brand[]>;
  getBrandBySlug(slug: string): Promise<Brand | null>;

  listCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;
}
