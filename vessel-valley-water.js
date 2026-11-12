(() => {
 'use strict';
 const map=document.querySelector('.map-inner');
 const box=document.getElementById('mapBox');
 if(!map || !box) return;
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('class','valley-water');svg.setAttribute('viewBox','0 0 508 667');svg.setAttribute('aria-hidden','true');
 svg.innerHTML=`<defs>
 <radialGradient id="vv-organism-warmth"><stop stop-color="#ffd1a1" stop-opacity="1"/><stop offset=".5" stop-color="#ff623e" stop-opacity=".7"/><stop offset="1" stop-color="#df3728" stop-opacity="0"/></radialGradient>
 <radialGradient id="vv-neuron-glow"><stop offset="0" stop-color="#f6b3ff" stop-opacity=".8"/><stop offset=".45" stop-color="#c45cff" stop-opacity=".5"/><stop offset="1" stop-color="#a138e4" stop-opacity="0"/></radialGradient>
 <clipPath id="vv-waterfall-stream"><path d="M197 573 Q200 575 207 575 L201 600 L200 624 L186 626 L189 598Z"/></clipPath>
 <clipPath id="vv-shore-only"><path d="M0 185H508V667H0Z M27 190H472V610H27Z" fill-rule="evenodd"/><ellipse cx="194" cy="631" rx="27" ry="15"/></clipPath></defs>
 <g class="neuron-life">
  <circle class="neuron-pulse-ring" cx="132" cy="73" r="13"/>
  <ellipse class="neuron-glow" cx="132" cy="74" rx="23" ry="25" fill="url(#vv-neuron-glow)"/>
  <circle class="neuron-core" cx="132" cy="71" r="7" fill="url(#vv-neuron-glow)"/>
  <path class="neuron-signal" d="M133 69 Q139 57 149 48 Q154 38 156 27"/>
  <path class="neuron-signal signal-two" d="M128 70 Q118 60 111 52 Q104 45 101 34"/>
  <path class="neuron-signal signal-three" d="M139 76 Q153 83 169 89 Q178 91 184 96"/>
 </g>
 <g clip-path="url(#vv-waterfall-stream)">
  <path class="fall-line" d="M201 575 Q192 595 192 624"/>
  <path class="fall-line fall-second" d="M205 576 Q199 599 198 625"/>
  <path class="fall-line fall-fine" d="M198 577 Q190 600 190 622"/>
 </g>
 <ellipse class="waterfall-foam" cx="194" cy="627" rx="9" ry="3"/>
 <path class="waterfall-splash" d="M190 627 Q186 620 182 623 M198 627 Q204 620 207 624"/>
 <ellipse class="foam-ring" cx="194" cy="631" rx="17" ry="5"/>
 <ellipse class="foam-ring" cx="194" cy="631" rx="22" ry="7" style="--delay:-2.4s"/>`;
 for(let i=0;i<9;i++){
  const bubble=document.createElementNS(ns,'circle');
  bubble.setAttribute('class','water-bubble');bubble.setAttribute('cx',String(183+(i*7)%24));bubble.setAttribute('cy',String(627+(i%3)*2));bubble.setAttribute('r',String(1.1+(i%3)*.55));
  bubble.style.cssText=`--duration:${2.6+(i%4)*.6}s;--delay:${-i*.73}s;--drift:${(i%2?1:-1)*(2+i%4)}px`;
  svg.append(bubble);
 }
 // Source-pixel centres measured against the terrain; decorative only.
 const organisms=[ [80.5,130,12,5.1,-1.4], [156.5,142,11,6.3,-5.7], [353,147.5,12,7.1,-3.2], [150,494,12,5.8,-6.1], [298,488,13,6.8,-.8], [231.5,349.9,9,7.7,-8.2] ];
 for(const [x,y,r,duration,delay] of organisms){
  const pulse=document.createElementNS(ns,'circle');pulse.setAttribute('class','organism-pulse');pulse.setAttribute('cx',x);pulse.setAttribute('cy',y);pulse.setAttribute('r',r);pulse.setAttribute('fill','url(#vv-organism-warmth)');pulse.style.cssText=`--pulse-duration:${duration}s;--pulse-delay:${delay}s`;svg.append(pulse);
 }
 const coral=document.createElementNS(ns,'image');
 coral.setAttribute('class','coral-sway');coral.setAttribute('href','artwork-review/coral/coral-layer.png');
 coral.setAttribute('x','0');coral.setAttribute('y','0');coral.setAttribute('width','508');coral.setAttribute('height','667');svg.append(coral);
 map.append(svg);
 let onscreen=false;
 const sync=()=>map.classList.toggle('water-paused',!onscreen||document.hidden||box.classList.contains('hidden'));
 new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;sync();}).observe(map);
 new MutationObserver(sync).observe(box,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);sync();
})();
