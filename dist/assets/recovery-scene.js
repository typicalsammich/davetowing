import * as T from './vendor/three.module.js';
import {Reflector} from './vendor/Reflector.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
const clamp=T.MathUtils.clamp, mix=T.MathUtils.lerp;
export const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
export function motionAt(t){
 const u=clamp((t-2)/4,0,1),d=t<2?14*Math.max(t,0):28+56*(u-u*u*u+.5*u*u*u*u);
 return {x:-55+d,z:-2+4.2*smooth((t-2)/3.65),distance:d,speed:t<2?14:14*(1-smooth(u)),deceleration:t>2&&t<6?21*u*(1-u):0};
}
export async function createRecovery(host){
 const mobile=host.clientWidth<760;
 const scene=new T.Scene();scene.background=new T.Color('#03070b');scene.fog=new T.FogExp2('#070c11',.013);
 const camera=new T.PerspectiveCamera(mobile?52:43,1,.1,280);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.15:1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 let seed=721;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const mats={};
 const material=(name,color,roughness=.5,metalness=0)=>mats[name]=new T.MeshStandardMaterial({color,roughness,metalness});
 const white=new T.MeshPhysicalMaterial({color:'#c7cbd0',metalness:.35,roughness:.25,clearcoat:1,clearcoatRoughness:.18});
 const rubber=material('rubber','#101213',.92),steel=material('steel','#262b30',.52,.78),chrome=material('chrome','#a2a9b3',.19,1),black=material('black','#080c10',.36,.35),glass=new T.MeshPhysicalMaterial({color:'#0a151e',metalness:.65,roughness:.12,clearcoat:1});
 const tail=new T.MeshStandardMaterial({color:'#b40702',emissive:'#a60000',emissiveIntensity:1.3});
 const head=new T.MeshStandardMaterial({color:'#f5efdb',emissive:'#fff0ce',emissiveIntensity:4});
 const amber=new T.MeshStandardMaterial({color:'#eaa412',emissive:'#ff9e0d',emissiveIntensity:1});
 function mesh(geo,mat,x=0,y=0,z=0,parent=scene){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function box(w,h,d,mat,x,y,z,parent){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,parent)}
 function cylinder(r1,r2,h,mat,x,y,z,parent,segments=24){return mesh(new T.CylinderGeometry(r1,r2,h,segments),mat,x,y,z,parent)}
 function line(points,mat,r=.025,parent=scene){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,Math.max(8,points.length*5),r,6,false),mat,0,0,0,parent)}
 // A studio-like lighting environment supplies real specular reflections on paint and metal.
 const env=new T.Scene();env.background=new T.Color('#18212c');
 const envMat=new T.MeshBasicMaterial({color:'#c1d3e5',side:T.BackSide});
 box(38,.4,12,envMat,0,14,0,env);box(2,14,22,new T.MeshBasicMaterial({color:'#8d969e'}),-18,3,0,env);
 box(3,8,20,new T.MeshBasicMaterial({color:'#b08346'}),18,2,-8,env);
 const pmrem=new T.PMREMGenerator(renderer);const envTarget=pmrem.fromScene(env,.025);scene.environment=envTarget.texture;
 const hemi=new T.HemisphereLight('#9aafca','#28201a',.22);scene.add(hemi);
 const moon=new T.DirectionalLight('#a5bdd8',.42);moon.position.set(-20,28,-18);scene.add(moon);
 const key=new T.DirectionalLight('#e1e8f1',.65);key.position.set(12,13,9);key.castShadow=true;key.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);key.shadow.camera.left=-18;key.shadow.camera.right=18;key.shadow.camera.top=18;key.shadow.camera.bottom=-18;key.shadow.normalBias=.04;scene.add(key);
 // Asphalt: multiscale aggregate, longitudinal wear, roughness and shallow puddles.
 const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=512;const cx=texCanvas.getContext('2d');const pixels=cx.createImageData(512,512);
 for(let i=0;i<pixels.data.length;i+=4){const n=25+rand()*34;pixels.data[i]=n*.86;pixels.data[i+1]=n*.94;pixels.data[i+2]=n;pixels.data[i+3]=255}cx.putImageData(pixels,0,0);
 cx.strokeStyle='#101820';cx.lineWidth=2;for(let i=0;i<18;i++){cx.beginPath();cx.moveTo(rand()*512,0);cx.bezierCurveTo(rand()*512,140,rand()*512,340,rand()*512,512);cx.stroke()}
 const roadTex=new T.CanvasTexture(texCanvas);roadTex.wrapS=roadTex.wrapT=T.RepeatWrapping;roadTex.repeat.set(36,5);roadTex.colorSpace=T.SRGBColorSpace;roadTex.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const roadMat=new T.MeshPhysicalMaterial({color:'#4a5158',map:roadTex,bumpMap:roadTex,bumpScale:.055,roughness:.43,metalness:.12,clearcoat:.65,clearcoatRoughness:.28});
 const road=mesh(new T.PlaneGeometry(260,16),roadMat,-30,-.015,0);road.rotation.x=-Math.PI/2;road.castShadow=false;
 const soil=material('soil','#080d0b',1);const ground=mesh(new T.PlaneGeometry(360,230),soil,-35,-.06,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 const paint=material('paint','#aaaa9d',.72);for(let x=-145;x<90;x+=8){box(3,.013,.11,paint,x,.003,-2.2)}
 box(240,.012,.13,paint,-30,.004,1.05);box(240,.012,.13,paint,-30,.004,-6.1);
 for(let x=-130;x<80;x+=.6)box(.17,.008,.36,steel,x,.005,1.42);
 // A faint, roughened planar reflection is layered over the textured road.
 let reflector=null;
 if(!mobile){reflector=new Reflector(new T.PlaneGeometry(220,14),{textureWidth:768,textureHeight:384,color:'#10141b',clipBias:.004});reflector.rotation.x=-Math.PI/2;reflector.position.set(-25,.009,0);reflector.material.transparent=true;reflector.material.depthWrite=false;reflector.material.fragmentShader=reflector.material.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );','vec4 uvR=vUv; float grain=fract(sin(dot(vUv.xy,vec2(12.9898,78.233)))*43758.5453); uvR.x+=(grain-.5)*.004*uvR.w; uvR.y+=(grain-.5)*.003*uvR.w; vec4 base = texture2DProj(tDiffuse,uvR);').replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4(blendOverlay(base.rgb,color),.16)');scene.add(reflector)}
 const wetMat=new T.MeshPhysicalMaterial({color:'#11191e',roughness:.15,metalness:.22,clearcoat:1,clearcoatRoughness:.1,transparent:true,opacity:.64});
 for(let i=0;i<28;i++){const puddle=mesh(new T.CircleGeometry(.25+rand()*1.2,12),wetMat,-45+rand()*75,.014,-5+rand()*11);puddle.rotation.x=-Math.PI/2;puddle.scale.set(1.5+rand()*2,.16+rand()*.4,1);puddle.castShadow=false}
 // Guardrail, reflectors, roadside silhouettes and distant highway lighting.
 const galvanized=material('rail','#464f54',.45,.8);for(let x=-140;x<90;x+=4){box(.12,1.05,.13,galvanized,x,.5,-7.2);if(x%12===0)box(.16,.15,.025,head,x,.85,-7.08)}box(245,.24,.12,galvanized,-25,.94,-7.2);box(245,.09,.09,steel,-25,.72,-7.23);
 const leaf=material('leaf','#070d0a',1);for(let i=0;i<90;i++){const x=-145+rand()*250,z=-(12+rand()*23),h=2+rand()*8;const tree=mesh(new T.SphereGeometry(1.2+rand()*2,8,6),leaf,x,h/2,z);tree.scale.y=1.4+rand()*1.8;tree.castShadow=false}
 for(let x=-130;x<100;x+=48){cylinder(.06,.09,8,steel,x,4,-7);line([[x,7.7,-7],[x,8.1,-6],[x,8,-4.8]],steel,.055);box(.65,.1,.25,head,x,8,-4.8);const lamp=new T.PointLight('#d5c4a7',10,23,2);lamp.position.set(x,7.5,-4.8);scene.add(lamp)}
 const truck=new T.Group();scene.add(truck);const body=new T.Group();truck.add(body);
 // Chassis and commercial flatbed, including rails, toolboxes, hydraulics and winch.
 box(8.5,.23,.24,steel,-.5,.72,-.66,body);box(8.5,.23,.24,steel,-.5,.72,.66,body);
 box(6.7,.17,2.4,steel,-1.75,1.13,0,body);box(6.5,.035,2.24,black,-1.75,1.235,0,body);
 for(let x=-4.7;x<1.3;x+=.6){box(.035,.025,2.25,steel,x,1.27,0,body);for(const z of [-1.12,1.12])box(.13,.045,.08,chrome,x,1.28,z,body)}
 for(const z of [-1.17,1.17]){box(6.8,.16,.07,steel,-1.75,1.16,z,body);box(1.6,.5,.48,chrome,-1.5,.81,z*.73,body);box(1.49,.4,.02,steel,-1.5,.81,z*.95,body);box(.18,.08,.04,chrome,-1.5,.9,z*1.02,body)}
 const hydraulic=cylinder(.09,.09,2.2,chrome,-1.1,.91,0,body);hydraulic.rotation.z=1.45;
 cylinder(.28,.28,.8,steel,.76,1.5,0,body).rotation.x=Math.PI/2;line([[.8,1.45,0],[-.3,1.28,0],[-3.4,1.28,0]],chrome,.018,body);
 box(.16,1.2,2.37,steel,1.26,1.74,0,body);for(let z=-.9;z<1;z+=.45)box(.12,.78,.035,chrome,1.16,1.75,z,body);
 // Cab shell: tapered hood, sloping windscreen, roof, door panels and fenders.
 const shape=new T.Shape();shape.moveTo(1.48,.92);shape.lineTo(1.48,2.75);shape.quadraticCurveTo(1.5,2.91,1.7,2.93);shape.lineTo(2.82,2.93);shape.lineTo(3.41,2.12);shape.lineTo(4.28,1.96);shape.lineTo(4.57,1.61);shape.lineTo(4.57,.96);shape.closePath();
 const shell=new T.ExtrudeGeometry(shape,{depth:2.05,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:2,steps:1});shell.translate(0,0,-1.025);mesh(shell,white,0,0,0,body);
 // Windshield lies on the sloped front of the cab, with divider and wipers.
 const wind=box(.045,.98,1.86,glass,3.08,2.49,0,body);wind.rotation.z=.61;
 line([[3.18,2.18,-.77],[3.04,2.47,-.18]],black,.018,body);line([[3.18,2.18,.09],[3.04,2.47,.74]],black,.018,body);
 for(const side of [-1,1]){
  const z=side*1.075;
  const windowShape=new T.Shape();windowShape.moveTo(1.64,2.19);windowShape.lineTo(1.64,2.76);windowShape.lineTo(2.75,2.76);windowShape.lineTo(3.15,2.19);windowShape.closePath();mesh(new T.ShapeGeometry(windowShape),new T.MeshStandardMaterial({color:'#0a171f',metalness:.7,roughness:.16,side:T.DoubleSide}),0,0,z,body);
  line([[1.57,1.16,z],[1.57,2.81,z],[2.8,2.81,z],[3.23,2.12,z],[3.22,1.15,z],[1.57,1.16,z]],steel,.011,body);
  box(.3,.055,.045,chrome,1.87,2.01,z*1.02,body);box(1.8,.14,.34,chrome,2.3,.87,z*1.12,body);
  line([[2.94,2.18,z],[3.02,2.22,z+side*.42]],steel,.04,body);box(.26,.4,.13,black,3.03,2.28,z+side*.5,body);box(.2,.32,.018,chrome,3.03,2.28,z+side*.57,body);
  const arch=new T.Mesh(new T.TorusGeometry(.67,.085,8,28,Math.PI),white);arch.rotation.y=Math.PI/2;arch.rotation.z=Math.PI/2;arch.position.set(3.43,.65,z);body.add(arch);
 }
 box(.16,.41,2.16,chrome,4.6,1.0,0,body);box(.2,.48,1.35,black,4.62,1.51,0,body);
 for(let y=1.32;y<1.74;y+=.085)box(.025,.025,1.32,chrome,4.74,y,0,body);
 for(const z of [-.9,.9]){box(.09,.3,.37,chrome,4.64,1.66,z,body);box(.055,.21,.27,head,4.71,1.68,z,body);box(.05,.11,.15,amber,4.72,1.39,z,body);box(.06,.11,.16,head,4.72,1.03,z,body)}
 // Brand graphics are decals on the cab rather than floating labels.
 const decalCanvas=document.createElement('canvas');decalCanvas.width=512;decalCanvas.height=256;const dc=decalCanvas.getContext('2d');dc.fillStyle='#101010';dc.font='900 italic 87px Arial';dc.textAlign='center';dc.fillText('DAVE',256,105);dc.fillStyle='#b58400';dc.font='bold 52px Arial';dc.fillText('TOWING',256,169);dc.fillStyle='#222';dc.font='25px Arial';dc.fillText('414-629-3990',256,216);const decalTex=new T.CanvasTexture(decalCanvas);decalTex.colorSpace=T.SRGBColorSpace;const decalMat=new T.MeshStandardMaterial({map:decalTex,transparent:true,roughness:.4,side:T.DoubleSide});for(const side of [-1,1]){const decal=mesh(new T.PlaneGeometry(1.18,.59),decalMat,2.23,1.62,side*1.079,body);if(side<0)decal.rotation.y=Math.PI}
 // Six commercial tires, rear duals, metallic rims, lug bolts and tread blocks.
 const wheels=[];function wheel(x,z,front=false){const pivot=new T.Group();pivot.position.set(x,.55,z);truck.add(pivot);const spin=new T.Group();pivot.add(spin);const tire=cylinder(.5,.5,.28,rubber,0,0,0,spin,36);tire.rotation.x=Math.PI/2;const face=z>0?.165:-.165;const rim=cylinder(.31,.31,.035,chrome,0,0,face,spin,32);rim.rotation.x=Math.PI/2;const hub=cylinder(.105,.105,.09,steel,0,0,face*1.14,spin);hub.rotation.x=Math.PI/2;for(let j=0;j<8;j++){const a=j*Math.PI/4;const lug=cylinder(.023,.023,.045,chrome,Math.sin(a)*.18,Math.cos(a)*.18,face*1.16,spin,6);lug.rotation.x=Math.PI/2}for(let j=0;j<28;j++){const a=j*Math.PI/14;const tread=box(.09,.025,.285,black,Math.sin(a)*.501,Math.cos(a)*.501,0,spin);tread.rotation.z=-a}wheels.push({pivot,spin,front});return pivot}
 for(const s of [-1,1]){wheel(3.43,s*1.02,true);wheel(-3.05,s*1.02);wheel(-3.05,s*.7)}
 // Lightbar modules, marker lamps and physically positioned lighting.
 box(.2,.11,1.8,black,1.88,3.07,0,body);const beacons=[];for(const side of [-1,1]){const mat=amber.clone();const m=box(.22,.12,.76,mat,1.88,3.19,side*.46,body);const light=new T.PointLight('#ff9d1c',0,10,2);light.position.set(1.88,3.22,side*.55);body.add(light);beacons.push({mat,light,side})}
 for(const z of [-.75,-.37,0,.37,.75])box(.13,.08,.1,amber,2.67,2.99,z,body);
 for(let x=-4.8;x<1;x+=1.1)for(const z of [-1.23,1.23])box(.13,.065,.035,amber,x,1.16,z,body);
 for(const z of [-.9,.9]){box(.05,.18,.22,tail,-5.15,1.03,z,body);const beam=new T.SpotLight('#fff1d8',105,.0,.34,.5,1.5);beam.distance=34;beam.position.set(4.73,1.65,z);beam.target.position.set(25,.05,z*.7);truck.add(beam,beam.target);if(z<0){beam.castShadow=true;beam.shadow.mapSize.set(512,512);beam.shadow.normalBias=.03}}
 const brakeLight=new T.PointLight('#fa1306',0,5);brakeLight.position.set(-5.3,.8,0);body.add(brakeLight);
 // A stationary sedan on the shoulder, with glass, wheels and working hazards.
 const car=new T.Group();car.position.set(14,0,2.3);scene.add(car);const carPaint=new T.MeshPhysicalMaterial({color:'#28313b',metalness:.65,roughness:.26,clearcoat:1});box(4.3,.58,1.9,carPaint,0,.77,0,car);box(2.05,.61,1.65,carPaint,-.12,1.3,0,car);box(1.6,.5,1.68,glass,-.12,1.36,0,car);box(2.0,.07,1.69,carPaint,-.12,1.65,0,car);for(const x of [-1.4,1.35])for(const z of [-.91,.91]){const tire=cylinder(.36,.36,.18,rubber,x,.39,z,car);tire.rotation.x=Math.PI/2;const rim=cylinder(.23,.23,.02,chrome,x,.39,z*1.11,car);rim.rotation.x=Math.PI/2}const hazards=[];for(const x of [-2.17,2.17])for(const z of [-.72,.72]){const m=amber.clone();box(.04,.12,.22,m,x,.85,z,car);hazards.push(m)}

 // High-resolution photographic body and independent wheel layers supply surface detail.
 // The dimensional truck remains the shadow and light rig; these are 2.5D visual layers.
 const loader=new T.TextureLoader();
 const [truckImage,wheelImage,brandImage]=await Promise.all([loader.loadAsync('/assets/recovery-truck.webp'),loader.loadAsync('/assets/recovery-wheel.webp'),loader.loadAsync('/assets/dave-towing-selected-logo.webp')]);
 truckImage.colorSpace=wheelImage.colorSpace=brandImage.colorSpace=T.SRGBColorSpace;
 const photoTruck=new T.Group();scene.add(photoTruck);
 const photoMaterial=new T.MeshBasicMaterial({map:truckImage,transparent:true,alphaTest:.02,side:T.DoubleSide,color:'#b6bec9',toneMapped:false});
 const photoBody=mesh(new T.PlaneGeometry(10,10*675/1947),photoMaterial,0,0,.025,photoTruck);photoBody.castShadow=false;const doorLogo=mesh(new T.PlaneGeometry(.62,.42),new T.MeshBasicMaterial({map:brandImage,transparent:true,alphaTest:.03,side:T.DoubleSide,toneMapped:false}),.15,-.28,.01,photoBody);doorLogo.castShadow=false;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d');const sg=sc.createRadialGradient(64,64,5,64,64,63);sg.addColorStop(0,'rgba(0,0,0,.9)');sg.addColorStop(.5,'rgba(0,0,0,.5)');sg.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=sg;sc.fillRect(0,0,128,128);const contactTex=new T.CanvasTexture(shadowCanvas);const contactShadows=[];for(let j=0;j<3;j++){const m=mesh(new T.PlaneGeometry(1.1,.75),new T.MeshBasicMaterial({map:contactTex,transparent:true,depthWrite:false}),0,.025,0);m.rotation.x=-Math.PI/2;m.castShadow=false;contactShadows.push(m)}
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;const gc=glowCanvas.getContext('2d');const gg=gc.createRadialGradient(32,32,0,32,32,32);gg.addColorStop(0,'rgba(255,255,255,1)');gg.addColorStop(.16,'rgba(255,255,255,.65)');gg.addColorStop(1,'rgba(255,255,255,0)');gc.fillStyle=gg;gc.fillRect(0,0,64,64);const glowTex=new T.CanvasTexture(glowCanvas);const photoBeacons=[];for(const x of [-.15,.7]){const sprite=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:'#ffaf32',transparent:true,blending:T.AdditiveBlending,depthWrite:false}));sprite.position.set(x,1.56,.05);sprite.scale.set(1.1,.28,1);photoTruck.add(sprite);photoBeacons.push(sprite)}
 const photoWheels=[];for(const spec of [[-4.15,-.67,.62,.99],[-3.35,-.79,.67,1.04],[1.76,-1.25,.88,1.15]]){const pivot=new T.Group();pivot.position.set(spec[0],spec[1],0);photoTruck.add(pivot);const rotating=mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:wheelImage,transparent:true,alphaTest:.03,color:'#98a2af',side:T.DoubleSide,toneMapped:false}),0,0,0,pivot);pivot.scale.set(spec[2],spec[3],1);rotating.castShadow=false;photoWheels.push(rotating)}
 truck.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.colorWrite=false;o.material.depthWrite=false}});
 // Merge immobile roadside objects by material to reduce mobile draw calls.
 scene.updateMatrixWorld(true);const batches=new Map();for(const obj of [...scene.children]){if(obj.isMesh&&obj!==reflector){const id=obj.material.uuid;if(!batches.has(id))batches.set(id,[]);batches.get(id).push(obj)}}for(const batch of batches.values()){if(batch.length<3)continue;const geometries=batch.map(o=>o.geometry.clone().applyMatrix4(o.matrixWorld));const merged=mergeGeometries(geometries,false);if(!merged)continue;const combined=new T.Mesh(merged,batch[0].material);combined.receiveShadow=true;combined.castShadow=batch.some(o=>o.castShadow);scene.add(combined);batch.forEach(o=>scene.remove(o));geometries.forEach(g=>g.dispose())}
 // The camera follows one continuous, physically possible low roadside move.

 let frame=0,running=false,start=0,elapsed=8,disposed=false;
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(!running)draw(elapsed)};
 function draw(t){
  host.dataset.frameTime=t.toFixed(3);const m=motionAt(t),m1=motionAt(t+.012),m0=motionAt(Math.max(0,t-.012));truck.position.set(m.x,0,m.z);
  const yaw=-Math.atan2(m1.z-m0.z,Math.max(.0001,m1.x-m0.x));truck.rotation.y=t<5.8?yaw:mix(yaw,0,smooth((t-5.8)/.4));
  const settle=t>6?Math.sin((t-6)*11)*Math.exp(-(t-6)*5)*.009:0;body.rotation.z=-m.deceleration*.005+settle;body.position.y=t<6?Math.sin(m.distance*1.5)*.004:0;
  for(const w of wheels){w.spin.rotation.z=-m.distance/.5;w.pivot.rotation.y=w.front?clamp(yaw*1.2,-.22,.22):0}
  const flash=Math.sin(t*Math.PI*2*1.2);for(const b of beacons){const power=flash*b.side>.25?1:.06;b.mat.emissiveIntensity=.3+power*4;b.light.intensity=power*28}
  tail.emissiveIntensity=m.deceleration>.3?4.2:.8;brakeLight.intensity=m.deceleration>.3?8:0;hazards.forEach(mat=>mat.emissiveIntensity=Math.sin(t*6)>.35?3:.15);
  const k=smooth((t-.6)/6.1),camX=mobile?mix(20,12,k):mix(18,10,k),camZ=mobile?mix(13,9,k):mix(14,12,k);camera.position.set(camX,mix(1.3,3.05,k),camZ);camera.lookAt(mix(2,mobile?2.4:1.7,k),mix(.65,1.3,k),mix(.4,mobile?.2:1.6,k));
  photoTruck.position.set(m.x,1.84+body.position.y,m.z);photoTruck.quaternion.copy(camera.quaternion);photoTruck.rotateY(truck.rotation.y*.35);photoWheels[2].parent.rotation.y=clamp(yaw*1.2,-.2,.2);photoBeacons.forEach((b,i)=>{b.material.opacity=flash*(i?1:-1)>.25?.9:.06});photoBody.rotation.z=body.rotation.z;photoWheels.forEach(w=>w.rotation.z=-m.distance/.5);photoTruck.updateMatrixWorld(true);const floor=new T.Plane(new T.Vector3(0,1,0),-.022);photoWheels.forEach((w,i)=>{const v=new T.Vector3(w.parent.position.x,w.parent.position.y-w.parent.scale.y*.45,0);photoTruck.localToWorld(v);const ray=new T.Ray(camera.position.clone(),v.sub(camera.position).normalize());const p=new T.Vector3();if(ray.intersectPlane(floor,p))contactShadows[i].position.copy(p)});photoMaterial.color.setRGB(.59+(flash>.25?.055:0),.64+(flash>.25?.03:0),.72);
  renderer.toneMappingExposure=.86+.13*smooth(t/1.2);renderer.render(scene,camera);
 }
 function tick(now){if(disposed||!running)return;elapsed=(now-start)/1000;draw(Math.min(elapsed,8));if(elapsed<8)frame=requestAnimationFrame(tick);else{running=false;host.dispatchEvent(new CustomEvent('recovery-ended'))}}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();draw(8);
 return {play(){if(disposed)return;cancelAnimationFrame(frame);elapsed=0;start=performance.now();running=true;draw(0);frame=requestAnimationFrame(tick)},stop(){running=false;cancelAnimationFrame(frame);elapsed=8;draw(8)},dispose(){disposed=true;running=false;cancelAnimationFrame(frame);ro.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose())}});renderer.dispose();envTarget.dispose();pmrem.dispose();renderer.domElement.remove()},renderer};
}
