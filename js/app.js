// What every screen shares: the store, who is signed in, and moving between screens.
import { createLocalStore } from './data/local.js';
import { createHostedStore } from './data/hosted.js';
import { runStep } from './engine/sandbox.js';

const wantsHosted = document.querySelector('meta[name="cc-store"]')?.content === 'hosted';
/** ?demo on the hosted site: made-up students, kept in this browser, nothing sent. */
export const demo = new URLSearchParams(location.search).has('demo');
export const store = wantsHosted && !demo
  ? createHostedStore({ runner: runStep })
  : createLocalStore({ runner: runStep, loadKeys: async () => (await import('../answers/index.js')).KEYS });

export const app = { session: null, home: null };
export const go = (path) => { if (location.hash === `#${path}`) window.dispatchEvent(new Event('hashchange')); else location.hash = path; };
/** A link someone can open on another device: this page's address with a different #place. */
export const linkTo = (hash, query = '') => `${location.origin}${location.pathname}${query}${hash ? `#${hash}` : ''}`;
