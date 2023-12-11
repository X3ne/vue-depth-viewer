import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import banner from 'vite-plugin-banner'
import glsl from 'vite-plugin-glsl'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

const outDir = 'lib'

export default defineConfig({
  build: {
    outDir,
    lib: {
      entry: 'src/index.tsx',
      name: 'vueDepthViewer',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'index.mjs'
          case 'cjs':
            return 'index.cjs'
          default:
            return 'index.min.js'
        }
      },
    },
    minify: true,
    sourcemap: false,
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies),
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  resolve: {
    dedupe: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
    ],
  },
  plugins: [
    vue(),
    vueJsx(),
    dts({ rollupTypes: true }),
    glsl(),
    banner({
      outDir,
      content: [
        '/**',
        ` * name: ${pkg.name}`,
        ` * version: v${pkg.version}`,
        ` * description: ${pkg.description}`,
        ` * author: ${pkg.author}`,
        ` * homepage: ${pkg.homepage}`,
        ` * license: ${pkg.license}`,
        ' */',
      ].join('\n'),
    }),
  ],
})
