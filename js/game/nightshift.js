// Night Shift: the reward game. Guard the city gate with a shield.
// Red packets are attacks: bounce them away. Green packets are friends: let them through.
import { sound, calm } from '../fx.js';

export function startNightShift(canvas, { onScore }) {
  const g = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let shield = W / 2, score = 0, lives = 5, frame = 0, running = true, raf = 0;
  let packets = [];
  const keys = new Set();
  const down = (e) => { if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) { keys.add(e.key); e.preventDefault(); } };
  const up = (e) => keys.delete(e.key);
  const move = (e) => { const r = canvas.getBoundingClientRect(); shield = ((e.clientX - r.left) / r.width) * W; };
  canvas.addEventListener('keydown', down); canvas.addEventListener('keyup', up); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerdown', move);

  function step() {
    frame++;
    if (keys.has('ArrowLeft') || keys.has('a')) shield -= 9;
    if (keys.has('ArrowRight') || keys.has('d')) shield += 9;
    shield = Math.max(60, Math.min(W - 60, shield));
    const every = Math.max(22, 60 - Math.floor(score / 4));
    if (frame % every === 0) packets.push({ x: 40 + Math.random() * (W - 80), y: -20, v: 2.2 + Math.random() * 1.6 + score / 60, bad: Math.random() < 0.7, away: false });
    for (const p of packets) {
      p.y += p.away ? -p.v * 2 : p.v;
      if (!p.away && p.y > H - 62 && p.y < H - 40 && Math.abs(p.x - shield) < 66) {
        if (p.bad) { p.away = true; score++; sound.tick(); onScore(score); } else { p.gone = true; score = Math.max(0, score - 1); sound.buzz(); onScore(score); }
      }
      if (!p.away && p.y > H - 8) { p.gone = true; if (p.bad) { lives--; sound.buzz(); } else { score += 2; sound.coin(); onScore(score); } }
      if (p.y < -40) p.gone = true;
    }
    packets = packets.filter((p) => !p.gone);
    if (lives <= 0) { lives = 5; score = 0; packets = []; onScore(0); }
  }
  function draw() {
    g.fillStyle = '#0a0c16'; g.fillRect(0, 0, W, H);
    if (!calm()) { g.strokeStyle = 'rgba(92,255,143,.12)'; g.lineWidth = 1; for (let x = (frame % 40); x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } }
    g.fillStyle = '#323b5c'; g.fillRect(0, H - 8, W, 8);
    for (const p of packets) { g.fillStyle = p.bad ? '#ff6fae' : '#5cff8f'; g.beginPath(); g.roundRect(p.x - 14, p.y - 14, 28, 28, 7); g.fill(); g.fillStyle = '#12141e'; g.font = 'bold 18px sans-serif'; g.textAlign = 'center'; g.fillText(p.bad ? '!' : '✓', p.x, p.y + 6); }
    g.fillStyle = '#ffc247'; g.beginPath(); g.roundRect(shield - 60, H - 52, 120, 16, 8); g.fill();
    g.fillStyle = '#eef3f0'; g.font = '16px sans-serif'; g.textAlign = 'left'; g.fillText(`Gate strength: ${'■'.repeat(lives)}`, 12, 24);
  }
  function loop() { if (!running) return; if (!document.hidden) { step(); draw(); } raf = requestAnimationFrame(loop); }
  loop();
  return { stop() { running = false; cancelAnimationFrame(raf); canvas.removeEventListener('keydown', down); canvas.removeEventListener('keyup', up); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerdown', move); } };
}
