/**
 * ══════════════════════════════════════════════════════════════
 *   DIAGNOSTIC OLFACTIF — VOCABULAIRE
 * ══════════════════════════════════════════════════════════════
 *
 * Reprend les quatre questions du quiz de l'ancien site, dont l'enchaînement
 * est déjà connu de la propriétaire. Le moteur de score (engine.ts) est
 * réécrit : il s'appuie sur les champs structurés du modèle de domaine
 * (famille, occasions, tenue, concentration) plutôt que sur des `includes()`
 * dans le texte de description.
 *
 * Enrichir le questionnaire (saison, sucré/sec…) est une évolution possible,
 * hors de ce portage.
 */

import type { FragranceFamily, Gender } from '@/lib/catalog';

/** Q1 — pour qui. `cadeau` privilégie les valeurs sûres. */
export type RecipientAnswer = Gender | 'cadeau';

/** Q2 — moment et atmosphère recherchés. */
export type MomentAnswer = 'jour' | 'nuit' | 'prestige' | 'fraicheur';

/** Q3 — famille olfactive préférée. Aligné sur FragranceFamily. */
export type FamilyAnswer = FragranceFamily;

/** Q4 — intensité et sillage souhaités. */
export type IntensityAnswer = 'subtil' | 'equilibre' | 'intense';

export interface QuizAnswers {
  recipient: RecipientAnswer;
  moment: MomentAnswer;
  family: FamilyAnswer;
  intensity: IntensityAnswer;
}

export type QuizStepKey = keyof QuizAnswers;

export interface QuizOption<T extends string> {
  value: T;
  label: string;
  hint: string;
}

export interface QuizStep<K extends QuizStepKey = QuizStepKey> {
  key: K;
  question: string;
  options: QuizOption<QuizAnswers[K]>[];
}

/**
 * Les quatre étapes, dans l'ordre. La question la plus discriminante
 * (destinataire) vient en premier, comme sur l'ancien site.
 */
export const QUIZ_STEPS: [
  QuizStep<'recipient'>,
  QuizStep<'moment'>,
  QuizStep<'family'>,
  QuizStep<'intensity'>,
] = [
  {
    key: 'recipient',
    question: 'Pour qui cherchez-vous ?',
    options: [
      { value: 'femme', label: 'Pour elle', hint: 'Signatures féminines' },
      { value: 'homme', label: 'Pour lui', hint: 'Signatures masculines' },
      { value: 'unisexe', label: 'Sans distinction', hint: 'Créations mixtes' },
      { value: 'cadeau', label: 'Un cadeau', hint: 'Les valeurs sûres de la maison' },
    ],
  },
  {
    key: 'moment',
    question: 'Quel moment voulez-vous habiller ?',
    options: [
      { value: 'jour', label: 'Le jour', hint: 'Léger, lumineux, facile à porter' },
      { value: 'nuit', label: 'Le soir', hint: 'Profond, enveloppant, magnétique' },
      { value: 'prestige', label: 'Les grandes occasions', hint: 'Les pièces les plus rares' },
      { value: 'fraicheur', label: 'Un souffle de fraîcheur', hint: 'Vif, net, aquatique' },
    ],
  },
  {
    key: 'family',
    question: 'Vers quelle matière allez-vous instinctivement ?',
    options: [
      { value: 'floral', label: 'Fleurs', hint: 'Rose, jasmin, iris' },
      { value: 'woody', label: 'Bois', hint: 'Cèdre, santal, vétiver' },
      { value: 'amber', label: 'Ambre', hint: 'Vanille, benjoin, résines' },
      { value: 'fresh', label: 'Fraîcheur', hint: 'Agrumes, notes marines' },
      { value: 'gourmand', label: 'Gourmandise', hint: 'Caramel, cacao, fève tonka' },
      { value: 'spicy', label: 'Épices', hint: 'Poivre, cardamome, cuir' },
    ],
  },
  {
    key: 'intensity',
    question: 'Quelle présence recherchez-vous ?',
    options: [
      { value: 'subtil', label: 'Discrète', hint: 'Une aura, pas une annonce' },
      { value: 'equilibre', label: 'Équilibrée', hint: 'Présente sans dominer' },
      { value: 'intense', label: 'Affirmée', hint: 'Un sillage qui ne passe pas inaperçu' },
    ],
  },
];
