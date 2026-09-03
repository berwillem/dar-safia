import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Accessibilité : si l'utilisateur demande moins d'animation, on accélère
// la timeline globale plutôt que de la supprimer. Les états finaux et les
// callbacks onComplete (routage, affichage des vues) restent donc intacts.
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(80);
}

// Le catalogue vit dans son propre module (données pures, sans effet de bord)
// afin de rester lisible par les scripts Node.
export { perfumeCatalog } from './catalog-data.js';
import { perfumeCatalog } from './catalog-data.js';

// ══════════════════════════════════════════════
//   CONFIGURATION
// ══════════════════════════════════════════════
// Numéro de la conciergerie WhatsApp — défini via la variable
// d'environnement VITE_WHATSAPP_PHONE (voir .env.example).
// Format international sans "+" ni espaces, ex. 213770123456.
// NB : forme exacte `import.meta.env.VITE_*` — Vite la remplace statiquement
// au build ; l'optional chaining empêcherait cette substitution.
const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '';

// Numéros de remplacement connus. Ils débloquent le développement mais ne
// mènent à aucune conciergerie : on refuse qu'ils partent en production sans
// être vus. Ajouter ici tout nouveau numéro fictif utilisé en local.
const PLACEHOLDER_PHONES = ['213000000000', '213555000000'];
const isPlaceholderPhone = PLACEHOLDER_PHONES.includes(WHATSAPP_PHONE);

if (!WHATSAPP_PHONE) {
  console.error(
    '[Dar Safia] VITE_WHATSAPP_PHONE non défini : les liens de commande WhatsApp sont désactivés. ' +
    'Copiez .env.example vers .env et renseignez le numéro de la conciergerie.'
  );
} else if (isPlaceholderPhone) {
  console.warn(
    `[Dar Safia] Numéro WhatsApp FICTIF en usage (${WHATSAPP_PHONE}). ` +
    'Les parcours de commande fonctionnent mais n\'aboutissent nulle part. ' +
    'Remplacez VITE_WHATSAPP_PHONE avant tout déploiement.'
  );
}

/** Construit une URL wa.me, ou null si le numéro n'est pas configuré. */
function buildWhatsAppUrl(message) {
  if (!WHATSAPP_PHONE) return null;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Échappe une chaîne destinée à être insérée dans du HTML.
 * À utiliser pour TOUTE donnée saisie par l'utilisateur avant un innerHTML.
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

// Largeurs réellement générées par scripts/optimize-images.mjs, par dossier.
// Doit rester synchronisé avec les `widths` des JOBS de ce script : déclarer
// ici une largeur qui n'est pas produite ferait pointer le srcset vers un 404.
const SRCSET_WIDTHS = {
  '/img/perfumes/': [400, 800],
  '/img/branding/': [1200, 1800, 2400]
};

/**
 * Retourne une copie d'un objet dont toutes les valeurs texte sont échappées,
 * prête pour l'insertion en innerHTML.
 *
 * Le catalogue est aujourd'hui codé en dur, donc sûr. Il proviendra de Strapi
 * (phase 3) : à ce moment-là, chaque champ devient une donnée externe et donc
 * non fiable. Passer par cette vue dès maintenant évite d'avoir à repasser sur
 * chaque gabarit au moment de la bascule.
 *
 * Utiliser l'objet BRUT pour tout ce qui n'est pas du HTML (messages WhatsApp,
 * comparaisons) : le texte échappé y ferait apparaître des « &amp; ».
 */
function escapedFields(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = typeof value === 'string' ? escapeHtml(value) : value;
  }
  return out;
}

/**
 * Rend une note sur 5 sous forme d'étoiles reflétant la valeur réelle, au lieu
 * de cinq étoiles pleines systématiques.
 *
 * Technique : deux rangées de ★ superposées, celle du dessus tronquée à un
 * pourcentage. On n'utilise que le glyphe ★ (U+2605), universellement présent
 * dans les polices — contrairement aux demi-étoiles (U+2BE8) qui s'affichent
 * en tofu sur beaucoup d'Android et d'iOS.
 *
 * Le libellé accessible est indispensable : la forme visuelle seule n'est pas
 * restituée par un lecteur d'écran.
 */
function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const percent = (value / 5) * 100;
  const label = `Noté ${value.toFixed(1)} sur 5`;
  return {
    label,
    percent,
    html: `<span class="star-meter" role="img" aria-label="${escapeHtml(label)}" style="--star-fill:${percent.toFixed(1)}%">`
        + `<span class="star-meter-bg" aria-hidden="true">★★★★★</span>`
        + `<span class="star-meter-fg" aria-hidden="true">★★★★★</span>`
        + `</span>`
  };
}

/**
 * Construit un srcset à partir d'une image dérivée par le pipeline.
 * '/img/perfumes/rose.webp' -> '/img/perfumes/rose-400.webp 400w, …-800.webp 800w'
 * Retourne '' pour toute image hors pipeline (aucun srcset émis).
 */
function imgSrcset(src) {
  const match = /^(.*)\.webp$/.exec(src || '');
  if (!match) return '';
  const prefix = Object.keys(SRCSET_WIDTHS).find(dir => src.startsWith(dir));
  if (!prefix) return '';
  return SRCSET_WIDTHS[prefix].map(w => `${match[1]}-${w}.webp ${w}w`).join(', ');
}

export function getWhatsAppOrderLink(perfumeName, price) {
  return buildWhatsAppUrl(
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite commander le parfum suivant :\n• Parfum : ${perfumeName}\n• Prix : ${price}\n\nMerci de me renseigner sur la disponibilité et la livraison express 58 Wilayas.`
  );
}

export function getWhatsAppGeneralLink() {
  return buildWhatsAppUrl(
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite des conseils personnalisés pour choisir un parfum de votre collection ou me renseigner sur une collaboration.`
  );
}

/**
 * Ouvre la conciergerie WhatsApp, ou prévient l'utilisateur si le numéro
 * n'est pas configuré (plutôt que d'ouvrir un onglet vers une URL morte).
 */
