import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './studio/schemas';
import { deskStructure } from './studio/structure';

export default defineConfig({
  name: 'swift7',
  title: 'Swift7 CMS',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'loyzqo4e',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  basePath: '/studio',
  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
