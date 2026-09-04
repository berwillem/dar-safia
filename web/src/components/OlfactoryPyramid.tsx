import type { NoteLayer, ProductNote } from '@/lib/catalog';
import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * Pyramide olfactive : tête, cœur, fond.
 *
 * Chaque note est une entité distincte (permet « autres parfums au jasmin »
 * sans retoucher ce composant). La structure est une liste de définitions :
 * les trois étages décrivent l'évolution du parfum dans le temps.
 */
export function OlfactoryPyramid({
  notes,
  dict,
}: {
  notes: ProductNote[];
  dict: Dictionary;
}) {
  const layers: { key: NoteLayer; label: string; caption: string }[] = [
    { key: 'top', label: dict.product.pyramid.top, caption: dict.product.pyramid.topCaption },
    { key: 'heart', label: dict.product.pyramid.heart, caption: dict.product.pyramid.heartCaption },
    { key: 'base', label: dict.product.pyramid.base, caption: dict.product.pyramid.baseCaption },
  ];

  const byLayer = (layer: NoteLayer) =>
    notes.filter((n) => n.layer === layer).sort((a, b) => a.position - b.position);

  return (
    <section aria-labelledby="pyramide" className="mt-14">
      <h2 id="pyramide" className="font-serif text-xl text-ivory">
        {dict.product.pyramidTitle}
      </h2>

      <dl className="mt-6 flex flex-col gap-px overflow-hidden rounded-md border border-smoke-2 bg-smoke-2">
        {layers.map(({ key, label, caption }) => {
          const layerNotes = byLayer(key);
          if (layerNotes.length === 0) return null;

          return (
            <div key={key} className="bg-noir-2 p-5">
              <dt>
                <span className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-[var(--universe-light)] uppercase">
                  {label}
                </span>
                <span className="mt-1 block text-2xs text-ivory/40">{caption}</span>
              </dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {layerNotes.map(({ note }) => (
                  <span
                    key={note.slug}
                    className="rounded-xs border border-smoke-2 bg-noir-3 px-2.5 py-1 font-body text-md text-ivory/85"
                  >
                    {note.name}
                  </span>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
