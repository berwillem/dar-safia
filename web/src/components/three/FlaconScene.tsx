'use client';

import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/components/motion/usePrefersReducedMotion';

/**
 * ══════════════════════════════════════════════════════════════
 *   LE FLACON — SCÈNE 3D
 * ══════════════════════════════════════════════════════════════
 *
 * Un seul objet, une seule scène : un flacon taillé, en or liquide, qui
 * tourne lentement sur lui-même. Sa rotation est ACCROCHÉE AU DÉFILEMENT
 * (GSAP ScrollTrigger, `scrub`, donc calée sur la position interpolée par
 * Lenis) — c'est là que GSAP, Lenis et la 3D se rejoignent, pas trois effets
 * côte à côte. Sur desktop, un très léger parallaxe suit le pointeur.
 *
 * `three` est importé dynamiquement : les autres pages ne le paient pas.
 * Le rendu passe par `gsap.ticker` — une seule boucle rAF pour toute la page,
 * comme `SmoothScroll`. La boucle se coupe hors écran et onglet en fond.
 *
 * Sous `prefers-reduced-motion` : une seule image fixe, aucune boucle. Si
 * WebGL est indisponible, la lueur dorée en fond (CSS, sous le canvas) reste
 * seule — la page n'a pas de trou.
 */
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

      // WebGL absent (vieux appareil, GPU bloqué) : on laisse la lueur CSS.
      const probe = document.createElement('canvas');
      if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return;

      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const wide = window.matchMedia('(min-width: 768px)').matches;
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
      camera.position.set(0, 0.6, 9.6);
      camera.lookAt(0, 0.15, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: !coarse, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      mount.appendChild(canvas);

      // ── Environnement : un métal sans reflet est noir. On génère un petit
      //    studio (dégradé chaud + deux sources) et on le convole en carte
      //    d'environnement — c'est ce que l'or renvoie. ──
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      const grad = new THREE.Mesh(
        new THREE.SphereGeometry(12, 24, 16),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          uniforms: {
            hi: { value: new THREE.Color(0x4a3418) },
            lo: { value: new THREE.Color(0x0b0807) },
          },
          vertexShader:
            'varying vec3 vp; void main(){ vp = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader:
            'varying vec3 vp; uniform vec3 hi; uniform vec3 lo; void main(){ float h = clamp(normalize(vp).y*0.5+0.5, 0.0, 1.0); gl_FragColor = vec4(mix(lo, hi, pow(h,1.4)), 1.0); }',
        })
      );
      envScene.add(grad);
      const keyGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(7, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe4b0 })
      );
      keyGlow.position.set(6, 3, 4);
      keyGlow.lookAt(0, 0, 0);
      const coolGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 7),
        new THREE.MeshBasicMaterial({ color: 0x5566aa })
      );
      coolGlow.position.set(-6, -1, -2);
      coolGlow.lookAt(0, 0, 0);
      envScene.add(keyGlow, coolGlow);
      const envRT = pmrem.fromScene(envScene, 0.03);
      scene.environment = envRT.texture;
      const envDispose = [
        grad.geometry,
        grad.material,
        keyGlow.geometry,
        keyGlow.material,
        coolGlow.geometry,
        coolGlow.material,
      ];

      // ── Le flacon : facettes basses = taille de cristal ──
      const gold = new THREE.MeshPhysicalMaterial({
        color: 0xcaa14a,
        metalness: 0.92,
        roughness: 0.28,
        envMapIntensity: 1.35,
        clearcoat: 0.6,
        clearcoatRoughness: 0.4,
      });
      const group = new THREE.Group();

      const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.28, 2.7, 6, 1), gold);

      const shoulderMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 1.15, 0.55, 6, 1),
        gold
      );
      shoulderMesh.position.y = 1.6;

      const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.34, 6, 1), gold);
      neckMesh.position.y = 2.0;

      // Bouchon taillé, même langage à six pans que le corps.
      const stopperMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.42, 0.72, 6, 1), gold);
      stopperMesh.position.y = 2.53;

      const parts = [bodyMesh, shoulderMesh, neckMesh, stopperMesh];
      group.add(...parts);
      // Sur large écran, le flacon glisse vers la droite : la colonne de
      // gauche revient au texte. Sur mobile, il reste centré.
      const baseX = wide ? 1 : 0;
      const baseY = -0.55;
      group.position.set(baseX, baseY, 0);
      group.scale.setScalar(0.95);
      scene.add(group);

      // ── Lumières directes : elles ajoutent les hautes lumières nettes que
      //    l'environnement seul ne donne pas. ──
      const key = new THREE.DirectionalLight(0xffd9a2, 2.6);
      key.position.set(5, 6, 5);
      const rim = new THREE.PointLight(0xc89b3c, 60, 30, 2);
      rim.position.set(-3.5, 1.5, -4);
      const fill = new THREE.DirectionalLight(0x7080b0, 0.6);
      fill.position.set(-5, -3, 3);
      scene.add(key, rim, fill);

      // ── État piloté par le défilement + le pointeur ──
      const s = { progress: 0, px: 0, py: 0, rotY: 0, rotX: 0.1 };

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
      });
      ro.observe(mount);

      let onScreen = true;
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
      });
      io.observe(mount);

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const idle = reduced ? () => 0 : () => performance.now() * 0.00007;

      const draw = () => {
        const targetY = s.progress * Math.PI * 1.7 + s.px * 0.2 + idle();
        const targetX = 0.08 + s.progress * 0.16 + s.py * -0.08;
        s.rotY = lerp(s.rotY, targetY, 0.09);
        s.rotX = lerp(s.rotX, targetX, 0.09);
        group.rotation.set(s.rotX, s.rotY, 0);
        group.position.y = baseY + (reduced ? 0 : Math.sin(performance.now() * 0.0009) * 0.05);
        renderer.render(scene, camera);
      };

      const disposeCore = () => {
        st.kill();
        ro.disconnect();
        io.disconnect();
        if (!coarse) window.removeEventListener('pointermove', onPointer);
        parts.forEach((m) => m.geometry.dispose());
        gold.dispose();
        envRT.dispose();
        pmrem.dispose();
        envDispose.forEach((d) => d.dispose());
        renderer.dispose();
        canvas.remove();
      };

      if (reduced) {
        draw();
        teardown = disposeCore;
        return;
      }

      const tick = () => {
        if (onScreen && !document.hidden) draw();
      };
      gsap.ticker.add(tick);
      teardown = () => {
        gsap.ticker.remove(tick);
        disposeCore();
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
            'radial-gradient(40% 44% at 58% 46%, rgba(200,155,60,0.20) 0%, transparent 72%)',
        }}
      />
    </div>
  );
}
