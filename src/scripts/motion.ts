// Home-page motion: the AI logo swap, counting specs and the changelog reveal.
// Final values are already in the HTML, so with reduced motion or no JS everything simply rests.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduce) (document.querySelector('.dag') as SVGSVGElement | null)?.pauseAnimations();

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
