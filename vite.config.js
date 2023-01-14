import vue from '@vitejs/plugin-vue'
import markdown from 'vite-plugin-md';
import { dirname, join } from "path";
import { fileURLToPath } from 'url';

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))
/**
 * @type {import('vite').UserConfig}
 */
export default {
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    }
  },
  plugins: [
    vue({
      include: [/\.vue$/,/\.md$/]
    }),
    markdown(),
  ],
  optimizeDeps: {
    include:[ 'firebase/app', 'atmosphere-ui', 'firebase/analytics', 'firebase/messaging', 'firebase/auth'],
    exclude: ["apexcharts", "vue-temporal-components"],
  },
  build: {
    rollupOptions: {
      input: {
        main: join(_dirname, 'index.html'),
        nested: join(_dirname, 'pages/user-satisfaction.html'),
        terms: join(_dirname, 'pages/terms.html'),
        privacyPolicy: join(_dirname, 'pages/privacy-policy.html')
      }
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
  test: {
    environment: 'happy-dom',
    global: true
  }
}
