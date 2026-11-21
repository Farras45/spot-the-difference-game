// Draws the "Harbour at Dusk" scene into one panel (590 x 560).
// `roundIndex` picks the time of day (0 dusk, 1 lanterns, 2 night). `hidden` is the
// set of difference ids to vary: the left panel is drawn with an empty set, the
// right panel with every id of the round, so the two pictures are near-identical
// and differ only where the differences say they should.
import { PANEL_W, PANEL_H } from './differences.js';

const PALETTES = [
  { skyTop: '#2a2148', skyMid: '#7a4a6e', horizon: '#e8863a', seaTop: '#4a3a6e', seaDeep: '#1e2a4a', sun: '#ff9a3c' },
  { skyTop: '#201a44', skyMid: '#5e3460', horizon: '#c65a2e', seaTop: '#3d2f5e', seaDeep: '#182238', sun: '#ff7a2e' },
  { skyTop: '#0b0f2c', skyMid: '#232050', horizon: '#3a2a55', seaTop: '#1e2447', seaDeep: '#0c1226', sun: null },
];

const STARS = [
  [[90, 60], [260, 40], [400, 60], [520, 100]],
  [[90, 60], [260, 40], [400, 60], [520, 100], [150, 150], [350, 30], [480, 180], [80, 200]],
  [[90, 60], [260, 40], [400, 60], [520, 100], [150, 150], [350, 30], [480, 180], [80, 200],
   [202, 58], [560, 60], [40, 130], [300, 120], [440, 40], [120, 220], [540, 220], [280, 170]],
];

