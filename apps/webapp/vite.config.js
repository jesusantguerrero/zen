import Vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md';
import { dirname, join, resolve } from "path";
import Icons from 'unplugin-icons/vite'
import IconsResolver from "unplugin-icons/resolver"
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath } from 'url';

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))
/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [
    Vue({
      include: [/\.vue$/,/\.md$/]
    }),
    Markdown(),
    Components({
      resolvers: [
          IconsResolver(),
      ],
    }),
    Icons({
      autoInstall: true,
    })
  ],
  optimizeDeps: {
    include:[ 'firebase/app', 'atmosphere-ui', 'firebase/analytics', 'firebase/messaging', 'firebase/auth'],
    exclude: ["apexcharts"],
  },
  resolve: {
    alias: {
      '@': resolve('./src/'),
      '@components': resolve('./src/components'),
    },
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
    },
    port: 3000
  },
  test: {
    environment: 'happy-dom',
    global: true
  }
}
