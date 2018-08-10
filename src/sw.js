const assetsCacheName = 'v1-assets';

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

  // Tell the fetch to respond with this Promise chain
  event.respondWith(
    // Open the cache
    caches.open(assetsCacheName)
      .then((cache) => {
        // Make the request to the network
        return fetch(event.request)
          .then((response) => {
            // Cache the response
            cache.put(event.request, response.clone());

            // Return the original response to the page
            return response;
          });
      })
  );

});
