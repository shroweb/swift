import { defineField, defineType } from 'sanity';

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team members',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'bio', title: 'Bio', type: 'blockContent' }),
    defineField({ name: 'image', title: 'Image', type: 'imageWithAlt' }),
    defineField({ name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
});
