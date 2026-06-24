import { defineField, defineType } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Blog / news',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'publishedAt', title: 'Published date', type: 'datetime' }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'featuredImage', title: 'Featured image', type: 'imageWithAlt' }),
    defineField({ name: 'content', title: 'Content', type: 'blockContent' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'featuredImage' },
  },
});
