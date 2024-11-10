import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [glsl()],
  css : { postcss: { plugins: [tailwindcss()] } },
})