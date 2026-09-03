import { defineConfig } from 'vitest/config';

/**
 * Configuration Vitest.
 *
 * Les tests portent sur la logique pure (moteur du quiz, formatage, hydratation
 * du repository) et sur le magasin panier. Pas de composants React ici : les
 * composants serveur asynchrones ne sont pas encore supportés par Vitest, et
 * l'intérêt est de verrouiller la logique métier avant que Strapi ne remplace
 * la source de données (phase 3).
 *
 * jsdom est nécessaire pour lib/cart/store.ts, qui touche window.localStorage.
 * La résolution de l'alias @/ est native depuis Vite (plus besoin de plugin).
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
