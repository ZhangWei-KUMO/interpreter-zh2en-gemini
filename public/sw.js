// 添加版本时间戳，每次构建时都会不同
const VERSION = Date.now();
const CACHE_NAME = `interpreter-cache-${VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-icon-180.png'
];

self.addEventListener('install', event => {
  // 立即激活新的Service Worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 网络优先策略，确保始终从网络获取最新内容
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// 清理旧缓存
self.addEventListener('activate', event => {
  // 立即接管客户端
  event.waitUntil(clients.claim());
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});