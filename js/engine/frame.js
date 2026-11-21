// Runs inside the sandbox frame: a frame with no access to the page around it, its storage or its sign-in.
// Each run gets a brand-new worker, which is stopped when it finishes or takes too long.
// This file is not loaded by address. sandbox.js reads its text and writes it into the frame, and
// the browser runs it only because its exact fingerprint (a SHA-256 hash) is named in the site's
// rule and in the frame's own. Change one character here and the fingerprint the server sends
// changes with it. The frame's rule allows that one script and workers made from text, and
// nothing else, so no request of any kind can be made from in here. As a second lock, the
// network tools are also removed from the worker before the student's code starts.
(function () {
  'use strict';
  // One line, so it does not shift the line numbers in error messages.
  var GUARD = '(function(){var g=self,names=["fetch","XMLHttpRequest","WebSocket","EventSource","importScripts","Worker","SharedWorker","BroadcastChannel","indexedDB","caches","Request","WebTransport","RTCPeerConnection","Notification"];'
    + 'for(var i=0;i<names.length;i++){try{Object.defineProperty(g,names[i],{value:undefined,writable:false,configurable:false})}catch(e){try{g[names[i]]=undefined}catch(e2){}}}'
    + 'try{Object.defineProperty(g.navigator,"sendBeacon",{value:undefined})}catch(e){}})();';
  var worker = null, timer = null;
  function stop() { if (worker) { worker.terminate(); worker = null; } clearTimeout(timer); }
  function reply(id, text) { parent.postMessage({ cc: 'ran', id: id, text: text }, '*'); }
  function problem(id, name, message, line) {
    reply(id, JSON.stringify({ out: [], got: [], error: { name: name, message: message, stack: '', line: line || 0 } }));
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (e.source !== parent || !d || d.cc !== 'run' || typeof d.program !== 'string') return;
    stop();
    var url = URL.createObjectURL(new Blob([GUARD + d.program + '\npostMessage(__result);'], { type: 'text/javascript' }));
    try { worker = new Worker(url); } catch (err) { URL.revokeObjectURL(url); problem(d.id, 'Error', 'This browser could not start the code runner.'); return; }
    worker.onmessage = function (m) { stop(); URL.revokeObjectURL(url); reply(d.id, String(m.data)); };
    // A mistake the computer cannot even read (a missing bracket, say) never starts running: it lands here.
    worker.onerror = function (err) { err.preventDefault(); stop(); URL.revokeObjectURL(url); problem(d.id, 'SyntaxError', String(err.message || 'The code could not be read.').replace(/^Uncaught (\w+: )?/, ''), err.lineno); };
    timer = setTimeout(function () { stop(); URL.revokeObjectURL(url); problem(d.id, 'Timeout', 'TIMEOUT'); }, Math.min(5000, d.ms || 2000));
  });
  parent.postMessage({ cc: 'ready' }, '*');
})();
