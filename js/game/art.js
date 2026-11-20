// All of Cipher City's pictures, drawn in code. Original artwork: simple shapes, no outside files.
import { s } from '../ui.js';
import { BODY_COLORS } from './rules.js';

/** The student's operator: a chunky rounded character with a visor, a hat and something to hold. */
export function operator(a = {}, size = 72) {
  const body = BODY_COLORS[a.body] || BODY_COLORS[0];
  const dark = '#12141e';
  const visor = [
    s('rect', { x: 20, y: 30, width: 40, height: 12, rx: 6, fill: dark }),
    [s('circle', { cx: 31, cy: 36, r: 7, fill: dark }), s('circle', { cx: 49, cy: 36, r: 7, fill: dark })],
    s('path', { d: 'M18 30h44l-4 12H46l-6-6-6 6H22z', fill: dark }),
    [s('rect', { x: 18, y: 31, width: 44, height: 10, rx: 2, fill: dark }), s('rect', { x: 22, y: 34, width: 36, height: 3, fill: '#5cff8f' })],
    s('path', { d: 'M40 26l3.5 7 7.5 1-5.5 5 1.5 8-7-4-7 4 1.5-8-5.5-5 7.5-1z', fill: dark }),
  ][a.visor || 0];
  const top = [
    null,
    [s('rect', { x: 38.5, y: 4, width: 3, height: 12, fill: '#c9d3e0' }), s('circle', { cx: 40, cy: 5, r: 4, fill: '#ff6fae' })],
    s('path', { d: 'M16 22a24 16 0 0 1 48 0h8v5H16z', fill: '#ffc247' }),
    [s('path', { d: 'M14 36a26 26 0 0 1 52 0', fill: 'none', stroke: '#c9d3e0', 'stroke-width': 4 }), s('rect', { x: 9, y: 32, width: 9, height: 14, rx: 4, fill: '#5fd4ff' }), s('rect', { x: 62, y: 32, width: 9, height: 14, rx: 4, fill: '#5fd4ff' })],
    s('path', { d: 'M22 18l6-12 6 9 6-12 6 12 6-9 6 12z', fill: '#ffc247' }),
  ][a.top || 0];
  const deck = [
    null,
    [s('rect', { x: 22, y: 60, width: 36, height: 12, rx: 3, fill: '#2a3050' }), s('rect', { x: 26, y: 63, width: 28, height: 2, fill: '#5cff8f' }), s('rect', { x: 26, y: 67, width: 20, height: 2, fill: '#5cff8f' })],
    [s('rect', { x: 27, y: 56, width: 26, height: 18, rx: 3, fill: '#2a3050' }), s('rect', { x: 30, y: 59, width: 20, height: 12, fill: '#5fd4ff' })],
    s('path', { d: 'M40 54l14 5v8c0 6-6 10-14 12-8-2-14-6-14-12v-8z', fill: '#5fd4ff', stroke: dark, 'stroke-width': 2 }),
    [s('circle', { cx: 32, cy: 64, r: 7, fill: 'none', stroke: '#ffc247', 'stroke-width': 4 }), s('rect', { x: 38, y: 62, width: 20, height: 4, fill: '#ffc247' }), s('rect', { x: 50, y: 66, width: 4, height: 5, fill: '#ffc247' })],
  ][a.deck || 0];
  return s('svg', { viewBox: '0 0 80 80', width: size, height: size, 'aria-hidden': 'true', class: 'operator' },
    s('rect', { x: 14, y: 14, width: 52, height: 62, rx: 20, fill: body, stroke: dark, 'stroke-width': 3 }),
    s('rect', { x: 22, y: 48, width: 36, height: 4, rx: 2, fill: dark, opacity: 0.25 }),
    visor, top, deck);
}

