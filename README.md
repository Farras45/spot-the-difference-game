[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Farras45/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Farras45/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Harbour at Dusk — Spot the Difference

A complete spot-the-difference game, drawn entirely in canvas. Two pictures of
the same harbour at dusk sit side by side; 27 differences hide between them
across three rounds — Dusk Calm (8), Lanterns Lit (9), Night Tide (10) — with a
timer, three hints a round, and a win screen.

## Play

Serve `game/` with any static server and open `index.html` in a desktop
browser (no network needed — every script, image, sound and font is a file
under `game/`):

```sh
cd game
python3 -m http.server 8000
# open http://localhost:8000
```

- Click a difference on either picture to ring it (a green ring + check).
- Arrow keys move the crosshair, Enter/Space marks, Tab jumps to the other
  picture, H uses a hint, M toggles sound, N next round, R retry/replay.
- Wrong clicks cost 10 points; each find is +100, plus a time bonus per round.
- All sounds are synthesised with WebAudio — no audio files.

## Layout

- `game/index.html` — page and canvas
- `game/main.js` — boot, frame loop, `?shot=` staging
- `game/scenes.js` — draws the harbour (base scene + per-difference variants)
- `game/differences.js` — the 27 differences, per round
- `game/engine.js` — rounds, timer, finds, hints, score
- `game/input.js` — mouse + keyboard
- `game/ui.js` — HUD, markers, hint pulse, overlays
- `game/audio.js` — synthesised sounds and harbour pad
- `game/shots.js` — deterministic screenshot scenes (`?shot=cover|hint|round3|win`)
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored make.fun library

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Built by an AI agent for the make.fun "Make the best spot the difference game"
bounty.
