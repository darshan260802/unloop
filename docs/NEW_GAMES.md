# New games — 2026-09-14

The user explicitly requested four completely new games, followed by fresh randomized gameplay on each start. The previous four engines and boards are retired. Legacy GameId strings remain only as stable storage/URL keys so existing links and preferences work.

## Lineup
- **Number Trail:** one Hamiltonian route through every square, visiting numbered checkpoints in order. 4×4 and 5×5. Backbite-generated paths produce solvable boards; all valid routes are accepted. Connected path drawing, tap-to-rewind, bounded search hints from the current position.
- **Picross:** 5×5 nonograms with independent Fill / Empty / Erase tools. Row and column clues encode runs. Generator accepts boards solvable through repeated line deductions, which also establishes a unique answer. Standard boards omit trivial all-filled/all-empty clues when generation succeeds. Hints explain deductions; contradictory lines are identified.
- **Cargo Sort:** 3/4 symbols, capacity-four stacks, two spare bays. Move one top crate onto a matching symbol or empty bay. Shuffled layouts are solved before acceptance; a bounded generator has verified fallback layouts. Undo and bounded current-state solver hints.
- **Circuit:** randomized spanning-tree networks, individually rotated tiles, 4×4 and 5×5. Win requires full source connectivity and reciprocal wire ends everywhere. Edge-based reasoning, power feedback, clockwise/counterclockwise rotation, tile locks, and constraint-based hints.

## Fresh boards
Cryptographically seeded starts and skips; last 128 player-visible board fingerprints retained per game in browser storage (memory fallback). Duplicate candidates are regenerated, with bounded retries to keep the UI responsive. Number Trail, Picross and Circuit generate layouts algorithmically; Cargo Sort shuffles and solves new stacks. This avoids recent repeats rather than promising mathematically impossible infinite uniqueness. Existing unfinished v2 puzzles regenerate from their saved seed and restore accepted board actions on reload. New starts do not reuse the unfinished board.

## Research informing the mechanics
- Simon Tatham, Pattern rules: https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/pattern.html — run clues and black/white cell deduction.
- Simon Tatham, Net rules: https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/net.html — reciprocal rotating networks and source connectivity.
- Nikoli, Numberlink rules: https://www.nikoli.co.jp/en/puzzles/numberlink/ — orthogonal, noncrossing path constraints; Number Trail uses ordered checkpoints and full coverage instead.
- Water Sort developer listing: https://play.google.com/store/apps/details?id=com.gma.water.sort.puzzle — matching top contents and limited spare capacity. Cargo Sort uses individual symbol-marked crates.

These are gameplay references, not evidence of medical or cortisol effects. No third-party game code, artwork or level data was copied.

## Verification
Each replacement was committed and pushed separately; each corresponding GitHub Actions production build and puzzle validation passed:
- Number Trail: d03023f, run 34880623654.
- Picross: c0f6438, run 34880876536.
- Cargo Sort: 04cb2ea, run 34881153147.
- Circuit: b398d09, run 34881408909.

The validation script checks 128 Trail boards, 128 deduction-solvable Picross boards, 144 legal Cargo solutions, 256 Circuit networks, and 32 distinct fresh starts per game with reproducible seeds. Final integration build status is recorded in the GitHub Actions history.

Browser/device visual review, assistive-technology review and human playtesting have not been performed in this session. Production builds and pure engine checks cannot establish how engaging users will find the games.
