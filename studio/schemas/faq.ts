import { defineField, defineType } from 'sanity';

export const faq = defineType({
  name: 'faq',
  title: 'FAQs',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'category', title: 'Category', type: 'string' }),
    defineField({ name: 'relatedService', title: 'Related service', type: 'reference', to: [{ type: 'service' }] }),
    defineField({ name: 'relatedPage', title: 'Related page', type: 'reference', to: [{ type: 'page' }] }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'question', subtitle: 'category' },
  },
});
