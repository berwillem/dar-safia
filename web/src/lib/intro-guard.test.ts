import { describe, expect, it } from 'vitest';

import { INTRO_ATTR, INTRO_SESSION_KEY, introGuardScript } from './intro-guard';

/**
 * Le script de garde est une CHAÎNE exécutée par le navigateur pendant
 * l'analyse du HTML : ni TypeScript ni le linter ne la voient. On l'exécute
 * donc ici contre de faux globaux pour vérifier qu'elle est valide et qu'elle
 * choisit le bon mode d'ouverture.
 */
function run(
  pathname: string,
  { seen = false, reduced = false, storageThrows = false } = {}
) {
  const attrs: Record<string, string> = {};
  const win: { __dsIntro?: string } = {};
  const storage = {
    getItem: (k: string) => {
      if (storageThrows) throw new Error('SecurityError');
      return seen && k === INTRO_SESSION_KEY ? '1' : null;
    },
  };
  const globals = {
    location: { pathname },
    matchMedia: () => ({ matches: reduced }),
    sessionStorage: storage,
    document: {
      documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) },
    },
    window: win,
  };
  new Function(...Object.keys(globals), introGuardScript)(...Object.values(globals));
  return { mode: attrs[INTRO_ATTR] ?? null, flag: win.__dsIntro ?? null };
}

describe("script de garde de l'ouverture", () => {
  it.each(['/fr', '/ar', '/en', '/fr/', '/'])(
    'joue le rideau à la première visite (%s)',
    (path) => {
      expect(run(path)).toEqual({ mode: 'curtain', flag: 'curtain' });
    }
  );

  it('ne rejoue pas le rideau à une visite suivante, mais garde la révélation', () => {
    expect(run('/fr', { seen: true })).toEqual({ mode: 'reveal', flag: 'reveal' });
  });

  it.each(['/fr/contact', '/fr/la-maison', '/ar/parfums/x', '/de'])(
    'ne touche à rien hors accueil (%s)',
    (path) => {
      expect(run(path)).toEqual({ mode: null, flag: null });
    }
  );

  it('ne pose rien sous prefers-reduced-motion : la page reste dans son état final', () => {
    expect(run('/fr', { reduced: true }).mode).toBeNull();
  });

  it('ne pose rien et ne lève rien si le stockage est inaccessible', () => {
    expect(() => run('/fr', { storageThrows: true })).not.toThrow();
    expect(run('/fr', { storageThrows: true }).mode).toBeNull();
  });
});
