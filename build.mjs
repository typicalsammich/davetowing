import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('business-config.json','utf8'));
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else if(e.name==='index.html'){let html=fs.readFileSync(p,'utf8');html=html.replace(/window\.DAVE_CONFIG=[^<]+/, 'window.DAVE_CONFIG='+JSON.stringify(config));fs.writeFileSync(p,html);}}}
walk('dist');console.log('Business and cinematic configuration synchronized.');
