// Synthesised sound for "Harbour at Dusk": every sound is made with WebAudio
// oscillators and noise, so the game ships no audio files at all. The context is
// created lazily on the first user gesture, as browsers require.
let ctx = null;
let padNodes = null;
let muted = false;

function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, gain, when = 0, slideTo = null) {
  if (muted) return;
  const ac = audio();
  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(gain, t + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A satisfying two-note chime when a difference is found. */
export function playFound() {
  tone(660, 0.16, 'sine', 0.22);
  tone(990, 0.28, 'sine', 0.2, 0.09);
  tone(1320, 0.2, 'triangle', 0.08, 0.09);
}

/** A soft low buzz for a wrong click. */
export function playWrong() {
  tone(160, 0.22, 'sawtooth', 0.1, 0, 110);
}

/** A shimmer when a hint is used. */
export function playHint() {
  tone(880, 0.3, 'sine', 0.12, 0, 1320);
  tone(1174, 0.35, 'sine', 0.1, 0.12, 1568);
}

/** A short tick as the timer runs low. */
export function playTick() {
  tone(1200, 0.06, 'square', 0.05);
}

/** A rising arpeggio for a round won, longer for the whole game. */
export function playWin(full) {
  const notes = full ? [523, 659, 784, 1046, 1318] : [523, 659, 784];
  notes.forEach((freq, i) => tone(freq, 0.32, 'triangle', 0.16, i * 0.11));
}

/** A gentle harbour pad underneath the game: two detuned sines and a slow swell. */
export function startPad() {
  if (muted || padNodes) return;
  const ac = audio();
  const amp = ac.createGain();
  amp.gain.value = 0.035;
  amp.connect(ac.destination);
  const oscA = ac.createOscillator();
  const oscB = ac.createOscillator();
  oscA.type = 'sine';
  oscB.type = 'sine';
  oscA.frequency.value = 110;
  oscB.frequency.value = 164.8;
  const lfo = ac.createOscillator();
  const lfoAmp = ac.createGain();
  lfo.frequency.value = 0.08;
  lfoAmp.gain.value = 0.015;
  lfo.connect(lfoAmp);
  lfoAmp.connect(amp.gain);
  oscA.connect(amp);
  oscB.connect(amp);
  oscA.start();
  oscB.start();
  lfo.start();
  padNodes = { oscA, oscB, lfo, amp };
}

export function stopPad() {
  if (!padNodes) return;
  try {
    padNodes.oscA.stop();
    padNodes.oscB.stop();
    padNodes.lfo.stop();
  } catch (e) { /* already stopped */ }
  padNodes = null;
}

export function setMuted(value) {
  muted = value;
  if (muted) stopPad();
}

export function isMuted() {
  return muted;
}
