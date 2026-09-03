/**
 * ══════════════════════════════════════════════════════════════
 *   DIAGNOSTIC OLFACTIF — MOTEUR DE SCORE
 * ══════════════════════════════════════════════════════════════
 *
 * Fonction pure : (produits, réponses) -> classement. Aucun accès aux données,
 * aucun effet — le repository lui fournit les produits, ce qui la garde
 * testable et indépendante de la source (statique aujourd'hui, Strapi demain).
 *
 * Écart assumé avec l'ancien site :
 *
 *  - Le score s'appuie sur les champs structurés (family, secondaryFamilies,
 *    occasions, longevityHours, concentration), plus sur `desc.includes(...)`.
 *  - Aucun pourcentage de compatibilité inventé. L'ancien code forçait le
 *    résultat entre 94 % et 99 % « pour l'effet ». Ici la compatibilité est
 *    le score obtenu rapporté au score maximum atteignable — une vraie
 *    fraction de critères satisfaits.
 *  - `cadeau` s'appuie sur les drapeaux `featured` / `bestseller` (dérivés de
 *    vrais badges), plus sur un `reviewsCount` fictif.
 */

import type { Product } from '@/lib/catalog';
import type { QuizAnswers } from './types';

export interface ScentMatch {
  product: Product;
  /** Score brut cumulé. */
  score: number;
  /** Score rapporté au maximum atteignable, en pourcentage entier (0–100). */
  compatibility: number;
}

/**
 * Poids maximum par question. Sert à normaliser la compatibilité : on ne veut
 * pas qu'un parfum coche tout et plafonne à 60 % parce que le barème est mal
 * calibré, ni qu'il atteigne 100 % en cochant la moitié.
 */
const MAX_PER_QUESTION = {
  recipient: 35,
  moment: 30,
  family: 40,
  intensity: 30,
} as const;

const MAX_TOTAL =
  MAX_PER_QUESTION.recipient +
  MAX_PER_QUESTION.moment +
  MAX_PER_QUESTION.family +
  MAX_PER_QUESTION.intensity;

/** Concentrations considérées comme intenses (tenue longue, fort sillage). */
const INTENSE_CONCENTRATION = /elixir|intense|extr[êe]me|ultime|absolu|concentr[ée]|le parfum/i;
const LIGHT_CONCENTRATION = /toilette/i;

function scoreRecipient(product: Product, answer: QuizAnswers['recipient']): number {
  if (answer === 'cadeau') {
    // Valeurs sûres : ce que la maison met en avant.
    if (product.bestseller) return MAX_PER_QUESTION.recipient;
    if (product.featured) return 28;
    return 12;
  }

  if (product.gender === answer) return MAX_PER_QUESTION.recipient;
  if (product.gender === 'unisexe') return 18;
  // Un parfum du genre opposé n'est pas exclu, mais nettement moins bien placé.
  return 0;
}

function scoreMoment(product: Product, answer: QuizAnswers['moment']): number {
  const max = MAX_PER_QUESTION.moment;

  switch (answer) {
    case 'jour':
      if (product.occasions.includes('jour') || product.occasions.includes('bureau')) return max;
      if (product.family === 'fresh' || product.family === 'floral') return 20;
      return 0;

    case 'nuit':
      if (product.occasions.includes('soir')) return max;
      if (product.family === 'amber' || product.family === 'woody') return 20;
      return 0;

    case 'prestige':
      if (product.occasions.includes('ceremonie')) return max;
      if (product.featured || /prestige|haute|l[ée]gende|chef|exception|signature/i.test(product.badge ?? '')) {
        return 24;
      }
      return 0;

    case 'fraicheur':
      if (product.family === 'fresh') return max;
      if (product.secondaryFamilies.includes('fresh')) return 18;
      return 0;
  }
}

function scoreFamily(product: Product, answer: QuizAnswers['family']): number {
  const max = MAX_PER_QUESTION.family;

  if (product.family === answer) return max;
  if (product.secondaryFamilies.includes(answer)) return 22;
  return 0;
}

function scoreIntensity(product: Product, answer: QuizAnswers['intensity']): number {
  const max = MAX_PER_QUESTION.intensity;
  const hours = product.longevityHours ?? 0;
  const conc = product.concentration ?? '';

  switch (answer) {
    case 'intense':
      if (hours >= 48 || INTENSE_CONCENTRATION.test(conc)) return max;
      if (hours >= 36) return 15;
      return 0;

    case 'equilibre':
      if (hours >= 36 && hours < 48) return max;
      if (/eau de parfum/i.test(conc) && !INTENSE_CONCENTRATION.test(conc)) return 22;
      return 8;

    case 'subtil':
      if (hours > 0 && hours <= 30) return max;
      if (LIGHT_CONCENTRATION.test(conc)) return max;
      return 0;
  }
}

/**
 * Classe les produits fournis selon les réponses. Retourne la liste complète,
 * triée par score décroissant — l'appelant décide combien en montrer.
 *
 * En cas d'égalité de score, on départage par le prix le plus bas : à
 * pertinence égale, on ne pousse pas d'office le parfum le plus cher.
 */
export function rankScentMatches(
  products: Product[],
  answers: QuizAnswers
): ScentMatch[] {
  return products
    .map((product): ScentMatch => {
      const score =
        scoreRecipient(product, answers.recipient) +
        scoreMoment(product, answers.moment) +
        scoreFamily(product, answers.family) +
        scoreIntensity(product, answers.intensity);

      return {
        product,
        score,
        compatibility: Math.round((score / MAX_TOTAL) * 100),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const priceA = Math.min(...a.product.variants.map((v) => v.price.amount));
      const priceB = Math.min(...b.product.variants.map((v) => v.price.amount));
      return priceA - priceB;
    });
}
