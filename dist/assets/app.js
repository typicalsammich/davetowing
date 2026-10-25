const menu=document.querySelector('#menu'),nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');document.querySelector('.dropdown').classList.remove('open');document.querySelector('.dropdown-toggle').setAttribute('aria-expanded','false')}});document.querySelector('.dropdown-toggle').addEventListener('click',e=>{const open=e.currentTarget.parentElement.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)});document.querySelectorAll('nav a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page')});const sticky=document.querySelector('.mobile-call');new IntersectionObserver(entries=>{sticky.classList.toggle('visible',!entries[0].isIntersecting)},{threshold:0}).observe(document.querySelector('.hero,.page-hero'));const steps=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('active')}),{threshold:.6});document.querySelectorAll('.steps article').forEach(e=>steps.observe(e));const viewer=document.querySelector('#viewer');document.querySelector('.gallery-open')?.addEventListener('click',()=>viewer.showModal());document.querySelector('#close-viewer').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});document.querySelector('#check-location')?.addEventListener('click',()=>{const value=document.querySelector('#location').value.trim();document.querySelector('#location-result').textContent=value?'When you call, tell Dave your pickup location is '+value+'. Call 414-629-3990 to confirm coverage and availability. This does not request or confirm dispatch.':'Please enter your pickup city, ZIP code, or a nearby landmark.'});

// Five-second artwork-based cinematic; no video or simulated vehicle physics.
const config=window.DAVE_CONFIG;
const hero=document.querySelector('.hero');
const motion=matchMedia('(prefers-reduced-motion:reduce)');
const cinematicKey='dave-artwork-intro-v1';
if(hero&&config.cinematicEnabled!==false){
 const content=hero.querySelector('.hero-content');
 const artwork=hero.querySelector('.hero-image');
 const effects=document.createElement('div');effects.className='cin-effects';effects.setAttribute('aria-hidden','true');
 effects.innerHTML='<div class="cin-dark"></div><div class="cin-amber"></div><div class="cin-grain"></div><div class="cin-title"><span>THE MIDNIGHT RECOVERY</span><strong>HELP IS ON THE WAY.</strong></div><div class="cin-progress"></div>';
 const controls=document.createElement('div');controls.className='cin-controls';
 const skip=document.createElement('button');skip.type='button';skip.className='cin-skip';skip.textContent='SKIP INTRO';
 const replay=document.createElement('button');replay.type='button';replay.className='cin-replay';replay.textContent='REPLAY INTRO';replay.setAttribute('aria-label','Replay The Midnight Recovery animated introduction');
 controls.append(skip,replay);hero.append(effects,controls);
 let active=false,timer=null,loadTimer=null;
 function remember(){try{sessionStorage.setItem(cinematicKey,'1')}catch{}}
 function finish(){
  if(!active)return;active=false;clearTimeout(timer);clearTimeout(loadTimer);
  const focused= document.activeElement===skip;
  hero.classList.remove('cin-playing');hero.classList.add('cin-ready');content.inert=false;content.removeAttribute('aria-hidden');remember();
  if(focused)replay.focus({preventScroll:true});
 }
 function play(manual=false){
  if(active||motion.matches)return;
  if(!manual&&navigator.connection?.saveData)return;
  active=true;hero.classList.add('cin-playing');content.inert=true;content.setAttribute('aria-hidden','true');
  timer=setTimeout(finish,5200);
 }
 skip.addEventListener('click',finish);
 replay.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'instant'});play(true)});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')finish()});
 motion.addEventListener('change',event=>{if(event.matches)finish();controls.hidden=motion.matches});controls.hidden=motion.matches;
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish()});
 artwork.addEventListener('error',finish);
 let seen=false;try{seen=sessionStorage.getItem(cinematicKey)==='1'}catch{}
 if(!seen&&!motion.matches&&!navigator.connection?.saveData){
  if(artwork.complete&&artwork.naturalWidth>0)play();
  else{loadTimer=setTimeout(()=>{loadTimer=null},1800);artwork.addEventListener('load',()=>{if(loadTimer){clearTimeout(loadTimer);loadTimer=null;play()}},{once:true})}
 }
}
