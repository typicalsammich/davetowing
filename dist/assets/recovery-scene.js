import * as T from './vendor/three.module.js';
export const DURATION=4.2;
const clamp=T.MathUtils.clamp;
export function cameraProgress(t){const u=clamp(t/DURATION,0,1);return u*u*(3-2*u)}
export async function createRecovery(host){
 const mobile=host.clientWidth<760;
 const scene=new T.Scene();scene.background=new T.Color('#04080c');scene.fog=new T.FogExp2('#060b10',.019);
 const camera=new T.PerspectiveCamera(mobile?52:43,1,.1,190);
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.15:1.35));
 renderer.shadowMap.enabled=false;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const resources=new Set();const track=x=>(resources.add(x),x);
 const standard=(color,roughness=.7,metalness=0)=>track(new T.MeshStandardMaterial({color,roughness,metalness}));
 const basic=(options)=>track(new T.MeshBasicMaterial(options));
 function mesh(geometry,material,parent=scene){const m=new T.Mesh(track(geometry),material);parent.add(m);return m}
 function box(w,h,d,material,x,y,z,parent=scene){const m=mesh(new T.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m}
 const hemi=new T.HemisphereLight('#9aafca','#141416',.35);scene.add(hemi);
 const moon=new T.DirectionalLight('#a9bdd8',.52);moon.position.set(-16,25,8);scene.add(moon);
 let seed=721;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 // One texture and instanced roadside geometry; no shadow maps or mirror render passes.
 const asphalt=document.createElement('canvas');asphalt.width=asphalt.height=512;const ac=asphalt.getContext('2d');const pixels=ac.createImageData(512,512);
 for(let i=0;i<pixels.data.length;i+=4){const n=28+random()*38;pixels.data[i]=n*.86;pixels.data[i+1]=n*.94;pixels.data[i+2]=n;pixels.data[i+3]=255}ac.putImageData(pixels,0,0);
 const asphaltMap=track(new T.CanvasTexture(asphalt));asphaltMap.wrapS=asphaltMap.wrapT=T.RepeatWrapping;asphaltMap.repeat.set(24,4);asphaltMap.colorSpace=T.SRGBColorSpace;
 const roadMaterial=track(new T.MeshStandardMaterial({color:'#666f78',map:asphaltMap,bumpMap:asphaltMap,bumpScale:.035,roughness:.35,metalness:.15}));
 const road=mesh(new T.PlaneGeometry(180,17),roadMaterial);road.rotation.x=-Math.PI/2;road.position.set(-20,0,0);
 const soil=mesh(new T.PlaneGeometry(240,160),standard('#080c0b',1));soil.rotation.x=-Math.PI/2;soil.position.set(-20,-.04,0);
 const matrix=new T.Object3D();
 function instances(geometry,material,positions){const m=new T.InstancedMesh(track(geometry),material,positions.length);positions.forEach((p,i)=>{matrix.position.set(p[0],p[1],p[2]);matrix.rotation.set(0,0,0);matrix.scale.set(1,p[3]||1,1);matrix.updateMatrix();m.setMatrixAt(i,matrix.matrix)});m.instanceMatrix.needsUpdate=true;scene.add(m);return m}
 const lanePaint=standard('#a3a395',.8);const dashes=[];for(let x=-100;x<70;x+=8)dashes.push([x,.006,-2.2]);instances(new T.BoxGeometry(3,.012,.1),lanePaint,dashes);
 box(180,.01,.12,lanePaint,-20,.006,1.05);box(180,.01,.12,lanePaint,-20,.006,-6.2);
 const rail=standard('#394249',.52,.65);const posts=[];for(let x=-105;x<75;x+=4)posts.push([x,.46,-7.2]);instances(new T.BoxGeometry(.12,.92,.12),rail,posts);box(185,.18,.1,rail,-20,.91,-7.2);
 const trees=[];for(let i=0;i<42;i++)trees.push([-100+random()*170,2.4+random()*2,-13-random()*15,1+random()*1.4]);instances(new T.SphereGeometry(2.5,7,5),standard('#080e0b',1),trees);
 // Photographic vehicle surfaces are held at a fixed world orientation.
 // The small camera arc avoids the previous camera-facing sliding billboard effect.
 const loader=new T.TextureLoader();const [truckTexture,wheelTexture,brandTexture]=await Promise.all([
  loader.loadAsync('/assets/recovery-truck.webp'),loader.loadAsync('/assets/recovery-wheel.webp'),loader.loadAsync('/assets/dave-towing-selected-logo.webp')
 ]).catch(error=>{resources.forEach(r=>r.dispose?.());renderer.dispose();renderer.domElement.remove();throw error});for(const texture of [truckTexture,wheelTexture,brandTexture]){texture.colorSpace=T.SRGBColorSpace;track(texture)}
 const vehicle=new T.Group();scene.add(vehicle);vehicle.position.set(1,1.84,2.2);vehicle.scale.setScalar(mobile?1:.92);
 const target=new T.Vector3(mobile?2.4:-.5,1.3,mobile?.2:2.5);
 const centerPosition=new T.Vector3(mobile?12:10,3.05,mobile?9:12.5);
 camera.position.copy(centerPosition);camera.lookAt(target);vehicle.quaternion.copy(camera.quaternion);
 const body=mesh(new T.PlaneGeometry(10,10*675/1947),basic({map:truckTexture,transparent:true,alphaTest:.025,side:T.DoubleSide,color:'#a7b3c3',toneMapped:false}),vehicle);body.position.z=.025;
 const logo=mesh(new T.PlaneGeometry(.62,.42),basic({map:brandTexture,transparent:true,alphaTest:.03,side:T.DoubleSide,toneMapped:false}),body);logo.position.set(.15,-.28,.01);
 const wheels=[];for(const [x,y,w,h] of [[-4.15,-.67,.62,.99],[-3.35,-.79,.67,1.04],[1.76,-1.25,.88,1.15]]){const wheel=mesh(new T.PlaneGeometry(w,h),basic({map:wheelTexture,transparent:true,alphaTest:.025,side:T.DoubleSide,color:'#a2aebb',toneMapped:false}),vehicle);wheel.position.set(x,y,0);wheels.push(wheel)}
 // Soft, fixed tire contact shadows keep the parked vehicle grounded.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d');const gradient=sc.createRadialGradient(64,64,3,64,64,62);gradient.addColorStop(0,'rgba(0,0,0,.8)');gradient.addColorStop(.45,'rgba(0,0,0,.4)');gradient.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);const shadowTexture=track(new T.CanvasTexture(shadowCanvas));
 vehicle.updateMatrixWorld(true);const groundPlane=new T.Plane(new T.Vector3(0,1,0),-.017);for(const wheel of wheels){const lower=wheel.position.clone();lower.y-=wheel.geometry.parameters.height*.45;vehicle.localToWorld(lower);const contact=new T.Vector3();const ray=new T.Ray(camera.position.clone(),lower.sub(camera.position).normalize());if(ray.intersectPlane(groundPlane,contact)){const shadow=mesh(new T.PlaneGeometry(1.1,.75),basic({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.copy(contact)}}
 // Constant headlights and low-intensity, smoothly modulated amber lights.
 for(const x of [2.65,4.65]){const lampPosition=vehicle.localToWorld(new T.Vector3(x,-.1,.08));const lamp=new T.SpotLight('#fff0d7',46,24,.38,.8,1.7);lamp.position.copy(lampPosition);lamp.target.position.set(lampPosition.x+13,.02,lampPosition.z-2);scene.add(lamp,lamp.target)}
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;const gc=glowCanvas.getContext('2d');const glow=gc.createRadialGradient(32,32,0,32,32,32);glow.addColorStop(0,'rgba(255,255,255,.8)');glow.addColorStop(.15,'rgba(255,255,255,.3)');glow.addColorStop(1,'rgba(255,255,255,0)');gc.fillStyle=glow;gc.fillRect(0,0,64,64);const glowTexture=track(new T.CanvasTexture(glowCanvas));const beacons=[];
 for(const [i,x] of [-.15,.7].entries()){const mat=track(new T.SpriteMaterial({map:glowTexture,color:'#ffb042',transparent:true,blending:T.AdditiveBlending,depthWrite:false}));const sprite=new T.Sprite(mat);sprite.position.set(x,1.56,.04);sprite.scale.set(.75,.18,1);vehicle.add(sprite);const light=new T.PointLight('#ffad35',2,5,2);light.position.copy(vehicle.localToWorld(new T.Vector3(x,1.52,0)));scene.add(light);beacons.push({mat,light,i})}
 const dx=centerPosition.x-target.x,dz=centerPosition.z-target.z,radius=Math.hypot(dx,dz),centerAngle=Math.atan2(dx,dz);
 let running=false,disposed=false,frame=0,start=0,elapsed=DURATION;
 function draw(t){
  const k=cameraProgress(t),angle=centerAngle+(k-.5)*(mobile?.035:.055);
  camera.position.set(target.x+Math.sin(angle)*radius,3.10-.1*k,target.z+Math.cos(angle)*radius);camera.lookAt(target);
  for(const b of beacons){const pulse=.5+.5*Math.sin(t*2*Math.PI*.65+b.i*Math.PI);b.mat.opacity=.07+.16*pulse;b.light.intensity=1.5+2.2*pulse}
  renderer.render(scene,camera);host.dataset.frameTime=t.toFixed(3);host.dataset.drawCalls=String(renderer.info.render.calls);
 }
 function tick(now){if(disposed||!running)return;elapsed=clamp((now-start)/1000,0,DURATION);draw(elapsed);if(elapsed<DURATION)frame=requestAnimationFrame(tick);else{running=false;host.dispatchEvent(new CustomEvent('recovery-ended'))}}
 const resize=()=>{if(disposed)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(!running)draw(elapsed)};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();draw(DURATION);
 return {renderer,play(){if(disposed)return;cancelAnimationFrame(frame);running=true;elapsed=0;start=performance.now();draw(0);frame=requestAnimationFrame(tick)},stop(){running=false;cancelAnimationFrame(frame);elapsed=DURATION;if(!disposed)draw(elapsed)},dispose(){disposed=true;running=false;cancelAnimationFrame(frame);observer.disconnect();resources.forEach(r=>r.dispose?.());renderer.dispose();renderer.domElement.remove()}};
}
