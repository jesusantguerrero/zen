import vue from '@vitejs/plugin-vue'
import { resolve } from "path";

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [vue()],
  optimizeDeps: {
    include:[ 'firebase/app', 'firebase/analytics', 'firebase/messaging', 'firebase/auth'],
    exclude: ["apexcharts"]
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'user-satisfaction.html')
      }
    }
  }
}
