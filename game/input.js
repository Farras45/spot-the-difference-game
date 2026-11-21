// Mouse and keyboard input for "Harbour at Dusk".
// The canvas holds two panels side by side; a click or the crosshair can land in
// either one, and both panels share the same panel-local coordinates, so a
// difference can be marked on the left picture or the right one.
// Arrow keys move the crosshair, Enter/Space marks, H uses a hint, Tab jumps the
// crosshair to the same spot in the other panel, N advances, R retries/restarts.
import { PANEL_W, PANEL_H } from './differences.js';
import { PHASE_PLAY, PHASE_ROUND_DONE, PHASE_TIME_UP, PHASE_WIN, PHASE_TITLE } from './engine.js';

export const LAYOUT = {
  canvasW: 1240,
  canvasH: 720,
  hudH: 64,
  panelY: 76,
  leftX: 20,
  rightX: 630,
  footerY: 648,
};

export const crosshair = { x: PANEL_W / 2, y: PANEL_H / 2, panel: 'left', visible: false };

function panelAt(mx, my) {
  if (my < LAYOUT.panelY || my >= LAYOUT.panelY + PANEL_H) return null;
  if (mx >= LAYOUT.leftX && mx < LAYOUT.leftX + PANEL_W) {
    return { panel: 'left', x: mx - LAYOUT.leftX, y: my - LAYOUT.panelY };
  }
  if (mx >= LAYOUT.rightX && mx < LAYOUT.rightX + PANEL_W) {
    return { panel: 'right', x: mx - LAYOUT.rightX, y: my - LAYOUT.panelY };
  }
  return null;
}

/** Canvas pixel coordinates of the crosshair (for drawing it). */
export function crosshairCanvasPos() {
  const baseX = crosshair.panel === 'left' ? LAYOUT.leftX : LAYOUT.rightX;
  return { x: baseX + crosshair.x, y: LAYOUT.panelY + crosshair.y };
}

function hintButtonAt(mx, my) {
  // The hint button lives in the HUD, right side.
  return mx >= 1080 && mx <= 1220 && my >= 14 && my <= 50;
}

function soundButtonAt(mx, my) {
  return mx >= 1000 && mx <= 1070 && my >= 14 && my <= 50;
}

export function attachInput(canvas, engine, hooks) {
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * LAYOUT.canvasW;
    const my = ((event.clientY - rect.top) / rect.height) * LAYOUT.canvasH;
    if (soundButtonAt(mx, my)) {
      hooks.toggleSound();
      return;
    }
    if (engine.phase === PHASE_PLAY && hintButtonAt(mx, my)) {
      engine.useHint();
      return;
    }
    if (engine.phase === PHASE_TITLE) {
      engine.startGame();
      return;
    }
    if (engine.phase === PHASE_ROUND_DONE) {
      engine.nextRound();
      return;
    }
    if (engine.phase === PHASE_WIN || engine.phase === PHASE_TIME_UP) {
      engine.restart();
      return;
    }
    const hit = panelAt(mx, my);
    if (hit) {
      crosshair.x = hit.x;
      crosshair.y = hit.y;
      crosshair.panel = hit.panel;
      crosshair.visible = true;
      engine.markAt(hit.x, hit.y);
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * LAYOUT.canvasW;
    const my = ((event.clientY - rect.top) / rect.height) * LAYOUT.canvasH;
    const hit = panelAt(mx, my);
    if (hit) {
      crosshair.x = hit.x;
      crosshair.y = hit.y;
      crosshair.panel = hit.panel;
      crosshair.visible = true;
    }
  });

  window.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 40 : 12;
    switch (event.key) {
      case 'ArrowLeft':
        crosshair.x = Math.max(0, crosshair.x - step);
        crosshair.visible = true;
        event.preventDefault();
        break;
      case 'ArrowRight':
        crosshair.x = Math.min(PANEL_W, crosshair.x + step);
        crosshair.visible = true;
        event.preventDefault();
        break;
      case 'ArrowUp':
        crosshair.y = Math.max(0, crosshair.y - step);
        crosshair.visible = true;
        event.preventDefault();
        break;
      case 'ArrowDown':
        crosshair.y = Math.min(PANEL_H, crosshair.y + step);
        crosshair.visible = true;
        event.preventDefault();
        break;
      case 'Tab':
        crosshair.panel = crosshair.panel === 'left' ? 'right' : 'left';
        crosshair.visible = true;
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (engine.phase === PHASE_TITLE) engine.startGame();
        else if (engine.phase === PHASE_ROUND_DONE) engine.nextRound();
        else if (engine.phase === PHASE_WIN || engine.phase === PHASE_TIME_UP) engine.restart();
        else if (engine.phase === PHASE_PLAY) engine.markAt(crosshair.x, crosshair.y);
        event.preventDefault();
        break;
      case 'h':
      case 'H':
        engine.useHint();
        break;
      case 'n':
      case 'N':
        engine.nextRound();
        break;
      case 'r':
      case 'R':
        if (engine.phase === PHASE_TIME_UP) engine.retryRound();
        else if (engine.phase === PHASE_WIN) engine.restart();
        break;
      case 'm':
      case 'M':
        hooks.toggleSound();
        break;
      default:
        break;
    }
  });
}
