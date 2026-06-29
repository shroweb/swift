import { defineField, defineType } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'Services',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Service name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'shortDescription', title: 'Short description', type: 'text', rows: 3 }),
    defineField({ name: 'price', title: 'Price', type: 'string', description: 'Short display price, for example £250 or £995.' }),
    defineField({ name: 'timeline', title: 'Timeline', type: 'string', description: 'Short delivery promise, for example Live in 7 days.' }),
    defineField({ name: 'features', title: 'Features', type: 'array', of: [{ type: 'string' }], description: 'Short bullet points shown on package cards.' }),
    defineField({ name: 'fullDescription', title: 'Full description', type: 'blockContent' }),
    defineField({ name: 'featuredImage', title: 'Featured image', type: 'imageWithAlt' }),
    defineField({ name: 'icon', title: 'Icon name', type: 'string', description: 'Use a Swift7 icon id, e.g. s7-search, s7-rocket, s7-pages.' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
    defineField({ name: 'ctaLabel', title: 'CTA label', type: 'string' }),
    defineField({ name: 'ctaLink', title: 'CTA link', type: 'string' }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 0 }),
    defineField({ name: 'featured', title: 'Featured service', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Display order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'shortDescription', media: 'featuredImage' },
  },
});
