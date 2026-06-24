import { defineField, defineType } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['draft', 'published'] },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
    defineField({ name: 'heroHeading', title: 'Hero heading', type: 'string' }),
    defineField({ name: 'heroText', title: 'Hero text', type: 'text', rows: 3 }),
    defineField({ name: 'heroImage', title: 'Hero image', type: 'imageWithAlt' }),
    defineField({ name: 'content', title: 'Main content blocks', type: 'blockContent' }),
    defineField({ name: 'cta', title: 'Page CTA', type: 'cta' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', status: 'status' },
    prepare: ({ title, slug, status }) => ({ title, subtitle: `/${slug || ''} · ${status}` }),
  },
});
