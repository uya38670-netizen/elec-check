// 서비스워커: 한 번 열어 두면 오프라인(공장 사각지대)에서도 실행됩니다.
// 앱을 수정해 올릴 때마다 아래 VERSION 숫자를 올리세요 -> 폰에 새 버전이 반영됩니다.
var VERSION = "v2.5-1";
var CACHE = "elec-maint-" + VERSION;
var FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf("elec-maint-") === 0 && k !== CACHE; })
      .map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
// 온라인이면 항상 최신 파일(네트워크 우선), 오프라인이면 저장된 파일 사용 -> 옛날 버전이 계속 보이는 문제 방지
self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" }).then(function(res){
      if(res && res.ok){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
      return res;
    }).catch(function(){
      return caches.match(req, { ignoreSearch: true }).then(function(m){ return m || caches.match("./index.html"); });
    })
  );
});
