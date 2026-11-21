// Difference definitions for "Harbour at Dusk", a spot-the-difference game.
// Every difference lives in panel-local coordinates (each panel is 590 x 560).
// `x`, `y` is the centre of the thing that differs, `r` the click radius around it,
// `label` the short name shown on the round-complete screen. The drawing code in
// scenes.js keys each element off its id, so the left panel draws the base scene
// and the right panel draws it with every id of the round varied.

export const PANEL_W = 590;
export const PANEL_H = 560;

export const ROUNDS = [
  {
    id: 'dusk',
    name: 'Round 1 — Dusk Calm',
    tagline: 'Eight differences. The harbour is still settling down.',
    timeLimit: 180,
    diffs: [
      { id: 'gull1',  x: 150, y: 118, r: 18, label: 'the gull over the lighthouse' },
      { id: 'buoy',   x: 420, y: 500, r: 16, label: 'the yellow buoy turned red' },
      { id: 'sign',   x: 62,  y: 428, r: 20, label: 'the pier sign reads PIER 1' },
      { id: 'beam',   x: 130, y: 228, r: 24, label: 'the lighthouse beam is off' },
      { id: 'oar',    x: 486, y: 452, r: 18, label: 'the rowboat lost its oar' },
      { id: 'window', x: 528, y: 284, r: 14, label: 'a harbour window went dark' },
      { id: 'cat',    x: 288, y: 456, r: 16, label: 'the cat left the bollard' },
      { id: 'star',   x: 322, y: 78,  r: 14, label: 'an extra star in the sky' },
    ],
  },
  {
    id: 'lanterns',
    name: 'Round 2 — Lanterns Lit',
    tagline: 'Nine differences, and the lanterns are on. Look closer.',
    timeLimit: 150,
    diffs: [
      { id: 'sail',    x: 352, y: 368, r: 20, label: 'the sail stripe turned blue' },
      { id: 'hat',     x: 180, y: 424, r: 14, label: 'the fisherman’s hat turned red' },
      { id: 'rope',    x: 122, y: 502, r: 16, label: 'the rope coil is gone' },
      { id: 'gull2',   x: 252, y: 88,  r: 18, label: 'the second gull is gone' },
      { id: 'lantern', x: 242, y: 438, r: 16, label: 'a pier lantern is unlit' },
      { id: 'flag',    x: 352, y: 330, r: 14, label: 'the sailboat flag is gone' },
      { id: 'crab',    x: 92,  y: 522, r: 14, label: 'a crab appeared on the pier' },
      { id: 'chimney', x: 502, y: 258, r: 18, label: 'the chimney smoke is gone' },
      { id: 'anchor',  x: 202, y: 392, r: 16, label: 'the anchor is gone' },
    ],
  },
  {
    id: 'night',
    name: 'Round 3 — Night Tide',
    tagline: 'Ten differences under the moon. The hunt gets quiet and hard.',
    timeLimit: 120,
    diffs: [
      { id: 'moon',     x: 472, y: 118, r: 22, label: 'the moon lost a crater' },
      { id: 'star2',    x: 202, y: 58,  r: 12, label: 'a star went out' },
      { id: 'lantern2', x: 302, y: 448, r: 14, label: 'a lantern turned green' },
      { id: 'rope2',    x: 142, y: 512, r: 16, label: 'the rope coil is gone' },
      { id: 'window2',  x: 546, y: 282, r: 12, label: 'a window lit up' },
      { id: 'heron',    x: 432, y: 138, r: 16, label: 'the night heron is gone' },
      { id: 'buoy2',    x: 522, y: 522, r: 16, label: 'the red buoy is gone' },
      { id: 'sign2',    x: 62,  y: 428, r: 20, label: 'the pier sign reads PIER 9' },
      { id: 'beam2',    x: 150, y: 228, r: 24, label: 'the lighthouse beam is shorter' },
      { id: 'fish',     x: 402, y: 482, r: 16, label: 'the jumping fish is gone' },
    ],
  },
];

/** Total differences across all rounds (8 + 9 + 10). */
export const TOTAL_DIFFERENCES = ROUNDS.reduce((sum, round) => sum + round.diffs.length, 0);
