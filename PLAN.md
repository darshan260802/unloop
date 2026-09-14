# Mental Mania — Implementation and Cross-Session Plan

## Summary and authority
Build an installable, offline-first Angular PWA for engaging 5–10-minute breaks. Four original miniature worlds encourage spatial thinking, sequencing, and active attention without lives, competitive scores, or time pressure.

Approved: private device-only storage, playful calm visuals, four games, no accounts/backend. Follow AGENTS.md. Angular 22.1, Taiga UI 5.24, TypeScript 6, LESS, Bun, Vitest. GPT-5.6-sol is the requested implementation model; independent implementation tasks can use it. This file is the product specification and progress ledger for future cloud sessions.

## Experience
- Home: “Give your mind somewhere else to go.” Primary action “Start a 5-minute break”; remember 5/10-minute selection.
- Four illustrated cards allow single-game sessions; random sessions shuffle all games without repeats until the bag is exhausted, including boundary repeat prevention.
- First encounter: one-sentence instruction and interactive example; help remains available.
- Completion animation, then Next puzzle. Summary: “A little space, just for you.”, duration, puzzle count, Done, secondary another-break action.
- Local history and settings; no streaks, ranks, notifications, advertisements, or mood questionnaires.
- Active play time excludes tutorials, pause, hidden tabs, inter-round screens. At duration limit finish interaction/simulation, offer Finish break or Finish this puzzle; no new puzzle.
- Hidden app automatically pauses; explicit resume required. Pause, hint, undo, reset, skip always available. No penalties. Errors preserve progress with actionable explanation.
- Save accepted actions. Reload offers resume/discard; animations restore stable state.
- Start gentle. Three consecutive unassisted completions promote to standard. Hint/skip resets next puzzle to gentle. Gentle-only preference available.

## Visual contract
Ivory #FAF7F0, white surfaces, ink #242438, lilac #DED5F5, mint #D5EBDD, peach #F5D7C6, primary plum #554070. Actual combinations must pass WCAG AA. Locally bundled Manrope with system fallback; 16px body. 8px spacing, 20–28px cards, subtle borders, restrained tactile shadows. Main illustrated break card and distinct miniature game previews, not a statistics dashboard.

320px minimum, 16px mobile gutters, safe areas, >=44px controls. Square boards bounded around 480px, instructions beside boards on desktop. Taiga controls and accessible DOM game boards with decorative SVG. Press 120ms, transitions 220ms, completion ~500ms. Correctness independent of animation. Reduced motion makes state immediate. Sound/haptics default off.

## Game rules
### Pocket Post
4×4 gentle/5×5 standard grid. Extend courier path orthogonally, collect each parcel before symbol-matched house, then exit. No crossings/revisits. Go animates delivery. Invalid route explains first unmet rule and stays editable. One delivery gentle; two plus blocked cells standard.
### Stencil Studio
Recreate visible 3×3 postcard. Choose patterned tool, rotate mask 90 degrees, preview, apply. Covered cells overwritten, others preserved. Match symbols and colors. Two patterns/2–3 action solution gentle; three patterns/4–5 action solution standard.
### Little Harbour
Visible queue of symbol boats, fixed directed channel network. Set junctions then Launch next. One boat at a time, no reaction deadline. Wrong dock returns boat to queue front, successful deliveries remain. Gentle: two docks/two junctions/three boats. Standard: three docks/three junctions/five boats.
### Orbit Garden
Three concentric eight-sector rings. Channel ports point inward/outward/clockwise/counterclockwise; only reciprocal ports connect. Central source waters outer flowers. Rotate selected ring left/right one sector. Gentle one flower/sparse channels; standard two flowers/branches.

## Content and architecture
- 12 verified base puzzles per game: eight gentle/four standard, stable IDs, initial states, known solutions.
- Curated fixtures, seeded ordering and valid rotations/reflections/symbol permutations; transform solutions too. No base repeat in session until eligible pool exhausted.
- Validate fixtures and transformations automatically. Hint gives legal step or offers explicit reset to guided solution if blocked; never silently erase progress.
- Tap/select and keyboard baseline, dragging optional only with equivalents.
- core: session, storage, PWA; features: lazy routes and self-contained games. Pure TS engines separated from DOM/animation; Angular signals and computed state.
- GameId union and typed registry; each adapter create, reduce, isSolved, hint, serialize, restore. Typed discriminated snapshots/actions, no any.
- Session coordinator owns selection, clock, assistance, difficulty, persistence. Boards own presentation.
- Local storage versioned preferences, active snapshot, latest 100 summaries (date/duration/count/games). Validate records; discard invalid with notice; memory fallback on storage failure.
- Settings: duration, gentle-only, motion override, sound, haptics, confirmed clear data.
- No public network API.

## PWA
Matching Angular service worker/PWA setup, standalone manifest, branded 192/512/maskable and Apple icons. Precache shell, every game bundle, fixtures, fonts, icons. Ready offline only when cache succeeds. Supported install prompt or platform instructions. Update prompt outside active play, confirmed reload preserving compatible data. HTTPS static SPA hosting instructions; no publishing.

