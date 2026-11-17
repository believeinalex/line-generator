# Line

Type an NBA player, get a shareable image of their 9-category fantasy stat line from their last game
(or pick any other game this season). Each stat gets a small tier icon (awful → elite) showing how the
number compares to a typical NBA rotation player.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # parser + z-score tests
npm run build   # production build (deploys to Vercel with zero config)
```

## How it works

- `app/api/*` proxies ESPN's unofficial JSON (player search, game log, league per-game stats) so the browser never hits CORS.
- `lib/espn.ts` parses ESPN responses; `lib/baseline.ts` turns the league table into a rotation-player baseline and z-scores each category (FG%/FT% by volume-weighted impact, turnovers inverted).
- `components/cards/FleerCard.tsx` is the 1080×1350 card; `components/ShareButtons.tsx` rasterises it with `html-to-image` for Download / Copy / Share.

ESPN's endpoints are unofficial and can change without notice. All parsing lives in `lib/espn.ts` and `lib/baseline.ts`, with fixtures in `tests/fixtures/`.
