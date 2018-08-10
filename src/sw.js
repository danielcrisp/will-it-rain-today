self.addEventListener('install', (event) => {
  console.log(event);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(event);
});

self.addEventListener('fetch', (event) => {

  // Ignore crossdomain requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignore browser-sync
  if (event.request.url.indexOf('browser-sync') > -1) {
    return;
  }

  // Prevent index route being cached
  if (event.request.url === (self.location.origin + '/')) {
    return;
  }

  // Prevent index.html being cached
  if (event.request.url.endsWith('index.html')) {
    return;
  }
  console.log(event);

});
