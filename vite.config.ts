import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        injectRegister: false,
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        includeAssets: ['pwa-192.png', 'pwa-512.png'],
        manifest: {
          name: 'Last Day Words',
          short_name: 'Last Day Words',
          description: 'Prophetic speed arcade — Mixed and Chapter boards, weekly leaderboards, streaks.',
          theme_color: '#0b0b0e',
          background_color: '#0b0b0e',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('motion')) return 'vendor-motion';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('canvas-confetti')) return 'vendor-confetti';
              return 'vendor';
            }
            // Split large bundled catalogs for parallel download / better caching
            if (id.includes('wordsExpansion2')) return 'content-words-2';
            if (id.includes('wordsExpansion')) return 'content-words-1';
            if (id.includes('expertCluesExpansion2')) return 'content-clues-2';
            if (id.includes('expertCluesExpansion')) return 'content-clues-1';
            if (id.includes('studyContent')) return 'content-study';
          },
        },
      },
      // Catalog + vendors: keep warning threshold honest without hiding regressions forever
      chunkSizeWarningLimit: 600,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
