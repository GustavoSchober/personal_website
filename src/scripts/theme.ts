// The stored choice is applied before paint by the inline script in Base.astro; this wires the toggle.
const root = document.documentElement;
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : darkQuery.matches);

function label() {
  const dark = isDark();
  document.querySelectorAll<HTMLButtonElement>('.theme').forEach((btn) => {
    btn.querySelector('span')!.textContent = dark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  });
}

document.querySelectorAll('.theme').forEach((btn) =>
  btn.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    label();
    dispatchEvent(new Event('themechange'));
  }),
);
darkQuery.addEventListener('change', () => { label(); dispatchEvent(new Event('themechange')); });
label();

export {}; // module scope, so constants do not leak between scripts
