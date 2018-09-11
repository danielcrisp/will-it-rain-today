const assetsCacheName = 'v1-assets';
const dynamicCacheName = 'v1-dynamic';

self.addEventListener('install', (event) => {
  console.log(event);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(event);
});

/**
 *
 * ASSETS CACHING
 *
 */

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

  // Tell the fetch to respond with this chain
  event.respondWith(
    // Open the cache
    caches.open(assetsCacheName)
      .then((cache) => {

        // Look for matching request in the cache
        return cache.match(event.request)
          .then((matched) => {

            // If a match is found return the cached version first
            if (matched) {
              return matched;
            }

            // Otherwise continue to the network
            return fetch(event.request)
              .then((response) => {
                // Cache the response
                cache.put(event.request, response.clone());

                // Return the original response to the page
                return response;
              });
          });
      })
  );

});

/**
 *
 * DYNAMIC CACHING
 *
 */

self.addEventListener('fetch', (event) => {

  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignore browser-sync
  if (event.request.url.indexOf('browser-sync') > -1) {
    return;
  }

  let allow = false;

  // Allow index route to be cached
  if (event.request.url === (self.location.origin + '/')) {
    allow = true;
  }

  // Allow index.html to be cached
  if (event.request.url.endsWith('index.html')) {
    allow = true;
  }

  // Allow API requests to be cached
  if (event.request.url.startsWith('https://api.openweathermap.org')) {
    allow = true;
  }

  if (allow) {
    // Dynamic caching logic go here...
  }

});
