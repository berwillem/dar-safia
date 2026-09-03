'use server';

import { catalog, lowestPrice } from '@/lib/catalog';
import { rankScentMatches } from '@/lib/quiz/engine';
import { QUIZ_STEPS, type QuizAnswers } from '@/lib/quiz/types';

/**
 * Résultat du diagnostic, réduit à ce que l'écran final affiche.
 *
 * On ne renvoie pas d'objets Product complets : le composant client n'a besoin
 * que de ces champs, et sérialiser histoire + notes + SEO pour trois parfums
 * alourdirait la réponse pour rien.
 */
export interface ScentResult {
  slug: string;
  name: string;
  brandName: string;
  imageUrl: string;
  imageSrcset: string | null;
  priceLabel: string;
  family: string;
  compatibility: number;
}

export interface ScentDiagnosis {
  match: ScentResult;
  alternatives: ScentResult[];
}

/**
 * Vérifie que les réponses reçues appartiennent bien au vocabulaire du quiz.
 * Elles viennent d'un composant client : on ne s'y fie pas.
 */
function parseAnswers(input: unknown): QuizAnswers | null {
  if (typeof input !== 'object' || input === null) return null;
  const raw = input as Record<string, unknown>;

  const result = {} as QuizAnswers;
  for (const step of QUIZ_STEPS) {
    const value = raw[step.key];
    const allowed = step.options.some((option) => option.value === value);
    if (!allowed) return null;
    // Chaque option.value est du type attendu pour sa clé ; le check ci-dessus
    // le garantit, la conversion ne fait que le refléter.
    (result[step.key] as string) = value as string;
  }
  return result;
}

function toResult(
  match: ReturnType<typeof rankScentMatches>[number]
): ScentResult {
  const { product } = match;
  return {
    slug: product.slug,
    name: product.name,
    brandName: product.brand.name,
    imageUrl: product.images[0]?.url ?? '',
    imageSrcset: product.images[0]?.srcset ?? null,
    priceLabel: new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
    }).format(lowestPrice(product)),
    family: product.family,
    compatibility: match.compatibility,
  };
}

/**
 * Server Action : reçoit les réponses, exécute le moteur contre le catalogue,
 * renvoie le meilleur parfum et deux alternatives.
 *
 * Le catalogue reste côté serveur — le client n'a jamais les 45 produits.
 */
export async function diagnoseScent(answers: unknown): Promise<ScentDiagnosis | null> {
  const parsed = parseAnswers(answers);
  if (!parsed) return null;

  const { items } = await catalog.listProducts();
  const ranked = rankScentMatches(items, parsed);
  if (ranked.length === 0) return null;

  return {
    match: toResult(ranked[0]),
    alternatives: ranked.slice(1, 3).map(toResult),
  };
}
