module.exports = {
  globDirectory: "public/build/",
  globPatterns: [
    "**/*.{js,css,png,jpg,jpeg,svg,webp,ico,json,woff2}"
  ],
  swDest: "public/sw.js",
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/
  ],
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [{
    urlPattern: /^https:\/\/nearprotocol\.eco\/.*/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  }]
}; 