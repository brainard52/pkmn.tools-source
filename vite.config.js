// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        species: resolve(__dirname, 'search/species.html'),
        fonts: resolve(__dirname, 'fonts.html')
      }
    }
  }
})
