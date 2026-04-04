import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/main',
      lib: { entry: 'electron/main.js' },
      rollupOptions: { output: { format: 'cjs', entryFileNames: '[name].cjs' } },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/preload',
      lib: { entry: 'electron/preload.js' },
      rollupOptions: { output: { format: 'cjs', entryFileNames: '[name].js' } },
    },
  },
  renderer: {
    root: '.',
    base: './',
    build: {
      outDir: 'dist-electron/renderer',
      rollupOptions: { input: 'index.html' },
    },
    plugins: [react()],
  },
})
