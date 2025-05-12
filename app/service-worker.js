// This file is not used directly but can be imported as needed
// Service worker registration is handled by next-pwa package

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(registration) {
        console.log('Service Worker registration successful with scope: ', registration.scope);
      },
      function(err) {
        console.log('Service Worker registration failed: ', err);
      }
    );
  });
}