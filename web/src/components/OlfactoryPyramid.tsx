import type { NoteLayer, ProductNote } from '@/lib/catalog';

/**
 * Pyramide olfactive : tête, cœur, fond.
 *
 * L'ancien site rendait trois chaînes de texte séparées par des virgules.
 * Ici chaque note est une entité distincte, ce qui permettra en phase 3 de
 * lier « autres parfums au jasmin » sans retoucher ce composant.
 *
 * La structure est une liste de définitions : les trois étages ne sont pas
 * décoratifs, ils décrivent l'évolution du parfum dans le temps — un ordre
 * réel, que la sémantique doit porter.
 */

const LAYERS: { key: NoteLayer; label: string; caption: string }[] = [
  { key: 'top', label: 'Notes de tête', caption: 'Première impression, les 15 premières minutes' },
  { key: 'heart', label: 'Notes de cœur', caption: 'Signature du parfum, après évaporation de la tête' },
  { key: 'base', label: 'Notes de fond', caption: 'Sillage et persistance, plusieurs heures' },
];

export function OlfactoryPyramid({ notes }: { notes: ProductNote[] }) {
  const byLayer = (layer: NoteLayer) =>
    notes
      .filter((n) => n.layer === layer)
      .sort((a, b) => a.position - b.position);

  return (
    <section aria-labelledby="pyramide" className="mt-14">
      <h2
        id="pyramide"
        className="font-serif text-xl text-ivory"
      >
        Pyramide olfactive
      </h2>

      <dl className="mt-6 flex flex-col gap-px overflow-hidden rounded-md border border-smoke-2 bg-smoke-2">
        {LAYERS.map(({ key, label, caption }) => {
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
