# Dar Safia — CMS (Strapi)

Backend de contenu du site Dar Safia (voir `../CLAUDE.md`).

## État

- Strapi 5.52, TypeScript.
- Base de données : **SQLite** par défaut (fichier local, zéro configuration).
  `config/database.ts` gère déjà PostgreSQL via `DATABASE_CLIENT=postgres` —
  la bascule sur le VPS sera un changement de variables + `npm i pg`.
- **Types de contenu définis** (`src/api/`, `src/components/catalog/`) :
  - `product` — parfum : nom, slug, marque, description, récit, genre, famille,
    familles secondaires, notes (composant), formats (composant), images,
    concentration, tenue, sillage, saisons, occasions, badges, collections.
  - `brand` — maison de parfum.
  - `fragrance-note` — matière première (rose, vétiver…), reliée aux parfums.
  - `collection` — regroupement éditorial de parfums.
  - Composants : `catalog.money`, `catalog.variant`, `catalog.product-note`,
    `catalog.seo`.
- Ces types reflètent `../domain/catalog.d.ts`. L'application Next sait déjà
  les consommer (`../web/src/lib/catalog/strapi-repository.ts`), activée par
  `CATALOG_SOURCE=strapi`.

## Mise en route locale

```bash
cd cms
cp .env.example .env      # puis régénérer les secrets
npm install
npm run develop           # http://localhost:1337/admin
```

### ⚠️ SQLite sous Windows

`better-sqlite3` est un module natif. Sans les *Visual Studio Build Tools*,
`npm install` échoue à le compiler — `npm run build` (panneau d'admin)
fonctionne quand même, mais pas `develop` / `start`.

Options : *VS Build Tools* (charge « Développement Desktop en C++ »), ou WSL.
**Sur le VPS Linux, `better-sqlite3` se compile sans intervention** — et la
production passera de toute façon à PostgreSQL.

## Peupler le catalogue

Une fois Strapi démarré, créer un token d'API « Full access »
(Paramètres > API Tokens), puis :

```bash
STRAPI_URL=http://localhost:1337 STRAPI_SEED_TOKEN=xxxx \
  node scripts/seed.mjs
```

Le script est idempotent (ignore ce qui existe déjà par slug) et remplit
marques, notes et parfums depuis `../catalog-data.js`. Images, stock, et les
saisons/occasions déduites sont à revoir dans l'admin.

## Déploiement (VPS)

1. `.env` : `DATABASE_CLIENT=postgres` + variables `DATABASE_*`.
2. `npm i pg`
3. `npm run build && npm run start`
4. Reverse-proxy (nginx) + HTTPS.
5. Créer un token « Read-only », le placer dans `STRAPI_API_TOKEN` côté `web/`,
   et passer `CATALOG_SOURCE=strapi`.

Détails CLI Strapi : `README.strapi.md`.
