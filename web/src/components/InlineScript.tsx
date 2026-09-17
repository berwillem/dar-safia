'use client';

/**
 * Script en ligne exécuté UNE fois, pendant l'analyse du HTML serveur.
 *
 * Côté serveur, `text/javascript` : le navigateur l'exécute avant la première
 * peinture. Côté client, React rend le même élément depuis la charge utile —
 * et signale en développement tout `<script>` qu'il rend lui-même, qui de
 * toute façon ne s'exécuterait pas. On le rend alors en `text/plain` : inerte,
 * et sans avertissement. `suppressHydrationWarning` absorbe l'écart de `type`.
 *
 * Motif repris du guide Next « preventing flash before hydration ».
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
