import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  alias: {
    'vue-depth-viewer': resolve(__dirname, '../../src/index.tsx'),
  }
})
