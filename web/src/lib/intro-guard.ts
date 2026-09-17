import { LOCALES } from './i18n/config';

/**
 * ══════════════════════════════════════════════════════════════
 *   INTRO — GARDE AVANT PEINTURE
 * ══════════════════════════════════════════════════════════════
 *
 * Volontairement SANS `'use client'` : la mise en page serveur importe ces
 * valeurs. Importées depuis un module client, elles deviendraient des
 * références client et non des chaînes.
 *
 * Le problème : l'en-tête arrive VISIBLE dans le HTML rendu côté serveur, et
 * le navigateur le peint avant que React ne s'hydrate. Aucun effet React — pas
 * même `useLayoutEffect` — ne s'exécute avant cette première peinture : il
 * passe après l'hydratation. D'où la demi-seconde de nav visible, puis voilée,
 * puis de retour.
 *
 * La solution (cf. le guide Next « preventing flash before hydration ») : un
 * script en ligne dans le <head>, exécuté pendant l'analyse du HTML, qui pose
 * `data-intro="playing"` sur <html> AVANT tout rendu. Le CSS voile l'en-tête
 * sur cet attribut ; `SiteHeader` le retire au bon moment.
 */

export const INTRO_SESSION_KEY = 'darsafia.intro.seen';

/** Attribut posé sur <html> tant que l'intro de l'accueil joue. */
export const INTRO_ATTR = 'data-intro';

const homePattern = `^\/(${LOCALES.join('|')})?$`;

/**
 * Aucun littéral d'expression régulière dans le gabarit : un antislash y
 * traverse le heredoc, la chaîne JS puis le template literal, et un `//+$/`
 * mal échappé sortait en `//+$/` — un COMMENTAIRE, qui rendait tout le script
 * invalide sans le moindre bruit. Le test `intro-guard.test.ts` exécute la
 * chaîne réelle pour que ça ne revienne pas.
 *
 * Mêmes conditions que `useIntroPlays` : accueil, mouvement non réduit,
 * session pas encore vue. `window.__dsIntro` double l'attribut parce qu'en
 * développement le Strict Mode efface les attributs de <html> au remontage —
 * la variable globale, elle, survit et permet de les réappliquer.
 */
export const introGuardScript = `(function(){try{var p=location.pathname;while(p.length>1&&p.charAt(p.length-1)==="/")p=p.slice(0,-1);if(!new RegExp(${JSON.stringify(homePattern)}).test(p))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem(${JSON.stringify(INTRO_SESSION_KEY)})==="1")return;document.documentElement.setAttribute(${JSON.stringify(INTRO_ATTR)},"playing");window.__dsIntro=1}catch(e){}})()`;
