import { defineField, defineType } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO metadata',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'SEO title', type: 'string', validation: (Rule) => Rule.max(65) }),
    defineField({ name: 'description', title: 'Meta description', type: 'text', rows: 3, validation: (Rule) => Rule.max(160) }),
    defineField({ name: 'ogTitle', title: 'Open Graph title', type: 'string' }),
    defineField({ name: 'ogDescription', title: 'Open Graph description', type: 'text', rows: 3 }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'canonical', title: 'Canonical URL override', type: 'url' }),
    defineField({ name: 'noIndex', title: 'Noindex this page', type: 'boolean', initialValue: false }),
  ],
});

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Describe the image for accessibility and SEO.',
      validation: (Rule) => Rule.required(),
    }),
  ],
});

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'href', title: 'URL/path', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'openInNewTab', title: 'Open in new tab', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'href' },
  },
});

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({ name: 'platform', title: 'Platform', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required() }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'url' },
  },
});

export const cta = defineType({
  name: 'cta',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
    defineField({ name: 'label', title: 'Button label', type: 'string' }),
    defineField({ name: 'href', title: 'Button URL/path', type: 'string' }),
  ],
});

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Content blocks',
  type: 'array',
  of: [
    { type: 'block' },
    {
      type: 'imageWithAlt',
    },
  ],
});
