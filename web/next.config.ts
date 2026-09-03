import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    /**
     * Racine explicite. Le dépôt contient encore le site Vite à la racine avec
     * son propre package-lock.json ; sans cette ligne, Turbopack remonte trop
     * haut et prend la racine du dépôt (voire le dossier utilisateur) comme
     * espace de travail. À supprimer une fois le site Vite retiré.
     */
    root: here,
  },
};

export default nextConfig;
