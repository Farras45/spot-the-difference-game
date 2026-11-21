// Screenshot scenes behind ?shot=cover|hint|round3|win. Each one sets the real
// engine state to a fixed moment of a real game — found markers, the remaining
// counter, a pulsing hint, a later round, the win screen — and freezes the clock,
// so the same URL always renders the same frame. The states are built from the
// game's own rules (engine.markAt, engine.useHint), never drawn by hand.
import { TOTAL_DIFFERENCES } from './differences.js';
import { PHASE_WIN } from './engine.js';

/** Let every found marker finish its pop animation, so screenshots show them full-size. */
function settleMarkers(engine) {
  for (const marker of engine.markers) marker.born = engine.elapsed - 1;
}

/**
 * Stage the named screenshot scene on `engine` and return the screen to draw.
 * Any other name stages the cover.
 */
export function stageShot(name, engine) {
  engine.frozen = true;
  if (name === 'hint') {
    engine.startGame();
    engine.elapsed = 40;
    engine.timeLeft = engine.round.timeLimit - 40;
    // Two real finds, then a real hint on an unfound difference.
    engine.markAt(engine.round.diffs[0].x, engine.round.diffs[0].y);
    engine.markAt(engine.round.diffs[3].x, engine.round.diffs[3].y);
    engine.useHint();
    // Freeze the pulse mid-glow so the ring is always visible.
    engine.hint.until = engine.elapsed + 2.5;
    settleMarkers(engine);
    return;
  }
  if (name === 'round3') {
    engine.startGame();
    engine.startRound(2);
    engine.elapsed = 78;
    engine.timeLeft = engine.round.timeLimit - 78;
    engine.score = 1450;
    engine.totalFound = 17;
    engine.markAt(engine.round.diffs[0].x, engine.round.diffs[0].y);
    engine.markAt(engine.round.diffs[2].x, engine.round.diffs[2].y);
    engine.markAt(engine.round.diffs[5].x, engine.round.diffs[5].y);
    engine.markAt(engine.round.diffs[8].x, engine.round.diffs[8].y);
    engine.hintsLeft = 1;
    settleMarkers(engine);
    return;
  }
  if (name === 'win') {
    engine.startGame();
    // Play every round through for real, so the win screen is earned, not faked.
    for (let round = 0; round < 3; round += 1) {
      if (round > 0) engine.startRound(round);
      for (const diff of engine.round.diffs) engine.markAt(diff.x, diff.y);
      if (round < 2) engine.nextRound();
    }
    engine.phase = PHASE_WIN;
    engine.totalFound = TOTAL_DIFFERENCES;
    settleMarkers(engine);
    return;
  }
  // Cover: round 1, three differences found, five still to find, counter visible.
  engine.startGame();
  engine.elapsed = 52;
  engine.timeLeft = engine.round.timeLimit - 52;
  engine.markAt(engine.round.diffs[0].x, engine.round.diffs[0].y);
  engine.markAt(engine.round.diffs[2].x, engine.round.diffs[2].y);
  engine.markAt(engine.round.diffs[5].x, engine.round.diffs[5].y);
  settleMarkers(engine);
}
