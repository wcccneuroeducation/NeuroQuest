/* Connector reveals read completion only; never change scores or availability. */
(() => {
 'use strict';
 const gates = p => ({upper:p?.ICA?.completed===true,lower:p?.ACA?.completed===true && p?.MCA?.completed===true});
 window.vesselValleyConnections={gates};
 const map=document.querySelector('.map-inner'), box=document.getElementById('mapBox');
 if(!map || !box) return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const seen=new Set();let player=null, onscreen=false;
 const groups=['upper','lower'].map(id=>{
  const image=document.createElement('img');image.className=`connection-layer connection-${id}`;image.alt='';image.setAttribute('aria-hidden','true');image.src=`artwork-review/connector-stages/${id}.png`;
  const group={id,image,unlocked:false,pending:false};
  image.addEventListener('load',sync);image.addEventListener('animationend',()=>image.classList.remove('connection-revealing'));map.append(image);return group;
 });
 const key=id=>`neuroQuest:vesselValley:connections:v1:${encodeURIComponent(player)}:${id}`;
 function sync(){
  const active=onscreen&&!document.hidden&&!box.classList.contains('hidden');
  map.classList.toggle('connections-paused',!active);
  for(const group of groups){
   if(!active||!group.pending||!group.image.complete||!group.image.naturalWidth) continue;
   group.pending=false;group.image.classList.add('connection-visible');
   if(!motion.matches) group.image.classList.add('connection-revealing');
   const marker=key(group.id);seen.add(marker);try{localStorage.setItem(marker,'seen');}catch(_){}
  }
 }
 function update(name,progress){
  if(name!==player){player=name;for(const group of groups){group.unlocked=false;group.pending=false;group.image.classList.remove('connection-visible','connection-revealing');}}
  const unlocked=gates(progress);
  for(const group of groups){
   if(!name||!unlocked[group.id]){group.unlocked=false;group.pending=false;group.image.classList.remove('connection-visible','connection-revealing');continue;}
   if(group.unlocked) continue;
   group.unlocked=true;let alreadySeen=seen.has(key(group.id));try{alreadySeen=alreadySeen||localStorage.getItem(key(group.id))==='seen';}catch(_){}
   if(alreadySeen)group.image.classList.add('connection-visible');else group.pending=true;
  }
  sync();
 }
 function refresh(){try{const name=localStorage.getItem('currentPlayer');const all=JSON.parse(localStorage.getItem('neuroProgress')||'{}');update(name,all?.[name]||{});}catch(_){update(null,{});}}
 new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;sync();}).observe(map);
 new MutationObserver(sync).observe(box,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);window.addEventListener('pageshow',refresh);
 window.addEventListener('storage',event=>{if(event.key==='currentPlayer'||event.key==='neuroProgress'||event.key===null)refresh();});
 motion.addEventListener('change',()=>{if(motion.matches)for(const group of groups)group.image.classList.remove('connection-revealing');sync();});
 window.vesselValleyConnections.update=update;refresh();
})();
