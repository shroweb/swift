import { createClient } from '@sanity/client';
import groq from 'groq';
import {
  caseStudies as fallbackCaseStudies,
  faqs as fallbackFaqs,
  homepage as fallbackHomepage,
  navigation as fallbackNavigation,
  services as fallbackServices,
  siteSettings as fallbackSettings,
  testimonials as fallbackTestimonials,
} from './fallback';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || 'loyzqo4e';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || process.env.PUBLIC_SANITY_API_VERSION || '2026-06-24';
const token = import.meta.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_READ_TOKEN;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: !token,
  perspective: token ? 'previewDrafts' : 'published',
});

async function fetchWithFallback<T>(query: string, fallback: T, params: Record<string, unknown> = {}): Promise<T> {
  try {
    const data = await sanityClient.fetch<T>(query, params);
    if (Array.isArray(data)) return data.length ? data : fallback;
    return data || fallback;
  } catch (error) {
    console.warn('[sanity:fallback]', error);
    return fallback;
  }
}

const imageProjection = `{
  "url": asset->url,
  "alt": alt
}`;

export async function getSiteSettings() {
  return fetchWithFallback(
    groq`*[_type == "siteSettings"][0]{
      businessName, tagline, phone, email, address, openingHours, socialLinks,
      primaryCtaLabel, primaryCtaLink, footerText, copyrightText, seo,
      "logo": logo ${imageProjection}
    }`,
    fallbackSettings,
  );
}

export async function getNavigation() {
  const navigation = await fetchWithFallback(
    groq`*[_type == "navigation"][0]{headerLinks, footerLinks, ctaLink, socialLinks}`,
    fallbackNavigation,
  );
  const stripRetiredLinks = (links: any[] = []) =>
    links.filter((link) => link?.href !== '/swift7-plus' && link?.label !== 'Swift7 Plus');
  return {
    ...navigation,
    headerLinks: stripRetiredLinks((navigation as any).headerLinks),
    footerLinks: stripRetiredLinks((navigation as any).footerLinks),
  };
}

export async function getHomepage() {
  return fetchWithFallback(
    groq`*[_type == "page" && slug.current == "home" && status == "published"][0]{
      title, "slug": slug.current, heroHeading, heroText, "heroImage": heroImage ${imageProjection}, content, cta, seo
    }`,
    fallbackHomepage,
  );
}

export async function getServices() {
  const services = await fetchWithFallback(
    groq`*[_type == "service"] | order(displayOrder asc){
      name, "slug": slug.current, shortDescription, fullDescription, "featuredImage": featuredImage ${imageProjection},
      icon, price, timeline, features, seo, ctaLabel, ctaLink, displayOrder, featured
    }`,
    fallbackServices,
  );
  return services.filter((service: any) => service.slug === 'swift7-launch').map((service: any) => {
    const fallback = fallbackServices.find((item) => item.slug === service.slug) || {};
    const merged = { ...fallback, ...service };
    if (merged.slug === 'swift7-launch') {
      return {
        ...merged,
        shortDescription: '£250 one-time fee website for trades, local businesses and startups needing a credible site fast.',
        price: '£250',
        seo: {
          ...(merged.seo || {}),
          title: 'Swift7 Launch | £250 Website Live in 7 Days',
          description: 'The Swift7 Launch is a £250 one-time fee website build for UK small businesses, live in 7 days with copy, SEO, hosting and Google Business Profile setup.',
        },
      };
    }
    return merged;
  });
}

export async function getCaseStudies() {
  const studies = await fetchWithFallback(
    groq`*[_type == "caseStudy"] | order(displayOrder asc){
      clientName, "slug": slug.current, industry, location, summary, challenge, solution, results,
      "featuredImage": featuredImage ${imageProjection}, gallery[]{..., asset->}, seo, displayOrder, featured
    }`,
    fallbackCaseStudies,
  );
  return studies.map((study: any) => {
    const fallback = fallbackCaseStudies.find((item) => item.slug === study.slug) || {};
    return { ...fallback, ...study, featuredImage: study.featuredImage || (fallback as any).featuredImage };
  });
}

export async function getFaqs() {
  return fetchWithFallback(
    groq`*[_type == "faq"] | order(displayOrder asc){question, answer, category, displayOrder}`,
    fallbackFaqs,
  );
}

export async function getTestimonials() {
  return fetchWithFallback(
    groq`*[_type == "testimonial"] | order(displayOrder asc){
      clientName, company, role, reviewText, starRating, source, "image": image ${imageProjection}, displayOrder
    }`,
    fallbackTestimonials,
  );
}