function openWhatsApp(message) {
  const url = buildWhatsAppUrl(message);
  if (!url) {
    showToast('La conciergerie WhatsApp est momentanément indisponible.', 'error');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Renseigne le href WhatsApp d'un lien, ou le désactive proprement
 * (aria-disabled + retrait du href) si le numéro n'est pas configuré.
 */
function setWhatsAppHref(anchor, message) {
  if (!anchor) return;
  const url = buildWhatsAppUrl(message);
  if (url) {
    anchor.href = url;
    anchor.removeAttribute('aria-disabled');
  } else {
    anchor.removeAttribute('href');
    anchor.setAttribute('aria-disabled', 'true');
  }
}

// ══════════════════════════════════════════════
//   GLOBAL STATE
// ══════════════════════════════════════════════
const BAG_STORAGE_KEY = 'darsafia.bag.v1';

/** Recharge le panier depuis localStorage (tolère un stockage indisponible). */
function loadBag() {
  try {
    const raw = localStorage.getItem(BAG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistBag() {
  try {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagItems));
  } catch {
    // Stockage plein ou navigation privée : le panier reste en mémoire.
  }
}

let bagItems = loadBag();
let activeFilter = 'all';
let searchQuery = '';
let currentView = 'home'; // 'home' or 'product'
let selectedPerfumeId = 1;
let selectedVolume = '100ml';

// ══════════════════════════════════════════════
//   DOM UTILS
// ══════════════════════════════════════════════
function qs(sel, parent = document) { return parent.querySelector(sel); }
function qsa(sel, parent = document) { return [...parent.querySelectorAll(sel)]; }

// ══════════════════════════════════════════════
//   PRÉFÉRENCES UTILISATEUR (MOTION / POINTER)
// ══════════════════════════════════════════════
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');

/** L'utilisateur a demandé à réduire les animations au niveau système. */
export function prefersReducedMotion() { return reducedMotionQuery.matches; }

/** Appareil tactile / sans survol réel : pas d'effets dépendant du hover. */
function isCoarsePointer() { return coarsePointerQuery.matches; }

export function showToast(message, type = 'success') {
  const stack = qs('#toastStack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');

  // Le gabarit statique passe par innerHTML ; le message, potentiellement
  // saisi par l'utilisateur, est inséré en textContent (pas d'injection HTML).
  const icon = document.createElement('div');
  icon.className = 'toast-icon';
  icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

  const msg = document.createElement('span');
  msg.className = 'toast-msg';
  msg.textContent = message;

  toast.append(icon, msg);
  stack.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// ══════════════════════════════════════════════
//   LUXURY AMBIENT AUDIO ENGINE (432Hz Soundscape)
// ══════════════════════════════════════════════
let audioCtx = null;
let isAudioPlaying = false;
let ambientGain = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientFilter = null;
let lfo = null;

function initAmbientMusic() {
  const musicToggle = qs('#musicToggleBtn');
  const soundWaves = qs('#soundWaveAnim');
  const musicLabel = qs('#musicTrackLabel');

  function startAmbientSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Master Gain
      ambientGain = audioCtx.createGain();
      ambientGain.gain.setValueAtTime(0, audioCtx.currentTime);
      ambientGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 2.5);
      ambientGain.connect(audioCtx.destination);

      // Lowpass Warmth Filter
      ambientFilter = audioCtx.createBiquadFilter();
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.setValueAtTime(450, audioCtx.currentTime);
      ambientFilter.connect(ambientGain);

      // LFO for slow breathing movement
      lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(120, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(ambientFilter.frequency);
      lfo.start();

      // Drone Chord 1 (F# / 185Hz / 432 tuning)
      ambientOsc1 = audioCtx.createOscillator();
      ambientOsc1.type = 'sine';
      ambientOsc1.frequency.setValueAtTime(185.0, audioCtx.currentTime);
      ambientOsc1.connect(ambientFilter);
      ambientOsc1.start();

      // Drone Chord 2 (C# / 277.18Hz - Warm Fifth)
      ambientOsc2 = audioCtx.createOscillator();
      ambientOsc2.type = 'triangle';
      ambientOsc2.frequency.setValueAtTime(277.18, audioCtx.currentTime);
      ambientOsc2.connect(ambientFilter);
      ambientOsc2.start();

      isAudioPlaying = true;
      musicToggle?.classList.add('playing');
      soundWaves?.classList.add('active');
      if (musicLabel) musicLabel.textContent = 'Maison Ambience • En Lecture';
      showToast('Ambiance sonore Dar Safia activée ✨');
    } catch (e) {
      console.warn('Audio autoplay prevented or error:', e);
    }
  }

  function stopAmbientSound() {
    if (ambientGain && audioCtx) {
      ambientGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      setTimeout(() => {
        try {
          ambientOsc1?.stop();
          ambientOsc2?.stop();
          lfo?.stop();
          ambientOsc1?.disconnect();
          ambientOsc2?.disconnect();
          lfo?.disconnect();
        } catch (_) {}
      }, 1300);
    }
    isAudioPlaying = false;
    musicToggle?.classList.remove('playing');
    soundWaves?.classList.remove('active');
    if (musicLabel) musicLabel.textContent = 'Musique d’Ambiance';
  }

  musicToggle?.addEventListener('click', () => {
    if (isAudioPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  });

  // Optional: Click anywhere on first user gesture enables audio readiness
  document.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, { once: true });
}

// ══════════════════════════════════════════════
//   CATEGORY THEMATIC SYSTEM FOR PDP
// ══════════════════════════════════════════════
export function getCategoryTheme(p) {
  const cat = p.category || 'floral';
  const name = p.name.toLowerCase();
  
  if (name.includes('rouge') || name.includes('scandal') || name.includes('bomba') || name.includes('red') || name.includes('divine')) {
    return {
      type: 'ruby',
      familyLabel: 'Collection Rouge & Incandescence',
      badgeIcon: '🔥',
      accentColor: '#E63946',
      accentLt: '#FF6B6B',
      accentGlow: 'rgba(230,57,70,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(139,0,0,0.45) 0%, rgba(36,10,12,0.95) 70%, #120808 100%)',
      moodQuote: "Une sensualité ardente et captivante, sculptée dans le rouge passion et l'or pur.",
      pyramidColors: ['#FF6B6B', '#E63946', '#9B2226'],
      barGradient: 'linear-gradient(90deg, #9B2226, #E63946, #FF6B6B)'
    };
  }
  
  if (cat === 'fresh' || name.includes('aqua') || name.includes('giò') || name.includes('marine') || name.includes('blue') || name.includes('impératrice')) {
    return {
      type: 'fresh',
      familyLabel: 'Collection Azur & Fraîcheur Marine',
      badgeIcon: '🌊',
      accentColor: '#00B4D8',
      accentLt: '#90E0EF',
      accentGlow: 'rgba(0,180,216,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(0,119,182,0.35) 0%, rgba(10,25,35,0.95) 70%, #081015 100%)',
      moodQuote: "L'énergie cristalline des vagues méditerranéennes et la pureté des embruns marins vivifiants.",
      pyramidColors: ['#90E0EF', '#00B4D8', '#0077B6'],
      barGradient: 'linear-gradient(90deg, #0077B6, #00B4D8, #90E0EF)'
    };
  }

  if (name.includes('explorer') || name.includes('terre') || name.includes('booster') || name.includes('audace') || name.includes('society') || name.includes('paradigme')) {
    return {
      type: 'emerald',
      familyLabel: 'Collection Émeraude & Vétiver Noble',
      badgeIcon: '🌿',
      accentColor: '#2A9D8F',
      accentLt: '#52B788',
      accentGlow: 'rgba(42,157,143,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(20,82,40,0.4) 0%, rgba(12,28,18,0.95) 70%, #09130c 100%)',
      moodQuote: "La fraîcheur aromatique et la grandeur des forêts nobles baignées de rosée matinale.",
      pyramidColors: ['#74C69D', '#2A9D8F', '#1B4332'],
      barGradient: 'linear-gradient(90deg, #1B4332, #2A9D8F, #74C69D)'
    };
  }

  if (cat === 'woody' || name.includes('sauvage') || name.includes('oud') || name.includes('gentleman') || name.includes('nuit') || name.includes('myslf')) {
    return {
      type: 'noir',
      familyLabel: 'Collection Nuit Obscure & Bois Majestueux',
      badgeIcon: '🌑',
      accentColor: '#D4AF37',
      accentLt: '#F3E5AB',
      accentGlow: 'rgba(212,175,55,0.25)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(30,20,15,0.75) 0%, rgba(15,10,8,0.98) 70%, #0a0706 100%)',
      moodQuote: "Le magnétisme obscur et l'élégance suprême des bois précieux et du cuir impérial.",
      pyramidColors: ['#E6C280', '#D4AF37', '#6E5320'],
      barGradient: 'linear-gradient(90deg, #6E5320, #D4AF37, #F3E5AB)'
    };
  }

  if (cat === 'gourmand' || cat === 'amber' || name.includes('intense') || name.includes('vanille') || name.includes('guerlain') || name.includes('wanted')) {
    return {
      type: 'amber',
      familyLabel: 'Collection Ambre Royal & Vanille Dorée',
      badgeIcon: '✨',
      accentColor: '#E5A93C',
      accentLt: '#F5CB5C',
      accentGlow: 'rgba(229,169,60,0.3)',
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(85,45,15,0.5) 0%, rgba(28,17,11,0.96) 70%, #120a06 100%)',
      moodQuote: "Un élixir d'ambre chaud et de gourmandise envoûtante qui rayonne avec éclat.",
      pyramidColors: ['#F5CB5C', '#E5A93C', '#945600'],
      barGradient: 'linear-gradient(90deg, #945600, #E5A93C, #F5CB5C)'
    };
  }

  // Default Floral / Romantic
  return {
    type: 'floral',
    familyLabel: 'Collection Haute Parfumerie Florale',
    badgeIcon: '🌸',
    accentColor: '#E892A2',
    accentLt: '#F8BBD0',
    accentGlow: 'rgba(232,146,162,0.3)',
    bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(70,20,30,0.45) 0%, rgba(26,14,18,0.95) 70%, #12090d 100%)',
    moodQuote: "L'éclat intemporel des fleurs les plus rares cueillies à l'aube dans les jardins de Grasse.",
    pyramidColors: ['#F8BBD0', '#E892A2', '#880E4F'],
    barGradient: 'linear-gradient(90deg, #880E4F, #E892A2, #F8BBD0)'
  };
}

// ══════════════════════════════════════════════
//   PRODUCT DETAIL PAGE VIEW SYSTEM (SMOOTH ROUTING)
// ══════════════════════════════════════════════
export function showProductPage(id, updateHash = true) {
  const p = perfumeCatalog.find(item => item.id === parseInt(id, 10)) || perfumeCatalog[0];
  selectedPerfumeId = p.id;
  currentView = 'product';

  if (updateHash) {
    window.location.hash = `product-${p.id}`;
  }

  const mainView = qs('#homeMainView');
  const productView = qs('#productDetailView');

  if (mainView && productView) {
    // Smooth cross-fade transition
    gsap.to(mainView, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.inOut',
      onComplete: () => {
        mainView.style.display = 'none';
        productView.style.display = 'block';
        productView.style.opacity = '0';
        renderProductDetailContent(p);

        window.scrollTo({ top: 0, behavior: 'instant' });

        gsap.to(productView, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        gsap.fromTo('.pdp-hero-banner, .pdp-gallery-card, .pdp-info-card, .pdp-story-section',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
        );
      }
    });
  }
}

export function showHomePage(updateHash = true) {
  currentView = 'home';
  if (updateHash) {
    window.location.hash = '';
  }

  const mainView = qs('#homeMainView');
  const productView = qs('#productDetailView');

  if (mainView && productView) {
    gsap.to(productView, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.inOut',
      onComplete: () => {
        productView.style.display = 'none';
        mainView.style.display = 'block';
        mainView.style.opacity = '0';
        gsap.to(mainView, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        ScrollTrigger.refresh();
      }
    });
  }
}

function renderProductDetailContent(raw) {
  const container = qs('#productDetailContainer');
  if (!container) return;

  // `p` = vue échappée pour le HTML ; `raw` = données brutes (thème, liens WA).
  const p = escapedFields(raw);
  const theme = getCategoryTheme(raw);
  const productView = qs('#productDetailView');
  if (productView) {
    productView.style.setProperty('--theme-accent', theme.accentColor);
    productView.style.setProperty('--theme-lt', theme.accentLt);
    productView.style.setProperty('--theme-glow', theme.accentGlow);
    productView.style.setProperty('--theme-bg', theme.bgGradient);
    productView.style.setProperty('--theme-bar', theme.barGradient);
  }

  // Find 3 recommended related perfumes in same category or gender
  const related = perfumeCatalog
    .filter(item => item.id !== raw.id && (item.gender === raw.gender || item.category === raw.category))
    .slice(0, 3)
    .map(escapedFields);

  container.innerHTML = `
    <!-- Thematic Atmosphere Banner -->
    <div class="pdp-hero-banner" style="background:${theme.bgGradient};">
      <div class="pdp-hero-bg" style="background-image:url('${p.img}')"></div>
      <div class="pdp-hero-overlay"></div>
      <div class="pdp-hero-content">
        <div class="pdp-hero-left">
          <nav class="pdp-breadcrumbs">
            <a href="#hero" class="pdp-crumb-home">Accueil</a>
            <span class="pdp-crumb-sep">◆</span>
            <a href="#collection" class="pdp-crumb-catalog">Catalogue</a>
            <span class="pdp-crumb-sep">◆</span>
            <span class="pdp-crumb-current">${p.name}</span>
          </nav>
          <div class="pdp-theme-universe-tag" style="color:${theme.accentLt}; border-color:${theme.accentGlow}; background:${theme.accentGlow};">
            <span>${theme.badgeIcon}</span>
            <span>${theme.familyLabel}</span>
          </div>
        </div>
        <button class="pdp-back-floating" id="pdpBackBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          <span>Retour au Catalogue</span>
        </button>
      </div>
    </div>

    <!-- Main 2-Column Product Showcase -->
    <div class="pdp-main-grid">

      <!-- Left Column: Luxury Bottle Showcase -->
      <div class="pdp-gallery-card">
        <div class="pdp-main-img-wrap" style="box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 45px ${theme.accentGlow};">
          <img src="${p.img}" srcset="${imgSrcset(p.img)}" sizes="(max-width: 900px) 92vw, 520px"
               alt="${p.name}" class="pdp-main-img" id="pdpMainImg" decoding="async" />
          ${p.badge ? `<div class="pdp-badge-top" style="background:linear-gradient(135deg, ${theme.accentColor}, ${theme.accentLt});">${p.badge}</div>` : ''}
          <div class="pdp-auth-shield" style="border-color:${theme.accentGlow};">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span style="color:${theme.accentLt};">100% Original &amp; Certifié Dar Safia</span>
          </div>
        </div>

        <div class="pdp-thumbs-row">
          <button class="pdp-thumb-btn active" data-img="${p.img}">
            <img src="${p.img}" alt="${p.name} vue 1" />
          </button>
          <button class="pdp-thumb-btn" data-img="/img/branding/branding-05.webp">
            <img src="/img/branding/branding-05.webp" alt="Coffret Luxe" />
          </button>
          <button class="pdp-thumb-btn" data-img="/img/branding/branding-04.webp">
            <img src="/img/branding/branding-04.webp" alt="Vaporisateur" />
          </button>
        </div>

        <!-- Performance Metrics with Thematic Visual Bars -->
        <div class="pdp-metrics-box">
          <div class="pdp-metric-item">
            <div class="pdp-m-icon" style="background:${theme.accentGlow}; color:${theme.accentLt};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div class="pdp-m-data">
              <span class="pdp-m-val" style="color:${theme.accentLt};">${p.longevity}</span>
              <span class="pdp-m-lbl">Tenue sur Peau</span>
              <div class="pdp-m-bar"><div class="pdp-m-bar-fill" style="width:${parseInt(p.longevity) >= 48 ? '95' : parseInt(p.longevity) >= 36 ? '80' : '65'}%; background:${theme.barGradient};"></div></div>
            </div>
          </div>
          <div class="pdp-metric-item">
            <div class="pdp-m-icon" style="background:${theme.accentGlow}; color:${theme.accentLt};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C12 2 4 7 4 12a8 8 0 0016 0c0-5-8-10-8-10z"/></svg>
            </div>
            <div class="pdp-m-data">
              <span class="pdp-m-val" style="color:${theme.accentLt};">${escapeHtml(raw.sillage.split('&')[0])}</span>
              <span class="pdp-m-lbl">Projection &amp; Sillage</span>
              <div class="pdp-m-bar"><div class="pdp-m-bar-fill" style="width:88%; background:${theme.barGradient};"></div></div>
            </div>
          </div>
          <div class="pdp-metric-item">
            <div class="pdp-m-icon" style="background:${theme.accentGlow}; color:${theme.accentLt};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="pdp-m-data">
              <span class="pdp-m-val" style="color:${theme.accentLt};">100%</span>
              <span class="pdp-m-lbl">Authenticité Garantie</span>
              <div class="pdp-m-bar"><div class="pdp-m-bar-fill" style="width:100%; background:${theme.barGradient};"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Details, Selection & WhatsApp Checkout -->
      <div class="pdp-info-card">
        <div class="pdp-header">
          <div class="pdp-meta-line">
            <span class="pdp-brand-tag" style="color:${theme.accentLt};">${p.brand}</span>
            <span class="pdp-gender-tag" style="border-color:${theme.accentGlow}; color:${theme.accentLt};">${p.gender === 'femme' ? 'Pour Femme' : p.gender === 'homme' ? 'Pour Homme' : 'Unisexe'}</span>
            <span class="pdp-conc-tag">${p.concentration}</span>
          </div>
          <h1 class="pdp-title">${p.name}</h1>
          
          <div class="pdp-rating-row">
            <div class="pdp-stars" style="color:${theme.accentLt};">${renderStars(raw.rating).html}</div>
            <span class="pdp-score">${p.rating} / 5</span>
            <span class="pdp-reviews-link">(${p.reviewsCount} avis vérifiés)</span>
          </div>

          <div class="pdp-price-wrap" style="border-color:${theme.accentGlow};">
            <span class="pdp-price-main" style="color:${theme.accentLt};">${p.priceFormatted}</span>
            <span class="pdp-stock-status">
              <span class="pdp-dot-live"></span>
              En Stock • Livraison 58 Wilayas (24h-48h)
            </span>
          </div>
        </div>

        <p class="pdp-desc-text">${p.desc}</p>

        <!-- Mood Atmospheric Accent -->
        <div class="pdp-mood-box" style="border-left: 3px solid ${theme.accentColor}; background:${theme.accentGlow};">
          <span class="pdp-mood-icon">${theme.badgeIcon}</span>
          <p class="pdp-mood-text" style="color:${theme.accentLt};"><em>« ${theme.moodQuote} »</em></p>
        </div>

        <!-- Format Selector -->
        <div class="pdp-section-block">
          <label class="pdp-block-label">Format Disponible :</label>
          <div class="pdp-size-selector">
            <button class="pdp-size-btn active" data-size="${p.volume}">
              <strong>${p.volume}</strong>
              <small>Flacon Standard Original</small>
            </button>
            <button class="pdp-size-btn" data-size="Coffret Prestige">
              <strong>Coffret Prestige</strong>
              <small>Écrin Velours + 2 Échantillons Offerts</small>
            </button>
          </div>
        </div>

        <!-- Visual Olfactory Pyramid -->
        <div class="pdp-pyramid-block">
          <h3 class="pdp-block-label">Architecture &amp; Pyramide Olfactive :</h3>
          <div class="pdp-pyramid-visual">
            <div class="pdp-pyr-level pdp-pyr-top" style="border-color:${theme.accentGlow};">
              <div class="pdp-pyr-icon" style="background:${theme.accentGlow};">🌿</div>
              <div class="pdp-pyr-info">
                <span class="pdp-pyr-name" style="color:${theme.accentLt};">Notes de Tête (Première Impression)</span>
                <span class="pdp-pyr-notes">${p.top}</span>
              </div>
            </div>
            <div class="pdp-pyr-connector" style="background:${theme.accentColor};"></div>
            <div class="pdp-pyr-level pdp-pyr-heart" style="border-color:${theme.accentGlow};">
              <div class="pdp-pyr-icon" style="background:${theme.accentGlow};">🌸</div>
              <div class="pdp-pyr-info">
                <span class="pdp-pyr-name" style="color:${theme.accentLt};">Notes de Cœur (Signature &amp; Personnalité)</span>
                <span class="pdp-pyr-notes">${p.heart}</span>
              </div>
            </div>
            <div class="pdp-pyr-connector" style="background:${theme.accentColor};"></div>
            <div class="pdp-pyr-level pdp-pyr-base" style="border-color:${theme.accentGlow};">
              <div class="pdp-pyr-icon" style="background:${theme.accentGlow};">🪵</div>
              <div class="pdp-pyr-info">
                <span class="pdp-pyr-name" style="color:${theme.accentLt};">Notes de Fond (Sillage &amp; Persistance)</span>
                <span class="pdp-pyr-notes">${p.base}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action CTAs -->
        <div class="pdp-cta-group">
          <a href="${getWhatsAppOrderLink(raw.name, raw.priceFormatted) || '#'}" target="_blank" rel="noopener noreferrer" class="btn-gold pdp-wa-btn" style="box-shadow: 0 8px 25px rgba(37,211,102,0.45);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Commander sur WhatsApp</span>
          </a>
          <button class="btn-ghost pdp-bag-btn" id="pdpAddBagBtn" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceFormatted}" style="border-color:${theme.accentGlow};">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Ajouter au Panier</span>
          </button>
        </div>

        <!-- Trust List with icons -->
        <div class="pdp-trust-list">
          <div class="pdp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span>Livraison Express 58 Wilayas (24h à 48h)</span>
          </div>
          <div class="pdp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Paiement sécurisé à la réception du colis</span>
          </div>
          <div class="pdp-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.accentLt}" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Authenticité 100% Garantie &amp; Flacon d'Origine</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Scent Story Section -->
    <div class="pdp-story-section" style="border-color:${theme.accentGlow};">
      <div class="pdp-story-inner">
        <div class="pdp-story-deco" style="color:${theme.accentLt};">◆</div>
        <span class="eyebrow-tag" style="color:${theme.accentLt};">— L'Histoire du Flacon</span>
        <h2 class="section-h">L'Inspiration de <em style="color:${theme.accentLt}; font-style:italic;">${p.name}</em></h2>
        <p class="pdp-story-content">${p.story}</p>
        <div class="pdp-story-deco" style="color:${theme.accentLt};">◆</div>
      </div>
    </div>

    <!-- Related Perfumes Carousel -->
    <div class="pdp-related-section">
      <div class="section-header">
        <span class="eyebrow-tag" style="color:${theme.accentLt};">— Dans la Même Famille</span>
        <h2 class="section-h">Vous Aimerez <em class="italic-gold">Aussi</em></h2>
      </div>
      <div class="products pdp-related-grid">
        ${related.map(item => `
          <article class="pcard" data-id="${item.id}" data-category="${item.category}">
            <div class="pcard-img-wrap">
              <img src="${item.img}" alt="${item.name}" class="pcard-img" />
              <div class="pcard-shine"></div>
              <div class="pcard-hover-layer">
                <button class="pcard-qv" data-id="${item.id}">
                  <span>Découvrir la Fiche</span>
                </button>
              </div>
              ${item.badge ? `<div class="pcard-badge">${item.badge}</div>` : ''}
              <div class="pcard-gender-tag">${item.gender === 'femme' ? 'Pour Femme' : item.gender === 'homme' ? 'Pour Homme' : 'Unisexe'}</div>
            </div>
            <div class="pcard-body">
              <div class="pcard-meta-top">
                <span class="pcard-brand">${item.brand}</span>
                <span class="pcard-vol">${item.volume}</span>
              </div>
              <h3 class="pcard-name">${item.name}</h3>
              <div class="pcard-footer">
                <span class="pcard-price">${item.priceFormatted}</span>
                <button class="btn-add" data-id="${item.id}" data-name="${item.name}" data-price="${item.priceFormatted}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  // Attach interactive events inside the PDP
  qs('#pdpBackBtn')?.addEventListener('click', () => showHomePage(true));
  qs('.pdp-crumb-home')?.addEventListener('click', () => showHomePage(true));
  qs('.pdp-crumb-catalog')?.addEventListener('click', () => {
    showHomePage(true);
    setTimeout(() => {
      qs('#collection')?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  });

  // PDP Thumbnail image switcher
  qsa('.pdp-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const newImg = btn.dataset.img;
      const mainImg = qs('#pdpMainImg');
      if (mainImg && newImg) {
        gsap.to(mainImg, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            // Le srcset doit suivre la source, sinon le navigateur continue
            // de servir les variantes de l'image précédente.
            mainImg.srcset = imgSrcset(newImg);
            mainImg.src = newImg;
            gsap.to(mainImg, { opacity: 1, duration: 0.3 });
          }
        });
      }
    });
  });

  // Size selector buttons
  qsa('.pdp-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.pdp-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // PDP Add to bag
  qs('#pdpAddBagBtn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    addToBag(btn.dataset.name, btn.dataset.price);
  });

  // Related products card tilt
  attach3DCardTilt();
}

