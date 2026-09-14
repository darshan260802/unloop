# Unloop

An installable, offline-first Angular PWA with four gentle miniature puzzle worlds for focused 5–10 minute breaks. Unloop has no account, backend, ads, ranks, streaks, or public network API. Preferences, active play, and the latest 100 summaries stay in local browser storage.

## Run locally

Requirements: Bun 1.3+ and a current Node.js LTS runtime.

```bash
bun install
bun start
```

Open http://localhost:4200. Development mode does not enable the service worker.

## Production build

```bash
bun run build
```

Serve the generated `dist/mental-mania/browser` directory over HTTPS. Configure the host to fall back all extensionless routes to `index.html`. Do not cache `ngsw.json` at the CDN; Angular's service worker manages app-shell and lazy-game caching.

Examples:

- Netlify: publish `dist/mental-mania/browser` and add `/* /index.html 200`.
- Cloudflare Pages: build with `bun run build`, output `dist/mental-mania/browser`.
- Firebase Hosting: set `public` to the browser output and rewrite `**` to `/index.html`.

## Install and offline use

Visit the HTTPS deployment once and wait for the install prompt. Chrome/Edge expose Install directly. On iOS Safari, use Share → Add to Home Screen. Offline readiness is shown only after the service worker controls the app; all lazy game bundles, styles, icons, and shell files are prefetched.

Updates are offered outside the game surface. Accepting an update activates the cached version and reloads; versioned local records remain compatible.

## Controls

Every world supports pointer and keyboard activation. Pause, hint, undo, reset, skip, and finish controls remain available without penalties. Hints reset the next difficulty to gentle. The clock counts active play only and pauses when the page is hidden.
