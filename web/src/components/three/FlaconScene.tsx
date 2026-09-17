'use client';

import { useEffect, useRef } from 'react';
// `three` n'est chargé qu'à l'exécution (import dynamique) : le binding runtime
// s'appelle THREE, celui-ci ne sert qu'aux annotations de type.
import type * as Three from 'three';

import { usePrefersReducedMotion } from '@/components/motion/usePrefersReducedMotion';

/**
 * ══════════════════════════════════════════════════════════════
 *   LE FLACON — SCÈNE 3D
 * ══════════════════════════════════════════════════════════════
 *
 * Une nature morte de parfumerie, pas « un objet 3D qui tourne ».
 *
 * Le flacon est du VERRE, pas du métal : `transmission` + `ior` + `thickness`
 * donnent la réfraction, et le jus à l'intérieur est un second volume avec sa
 * propre atténuation ambrée — c'est lui qui fait lire « parfum » plutôt que
 * « vase ». La silhouette vient d'un profil tourné (`LatheGeometry`) dessiné à
 * la main : épaule pleine, col étroit, lèvre marquée.
 *
 * Ce qui vend le verre, en photo comme ici, ce ne sont pas les lampes mais
 * l'ENVIRONNEMENT : un studio miniature est monté puis convolé (PMREM), avec
 * deux bandes verticales très lumineuses. Ce sont elles qui tracent les filets
 * de lumière sur les arêtes — le réflexe « photo de produit ».
 *
 * Le sol ne porte pas d'ombre calculée : une ombre de contact peinte (dégradé
 * radial) et une caustique chaude au centre. Un shadow map poserait une tache
 * noire opaque sous du verre — faux, et bon marché.
 *
 * Le flacon est PRÉSENTÉ, pas posé : socle de pierre polie cerclé d'or, trois
 * compagnons en retrait, une niche en ogive et des colonnes pour étager la
 * profondeur. Tout ce second plan est opaque et peint — rien n'alourdit la
 * passe de réfraction.
 *
 * Au défilement, la CAMÉRA passe entre trois cadrages et le flacon entre trois
 * POSES choisies (ScrollTrigger `scrub`, donc calé sur Lenis) : jamais de
 * rotation libre, qui finirait par montrer le dos du flacon. Le canvas est
 * tenu par un parent collant, sinon la course se terminerait hors écran.
 *
 * Le pointeur ne fait pas que déplacer la caméra : il promène une lampe sur le
 * verre, fait glisser les filets de contre-jour réfractés et incline
 * légèrement l'objet. Sur tactile, une dérive lente le remplace.
 *
 * La scène se LÈVE : exposition, floraison, recul de caméra et pose montent
 * ensemble au premier passage à l'écran.
 *
 * Budget : `three` et le post-traitement sont importés dynamiquement, le rendu
 * passe par `gsap.ticker` (une seule boucle rAF pour la page) et se coupe hors
 * écran / onglet en fond. Deux paliers de qualité ; sous `prefers-reduced-
 * motion`, une seule image fixe et aucune boucle.
 */

/** Profil du flacon (x = rayon, y = hauteur), révolutionné par LatheGeometry. */
const BOTTLE_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.6, 0.0],
  [0.73, 0.02],
  [0.8, 0.08],
  [0.845, 0.19],
  [0.9, 0.44],
  [0.96, 0.78],
  [1.0, 1.08],
  [1.02, 1.38],
  [1.02, 1.64],
  [0.99, 1.9],
  [0.93, 2.12],
  [0.84, 2.32],
  [0.72, 2.5],
  [0.58, 2.65],
  [0.46, 2.76],
  [0.38, 2.85],
  [0.34, 2.94],
  [0.33, 3.04],
  [0.33, 3.16],
  [0.365, 3.2],
  [0.365, 3.27],
  [0.3, 3.29],
  [0.0, 3.29],
];

/** Le jus : même galbe, rentré dans l'épaisseur, arrêté net sur un ménisque. */
const LIQUID_PROFILE: [number, number][] = [
  [0.0, 0.03],
  [0.55, 0.03],
  [0.68, 0.06],
  [0.75, 0.12],
  [0.79, 0.22],
  [0.85, 0.46],
  [0.9, 0.79],
  [0.94, 1.09],
  [0.96, 1.39],
  [0.96, 1.64],
  [0.935, 1.88],
  [0.895, 2.04],
  // Le volume monte PLUS HAUT que le niveau réel : c'est le plan de coupe qui
  // pose la surface. Ainsi, quand elle penche, il y a du jus à découvrir.
  [0.83, 2.22],
  [0.74, 2.38],
  [0.62, 2.52],
  [0.0, 2.56],
];

/** Hauteur de la surface du jus au repos, en repère flacon. */
const LIQUID_LEVEL = 2.12;

/** Rayon du jus à une hauteur donnée (interpolation du profil). */
function liquidRadiusAt(y: number): number {
  for (let i = 0; i < LIQUID_PROFILE.length - 1; i++) {
    const [x0, y0] = LIQUID_PROFILE[i];
    const [x1, y1] = LIQUID_PROFILE[i + 1];
    if (y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0 || 1);
  }
  return 0;
}

/**
 * Cadrages successifs, parcourus au défilement. Le flacon mesure ~4 unités
 * bouchon compris : à f=34° il faut reculer d'environ 9 pour le tenir en entier
 * avec de l'air au-dessus. Trop près, on décapite le bouchon.
 */
const SHOTS = [
  { pos: [0.7, 2.1, 11.5], look: [0, 1.72, 0], fov: 32 },
  { pos: [-2.4, 2.9, 12.1], look: [0, 1.62, 0], fov: 30 },
  { pos: [-0.8, 3.9, 13.8], look: [0, 1.4, 0], fov: 29 },
];

/**
 * Angle du flacon à chaque cadrage. Le défilement ne « fait plus tourner »
 * l'objet en continu : il le mène d'une pose CHOISIE à la suivante — étiquette
 * de face, puis trois quarts, puis profil. Une rotation libre finit toujours
 * par montrer le dos du flacon, ce qu'aucun photographe ne ferait.
 */
const YAW = [0, -0.62, -1.34];

/** Hauteur du socle. Le flacon reste posé à y = 0 ; le sol descend d'autant. */
const PLINTH_H = 0.38;

