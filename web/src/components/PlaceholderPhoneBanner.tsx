import { whatsappConfigured, whatsappIsPlaceholder } from '@/lib/whatsapp';

/**
 * Avertit quand la conciergerie n'est pas réellement joignable.
 *
 * Même garde-fou que sur le site Vite : un numéro fictif qui part en
 * production laisserait les clients commander dans le vide, sans que rien
 * ne le signale. Le bandeau doit donc être impossible à manquer.
 *
 * Composant serveur : la valeur est connue au build, aucun JavaScript envoyé.
 */
export function PlaceholderPhoneBanner() {
  if (whatsappConfigured && !whatsappIsPlaceholder) return null;

  const message = whatsappConfigured
    ? 'Numéro WhatsApp fictif : les commandes n’aboutissent nulle part. À remplacer avant déploiement.'
    : 'NEXT_PUBLIC_WHATSAPP_PHONE non défini : les commandes sont désactivées.';

  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-50 bg-[#7A2E1E] px-4 py-2.5 text-center text-2xs text-[#FBEDE6]"
    >
      {message}
    </div>
  );
}
