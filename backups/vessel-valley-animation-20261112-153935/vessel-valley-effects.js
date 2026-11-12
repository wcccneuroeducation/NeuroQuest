/* Decorative only: no frame loop, particle spawning, or navigation changes. */
(() => {
  'use strict';
  const map = document.querySelector('.map-inner');
  const box = document.getElementById('mapBox');
  if (!map || !box) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const effects = document.createElementNS(ns, 'svg');
  effects.setAttribute('viewBox', '0 0 493 667');
  effects.setAttribute('aria-hidden', 'true');
  effects.setAttribute('preserveAspectRatio', 'none');
  effects.classList.add('valley-effects');
  // The shore PNG's alpha is the water mask: no ripples can cover paths or rocks.
  effects.innerHTML = `<defs>
    <mask id="valley-water" style="mask-type:alpha"><image href="vessel_valley_wave1.png" width="493" height="667"/></mask>
    <path id="valley-pipe-shape" d="M216 535 Q226 535 232 542 L226 554 L219 568 L213 584 Q213 593 207 596 Q200 598 196 591 Q194 586 198 579 L205 562 L211 548 Z"/>
    <clipPath id="valley-outlet"><use href="#valley-pipe-shape"/></clipPath>
    <radialGradient id="valley-red-plume"><stop stop-color="#ce5b46"/><stop offset="1" stop-color="#ce5b46" stop-opacity="0"/></radialGradient>
  </defs>
  <g mask="url(#valley-water)">
    <image class="shore" href="vessel_valley_wave1.png" width="493" height="667"/>
    <image class="shore second" href="vessel_valley_wave2.png" width="493" height="667"/>
    <path class="water-glint" d="M25 218q12 12 29 8 M420 356q18 12 26-3 M103 552q7 12 20 13 M249 648q22 0 31-13" fill="none" stroke="#fffbe1" stroke-width="2"/>
  </g>
  <path class="waterfall" d="M185 594 Q181 612 184 630 M190 598 Q187 615 190 632"/>
  <g mask="url(#valley-water)">
    <ellipse class="foam" cx="188" cy="633" rx="14" ry="5"/>
    <ellipse class="splash" cx="188" cy="632" rx="17" ry="6"/>
    ${Array.from({length:9}, (_, i) => `<circle class="bubble" cx="${179 + (i * 7 % 21)}" cy="${632 + i % 3}" r="${1 + i % 4 * .45}" style="--duration:${2.1+i*.23}s;--delay:-${i*.61}s;--drift:${(i%2?1:-1)*(3+i%5)}px;--alpha:${.24+i%4*.09}"/>`).join('')}
  </g>
  <svg x="190" y="532" width="49" height="70" viewBox="190 532 49 70" overflow="hidden">
    <image class="pipe" style="--stagger:0s" href="vessel_valley.png" width="493" height="667" clip-path="url(#valley-outlet)"/>
  </svg>
  <svg x="265" y="567" width="39.2" height="56" viewBox="190 532 49 70" overflow="hidden">
    <image class="pipe" style="--stagger:.24s" href="vessel_valley.png" width="493" height="667" clip-path="url(#valley-outlet)"/>
  </svg>
  ${[0,1].map(p => `<g transform="${p?'translate(113 141.4) scale(.8)':'translate(0 0)'}">${Array.from({length:4},(_,i)=>`<circle class="puff" cx="${199+i*7}" cy="592" r="${2+i%2}" style="--stagger:${.25+p*.24}s;--drift:${(i-1.5)*6}px;transform-origin:${199+i*7}px 592px"/>`).join('')}</g>`).join('')}
  <g class="leak">
    <ellipse class="plume" cx="203" cy="632" rx="17" ry="7" mask="url(#valley-water)"/>
    <ellipse class="impact" cx="203" cy="628" rx="7" ry="2.5" mask="url(#valley-water)"/>
    <ellipse class="drop" cx="203" cy="592" rx="1.3" ry="2.6" style="--delay:0s"/>
    <ellipse class="drop" cx="204" cy="592" rx=".9" ry="1.8" style="--delay:1s"/>
  </g>`;
  map.insertBefore(effects, map.querySelector('.hotspot'));
  document.querySelectorAll('.hotspot').forEach(button => {
    const level = button.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
    if (level) button.setAttribute('aria-label', `Open ${level} level`);
  });
  let currentPlayer;
  let revealed = false;
  let visible = false;
  let pendingReveal = false;
  let pendingSave = null;
  const seenPlayers = new Set();
  function syncActivity() {
    const active = visible && !document.hidden && !box.classList.contains('hidden');
    effects.classList.toggle('paused', !active);
    map.classList.toggle('effects-paused', !active);
    if (active && pendingSave) {
      seenPlayers.add(currentPlayer);
      try { localStorage.setItem(pendingSave, 'unlocked'); } catch (_) { /* Remember within this visit. */ }
      pendingSave = null;
    }
    if (active && pendingReveal) {
      pendingReveal = false;
      effects.classList.add('revealing');
    }
  }
  function update(player, progress) {
    if (player !== currentPlayer) {
      currentPlayer = player;
      revealed = false;
      pendingReveal = false;
      pendingSave = null;
      effects.classList.remove('unlocked', 'revealing');
    }
    if (!player) return;
    const key = `neuroQuest:vesselValley:pipes:${encodeURIComponent(player)}`;
    let saved = seenPlayers.has(player);
    try { saved = saved || localStorage.getItem(key) === 'unlocked'; } catch (_) { /* Session still works. */ }
    const finalComplete = progress.AChA === true || progress.AChA?.completed === true;
    if (!saved && !finalComplete) return;
    effects.classList.add('unlocked');
    if (!saved && !revealed) {
      revealed = true;
      pendingReveal = !reducedMotion.matches;
      pendingSave = key;
    }
    syncActivity();
  }
  effects.addEventListener('animationend', event => {
    if (event.animationName === 'pipe-emerge' && event.target.style.getPropertyValue('--stagger') === '.24s') {
      effects.classList.remove('revealing');
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { pendingReveal = false; effects.classList.remove('revealing'); }
    syncActivity();
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncActivity(); }).observe(map);
  new MutationObserver(syncActivity).observe(box, {attributes:true, attributeFilter:['class']});
  document.addEventListener('visibilitychange', syncActivity);
  window.addEventListener('pageshow', () => { window.updateMapProgress?.(); syncActivity(); });
  window.addEventListener('storage', event => {
    if (['neuroProgress', 'currentPlayer'].includes(event.key)) window.updateMapProgress?.();
  });
  window.vesselValleyEffects = { update };
  syncActivity();
})();
