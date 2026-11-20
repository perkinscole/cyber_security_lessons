// Display settings, chosen by the student, saved on this device and applied before the page draws.
import { h, modal } from './ui.js';
import { isMuted, setMuted } from './fx.js';

const KEY = 'cipher-city:display';
const DEFAULTS = { theme: 'arcade', font: 'standard', size: '1', spacing: 'normal', calm: false };
const OPTIONS = {
  theme: [['arcade', 'Arcade (dark)'], ['light', 'Daylight (light)'], ['contrast', 'High contrast']],
  font: [['standard', 'Standard (Nunito)'], ['hyper', 'Atkinson Hyperlegible'], ['lexend', 'Lexend'], ['system', 'Plain (your device\'s font)']],
  size: [['0.9', 'Small'], ['1', 'Medium'], ['1.15', 'Large'], ['1.3', 'Extra large']],
  spacing: [['normal', 'Normal'], ['wide', 'Wide']],
};

function load() { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (_) { return { ...DEFAULTS }; } }
export function applySettings(v = load()) {
  const root = document.documentElement;
  for (const k of ['theme', 'font', 'spacing']) { if (v[k] === DEFAULTS[k]) root.removeAttribute(`data-${k}`); else root.setAttribute(`data-${k}`, v[k]); }
  root.style.setProperty('--ui-scale', v.size);
  root.toggleAttribute('data-calm', !!v.calm);
}

export function openSettings(onReport) {
  const v = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) { /* still applies for this visit */ } applySettings(v); };
  const pick = (key, label) => h('label.field', h('span', label), h('select', { 'data-setting': key, onchange: (e) => { v[key] = e.target.value; save(); } }, OPTIONS[key].map(([val, text]) => h('option', { value: val, selected: v[key] === val }, text))));
  const close = modal('Display and sound', [
    pick('theme', 'Colors'), pick('font', 'Font'), pick('size', 'Text size'), pick('spacing', 'Line spacing'),
    h('label.check', h('input', { type: 'checkbox', checked: v.calm, 'data-setting': 'calm', onchange: (e) => { v.calm = e.target.checked; save(); } }), 'Less motion (no glow, scan lines or confetti)'),
    h('label.check', h('input', { type: 'checkbox', checked: !isMuted(), 'data-setting': 'sound', onchange: (e) => setMuted(!e.target.checked) }), 'Sounds'),
    onReport && h('button.btn', { onclick: () => { close(); onReport(); } }, 'Report a problem'),
  ]);
}
