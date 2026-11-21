// Everything drawn over the harbour scenes: the HUD bar, the found markers,
// the hint pulse, the crosshair and the title / round / win overlays.
import { PANEL_W, PANEL_H, TOTAL_DIFFERENCES } from './differences.js';
import { LAYOUT, crosshair, crosshairCanvasPos } from './input.js';
import { PHASE_TITLE, PHASE_PLAY, PHASE_ROUND_DONE, PHASE_WIN, PHASE_TIME_UP } from './engine.js';
import { drawScene } from './scenes.js';
import { isMuted } from './audio.js';

const GOLD = '#ffd76a';
const MARK_GREEN = '#7ee2a0';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanel(ctx, engine, side) {
  const x = side === 'left' ? LAYOUT.leftX : LAYOUT.rightX;
  const hidden = side === 'left' ? new Set() : new Set(engine.round.diffs.map((d) => d.id));
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, LAYOUT.panelY, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(x, LAYOUT.panelY);
  drawScene(ctx, engine.roundIndex, hidden);
  ctx.restore();
  ctx.strokeStyle = '#8a7a5a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, LAYOUT.panelY, PANEL_W, PANEL_H);
  ctx.fillStyle = 'rgba(20, 16, 32, 0.75)';
  ctx.fillRect(x + 8, LAYOUT.panelY + 8, 74, 24);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(side === 'left' ? 'LEFT' : 'RIGHT', x + 18, LAYOUT.panelY + 25);
}

function drawMarker(ctx, marker, now, side) {
  const age = now - marker.born;
  const pop = age < 0.25 ? 0.6 + (age / 0.25) * 0.4 : 1;
  const x = (side === 'left' ? LAYOUT.leftX : LAYOUT.rightX) + marker.x;
  const y = LAYOUT.panelY + marker.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pop, pop);
  ctx.strokeStyle = MARK_GREEN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(-2, 8);
  ctx.lineTo(10, -8);
  ctx.stroke();
  ctx.restore();
}

