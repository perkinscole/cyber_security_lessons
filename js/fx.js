// Sounds (made in the browser, no files), small celebrations and the idle hint. The mute choice is remembered on this device.
import { h } from './ui.js';

const KEY = 'cipher-city:sound';
let ctx = null;
let muted = false;
try { muted = localStorage.getItem(KEY) === 'off'; } catch (_) { /* storage may be off */ }
export const isMuted = () => muted;
export function setMuted(on) { muted = on; try { localStorage.setItem(KEY, on ? 'off' : 'on'); } catch (_) { /* fine */ } }

function tone(freq, start, length, type = 'square', gain = 0.06) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + length);
  } catch (_) { /* no audio on this device */ }
}
const seq = (notes, step, type) => notes.forEach((f, i) => tone(f, i * step, step * 1.6, type));
export const sound = {
  tick: () => tone(880, 0, 0.07),
  good: () => seq([660, 990], 0.08),
  coin: () => seq([988, 1319], 0.07),
  buzz: () => tone(140, 0, 0.22, 'sawtooth', 0.07),
  pass: () => seq([523, 659, 784, 1047], 0.11),
  badge: () => seq([784, 988, 1175, 1568], 0.09, 'triangle'),
  level: () => seq([523, 659, 784, 1047, 1319, 1568], 0.1),
};

export const calm = () => document.documentElement.hasAttribute('data-calm') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** "+10 XP" floating up from an element. */
export function floatXp(from, amount) {
  sound.coin();
  if (calm() || !from?.isConnected) return;
  const r = from.getBoundingClientRect();
  const el = h('div.fx-xp', { style: `left:${r.left + r.width / 2}px;top:${r.top}px` }, `+${amount} XP`);
  document.body.append(el);
  setTimeout(() => el.remove(), 1200);
}

export function confetti() {
  if (calm()) return;
  const box = h('div.fx-confetti', { 'aria-hidden': 'true' });
  const colors = ['#5cff8f', '#ffc247', '#ff6fae', '#5fd4ff', '#9a7bff'];
  for (let i = 0; i < 60; i++) box.append(h('i', { style: `left:${Math.random() * 100}%;background:${colors[i % 5]};animation-delay:${Math.random() * 0.5}s;animation-duration:${1.6 + Math.random()}s` }));
  document.body.append(box);
  setTimeout(() => box.remove(), 3200);
}

/** A button that is not ready yet stays clickable, so the click can say what is missing. */
export function refuse(button, message, missing) {
  sound.buzz();
  button.classList.remove('shake'); void button.offsetWidth; button.classList.add('shake');
  const note = button.closest('.gate')?.querySelector('.gate-note');
  if (note) { note.textContent = message; note.classList.add('bad'); }
  if (missing) { missing.classList.add('missing'); missing.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' }); setTimeout(() => missing.classList.remove('missing'), 2500); }
}

// Idle hint: after 45 seconds with nothing happening, point at the next thing to do.
let idleTimer = null;
function clearNudge() { document.querySelectorAll('.nudged').forEach((el) => el.classList.remove('nudged')); document.querySelector('.nudge-bubble')?.remove(); }
function nudge() {
  if (document.hidden || document.querySelector('.modal-back')) return;
  const target = [...document.querySelectorAll('[data-nudge]')].find((el) => el.offsetParent);
  if (!target) return;
  target.classList.add('nudged');
  const bubble = h('button.nudge-bubble', { onclick: () => { target.scrollIntoView({ block: 'center' }); clearNudge(); } }, `👉 ${target.dataset.nudge}`);
  document.body.append(bubble);
}
function resetIdle() { clearNudge(); clearTimeout(idleTimer); idleTimer = setTimeout(nudge, 45000); }
export function startIdleHints() {
  for (const ev of ['click', 'keydown', 'scroll']) document.addEventListener(ev, resetIdle, { passive: true, capture: true });
  // Time spent in another tab is not counted as being stuck.
  document.addEventListener('visibilitychange', resetIdle);
  resetIdle();
}

/** Read text aloud with the browser's own voice. */
export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
  speechSynthesis.speak(new SpeechSynthesisUtterance(text.replace(/\*\*|`/g, '')));
}