export function FlaconScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      const [THREE, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('three'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (disposed || !mountRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      // WebGL absent (vieux appareil, GPU bloqué) : la lueur CSS reste seule.
      const probe = document.createElement('canvas');
      if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return;

      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const wide = window.matchMedia('(min-width: 768px)').matches;
      /** Palier riche : post-traitement, plus de segments, plus de poussière. */
      const rich = !coarse && wide;

      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;

      const trash: { dispose: () => void }[] = [];
      const keep = <T extends { dispose: () => void }>(o: T) => {
        trash.push(o);
        return o;
      };

      // ── Rendu ───────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        antialias: !rich, // en mode riche, le composer multi-échantillonne
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, rich ? 1.4 : 1.25));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // Exposition redescendue : le flacon était surexposé, les dorures
      // brûlaient et le verre perdait sa profondeur. Le luxe est dans l'ombre.
      renderer.toneMappingExposure = 1.08;
      // Le jus est coupé par un plan (sa surface) : découpe locale requise.
      renderer.localClippingEnabled = true;
      // La réfraction se calcule dans une passe séparée : la moitié de la
      // résolution suffit sur des surfaces aussi lisses, et divise son coût.
      renderer.transmissionResolutionScale = rich ? 0.35 : 0.25;
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      mount.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(SHOTS[0].fov, width / height, 0.1, 60);
      camera.position.set(...(SHOTS[0].pos as [number, number, number]));

      // ── Textures peintes au vol (aucun fichier à télécharger) ──
      const paintTexture = (
        w: number,
        h: number,
        paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
      ) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        if (ctx) paint(ctx, w, h);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return keep(t);
      };

      const radial = (stops: [number, string][], size = 256) =>
        paintTexture(size, size, (ctx, w) => {
          const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          stops.forEach(([o, c]) => g.addColorStop(o, c));
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, w);
        });

      // ── Studio d'environnement ──────────────────────────────
      const pmrem = keep(new THREE.PMREMGenerator(renderer));
      const envScene = new THREE.Scene();
      const envParts: Three.Mesh[] = [];

      envParts.push(
        new THREE.Mesh(
          new THREE.SphereGeometry(24, 32, 20),
          new THREE.ShaderMaterial({
            side: THREE.BackSide,
            uniforms: {
              // Un pourtour SOMBRE : c'est ainsi qu'on photographie le verre.
              // Un environnement clair se reflète partout et le cristal vire
              // au vase de porcelaine.
              hi: { value: new THREE.Color(0.1, 0.072, 0.042) },
              lo: { value: new THREE.Color(0.012, 0.009, 0.008) },
            },
            vertexShader:
              'varying vec3 vp; void main(){ vp = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
            fragmentShader:
              'varying vec3 vp; uniform vec3 hi; uniform vec3 lo; void main(){ float h = clamp(normalize(vp).y*0.5+0.5,0.0,1.0); gl_FragColor = vec4(mix(lo,hi,pow(h,2.0)),1.0); }',
          })
        )
      );

      const panel = (w: number, h: number, c: Three.Color, p: [number, number, number]) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: c })
        );
        m.position.set(...p);
        m.lookAt(0, 1.5, 0);
        envParts.push(m);
      };

      // Valeurs > 1 : le PMREM travaille en HDR, ces panneaux sont de vraies
      // sources — d'où des spéculaires nettes, et de quoi nourrir le bloom.
      panel(0.85, 16, new THREE.Color(7, 5.9, 4.2), [-5.5, 3, 5]); // filet gauche
      panel(0.5, 13, new THREE.Color(4.4, 3.7, 2.7), [6, 2, 3.5]); // filet droit
      panel(9, 7, new THREE.Color(0.5, 0.38, 0.24), [5, 8, 6]); // clé, tenue basse
      panel(10, 7, new THREE.Color(0.1, 0.13, 0.26), [-7, 1.5, -6]); // contre-jour froid
      panel(12, 6, new THREE.Color(0.2, 0.13, 0.07), [0, -5, 3]); // rebond chaud

      envParts.forEach((m) => envScene.add(m));
      const envRT = keep(pmrem.fromScene(envScene, 0.02));
      scene.environment = envRT.texture;
      envParts.forEach((m) => {
        keep(m.geometry);
        keep(m.material as Three.Material);
      });

      // ── Fond de scène ───────────────────────────────────────
      // Indispensable, et pas seulement décoratif : `transmission` échantillonne
      // le rendu DERRIÈRE le verre. Sans fond, il échantillonne un alpha nul —
      // le canvas devient transparent à cet endroit et c'est la lueur CSS de la
      // page qui remonte À TRAVERS le flacon, qui vire alors au crème uniforme.
      // Ce panneau donne au verre un vrai noir à transmettre.
      const backdrop = new THREE.Mesh(
        keep(new THREE.PlaneGeometry(70, 44)),
        keep(
          new THREE.MeshBasicMaterial({
            // Un fond ALLUMÉ, pas seulement opaque : le halo chaud est calé
            // derrière le flacon pour que le jus ait quelque chose à
            // transmettre. Un fond uniformément sombre donne un verre
            // techniquement juste et visuellement éteint.
            map: radial(
              [
                [0, 'rgb(62,43,28)'],
                [0.28, 'rgb(46,31,21)'],
                [0.6, 'rgb(22,15,12)'],
                [1, 'rgb(11,8,7)'],
              ],
              512
            ),
            depthWrite: false,
          })
        )
      );
      backdrop.position.set(0, 2.6, -16);
      scene.add(backdrop);

      // ── Architecture de fond : une niche, puis des colonnes ──
      // Le fond nu se lisait comme un studio vide. Une alcôve en ogive donne
      // un point de fuite et un aplomb au flacon ; les colonnes qui la
      // flanquent creusent la profondeur sans rien raconter de bruyant.
      const archTex = paintTexture(256, 512, (ctx, w, h) => {
        ctx.filter = 'blur(14px)'; // bords fondus : aucune arête franche
        const g = ctx.createLinearGradient(0, h, 0, 0);
        g.addColorStop(0, 'rgba(96,68,42,0)');
        g.addColorStop(0.35, 'rgba(122,88,52,0.5)');
        g.addColorStop(0.78, 'rgba(154,114,68,0.72)');
        g.addColorStop(1, 'rgba(120,88,54,0.2)');
        ctx.fillStyle = g;
        const m = w * 0.2;
        const r = w / 2 - m;
        ctx.beginPath();
        ctx.moveTo(m, h);
        ctx.lineTo(m, h * 0.42);
        ctx.arc(w / 2, h * 0.42, r, Math.PI, 0);
        ctx.lineTo(w - m, h);
        ctx.closePath();
        ctx.fill();
      });
      const arch = new THREE.Mesh(
        keep(new THREE.PlaneGeometry(11, 17)),
        keep(
          new THREE.MeshBasicMaterial({
            map: archTex,
            transparent: true,
            depthWrite: false,
            opacity: 0.32,
          })
        )
      );
      arch.position.set(-0.4, 5.4, -13.6);
      scene.add(arch);

      // Colonnes : de simples bandes verticales très sourdes, décalées en
      // profondeur. Elles n'existent que pour que l'œil ait des plans à
      // étager derrière le verre.
      const columnTex = paintTexture(32, 256, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, h, 0, 0);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.3, 'rgba(118,88,56,0.55)');
        g.addColorStop(1, 'rgba(74,56,38,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      (
        [
          [-5.6, 4.2, -10.5, 1.5, 12, 0.3],
          [5.2, 4.2, -10.5, 1.3, 12, 0.26],
          [-8.4, 4, -8.2, 1.1, 11, 0.16],
          [8.1, 4, -8.2, 1.1, 11, 0.14],
        ] as [number, number, number, number, number, number][]
      ).forEach(([x, y, z, w, h, o]) => {
        const col = new THREE.Mesh(
          keep(new THREE.PlaneGeometry(w, h)),
          keep(
            new THREE.MeshBasicMaterial({
              map: columnTex,
              transparent: true,
              depthWrite: false,
              opacity: o,
            })
          )
        );
        col.position.set(x, y, z);
        scene.add(col);
      });

      // ── Le flacon ───────────────────────────────────────────
      const bottle = new THREE.Group();
      scene.add(bottle);

      const lathe = (pts: [number, number][], segments: number) =>
        keep(
          new THREE.LatheGeometry(
            pts.map(([x, y]) => new THREE.Vector2(x, y)),
            segments
          )
        );

      const glass = new THREE.Mesh(
        lathe(BOTTLE_PROFILE, rich ? 64 : 40),
        keep(
          new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0.025,
            transmission: 1,
            // Paroi MINCE, et c'est un choix physique, pas esthétique : une
            // épaisseur généreuse faisait absorber tout le volume par le verre
            // lui-même, et le flacon retombait en bloc opaque. Un vrai flacon a
            // des parois fines ; la couleur vient du jus, pas de la paroi.
            thickness: 0.85,
            ior: 1.52,
            // Le verre n'est pas incolore : il se teinte dans l'épaisseur.
            // Atténuation allongée : plus courte, le verre s'assombrissait au
            // point d'avaler le jus et le flacon retombait à une masse opaque.
            // C'est le LIQUIDE qui doit porter la couleur, pas la paroi.
            attenuationColor: new THREE.Color(0xd4c7a6),
            attenuationDistance: 4.2,
            // Pas de vernis par-dessus : le clearcoat ajoute une couche
            // miroir qui renvoie tout l'environnement et referme le verre en
            // blanc laiteux. Le cristal tire son éclat de la réfraction.
            clearcoat: 0.2,
            clearcoatRoughness: 0.08,
            envMapIntensity: 1.0,
          })
        )
      );
      bottle.add(glass);

      // ── Le jus ──
      // Ce qui fait lire un LIQUIDE et non un verre teinté : sa surface obéit
      // à la gravité, pas au flacon. Le volume est coupé par un plan exprimé
      // en repère MONDE (`clippingPlanes`) ; quand le flacon s'incline vers le
      // curseur, le jus reste de niveau — et quand le flacon tourne ou
      // s'arrête, la surface ballotte puis se calme (ressort amorti, plus bas).
      //
      // Le jus est OPAQUE, et c'est la clé. Un matériau à `transmission`
      // réfracte une image qui ne contient QUE les objets opaques de la scène.
      // Quand le jus était lui-même transmissif, le verre ne le voyait pas :
      // il réfractait le fond et se peignait par-dessus le jus. C'est pour ça
      // qu'aucun réglage de couleur ne le faisait apparaître. Opaque, il entre
      // dans l'image que le verre réfracte — et le verre le courbe, comme un
      // vrai flacon courbe ce qu'il contient.
      const liquidPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), LIQUID_LEVEL);
      const liquid = new THREE.Mesh(
        lathe(LIQUID_PROFILE, rich ? 52 : 32),
        keep(
          new THREE.MeshPhysicalMaterial({
            color: 0xa9561a,
            metalness: 0,
            roughness: 0.2,
            // Le vernis donne la brillance mouillée d'un liquide épais.
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            envMapIntensity: 1.1,
            // La braise interne : c'est elle qui fait « rougeoyer » l'ambre au
            // lieu d'en faire une masse brune.
            emissive: new THREE.Color(0x6b2c05),
            emissiveIntensity: 0.7,
            // Double face : la coupe ouverte laisse voir la paroi intérieure,
            // qui doit être du jus et non un trou.
            side: THREE.DoubleSide,
            clippingPlanes: [liquidPlane],
          })
        )
      );
      bottle.add(liquid);

      // La surface elle-même : un disque ambré, en repère monde, orienté sur la
      // normale du plan de coupe. Elle referme la coupe et accroche un reflet
      // — c'est elle qu'on voit bouger.
      const surfaceRadius = liquidRadiusAt(LIQUID_LEVEL) * 0.965;
      const surface = new THREE.Mesh(
        keep(new THREE.CircleGeometry(surfaceRadius, rich ? 56 : 36)),
        keep(
          // Opaque pour la même raison que le jus : le verre doit la réfracter.
          new THREE.MeshPhysicalMaterial({
            color: 0xc9772c,
            emissive: new THREE.Color(0x7a3a08),
            emissiveIntensity: 0.75,
            roughness: 0.08,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.03,
            envMapIntensity: 1.4,
            side: THREE.DoubleSide,
          })
        )
      );
      scene.add(surface);

      // Fines bulles qui montent dans le jus et s'éteignent à la surface (même
      // plan de coupe). Presque rien — c'est ce presque rien qui le rend vivant.
      const bubbleCount = rich ? 26 : 12;
      const bubblePos = new Float32Array(bubbleCount * 3);
      const bubbleSpeed = new Float32Array(bubbleCount);
      const spawnBubble = (i: number, y: number) => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.58;
        bubblePos[i * 3] = Math.cos(a) * r;
        bubblePos[i * 3 + 1] = y;
        bubblePos[i * 3 + 2] = Math.sin(a) * r;
        bubbleSpeed[i] = 0.1 + Math.random() * 0.22;
      };
      for (let i = 0; i < bubbleCount; i++) spawnBubble(i, 0.15 + Math.random() * 1.9);
      const bubbleGeo = keep(new THREE.BufferGeometry());
      bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
      const bubbles = new THREE.Points(
        bubbleGeo,
        keep(
          new THREE.PointsMaterial({
            map: radial(
              [
                [0, 'rgba(255,244,220,1)'],
                [0.35, 'rgba(255,214,150,0.5)'],
                [1, 'rgba(0,0,0,0)'],
              ],
              64
            ),
            size: 0.034,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            // Dans le verre : le test de profondeur les masquerait derrière la
            // paroi, qui écrit déjà sa profondeur.
            depthTest: false,
            blending: THREE.AdditiveBlending,
            clippingPlanes: [liquidPlane],
          })
        )
      );
      bubbles.renderOrder = 1;
      bottle.add(bubbles);

      // ── Or : bague de col et bouchon taillé ─────────────────
      const goldMat = keep(
        new THREE.MeshPhysicalMaterial({
          color: 0xc9a24c,
          metalness: 1,
          roughness: 0.17,
          envMapIntensity: 1.6,
          clearcoat: 0.5,
          clearcoatRoughness: 0.25,
        })
      );

      // Or brossé, plus sourd : la bague sertie et le bouchon ne sont pas la
      // même pièce que le corps poli, et ça doit se voir.
      const goldDark = keep(
        new THREE.MeshPhysicalMaterial({
          color: 0x8a6d33,
          metalness: 1,
          roughness: 0.42,
          envMapIntensity: 1.1,
        })
      );

      // Le tube plongeur. Détail minuscule, signal énorme : c'est lui qui fait
      // lire « vaporisateur » et non « carafe ». Réfracté par le verre et
      // tordu par le galbe, il travaille le volume de l'intérieur.
      const dipTube = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.034, 0.034, 2.94, 10, 1, true)),
        keep(
          // Opaque, et c'est délibéré : un troisième matériau à transmission
          // ne se voyait pas — le tube est déjà derrière deux épaisseurs qui
          // réfractent — mais il payait plein tarif dans la passe.
          new THREE.MeshStandardMaterial({
            color: 0xd8d2c4,
            metalness: 0.1,
            roughness: 0.42,
            side: THREE.DoubleSide,
          })
        )
      );
      dipTube.position.set(0.07, 1.57, 0.02);
      dipTube.rotation.z = 0.035; // jamais parfaitement d'aplomb
      bottle.add(dipTube);

      // Sertissage : la bague écrasée sur la lèvre, sous le col.
      const crimp = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.382, 0.372, 0.085, 40)),
        goldDark
      );
      crimp.position.y = 3.03;
      bottle.add(crimp);

      const collar = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.395, 0.395, 0.14, 40)),
        goldMat
      );
      collar.position.y = 3.12;
      bottle.add(collar);

      // Bouchon : douze pans à facettes franches. `flatShading` est le seul
      // moyen d'obtenir des arêtes vraiment coupées — sans lui, les normales
      // moyennées arrondissent les pans et le bouchon redevient un cylindre.
      const goldFacet = keep(
        new THREE.MeshPhysicalMaterial({
          color: 0xc9a24c,
          metalness: 1,
          roughness: 0.14,
          envMapIntensity: 1.75,
          flatShading: true,
        })
      );

      const capBody = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.47, 0.435, 0.58, 12, 1)),
        goldFacet
      );
      capBody.position.y = 3.55;
      bottle.add(capBody);

      // Chanfrein puis plateau : deux pièces au lieu d'un cône, pour que la
      // lumière accroche une arête nette au sommet.
      const capChamfer = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.395, 0.47, 0.11, 12, 1)),
        goldFacet
      );
      capChamfer.position.y = 3.9;
      bottle.add(capChamfer);

      const capTop = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.383, 0.395, 0.055, 12, 1)),
        goldMat
      );
      capTop.position.y = 3.983;
      bottle.add(capTop);

      // Jonc de séparation : la ligne sombre entre col et bouchon.
      const capSeam = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.452, 0.452, 0.028, 24)),
        goldDark
      );
      capSeam.position.y = 3.25;
      bottle.add(capSeam);

      // ── Étiquette, dessinée au vol puis redessinée à l'arrivée des polices ──
      const drawLabel = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        ctx.clearRect(0, 0, w, h);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e8c882';
        ctx.font = `500 ${Math.round(h * 0.3)}px "Cinzel", Georgia, serif`;
        ctx.fillText('DAR SAFIA', w / 2, h * 0.46);
        ctx.strokeStyle = 'rgba(232,200,130,0.75)';
        ctx.lineWidth = Math.max(1, h * 0.012);
        ctx.beginPath();
        ctx.moveTo(w * 0.33, h * 0.6);
        ctx.lineTo(w * 0.67, h * 0.6);
        ctx.stroke();
        ctx.font = `400 ${Math.round(h * 0.115)}px "Montserrat", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(232,200,130,0.82)';
        ctx.letterSpacing = `${Math.round(h * 0.035)}px`;
        ctx.fillText('EAU DE PARFUM', w / 2, h * 0.78);
      };

      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 1024;
      labelCanvas.height = 512;
      const labelCtx = labelCanvas.getContext('2d');
      if (labelCtx) drawLabel(labelCtx, 1024, 512);
      const labelTex = keep(new THREE.CanvasTexture(labelCanvas));
      labelTex.colorSpace = THREE.SRGBColorSpace;
      labelTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      // Les polices de marque arrivent après le premier rendu : on repeint.
      void document.fonts?.ready
        .then(() => {
          if (disposed || !labelCtx) return;
          drawLabel(labelCtx, 1024, 512);
          labelTex.needsUpdate = true;
        })
        .catch(() => {});

      // Arc centré sur +Z : dans CylinderGeometry, theta 0 pointe vers +Z.
      const label = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(1.028, 1.021, 0.58, 48, 1, true, -0.62, 1.24)),
        keep(
          new THREE.MeshStandardMaterial({
            map: labelTex,
            transparent: true,
            metalness: 0.75,
            roughness: 0.32,
            envMapIntensity: 1.1,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        )
      );
      label.position.y = 1.2;
      label.renderOrder = 2;
      bottle.add(label);

      // ── Socle ───────────────────────────────────────────────
      // Un flacon posé à même le sol flotte. Sur une pierre polie il est
      // PRÉSENTÉ — c'est la différence entre un rendu et une vitrine.
      const plinth = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(2.45, 2.55, PLINTH_H, 64)),
        keep(
          new THREE.MeshStandardMaterial({
            color: 0x16110e,
            roughness: 0.3,
            metalness: 0.55,
            envMapIntensity: 0.9,
          })
        )
      );
      plinth.position.y = -PLINTH_H / 2;
      scene.add(plinth);

      // Un filet d'or à l'arête du socle : il capte les bandes verticales du
      // studio et dessine la ligne d'assise.
      const plinthRing = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(2.47, 2.47, 0.022, 64, 1, true)),
        goldMat
      );
      plinthRing.position.y = -0.014;
      scene.add(plinthRing);

      // ── Flacons compagnons, au second plan ──────────────────
      // Même géométrie (aucun coût de plus), mais un matériau OPAQUE et
      // sombre : ils ne sont pas du verre à calculer, seulement des
      // silhouettes qui attrapent les filets verticaux. C'est ce qui remplit
      // le fond sans alourdir la passe de réfraction.
      const companionMat = keep(
        new THREE.MeshStandardMaterial({
          color: 0x120d0b,
          roughness: 0.14,
          metalness: 0.72,
          envMapIntensity: 1.35,
        })
      );

      (
        [
          [-3.5, -5.4, 0.82, 0.5],
          [3.35, -6.3, 0.7, -0.9],
          [-1.4, -8.1, 0.58, 1.4],
        ] as [number, number, number, number][]
      )
        // Le plus lointain ne sert que la profondeur : on s'en passe sur le
        // palier léger, où chaque corps compte aussi dans la passe de
        // réfraction.
        .slice(0, rich ? 3 : 2)
        .forEach(([x, z, scale, spin]) => {
          const g = new THREE.Group();
          const body = new THREE.Mesh(glass.geometry, companionMat);
          g.add(body);
          const cap = new THREE.Mesh(capBody.geometry, goldDark);
          cap.position.y = 3.55;
          g.add(cap);
          g.position.set(x, -PLINTH_H, z); // eux sont posés au sol, pas sur le socle
          g.scale.setScalar(scale);
          g.rotation.y = spin;
          scene.add(g);
        });

      // ── Sol, ombre de contact, caustique ────────────────────
      const floor = new THREE.Mesh(
        keep(new THREE.PlaneGeometry(60, 60)),
        keep(
          new THREE.MeshStandardMaterial({
            color: 0x0a0706,
            // Presque un miroir : le sol renvoie les filets verticaux du
            // studio, et ces traînées suffisent à poser le flacon sur quelque
            // chose — sans payer une seconde passe de réflexion.
            roughness: 0.12,
            metalness: 0.9,
            envMapIntensity: 1.0,
          })
        )
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -PLINTH_H - 0.002;
      scene.add(floor);

      const groundSprite = (
        tex: Three.Texture,
        size: number,
        y: number,
        blending: Three.Blending,
        opacity: number
      ) => {
        const m = new THREE.Mesh(
          keep(new THREE.PlaneGeometry(size, size)),
          keep(
            new THREE.MeshBasicMaterial({
              map: tex,
              transparent: true,
              depthWrite: false,
              blending,
              opacity,
            })
          )
        );
        m.rotation.x = -Math.PI / 2;
        m.position.y = y;
        scene.add(m);
        return m;
      };

      groundSprite(
        radial([
          [0, 'rgba(0,0,0,0.92)'],
          [0.45, 'rgba(0,0,0,0.45)'],
          [1, 'rgba(0,0,0,0)'],
        ]),
        // Contenue dans le socle : une ombre qui déborde de la pierre trahit
        // aussitôt le trucage.
        4.3,
        0.004,
        THREE.NormalBlending,
        1
      );
      // Caustique : la flaque chaude que le jus projette au pied du flacon.
      // C'est elle qui raccroche l'objet au sol dans un décor aussi sombre.
      groundSprite(
        radial([
          [0, 'rgba(255,205,130,0.95)'],
          [0.3, 'rgba(226,150,58,0.4)'],
          [1, 'rgba(0,0,0,0)'],
        ]),
        3.0,
        0.006,
        THREE.AdditiveBlending,
        0.95
      );

      // ── Atmosphère : voile de brume et faisceau ─────────────
      const hazeTex = radial(
        [
          [0, 'rgba(190,150,95,0.5)'],
          [0.5, 'rgba(150,110,60,0.16)'],
          [1, 'rgba(0,0,0,0)'],
        ],
        256
      );
      const hazes: Three.Mesh[] = [];
      const hazeCount = rich ? 3 : 2;
      for (let i = 0; i < hazeCount; i++) {
        const m = new THREE.Mesh(
          keep(new THREE.PlaneGeometry(16, 16)),
          keep(
            new THREE.MeshBasicMaterial({
              map: hazeTex,
              transparent: true,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              // Nappes très faibles et TRÈS reculées : posées juste derrière le
              // flacon, elles formaient un fond chaud continu que le verre
              // transmettait tel quel — d'où le laiteux uniforme.
              opacity: 0.032 - i * 0.008,
            })
          )
        );
        m.position.set(-2.4 + i * 2.2, 2.6 + i * 0.7, -9 - i * 3.4);
        m.rotation.z = i * 1.1;
        hazes.push(m);
        scene.add(m);
      }

      // Faisceau doux. Texture radiale et non linéaire : un dégradé purement
      // vertical laisse deux arêtes franches sur les côtés du plan, qu'on
      // repère immédiatement comme un rectangle posé dans le décor.
      const shaft = new THREE.Mesh(
        keep(new THREE.PlaneGeometry(7, 11)),
        keep(
          new THREE.MeshBasicMaterial({
            map: radial(
              [
                [0, 'rgba(255,220,160,0.55)'],
                [0.42, 'rgba(220,170,90,0.14)'],
                [1, 'rgba(0,0,0,0)'],
              ],
              256
            ),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            // Très bas : plus haut, ce halo inonde le flacon par l'arrière et
            // le verre vire au laiteux uniforme au lieu de rester sombre.
            opacity: 0.05,
          })
        )
      );
      shaft.position.set(-1.3, 3.4, -5.2);
      scene.add(shaft);

      // ── Barres de studio, DERRIÈRE le flacon ────────────────
      // `transmission` réfracte la SCÈNE rendue, pas la carte d'environnement :
      // sans rien derrière, le verre ne plie que du vide et retombe à plat.
      // Ces trois barres lumineuses sont là pour être tordues par le galbe —
      // c'est ce qui donne les traînées de lumière à l'intérieur du verre.
      const barTex = paintTexture(32, 256, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.18, 'rgba(255,226,178,1)');
        g.addColorStop(0.82, 'rgba(255,214,150,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      const bars: Three.Mesh[] = [];
      (
        [
          // Deux filets étroits reculés derrière les épaules.
          [-1.45, 2.3, -3.4, 0.2, 5.4, 0.62],
          [1.3, 2.1, -3.8, 0.15, 4.8, 0.48],
          // Un contre-jour bas, discret, qui détache le jus du fond. Il était
          // très vif quand il devait forcer la lumière À TRAVERS un jus
          // transmissif ; le jus étant opaque, il n'est plus qu'un liseré.
          [0.0, 1.25, -2.8, 2.1, 3.3, 0.38],
        ] as [number, number, number, number, number, number][]
      ).forEach(([x, y, z, w, h, o]) => {
        const bar = new THREE.Mesh(
          keep(new THREE.PlaneGeometry(w, h)),
          keep(
            new THREE.MeshBasicMaterial({
              map: barTex,
              transparent: true,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              opacity: o,
            })
          )
        );
        bar.position.set(x, y, z);
        bars.push(bar);
        scene.add(bar);
      });

      // ── Poussière en suspension ─────────────────────────────
      const motesCount = rich ? 240 : 90;
      const motePos = new Float32Array(motesCount * 3);
      const moteSeed = new Float32Array(motesCount);
      for (let i = 0; i < motesCount; i++) {
        motePos[i * 3] = (Math.random() - 0.5) * 13;
        motePos[i * 3 + 1] = Math.random() * 7.5 - 0.3;
        motePos[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1.5;
        moteSeed[i] = Math.random() * Math.PI * 2;
      }
      const moteGeo = keep(new THREE.BufferGeometry());
      moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      const motes = new THREE.Points(
        moteGeo,
        keep(
          new THREE.PointsMaterial({
            map: radial(
              [
                [0, 'rgba(255,230,180,1)'],
                [0.4, 'rgba(240,200,130,0.45)'],
                [1, 'rgba(0,0,0,0)'],
              ],
              64
            ),
            size: 0.05,
            sizeAttenuation: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            opacity: 0.62,
          })
        )
      );
      scene.add(motes);

      // Seconde couche, grosse et lente, très loin derrière : des bokehs.
      // Une seule taille de poussière aplatit la profondeur ; deux échelles
      // donnent immédiatement le sentiment d'un volume d'air.
      const bokehCount = rich ? 34 : 14;
      const bokehPos = new Float32Array(bokehCount * 3);
      for (let i = 0; i < bokehCount; i++) {
        bokehPos[i * 3] = (Math.random() - 0.5) * 20;
        bokehPos[i * 3 + 1] = Math.random() * 9 - 0.5;
        bokehPos[i * 3 + 2] = -6 - Math.random() * 8;
      }
      const bokehGeo = keep(new THREE.BufferGeometry());
      bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
      const bokeh = new THREE.Points(
        bokehGeo,
        keep(
          new THREE.PointsMaterial({
            map: radial(
              [
                [0, 'rgba(255,222,168,0.5)'],
                [0.55, 'rgba(226,176,104,0.16)'],
                [1, 'rgba(0,0,0,0)'],
              ],
              64
            ),
            size: 0.85,
            sizeAttenuation: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            opacity: 0.3,
          })
        )
      );
      scene.add(bokeh);

      // ── Lumières directes : les hautes lumières nettes que
      //    l'environnement seul ne donne pas. ─────────────────
      const key = new THREE.DirectionalLight(0xffd9a2, 1.45);
      key.position.set(4.5, 7, 5);
      const fill = new THREE.DirectionalLight(0x7d8ec0, 0.5);
      fill.position.set(-5, -1, 3);
      const rim = new THREE.PointLight(0xc89b3c, 11, 26, 2);
      rim.position.set(-3, 2.4, -3.5);
      scene.add(key, fill, rim);

      // La lampe du curseur. C'est l'interaction la plus payante de la scène :
      // elle ne déplace rien, elle ÉCLAIRE. Le pointeur promène une spéculaire
      // vive sur le verre et sur l'or, et l'objet se met à répondre au geste
      // au lieu de subir une parallaxe.
      const cursorLight = new THREE.PointLight(0xffd8a0, 0, 13, 2);
      cursorLight.position.set(0, 2.4, 4.6);
      scene.add(cursorLight);

      // ── Post-traitement (palier riche) ──────────────────────
      let composer: {
        render: () => void;
        setSize: (w: number, h: number) => void;
      } | null = null;
      /** Gardé pour que le dévoilement puisse monter la floraison avec le reste. */
      let bloomPass: { strength: number; setSize: (w: number, h: number) => void } | null = null;
      if (rich) {
        const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] =
          await Promise.all([
            import('three/examples/jsm/postprocessing/EffectComposer.js'),
            import('three/examples/jsm/postprocessing/RenderPass.js'),
            import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
            import('three/examples/jsm/postprocessing/OutputPass.js'),
          ]);
        if (disposed) return;
        const target = keep(
          new THREE.WebGLRenderTarget(width, height, {
            type: THREE.HalfFloatType,
            samples: 2,
          })
        );
        const c = new EffectComposer(renderer, target);
        c.addPass(new RenderPass(scene, camera));
        // Seuil haut : seules les spéculaires les plus vives débordent.
        // Demi-résolution. La floraison EST un flou : personne n'en voit la
        // définition, mais elle coûte plusieurs passes de réduction en pleine
        // résolution. L'économie la plus rentable de la scène.
        const bloom = new UnrealBloomPass(
          new THREE.Vector2(width * 0.5, height * 0.5),
          0.24,
          0.5,
          0.9
        );
        c.addPass(bloom);
        bloomPass = bloom;
        c.addPass(new OutputPass()); // applique le tone mapping, une seule fois
        composer = c;
        trash.push({ dispose: () => c.dispose() });
      }

      // ── État piloté par le défilement et le pointeur ────────
      const s = {
        progress: 0,
        px: 0,
        py: 0,
        cpx: 0,
        cpy: 0,
        spin: 0,
        /** 0 → 1 : le dévoilement. Piloté par GSAP au premier passage à l'écran. */
        intro: reduced ? 1 : 0,
        /** Intensité de la lampe de curseur : monte à l'entrée, retombe à la sortie. */
        touch: 0,
        /** 1 quand le pointeur survole le flacon (lancer de rayon), lissé ensuite. */
        hover: 0,
        hovering: false,
        /** Rotation donnée à la main : angle, vitesse (rad/s), delta en attente. */
        dragging: false,
        dragYaw: 0,
        dragVel: 0,
        dragAccum: 0,
        lastX: 0,
        /** Position écran du pointeur, pour le lancer de rayon fait dans la boucle. */
        clientX: 0,
        clientY: 0,
        pointerDirty: false,
      };

      // Le repère de défilement n'est pas le canvas — qui est collant et donc
      // immobile — mais la SECTION qui lui sert de piste. Mesurer un élément
      // `sticky` donnerait une progression bloquée à zéro.
      const track = (mount.closest('[data-scene-track]') as HTMLElement | null) ?? mount;

      const st = ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          s.progress = self.progress;
        },
      });

      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      const onPointer = (e: PointerEvent) => {
        const r = mount.getBoundingClientRect();
        s.px = clamp(((e.clientX - r.left) / r.width - 0.5) * 2);
        s.py = clamp(((e.clientY - r.top) / r.height - 0.5) * 2);
        s.touch = 1;
        s.clientX = e.clientX;
        s.clientY = e.clientY;
        // Le lancer de rayon n'est PAS fait ici : un événement de pointeur peut
        // tomber plusieurs fois par image. On le fait une fois, dans la boucle.
        s.pointerDirty = true;
        if (s.dragging) {
          s.dragAccum += (e.clientX - s.lastX) * 0.011;
          s.lastX = e.clientX;
        }
      };

      // ── Prise en main ──
      // Le canvas est sous du texte et un bloc `pointer-events: none` : on
      // écoute la fenêtre et on décide par lancer de rayon si le geste vise le
      // flacon. Un lien ou un champ gardent toujours la priorité.
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const hitsBottle = (clientX: number, clientY: number) => {
        const r = mount.getBoundingClientRect();
        if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) {
          return false;
        }
        ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
        camera.updateMatrixWorld();
        raycaster.setFromCamera(ndc, camera);
        return raycaster.intersectObject(glass, false).length > 0;
      };
      const interactive = (t: EventTarget | null) =>
        t instanceof Element && !!t.closest('a, button, input, textarea, select, label');

      const onDown = (e: PointerEvent) => {
        if (e.button !== 0 || interactive(e.target)) return;
        if (!hitsBottle(e.clientX, e.clientY)) return;
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
          s.dragging = true;
          s.lastX = e.clientX;
          s.dragVel = 0;
          track.style.cursor = 'grabbing';
          // Pas de sélection de texte pendant qu'on fait tourner le flacon.
          e.preventDefault();
        } else {
          // Au doigt, un glisser défilerait la page : un toucher lance le
          // flacon, sans empêcher le défilement.
          s.dragVel += 3.4;
        }
      };
      const onUp = () => {
        if (!s.dragging) return;
        s.dragging = false;
        track.style.cursor = s.hovering ? 'grab' : '';
      };
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      // Curseur sorti de la fenêtre : la scène se repose au lieu de rester
      // figée sur la dernière position, ce qui se lit comme un bug.
      const onLeave = () => {
        s.px = 0;
        s.py = 0;
        s.touch = 0;
        s.hovering = false;
        onUp();
        track.style.cursor = '';
      };
      if (!coarse) {
        window.addEventListener('pointermove', onPointer, { passive: true });
        document.addEventListener('pointerleave', onLeave);
      }

      const ro = new ResizeObserver(() => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer?.setSize(w, h);
        // `EffectComposer.setSize` repasse la floraison en pleine résolution :
        // on la ramène à la moitié juste après, sinon l'économie est perdue dès
        // le premier redimensionnement — qui a lieu au montage.
        bloomPass?.setSize(w * 0.5, h * 0.5);
      });
      ro.observe(mount);

      // ── Dévoilement ─────────────────────────────────────────
      // La scène ne « s'affiche » pas : elle se lève. L'exposition part de
      // presque rien, la caméra recule puis avance, le flacon se pose sur son
      // angle. Déclenché à la première intersection, pas au montage : si la
      // page ouvre ailleurs, le plan attend qu'on le regarde.
      let onScreen = true;
      let introStarted = reduced;
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        if (e.isIntersecting && !introStarted) {
          introStarted = true;
          gsap.to(s, { intro: 1, duration: 2.6, ease: 'power2.out' });
        }
      });
      io.observe(mount);

      // ── Boucle ──────────────────────────────────────────────
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const camPos = new THREE.Vector3();
      const camLook = new THREE.Vector3();
      // Sur large écran, la cible glisse à l'opposé du texte : le flacon se
      // pose d'un côté du cadre et rend l'autre colonne à la typographie. En
      // arabe la colonne de texte passe à droite — sans ce miroir, le flacon
      // se plantait exactement derrière le titre.
      const rtl = document.documentElement.dir === 'rtl';
      const lookShift = wide ? (rtl ? 0.95 : -0.95) : 0;
      // Sur mobile il n'y a pas de colonne libre : on recule, et on vise plus
      // bas pour remonter le flacon dans le tiers haut. Sans ça il est rogné
      // au pied et l'étiquette passe sous le titre.
      const distBoost = wide ? 0 : 2.4;
      const lookRise = wide ? 0 : -0.6;

      /** Angle du flacon au cadrage courant, écrit par `shotAt`. */
      let shotYaw = 0;

      /** Interpole les trois cadrages — et la pose du flacon — selon la progression. */
      const shotAt = (p: number) => {
        const f = Math.min(0.999, Math.max(0, p)) * (SHOTS.length - 1);
        const i = Math.floor(f);
        const t = f - i;
        const a = SHOTS[i];
        const b = SHOTS[Math.min(SHOTS.length - 1, i + 1)];
        // Adoucissement : pas de cassure de vitesse au passage d'un cadrage.
        const e = t * t * (3 - 2 * t);
        camPos.set(
          lerp(a.pos[0], b.pos[0], e),
          lerp(a.pos[1], b.pos[1], e),
          lerp(a.pos[2], b.pos[2], e) + distBoost
        );
        camLook.set(
          lerp(a.look[0], b.look[0], e) + lookShift,
          lerp(a.look[1], b.look[1], e) + lookRise,
          lerp(a.look[2], b.look[2], e)
        );
        shotYaw = lerp(YAW[i], YAW[Math.min(YAW.length - 1, i + 1)], e);
        return lerp(a.fov, b.fov, e);
      };

      // ── Gouverneur de qualité ──
      // La machine cible est inconnue : plutôt que de parier sur un palier
      // fixe, on MESURE les premières secondes de rendu réel. Si le budget
      // n'est pas tenu, la résolution baisse d'un cran — un seul, pour ne
      // jamais osciller entre deux qualités à l'écran.
      const basePixelRatio = renderer.getPixelRatio();
      let sampled = 0;
      let sampledTime = 0;
      let governed = false;

      const slosh = {
        x: 0,
        z: 0,
        vx: 0,
        vz: 0,
        prevYaw: 0,
        prevTilt: 0,
        prevYawVel: 0,
        prevTiltVel: 0,
      };
      const surfaceUp = new THREE.Vector3(0, 1, 0);
      const surfacePoint = new THREE.Vector3();
      const planeNormal = new THREE.Vector3();
      const zAxis = new THREE.Vector3(0, 0, 1);

      let last = 0;
      const draw = (time: number) => {
        const t = reduced ? 0 : time * 0.001;
        const intro = s.intro;

        // Amortissement indépendant de la fréquence d'images. Un `lerp` à
        // coefficient fixe suppose 60 Hz : sur un rAF ralenti (onglet en
        // arrière-plan, écran 30 Hz, machine chargée) il n'atteint jamais sa
        // cible, et la pose du flacon reste en retard sur le défilement.
        const dt = last ? Math.min(0.1, (time - last) * 0.001) : 1 / 60;
        last = time;
        const damp = (rate: number) => 1 - Math.pow(1 - rate, dt * 60);
        const kPointer = damp(0.085);
        const kSlow = damp(0.06);

        // Les images manifestement volées (onglet qui reprend la main, GC)
        // sont écartées : elles tireraient la mesure vers le bas et
        // déclencheraient une baisse de qualité sur une machine saine.
        if (!governed && intro >= 1 && dt < 0.05) {
          sampled++;
          sampledTime += dt;
          if (sampled >= 120) {
            governed = true;
            if (sampledTime / sampled > 0.024) {
              const w = mount.clientWidth;
              const h = mount.clientHeight;
              renderer.setPixelRatio(Math.max(1, basePixelRatio * 0.75));
              renderer.setSize(w, h);
              composer?.setSize(w, h);
              bloomPass?.setSize(w * 0.5, h * 0.5);
            }
          }
        }

        // Sur écran tactile, pas de pointeur : une dérive lente très ample
        // remplace le geste, sinon la scène est inerte sur mobile.
        if (coarse && !reduced) {
          s.px = Math.sin(t * 0.17) * 0.55;
          s.py = Math.cos(t * 0.12) * 0.3;
        }

        // Suivi amorti. Lent à la prise, c'est ce qui donne le poids — un
        // suivi immédiat rendrait l'objet nerveux, donc bon marché.
        s.cpx = lerp(s.cpx, s.px, kPointer);
        s.cpy = lerp(s.cpy, s.py, kPointer);

        // ── Caméra : cadrage au défilement + parallaxe au pointeur ──
        const fov = shotAt(s.progress);
        camera.position.set(
          camPos.x + s.cpx * 0.55,
          camPos.y - s.cpy * 0.32 + Math.sin(t * 0.34) * 0.045,
          // Le recul du dévoilement : la caméra arrive de loin et se pose.
          camPos.z + (1 - intro) * 3.2
        );
        camera.lookAt(camLook.x + s.cpx * 0.14, camLook.y - s.cpy * 0.06, camLook.z);
        if (Math.abs(camera.fov - fov) > 0.001) {
          camera.fov = fov;
          camera.updateProjectionMatrix();
        }

        // ── Survol : un lancer de rayon par image au plus ──
        if (s.pointerDirty && !coarse) {
          s.pointerDirty = false;
          const over = hitsBottle(s.clientX, s.clientY);
          if (over !== s.hovering) {
            s.hovering = over;
            if (!s.dragging) track.style.cursor = over ? 'grab' : '';
          }
        }
        s.hover = lerp(s.hover, s.hovering || s.dragging ? 1 : 0, kSlow);

        // ── Rotation à la main, avec inertie ──
        if (s.dragging) {
          const step = s.dragAccum;
          s.dragAccum = 0;
          s.dragYaw += step;
          s.dragVel = step / Math.max(dt, 1 / 120);
        } else {
          s.dragYaw += s.dragVel * dt;
          s.dragVel *= Math.pow(0.06, dt); // il reste ~6 % de l'élan après 1 s
          // Lâché et presque arrêté, le flacon revient face à nous par le tour
          // le plus court : on peut jouer avec, la pose finit toujours juste.
          if (Math.abs(s.dragVel) < 0.35) {
            const home = Math.round(s.dragYaw / (Math.PI * 2)) * Math.PI * 2;
            s.dragYaw = lerp(s.dragYaw, home, damp(0.035));
          }
        }

        // ── Le flacon : une pose, pas une rotation libre ──
        // La cible est l'angle du cadrage, plus une réponse bornée au
        // pointeur et une respiration presque imperceptible. On ne verra
        // jamais le dos du flacon, et l'étiquette reste lisible.
        // L'angle du cadrage est appliqué DIRECTEMENT, sans lissage : c'est
        // ScrollTrigger (`scrub`, donc Lenis) qui amortit déjà la progression.
        // Un second amortissement par-dessus ne faisait que décrocher la pose
        // du défilement — exactement ce qu'on cherchait à éviter. Seul le
        // pointeur, lui, reste amorti : lui n'est pas lissé en amont.
        s.spin = lerp(s.spin, s.cpx * 0.26, kSlow);
        bottle.rotation.y =
          shotYaw +
          s.spin +
          s.dragYaw +
          (reduced ? 0 : Math.sin(t * 0.26) * 0.022) -
          (1 - intro) * 0.55;
        // Bascule minime vers le curseur : le flacon « regarde » la souris.
        bottle.rotation.x = lerp(bottle.rotation.x, -s.cpy * 0.05, kSlow);
        // Survolé, le flacon se soulève à peine de son socle : il se laisse prendre.
        bottle.position.y = (reduced ? 0 : Math.sin(t * 0.5) * 0.022) + s.hover * 0.085;

        // ── Le jus : surface de niveau, ballottement amorti ──
        // Un ressort sur deux angles, excité par l'ACCÉLÉRATION du flacon —
        // pose de défilement, curseur, main. Un liquide réagit aux changements
        // de mouvement, pas au mouvement lui-même.
        const invDt = 1 / Math.max(dt, 1 / 240);
        const yawVel = (bottle.rotation.y - slosh.prevYaw) * invDt;
        const tiltVel = (bottle.rotation.x - slosh.prevTilt) * invDt;
        const yawAcc = Math.max(-60, Math.min(60, (yawVel - slosh.prevYawVel) * invDt));
        const tiltAcc = Math.max(-60, Math.min(60, (tiltVel - slosh.prevTiltVel) * invDt));
        slosh.prevYaw = bottle.rotation.y;
        slosh.prevTilt = bottle.rotation.x;
        slosh.prevYawVel = yawVel;
        slosh.prevTiltVel = tiltVel;
        if (!reduced) {
          const K = 28;
          const C = 2.9;
          slosh.vz += (-K * slosh.z - C * slosh.vz - yawAcc * 0.0042) * dt;
          slosh.vx += (-K * slosh.x - C * slosh.vx + tiltAcc * 0.02) * dt;
          slosh.z = Math.max(-0.17, Math.min(0.17, slosh.z + slosh.vz * dt));
          slosh.x = Math.max(-0.17, Math.min(0.17, slosh.x + slosh.vx * dt));
        }
        // Une ondulation de fond, à peine : un liquide n'est jamais tout à fait immobile.
        const wz = slosh.z + (reduced ? 0 : Math.sin(t * 1.4) * 0.006);
        const wx = slosh.x + (reduced ? 0 : Math.cos(t * 1.1) * 0.005);
        surfaceUp.set(-Math.sin(wz), Math.cos(wz) * Math.cos(wx), Math.sin(wx)).normalize();
        bottle.updateMatrixWorld(true);
        surfacePoint.set(0, LIQUID_LEVEL, 0);
        bottle.localToWorld(surfacePoint);
        planeNormal.copy(surfaceUp).negate();
        liquidPlane.setFromNormalAndCoplanarPoint(planeNormal, surfacePoint);
        surface.position.copy(surfacePoint);
        surface.quaternion.setFromUnitVectors(zAxis, surfaceUp);

        if (!reduced) {
          const bp = bubbles.geometry.attributes.position as Three.BufferAttribute;
          const arr = bp.array as Float32Array;
          for (let i = 0; i < bubbleCount; i++) {
            arr[i * 3 + 1] += bubbleSpeed[i] * dt;
            arr[i * 3] += Math.sin(t * 2.1 + i) * 0.0009;
            if (arr[i * 3 + 1] > LIQUID_LEVEL + 0.2) spawnBubble(i, 0.12);
          }
          bp.needsUpdate = true;
        }

        // ── Réponse au curseur : la lampe et les filets ──
        cursorLight.position.set(s.cpx * 5.2, 2.5 - s.cpy * 2.6, 4.4);
        // Une base toujours allumée, que le survol MODULE. Partir de zéro
        // faisait dépendre l'éclairage du flacon de la présence de la souris :
        // au repos la scène s'éteignait, ce qui n'est pas une interaction mais
        // un interrupteur.
        // Discrète : elle ne doit plus éclairer la scène, seulement faire
        // glisser un reflet. Le survol du flacon lui ajoute un peu de présence.
        cursorLight.intensity = lerp(
          cursorLight.intensity,
          (2 + s.touch * 2.4 + s.hover * 2.2) * intro,
          kSlow
        );
        // Les deux filets de contre-jour glissent avec le pointeur : ce qui
        // est réfracté DANS le verre bouge, pas seulement ce qui s'y reflète.
        if (bars[0]) bars[0].position.x = -1.45 + s.cpx * 0.62;
        if (bars[1]) bars[1].position.x = 1.3 - s.cpx * 0.45;

        // ── Montée en lumière du dévoilement ──
        renderer.toneMappingExposure = 1.08 * (0.04 + 0.96 * intro);
        if (bloomPass) bloomPass.strength = 0.24 * intro;

        if (!reduced) {
          const p = motes.geometry.attributes.position as Three.BufferAttribute;
          const arr = p.array as Float32Array;
          const fs = dt * 60; // même dérive quelle que soit la cadence
          for (let i = 0; i < motesCount; i++) {
            const k = i * 3;
            arr[k + 1] += (0.0016 + (i % 5) * 0.0004) * fs;
            if (arr[k + 1] > 7.4) arr[k + 1] = -0.3;
            arr[k] += Math.sin(t * 0.22 + moteSeed[i]) * 0.0011 * fs;
          }
          p.needsUpdate = true;
          // Les bokehs ne sont pas animés point par point : faire dériver le
          // nuage entier coûte une matrice au lieu de 34 écritures tampon.
          bokeh.position.x = Math.sin(t * 0.06) * 0.5;
          bokeh.position.y = Math.sin(t * 0.045) * 0.35;
          hazes.forEach((h, i) => {
            h.rotation.z += 0.00035 * (i % 2 ? 1 : -1);
          });
        }

        if (composer) composer.render();
        else renderer.render(scene, camera);
      };

      const disposeAll = () => {
        st.kill();
        ro.disconnect();
        io.disconnect();
        gsap.killTweensOf(s);
        if (!coarse) {
          window.removeEventListener('pointermove', onPointer);
          document.removeEventListener('pointerleave', onLeave);
        }
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        track.style.cursor = '';
        trash.forEach((d) => d.dispose());
        renderer.dispose();
        canvas.remove();
      };

      if (reduced) {
        // Une image, posée sur le premier cadrage. Aucune boucle.
        draw(0);
        teardown = disposeAll;
        return;
      }

      const tick = () => {
        if (onScreen && !document.hidden) draw(performance.now());
      };
      gsap.ticker.add(tick);
      teardown = () => {
        gsap.ticker.remove(tick);
        disposeAll();
      };
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [reduced]);

  return (
    <div ref={mountRef} className={className} aria-hidden="true">
      {/* Lueur dorée : ambiance de fond, et seule image si WebGL manque. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(42% 46% at 56% 48%, rgba(200,155,60,0.18) 0%, transparent 72%)',
        }}
      />
    </div>
  );
}
