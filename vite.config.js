// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        species: resolve(__dirname, 'search/index.html'),
        fonts: resolve(__dirname, 'fonts/index.html')
      }
    }
  }
})
