/* ============================================================
   THE LORD OF THE RINGS — Presentation Logic
   Slide navigation · Firefly canvas · Speaker notes
   ============================================================ */

(function () {
  'use strict';

  /* ---------- ELEMENTS ---------- */
  const slides     = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap   = document.getElementById('dots');
  const counterEl  = document.getElementById('counter');
  const progressEl = document.querySelector('.progress span');
  const notesPanel = document.getElementById('notes');
  const notesBody  = document.getElementById('notesBody');
  const notesBtn   = document.getElementById('notesToggle');
  const prevBtn    = document.getElementById('prev');
  const nextBtn    = document.getElementById('next');
  const deck       = document.getElementById('deck');

  const TOTAL = slides.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SPEAKER NOTES (your full script) ---------- */
  const SPEAKER_NOTES = [
    `Today, I would like to introduce one of the most famous fantasy stories in the world: The Lord of the Rings. It was written by J. R. R. Tolkien and later became a successful movie trilogy. The story takes place in a magical world called Middle-earth, filled with different creatures, beautiful kingdoms, powerful wizards and dangerous enemies. But behind all the magic, it tells us something deeper about friendship, courage and the power of hope.`,

    `The story begins in a peaceful place called the Shire, where a young hobbit named Frodo Baggins lives. One day, he receives a mysterious golden ring from his uncle Bilbo. At first, it seems like an ordinary object, but the wizard Gandalf discovers its terrible secret. It is the One Ring, created by the dark lord Sauron to control the world. If Sauron gets it back, darkness will cover all of Middle-earth.`,

    `To save the world, Frodo must take the ring to Mordor and destroy it in the fires of Mount Doom. He does not travel alone. His friends join him, including Sam, Gandalf, Aragorn, Legolas and Gimli. Together, they form the Fellowship of the Ring. Their journey is full of danger, difficult decisions and unexpected adventures. They must learn to trust each other because their mission is bigger than any one of them.`,

    `As the journey continues, the group faces many enemies and difficult situations. Eventually, the Fellowship separates, and Frodo and Sam continue towards Mordor together. The ring becomes heavier for Frodo, not because of its physical weight, but because of its dark power. Sam stays beside him and never gives up on his friend. Their friendship becomes one of the strongest parts of the story. It shows that sometimes, having one loyal friend is more valuable than having great power.`,

    `Finally, Frodo and Sam reach Mount Doom, where the ring was created. After a long and difficult journey, the One Ring is destroyed, and Sauron's power comes to an end. Middle-earth is saved, and peace returns. The heroes survive, but they are changed forever by everything they have experienced. Their victory shows that even the darkest moments can be overcome with courage and determination.`,

    `In my opinion, The Lord of the Rings is much more than a fantasy adventure. It teaches us about loyalty, sacrifice, friendship and hope. Frodo shows us that even an ordinary person can do something extraordinary. Sam reminds us that true friendship means staying beside someone, even when life becomes difficult. And I would like to finish with one important thought: You don't have to be powerful to be a hero. Sometimes, the smallest people can change the world.`
  ];

  /* ---------- STATE ---------- */
  let index = 0;
  let locked = false;
  const LOCK_MS = 480;

  /* ============================================================
     1. NAVIGATION
     ============================================================ */

  // Build the navigation dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i) {
    i = Math.max(0, Math.min(TOTAL - 1, i));
    if (i === index || locked) return;

    locked = true;
    window.setTimeout(() => { locked = false; }, LOCK_MS);

    const current = slides[index];
    current.classList.remove('active');
    current.setAttribute('aria-hidden', 'true');

    index = i;

    const nextSlide = slides[index];
    nextSlide.classList.add('active');
    nextSlide.setAttribute('aria-hidden', 'false');

    render();
  }

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function render() {
    // dots
    dots.forEach((d, i) => d.classList.toggle('active', i === index));

    // counter
    counterEl.textContent =
      String(index + 1).padStart(2, '0') + ' / ' + String(TOTAL).padStart(2, '0');

    // progress bar
    progressEl.style.transform = 'scaleX(' + ((index + 1) / TOTAL) + ')';

    // arrow states
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === TOTAL - 1;

    // speaker notes
    notesBody.textContent = SPEAKER_NOTES[index] || '';

    // canvas palette follows the scene
    document.body.dataset.scene = slides[index].dataset.scene || 'shire';
    recolorParticles();
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        next();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prev();
        break;

      case 'Home':
        e.preventDefault();
        goTo(0);
        break;

      case 'End':
        e.preventDefault();
        goTo(TOTAL - 1);
        break;

      case 'n':
      case 'N':
        e.preventDefault();
        toggleNotes();
        break;

      case 'Escape':
        notesPanel.classList.remove('open');
        notesBtn.setAttribute('aria-expanded', 'false');
        break;
    }
  });

  /* ---------- Touch swipe ---------- */
  let touchX = 0, touchY = 0, touchT = 0;

  deck.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchX = t.clientX;
    touchY = t.clientY;
    touchT = Date.now();
  }, { passive: true });

  deck.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;
    const dt = Date.now() - touchT;

    if (dt > 800) return;                          // too slow → not a swipe
    if (Math.abs(dx) < 55) return;                 // too short
    if (Math.abs(dx) < Math.abs(dy) * 1.4) return; // mostly vertical → scroll

    dx < 0 ? next() : prev();
  }, { passive: true });

  /* ---------- Speaker notes toggle ---------- */
  function toggleNotes() {
    const open = notesPanel.classList.toggle('open');
    notesBtn.setAttribute('aria-expanded', String(open));
  }

  notesBtn.addEventListener('click', toggleNotes);
  notesBtn.setAttribute('aria-expanded', 'false');

  /* ============================================================
     2. FIREFLY / EMBER CANVAS
     ============================================================ */

  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = 1;
  let particles = [];
  let rafId = null;
  let lastTime = 0;
  let clock = 0;

  const PALETTES = {
    shire:   ['212,175,55', '242,223,163', '130,205,155'],
    ring:    ['212,175,55', '247,231,168'],
    journey: ['230,214,160', '212,175,55', '180,215,190'],
    forest:  ['212,175,55', '255,215,130'],
    battle:  ['255,140,60', '212,175,55', '255,190,110'],
    dawn:    ['255,236,170', '212,175,55', '255,215,140']
  };

  /* Pre-rendered glow sprites (much faster than gradients per frame) */
  const glowCache = new Map();

  function glowSprite(rgb) {
    if (glowCache.has(rgb)) return glowCache.get(rgb);

    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;

    const g = c.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0,    'rgba(' + rgb + ',1)');
    grad.addColorStop(0.20, 'rgba(' + rgb + ',0.62)');
    grad.addColorStop(0.50, 'rgba(' + rgb + ',0.16)');
    grad.addColorStop(1,    'rgba(' + rgb + ',0)');

    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);

    glowCache.set(rgb, c);
    return c;
  }

  function currentPalette() {
    return PALETTES[document.body.dataset.scene] || PALETTES.shire;
  }

  function makeParticle(fromBottom) {
    const pal = currentPalette();
    return {
      x: Math.random() * W,
      y: fromBottom ? H + 30 : Math.random() * H,
      r: 1 + Math.random() * 2.6,
      rgb: pal[(Math.random() * pal.length) | 0],
      vx: (Math.random() - 0.5) * 0.20,
      vy: -(0.10 + Math.random() * 0.42),
      sway: 0.35 + Math.random() * 0.85,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.30 + Math.random() * 0.60,
      pulse: 0.55 + Math.random() * 1.7
    };
  }

  function spawnParticles() {
    const count = reduceMotion ? 20 : (W < 700 ? 42 : 68);
    particles = [];
    for (let i = 0; i < count; i++) particles.push(makeParticle(false));
  }

  function recolorParticles() {
    if (!particles.length) return;
    const pal = currentPalette();
    for (const p of particles) {
      p.rgb = pal[(Math.random() * pal.length) | 0];
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function drawFrame(now) {
    const dt = Math.min(50, now - lastTime) / 16.6667; // 1 = one 60fps frame
    lastTime = now;
    clock += dt * 0.016;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx * dt + Math.sin(clock * p.sway + p.phase) * 0.26 * dt;
      p.y += p.vy * dt;

      // respawn when a firefly floats off the top
      if (p.y < -50) {
        particles[i] = makeParticle(true);
        continue;
      }
      if (p.x < -50) p.x = W + 50;
      else if (p.x > W + 50) p.x = -50;

      const flicker = 0.55 + 0.45 * Math.sin(clock * p.pulse + p.phase);
      const size = p.r * 15 * (0.72 + flicker * 0.55);

      ctx.globalAlpha = p.alpha * flicker;
      ctx.drawImage(glowSprite(p.rgb), p.x - size / 2, p.y - size / 2, size, size);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    rafId = window.requestAnimationFrame(drawFrame);
  }

  function startLoop() {
    if (rafId !== null) return;
    lastTime = performance.now();
    rafId = window.requestAnimationFrame(drawFrame);
  }

  function stopLoop() {
    if (rafId === null) return;
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  /* Debounced resize */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resize();
      spawnParticles();
    }, 180);
  });

  /* Pause when tab is hidden (battery friendly) */
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopLoop() : startLoop();
  });

  /* ============================================================
     3. INIT
     ============================================================ */

  function init() {
    // Activate slide 1
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === 0);
      s.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    });

    document.body.dataset.scene = slides[0].dataset.scene || 'shire';

    // Canvas
    resize();
    spawnParticles();

    // UI
    render();

    // Go
    startLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
