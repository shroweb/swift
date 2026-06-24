import { defineField, defineType } from 'sanity';

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case studies / portfolio',
  type: 'document',
  fields: [
    defineField({ name: 'clientName', title: 'Project/client name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'clientName' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'industry', title: 'Industry', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 3 }),
    defineField({ name: 'challenge', title: 'Challenge', type: 'blockContent' }),
    defineField({ name: 'solution', title: 'Solution', type: 'blockContent' }),
    defineField({ name: 'results', title: 'Results', type: 'blockContent' }),
    defineField({ name: 'servicesUsed', title: 'Services used', type: 'array', of: [{ type: 'reference', to: [{ type: 'service' }] }] }),
    defineField({ name: 'featuredImage', title: 'Featured image', type: 'imageWithAlt' }),
    defineField({ name: 'gallery', title: 'Gallery', type: 'array', of: [{ type: 'imageWithAlt' }] }),
    defineField({ name: 'testimonial', title: 'Related testimonial', type: 'reference', to: [{ type: 'testimonial' }] }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 0 }),
    defineField({ name: 'featured', title: 'Featured case study', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Display order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'clientName', subtitle: 'industry', media: 'featuredImage' },
  },
});
