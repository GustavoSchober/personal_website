import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractiveKeyboard } from './InteractiveKeyboard';
import { ROUTES } from '../data/site';

const WORDS = Object.keys(ROUTES);
const fits = (s: string) => WORDS.some((w) => w.startsWith(s));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Type a route name (physically or on screen) and the page opens it. */
export default function KeyboardNav() {
  const [typed, setTyped] = useState('');
  const [opening, setOpening] = useState<string | null>(null);
  const [hint, setHint] = useState(WORDS[0]);
  const [hintShown, setHintShown] = useState(true);
  const [active, setActive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const buf = useRef('');
  const busy = useRef(false);
  const lastKey = useRef(0);

  // physical keys count only while the keyboard is on screen
  useEffect(() => {
    const kb = root.current?.querySelector('.ikb-keyboard');
    if (!kb) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.5 });
    io.observe(kb);
    return () => io.disconnect();
  }, []);

  // coming back with the browser's Back button restores a fresh keyboard
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      buf.current = ''; busy.current = false;
      setTyped(''); setOpening(null);
    };
    addEventListener('pageshow', reset);
    return () => removeEventListener('pageshow', reset);
  }, []);

  // suggestion bubble: types each word, holds, fades, next; quiet while the visitor types
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let alive = true;
    (async () => {
      for (let i = 0; alive; i = (i + 1) % WORDS.length) {
        while (alive && Date.now() - lastKey.current < 4000) await wait(500);
        const w = WORDS[i];
        setHintShown(true);
        for (let c = 1; c <= w.length && alive; c++) { setHint(w.slice(0, c)); await wait(75); }
        await wait(2600);
        setHintShown(false);
        await wait(450);
      }
    })();
    return () => { alive = false; };
  }, []);

  const go = (word: string) => {
    busy.current = true;
    setOpening(word);
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520;
    setTimeout(() => {
      const url = ROUTES[word];
      if (url.startsWith('/') && !url.endsWith('.pdf')) { location.href = url; return; }
      // other sites and the CV open in a new tab, like the links elsewhere on the page; a blocked popup falls back to this tab
      const tab = window.open(url, '_blank');
      if (!tab) { location.href = url; return; }
      tab.opener = null;
      buf.current = ''; busy.current = false;
      setTyped(''); setOpening(null);
    }, delay);
  };

  const onKey = useCallback((name: string) => {
    if (busy.current) return;
    lastKey.current = Date.now();
    let b = buf.current;
    if (name === 'delete') b = b.slice(0, -1);
    else if (name === 'esc') b = '';
    else if (name === 'return') { if (ROUTES[b]) go(b); return; }
    else {
      const ch = name === 'space' ? ' ' : name.replace(/^numpad /, '');
      if (ch.length !== 1) return;
      // a key that continues no word starts a new one if it can, otherwise it is ignored
      if (fits(b + ch)) b += ch; else if (fits(ch)) b = ch; else return;
    }
    buf.current = b;
    setTyped(b);
    if (ROUTES[b]) go(b);
  }, []);

  return (
    <div className="kb-nav" ref={root}>
      <div className={`hint${hintShown ? '' : ' gone'}`} aria-hidden="true">
        <span>try typing</span><q>{hint}</q><span className="caret" />
      </div>
      <p className={`typed${opening ? ' hit' : ''}`} aria-live="polite">
        <span className="pr" aria-hidden="true">&gt;</span>
        <span>{opening ? `opening ${opening}…` : typed}</span>
        <span className="caret" aria-hidden="true" />
      </p>
      <InteractiveKeyboard active={active} onKeyClick={onKey} onKeyPress={onKey} />
    </div>
  );
}
