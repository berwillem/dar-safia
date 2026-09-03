/**
 * ══════════════════════════════════════════════════════════════
 *   PANIER — MODÈLE
 * ══════════════════════════════════════════════════════════════
 *
 * Une ligne de panier conserve un INSTANTANÉ des informations d'affichage
 * (nom, prix, image) en plus des identifiants.
 *
 * Pourquoi un instantané : le panier vit côté client, dans localStorage, et
 * doit pouvoir s'afficher sans aller rechercher 45 produits. L'alternative —
 * ne stocker que les identifiants et réhydrater — imposerait un aller-retour
 * serveur à chaque ouverture du tiroir.
 *
 * Le compromis assumé : un prix modifié après l'ajout reste affiché à
 * l'ancienne valeur. C'est acceptable ici parce que la commande passe par la
 * conciergerie WhatsApp, qui confirme le montant. En phase 3, le panier devra
 * être revalidé contre Strapi avant tout paiement en ligne — un instantané
 * ne doit jamais faire foi face à un vrai encaissement.
 */

export interface CartLine {
  /** Identifie la ligne : un même parfum en deux formats fait deux lignes. */
  productSlug: string;
  variantId: string;

  /** Instantané d'affichage — voir l'avertissement ci-dessus. */
  name: string;
  brandName: string;
  imageUrl: string;
  volumeMl: number;
  unitPrice: number;
  currency: 'DZD';

  quantity: number;
}

export interface CartState {
  lines: CartLine[];
}

/** Clé de stockage versionnée : un changement de forme n'écrase pas l'ancien. */
export const CART_STORAGE_KEY = 'darsafia.cart.v1';

/** Quantité maximale par ligne — garde-fou contre une saisie absurde. */
export const MAX_QUANTITY = 99;

export function lineTotal(line: CartLine): number {
  return line.unitPrice * line.quantity;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Deux lignes sont la même si produit ET format coïncident. */
export function isSameLine(a: CartLine, b: Pick<CartLine, 'productSlug' | 'variantId'>): boolean {
  return a.productSlug === b.productSlug && a.variantId === b.variantId;
}
