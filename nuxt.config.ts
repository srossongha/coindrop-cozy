import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@tresjs/nuxt', '@vite-pwa/nuxt'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'CoinDrop — Cozy Multiplayer Decision Lobby',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
        },
        {
          name: 'description',
          content:
            'Zero-account multiplayer decision lobby. Brainstorm card ideas, share via Telegram or code, and drop coins to vote in real-time!',
        },
        { property: 'og:title', content: 'CoinDrop — Cozy Multiplayer Decision Lobby' },
        {
          property: 'og:description',
          content:
            'Zero-account multiplayer decision lobby. Brainstorm card ideas, share via Telegram or code, and drop coins to vote in real-time!',
        },
        { property: 'og:image', content: '/logo.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/logo.png' },
        { name: 'theme-color', content: '#0b1220' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'CoinDrop' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'CoinDrop',
      short_name: 'CoinDrop',
      description:
        'Zero-account multiplayer decision lobby. Brainstorm card ideas, share via Telegram or code, and drop coins to vote in real-time!',
      theme_color: '#0b1220',
      background_color: '#0b1220',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^\/api\/.*/i,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^wss?:.*/i,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-assets-cache',
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
          },
        },
        {
          urlPattern: /\.(?:js|css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources-cache',
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 7 * 24 * 60 * 60,
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    experimental: {
      websocket: true,
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY || '',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
