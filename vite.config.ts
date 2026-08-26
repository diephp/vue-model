import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      fileName: 'vue-model',
      formats: ['es'],
    },
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      external: ['vue'],
    },
  },
})
