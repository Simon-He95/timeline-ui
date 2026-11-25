import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  publicDir: false,
  plugins: [
    vue(),
    dts({
      include: ['src/lib/**/*.ts', 'src/lib/**/*.vue'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/lib/index.ts', import.meta.url)),
      name: 'TimelineUI',
      fileName: 'timeline-ui',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
    },
    cssCodeSplit: false,
  },
})