function star(ctx, x, y, r) {
  ctx.fillStyle = '#fff8dd';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function gull(ctx, x, y, scale) {
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.quadraticCurveTo(x - 5 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 5 * scale, y - 8 * scale, x + 12 * scale, y);
  ctx.stroke();
}

function drawSky(ctx, round, hidden) {
  const p = PALETTES[round];
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, p.skyTop);
  g.addColorStop(0.65, p.skyMid);
  g.addColorStop(1, p.horizon);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, 300);
  for (const [x, y] of STARS[round]) {
    if (round === 2 && x === 202 && y === 58 && hidden.has('star2')) continue;
    star(ctx, x, y, round === 2 ? 2.2 : 1.8);
  }
  if (hidden.has('star')) star(ctx, 322, 78, 2.4); // the extra star, right panel only
  // Sun (rounds 0-1) or moon (round 2).
  if (p.sun) {
    const sunY = round === 0 ? 252 : 268;
    ctx.fillStyle = p.sun;
    ctx.beginPath();
    ctx.arc(472, sunY, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 154, 60, 0.25)';
    ctx.beginPath();
    ctx.arc(472, sunY, 48, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#f4ead0';
    ctx.beginPath();
    ctx.arc(472, 118, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9cba6';
    ctx.beginPath();
    ctx.arc(464, 110, 5, 0, Math.PI * 2);
    ctx.arc(480, 126, 4, 0, Math.PI * 2);
    if (!hidden.has('moon')) {
      ctx.beginPath();
      ctx.arc(476, 108, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Clouds.
  ctx.fillStyle = 'rgba(233, 190, 170, 0.35)';
  ctx.beginPath();
  ctx.ellipse(120, 70, 52, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(380, 48, 62, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Gulls and the night heron.
  if (!hidden.has('gull1')) gull(ctx, 150, 118, 1);
  if (!hidden.has('gull2')) gull(ctx, 252, 88, 0.85);
  if (round === 2 && !hidden.has('heron')) {
    ctx.strokeStyle = '#10142a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(432, 138);
    ctx.lineTo(424, 128);
    ctx.moveTo(432, 138);
    ctx.lineTo(440, 128);
    ctx.stroke();
  }
}

function drawSea(ctx, round, hidden) {
  const p = PALETTES[round];
  const g = ctx.createLinearGradient(0, 300, 0, PANEL_H);
  g.addColorStop(0, p.seaTop);
  g.addColorStop(1, p.seaDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 300, PANEL_W, PANEL_H - 300);
  // Wave lines, fixed phases so both panels match exactly.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 7; row += 1) {
    const y = 322 + row * 32;
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 10) {
      const yy = y + Math.sin((x + row * 47) * 0.03) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Sun glint on the water (rounds 0-1).
  if (p.sun) {
    ctx.fillStyle = 'rgba(255, 154, 60, 0.35)';
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(440 + i * 3, 312 + i * 26, 70 - i * 8, 4);
    }
  }
  // The jumping fish, round 2 only.
  if (round === 2 && !hidden.has('fish')) {
    ctx.strokeStyle = '#c8d4f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(402, 482, 10, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(402, 494, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Buoys.
  ctx.fillStyle = hidden.has('buoy') ? '#e33a2e' : '#f5c518';
  ctx.beginPath();
  ctx.arc(420, 500, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6d1f';
  ctx.fillRect(416, 484, 8, 8);
  if (!hidden.has('buoy2')) {
    ctx.fillStyle = '#e33a2e';
    ctx.beginPath();
    ctx.arc(522, 522, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a1f18';
    ctx.fillRect(518, 507, 8, 8);
  }
}

function drawHeadland(ctx, round, hidden) {
  // Rocky headland, left, with the lighthouse.
  ctx.fillStyle = '#3a2f45';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(110, 300);
  ctx.lineTo(96, 250);
  ctx.lineTo(40, 236);
  ctx.lineTo(0, 258);
  ctx.closePath();
  ctx.fill();
  // Lighthouse tower.
  ctx.fillStyle = '#e8ddc8';
  ctx.fillRect(46, 182, 26, 70);
  ctx.fillStyle = '#b03a2e';
  ctx.fillRect(46, 182, 26, 10);
  ctx.fillRect(46, 212, 26, 8);
  ctx.fillStyle = '#2c2438';
  ctx.fillRect(42, 168, 34, 14);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(50, 171, 18, 8);
  // The beam.
  if (!hidden.has('beam')) {
    ctx.fillStyle = 'rgba(255, 233, 168, 0.28)';
    ctx.beginPath();
    ctx.moveTo(76, 175);
    ctx.lineTo(260, 205);
    ctx.lineTo(260, 245);
    ctx.lineTo(76, 183);
    ctx.closePath();
    ctx.fill();
  } else if (hidden.has('beam2')) {
    ctx.fillStyle = 'rgba(255, 233, 168, 0.28)';
    ctx.beginPath();
    ctx.moveTo(76, 175);
    ctx.lineTo(150, 200);
    ctx.lineTo(150, 224);
    ctx.lineTo(76, 183);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBuildings(ctx, round, hidden) {
  // Far-shore houses along the horizon, right side.
  ctx.fillStyle = '#2e2440';
  ctx.fillRect(470, 268, 40, 32);
  ctx.fillRect(516, 258, 44, 42);
  ctx.beginPath();
  ctx.moveTo(470, 268);
  ctx.lineTo(490, 252);
  ctx.lineTo(510, 268);
  ctx.closePath();
  ctx.moveTo(516, 258);
  ctx.lineTo(538, 240);
  ctx.lineTo(560, 258);
  ctx.closePath();
  ctx.fill();
  // Lit windows: one goes dark in round 0, one lights up in round 2.
  ctx.fillStyle = hidden.has('window') ? '#241d33' : '#ffd76a';
  ctx.fillRect(528, 278, 10, 12);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(482, 280, 10, 12);
  ctx.fillStyle = hidden.has('window2') ? '#ffd76a' : '#241d33';
  ctx.fillRect(546, 276, 8, 10);
  // Chimney smoke, round 1.
  if (round === 1 && !hidden.has('chimney')) {
    ctx.fillStyle = 'rgba(230, 230, 230, 0.55)';
    ctx.beginPath();
    ctx.arc(502, 250, 7, 0, Math.PI * 2);
    ctx.arc(508, 238, 9, 0, Math.PI * 2);
    ctx.arc(516, 226, 11, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPier(ctx, round, hidden) {
  // Wooden pier deck, bottom-left, with posts.
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.moveTo(0, 560);
  ctx.lineTo(0, 480);
  ctx.lineTo(280, 445);
  ctx.lineTo(300, 560);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#54371f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 55, 560 - i * 7);
    ctx.lineTo(30 + i * 55, 478 - i * 7);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a2f1c';
  ctx.fillRect(30, 500, 10, 60);
  ctx.fillRect(140, 486, 10, 74);
  ctx.fillRect(250, 468, 10, 92);
  // Pier sign.
  ctx.fillStyle = '#e8ddc8';
  ctx.fillRect(38, 414, 48, 26);
  ctx.fillStyle = '#2c2438';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  const sign = hidden.has('sign') ? 'PIER 1' : hidden.has('sign2') ? 'PIER 9' : 'PIER 7';
  ctx.fillText(sign, 62, 432);
  // Rope coil.
  if (!hidden.has('rope') && !hidden.has('rope2')) {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(round === 2 ? 142 : 122, round === 2 ? 512 : 502, 12, 0, Math.PI * 2);
    ctx.arc(round === 2 ? 142 : 122, round === 2 ? 512 : 502, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The crab that only appears on the right panel of round 1.
  if (hidden.has('crab')) {
    ctx.fillStyle = '#d95f3b';
    ctx.beginPath();
    ctx.arc(92, 522, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d95f3b';
    ctx.lineWidth = 2;
    for (const dx of [-12, -7, 7, 12]) {
      ctx.beginPath();
      ctx.moveTo(92 + dx, 522);
      ctx.lineTo(92 + dx * 1.4, 532);
      ctx.stroke();
    }
  }
  // Pier lanterns (lit from round 1 on).
  const lanterns = [
    { x: 242, y: 438, id: 'lantern' },
    { x: 302, y: 448, id: 'lantern2' },
  ];
  for (const lamp of lanterns) {
    ctx.fillStyle = '#2c2438';
    ctx.fillRect(lamp.x - 2, lamp.y - 14, 4, 14);
    const lit = round > 0 && !(lamp.id === 'lantern' && hidden.has('lantern'));
    const colour = lamp.id === 'lantern2' && hidden.has('lantern2') ? '#7ee2a0' : '#ffd76a';
    ctx.fillStyle = lit ? colour : '#3a3348';
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y - 18, 7, 0, Math.PI * 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = colour === '#ffd76a' ? 'rgba(255, 215, 106, 0.25)' : 'rgba(126, 226, 160, 0.25)';
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y - 18, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Bollard with the cat.
  ctx.fillStyle = '#3a3348';
  ctx.fillRect(280, 448, 16, 20);
  if (!hidden.has('cat')) {
    ctx.fillStyle = '#1c1626';
    ctx.beginPath();
    ctx.arc(288, 444, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(282, 438);
    ctx.lineTo(284, 430);
    ctx.lineTo(288, 437);
    ctx.moveTo(294, 438);
    ctx.lineTo(292, 430);
    ctx.lineTo(288, 437);
    ctx.fill();
  }
  // The fisherman.
  ctx.strokeStyle = '#2c2438';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(180, 456);
  ctx.lineTo(180, 432);
  ctx.stroke();
  ctx.fillStyle = '#2c2438';
  ctx.beginPath();
  ctx.arc(180, 424, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hidden.has('hat') ? '#c0392b' : '#2e6fb0';
  ctx.beginPath();
  ctx.arc(180, 418, 9, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(170, 416, 20, 3);
  ctx.strokeStyle = '#7a5a34';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(188, 440);
  ctx.lineTo(230, 400);
  ctx.stroke();
}

function drawBoats(ctx, round, hidden) {
  // Fishing boat with cabin, left-mid.
  ctx.fillStyle = '#7a3b2e';
  ctx.beginPath();
  ctx.moveTo(160, 400);
  ctx.lineTo(244, 400);
  ctx.lineTo(232, 418);
  ctx.lineTo(172, 418);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8ddc8';
  ctx.fillRect(186, 378, 30, 22);
  ctx.fillStyle = '#2c2438';
  ctx.fillRect(196, 386, 10, 10);
  if (!hidden.has('anchor')) {
    ctx.strokeStyle = '#3a3348';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(202, 392, 6, 0, Math.PI);
    ctx.moveTo(202, 392);
    ctx.lineTo(202, 404);
    ctx.moveTo(194, 398);
    ctx.lineTo(210, 398);
    ctx.stroke();
  }
  // Red sailboat, centre.
  ctx.fillStyle = '#8a2f24';
  ctx.beginPath();
  ctx.moveTo(310, 396);
  ctx.lineTo(394, 396);
  ctx.lineTo(380, 414);
  ctx.lineTo(324, 414);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(350, 330, 4, 66);
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.moveTo(354, 334);
  ctx.lineTo(354, 392);
  ctx.lineTo(396, 392);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = hidden.has('sail') ? '#2e6fb0' : '#c0392b';
  ctx.fillRect(354, 360, 30, 12);
  if (!hidden.has('flag')) {
    ctx.fillStyle = '#e8a13a';
    ctx.beginPath();
    ctx.moveTo(354, 330);
    ctx.lineTo(370, 335);
    ctx.lineTo(354, 340);
    ctx.closePath();
    ctx.fill();
  }
  // Yellow rowboat, right, with its oar.
  ctx.fillStyle = '#c9a13a';
  ctx.beginPath();
  ctx.moveTo(452, 462);
  ctx.lineTo(520, 462);
  ctx.lineTo(510, 478);
  ctx.lineTo(462, 478);
  ctx.closePath();
  ctx.fill();
  if (!hidden.has('oar')) {
    ctx.strokeStyle = '#7a5a34';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(486, 452);
    ctx.lineTo(500, 436);
    ctx.stroke();
  }
}

/** Draw the whole harbour into the current clip region. */
export function drawScene(ctx, roundIndex, hidden) {
  drawSky(ctx, roundIndex, hidden);
  drawSea(ctx, roundIndex, hidden);
  drawHeadland(ctx, roundIndex, hidden);
  drawBuildings(ctx, roundIndex, hidden);
  drawBoats(ctx, roundIndex, hidden);
  drawPier(ctx, roundIndex, hidden);
}
