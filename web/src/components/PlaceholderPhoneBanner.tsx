import type { Dictionary } from '@/lib/i18n/dictionary';
import { whatsappConfigured, whatsappIsPlaceholder } from '@/lib/whatsapp';

/**
 * Avertit quand la conciergerie n'est pas réellement joignable : un numéro
 * fictif qui part en production laisserait les clients commander dans le vide.
 * Le bandeau doit être impossible à manquer.
 *
 * Composant serveur : la valeur est connue au build, aucun JavaScript envoyé.
 */
export function PlaceholderPhoneBanner({ dict }: { dict: Dictionary }) {
  if (whatsappConfigured && !whatsappIsPlaceholder) return null;

  const message = whatsappConfigured
    ? dict.phoneBanner.placeholder
    : dict.phoneBanner.missing;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-50 bg-[#7A2E1E] px-4 py-2.5 text-center text-2xs text-[#FBEDE6]"
    >
      {message}
    </div>
  );
}