// ══════════════════════════════════════════════
//   RENDER PRODUCTS GRID & 3D ANIMATIONS
// ══════════════════════════════════════════════
function renderProducts() {
  const container = qs('#productsGrid');
  const countEl = qs('#productsCount');
  if (!container) return;

  const filtered = perfumeCatalog.filter(item => {
    const matchesFilter = (activeFilter === 'all') || 
      item.gender === activeFilter ||
      item.category === activeFilter ||
      (item.catLabels && item.catLabels.includes(activeFilter));

    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery) ||
      item.brand.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery) ||
      item.top.toLowerCase().includes(searchQuery) ||
      item.heart.toLowerCase().includes(searchQuery) ||
      item.base.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  if (countEl) {
    countEl.textContent = `${filtered.length} parfums d'exception`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-products-msg">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8862B" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <h3>Aucun parfum trouvé</h3>
        <p>Essayez avec d'autres mots-clés ou réinitialisez les filtres.</p>
        <button class="btn-gold reset-filters-btn" id="resetFiltersBtn"><span>Voir toute la collection</span></button>
      </div>
    `;
    qs('#resetFiltersBtn')?.addEventListener('click', () => {
      activeFilter = 'all';
      searchQuery = '';
      if (qs('#catalogSearchInput')) qs('#catalogSearchInput').value = '';
      qsa('.filter-tab').forEach(t => t.classList.toggle('active', t.dataset.f === 'all'));
      renderProducts();
    });
    return;
  }

  container.innerHTML = filtered.map(raw => {
    // `p` = vue échappée pour le HTML ; `raw` = données brutes pour le reste.
    const p = escapedFields(raw);
    const waLink = getWhatsAppOrderLink(raw.name, raw.priceFormatted) || '#';
    return `
    <article class="pcard" data-id="${p.id}" data-category="${p.category}">
      <div class="pcard-img-wrap">
        <img src="${p.img}" srcset="${imgSrcset(p.img)}" sizes="(max-width: 700px) 88vw, 340px"
             alt="${p.name}" class="pcard-img" loading="lazy" decoding="async" />
        <div class="pcard-shine"></div>
        <div class="pcard-hover-layer">
          <button class="pcard-qv" data-id="${p.id}" aria-label="Voir la fiche complète de ${p.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Fiche Complète</span>
          </button>
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="pcard-wa-btn" title="Commander sur WhatsApp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </a>
        </div>
        ${p.badge ? `<div class="pcard-badge">${p.badge}</div>` : ''}
        <div class="pcard-gender-tag">${p.gender === 'femme' ? 'Pour Femme' : p.gender === 'homme' ? 'Pour Homme' : 'Unisexe'}</div>
      </div>
      <div class="pcard-body">
        <div class="pcard-meta-top">
          <span class="pcard-brand">${p.brand}</span>
          <span class="pcard-vol">${p.volume}</span>
        </div>
        <h3 class="pcard-name">${p.name}</h3>
        <p class="pcard-note-line">${p.top.split(',').slice(0, 2).join(' · ')} · ${p.base.split(',')[0]}</p>
        <div class="pcard-footer">
          <div class="pcard-price-stack">
            <span class="pcard-price">${p.priceFormatted}</span>
            <span class="pcard-auth-tag">100% Authentique</span>
          </div>
          <div class="pcard-btns">
            <button class="btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceFormatted}" title="Ajouter au Panier">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
  }).join('');

  attach3DCardTilt();

  gsap.fromTo('.pcard',
    { y: 35, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.035, ease: 'power2.out' }
  );
}

