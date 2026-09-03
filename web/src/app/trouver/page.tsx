import type { Metadata } from 'next';

import { ScentFinder } from './ScentFinder';

export const metadata: Metadata = {
  title: 'Trouver votre parfum',
  description:
    'Quatre questions pour identifier la création Dar Safia qui vous correspond.',
};

/**
 * Page « Trouver votre parfum ».
 *
 * Coquille serveur : elle ne fait que poser le décor et monter le composant
 * client du diagnostic. Le score, lui, tourne dans une Server Action.
 */
export default function ScentFinderPage() {
  return (
    <main
      id="contenu"
      tabIndex={-1}
      className="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20"
    >
      <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
        Diagnostic olfactif
      </p>
      <h1 className="mt-4 font-serif text-display-md text-balance text-ivory">
        Trouver votre parfum
      </h1>
      <p className="mt-4 max-w-md font-body text-xl leading-relaxed text-ivory/65">
        Quatre questions, une recommandation. Aucune inscription.
      </p>

      <div className="mt-12">
        <ScentFinder />
      </div>
    </main>
  );
}
