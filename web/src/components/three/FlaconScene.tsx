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
 * Au défilement, c'est la CAMÉRA qui passe entre trois cadrages (ScrollTrigger
 * `scrub`, donc calée sur Lenis) pendant que le flacon tourne lentement.
 * Poussière en suspension et voiles de brume dérivent derrière, en parallaxe.
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
  [0.0, 2.08],
];

/**
 * Cadrages successifs, parcourus au défilement. Le flacon mesure ~4 unités
 * bouchon compris : à f=34° il faut reculer d'environ 9 pour le tenir en entier
 * avec de l'air au-dessus. Trop près, on décapite le bouchon.
 */
const SHOTS = [
  { pos: [0.7, 2.0, 9.1], look: [0, 1.95, 0], fov: 33 },
  { pos: [-2.1, 2.7, 9.6], look: [0, 1.8, 0], fov: 31 },
  { pos: [-0.7, 3.6, 11.4], look: [0, 1.5, 0], fov: 30 },
];

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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, rich ? 1.75 : 1.4));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      // La réfraction se calcule dans une passe séparée : la moitié de la
      // résolution suffit sur des surfaces aussi lisses, et divise son coût.
      renderer.transmissionResolutionScale = rich ? 0.5 : 0.3;
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
      panel(0.85, 16, new THREE.Color(11, 9.2, 6.6), [-5.5, 3, 5]); // filet gauche
      panel(0.5, 13, new THREE.Color(7, 5.8, 4.2), [6, 2, 3.5]); // filet droit
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
            map: radial(
              [
                [0, 'rgb(38,26,20)'],
                [0.45, 'rgb(24,16,13)'],
                [1, 'rgb(13,9,8)'],
              ],
              512
            ),
            depthWrite: false,
          })
        )
      );
      backdrop.position.set(-1, 4, -16);
      scene.add(backdrop);

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
        lathe(BOTTLE_PROFILE, rich ? 96 : 56),
        keep(
          new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0.025,
            transmission: 1,
            // Épaisseur généreuse : c'est elle qui courbe franchement ce qui
            // passe au travers. Trop basse, le verre n'est qu'une vitre.
            thickness: 2.1,
            ior: 1.52,
            // Le verre n'est pas incolore : il se teinte dans l'épaisseur.
            attenuationColor: new THREE.Color(0xbfae88),
            attenuationDistance: 1.6,
            // Pas de vernis par-dessus : le clearcoat ajoute une couche
            // miroir qui renvoie tout l'environnement et referme le verre en
            // blanc laiteux. Le cristal tire son éclat de la réfraction.
            clearcoat: 0.2,
            clearcoatRoughness: 0.08,
            envMapIntensity: 0.55,
          })
        )
      );
      bottle.add(glass);

      // Le jus : indice plus bas que le verre, atténuation ambrée courte —
      // c'est la distance parcourue dans le liquide qui fonce la teinte.
      const liquid = new THREE.Mesh(
        lathe(LIQUID_PROFILE, rich ? 80 : 48),
        keep(
          new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0.02,
            transmission: 1,
            thickness: 1.4,
            ior: 1.37,
            // Ambre lumineux, pas brun : trop court, l'atténuation éteint le
            // jus en noir au lieu de le faire rougeoyer.
            attenuationColor: new THREE.Color(0xe09338),
            attenuationDistance: 2.1,
            envMapIntensity: 0.9,
            // Une braise interne, très basse. Physiquement c'est une licence,
            // mais c'est ce qui empêche le jus de retomber au noir dans les
            // creux que le rétroéclairage n'atteint pas.
            emissive: new THREE.Color(0x662d07),
            emissiveIntensity: 0.42,
          })
        )
      );
      bottle.add(liquid);

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

      const collar = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.395, 0.395, 0.14, 40)),
        goldMat
      );
      collar.position.y = 3.1;
      bottle.add(collar);

      // Bouchon : douze pans, l'écho taillé du col rond.
      const capBody = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.47, 0.43, 0.66, 12, 1)),
        goldMat
      );
      capBody.position.y = 3.58;
      bottle.add(capBody);

      const capTop = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.4, 0.47, 0.1, 12, 1)),
        goldMat
      );
      capTop.position.y = 3.95;
      bottle.add(capTop);

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
      floor.position.y = -0.002;
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
        5.2,
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
        3.6,
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
          // Deux filets étroits reculés derrière les épaules, plus une barre
          // basse qui n'existe que pour allumer le jus par l'arrière.
          [-1.45, 2.3, -3.4, 0.12, 5.0, 0.85],
          [1.3, 2.1, -3.8, 0.09, 4.4, 0.6],
          // Large et chaude, calée derrière le niveau du jus : c'est elle qui
          // allume l'ambre par transmission. Sans elle le flacon n'est qu'une
          // silhouette noire — du verre, mais plus du parfum.
          [0.0, 1.0, -2.8, 2.6, 2.4, 0.95],
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
      const motesCount = rich ? 420 : 130;
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

      // ── Lumières directes : les hautes lumières nettes que
      //    l'environnement seul ne donne pas. ─────────────────
      const key = new THREE.DirectionalLight(0xffd9a2, 2.2);
      key.position.set(4.5, 7, 5);
      const fill = new THREE.DirectionalLight(0x7d8ec0, 0.5);
      fill.position.set(-5, -1, 3);
      const rim = new THREE.PointLight(0xc89b3c, 22, 26, 2);
      rim.position.set(-3, 2.4, -3.5);
      scene.add(key, fill, rim);

      // ── Post-traitement (palier riche) ──────────────────────
      let composer: { render: () => void; setSize: (w: number, h: number) => void } | null = null;
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
            samples: 4,
          })
        );
        const c = new EffectComposer(renderer, target);
        c.addPass(new RenderPass(scene, camera));
        // Seuil haut : seules les spéculaires les plus vives débordent.
        const bloom = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          0.42,
          0.55,
          0.86
        );
        c.addPass(bloom);
        c.addPass(new OutputPass()); // applique le tone mapping, une seule fois
        composer = c;
        trash.push({ dispose: () => c.dispose() });
      }

      // ── État piloté par le défilement et le pointeur ────────
      const s = { progress: 0, px: 0, py: 0, cpx: 0, cpy: 0, spin: 0 };

      const st = ScrollTrigger.create({
        trigger: mount,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          s.progress = self.progress;
        },
      });

      const onPointer = (e: PointerEvent) => {
        const r = mount.getBoundingClientRect();
        s.px = ((e.clientX - r.left) / r.width - 0.5) * 2;
        s.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      if (!coarse) window.addEventListener('pointermove', onPointer, { passive: true });

      const ro = new ResizeObserver(() => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer?.setSize(w, h);
      });
      ro.observe(mount);

      let onScreen = true;
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
      });
      io.observe(mount);

      // ── Boucle ──────────────────────────────────────────────
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const camPos = new THREE.Vector3();
      const camLook = new THREE.Vector3();
      // Sur large écran, la cible glisse à gauche : le flacon se pose à droite
      // du cadre et rend la colonne de gauche au texte.
      const lookShift = wide ? -0.95 : 0;
      // Sur mobile il n'y a pas de colonne libre : on recule, et on vise plus
      // bas pour remonter le flacon dans le tiers haut. Sans ça il est rogné
      // au pied et l'étiquette passe sous le titre.
      const distBoost = wide ? 0 : 2.4;
      const lookRise = wide ? 0 : -0.6;

      /** Interpole les trois cadrages selon la progression. */
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
        return lerp(a.fov, b.fov, e);
      };

      const draw = (time: number) => {
        const t = reduced ? 0 : time * 0.001;

        // Le pointeur n'agit pas sur l'objet mais sur la CAMÉRA : la
        // parallaxe porte alors aussi la poussière et la brume.
        s.cpx = lerp(s.cpx, s.px, 0.045);
        s.cpy = lerp(s.cpy, s.py, 0.045);

        const fov = shotAt(s.progress);
        camera.position.set(
          camPos.x + s.cpx * 0.55,
          camPos.y - s.cpy * 0.32 + Math.sin(t * 0.34) * 0.045,
          camPos.z
        );
        camera.lookAt(camLook.x + s.cpx * 0.14, camLook.y - s.cpy * 0.06, camLook.z);
        if (Math.abs(camera.fov - fov) > 0.001) {
          camera.fov = fov;
          camera.updateProjectionMatrix();
        }

        s.spin = lerp(s.spin, s.progress * 2.1 + t * 0.055, 0.06);
        bottle.rotation.y = s.spin;
        bottle.position.y = reduced ? 0 : Math.sin(t * 0.5) * 0.022;

        if (!reduced) {
          const p = motes.geometry.attributes.position as Three.BufferAttribute;
          const arr = p.array as Float32Array;
          for (let i = 0; i < motesCount; i++) {
            const k = i * 3;
            arr[k + 1] += 0.0016 + (i % 5) * 0.0004;
            if (arr[k + 1] > 7.4) arr[k + 1] = -0.3;
            arr[k] += Math.sin(t * 0.22 + moteSeed[i]) * 0.0011;
          }
          p.needsUpdate = true;
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
        if (!coarse) window.removeEventListener('pointermove', onPointer);
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
