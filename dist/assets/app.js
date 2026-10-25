const menu=document.querySelector('#menu'),nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');document.querySelector('.dropdown').classList.remove('open');document.querySelector('.dropdown-toggle').setAttribute('aria-expanded','false')}});document.querySelector('.dropdown-toggle').addEventListener('click',e=>{const open=e.currentTarget.parentElement.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)});document.querySelectorAll('nav a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page')});const sticky=document.querySelector('.mobile-call');new IntersectionObserver(entries=>{sticky.classList.toggle('visible',!entries[0].isIntersecting)},{threshold:0}).observe(document.querySelector('.hero,.page-hero'));const steps=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('active')}),{threshold:.6});document.querySelectorAll('.steps article').forEach(e=>steps.observe(e));const viewer=document.querySelector('#viewer');document.querySelector('.gallery-open')?.addEventListener('click',()=>viewer.showModal());document.querySelector('#close-viewer').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});document.querySelector('#check-location')?.addEventListener('click',()=>{const value=document.querySelector('#location').value.trim();document.querySelector('#location-result').textContent=value?'When you call, tell Dave your pickup location is '+value+'. Call 414-629-3990 to confirm coverage and availability. This does not request or confirm dispatch.':'Please enter your pickup city, ZIP code, or a nearby landmark.'});


// Custom WebGL roadside scene; the photographic hero remains the failure fallback.
const config=window.DAVE_CONFIG,hero=document.querySelector('.hero');
const motion=matchMedia('(prefers-reduced-motion:reduce)');
if(hero&&config.cinematicEnabled!==false){
 const content=hero.querySelector('.hero-content');
 const host=document.createElement('div');host.className='recovery-host';host.setAttribute('aria-hidden','true');
 const controls=document.createElement('div');controls.className='recovery-controls';
 const skip=document.createElement('button');skip.type='button';skip.textContent='SKIP INTRO';skip.className='recovery-skip';
 const replay=document.createElement('button');replay.type='button';replay.textContent='REPLAY INTRO';replay.setAttribute('aria-label','Replay The Midnight Recovery truck arrival');
 const status=document.createElement('span');status.className='recovery-status';status.textContent='THE MIDNIGHT RECOVERY';
 controls.append(skip,replay);hero.append(host,status,controls);
 const caption=hero.querySelector('.hero-caption');caption.textContent='THE MIDNIGHT RECOVERY / ANIMATED CONCEPT';
 let scene=null,pending=null,active=false,timer=null,version=0,failed=false;
 const key='dave-truck-arrival-v1';
 function remember(){try{sessionStorage.setItem(key,'1')}catch{}}
 function finish(fallback=false){
  version++;active=false;clearTimeout(timer);hero.classList.remove('recovery-playing');content.inert=false;content.removeAttribute('aria-hidden');
  scene?.stop();if(fallback){hero.classList.remove('recovery-ready');failed=true;scene?.dispose();scene=null;pending=null;host.replaceChildren();controls.hidden=true}
  remember();if(document.activeElement===skip)replay.focus({preventScroll:true});
 }
 async function play(manual=false){
  if(active||motion.matches||(!manual&&navigator.connection?.saveData))return;
  if(failed)return
  const turn=++version;active=true;window.scrollTo({top:0,behavior:'instant'});hero.classList.add('recovery-playing');content.inert=true;content.setAttribute('aria-hidden','true');
  timer=setTimeout(()=>finish(true),14000);
  try{
   if(!scene){pending||=import('./recovery-scene.js').then(module=>module.createRecovery(host));const built=await pending;if(turn!==version){built.dispose();pending=null;return}scene=built;scene.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();finish(true)},{once:true})}
   if(turn!==version)return;clearTimeout(timer);hero.classList.add('recovery-ready');scene.play();timer=setTimeout(()=>finish(),8500);
  }catch(error){console.warn('Recovery scene unavailable; showing photo fallback.',error);finish(true)}
 }
 host.addEventListener('recovery-ended',()=>finish());skip.addEventListener('click',()=>finish());replay.addEventListener('click',()=>play(true));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)finish()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)finish()});
 motion.addEventListener('change',e=>{controls.hidden=e.matches;if(e.matches){finish(true);failed=false}});controls.hidden=motion.matches;
 let seen=false;try{seen=sessionStorage.getItem(key)==='1'}catch{}
 if(!seen&&!motion.matches&&!navigator.connection?.saveData)play();
}
