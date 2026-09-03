# Dar Safia

Maison de haute parfumerie (Algérie) — boutique et expérience digitale.
Parfums niche, importés et curation de luxe.

Le dépôt est en **migration** de l'ancien site vanilla vers Next.js + Strapi.
Les trois parties cohabitent et doivent toutes builder. Voir `CLAUDE.md` pour
les consignes projet complètes.

## Structure

| Chemin | Rôle | Lancer |
|---|---|---|
| racine (`index.html`, `main.js`, `style.css`) | Ancien site, Vite + GSAP. Reste en ligne jusqu'à bascule complète. | `npm run dev` |
| `web/` | Application Next.js 16 (App Router, TS, Tailwind 4). Cible de la migration. | `npm run dev --prefix web` |
| `cms/` | Strapi 5. Init simple, sans type de contenu. Non relié à `web/`. | `cd cms && npm run develop` |

### Sources et fichiers générés

| Source (versionnée) | Génère (gitignoré) | Via |
|---|---|---|
| `catalog-data.js` | `web/src/data/*.json` | `node scripts/migrate-catalog.mjs` |
| `perfumes/`, `branding images/`, `logo/` | `public/img/`, `web/public/img/` | `node scripts/optimize-images.mjs` |

Les scripts `predev` / `prebuild` de `web/` régénèrent tout : un checkout
neuf se construit avec `npm install && npm run build`.

## Mise en route

```bash
# 1. Ancien site
npm install
cp .env.example .env            # renseigner VITE_WHATSAPP_PHONE
npm run dev                     # http://localhost:5173

# 2. Application Next
cd web
npm install
cp .env.example .env.local      # renseigner NEXT_PUBLIC_WHATSAPP_PHONE
npm run dev                     # http://localhost:3000
npm test                        # 45 tests (Vitest)

# 3. CMS (voir cms/README.md — better-sqlite3 nécessite des Build Tools
#    sous Windows ; fonctionne sans intervention sur le VPS Linux)
cd cms
cp .env.example .env            # régénérer les secrets
npm install
npm run develop                 # http://localhost:1337/admin
```

## État de la migration

- **Phase 0-1** — stabilisation, pipeline d'images, design system extrait
  (`design-system/tokens.json`), modèle de domaine (`domain/catalog.d.ts`).
- **Phase 2** — `web/` : accueil, catalogue filtrable, 45 fiches produit
  (SSG + SEO + données structurées), panier + commande WhatsApp, diagnostic
  olfactif, 404. Tests sur toute la logique métier.
- **Phase 3** — Strapi scaffoldé. Types de contenu et intégration : à venir.
- **Phase 4** — i18n FR / AR / EN + RTL : non commencé. `web/src/lib/format.ts`
  prend déjà une locale en paramètre.

### La règle de couture

Dans `web/`, les composants importent **uniquement** `@/lib/catalog`, jamais
`products.json` ni une implémentation concrète. Remplacer le repository
statique par Strapi (phase 3) ne doit toucher que
`web/src/lib/catalog/index.ts`.

## Sécurité

- Aucun secret en dur, aucun `.env` commité (`*.env.example` seulement).
- `admin.html` à la racine est une **maquette sans authentification** avec des
  données fictives — non liée depuis la navigation, `noindex`, hors du build.
  À retirer quand le vrai admin Strapi existe.
- Toute donnée utilisateur est échappée avant insertion HTML
  (`escapeHtml` / `escapedFields`).