function attach3DCardTilt() {
  const cards = qsa('.pcard');
  cards.forEach(card => {
    // Clicking anywhere on card opens full Product Page
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add, .pcard-wa-btn')) return;
      const id = card.dataset.id;
      if (id) showProductPage(id, true);
    });

    // Le tilt 3D est un ornement : on le désactive pour les utilisateurs
    // qui demandent moins d'animation, et sur les appareils tactiles.
    if (prefersReducedMotion() || isCoarsePointer()) return;

    let rect = null;
    let frame = 0;

    card.addEventListener('mouseenter', () => {
      // Rect mesuré une seule fois à l'entrée : évite un reflow par mousemove.
      rect = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Écriture des styles groupée dans une frame d'animation.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = ((y - centerY) / centerY) * -8;
        const rotY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        const shine = card.querySelector('.pcard-shine');
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(228, 189, 104, 0.28), transparent 70%)`;
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      const shine = card.querySelector('.pcard-shine');
      if (shine) shine.style.background = 'none';
    });
  });
}

// ══════════════════════════════════════════════
//   PRELOADER & HERO ENTRANCE
// ══════════════════════════════════════════════
function initPreloader() {
  const pl = qs('#preloader');
  const bar = qs('#plBar');
  const pct = qs('#plPercent');
  if (!pl || !bar || !pct) return;

  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 22 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
    }
    bar.style.width = `${progress}%`;
    pct.textContent = `${Math.floor(progress)}%`;

    if (progress === 100) {
      setTimeout(() => {
        gsap.to(pl, {
          opacity: 0,
          y: -20,
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => {
            pl.remove();
            document.body.classList.remove('no-scroll');
            initHeroAnimations();
          }
        });
      }, 250);
    }
  }, 50);
}

function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.hero-line--v-left, .hero-line--v-right', { scaleY: 1, duration: 1.2, stagger: 0.1 }, 0)
    .to('.hero-line--h-top, .hero-line--h-bottom', { scaleX: 1, duration: 1.0, stagger: 0.15 }, 0.2)
    .to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0.4)
    .to('#htLine1', { opacity: 1, y: 0, duration: 0.9 }, 0.6)
    .to('#htLine2', { opacity: 1, y: 0, duration: 0.9 }, 0.8)
    .to('#htLine3', { opacity: 1, y: 0, duration: 0.8 }, 1.0)
    .to('#heroDesc', { opacity: 1, y: 0, duration: 0.8 }, 1.1)
    .to('#heroActions', { opacity: 1, y: 0, duration: 0.8 }, 1.25)
    .to('#heroMetrics', { opacity: 1, y: 0, duration: 0.8 }, 1.35)
    .to('#scrollPrompt', { opacity: 1, duration: 0.8 }, 1.5);

  gsap.fromTo('#heroImg', { scale: 1.12 }, { scale: 1.0, duration: 3.5, ease: 'power2.out' });

  qsa('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    gsap.to({ v: 0 }, {
      v: target,
      duration: 2.5,
      ease: 'power2.out',
      delay: 1.4,
      onUpdate: function () {
        el.textContent = Math.floor(this.targets()[0].v);
      }
    });
  });
}

// ══════════════════════════════════════════════
//   CUSTOM CURSOR
// ══════════════════════════════════════════════
function initCursor() {
  const cur = qs('#cursor');
  const label = qs('#cursorLabel');
  if (!cur || !label) return;

  // Curseur personnalisé réservé aux pointeurs fins (souris / trackpad).
  // On écoute la media query pour rester correct après rotation ou
  // branchement d'une souris, plutôt que de tester innerWidth une seule fois.
  const applyPointerMode = () => {
    cur.style.display = isCoarsePointer() ? 'none' : '';
  };
  applyPointerMode();
  coarsePointerQuery.addEventListener('change', applyPointerMode);

  window.addEventListener('mousemove', e => {
    gsap.to(cur, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'none' });
  });

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('button, a, .pcard, .filter-tab, .tcard, .collab-card, .pdp-thumb-btn');
    if (t) {
      cur.classList.add('hovering');
      label.textContent = t.dataset.label || (t.classList.contains('pcard') ? 'DÉCOUVRIR' : 'EXPLORER');
    }
  });

  document.addEventListener('mouseout', e => {
    const t = e.target.closest('button, a, .pcard, .filter-tab, .tcard, .collab-card, .pdp-thumb-btn');
    if (t) cur.classList.remove('hovering');
  });
}

// ══════════════════════════════════════════════
//   POST-SALE UP-SELLING & VIP CONCIERGE ENGINE
// ══════════════════════════════════════════════
let activeUpsellPerfume = null;
let activeDuoPerfume = null;

export function openUpsellModal(perfume) {
  activeUpsellPerfume = perfume;

  // Select matching complementary Duo perfume
  if (perfume.gender === 'femme') {
    // If female -> suggest romantic or intense night companion
    activeDuoPerfume = perfumeCatalog.find(p => p.id === 2 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.id === 4 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.gender === 'homme') || 
                       perfumeCatalog[0];
  } else if (perfume.gender === 'homme') {
    // If male -> suggest night powerhouse or female gift companion
    activeDuoPerfume = perfumeCatalog.find(p => p.id === 39 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.id === 24 && p.id !== perfume.id) || 
                       perfumeCatalog.find(p => p.gender === 'femme') || 
                       perfumeCatalog[1];
  } else {
    activeDuoPerfume = perfumeCatalog.find(p => p.id !== perfume.id && p.category === 'amber') || perfumeCatalog[2];
  }

  const backdrop = qs('#upsellModalBackdrop');
  if (!backdrop) return;

  // Fill current item recap
  qs('#upsellCurrentImg').src = perfume.img;
  qs('#upsellCurrentName').textContent = `${perfume.name} • ${perfume.brand} (${perfume.volume})`;
  qs('#upsellCurrentPrice').textContent = perfume.priceFormatted;

  // Fill Duo offer
  const duoOrigPrice = activeDuoPerfume.price;
  const duoDiscPrice = Math.round(duoOrigPrice * 0.8); // 20% discount on second bottle

  qs('#upsellDuoImg').src = activeDuoPerfume.img;
  qs('#upsellDuoName').textContent = `${activeDuoPerfume.name} (${activeDuoPerfume.brand}) — 100ml`;
  qs('#upsellDuoOrigPrice').textContent = `${duoOrigPrice.toLocaleString('fr-DZ')} DA`;
  qs('#upsellDuoDiscPrice').textContent = `${duoDiscPrice.toLocaleString('fr-DZ')} DA (-20%)`;

  // Reset checkboxes
  const chkDuo = qs('#chkDuoPack');
  const chkAtomizer = qs('#chkAtomizer');
  const chkSamples = qs('#chkSamples');
  const chkGiftWrap = qs('#chkGiftWrap');

  if (chkDuo) chkDuo.checked = false;
  if (chkAtomizer) chkAtomizer.checked = false;
  if (chkSamples) chkSamples.checked = false;
  if (chkGiftWrap) chkGiftWrap.checked = true;

  updateUpsellUI();
  backdrop.classList.add('open');
}

function updateUpsellUI() {
  if (!activeUpsellPerfume) return;

  const chkDuo = qs('#chkDuoPack')?.checked || false;
  const chkAtomizer = qs('#chkAtomizer')?.checked || false;
  const chkSamples = qs('#chkSamples')?.checked || false;
  const chkGiftWrap = qs('#chkGiftWrap')?.checked || false;

  // Highlight selected cards
  qsa('.upsell-card').forEach(card => {
    const chk = card.querySelector('.upsell-chk');
    if (chk && chk.checked) card.classList.add('selected');
    else card.classList.remove('selected');
  });

  // Calculate live total & savings
  let total = activeUpsellPerfume.price;
  let savings = 0;

  if (chkDuo && activeDuoPerfume) {
    const duoOrigPrice = activeDuoPerfume.price;
    const duoDiscPrice = Math.round(duoOrigPrice * 0.8);
    total += duoDiscPrice;
    savings += (duoOrigPrice - duoDiscPrice);
  }

  if (chkAtomizer) total += 3500;
  if (chkSamples) total += 1800;

  // Update total DOM
  const totalValEl = qs('#upsellTotalVal');
  if (totalValEl) totalValEl.textContent = `${total.toLocaleString('fr-DZ')} DA`;

  const savingTag = qs('#upsellSavingTag');
  if (savingTag) {
    if (savings > 0) {
      savingTag.style.display = 'inline-block';
      savingTag.textContent = `✨ Vous Économisez ${savings.toLocaleString('fr-DZ')} DA sur cette commande`;
    } else {
      savingTag.style.display = 'none';
    }
  }

  // Construct personalized WhatsApp VIP message
  const itemsList = [`• ${activeUpsellPerfume.name} (${activeUpsellPerfume.brand}) : ${activeUpsellPerfume.priceFormatted}`];

  if (chkDuo && activeDuoPerfume) {
    const duoDiscPrice = Math.round(activeDuoPerfume.price * 0.8);
    itemsList.push(`• [OFFRE DUO -20%] ${activeDuoPerfume.name} (${activeDuoPerfume.brand}) : ${duoDiscPrice.toLocaleString('fr-DZ')} DA (au lieu de ${activeDuoPerfume.priceFormatted})`);
  }
  if (chkAtomizer) {
    itemsList.push(`• [ACCESSOIRE] Vaporisateur Nomade Rechargeable Or Brossé 10ml : 3 500 DA`);
  }
  if (chkSamples) {
    itemsList.push(`• [DÉCOUVERTE] Coffret 3 Échantillons Rares Niche (3 x 3ml) : 1 800 DA`);
  }
  if (chkGiftWrap) {
    itemsList.push(`• [CADEAU INCLUS] Écrin Cadeau Dar Safia & Ruban de Soie Doré : 0 DA (Offert)`);
  }

  const waSummary = itemsList.join('\n');
  setWhatsAppHref(
    qs('#upsellConfirmWaBtn'),
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite valider ma commande VIP avec les sélections suivantes :\n\n${waSummary}\n\n• MONTANT TOTAL : ${total.toLocaleString('fr-DZ')} DA\n• LIVRAISON : Express 58 Wilayas (Paiement à la livraison)\n\nMerci de me confirmer la préparation et l'expédition de mon colis !`
  );
}

