// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

// ⚠️ Замініть на ваш домен перед деплоєм (потрібно для sitemap та абсолютних URL).
const SITE = process.env.SITE_URL || 'https://protocols.example.com';

/**
 * rehype-плагін: обгортає <table> у <div class="table-wrap"> для горизонтальної
 * прокрутки на вузьких екранах. Без зовнішніх залежностей.
 */
function rehypeWrapTables() {
  const walk = (node) => {
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === 'element' && child.tagName === 'table') {
        node.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [child],
        };
      } else {
        walk(child);
      }
    }
  };
  return (tree) => walk(tree);
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  markdown: {
    rehypePlugins: [rehypeWrapTables],
  },
  integrations: [
    mdx(),
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false, // реєструємо SW вручну в BaseLayout (надійніше)
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Протоколи анестезіолога',
        short_name: 'Протоколи',
        description: 'Допоміжні протоколи та алгоритми з анестезіології — швидкий доступ з телефона, працює офлайн.',
        lang: 'uk',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#07120f',
        theme_color: '#07120f',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Маленький сайт — кешуємо все для offline-first.
        globPatterns: ['**/*.{html,js,css,svg,png,ico,json,woff2,webmanifest}'],
        navigateFallback: '/',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
});
