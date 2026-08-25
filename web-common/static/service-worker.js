// Minimal network-only service worker. It exists so the app meets PWA
// installability criteria; it deliberately does no caching because Rill is a
// live app backed by a runtime server, and stale assets would break upgrades.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally empty: without respondWith(), requests fall through to the
  // network exactly as if no service worker were registered.
});
