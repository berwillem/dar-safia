import { LOCALES } from './i18n/config';

/**
 * ══════════════════════════════════════════════════════════════
 *   OUVERTURE DE L'ACCUEIL — GARDE AVANT PEINTURE
 * ══════════════════════════════════════════════════════════════
 *
 * Volontairement SANS `'use client'` : la mise en page serveur importe ces
 * valeurs. Importées depuis un module client, elles deviendraient des
 * références client et non des chaînes.
 *
 * Le HTML serveur arrive dans son état FINAL : en-tête visible, titre posé,
 * rideau fermé. Le navigateur le peint avant que GSAP ne soit chargé — d'où,
 * sans garde, un en-tête qui clignote, un titre qui apparaît puis disparaît
 * avant de s'animer, et un rideau qui masque le film aux visites suivantes.
 *
 * Ce script en ligne s'exécute pendant l'analyse du HTML, avant toute
 * peinture (cf. guide Next « preventing flash before hydration »). Il pose
 * sur <html> le MODE d'ouverture ; le CSS tient chaque élément dans son état
 * de DÉPART tant que ce mode est présent :
 *
 *   data-intro="curtain" — première visite de la session : compteur, rideau,
 *                          puis typographie et en-tête.
 *   data-intro="reveal"  — visites suivantes : pas de rideau, la typographie
 *                          et l'en-tête entrent ensemble.
 *
 * C'est la timeline de `HeroFilm` qui retire l'attribut, au moment exact où
 * l'en-tête entre. Sans JavaScript ou sous mouvement réduit, l'attribut n'est
 * jamais posé : la page reste dans son état final, lisible.
 */

export const INTRO_SESSION_KEY = 'darsafia.intro.seen';

/** Attribut posé sur <html> tant que l'ouverture de l'accueil n'a pas rendu la main. */
export const INTRO_ATTR = 'data-intro';

export type IntroMode = 'curtain' | 'reveal';

const homePattern = `^/(${LOCALES.join('|')})?$`;

/**
 * Aucun littéral d'expression régulière dans le gabarit : un antislash y
 * traverse plusieurs couches d'échappement, et un `/\/+$/` mal échappé sortait
 * en `//+$/` — un COMMENTAIRE, qui rendait tout le script invalide sans bruit.
 * Le test `intro-guard.test.ts` exécute la chaîne réelle.
 *
 * `window.__dsIntro` double l'attribut : en développement, le Strict Mode
 * efface les attributs de <html> au remontage ; la variable, elle, survit.
 *
 * Stockage inaccessible (navigation privée stricte) : on ne pose rien. La
 * page s'ouvre alors sans voile — jamais bloquée dans un état caché.
 */
export const introGuardScript = `(function(){try{var p=location.pathname;while(p.length>1&&p.charAt(p.length-1)==="/")p=p.slice(0,-1);if(!new RegExp(${JSON.stringify(homePattern)}).test(p))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var m=sessionStorage.getItem(${JSON.stringify(INTRO_SESSION_KEY)})==="1"?"reveal":"curtain";document.documentElement.setAttribute(${JSON.stringify(INTRO_ATTR)},m);window.__dsIntro=m}catch(e){}})()`;
