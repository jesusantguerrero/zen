import vue from '@vitejs/plugin-vue'
import markdown from 'vite-plugin-md';
import Layouts from "vite-plugin-vue-layouts";
import { resolve } from "path";

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [
    vue({
      include: [/\.vue$/,/\.md$/]
    }),
    markdown(),
    Layouts()
  ],
  optimizeDeps: {
    include:[ 'firebase/app', 'firebase/analytics', 'firebase/messaging', 'firebase/auth'],
    exclude: ["apexcharts", 'atmosphere-ui'],
    link: ['atmosphere-ui']
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'pages/user-satisfaction.html'),
        terms: resolve(__dirname, 'pages/terms.html'),
        privacyPolicy: resolve(__dirname, 'pages/privacy-policy.html')
      }
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
}
