import type { StructureResolver } from 'sanity/structure';

const singleton = (S: any, type: string, title: string) =>
  S.listItem()
    .title(title)
    .id(type)
    .child(S.document().schemaType(type).documentId(type).title(title));

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Swift7')
    .items([
      S.listItem()
        .title('Website')
        .child(
          S.list()
            .title('Website')
            .items([
              singleton(S, 'siteSettings', 'Site settings'),
              S.documentTypeListItem('navigation').title('Navigation'),
              S.documentTypeListItem('globalCta').title('Global CTAs'),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('caseStudy').title('Portfolio'),
      S.documentTypeListItem('testimonial').title('Reviews'),
      S.documentTypeListItem('faq').title('FAQs'),
      S.documentTypeListItem('post').title('Blog / news'),
      S.documentTypeListItem('teamMember').title('Team'),
    ]);
