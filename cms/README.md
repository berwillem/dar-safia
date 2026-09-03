# Dar Safia — CMS (Strapi)

Backend de contenu du site Dar Safia, dans le cadre de la migration
(voir `../CLAUDE.md`). **Initialisation simple, sans types de contenu :**
l'intégration avec l'application Next (`../web`) viendra plus tard.

## État

- Strapi 5.52, TypeScript.
- Base de données : **SQLite** par défaut (fichier local, zéro configuration).
  `config/database.ts` sait déjà se connecter à PostgreSQL via
  `DATABASE_CLIENT=postgres` — la bascule sur le VPS sera un changement de
  variables d'environnement plus `npm i pg`, rien de plus.
- Aucun type de contenu défini pour l'instant (`src/api/` est vide).

## Mise en route locale

```bash
cd cms
cp .env.example .env      # puis régénérer les secrets
npm install
npm run develop           # http://localhost:1337/admin
```

### ⚠️ SQLite sous Windows

Le pilote `better-sqlite3` est un module natif. Sans les *Build Tools* Visual
Studio, `npm install` échoue à le compiler sur cette machine — `npm run build`
(panneau d'admin) fonctionne malgré tout, mais pas `develop` / `start`.

Options : installer les *Visual Studio Build Tools* (charge de travail
« Développement Desktop en C++ »), ou développer sous WSL. **Sur le VPS Linux,
`better-sqlite3` se compile sans intervention** (`build-essential` présent) —
et de toute façon la production passera à PostgreSQL.

## Déploiement (VPS)

1. `DATABASE_CLIENT=postgres` + variables `DATABASE_*` dans `.env`.
2. `npm i pg`
3. `npm run build && npm run start`
4. Servir derrière un reverse-proxy (nginx) avec HTTPS.

Détails CLI Strapi : voir `README.strapi.md`.