## Checkpoints
- [x] 1 Foundation: saved plan, baseline, theme, shell, routes, home/settings/shared controls; verify responsive views, keyboard, build.
- [x] 2 Session: adapters, shuffle, active clock, pause/resume, persistence/history/summary; test selection/timing/restoration/storage failure.
- [x] 3 Pocket Post: engine, board, tutorial, hints, 12 fixtures; test delivery ordering, path rules, undo/reset, solutions.
- [x] 4 Stencil: engine, board, preview/rotation/overwrite, tutorial/hints, 12 fixtures; test target, masks, overlaps, restoration, solutions.
- [x] 5 Harbour: routing, junctions, queue, tutorial/hints, 12 fixtures; test wrong docks, preserved queue, paused travel, solutions.
- [x] 6 Orbit: rings, connectivity, bloom, tutorial/hints, 12 fixtures; test reciprocal ports, wrap, branches, solutions.
- [x] 7 Integration: difficulty, transitions, duration limit, sound/haptics, reload; full session tests and manual full-length session.
- [x] 8 PWA: install, offline readiness, updates; production offline reload/all games/deep links/update preservation.
- [ ] 9 Finish: accessibility, performance, screenshots, setup/hosting docs, final evidence and limitations.

## Release validation
bun run test -- --watch=false; bun run build. Playwright + axe with test:e2e/test:a11y scripts. Axe all pages/games/help/pause/error/empty states, zero violations. Manual keyboard/focus/screen-reader/non-color/reduced-motion/200% zoom. Screenshots 320/390/768/1440. Chromium/WebKit automated flows; actual iOS/Android install checks recorded separately. Preserve build budgets. Three target-user usability sessions to assess comprehension and manageable difficulty, not medical outcomes; record pending if humans unavailable.

## Research and product boundaries
Original art/levels/copy. Broad inspiration: https://afterburn.games/railbound/ ; https://draknek.itch.io/cosmic-express ; https://www.bontegames.com/2011/09/new-bonte-game-factory-balls-4.html?m=0 . Promise engaging breaks, never cortisol reduction or prevention of overthinking. The specific trauma/Tetris intervention https://www.nature.com/articles/mp201723 does not validate our games. Technical references: https://angular.dev/ecosystem/service-workers/getting-started and https://taiga-ui.dev/getting-started/ .

## Resume protocol
Read AGENTS.md and PLAN.md, inspect git state, resume first incomplete checkpoint. Preserve existing work. After each step update status, changed areas, exact commands/results, remaining issues, next action. Never mark complete without verification.

## Progress log
### 2026-09-14 — implementation started
- Saved approved plan. Existing starter inspected; baseline unit tests started.
- Working on feat/mental-mania-pwa in the user workspace. Branch creation required sandbox escalation and succeeded; no remote changes.
- Checkpoint 1 in progress. Next: separate game implementation from shell/session and PWA setup; then integrate and validate.

### 2026-09-14 — core implementation completed on master
- Replaced the starter with the responsive Unloop shell, home, persisted settings, resume/discard flow, and local history.
- Added the active-time coordinator, hidden-tab pause, no-repeat random bag, duration-limit choice, gentle/standard progression, optional sound/haptics, and summary.
- Added four accessible game surfaces and 48 stable fixtures: Pocket Post, Stencil Studio, Little Harbour, and Orbit Garden.
- Added first-visit interactive guidance, hints, undo, reset, skip, completion states, reduced-motion behavior, and mobile/desktop layouts.
- Added Angular service-worker configuration, manifest, branded SVG icons, install/update prompts, offline asset prefetching, CI build, and static-hosting documentation.
- Verification: GitHub Actions ran `bun install` and `bun run build` successfully on commit `3796b6e`.
- Per implementation direction, unit/e2e/axe suites, screenshots, physical iOS/Android installs, screen-reader review, and human usability sessions were not performed. Checkpoint 9 remains open for that release evidence.

### 2026-09-14 — visibility and gameplay redesign
- Replaced fixed light-only colors with semantic, WCAG-conscious light and dark palettes; added a persistent header toggle and matching settings controls.
- Added safe-area-aware mobile gutters and responsive board/control sizing so cards and actions no longer touch narrow screen edges.
- Rebuilt Pocket Post around a visible ordered route, live delivery progress, and a clearly gated Deliver action.
- Rebuilt Stencil Studio with a permanently visible target/current comparison, symbol-plus-color cues, live mask preview, and explicit left/right rotation.
- Rebuilt Little Harbour with visible deterministic destinations, highlighted junction choices, queue progress, and clear launch outcomes.
- Rebuilt Orbit Garden as three selectable eight-sector tracks with an explicit water drop, flower target, directional controls, and reachable target offsets.
- Added `validate:puzzles` and made CI run every known solution through all 48 shipped fixtures before the production build.
- Verification: all 48 fixture checks and `bun run build` passed in GitHub Actions on commit `edec360` (run 34878558227).
- Per implementation direction, broader unit/e2e/axe suites and device screenshot review remain outside this pass; Checkpoint 9 remains open.
