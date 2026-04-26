// ── STONEHAWKER COFFEE · site.js v3 ──────────────────────────────────

// ── FABRIC PATHS ─────────────────────────────────────────────────────
const FABRICS = {
  lago:    'uploads/Screenshot_20260423-134009 (1).png',    // orange border
  quetzal: 'uploads/Screenshot_20260423-133916 (1).png',   // purple border
  xocomil: 'uploads/Screenshot_20260423-133742.png',       // gray/dark border
  master:  'uploads/Compressed-Screenshot_20260423-144618-ee372da3.jpg', // black bg + rainbow
};

// ── ROAST DATA ────────────────────────────────────────────────────────
const ROASTS = {
  lago: {
    name: 'LAGO', subtitle: 'LIGHT ROAST',
    roastDate: 'April 15, 2026',
    borderColor: '#C87818',
    labelAccent: '#D48A20',
    tasteNotes: ['Jasmine', 'White Peach', 'Honey Citrus'],
    process: 'Washed · Sun-dried on raised beds',
  },
  quetzal: {
    name: 'QUETZAL', subtitle: 'MEDIUM ROAST',
    roastDate: 'April 17, 2026',
    borderColor: '#8A1878',
    labelAccent: '#C020A0',
    tasteNotes: ['Dark Cherry', 'Baker\'s Chocolate', 'Roasted Almond'],
    process: 'Washed · Natural ferment · Raised bed dried',
  },
  xocomil: {
    name: 'XOCOMIL', subtitle: 'DARK ROAST',
    roastDate: 'April 20, 2026',
    borderColor: '#4A4040',
    labelAccent: '#9A9090',
    tasteNotes: ['Black Cocoa', 'Smoked Cedar', 'Dark Molasses'],
    process: 'Natural process · Extended ferment',
  }
};

// ── LOAD IMAGE HELPER ─────────────────────────────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load: ' + src));
    img.src = src;
  });
}

