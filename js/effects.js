/* =========================================================
   effects.js — loads AFTER script.js (which stays unchanged).
   Adds: boot intro, smooth scroll, 3D scroll-driven background,
   hover tilt, scroll staggers, text scramble.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  let lenis = null;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Smooth scroll ---------- */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });

    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    // in-page links (#fixit, #contact, #top) glide instead of jumping
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(id === '#top' ? 0 : target, { offset: -30 });
      });
    });
  }

  /* ---------- 2. Text scramble ---------- */
  function scramble(el) {
    if (!el) return;
    const finalText = el.textContent;
    const glyphs = 'abcdefghijklmnopqrstuvwxyz#/+_<>';
    const total = finalText.length * 3;
    let f = 0;
    el.setAttribute('aria-label', finalText);
    const id = setInterval(() => {
      el.textContent = [...finalText]
        .map((c, i) => (c === ' ' || i < f / 3 ? c : glyphs[(Math.random() * glyphs.length) | 0]))
        .join('');
      if (++f > total) { clearInterval(id); el.textContent = finalText; }
    }, 35);
  }

  function intro() {
    if (reduce) return;
    scramble(document.querySelector('.hero-title'));
    scramble(document.querySelector('.display-name'));
  }

  /* ---------- 3. Boot intro (once per browser session) ---------- */
  const boot = document.getElementById('boot');
  let finished = false;

  function finishBoot() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem('booted', '1'); } catch (e) {}
    if (boot) {
      boot.classList.add('done');
      setTimeout(() => boot.remove(), 1000);
    }
    if (lenis) lenis.start();
    intro();
  }

  function runBoot() {
    if (!boot || reduce || root.classList.contains('no-boot')) {
      if (boot) boot.remove();
      intro();
      return;
    }
    if (lenis) lenis.stop();

    const lines = ['> mounting archive', '> loading identity: tanish_saini', '> calibrating signal', '> ready_'];
    const log = document.getElementById('bootLog');
    const bar = document.getElementById('bootBar');
    const count = document.getElementById('bootCount');

    let i = 0;
    const typer = setInterval(() => {
      log.textContent += (i ? '\n' : '') + lines[i];
      if (++i >= lines.length) clearInterval(typer);
    }, 380);

    const start = performance.now();
    const dur = 1800;
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      count.textContent = String(Math.round(e * 100)).padStart(3, '0');
      bar.style.transform = `scaleX(${e})`;
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(finishBoot, 250);
    })(start);

    setTimeout(finishBoot, 5000); // safety net
  }

  /* ---------- 4. 3D background (Three.js) ---------- */
  function initScene() {
    const canvas = document.getElementById('bg3d');
    if (!canvas || !window.THREE) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (err) { canvas.remove(); return; }

    const small = innerWidth < 700;
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 9;

    const ink = 0xe9e5d9; // same as --accent
    const rig = new THREE.Group();
    scene.add(rig);

    const outer = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.8, 1),
      new THREE.MeshBasicMaterial({ color: ink, wireframe: true, transparent: true, opacity: 0.33 })
    );
    const inner = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.MeshBasicMaterial({ color: ink, wireframe: true, transparent: true, opacity: 0.28 })
    );
    rig.add(outer, inner);

    const n = small ? 350 : 900;
    const arr = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const r = 6 + Math.random() * 10;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[k * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[k * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      arr[k * 3 + 2] = r * Math.cos(ph);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: ink, size: 0.035, transparent: true, opacity: 0.55 })
    );
    scene.add(dust);

    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      if (reduce) frame();
    }

    const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    addEventListener('pointermove', (e) => {
      tgt.x = e.clientX / innerWidth - 0.5;
      tgt.y = e.clientY / innerHeight - 0.5;
    }, { passive: true });

    let spCur = 0;
    function frame() {
      const max = root.scrollHeight - innerHeight;
      const sp = max > 0 ? scrollY / max : 0;       // 0 → 1 down the page
      spCur += (sp - spCur) * 0.08;
      cur.x += (tgt.x - cur.x) * 0.05;
      cur.y += (tgt.y - cur.y) * 0.05;

      const t = performance.now() * 0.00015;
      outer.rotation.set(t * 0.6 + spCur * Math.PI * 1.2 + cur.y * 0.6,
                         t + spCur * Math.PI * 2 + cur.x * 0.8, 0);
      inner.rotation.set(-t * 1.4, -t * 0.9 - spCur * Math.PI * 3, 0);
      dust.rotation.y = t * 0.4 + cur.x * 0.15;
      dust.rotation.x = cur.y * 0.1;

      camera.position.z = 9 - spCur * 3.2;          // dolly in while scrolling
      rig.position.y = spCur * 1.2 - 0.4;

      renderer.render(scene, camera);
    }

    addEventListener('resize', resize);
    resize();
    if (!reduce) renderer.setAnimationLoop(frame);
  }

  /* ---------- 5. Hover tilt (mouse only) ---------- */
  function initTilt() {
    if (reduce || !matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.media-card, .terminal').forEach((el) => {
      const lift = el.classList.contains('media-card') ? -6 : 0;
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .12s ease-out, border-color .4s ease';
        el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(${lift}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  }

  /* ---------- 6. Scroll-triggered motion (GSAP) ---------- */
  function initScroll() {
    if (reduce || !hasGSAP) return;

    gsap.from('.tag-grid span', {
      opacity: 0, y: 18, duration: 0.6, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: '.tag-grid', start: 'top 88%' }
    });

    gsap.from('.project-meta > div', {
      opacity: 0, x: -24, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.project-meta', start: 'top 88%' }
    });

    // scrubbed by scroll position: letters tighten as the contact title arrives
    gsap.fromTo('.contact-title',
      { letterSpacing: '0.12em', opacity: 0.25 },
      {
        letterSpacing: '-0.01em', opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.contact', start: 'top 95%', end: 'top 45%', scrub: true }
      });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  /* ---------- go ---------- */
  try { initScene(); } catch (err) { console.warn('3D background skipped:', err); }
  initTilt();
  initScroll();
  runBoot();
})();
