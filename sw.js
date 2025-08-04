const CACHE_NAME = 'MDify-v1.2.6';
const OFFLINE_PAGE = 'index.html';
const ASSETS = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'libs/prism.min.css',
  'libs/toastui-chart.css',
  'libs/toastui-chart.js',
  'libs/toastui-chart.min.js',
  'libs/toastui-editor-all.min.js',
  'libs/toastui-editor-dark.min.css',
  'libs/toastui-editor-only.min.css',
  'libs/toastui-editor-plugin-chart.min.js',
  'libs/toastui-editor-plugin-code-syntax-highlight-all.min.js',
  'libs/toastui-editor-plugin-code-syntax-highlight.min.css',
  'libs/toastui-editor-plugin-color-syntax.min.css',
  'libs/toastui-editor-plugin-color-syntax.min.js',
  'libs/toastui-editor-plugin-table-merged-cell.min.css',
  'libs/toastui-editor-plugin-table-merged-cell.min.js',
  'libs/toastui-editor-plugin-uml.min.js',
  'libs/toastui-editor-viewer.min.css',
  'libs/toastui-editor-viewer.min.js',
  'libs/toastui-editor.min.css',
  'libs/tui-color-picker.css',
  'libs/tui-color-picker.min.js',
  'font/Vazirmatn-Regular.woff2',
  'font/Vazirmatn-Bold.woff2',
  'font/Vazirmatn-Thin.woff2',
  'font/Vazirmatn-Light.woff2',
  'font/Vazirmatn-Medium.woff2',
  'font/Vazirmatn-Black.woff2',
  'font/vazirmatn-font-face.css',
  'img/MDify-badge.png',
  'img/MDify-192.png',
  'img/MDify-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle file:// URLs for PWA file opening
  if (event.request.url.startsWith('file://')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => cachedResponse || fetch(event.request))
    );
    return;
  }

  // Network First for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
  } else {
    // Cache First for static assets
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => cachedResponse || fetch(event.request))
    );
  }
});