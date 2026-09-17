import { describe, expect, it } from 'vitest';

import { INTRO_ATTR, INTRO_SESSION_KEY, introGuardScript } from './intro-guard';

/**
 * Le script de garde est une CHAÎNE exécutée par le navigateur pendant
 * l'analyse du HTML : ni TypeScript ni le linter ne la voient. On l'exécute
 * donc ici contre de faux globaux pour vérifier qu'elle est valide et qu'elle
 * ne voile l'en-tête que dans le seul cas voulu.
 */
function run(pathname: string, { seen = false, reduced = false } = {}) {
  const attrs: Record<string, string> = {};
  const win: { __dsIntro?: number } = {};
  const globals = {
    location: { pathname },
    matchMedia: () => ({ matches: reduced }),
    sessionStorage: { getItem: (k: string) => (seen && k === INTRO_SESSION_KEY ? '1' : null) },
    document: {
      documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) },
    },
    window: win,
  };
  new Function(...Object.keys(globals), introGuardScript)(...Object.values(globals));
  return { veiled: attrs[INTRO_ATTR] === 'playing', flag: win.__dsIntro };
}

describe('script de garde de l’intro', () => {
  it.each(['/fr', '/ar', '/en', '/fr/', '/'])('voile l’en-tête sur l’accueil %s', (path) => {
    expect(run(path)).toEqual({ veiled: true, flag: 1 });
  });

  it.each(['/fr/contact', '/fr/la-maison', '/ar/parfums/x', '/de'])(
    'ne touche à rien hors accueil (%s)',
    (path) => {
      expect(run(path)).toEqual({ veiled: false, flag: undefined });
    }
  );

  it('ne voile pas une session qui a déjà vu l’intro', () => {
    expect(run('/fr', { seen: true }).veiled).toBe(false);
  });

  it('ne voile pas sous prefers-reduced-motion', () => {
    expect(run('/fr', { reduced: true }).veiled).toBe(false);
  });

  it('ne lève jamais d’erreur, même sans stockage', () => {
    const throwing = {
      location: { pathname: '/fr' },
      matchMedia: () => ({ matches: false }),
      get sessionStorage(): never {
        throw new Error('SecurityError');
      },
      document: { documentElement: { setAttribute: () => {} } },
      window: {},
    };
    expect(() =>
      new Function('location', 'matchMedia', 'sessionStorage', 'document', 'window', introGuardScript)(
        throwing.location,
        throwing.matchMedia,
        undefined,
        throwing.document,
        throwing.window
      )
    ).not.toThrow();
  });
});
