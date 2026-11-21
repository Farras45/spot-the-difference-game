// Boot for "Harbour at Dusk": wires the canvas, the engine, input and sound,
// runs the frame loop, and stages ?shot= scenes for screenshots.
// Exposes window.__game for play-testing: { engine, crosshair }.
import { Engine } from './engine.js';
import { render } from './ui.js';
import { attachInput, LAYOUT } from './input.js';
import { stageShot } from './shots.js';
import { setMuted, isMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = LAYOUT.canvasW;
canvas.height = LAYOUT.canvasH;

const engine = new Engine();
window.__game = { engine };

attachInput(canvas, engine, {
  toggleSound() {
    setMuted(!isMuted());
  },
});

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) stageShot(shot, engine);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  engine.update(dt);
  render(ctx, engine);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
