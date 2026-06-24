import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'businessName', title: 'Business name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'logo', title: 'Logo', type: 'imageWithAlt' }),
    defineField({ name: 'phone', title: 'Phone number', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'email', title: 'Email address', type: 'string', validation: (Rule) => Rule.required().email() }),
    defineField({ name: 'address', title: 'Address', type: 'text', rows: 3 }),
    defineField({ name: 'openingHours', title: 'Opening hours', type: 'text', rows: 3 }),
    defineField({ name: 'socialLinks', title: 'Social links', type: 'array', of: [{ type: 'socialLink' }] }),
    defineField({ name: 'primaryCtaLabel', title: 'Primary CTA label', type: 'string' }),
    defineField({ name: 'primaryCtaLink', title: 'Primary CTA link', type: 'string' }),
    defineField({ name: 'footerText', title: 'Footer text', type: 'text', rows: 3 }),
    defineField({ name: 'copyrightText', title: 'Copyright text', type: 'string' }),
    defineField({ name: 'seo', title: 'Default SEO', type: 'seo' }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
});
