/**
 * ══════════════════════════════════════════════════════════════
 *   DIAGNOSTIC OLFACTIF — VOCABULAIRE
 * ══════════════════════════════════════════════════════════════
 *
 * Quatre questions, comme sur l'ancien site. Ce module ne porte que la
 * STRUCTURE (clés d'étape, valeurs d'option) ; les libellés et intitulés
 * viennent du dictionnaire i18n (`scentFinder.questions.*`, `.options.*`).
 *
 * Le moteur de score (engine.ts) ne lit que les `value`.
 */

import type { FragranceFamily, Gender } from '@/lib/catalog';

export type RecipientAnswer = Gender | 'cadeau';
export type MomentAnswer = 'jour' | 'nuit' | 'prestige' | 'fraicheur';
export type FamilyAnswer = FragranceFamily;
export type IntensityAnswer = 'subtil' | 'equilibre' | 'intense';

export interface QuizAnswers {
  recipient: RecipientAnswer;
  moment: MomentAnswer;
  family: FamilyAnswer;
  intensity: IntensityAnswer;
}

export type QuizStepKey = keyof QuizAnswers;

export interface QuizStep<K extends QuizStepKey = QuizStepKey> {
  key: K;
  /** Valeurs d'option, dans l'ordre d'affichage. */
  options: QuizAnswers[K][];
}

/** Les quatre étapes, dans l'ordre (destinataire d'abord, le plus discriminant). */
export const QUIZ_STEPS: [
  QuizStep<'recipient'>,
  QuizStep<'moment'>,
  QuizStep<'family'>,
  QuizStep<'intensity'>,
] = [
  { key: 'recipient', options: ['femme', 'homme', 'unisexe', 'cadeau'] },
  { key: 'moment', options: ['jour', 'nuit', 'prestige', 'fraicheur'] },
  { key: 'family', options: ['floral', 'woody', 'amber', 'fresh', 'gourmand', 'spicy'] },
  { key: 'intensity', options: ['subtil', 'equilibre', 'intense'] },
];
