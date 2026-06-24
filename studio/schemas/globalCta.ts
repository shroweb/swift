import { defineField, defineType } from 'sanity';

export const globalCta = defineType({
  name: 'globalCta',
  title: 'Global CTAs',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Internal title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
    defineField({ name: 'buttonLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'buttonLink', title: 'Button link', type: 'string' }),
  ],
});
