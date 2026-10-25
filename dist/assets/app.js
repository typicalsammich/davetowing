const menu=document.querySelector('#menu'),nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');document.querySelector('.dropdown').classList.remove('open');document.querySelector('.dropdown-toggle').setAttribute('aria-expanded','false')}});document.querySelector('.dropdown-toggle').addEventListener('click',e=>{const open=e.currentTarget.parentElement.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)});document.querySelectorAll('nav a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page')});const sticky=document.querySelector('.mobile-call');new IntersectionObserver(entries=>{sticky.classList.toggle('visible',!entries[0].isIntersecting)},{threshold:0}).observe(document.querySelector('.hero,.page-hero'));const steps=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('active')}),{threshold:.6});document.querySelectorAll('.steps article').forEach(e=>steps.observe(e));const viewer=document.querySelector('#viewer');document.querySelector('.gallery-open')?.addEventListener('click',()=>viewer.showModal());document.querySelector('#close-viewer').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});document.querySelector('#check-location')?.addEventListener('click',()=>{const value=document.querySelector('#location').value.trim();document.querySelector('#location-result').textContent=value?'When you call, tell Dave your pickup location is '+value+'. Call 414-629-3990 to confirm coverage and availability. This does not request or confirm dispatch.':'Please enter your pickup city, ZIP code, or a nearby landmark.'});
// Real footage is required. Keep the static hero when no video is configured.
const config=window.DAVE_CONFIG;
const motion=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:760px)').matches;
const source=mobile?(config.introMobile||config.introDesktop):(config.introDesktop||config.introMobile);
let introSeen=false;
try{introSeen=sessionStorage.getItem('dave-intro-seen')==='1'}catch{}
function playIntro(){
 if(!source||motion.matches||navigator.connection?.saveData||document.querySelector('.intro'))return;
 const previousFocus=document.activeElement;
 const overlay=document.createElement('section');overlay.className='intro';overlay.setAttribute('aria-label','The Midnight Recovery cinematic');
 const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='metadata';video.poster='/assets/midnight-recovery.webp';video.setAttribute('aria-label','Tow truck roadside recovery cinematic');
 const skip=document.createElement('button');skip.className='button';skip.textContent='SKIP INTRO';
 overlay.append(video,skip);document.body.append(overlay);
 let finished=false,playbackTimer;
 const loadingTimer=setTimeout(finish,6000);
 function finish(){if(finished)return;finished=true;clearTimeout(loadingTimer);clearTimeout(playbackTimer);video.pause();video.removeAttribute('src');video.load();overlay.remove();document.removeEventListener('keydown',escape);motion.removeEventListener('change',onMotion);try{sessionStorage.setItem('dave-intro-seen','1')}catch{}if(document.activeElement===document.body&&previousFocus instanceof HTMLElement)previousFocus.focus()}
 function escape(event){if(event.key==='Escape')finish()}
 function onMotion(event){if(event.matches)finish()}
 skip.addEventListener('click',finish);video.addEventListener('ended',finish,{once:true});video.addEventListener('error',finish,{once:true});
 video.addEventListener('playing',()=>{clearTimeout(loadingTimer);if(!playbackTimer)playbackTimer=setTimeout(finish,8500)});
 document.addEventListener('keydown',escape);motion.addEventListener('change',onMotion);
 video.src=source;video.play().catch(finish);
}
if(location.pathname==='/'&&source){
 const replay=document.createElement('button');replay.className='text-link cinematic-replay';replay.textContent='REPLAY THE MIDNIGHT RECOVERY';replay.addEventListener('click',playIntro);document.querySelector('.hero-content').append(replay);
 if(!introSeen)playIntro();
}
