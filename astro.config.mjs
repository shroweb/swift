import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  site: 'https://swift7.co.uk',
  output: 'static',
  publicDir: 'public',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/daily-plan') && !page.includes('/tools/'),
    }),
  ],
  build: {
    format: 'file',
  },
});
