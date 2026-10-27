// AC Fitness — service worker: scope-relative (works on GitHub Pages sub-paths), same-origin only, never caches error responses.
const CACHE_NAME='ac-fitness-v16';
const ASSETS=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-192-maskable.png','icon-512-maskable.png','apple-touch-icon.png','privacy.html'];
const SCOPE=self.registration.scope;
const URLS=ASSETS.map(a=>new URL(a,SCOPE).href);
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.allSettled(URLS.map(u=>c.add(new Request(u,{cache:'reload'}))))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{
    if(res.ok&&res.type==='basic'&&(URLS.includes(u.origin+u.pathname)||r.mode==='navigate')){const cl=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,cl)).catch(()=>{});}
    return res;
  }).catch(()=>caches.match(r).then(c=>c||(r.mode==='navigate'?caches.match(new URL('index.html',SCOPE).href):Response.error()))));
});
