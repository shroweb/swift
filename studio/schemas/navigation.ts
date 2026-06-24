import { defineField, defineType } from 'sanity';

export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Main navigation', validation: (Rule) => Rule.required() }),
    defineField({ name: 'headerLinks', title: 'Header nav links', type: 'array', of: [{ type: 'link' }] }),
    defineField({ name: 'footerLinks', title: 'Footer nav links', type: 'array', of: [{ type: 'link' }] }),
    defineField({ name: 'ctaLink', title: 'CTA link', type: 'link' }),
    defineField({ name: 'socialLinks', title: 'Social links', type: 'array', of: [{ type: 'socialLink' }] }),
  ],
  preview: {
    select: { title: 'title' },
  },
});