function drawWrong(ctx, mark, now, side) {
  const age = now - mark.born;
  if (age > 0.7) return;
  const x = (side === 'left' ? LAYOUT.leftX : LAYOUT.rightX) + mark.x;
  const y = LAYOUT.panelY + mark.y;
  ctx.save();
  ctx.globalAlpha = 1 - age / 0.7;
  ctx.strokeStyle = '#ff5a4e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 10);
  ctx.lineTo(x + 10, y + 10);
  ctx.moveTo(x + 10, y - 10);
  ctx.lineTo(x - 10, y + 10);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, engine, now) {
  if (!engine.hint) return;
  const age = now - (engine.hint.until - 2.5);
  const pulse = 0.5 + 0.5 * Math.sin(age * 6);
  const r = 22 + pulse * 8;
  for (const side of ['left', 'right']) {
    const x = (side === 'left' ? LAYOUT.leftX : LAYOUT.rightX) + engine.hint.x;
    const y = LAYOUT.panelY + engine.hint.y;
    ctx.save();
    ctx.globalAlpha = 0.65 + pulse * 0.35;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawCrosshair(ctx) {
  if (!crosshair.visible) return;
  const pos = crosshairCanvasPos();
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x - 18, pos.y);
  ctx.lineTo(pos.x - 6, pos.y);
  ctx.moveTo(pos.x + 6, pos.y);
  ctx.lineTo(pos.x + 18, pos.y);
  ctx.moveTo(pos.x, pos.y - 18);
  ctx.lineTo(pos.x, pos.y - 6);
  ctx.moveTo(pos.x, pos.y + 6);
  ctx.lineTo(pos.x, pos.y + 18);
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx, engine) {
  ctx.fillStyle = '#171226';
  ctx.fillRect(0, 0, LAYOUT.canvasW, LAYOUT.hudH);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Harbour at Dusk', 20, 30);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#c9bda0';
  ctx.fillText(engine.round.name, 20, 52);
  // Remaining counter — big, so the screenshots show it at a glance.
  const remaining = engine.phase === PHASE_WIN ? 0
    : engine.phase === PHASE_PLAY || engine.phase === PHASE_ROUND_DONE ? engine.remaining
    : engine.round.diffs.length;
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${remaining} left`, 560, 34);
  ctx.fillStyle = '#c9bda0';
  ctx.font = '14px sans-serif';
  ctx.fillText(`found ${engine.foundInRound} / ${engine.round.diffs.length}   ·   score ${engine.score}`, 560, 54);
  // Timer bar.
  const frac = engine.timeLeft / engine.round.timeLimit;
  ctx.fillStyle = '#3a3348';
  roundRect(ctx, 700, 18, 180, 16, 8);
  ctx.fill();
  ctx.fillStyle = frac < 0.2 ? '#ff5a4e' : frac < 0.45 ? '#e8a13a' : '#7ee2a0';
  if (frac > 0) {
    roundRect(ctx, 700, 18, 180 * frac, 16, 8);
    ctx.fill();
  }
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  const mins = Math.floor(engine.timeLeft / 60);
  const secs = Math.floor(engine.timeLeft % 60);
  ctx.fillText(`${mins}:${String(secs).padStart(2, '0')}`, 890, 31);
  // Sound toggle.
  ctx.fillStyle = '#3a3348';
  roundRect(ctx, 1000, 14, 70, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#f2ead8';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isMuted() ? 'Sound: off' : 'Sound: on', 1035, 37);
  // Hint button.
  ctx.fillStyle = engine.hintsLeft > 0 ? '#8a6d1f' : '#3a3348';
  roundRect(ctx, 1080, 14, 140, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`Hint (${engine.hintsLeft})  [H]`, 1150, 37);
  // Footer message line.
  ctx.fillStyle = '#c9bda0';
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(engine.message, LAYOUT.canvasW / 2, LAYOUT.footerY + 24);
  ctx.fillStyle = '#8a7a9a';
  ctx.font = '12px sans-serif';
  ctx.fillText('Click a difference on either picture · Arrow keys move the crosshair, Enter marks · H hint · M sound', LAYOUT.canvasW / 2, LAYOUT.footerY + 46);
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(12, 9, 22, 0.82)';
  ctx.fillRect(0, 0, LAYOUT.canvasW, LAYOUT.canvasH);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, LAYOUT.canvasW / 2, 280);
  ctx.fillStyle = '#f2ead8';
  ctx.font = '19px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, LAYOUT.canvasW / 2, 330 + i * 32);
  });
}

/** Draw one whole frame. `now` is the engine clock (seconds). */
export function render(ctx, engine) {
  ctx.clearRect(0, 0, LAYOUT.canvasW, LAYOUT.canvasH);
  ctx.fillStyle = '#171226';
  ctx.fillRect(0, 0, LAYOUT.canvasW, LAYOUT.canvasH);
  drawPanel(ctx, engine, 'left');
  drawPanel(ctx, engine, 'right');
  for (const marker of engine.markers) {
    drawMarker(ctx, marker, engine.elapsed, 'left');
    drawMarker(ctx, marker, engine.elapsed, 'right');
  }
  for (const mark of engine.wrongMarks) {
    drawWrong(ctx, mark, engine.elapsed, 'left');
    drawWrong(ctx, mark, engine.elapsed, 'right');
  }
  if (engine.hint && engine.elapsed < engine.hint.until) drawHintPulse(ctx, engine, engine.elapsed);
  if (engine.phase === PHASE_PLAY) drawCrosshair(ctx);
  drawHud(ctx, engine);
  if (engine.phase === PHASE_TITLE) {
    overlay(ctx, 'Harbour at Dusk', [
      'Two pictures of the same harbour. Ten differences hide between them — well,',
      'eight in the first round, nine in the second, ten in the last.',
      '',
      'Click a difference on either picture to ring it. Three rounds, a timer,',
      'three hints a round. Click anywhere to begin.',
    ], GOLD);
  } else if (engine.phase === PHASE_ROUND_DONE) {
    overlay(ctx, 'Round clear!', [
      `${engine.round.name} — all ${engine.round.diffs.length} differences found.`,
      `Score ${engine.score}. The next round hides more, and gives you less time.`,
      '',
      'Click or press N for the next round.',
    ], MARK_GREEN);
  } else if (engine.phase === PHASE_WIN) {
    overlay(ctx, 'You found them all!', [
      `All ${TOTAL_DIFFERENCES} differences across three rounds. Final score: ${engine.score}.`,
      'The harbour keeps its secrets no longer — but it will hide new ones',
      'if you play again.',
      '',
      'Click or press R to play again.',
    ], GOLD);
  } else if (engine.phase === PHASE_TIME_UP) {
    overlay(ctx, 'Time’s up', [
      `You found ${engine.found.size} of ${engine.round.diffs.length} in ${engine.round.name}.`,
      'The harbour waits. Press R to try the round again.',
    ], '#ff5a4e');
  }
}