function initUpsellModal() {
  const backdrop = qs('#upsellModalBackdrop');
  const close = qs('#closeUpsellModal');
  const skipBtn = qs('#upsellSkipBtn');

  // Checkbox change handlers
  ['#chkDuoPack', '#chkAtomizer', '#chkSamples', '#chkGiftWrap'].forEach(sel => {
    qs(sel)?.addEventListener('change', () => updateUpsellUI());
  });

  // Skip button: opens single perfume on WhatsApp
  skipBtn?.addEventListener('click', () => {
    if (activeUpsellPerfume) {
      backdrop?.classList.remove('open');
      openWhatsApp(
        `Bonjour Maison Dar Safia ✨\n\nJe souhaite commander le parfum suivant :\n• Parfum : ${activeUpsellPerfume.name} (${activeUpsellPerfume.brand})\n• Prix : ${activeUpsellPerfume.priceFormatted}\n• Volume : ${activeUpsellPerfume.volume}\n\nMerci de m'indiquer la disponibilité et les modalités de livraison express 58 Wilayas.`
      );
    }
  });

  // Close handlers
  close?.addEventListener('click', () => backdrop?.classList.remove('open'));
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
}

// ══════════════════════════════════════════════
//   LUXURY SHOPPING BAG & SLIDE-IN DRAWER
// ══════════════════════════════════════════════
function addToBag(perfumeOrName, priceFormatted) {
  let item = null;
  if (typeof perfumeOrName === 'object') {
    item = perfumeOrName;
  } else {
    // Find in catalog or fallback
    const found = perfumeCatalog.find(p => p.name === perfumeOrName);
    if (found) item = found;
    else {
      item = {
        id: 'addon-' + Date.now(),
        name: perfumeOrName,
        priceFormatted: priceFormatted,
        price: parseInt(String(priceFormatted).replace(/\D/g, '')) || 3500,
        img: '/img/logo/LOGO WEBP4.webp',
        brand: 'Dar Safia'
      };
    }
  }

  // Check if item already in bag, increment qty
  const existing = bagItems.find(i => i.name === item.name);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    bagItems.push({
      id: item.id,
      name: item.name,
      brand: item.brand || 'Dar Safia',
      price: item.price || parseInt(String(item.priceFormatted).replace(/\D/g, '')) || 0,
      priceFormatted: item.priceFormatted || `${item.price} DA`,
      img: item.img || '/img/logo/LOGO WEBP4.webp',
      qty: 1
    });
  }

  persistBag();
  updateBagBadge();
  renderBagDrawer();
  showToast(`« ${item.name} » ajouté à votre panier`);
}

