// @ts-check
import { defineConfig } from 'astro/config';
//import netlify from '@astrojs/netlify';
import netlify from '@astrojs/netlify/functions'

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  output: "server",
  adapter: netlify({
  })
});