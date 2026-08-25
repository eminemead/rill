// Loaded as a classic script from app.html (kept out of the bundle so it works
// under strict CSP script-src 'self' and never blocks hydration).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // Non-fatal: the app works fine without the PWA shell.
    });
  });
}