function updateBagBadge() {
  const totalCount = bagItems.reduce((acc, i) => acc + (i.qty || 1), 0);
  const badge = qs('#bagBadge');
  if (badge) {
    badge.textContent = totalCount;
    if (totalCount > 0) {
      gsap.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
  }
  const drawerCount = qs('#bagDrawerCount');
  if (drawerCount) {
    drawerCount.textContent = `${totalCount} ${totalCount > 1 ? 'articles' : 'article'}`;
  }
}

function renderBagDrawer() {
  const container = qs('#bagItemsList');
  const subtotalEl = qs('#bagSubtotalVal');
  const delivText = qs('#bagDelivText');
  const delivFill = qs('#bagDelivFill');
  const checkoutBtn = qs('#bagCheckoutWaBtn');
  if (!container) return;

  if (bagItems.length === 0) {
    container.innerHTML = `
      <div class="bag-empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(200,155,60,0.4)" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p style="margin-top:12px;">Votre panier est actuellement vide.</p>
        <button class="btn-ghost" id="bagExploreBtn" style="margin-top:16px; font-size:.75rem; padding:8px 16px;">
          <span>Explorer les Parfums</span>
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0 DA';
    if (delivFill) delivFill.style.width = '0%';
    if (delivText) delivText.innerHTML = 'Ajoutez 2 parfums pour bénéficier de la <strong>Livraison Gratuite 58 Wilayas</strong> !';

    qs('#bagExploreBtn')?.addEventListener('click', () => {
      qs('#bagDrawerBackdrop')?.classList.remove('open');
      if (currentView === 'product') showHomePage(true);
      qs('#collection')?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  // Render items
  // Le panier est restauré depuis localStorage : on échappe systématiquement.
  container.innerHTML = bagItems.map((item, idx) => `
    <div class="bag-item-card" data-idx="${idx}">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" class="bag-item-img" />
      <div class="bag-item-info">
        <strong class="bag-item-name">${escapeHtml(item.name)}</strong>
        <span class="bag-item-price">${(item.price * item.qty).toLocaleString('fr-DZ')} DA ${item.qty > 1 ? `<small style="opacity:.7">(${item.qty}x ${escapeHtml(item.priceFormatted)})</small>` : ''}</span>
      </div>
      <button class="bag-item-remove" data-idx="${idx}" title="Supprimer du panier">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('');

  // Remove buttons
  qsa('.bag-item-remove', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const removed = bagItems.splice(idx, 1);
      if (removed.length) showToast(`« ${removed[0].name} » retiré du panier`);
      persistBag();
      updateBagBadge();
      renderBagDrawer();
    });
  });

  // Calculate totals
  const subtotal = bagItems.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0);
  const totalCount = bagItems.reduce((acc, i) => acc + (i.qty || 1), 0);

  if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString('fr-DZ')} DA`;

  // Delivery calculation (Free if >= 2 perfumes or >= 35,000 DA)
  const isFreeDelivery = totalCount >= 2 || subtotal >= 35000;
  if (delivFill) {
    const progress = isFreeDelivery ? 100 : Math.min(90, Math.round((subtotal / 35000) * 100));
    delivFill.style.width = `${progress}%`;
  }
  if (delivText) {
    if (isFreeDelivery) {
      delivText.innerHTML = '🎉 <strong>Félicitations !</strong> Vous bénéficiez de la <strong>Livraison Gratuite 58 Wilayas</strong> !';
    } else {
      delivText.innerHTML = `Ajoutez 1 création de plus pour débloquer la <strong>Livraison Gratuite 58 Wilayas</strong> !`;
    }
  }

  // Construct WhatsApp checkout message
  const summary = bagItems.map(i => `• ${i.name} (${i.brand}) x${i.qty || 1} : ${(i.price * (i.qty || 1)).toLocaleString('fr-DZ')} DA`).join('\n');
  setWhatsAppHref(
    checkoutBtn,
    `Bonjour Maison Dar Safia ✨\n\nJe souhaite finaliser ma commande depuis mon Panier de Prestige :\n\n${summary}\n\n• SOUS-TOTAL : ${subtotal.toLocaleString('fr-DZ')} DA\n• LIVRAISON : ${isFreeDelivery ? 'OFFERTE (58 Wilayas)' : 'Calculée par la conciergerie'}\n• OPTION : Écrin Luxe & Ruban Doré Inclus\n\nMerci de me confirmer la validation et l'adresse de livraison !`
  );
}

function initBagModal() {
  const bagDrawerBackdrop = qs('#bagDrawerBackdrop');
  const closeBagBtn = qs('#closeBagDrawer');

  // Open Bag Drawer
  function openBagDrawer() {
    renderBagDrawer();
    bagDrawerBackdrop?.classList.add('open');
  }

  function closeBagDrawer() {
    bagDrawerBackdrop?.classList.remove('open');
  }

  qs('#bagBtn')?.addEventListener('click', openBagDrawer);
  closeBagBtn?.addEventListener('click', closeBagDrawer);
  bagDrawerBackdrop?.addEventListener('click', (e) => {
    if (e.target === bagDrawerBackdrop) closeBagDrawer();
  });

  // Global Add to Bag buttons delegation
  document.addEventListener('click', e => {
    const addBtn = e.target.closest('.btn-add');
    if (addBtn) {
      e.stopPropagation();
      const id = addBtn.dataset.id;
      const perfume = perfumeCatalog.find(p => String(p.id) === String(id));
      if (perfume) addToBag(perfume);
      else addToBag(addBtn.dataset.name, addBtn.dataset.price);
    }
  });

  // Drawer quick-add addon buttons
  qsa('.bag-add-addon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      addToBag(name, `${price.toLocaleString('fr-DZ')} DA`);
    });
  });

  // Intercept WhatsApp direct buy buttons to trigger Up-Sell VIP Concierge
  document.addEventListener('click', e => {
    // 1. PDP "Commander sur WhatsApp"
    const pdpWaBtn = e.target.closest('.pdp-wa-btn');
    if (pdpWaBtn) {
      e.preventDefault();
      const perfume = perfumeCatalog.find(p => p.id === selectedPerfumeId) || perfumeCatalog[0];
      openUpsellModal(perfume);
      return;
    }

    // 2. Catalog card "WhatsApp" button
    const pcardWaBtn = e.target.closest('.pcard-wa-btn');
    if (pcardWaBtn) {
      e.preventDefault();
      const pcard = pcardWaBtn.closest('.pcard');
      const id = pcard?.dataset.id;
      const perfume = perfumeCatalog.find(p => String(p.id) === String(id)) || perfumeCatalog[0];
      openUpsellModal(perfume);
      return;
    }
  });

  initUpsellModal();
}

// ══════════════════════════════════════════════
//   FILTER & SEARCH
// ══════════════════════════════════════════════
function initFilterAndSearch() {
  qsa('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.f;
      renderProducts();
    });
  });

  const searchInput = qs('#catalogSearchInput');
  if (searchInput) {
    // Debounce : évite de re-rendre les 45 fiches à chaque frappe.
    let searchTimer = null;
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.trim().toLowerCase();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = value;
        renderProducts();
      }, 160);
    });
  }
}

// ══════════════════════════════════════════════
//   COLLABORATION FORM
// ══════════════════════════════════════════════
function initCollaborationForm() {
  const form = qs('#collabForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = qs('#collabType')?.value || 'Collaboration';
    const name = qs('#collabName')?.value || '';
    const contact = qs('#collabContact')?.value || '';
    const notes = qs('#collabNotes')?.value || '';

    showToast('Votre demande a été préparée. Redirection vers WhatsApp Conciergerie...');
    setTimeout(() => {
      openWhatsApp(
        `Bonjour Maison Dar Safia ✨\n\nDemande de Collaboration / Partenariat :\n• Type : ${type}\n• Nom / Marque : ${name}\n• Contact : ${contact}\n• Message : ${notes}`
      );
      form.reset();
    }, 1000);
  });
}

