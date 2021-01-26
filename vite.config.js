import vue from '@vitejs/plugin-vue'

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['firebase']
  }
}
