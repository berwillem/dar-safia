/**
 * ══════════════════════════════════════════════════════════════
 *   TÉMOIGNAGES CLIENTS
 * ══════════════════════════════════════════════════════════════
 *
 * Repris tels quels de l'ancien site : ce sont les mots des clientes et
 * clients de la maison, pas de la copie d'interface. Ils ne sont donc PAS
 * traduits — traduire un témoignage réel reviendrait à le réécrire — et ils
 * vivent ici plutôt que dans les dictionnaires, comme les fiches produit.
 *
 * ⚠️ À remplacer par de vrais avis collectés le jour où il y en a un module.
 * Ne pas en ajouter d'inventés.
 */

export interface Testimonial {
  quote: string;
  name: string;
  city: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "J'ai commandé le Dior Sauvage Elixir et Prada Paradoxe Intense. L'emballage est tout simplement royal et le parfum tient facilement 2 jours complets sur mes vêtements. 100 % authentique !",
    name: 'Amine B.',
    city: 'Alger',
  },
  {
    quote:
      "Service client sur WhatsApp ultra réactif ! J'ai été livrée en 24 h à Oran dans un magnifique coffret velours. Le Valentino Donna Born in Roma Intense est mon nouveau coup de cœur.",
    name: 'Sarah M.',
    city: 'Oran',
  },
  {
    quote:
      'Enfin une maison de parfum sérieuse en Algérie. Les prix sont très compétitifs pour des flacons 100 % originaux. Le JPG Scandal Elixir a un sillage incroyable.',
    name: 'Yacine K.',
    city: 'Constantine',
  },
  {
    quote:
      "Commander par WhatsApp est tellement simple et rapide. Merci à l'équipe Dar Safia pour les échantillons offerts et le professionnalisme exemplaire.",
    name: 'Leïla T.',
    city: 'Annaba',
  },
];
