// service-worker.js
const CACHE_NAME = 'word-order-v2';
const urlsToCache = [
  '/', '/index.html', '/styles.css', '/script.js',
  '/sounds/success.mp3','/sounds/error.mp3',
  '/manifest.json','/images/mascot.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
  ));
});
