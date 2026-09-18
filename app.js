(function () {
  'use strict';

  const modules = new Map();
  const app = document.getElementById('app');
  const announcer = document.getElementById('announcer');
  let active = null;

  function register(definition) {
    if (!definition || !/^[a-z][a-z0-9-]+$/.test(definition.id) || typeof definition.mount !== 'function') {
      throw new TypeError('Invalid activity definition.');
    }
    modules.set(definition.id, Object.freeze(definition));
  }

  window.OpenOracy = Object.freeze({ register });

  function announce(message) {
    announcer.textContent = '';
    window.setTimeout(function () { announcer.textContent = message; }, 20);
  }

  function cleanup() {
    if (!active) return;
    active.destroy();
    active = null;
  }

  function makeApi(host) {
    let live = true;
    const cleanups = [];
    return {
      host,
      announce,
      on(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        cleanups.push(function () { target.removeEventListener(event, handler, options); });
      },
      interval(handler, milliseconds) {
        const id = window.setInterval(function () { if (live && !document.hidden) handler(); }, milliseconds);
        cleanups.push(function () { window.clearInterval(id); });
      },
      timeout(handler, milliseconds) {
        const id = window.setTimeout(function () { if (live) handler(); }, milliseconds);
        cleanups.push(function () { window.clearTimeout(id); });
      },
      addCleanup(handler) { cleanups.push(handler); },
      isLive() { return live; },
      destroy() {
        if (!live) return;
        live = false;
        cleanups.splice(0).reverse().forEach(function (handler) {
          try { handler(); } catch (_) { /* Cleanup must be best-effort. */ }
        });
      }
    };
  }

  function go(id) {
    const nextHash = id ? '#' + id : '#home';
    if (window.location.hash === nextHash) render();
    else window.location.hash = nextHash;
  }

  function renderHome() {
    document.title = 'Open Oracy Classroom';
    const cards = Array.from(modules.values()).map(function (module, index) {
      return '<article class="activity-card">' +
        '<span class="number">0' + (index + 1) + ' · OPEN REFERENCE ACTIVITY</span>' +
        '<h2>' + module.title + '</h2>' +
        '<p>' + module.summary + '</p>' +
        '<button class="button primary" type="button" data-open="' + module.id + '">Open activity</button>' +
      '</article>';
    }).join('');

    app.innerHTML = '<section class="hero">' +
      '<span class="eyebrow">Open, local-first and teacher-led</span>' +
      '<h1>Talk with purpose.</h1>' +
      '<p>Three runnable classroom references demonstrate how technology can scaffold speaking, listening, reasoning and reflection without ranking children or sending classroom data to a server.</p>' +
      '<div class="scope-note"><b>AI status</b><p>The teacher-facing AI scaffolding component described in the funding proposal is proposed work. It is not implemented in this repository.</p></div>' +
      '</section><section class="catalog" aria-label="Reference activities">' + cards + '</section>';

    app.querySelectorAll('[data-open]').forEach(function (button) {
      button.addEventListener('click', function () { go(button.dataset.open); });
    });
    app.focus({ preventScroll: true });
  }

  function renderActivity(module) {
    document.title = module.title + ' · Open Oracy Classroom';
    app.innerHTML = '<section class="activity-shell">' +
      '<header class="activity-heading"><div><span class="eyebrow">Open reference activity</span><h1>' + module.title + '</h1><p>' + module.summary + '</p></div>' +
      '<button class="button" type="button" data-back>All activities</button></header>' +
      '<div data-activity></div></section>';
    app.querySelector('[data-back]').addEventListener('click', function () { go(''); });
    const api = makeApi(app.querySelector('[data-activity]'));
    const instance = module.mount(api.host, api) || {};
    active = {
      destroy() {
        if (typeof instance.destroy === 'function') instance.destroy();
        api.destroy();
      }
    };
    app.focus({ preventScroll: true });
    announce(module.title + ' opened.');
  }

  function render() {
    cleanup();
    const id = window.location.hash.replace(/^#/, '');
    const module = modules.get(id);
    if (module) renderActivity(module);
    else renderHome();
  }

  document.querySelector('[data-home]').addEventListener('click', function () { go(''); });
  window.addEventListener('hashchange', render);
  window.addEventListener('pagehide', cleanup);
  window.addEventListener('DOMContentLoaded', render, { once: true });
}());