// ══════════════════════════════════════════════
//   REVIEW MODAL
// ══════════════════════════════════════════════
function initReviewModal() {
  const reviewBackdrop = qs('#reviewModalBackdrop');
  const openReviewBtn = qs('#openReviewModalBtn');
  const closeReviewBtn = qs('#closeReviewModal');
  const reviewForm = qs('#reviewForm');

  openReviewBtn?.addEventListener('click', () => reviewBackdrop?.classList.add('open'));
  closeReviewBtn?.addEventListener('click', () => reviewBackdrop?.classList.remove('open'));

  /** Note actuellement sélectionnée dans le formulaire (5 par défaut). */
  const getSelectedRating = () =>
    Number(qs('input[name="reviewRating"]:checked')?.value) || 5;

  // Le libellé « n / 5 Étoiles » doit suivre la sélection.
  const ratingText = qs('#reviewRatingText');
  qsa('input[name="reviewRating"]').forEach(input => {
    input.addEventListener('change', () => {
      const value = getSelectedRating();
      if (ratingText) {
        ratingText.textContent = `${value} / 5 ${value > 1 ? 'Étoiles' : 'Étoile'}`;
      }
    });
  });

  reviewBackdrop?.addEventListener('click', (e) => {
    if (e.target === reviewBackdrop) reviewBackdrop.classList.remove('open');
  });

  reviewForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const reviewerName = qs('#reviewAuthorName')?.value || 'Client Vérifié';
    const perfumeLoved = qs('#reviewPerfumeChoice')?.value || 'Parfum Dar Safia';
    const reviewContent = qs('#reviewText')?.value || '';
    const reviewRating = getSelectedRating();

    showToast(`Merci ${reviewerName} ! Votre avis a été publié avec succès.`);
    reviewBackdrop?.classList.remove('open');
    reviewForm.reset();
    if (ratingText) ratingText.textContent = '5 / 5 Étoiles';

    const grid = qs('#testimonialsGrid');
    if (grid) {
      // Toutes les valeurs proviennent du formulaire : elles sont échappées
      // avant insertion pour éviter toute injection HTML/script.
      const newCard = document.createElement('div');
      newCard.className = 'tcard tcard--featured in-view';
      newCard.innerHTML = `
        <div class="tcard-stars">${renderStars(reviewRating).html}</div>
        <blockquote class="tcard-quote">"${escapeHtml(reviewContent)}"</blockquote>
        <div class="tcard-author">
          <div class="tcard-avatar">${escapeHtml(reviewerName.charAt(0).toUpperCase())}</div>
          <div>
            <strong class="tcard-name">${escapeHtml(reviewerName)}</strong>
            <span class="tcard-title">Client Vérifié · ${escapeHtml(perfumeLoved)}</span>
          </div>
        </div>
      `;
      grid.prepend(newCard);
    }
  });
}

// ══════════════════════════════════════════════
//   BESPOKE SCENT FINDER QUIZ PROMAX (DIAGNOSTIC ENGINE)
// ══════════════════════════════════════════════
function initQuiz() {
  const backdrop = qs('#quizBackdrop');
  const close = qs('#quizClose');
  const progFill = qs('#quizProgFill');
  const stepBadge = qs('#quizStepBadge');
  const subheader = qs('#quizSubheader');
  const prevBtn = qs('#quizPrevBtn');
  const navRow = qs('#quizNavRow');
  const restartBtn = qs('#qrRestartBtn');

  let currentStep = 1;
  const userAnswers = {
    gender: null,
    moment: null,
    family: null,
    intensity: null
  };

  const stepSubheaders = {
    1: 'Définissez votre profil pour qui le parfum est destiné.',
    2: 'Sélectionnez le moment d’émotion et l’ambiance recherchée.',
    3: 'Indiquez les matières nobles et accords olfactifs que vous adorez.',
    4: 'Choisissez le niveau d’impact, de sillage et de persistance souhaité.'
  };

  function openQuiz() {
    backdrop?.classList.add('open');
    currentStep = 1;
    showStep(1);
  }

  function showStep(n) {
    currentStep = n;
    qsa('.quiz-step').forEach(s => s.classList.remove('active'));

    if (n === 'result') {
      qs('#qzResult')?.classList.add('active');
      if (progFill) progFill.style.width = '100%';
      if (stepBadge) stepBadge.textContent = 'Diagnostic Complété';
      if (subheader) subheader.textContent = 'Voici la création d’exception sculptée pour votre personnalité.';
      if (navRow) navRow.style.display = 'none';

      // Animate result entrance
      gsap.fromTo('.qr-box', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' });
    } else {
      qs(`#qzStep${n}`)?.classList.add('active');
      const progressPercent = ((n) / 4) * 100;
      if (progFill) progFill.style.width = `${progressPercent}%`;
      if (stepBadge) stepBadge.textContent = `Étape ${n} sur 4`;
      if (subheader && stepSubheaders[n]) subheader.textContent = stepSubheaders[n];
      if (navRow) navRow.style.display = n > 1 ? 'flex' : 'none';

      // Animate step options entrance
      gsap.fromTo(`#qzStep${n} .quiz-opt`, 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }

  // Previous button navigation
  prevBtn?.addEventListener('click', () => {
    if (typeof currentStep === 'number' && currentStep > 1) {
      showStep(currentStep - 1);
    }
  });

  // Restart button
  restartBtn?.addEventListener('click', () => {
    userAnswers.gender = null;
    userAnswers.moment = null;
    userAnswers.family = null;
    userAnswers.intensity = null;
    showStep(1);
  });

  // Attach buttons to open quiz
  qs('#quizNavBtn')?.addEventListener('click', openQuiz);
  qs('#heroQuizBtn')?.addEventListener('click', openQuiz);

  // Étape 1 : Genre / Destinataire
  qs('#qzStep1')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.gender = opt.dataset.a;
    showStep(2);
  });

  // Étape 2 : Moment / Atmosphère
  qs('#qzStep2')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.moment = opt.dataset.a;
    showStep(3);
  });

  // Étape 3 : Famille Olfactive
  qs('#qzStep3')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.family = opt.dataset.a;
    showStep(4);
  });

  // Étape 4 : Intensité & Sillage -> Calcul du Diagnostic
  qs('#qzStep4')?.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (!opt) return;
    userAnswers.intensity = opt.dataset.a;

    calculateDiagnosticResult();
  });

  function calculateDiagnosticResult() {
    // Score all 45 perfumes in the catalog
    const scoredList = perfumeCatalog.map(p => {
      let score = 50; // Base score
      const descLower = (p.desc + ' ' + p.top + ' ' + p.heart + ' ' + p.base + ' ' + p.story).toLowerCase();

      // 1. Gender criteria
      if (userAnswers.gender === 'femme') {
        if (p.gender === 'femme') score += 35;
        else if (p.gender === 'unisexe') score += 20;
        else score -= 15;
      } else if (userAnswers.gender === 'homme') {
        if (p.gender === 'homme') score += 35;
        else if (p.gender === 'unisexe') score += 20;
        else score -= 15;
      } else if (userAnswers.gender === 'unisexe') {
        if (p.gender === 'unisexe') score += 40;
        else score += 25;
      } else if (userAnswers.gender === 'cadeau') {
        score += (p.reviewsCount > 200 ? 30 : 18);
        if (p.badge?.includes('Best') || p.badge?.includes('Coup') || p.badge?.includes('Légende') || p.badge?.includes('Chef-d')) {
          score += 20;
        }
      }

      // 2. Olfactory Family criteria
      if (userAnswers.family) {
        if (p.category === userAnswers.family) {
          score += 40;
        }
        if (p.catLabels?.includes(userAnswers.family)) {
          score += 25;
        }
        // "spicy" est proposé dans le quiz mais n'existe pas comme `category`
        // au catalogue : on compense par un bonus mots-clés équivalent au
        // score qu'apporterait une correspondance de famille (+40/+25).
        if (userAnswers.family === 'spicy' && (descLower.includes('épic') || descLower.includes('poivre') || descLower.includes('cardamome') || descLower.includes('cuir') || descLower.includes('cannelle') || descLower.includes('muscade') || descLower.includes('safran') || descLower.includes('encens'))) {
          score += 55;
        }
        if (userAnswers.family === 'amber' && (descLower.includes('ambre') || descLower.includes('vanille') || descLower.includes('benjoin') || descLower.includes('tonka'))) {
          score += 25;
        }
        if (userAnswers.family === 'woody' && (descLower.includes('bois') || descLower.includes('cèdre') || descLower.includes('vétiver') || descLower.includes('santal') || descLower.includes('oud'))) {
          score += 25;
        }
        if (userAnswers.family === 'fresh' && (descLower.includes('marin') || descLower.includes('agrumes') || descLower.includes('bergamote') || descLower.includes('eau'))) {
          score += 25;
        }
        if (userAnswers.family === 'gourmand' && (descLower.includes('caramel') || descLower.includes('chocolat') || descLower.includes('cacao') || descLower.includes('sucre') || descLower.includes('gourmand'))) {
          score += 25;
        }
        if (userAnswers.family === 'floral' && (descLower.includes('rose') || descLower.includes('jasmin') || descLower.includes('fleur') || descLower.includes('iris'))) {
          score += 25;
        }
      }

      // 3. Moment / Atmosphere criteria
      if (userAnswers.moment === 'night') {
        if (p.badge?.includes('Intense') || p.badge?.includes('Nocturne') || p.name.includes('Nuit') || p.name.includes('Elixir') || p.category === 'amber' || p.category === 'woody') {
          score += 30;
        }
      } else if (userAnswers.moment === 'day') {
        if (p.category === 'floral' || p.category === 'fresh' || p.concentration.includes('Toilette') || p.badge?.includes('Élégance') || p.badge?.includes('Chic')) {
          score += 30;
        }
      } else if (userAnswers.moment === 'prestige') {
        if (p.price >= 22000 || p.badge?.includes('Prestige') || p.badge?.includes('Chef-d’Œuvre') || p.badge?.includes('Haute') || p.badge?.includes('Légende')) {
          score += 35;
        }
      } else if (userAnswers.moment === 'fresh') {
        if (p.category === 'fresh' || descLower.includes('fraîcheur') || descLower.includes('océan') || descLower.includes('mer')) {
          score += 35;
        }
      }

      // 4. Intensity criteria
      if (userAnswers.intensity === 'intense') {
        if (p.longevity === '48h+' || p.longevity === '72h' || p.concentration.includes('Elixir') || p.concentration.includes('Intense') || p.concentration.includes('Parfum Concentré')) {
          score += 30;
        }
      } else if (userAnswers.intensity === 'balanced') {
        if (p.concentration.includes('Eau de Parfum') || p.longevity === '36h' || p.longevity === '48h') {
          score += 25;
        }
      } else if (userAnswers.intensity === 'subtle') {
        if (p.concentration.includes('Toilette') || p.longevity === '24h' || p.longevity === '30h') {
          score += 25;
        }
      }

      return { perfume: p, score };
    });

    // Sort descending by score
    scoredList.sort((a, b) => b.score - a.score);

    const winner = scoredList[0].perfume;
    const alternatives = scoredList.slice(1, 3).map(item => item.perfume);

    // Calculate match percentage (between 95% and 99% for prime feeling)
    const matchScore = Math.min(99, Math.max(94, Math.round(92 + (scoredList[0].score / 250) * 7)));

    // Render result details
    qs('#qrMatchScore').textContent = `${matchScore}%`;
    qs('#qrTitle').textContent = winner.name;
    qs('#qrBrand').textContent = `Maison ${winner.brand} • ${winner.volume}`;
    qs('#qrImg').src = winner.img;
    qs('#qrImg').alt = winner.name;
    qs('#qrPrice').textContent = winner.priceFormatted;
    qs('#qrBadge').textContent = winner.badge || 'Signature d’Exception';
    qs('#qrDesc').textContent = winner.desc;

    qs('#qrTopNote').textContent = winner.top;
    qs('#qrHeartNote').textContent = winner.heart;
    qs('#qrBaseNote').textContent = winner.base;

    // WhatsApp button with customized message
    setWhatsAppHref(
      qs('#qrWhatsAppBtn'),
      `Bonjour Maison Dar Safia ✨\n\nJ'ai complété votre Diagnostic Olfactif sur-mesure (Score : ${matchScore}% de compatibilité).\n\nMa création idéale est :\n• Parfum : ${winner.name} (${winner.brand})\n• Prix : ${winner.priceFormatted}\n• Volume : ${winner.volume}\n\nMerci de me confirmer la disponibilité pour une commande et livraison express 58 Wilayas.`
    );

    // Link to Product Detail Page
    const qrLink = qs('#qrExplore');
    if (qrLink) {
      qrLink.onclick = () => {
        backdrop.classList.remove('open');
        showProductPage(winner.id, true);
      };
    }

    // Render alternatives
    const altGrid = qs('#qrAltGrid');
    if (altGrid) {
      altGrid.innerHTML = alternatives.map((alt, idx) => `
        <div class="qr-alt-card" data-id="${alt.id}">
          <img src="${alt.img}" alt="${alt.name}" class="qr-alt-img" />
          <div class="qr-alt-info">
            <strong class="qr-alt-name">${alt.name}</strong>
            <span class="qr-alt-price">${alt.priceFormatted}</span>
          </div>
        </div>
      `).join('');

      qsa('.qr-alt-card', altGrid).forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.id;
          backdrop.classList.remove('open');
          showProductPage(id, true);
        });
      });
    }

    showStep('result');
  }

  close?.addEventListener('click', () => backdrop?.classList.remove('open'));
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
}

