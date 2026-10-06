# Retro Arcade 44 (DV1006 docs check)

A small playable React app built as a safe, disposable test project for Base Code workflows.

Instead of testing Base Code against a throwaway Hello World, this project has enough real app behavior to make repo import, code understanding, edits, previews, branches, and pull requests meaningful.

## Games

- **Snake 44**: keyboard and touch controls, scoring, collision logic, and a local high score.
- **Memory Match**: shuffled pairs, turn tracking, match state, and reset logic.
- **Whack-a-Pixel**: a 20-second reflex game with timers and randomized targets.

## Stack

- React
- Vite
- Plain CSS
- No backend
- No auth
- No database
- No secrets
- No external services

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Good Base Code experiments

Try these as separate branches or prompts:

1. Add Easy, Normal, and Chaos difficulty modes to Snake 44.
2. Add a pause button and keyboard shortcut to Snake 44.
3. Add a fourth arcade game without changing the existing three.
4. Create a shared local leaderboard across all games.
5. Add a CRT scanline toggle in the header.
6. Make the game picker work as URL routes.
7. Refactor the games into a reusable shared game-shell component.
8. Improve mobile controls and accessibility.
9. Change the visual theme while preserving all game logic.
10. Ask Base Code to explain the architecture before changing anything.

The repo is intentionally dependency-light so failures are more likely to reveal something about the coding workflow than about infrastructure.
