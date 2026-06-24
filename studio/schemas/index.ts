import { blockContent, cta, imageWithAlt, link, seo, socialLink } from './objects';
import { caseStudy } from './caseStudy';
import { faq } from './faq';
import { globalCta } from './globalCta';
import { navigation } from './navigation';
import { page } from './page';
import { post } from './post';
import { service } from './service';
import { siteSettings } from './siteSettings';
import { teamMember } from './teamMember';
import { testimonial } from './testimonial';

export const schemaTypes = [
  seo,
  imageWithAlt,
  link,
  socialLink,
  cta,
  blockContent,
  siteSettings,
  navigation,
  page,
  service,
  caseStudy,
  testimonial,
  faq,
  globalCta,
  teamMember,
  post,
];
