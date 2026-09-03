import Link from 'next/link';

/**
 * Page 404.
 *
 * Next fournit une page par défaut en blanc sur noir, sans typographie ni
 * couleurs de la maison : une rupture nette au milieu du parcours. Celle-ci
 * garde l'univers et propose une sortie utile plutôt qu'un cul-de-sac.
 */
export default function NotFound() {
  return (
    <main
      id="contenu"
      className="mx-auto flex min-h-[70vh] max-w-(--container-site) flex-col items-start justify-center px-5 py-20 md:px-8"
    >
      <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
        Erreur 404
      </p>

      <h1 className="mt-5 max-w-2xl font-serif text-display-md text-balance text-ivory">
        Ce flacon est introuvable
      </h1>

      <p className="mt-5 max-w-md font-body text-xl leading-relaxed text-ivory/65">
        La page que vous cherchez a peut-être changé d&apos;adresse, ou n&apos;a
        jamais existé.
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href="/parfums"
          className="rounded-sm bg-gold px-6 py-3 text-2xs font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
        >
          Voir la collection
        </Link>
        <Link
          href="/"
          className="rounded-sm border border-smoke-2 px-6 py-3 text-2xs font-semibold tracking-(--tracking-label) text-ivory/75 uppercase transition-colors hover:border-gold/50 hover:text-ivory"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
