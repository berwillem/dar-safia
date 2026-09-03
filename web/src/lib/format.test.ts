import { describe, expect, it } from 'vitest';

import {
  formatFamily,
  formatGender,
  formatLongevity,
  formatPrice,
  formatSillage,
  formatVolume,
} from './format';

describe('formatPrice', () => {
  it('formate un montant en dinars sans décimale', () => {
    const out = formatPrice({ amount: 23500, currency: 'DZD' });
    // Intl insère une espace insécable ; on vérifie les composants clés.
    expect(out).toMatch(/23\s?500/);
    expect(out).toMatch(/DZD|DA/);
    expect(out).not.toMatch(/,00|\.00/);
  });

  it('localise en arabe (chiffres et symbole différents du français)', () => {
    const fr = formatPrice({ amount: 1000, currency: 'DZD' }, 'fr');
    const ar = formatPrice({ amount: 1000, currency: 'DZD' }, 'ar');
    expect(ar).not.toBe(fr);
  });
});

describe('formatVolume', () => {
  it('affiche les millilitres', () => {
    expect(formatVolume(90)).toBe('90 ml');
  });

  it('traite 0 comme un coffret, pas « 0 ml »', () => {
    expect(formatVolume(0)).toBe('Coffret');
    expect(formatVolume(0, 'en')).toBe('Set');
  });
});

describe('formatLongevity', () => {
  it('rend les heures connues', () => {
    expect(formatLongevity(48)).toBe('48 h');
  });

  it('rend null quand la donnée est absente', () => {
    expect(formatLongevity(undefined)).toBeNull();
    expect(formatLongevity(0)).toBeNull();
  });
});

describe('formatSillage', () => {
  it('mappe le niveau au libellé', () => {
    expect(formatSillage(1)).toBe('Intime');
    expect(formatSillage(5)).toBe('Puissant');
  });

  it('rend null pour un niveau absent plutôt qu’une valeur par défaut', () => {
    expect(formatSillage(undefined)).toBeNull();
    expect(formatSillage(0)).toBeNull();
  });
});

describe('formatGender / formatFamily', () => {
  it('traduit selon la locale', () => {
    expect(formatGender('femme', 'fr')).toBe('Pour Femme');
    expect(formatGender('femme', 'en')).toBe('For Her');
    expect(formatFamily('woody', 'fr')).toBe('Boisé');
  });

  it('retombe sur la valeur brute si inconnue', () => {
    expect(formatGender('inconnu', 'fr')).toBe('inconnu');
  });
});
