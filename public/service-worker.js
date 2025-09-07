// This is a minimal service worker file.
// In production, you would use a library like Workbox for more robust caching strategies.

self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
});

self.addEventListener("fetch", (event) => {
  // A simple fetch handler is enough to meet the PWA criteria.
  // This example just passes through the request.
  event.respondWith(fetch(event.request));
});