import { defineField, defineType } from 'sanity';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    defineField({ name: 'clientName', title: 'Customer/client name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'company', title: 'Company', type: 'string' }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'reviewText', title: 'Review text', type: 'text', rows: 5, validation: (Rule) => Rule.required() }),
    defineField({ name: 'starRating', title: 'Star rating', type: 'number', initialValue: 5, validation: (Rule) => Rule.min(1).max(5) }),
    defineField({ name: 'source', title: 'Source', type: 'string', options: { list: ['Google', 'Email', 'WhatsApp', 'Direct'] } }),
    defineField({ name: 'image', title: 'Image/logo', type: 'imageWithAlt' }),
    defineField({ name: 'relatedService', title: 'Related service', type: 'reference', to: [{ type: 'service' }] }),
    defineField({ name: 'relatedCaseStudy', title: 'Related case study', type: 'reference', to: [{ type: 'caseStudy' }] }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'clientName', subtitle: 'company', media: 'image' },
  },
});
