import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' for browser-like environment
    globals: true,
    setupFiles: [], // optional setup files
  },
})