import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig(({ command }) => ({
  plugins: [
    Vue(),
    vueJsx(),
  ],
  resolve: command === 'build'
    ? {}
    : {
      alias: {
        'vue-depth-viewer': resolve(__dirname, '../../src/index.tsx'),
      },
    },
  build: {
    minify: false,
  },
}))