// ══════════════════════════════════════════════
//   SURFACES SUPERPOSÉES (MODALES, TIROIRS, MENU)
// ══════════════════════════════════════════════
/**
 * Toutes les surfaces refermables par Échap ou par un clic extérieur.
 * Chaque entrée est [sélecteur, classe d'ouverture].
 */
const OVERLAY_SELECTORS = [
  ['#quizBackdrop', 'open'],
  ['#reviewModalBackdrop', 'open'],
  ['#upsellModalBackdrop', 'open'],
  ['#bagDrawerBackdrop', 'open'],
  ['#mobileDrawer', 'open'],
  ['#hamburgerBtn', 'active']
];

function closeAllOverlays() {
  OVERLAY_SELECTORS.forEach(([selector, openClass]) => {
    qs(selector)?.classList.remove(openClass);
  });
}

// ══════════════════════════════════════════════
//   GARDE-FOU : NUMÉRO WHATSAPP FICTIF
// ══════════════════════════════════════════════
/**
 * Affiche un bandeau bien visible tant qu'un numéro de remplacement est
 * configuré. Objectif : rendre impossible un déploiement où les clients
 * cliquent « Commander » sans que personne ne reçoive le message.
 */
function showPlaceholderPhoneBanner() {
  if (!isPlaceholderPhone) return;

  const banner = document.createElement('div');
  banner.className = 'placeholder-phone-banner';
  banner.setAttribute('role', 'alert');

  const text = document.createElement('span');
  text.textContent =
    `Numéro WhatsApp fictif (${WHATSAPP_PHONE}) — les commandes n'aboutissent nulle part. ` +
    'À remplacer dans .env avant déploiement.';

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'placeholder-phone-dismiss';
  dismiss.textContent = 'Masquer';
  dismiss.addEventListener('click', () => banner.remove());

  banner.append(text, dismiss);
  document.body.appendChild(banner);
}

// ══════════════════════════════════════════════
//   ROUTING & HASH NAVIGATION
// ══════════════════════════════════════════════
function initRouting() {
  function handleHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#product-')) {
      const id = hash.replace('#product-', '');
      showProductPage(id, false);
    } else if (!hash || hash === '#' || hash === '#hero' || hash === '#collection') {
      if (currentView === 'product') {
        showHomePage(false);
      }
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

// ══════════════════════════════════════════════
//   SCROLL EFFECTS & PARALLAX
// ══════════════════════════════════════════════
function initScrollEffects() {
  const header = qs('#siteHeader');
  const progress = qs('#navProgress');
  const navLinks = qsa('.nav-a');
  const sections = ['hero', 'heritage', 'collection', 'artistry', 'packaging', 'acclaim', 'collaborations', 'atelier'];

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');

    const doc = document.documentElement;
    const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
    if (progress) progress.style.width = `${scrolled * 100}%`;

    // Highlight active nav link based on visible section
    const headerH = header?.offsetHeight || 110;
    let currentSection = '';
    sections.forEach(id => {
      const el = qs(`#${id}`);
      if (el && el.getBoundingClientRect().top <= headerH + 80) {
        currentSection = id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });

  gsap.to('#heroImg', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  qsa('.reveal-on-scroll, .heritage-layout, .artistry-inner, .packaging-layout, .atelier-card').forEach(el => io.observe(el));
}

// ══════════════════════════════════════════════
//   MOBILE DRAWER NAVIGATION
// ══════════════════════════════════════════════
function initMobileMenu() {
  const hamburger = qs('#hamburgerBtn');
  const drawer = qs('#mobileDrawer');
  if (!hamburger || !drawer) return;

  function toggleMenu() {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    drawer.classList.add('open');
    hamburger.classList.add('active');
  }

  function closeMenu() {
    drawer.classList.remove('open');
    hamburger.classList.remove('active');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any link inside the mobile drawer
  qsa('.mobile-nav-a, .mobile-wa-btn', drawer).forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // La touche Échap est gérée globalement (voir closeAllOverlays) afin que
  // toutes les surfaces se ferment de façon cohérente, pas seulement ce menu.
}

// ══════════════════════════════════════════════
//   INITIALIZE
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initAmbientMusic();
  initFilterAndSearch();
  renderProducts();
  initBagModal();
  // Le panier est restauré depuis localStorage avant l'init : on synchronise
  // le compteur d'entête, sinon il resterait à 0 après un rechargement.
  updateBagBadge();
  initCollaborationForm();
  initReviewModal();
  initQuiz();
  initScrollEffects();
  initMobileMenu();
  initRouting();

  const mainWaBtn = qs('#floatingWaBtn');
  const generalWaLink = getWhatsAppGeneralLink();
  if (mainWaBtn && generalWaLink) mainWaBtn.href = generalWaLink;
  else mainWaBtn?.setAttribute('aria-disabled', 'true');

  showPlaceholderPhoneBanner();

  // Smooth scroll for nav anchor links with proper offset
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.length <= 1) return;
    if (href.startsWith('#product-')) return; // Handled by PDP routing

    if (currentView === 'product') {
      showHomePage(false);
      // Wait for DOM to update then scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = qs(href);
          if (target) {
            const headerH = qs('#siteHeader')?.offsetHeight || 110;
            const y = target.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        });
      });
      e.preventDefault();
      return;
    }

    const target = qs(href);
    if (target) {
      e.preventDefault();
      const headerH = qs('#siteHeader')?.offsetHeight || 110;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  // Échap ferme toute surface superposée. Un seul point d'entrée : ajouter
  // une nouvelle modale se fait en complétant OVERLAY_SELECTORS.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllOverlays();
  });
});
