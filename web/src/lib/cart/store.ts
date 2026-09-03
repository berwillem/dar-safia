/**
 * ══════════════════════════════════════════════════════════════
 *   PANIER — MAGASIN EXTERNE
 * ══════════════════════════════════════════════════════════════
 *
 * localStorage est un magasin externe à React. On l'expose donc via le
 * contrat attendu par useSyncExternalStore (subscribe / getSnapshot) plutôt
 * que de le lire dans un effet et d'appeler setState : React 19 signale ce
 * schéma comme provoquant des rendus en cascade.
 *
 * Avantage supplémentaire : getServerSnapshot fournit un panier vide au rendu
 * serveur, ce qui rend l'hydratation cohérente par construction.
 *
 * L'état vit hors de React (module scope) : deux composants abonnés voient la
 * même chose, et l'onglet reste synchronisé via l'événement `storage`.
 */

import {
  CART_STORAGE_KEY,
  MAX_QUANTITY,
  isSameLine,
  type CartLine,
} from './types';

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Instantané courant. Doit être RÉFÉRENTIELLEMENT STABLE entre deux lectures
 * sans changement : useSyncExternalStore compare par identité et bouclerait
 * indéfiniment si on renvoyait un nouveau tableau à chaque appel.
 *
 * Corollaire : la relecture du stockage se fait UNE SEULE fois (latch `loaded`),
 * pas à chaque `subscribe`. En dev, React (StrictMode) monte/démonte deux fois ;
 * relire à chaque abonnement produirait une nouvelle référence à chaque cycle
 * et déstabiliserait tout l'arbre de rendu.
 */
let snapshot: CartLine[] = [];
let loaded = false;

/** Instantané serveur : constant, donc jamais source de divergence. */
const SERVER_SNAPSHOT: CartLine[] = [];

function isValidLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as CartLine;
  return (
    typeof line.productSlug === 'string' &&
    typeof line.variantId === 'string' &&
    typeof line.name === 'string' &&
    typeof line.unitPrice === 'number' &&
    Number.isFinite(line.unitPrice) &&
    line.unitPrice >= 0 &&
    typeof line.quantity === 'number' &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  );
}

/**
 * Lit le panier stocké. Tolère un stockage indisponible (navigation privée)
 * et un contenu corrompu ou trafiqué : localStorage est modifiable par
 * l'utilisateur, on ne fait donc jamais confiance à sa forme.
 */
function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidLine).map((line) => ({
      ...line,
      quantity: Math.min(MAX_QUANTITY, line.quantity),
    }));
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Quota dépassé ou stockage refusé : le panier reste en mémoire.
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

/** Remplace l'instantané et prévient les abonnés. */
function commit(next: CartLine[]): void {
  snapshot = next;
  writeStorage(next);
  emit();
}

// ── Contrat useSyncExternalStore ───────────────────────────────

/**
 * Charge le panier depuis le stockage, une seule fois. Appelé au premier
 * `subscribe` ET au premier `getSnapshot` : selon l'ordre, React peut lire
 * l'instantané avant de s'abonner.
 */
function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;
  snapshot = readStorage();
}

export function subscribe(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);

  // Un autre onglet peut modifier le panier : on se resynchronise.
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      snapshot = readStorage();
      emit();
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getSnapshot(): CartLine[] {
  ensureLoaded();
  return snapshot;
}

export function getServerSnapshot(): CartLine[] {
  return SERVER_SNAPSHOT;
}

// ── Mutations ──────────────────────────────────────────────────

export function addLine(line: Omit<CartLine, 'quantity'>, quantity = 1): void {
  const existing = snapshot.find((l) => isSameLine(l, line));

  commit(
    existing
      ? snapshot.map((l) =>
          isSameLine(l, line)
            ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) }
            : l
        )
      : [...snapshot, { ...line, quantity: Math.min(MAX_QUANTITY, quantity) }]
  );
}

export function setQuantity(
  productSlug: string,
  variantId: string,
  quantity: number
): void {
  const target = { productSlug, variantId };

  commit(
    quantity <= 0
      ? snapshot.filter((l) => !isSameLine(l, target))
      : snapshot.map((l) =>
          isSameLine(l, target)
            ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) }
            : l
        )
  );
}

/**
 * Applique un écart à la quantité, à partir de la valeur COURANTE du magasin.
 *
 * À préférer à setQuantity pour les boutons +/− : deux clics rapides lisent
 * la même valeur rendue par React (l'état n'a pas encore été recalculé entre
 * les deux), si bien que passer une valeur absolue perd un incrément. Ici la
 * source est l'instantané, toujours à jour.
 */
export function changeQuantity(
  productSlug: string,
  variantId: string,
  delta: number
): void {
  const target = { productSlug, variantId };
  const line = snapshot.find((l) => isSameLine(l, target));
  if (!line) return;
  setQuantity(productSlug, variantId, line.quantity + delta);
}

export function removeLine(productSlug: string, variantId: string): void {
  commit(snapshot.filter((l) => !isSameLine(l, { productSlug, variantId })));
}

export function clear(): void {
  commit([]);
}

/**
 * Réinitialise l'état module. RÉSERVÉ AUX TESTS : le latch `loaded` empêche
 * sinon de simuler plusieurs sessions dans un même processus.
 */
export function __resetForTests(): void {
  snapshot = [];
  loaded = false;
  listeners.clear();
}
