/**
 * ══════════════════════════════════════════════════════════════
 *   FORME DES RÉPONSES STRAPI (REST v5)
 * ══════════════════════════════════════════════════════════════
 *
 * Strapi 5 aplatit les entités (plus de `data.attributes`). Ces types
 * décrivent ce que renvoie `/api/products?populate=...` etc.
 *
 * Ils sont volontairement permissifs (tout optionnel, `unknown` là où c'est
 * incertain) : le mapper (strapi-mapper.ts) valide et comble les manques.
 * On ne fait jamais confiance à la forme reçue du CMS.
 */

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiMediaFormat {
  url?: string;
  width?: number;
  height?: number;
}

export interface StrapiMedia {
  url?: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, StrapiMediaFormat | undefined> | null;
  mime?: string;
}

export interface StrapiMoney {
  amount?: number;
  currency?: string;
}

export interface StrapiVariant {
  id?: number;
  volumeMl?: number | null;
  price?: StrapiMoney | null;
  compareAtPrice?: StrapiMoney | null;
  stock?: number;
  sku?: string | null;
}

export interface StrapiProductNote {
  id?: number;
  layer?: string;
  position?: number;
  note?: StrapiNote | null;
}

export interface StrapiNote {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  image?: StrapiMedia | null;
}

export interface StrapiBrand {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  country?: string | null;
  logo?: StrapiMedia | null;
}

export interface StrapiSeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: StrapiMedia | null;
}

export interface StrapiProduct {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  brand?: StrapiBrand | null;
  description?: string;
  story?: string | null;
  gender?: string;
  family?: string;
  secondaryFamilies?: unknown;
  notes?: StrapiProductNote[] | null;
  variants?: StrapiVariant[] | null;
  images?: StrapiMedia[] | null;
  video?: StrapiMedia | null;
  concentration?: string | null;
  longevityHours?: number | null;
  sillage?: number | null;
  seasons?: unknown;
  occasions?: unknown;
  badge?: string | null;
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
  seo?: StrapiSeo | null;
}

export interface StrapiCollection {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  heroMedia?: StrapiMedia | null;
  theme?: string | null;
  products?: StrapiProduct[] | null;
  seo?: StrapiSeo | null;
}