const BOT_COLORS = ['#5cff8f', '#ffc247', '#ff6fae', '#5fd4ff', '#9a7bff', '#9be24a'];
/** A sidekick bot. Each badge has its own, made from the letters of its name so it always looks the same. */
export function bot(id, size = 56, locked = false) {
  let n = 0;
  for (const c of String(id)) n = (n * 33 + c.charCodeAt(0)) >>> 0;
  const color = locked ? '#59627a' : BOT_COLORS[n % BOT_COLORS.length];
  const dark = '#12141e';
  const round = [4, 12, 22][(n >> 3) % 3];
  const eyes = (n >> 5) % 3;
  const ears = (n >> 7) % 3;
  return s('svg', { viewBox: '0 0 60 60', width: size, height: size, 'aria-hidden': 'true' },
    ears === 0 && [s('rect', { x: 28, y: 2, width: 4, height: 10, fill: color }), s('circle', { cx: 30, cy: 4, r: 4, fill: color })],
    ears === 1 && [s('rect', { x: 4, y: 24, width: 8, height: 14, rx: 3, fill: color }), s('rect', { x: 48, y: 24, width: 8, height: 14, rx: 3, fill: color })],
    ears === 2 && [s('path', { d: 'M14 14l4-10 8 8zM46 14l-4-10-8 8z', fill: color })],
    s('rect', { x: 10, y: 12, width: 40, height: 38, rx: round, fill: color, stroke: dark, 'stroke-width': 3 }),
    eyes === 0 && [s('circle', { cx: 22, cy: 28, r: 5, fill: dark }), s('circle', { cx: 38, cy: 28, r: 5, fill: dark })],
    eyes === 1 && s('rect', { x: 16, y: 23, width: 28, height: 9, rx: 4, fill: dark }),
    eyes === 2 && [s('rect', { x: 17, y: 24, width: 8, height: 8, fill: dark }), s('rect', { x: 35, y: 24, width: 8, height: 8, fill: dark })],
    s('rect', { x: 22, y: 38, width: 16, height: 4, rx: 2, fill: dark }),
    s('rect', { x: 16, y: 50, width: 8, height: 7, rx: 2, fill: color }), s('rect', { x: 36, y: 50, width: 8, height: 7, rx: 2, fill: color }));
}

const HEIGHTS = [70, 104, 86, 128, 94, 150, 112, 136, 98, 168];
const NEON = ['#5cff8f', '#ffc247', '#ff6fae', '#5fd4ff'];
/**
 * A district's skyline: one building for each lesson.
 *   mine:   { lessonId: 'done' | 'started' | 'new' }  the viewer's own lessons (a done one gets a neon outline and a beacon)
 *   counts: { lessonId: how many of the class finished it }, size: how many students. Windows light up as the class finishes.
 */
export function city(lessons, { mine = {}, counts = {}, size = 0 } = {}) {
  const w = 1000, hgt = 250, ground = 222, bw = 78, gap = 18;
  const x0 = (w - lessons.length * (bw + gap) + gap) / 2;
  const stars = [];
  for (let i = 0; i < 26; i++) stars.push(s('rect', { x: (i * 137) % w, y: (i * 53) % 90 + 6, width: 2, height: 2, fill: '#ffffff', opacity: 0.25 + ((i * 7) % 5) / 10 }));
  const buildings = lessons.map((l, i) => {
    const bh = HEIGHTS[i % HEIGHTS.length], x = x0 + i * (bw + gap), y = ground - bh;
    const lit = mine[l.id] === 'done';
    const share = size ? (counts[l.id] || 0) / size : lit ? 1 : 0;
    const color = NEON[i % NEON.length];
    const rows = Math.floor((bh - 22) / 18), cols = 4, total = rows * cols, on = Math.round(total * share);
    const windows = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const k = (r * 7 + c * 3 + i) % total; // spread the lit windows around
      windows.push(s('rect', { x: x + 10 + c * 16, y: y + 14 + r * 18, width: 10, height: 10, rx: 2, fill: k < on ? color : '#232842' }));
    }
    return s('g', { 'data-lesson': l.id, 'data-lit': lit ? '1' : '0' },
      s('rect', { x, y, width: bw, height: bh, rx: 6, fill: '#141829', stroke: lit ? color : '#323b5c', 'stroke-width': lit ? 3 : 2 }),
      windows,
      lit && s('circle', { cx: x + bw / 2, cy: y - 7, r: 5, fill: color }),
      s('text', { x: x + bw / 2, y: ground + 20, 'text-anchor': 'middle', fill: '#a9b4c9', 'font-size': 15, 'font-family': 'ui-monospace, monospace' }, String(i + 1)));
  });
  const done = lessons.filter((l) => mine[l.id] === 'done').length;
  return s('svg', { viewBox: `0 0 ${w} ${hgt}`, class: 'city', role: 'img', 'aria-label': size ? `The class city. ${Object.values(counts).reduce((a, b) => a + b, 0)} buildings lit by the class so far.` : `Your city. ${done} of ${lessons.length} buildings lit.` },
    stars, s('rect', { x: 0, y: ground, width: w, height: 3, fill: '#323b5c' }), buildings);
}
