/* Outlet A only. Reads completion; never writes player progress or awards. */
(() => {
  'use strict';
  const layer = document.querySelector('.outlet-a-layer');
  const box = document.getElementById('mapBox');
  if (!layer || !box) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new Set();
  let player = null;
  let pending = false;
  let visible = false;
  const key = name => `neuroQuest:vesselValley:outletA:revealed:${encodeURIComponent(name)}`;

  function sync() {
    const active = visible && !document.hidden && !box.classList.contains('hidden');
    layer.classList.toggle('is-paused', !active);
    layer.classList.toggle('is-leaking', active && !pending && layer.classList.contains('is-unlocked') && !layer.classList.contains('is-revealing'));
    if (!active || !pending) return;
    pending = false;
    layer.classList.toggle('is-revealing', !motion.matches);
    seen.add(player);
    try { localStorage.setItem(key(player), 'seen'); } catch (_) { /* Session memory remains. */ }
    layer.classList.toggle('is-leaking', !layer.classList.contains('is-revealing'));
  }

  function update(name, progress) {
    if (name !== player) {
      player = name;
      pending = false;
      layer.classList.remove('is-unlocked', 'is-revealing', 'is-leaking');
    }
    // Boolean true is an availability marker in this project, not completion.
    if (!name || progress?.AChA?.completed !== true) {
      pending = false;
      layer.classList.remove('is-unlocked', 'is-revealing', 'is-leaking');
      return;
    }
    if (!layer.classList.contains('is-unlocked')) {
      let alreadySeen = seen.has(name);
      try { alreadySeen = alreadySeen || localStorage.getItem(key(name)) === 'seen'; } catch (_) {}
      layer.classList.add('is-unlocked');
      pending = !alreadySeen;
    }
    sync();
  }

  function refresh() {
    try {
      const name = localStorage.getItem('currentPlayer');
      const progress = JSON.parse(localStorage.getItem('neuroProgress') || '{}');
      update(name, progress?.[name] || {});
    } catch (_) { update(null, {}); }
  }
  layer.addEventListener('animationend', event => {
    if (event.animationName === 'outlet-a-rise') {
      layer.classList.remove('is-revealing');
      sync();
    }
  });
  motion.addEventListener('change', () => {
    if (motion.matches) layer.classList.remove('is-revealing');
    sync();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(layer.querySelector('.outlet-a-viewport'));
  new MutationObserver(sync).observe(box, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', event => {
    if (event.key === 'currentPlayer' || event.key === 'neuroProgress' || event.key === null) refresh();
  });
  window.vesselValleyOutlet = { update };
})();
