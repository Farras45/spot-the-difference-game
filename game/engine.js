// Game state for "Harbour at Dusk": rounds, timer, finds, hints, score and
// the win/lose flow. Drawing lives in scenes.js and ui.js; this file only
// decides what the game is doing and what a click or a key means.
import { ROUNDS, TOTAL_DIFFERENCES } from './differences.js';
import { playFound, playWrong, playHint, playTick, playWin, startPad } from './audio.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_ROUND_DONE = 'round-done';
export const PHASE_WIN = 'win';
export const PHASE_TIME_UP = 'time-up';

const WRONG_PENALTY = 10;
const FIND_POINTS = 100;
const HINTS_PER_ROUND = 3;

export class Engine {
  constructor() {
    this.phase = PHASE_TITLE;
    this.roundIndex = 0;
    this.found = new Set();
    this.markers = []; // {x, y, born} pop animations for found differences
    this.wrongMarks = []; // {x, y, born} red X flashes for wrong clicks
    this.hint = null; // {id, x, y, until} the pulsing hint ring
    this.hintsLeft = HINTS_PER_ROUND;
    this.timeLeft = ROUNDS[0].timeLimit;
    this.score = 0;
    this.totalFound = 0;
    this.elapsed = 0;
    this.lastTickSecond = -1;
    this.message = 'Find the differences — click either picture.';
    this.frozen = false; // screenshots freeze the clock and animations
    this.roundStartScore = 0;
  }

  get round() {
    return ROUNDS[this.roundIndex];
  }

  get remaining() {
    return this.round.diffs.length - this.found.size;
  }

  get foundInRound() {
    return this.found.size;
  }

  startGame() {
    this.roundIndex = 0;
    this.score = 0;
    this.totalFound = 0;
    this.startRound(0);
    startPad();
  }

  startRound(index) {
    this.roundIndex = index;
    this.found = new Set();
    this.markers = [];
    this.wrongMarks = [];
    this.hint = null;
    this.hintsLeft = HINTS_PER_ROUND;
    this.timeLeft = ROUNDS[index].timeLimit;
    this.elapsed = 0;
    this.lastTickSecond = -1;
    this.roundStartScore = this.score;
    this.phase = PHASE_PLAY;
    this.message = `${ROUNDS[index].name} — ${ROUNDS[index].diffs.length} differences to find.`;
  }

  /** Advance the clock by dt seconds (skipped while frozen for screenshots). */
  update(dt) {
    if (this.frozen || this.phase !== PHASE_PLAY) return;
    this.elapsed += dt;
    this.timeLeft = Math.max(0, this.round.timeLimit - this.elapsed);
    const whole = Math.ceil(this.timeLeft);
    if (this.timeLeft <= 10 && whole !== this.lastTickSecond) {
      this.lastTickSecond = whole;
      playTick();
    }
    if (this.timeLeft <= 0) {
      this.phase = PHASE_TIME_UP;
      this.message = `Time’s up — you found ${this.found.size} of ${this.round.diffs.length}. Press R to try the round again.`;
    }
  }

  /** Try to mark the point (x, y) in panel-local coordinates. */
  markAt(x, y) {
    if (this.phase !== PHASE_PLAY) return false;
    for (const diff of this.round.diffs) {
      if (this.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        this.found.add(diff.id);
        this.totalFound += 1;
        this.score += FIND_POINTS;
        this.markers.push({ x: diff.x, y: diff.y, born: this.elapsed });
        playFound();
        if (this.found.size === this.round.diffs.length) {
          const bonus = Math.round(this.timeLeft) * 5;
          this.score += bonus;
          playWin(this.roundIndex === ROUNDS.length - 1);
          if (this.roundIndex === ROUNDS.length - 1) {
            this.phase = PHASE_WIN;
            this.message = `You found all ${TOTAL_DIFFERENCES} differences!`;
          } else {
            this.phase = PHASE_ROUND_DONE;
            this.message = `Round clear! Time bonus +${bonus}. Press N for the next round.`;
          }
        } else {
          this.message = `Found: ${diff.label} — ${this.remaining} to go.`;
        }
        return true;
      }
    }
    this.score = Math.max(0, this.score - WRONG_PENALTY);
    this.wrongMarks.push({ x, y, born: this.elapsed });
    playWrong();
    this.message = 'Not a difference — −10 points. Look again.';
    return false;
  }

  /** Spend a hint: briefly pulse a ring around one unfound difference. */
  useHint() {
    if (this.phase !== PHASE_PLAY) return false;
    if (this.hintsLeft <= 0) {
      this.message = 'No hints left this round.';
      return false;
    }
    const unfound = this.round.diffs.filter((d) => !this.found.has(d.id));
    if (unfound.length === 0) return false;
    const pick = unfound[Math.floor(unfound.length / 2)];
    this.hintsLeft -= 1;
    this.hint = { id: pick.id, x: pick.x, y: pick.y, until: this.elapsed + 2.5 };
    playHint();
    this.message = `Hint used — ${this.hintsLeft} left. Something is glowing…`;
    return true;
  }

  nextRound() {
    if (this.phase !== PHASE_ROUND_DONE) return;
    this.startRound(this.roundIndex + 1);
  }

  retryRound() {
    if (this.phase !== PHASE_TIME_UP) return;
    this.score = this.roundStartScore;
    this.startRound(this.roundIndex);
  }

  restart() {
    this.startGame();
  }
}
