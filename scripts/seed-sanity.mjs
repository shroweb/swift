import { createClient } from '@sanity/client';
import {
  caseStudies,
  faqs,
  homepage,
  navigation,
  services,
  siteSettings,
  testimonials,
} from '../src/lib/fallback.ts';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'loyzqo4e';
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.PUBLIC_SANITY_API_VERSION || '2026-06-24';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN. Create a Sanity write token, then run: SANITY_WRITE_TOKEN=... npm run sanity:seed');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

function slug(value) {
  return { _type: 'slug', current: value };
}

function blocks(text) {
  return text
    ? [
        {
          _type: 'block',
          _key: Math.random().toString(36).slice(2),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [] }],
        },
      ]
    : [];
}

const tx = client.transaction();

tx.createOrReplace({
  _id: 'siteSettings',
  _type: 'siteSettings',
  ...siteSettings,
});

tx.createOrReplace({
  _id: 'navigation-main',
  _type: 'navigation',
  title: 'Main navigation',
  ...navigation,
});

tx.createOrReplace({
  _id: 'page-home',
  _type: 'page',
  title: homepage.title,
  slug: slug('home'),
  status: 'published',
  heroHeading: homepage.heroHeading,
  heroText: homepage.heroText,
  cta: homepage.cta,
  seo: homepage.seo,
});

services.forEach((service) => {
  tx.createOrReplace({
    _id: `service-${service.slug}`,
    _type: 'service',
    ...service,
    slug: slug(service.slug),
    fullDescription: blocks(service.shortDescription),
  });
});

caseStudies.forEach((study) => {
  tx.createOrReplace({
    _id: `caseStudy-${study.slug}`,
    _type: 'caseStudy',
    ...study,
    slug: slug(study.slug),
    featuredImage: undefined,
  });
});

testimonials.forEach((review, index) => {
  tx.createOrReplace({
    _id: `testimonial-${index + 1}`,
    _type: 'testimonial',
    ...review,
  });
});

faqs.forEach((faq, index) => {
  tx.createOrReplace({
    _id: `faq-${index + 1}`,
    _type: 'faq',
    ...faq,
  });
});

await tx.commit();
console.log(`Seeded Swift7 starter content into Sanity project ${projectId}/${dataset}.`);
