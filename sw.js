// 缓存名称，更改此值可以强制更新缓存
const CACHE_NAME = 'love-timer-cache-v1';

// 需要缓存的资源列表
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './favicon.svg',
  './manifest.json',
  'https://unpkg.com/vue@3/dist/vue.global.js'
];

// 安装 Service Worker 并缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker 并清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截网络请求并从缓存中提供资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到匹配的资源，则返回缓存的版本
        if (response) {
          return response;
        }
        
        // 否则，从网络获取资源
        return fetch(event.request).then(response => {
          // 检查是否是有效的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 克隆响应，因为响应是流，只能使用一次
          const responseToCache = response.clone();
          
          // 将新获取的资源添加到缓存中
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});