// Guarda o app no celular para abrir sem internet (cache + atualização em segundo plano).
var CACHE = 'cto-app-v2';
var ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var rede = fetch(req).then(function (res) {
      if (res && res.ok) { var copia = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
      return res;
    }).catch(function () { return hit || caches.match('./index.html'); });
    return hit || rede;
  }));
});
