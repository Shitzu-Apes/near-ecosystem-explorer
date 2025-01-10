module.exports = {
  globDirectory: "public/",
  globPatterns: [
    "**/*.{js,css,png,jpg,jpeg,svg,webp,ico,json,woff2}",
    "build/**/*",
    "icon-*.png",
    "icon.webp",
    "favicon.ico",
    "manifest.json"
  ],
  swDest: "public/sw.js",
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/,
    /^url$/
  ],
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  runtimeCaching: [
    {
      // Cache build assets (CSS, JS, etc)
      urlPattern: ({ url }) => url.pathname.startsWith('/build/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'build-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        },
        matchOptions: {
          ignoreSearch: true
        }
      }
    },
    {
      // Cache API responses
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache page navigations (HTML)
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache fonts
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache everything else
      urlPattern: /.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'fallback-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
}; 