// ── DRAW BAG (v1-faithful) ────────────────────────────────────────────
async function drawBag(canvas, roastKey) {
  const roast = ROASTS[roastKey];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const CW = canvas.offsetWidth  || 160;
  const CH = canvas.offsetHeight || 230;
  canvas.width  = CW * DPR;
  canvas.height = CH * DPR;

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const W = CW, H = CH;
  const FABRIC_H = H * 0.60;   // upper 60% = fabric photo
  const LABEL_H  = H * 0.40;   // lower 40% = black label
  const LABEL_Y  = FABRIC_H;

  // ── BAG CLIP (simple rounded rect via beginPath) ──
  const BL = W * 0.07, BR = W * 0.93;
  const BT = H * 0.04, BB = H * 0.94;
  const CR = 10;

  function traceBag() {
    ctx.beginPath();
    ctx.moveTo(BL + CR, BT);
    ctx.lineTo(BR - CR, BT);
    ctx.arcTo(BR, BT, BR, BT + CR, CR);
    ctx.lineTo(BR, BB - CR);
    ctx.arcTo(BR, BB, BR - CR, BB, CR);
    ctx.lineTo(BL + CR, BB);
    ctx.arcTo(BL, BB, BL, BB - CR, CR);
    ctx.lineTo(BL, BT + CR);
    ctx.arcTo(BL, BT, BL + CR, BT, CR);
    ctx.closePath();
  }

  ctx.save();
  traceBag();
  ctx.clip();

  // ── FABRIC PHOTO (upper panel) ──
  try {
    const fabricImg = await loadImage(FABRICS[roastKey]);
    // Crop center of fabric for best visual
    const srcAR = fabricImg.width / fabricImg.height;
    const dstAR = W / FABRIC_H;
    let sx, sy, sw, sh;
    if (srcAR > dstAR) {
      sh = fabricImg.height;
      sw = sh * dstAR;
      sx = (fabricImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = fabricImg.width;
      sh = sw / dstAR;
      sx = 0;
      sy = (fabricImg.height - sh) / 4; // bias toward top (more chevrons visible)
    }
    ctx.drawImage(fabricImg, sx, sy, sw, sh, 0, 0, W, FABRIC_H);
  } catch (e) {
    // Fallback gradient if image fails
    const grad = ctx.createLinearGradient(0, 0, W, FABRIC_H);
    grad.addColorStop(0, '#1a0a02');
    grad.addColorStop(1, '#0a1418');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, FABRIC_H);
  }

  // ── SUBTLE GRADIENT TRANSITION fabric→label ──
  const fade = ctx.createLinearGradient(0, FABRIC_H - 24, 0, FABRIC_H + 2);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, FABRIC_H - 24, W, 28);

  // ── BLACK LABEL PANEL ──
  ctx.fillStyle = '#080504';
  ctx.fillRect(0, LABEL_Y, W, LABEL_H);

  // ── LABEL TYPOGRAPHY ──
  const cx = W / 2;

  // BRAND NAME
  ctx.fillStyle = '#F0E8D8';
  ctx.font = `500 ${W * 0.115}px 'DM Sans', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${W * 0.018}px`;
  ctx.fillText('STONEHAWKER', cx, LABEL_Y + LABEL_H * 0.22);
  ctx.letterSpacing = '0px';

  // COFFEE
  ctx.fillStyle = '#C8B898';
  ctx.font = `300 ${W * 0.072}px 'DM Sans', system-ui, sans-serif`;
  ctx.letterSpacing = `${W * 0.025}px`;
  ctx.fillText('COFFEE', cx, LABEL_Y + LABEL_H * 0.36);
  ctx.letterSpacing = '0px';

  // Thin gold rule
  ctx.strokeStyle = roast.labelAccent;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, LABEL_Y + LABEL_H * 0.42);
  ctx.lineTo(W * 0.8, LABEL_Y + LABEL_H * 0.42);
  ctx.stroke();

  // GUATEMALA (gold)
  ctx.fillStyle = roast.labelAccent;
  ctx.font = `500 ${W * 0.082}px 'DM Sans', system-ui, sans-serif`;
  ctx.letterSpacing = `${W * 0.012}px`;
  ctx.fillText('GUATEMALA', cx, LABEL_Y + LABEL_H * 0.57);
  ctx.letterSpacing = '0px';

  // LAKE ATITLÁN
  ctx.fillStyle = '#B0A090';
  ctx.font = `300 ${W * 0.057}px 'DM Sans', system-ui, sans-serif`;
  ctx.fillText('LAKE ATITLÁN', cx, LABEL_Y + LABEL_H * 0.69);

  // Single Origin
  ctx.fillStyle = '#887870';
  ctx.font = `300 italic ${W * 0.052}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillText('Single Origin', cx, LABEL_Y + LABEL_H * 0.79);

  // Small Batch Roasted (teal)
  ctx.fillStyle = '#1A9AB8';
  ctx.font = `300 ${W * 0.044}px 'DM Sans', system-ui, sans-serif`;
  ctx.letterSpacing = `${W * 0.006}px`;
  ctx.fillText('Small Batch Roasted', cx, LABEL_Y + LABEL_H * 0.88);
  ctx.letterSpacing = '0px';

  // ── BOTTOM BORDER STRIP (Maya chevron repeat) ──
  const bY = LABEL_Y + LABEL_H * 0.91;
  const bH = LABEL_H * 0.08;
  // Micro chevron repeat
  const chevColors = ['#E0187A','#1A9AB8','#7CC800','#C88010','#1A38C0','#D85A18'];
  const chevW = W / chevColors.length;
  chevColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * chevW, bY, chevW, bH * 0.4);
  });

  ctx.restore();

  // ── BAG BORDER (roast-specific color) ──
  ctx.save();
  traceBag();
  ctx.strokeStyle = roast.borderColor;
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.restore();

  // ── SHINE HIGHLIGHT ──
  ctx.save();
  traceBag();
  ctx.clip();
  const shine = ctx.createLinearGradient(W * 0.08, 0, W * 0.42, H * 0.55);
  shine.addColorStop(0, 'rgba(255,255,255,0.10)');
  shine.addColorStop(0.35, 'rgba(255,255,255,0.03)');
  shine.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // ── GAS VALVE ──
  ctx.save();
  traceBag();
  ctx.clip();
  const vx = W * 0.5, vy = LABEL_Y + LABEL_H * 0.95;
  ctx.beginPath(); ctx.arc(vx, vy, 5, 0, Math.PI*2);
  ctx.fillStyle = roast.labelAccent + '88'; ctx.fill();
  ctx.beginPath(); ctx.arc(vx, vy, 3.5, 0, Math.PI*2);
  ctx.fillStyle = '#080504'; ctx.fill();
  ctx.restore();
}

// ── INIT ALL BAGS ─────────────────────────────────────────────────────
async function initBags() {
  const canvases = document.querySelectorAll('[data-bag]');
  await Promise.all([...canvases].map(c => drawBag(c, c.dataset.bag)));
}

// ── THREE.JS HERO PARTICLES ───────────────────────────────────────────
function initHeroParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  const count = 3200;
  const positions = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);
  const aColors   = new Float32Array(count * 3);

  // Colors pulled from the four fabric photos
  const palette = [
    [0.878, 0.094, 0.478], // #E0187A hot pink
    [0.102, 0.604, 0.722], // #1A9AB8 teal
    [0.486, 0.784, 0.000], // #7CC800 lime
    [0.784, 0.502, 0.063], // #C88010 amber
    [0.847, 0.353, 0.094], // #D85A18 orange
    [0.769, 0.094, 0.125], // #C41820 crimson
    [0.102, 0.220, 0.753], // #1A38C0 royal blue
    [0.000, 0.706, 0.784], // #00B4C8 cyan
    [0.941, 0.784, 0.000], // #F0C800 yellow
    [0.941, 0.600, 0.000], // #F09800 orange-gold
    [0.600, 0.000, 0.600], // magenta-purple
  ];

  for (let i = 0; i < count; i++) {
    const r = 4.5 + Math.random() * 11;
    const theta = Math.random() * Math.PI * 2;
    const phi   = (Math.random() - 0.5) * Math.PI * 0.6;
    positions[i*3]   = r * Math.cos(theta) * Math.cos(phi);
    positions[i*3+1] = r * Math.sin(phi) * 1.5;
    positions[i*3+2] = r * Math.sin(theta) * Math.cos(phi);
    sizes[i] = Math.random() * 3 + 0.5;
    const c = palette[Math.floor(Math.random() * palette.length)];
    aColors[i*3]   = c[0];
    aColors[i*3+1] = c[1];
    aColors[i*3+2] = c[2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aColor',   new THREE.BufferAttribute(aColors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uMouse:  { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 aColor;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uScroll;
      void main() {
        vColor = aColor;
        vec3 pos = position;
        pos.x += sin(uTime * 0.28 + position.y * 0.6) * 0.2;
        pos.y += cos(uTime * 0.22 + position.x * 0.5) * 0.14;
        pos.z += sin(uTime * 0.18 + position.x * 0.4) * 0.14;
        pos.x += uMouse.x * (pos.z * 0.07);
        pos.y += uMouse.y * (pos.z * 0.07);
        pos.y -= uScroll * 3.5;
        vAlpha = 1.0 - smoothstep(0.0, 0.45, uScroll);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (340.0 / -gl_Position.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float alpha = 1.0 - smoothstep(0.3, 0.5, d);
        gl_FragColor = vec4(vColor, alpha * 0.8 * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = -(e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uMouse.value.x += (mx - mat.uniforms.uMouse.value.x) * 0.04;
    mat.uniforms.uMouse.value.y += (my - mat.uniforms.uMouse.value.y) * 0.04;
    mat.uniforms.uScroll.value += (window.scrollY / window.innerHeight - mat.uniforms.uScroll.value) * 0.08;
    points.rotation.y = t * 0.025;
    points.rotation.x = Math.sin(t * 0.08) * 0.06;
    renderer.render(scene, camera);
  }
  animate();
}

// ── SCROLL REVEAL ─────────────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.09 });
  els.forEach(el => io.observe(el));
}

// ── NAV ───────────────────────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
}

// ── HERO ENTRANCE ─────────────────────────────────────────────────────
function initHeroEntrance() {
  const els = [
    { sel: '.hero-eyebrow', delay: 350  },
    { sel: '.hero-title',   delay: 650  },
    { sel: '.hero-sub',     delay: 1050 },
    { sel: '.hero-actions', delay: 1400 },
  ];
  els.forEach(({ sel, delay }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    setTimeout(() => {
      el.style.transition = 'opacity 1s ease, transform 1s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  });
}

// ── GSAP SCROLL EFFECTS ───────────────────────────────────────────────
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.volcano-scene', {
    yPercent: -14, ease: 'none',
    scrollTrigger: { trigger: '#origin', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
  });

  gsap.from('.pillar', {
    y: 40, opacity: 0, stagger: 0.15, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.volcanic-pillars', start: 'top 80%' }
  });

  gsap.from('.review-card', {
    y: 50, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.reviews-grid', start: 'top 82%' }
  });

  gsap.from('.t-step', {
    y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.timeline', start: 'top 80%' }
  });
}

// ── SIZE TOGGLE ───────────────────────────────────────────────────────
function initSizeToggles() {
  document.querySelectorAll('.size-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.roast-card');
      card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      card.querySelector('.roast-price-num').textContent = '$' + btn.dataset.price;
      card.querySelector('.size-label').textContent = btn.dataset.label;
    });
  });
}

// ── EMAIL FORM ────────────────────────────────────────────────────────
function handleEmail(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.email-submit');
  btn.textContent = "You're in. Watch your inbox.";
  btn.style.background = '#1A9AB8';
  btn.style.color = '#fff';
  e.target.querySelector('.email-input').value = '';
  setTimeout(() => { btn.textContent = 'Get Early Access'; btn.style.background = ''; btn.style.color = ''; }, 5000);
}

// ── INIT ──────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  initHeroParticles();
  initHeroEntrance();
  initReveal();
  initNav();
  initGSAP();
  initSizeToggles();
  initBags();
});

window.handleEmail = handleEmail;
