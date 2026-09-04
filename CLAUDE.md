# DAR SAFIA — Instructions projet

Boutique et expérience digitale de haute parfumerie (Algérie) : parfums niche,
importés et curation de luxe. Le site doit donner la sensation d'entrer dans une
**maison de parfum digitale**, pas dans un ecommerce générique.

## Règle n°1 — Planifier avant de construire

Ne jamais lancer une réécriture majeure d'emblée. Pour toute tâche importante :

`ANALYSER → PLANIFIER → IMPLÉMENTER → TESTER → RELIRE → OPTIMISER`

Explorer le code existant, identifier dépendances / actifs réutilisables /
risques, proposer un plan et les fichiers touchés, **puis** implémenter.
Ne jamais réécrire du code qui fonctionne sans raison.

## État actuel

Migration en cours. Trois répertoires cohabitent, tous doivent builder :

| Répertoire | Rôle |
|---|---|
| racine (`index.html`, `main.js`, `style.css`) | Ancien site vanilla Vite + GSAP. Reste fonctionnel jusqu'à bascule complète. |
| `web/` | Application Next.js 16 (App Router, TS, Tailwind 4). Toutes routes sous `/[locale]/` (FR/AR/EN + RTL). Accueil, catalogue filtrable, 45 fiches produit × 3 langues (SSG), panier + commande WhatsApp, diagnostic olfactif. Tests Vitest. |
| `cms/` | Strapi 5. Types de contenu définis (product, brand, collection, fragrance-note). SQLite par défaut, PostgreSQL prêt via env. `web/` consomme l'API si `CATALOG_SOURCE=strapi`. Reste : déployer + peupler (`cms/scripts/seed.mjs`). |
| `catalog-data.js` | Source du catalogue (45 parfums). `scripts/migrate-catalog.mjs` en dérive `web/src/data/` (gitignoré). |
| `admin.html` / `admin.css` | Maquette dashboard de l'ancien site — **aucune auth, données fictives**. À retirer quand le vrai admin Strapi existe. |

**Règle de couture :** dans `web/`, les composants importent uniquement
`@/lib/catalog`, jamais `products.json` ni une implémentation concrète.
Remplacer le repository statique par Strapi ne doit toucher que
`web/src/lib/catalog/index.ts`.

Next 16 postdate l'entraînement : lire `web/node_modules/next/dist/docs/`
avant d'écrire du code Next.

## Architecture cible

Next.js · TypeScript · Tailwind · GSAP · Strapi · PostgreSQL.
Migration **incrémentale**, jamais aveugle. Ne pas coupler les composants UI aux
données statiques temporaires : prévoir des abstractions de données propres pour
Strapi. Prévoir dès maintenant l'i18n (FR / AR / EN, avec RTL pour l'arabe).

## Design

Cinématique, éditorial, minimal, immersif. **Le luxe vient de la retenue.**

- Préférer : typographie forte, photographie plein écran, whitespace généreux,
  transitions élégantes, hiérarchie visuelle maîtrisée.
- Éviter : layouts SaaS génériques, cards trop arrondies, gradients cheap,
  glassmorphism aléatoire, ombres excessives, bruit visuel.
- **Ne pas remplacer l'identité visuelle et les couleurs existantes** sans
  consigne explicite.
- Ne pas ajouter d'élément visuel juste parce qu'il reste de l'espace vide.

### Univers olfactifs

Les fiches produit peuvent porter une atmosphère propre à la famille (boisé =
textures profondes / ombres chaudes ; floral = mouvement délicat ; frais =
fluidité, verre, reflets ; oriental = fumée, or, lumière cinématique).
Piloté par les données produit (famille, notes, saison, occasion, humeur).
Expériences immersives réservées aux **produits mis en avant** ; les autres
gardent une fiche premium optimisée.

## Animation

Trois niveaux : micro-interactions → motion d'expérience → moments « wow »
(rares et choisis). Ne jamais animer pour démontrer une compétence technique :
**si tout bouge, rien n'est spécial.** WebGL/Three.js uniquement si valeur réelle.

## Contraintes non négociables

- **Son** : jamais d'autoplay. Désactivé par défaut, contrôlé par l'utilisateur.
- **Performance** : images optimisées et formats modernes, lazy loading, pas de
  layout shift, mobile prioritaire. Le luxe ne justifie pas un site lent.
- **Mobile** : expérience de premier ordre, pensée pour le tactile — jamais un
  desktop compressé.
- **Accessibilité** : navigation clavier, focus visibles, contrastes, HTML
  sémantique, `prefers-reduced-motion`.
- **SEO** : métadonnées dynamiques, données structurées, URLs propres.
- **Sécurité** : jamais de secret en dur ni de `.env` commité ; ne jamais faire
  confiance à une saisie client ; échapper toute donnée utilisateur avant
  insertion HTML (voir `escapeHtml` dans `main.js`).

## Configuration

Les valeurs d'environnement passent par `.env` (modèle : `.env.example`).
⚠️ Tout ce qui est préfixé `VITE_` est **public** dans le bundle : aucun secret.

## TypeScript (après migration)

Pas de `any`, pas d'assertions inutiles, interfaces explicites, types de domaine
réutilisables, réponses API typées.

## Avant de déclarer une tâche terminée

Vérifier : erreurs, warnings console, TypeScript, responsive, états de
chargement / erreur / vide, mobile, accessibilité. Puis se relire successivement
comme **ingénieur frontend senior**, **designer UX** et **ingénieur performance**,
et corriger les faiblesses importantes.

## Git

Commits logiques et séparés. Vérifier l'état du dépôt avant un gros changement ;
ne pas écraser du travail non lié.
