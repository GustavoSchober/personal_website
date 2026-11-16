// Home-page motion: the AI logo swap, counting specs and the changelog reveal.
// Final values are already in the HTML, so with reduced motion or no JS everything simply rests.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduce) (document.querySelector('.dag') as SVGSVGElement | null)?.pauseAnimations();

// Hero name: every letter rolls through the alphabet from A and lands on its own letter (G = A…G).
const name = document.querySelector<HTMLElement>('.name');
if (name && !reduce) {
  const original = name.innerHTML, AZ = 'abcdefghijklmnopqrstuvwxyz';
  const cells: { el: HTMLSpanElement; ch: string; k: number }[] = [];
  for (const node of [...name.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const frag = document.createDocumentFragment();
    for (const ch of node.textContent ?? '') {
      const el = document.createElement('span');
      el.textContent = ch;
      const k = AZ.indexOf(ch.toLowerCase());
      if (k >= 0) { el.className = 'roll'; cells.push({ el, ch, k }); }
      frag.append(el);
    }
    node.replaceWith(frag);
  }
  const at = (c: (typeof cells)[number], i: number) => { const a = AZ[i]; return c.ch === c.ch.toUpperCase() ? a.toUpperCase() : a; };
  cells.forEach((c) => (c.el.textContent = at(c, 0)));
  void name.offsetWidth; // layout now, so the display font starts loading and fonts.ready waits for it
  document.fonts.ready.then(() => {
    // fix each cell to its final glyph width so the line does not wobble while letters change (same task, never painted)
    cells.forEach((c) => (c.el.textContent = c.ch));
    cells.forEach((c) => (c.el.style.width = `${c.el.getBoundingClientRect().width}px`));
    cells.forEach((c) => (c.el.textContent = at(c, 0)));
    const t0 = performance.now(), DUR = 1300, STAGGER = 45;
    const step = (t: number) => {
      let done = true;
      cells.forEach((c, n) => {
        const p = Math.min(1, Math.max(0, (t - t0 - n * STAGGER) / DUR));
        if (p < 1) done = false;
        const ch = at(c, Math.round(c.k * (1 - Math.pow(1 - p, 3)))); // ease-out, like a spring with no bounce
        if (c.el.textContent !== ch) c.el.textContent = ch;
      });
      if (done) name.innerHTML = original; // back to plain text, kerning included
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// Closing statement: "Your <AI> generates the SQL." cycles through AI logos every 2.5 s.
const ai = document.querySelectorAll('.ai-swap > span');
if (ai.length && !reduce) {
  let i = 0;
  setInterval(() => {
    ai[i].classList.remove('on');
    i = (i + 1) % ai.length;
    ai[i].classList.add('on');
  }, 2500);
}

const log = document.querySelector<HTMLElement>('.commits');
log?.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', String(i)));

if (reduce || !('IntersectionObserver' in window)) {
  log?.classList.add('play');
} else {
  const count = (el: HTMLElement) => {
    const end = Number(el.dataset.count), suf = el.dataset.suf ?? '', t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1200), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = (v < 0 ? `−${Math.abs(v)}` : v) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    if (e.target === log) log.classList.add('play');
    else count(e.target as HTMLElement);
  }), { threshold: 0.35 });
  document.querySelectorAll('[data-count]').forEach((el) => io.observe(el));
  if (log) io.observe(log);
}

export {}; // module scope, so constants do not leak between scripts
