// Contour field behind every page (marching squares over a sum of waves) that bulges under the pointer.
const cv = document.getElementById('topo') as HTMLCanvasElement | null;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (cv) {
  const ctx = cv.getContext('2d')!;
  const S = 12;            // cell size in px
  const R2 = 170 * 170;    // pointer bump radius²
  let W = 0, H = 0, t = 0, raf = 0, last = 0;
  let col = '', aMinor = 0, aMajor = 0;
  const m = { x: -9999, y: -9999, tx: -9999, ty: -9999, k: 0, tk: 0 }; // eased pointer and bump strength

  const field = (x: number, y: number) => {
    const v = Math.sin(x * 0.0085 + t) * 1.1 + Math.cos(y * 0.011 - t * 0.7) + Math.sin((x + y) * 0.005 + t * 0.4) * 1.3
      + Math.cos(Math.hypot(x - W * 0.72, y - H * 0.3) * 0.014 - t) * 0.8;
    const dx = x - m.x, dy = y - m.y;
    return v + m.k * 2.4 * Math.exp(-(dx * dx + dy * dy) / R2);
  };

  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    col = s.getPropertyValue('--contour').trim();
    aMinor = +s.getPropertyValue('--contour-a');
    aMajor = +s.getPropertyValue('--contour-b');
  };

  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const nx = Math.ceil(W / S) + 1, ny = Math.ceil(H / S) + 1, g = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g[j * nx + i] = field(i * S, j * S);
    for (let L = -3.6, k = 0; L <= 4.4; L += 0.45, k++) {
      const major = k % 4 === 0;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${col},${major ? aMajor : aMinor})`;
      ctx.lineWidth = major ? 1.1 : 0.8;
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const a = g[j * nx + i], b = g[j * nx + i + 1], c = g[(j + 1) * nx + i + 1], d = g[(j + 1) * nx + i];
        if ((a > L) === (b > L) && (b > L) === (c > L) && (c > L) === (d > L)) continue;
        const x = i * S, y = j * S, p: number[] = [];
        if ((a > L) !== (b > L)) p.push(x + (S * (L - a)) / (b - a), y);
        if ((b > L) !== (c > L)) p.push(x + S, y + (S * (L - b)) / (c - b));
        if ((d > L) !== (c > L)) p.push(x + (S * (L - d)) / (c - d), y + S);
        if ((a > L) !== (d > L)) p.push(x, y + (S * (L - a)) / (d - a));
        for (let q = 0; q + 3 < p.length; q += 4) { ctx.moveTo(p[q], p[q + 1]); ctx.lineTo(p[q + 2], p[q + 3]); }
      }
      ctx.stroke();
    }
  };

  const loop = (ts: number) => {
    raf = requestAnimationFrame(loop);
    if (ts - last < 33) return; // ~30 fps is plenty for a slow drift
    last = ts;
    t += 0.006;
    m.x += (m.tx - m.x) * 0.12; m.y += (m.ty - m.y) * 0.12; m.k += (m.tk - m.k) * 0.08;
    draw();
  };

  addEventListener('pointermove', (e) => {
    if (m.x < -999) { m.x = e.clientX; m.y = e.clientY; }
    m.tx = e.clientX; m.ty = e.clientY; m.tk = 1;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { m.tk = 0; });
  addEventListener('resize', () => { size(); if (reduce) draw(); });
  addEventListener('themechange', () => { readColors(); if (reduce) draw(); });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
  });

  size(); readColors(); draw();
  if (!reduce) raf = requestAnimationFrame(loop);
}

export {}; // module scope, so constants do not leak between scripts
