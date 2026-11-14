# gustavo schober · personal site

Astro 7 + TypeScript, static output. The on-screen keyboard is a React island.

```bash
nvm use            # Node 24 (.nvmrc); Astro 7 needs >= 22.23.4
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + static build into dist/
```

## Where things live

| What | File |
|---|---|
| Links (GitHub, LinkedIn, CV), keyboard routes, specs, commits | `src/data/site.ts` |
| AI logos in the closing line (swap order and icons) | `src/components/Closing.astro`, `src/assets/ai/` |
| Projects (one Markdown file each) | `src/content/projects/` |
| Experience | `src/content/experience/` |
| Home sections | `src/components/Hero.astro`, `Changelog.astro`, `KeyboardNav.tsx`, `Closing.astro` |
| Contour background, theme toggle, home motion | `src/scripts/` |
| Styles and both themes | `src/styles/global.css` |
| CV served at `/cv.pdf` | `public/cv.pdf` |

A new keyboard route is one line in `ROUTES`; the suggestion bubble picks it up.

## Credits

Keyboard adapted from [VengeanceUI](https://github.com/Ashutoshx7/VengeanceUI) `interactive-keyboard`, MIT, © 2025-2026 Ashutoshx7 (`licenses/VengeanceUI-MIT.txt`).
