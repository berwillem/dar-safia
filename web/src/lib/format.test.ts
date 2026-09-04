import { describe, expect, it } from 'vitest';

import {
  formatFamily,
  formatGender,
  formatLongevity,
  formatPrice,
  formatSillage,
  formatVolume,
} from './format';
import type { Dictionary } from './i18n/dictionary';
import frRaw from './i18n/dictionaries/fr.json';
import enRaw from './i18n/dictionaries/en.json';

const fr = frRaw as Dictionary;
const en = enRaw as Dictionary;

describe('formatPrice', () => {
  it('formate un montant en dinars sans décimale', () => {
    const out = formatPrice({ amount: 23500, currency: 'DZD' }, 'fr');
    expect(out).toMatch(/23\s?500/);
    expect(out).toMatch(/DZD|DA/);
    expect(out).not.toMatch(/,00|\.00/);
  });

  it('localise en arabe (chiffres et symbole différents du français)', () => {
    const frOut = formatPrice({ amount: 1000, currency: 'DZD' }, 'fr');
    const arOut = formatPrice({ amount: 1000, currency: 'DZD' }, 'ar');
    expect(arOut).not.toBe(frOut);
  });
});

describe('formatVolume', () => {
  it('affiche les millilitres selon la langue', () => {
    expect(formatVolume(90, 'fr', fr)).toBe('90 ml');
    expect(formatVolume(90, 'en', en)).toBe('90 ml');
  });

  it('traite 0 comme un coffret, pas « 0 ml »', () => {
    expect(formatVolume(0, 'fr', fr)).toBe('Coffret');
    expect(formatVolume(0, 'en', en)).toBe('Set');
  });
});

describe('formatLongevity', () => {
  it('rend les heures connues', () => {
    expect(formatLongevity(48, fr)).toBe('48 h');
  });

  it('rend null quand la donnée est absente', () => {
    expect(formatLongevity(undefined, fr)).toBeNull();
    expect(formatLongevity(0, fr)).toBeNull();
  });
});

describe('formatSillage', () => {
  it('mappe le niveau au libellé traduit', () => {
    expect(formatSillage(1, fr)).toBe('Intime');
    expect(formatSillage(5, fr)).toBe('Puissant');
    expect(formatSillage(5, en)).toBe('Powerful');
  });

  it('rend null pour un niveau absent plutôt qu’une valeur par défaut', () => {
    expect(formatSillage(undefined, fr)).toBeNull();
    expect(formatSillage(0, fr)).toBeNull();
  });
});

describe('formatGender / formatFamily', () => {
  it('traduit selon la langue', () => {
    expect(formatGender('femme', fr)).toBe('Pour Femme');
    expect(formatGender('femme', en)).toBe('For Her');
    expect(formatFamily('woody', fr)).toBe('Boisé');
    expect(formatFamily('woody', en)).toBe('Woody');
  });

  it('retombe sur la valeur brute si inconnue', () => {
    expect(formatGender('inconnu', fr)).toBe('inconnu');
  });
});
