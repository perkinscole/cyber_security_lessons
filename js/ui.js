// Small helpers for building the page without a framework.

function fill(el, args) {
  for (const a of args) {
    if (a == null || a === false || a === true) continue;
    if (Array.isArray(a)) fill(el, a);
    else if (a instanceof Node) el.append(a);
    else if (typeof a === 'object') {
      for (const [k, v] of Object.entries(a)) {
        if (v == null || v === false) continue;
        if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'value' || k === 'checked' || k === 'disabled') el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
      }
    } else el.append(String(a));
  }
  return el;
}

/** h('button.btn.small', { onclick }, 'Label'): an element with classes, attributes and children. */
export function h(sel, ...args) {
  const [tag, ...cls] = sel.split('.');
  const el = document.createElement(tag || 'div');
  if (cls.length) el.className = cls.join(' ');
  return fill(el, args);
}
/** The same for SVG. */
export function s(sel, ...args) {
  const [tag, ...cls] = sel.split('.');
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (cls.length) el.setAttribute('class', cls.join(' '));
  return fill(el, args);
}
export const clear = (el) => { el.replaceChildren(); return el; };
/** Add children to an element. Lists are flattened, and false or missing values are skipped. */
export const add = (el, ...children) => fill(el, children);

/** Lesson text may mark **key words**. Everything else is plain text. */
export function rich(text) {
  return String(text).split(/\*\*(.+?)\*\*/g).flatMap((part, i) => (i % 2 ? [h('strong', part)] : part.split(/`([^`]+)`/g).map((bit, j) => (j % 2 ? h('code', bit) : bit))));
}

export function toast(message, kind = '') {
  const el = h(`div.toast${kind ? `.${kind}` : ''}`, message);
  document.getElementById('toasts').append(el);
  setTimeout(() => el.remove(), 4200);
}

/** Run something that may fail. On failure, say why and return undefined. */
export async function attempt(fn) {
  try { return await fn(); } catch (e) {
    if (e.message !== 'SIGNED_OUT') toast(e.message || 'Something went wrong.', 'bad');
    return undefined;
  }
}

/** A dialog. Closes with ✕, Esc or a click outside. Returns a function that closes it. */
export function modal(title, body, { wide = false, onclose } = {}) {
  const root = document.getElementById('modal-root');
  const before = document.activeElement;
  const close = () => { back.remove(); document.removeEventListener('keydown', key); before?.focus?.(); onclose?.(); };
  const key = (e) => { if (e.key === 'Escape') close(); };
  const box = h(`div.modal${wide ? '.wide' : ''}`, { role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div.modal-head', h('h2', title), h('button.btn.small', { onclick: close, 'aria-label': 'Close' }, '✕')), h('div.modal-body.stack', body));
  const back = h('div.modal-back', { onclick: (e) => { if (e.target === back) close(); } }, box);
  root.append(back);
  document.addEventListener('keydown', key);
  (box.querySelector('input, textarea, select, .modal-body button') || box.querySelector('button')).focus();
  return close;
}

/** Copy text. In some frames the clipboard is blocked, so fall back to a hidden text box. */
export async function copy(text) {
  try { await navigator.clipboard.writeText(text); } catch (_) {
    const box = h('textarea', { style: 'position:fixed;opacity:0' });
    box.value = text;
    document.body.append(box);
    box.select();
    document.execCommand('copy');
    box.remove();
  }
  toast('Copied.');
}

export function download(name, text, type = 'text/plain') {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export const ago = (iso) => {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  return min < 1 ? 'just now' : min < 60 ? `${min} min ago` : `${Math.round(min / 60)} h ago`;
};

