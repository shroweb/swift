import type { AstroGlobal } from 'astro';

export const siteUrl = 'https://swift7.co.uk';

export function canonical(pathname = '/') {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return new URL(clean, siteUrl).toString();
}

export function pageTitle(seo: any, fallback: string) {
  return seo?.title || fallback;
}

export function pageDescription(seo: any, fallback: string) {
  return seo?.description || fallback;
}

export function organizationSchema(settings: any) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${siteUrl}/#organization`,
    name: settings.businessName || 'Swift7',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    email: settings.email,
    telephone: settings.phone ? `+44${settings.phone.replace(/^0/, '').replace(/\D/g, '')}` : '+447380218301',
    priceRange: '£500',
    founder: { '@type': 'Person', name: 'Callum MacInnes', jobTitle: 'Web Designer & Founder' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    address: { '@type': 'PostalAddress', addressLocality: 'Hull', addressRegion: 'East Yorkshire', addressCountry: 'GB' },
  };
}

export function faqSchema(faqs: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function serviceSchema(service: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.shortDescription,
    provider: { '@id': `${siteUrl}/#organization` },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
  };
}

export function currentPath(Astro: AstroGlobal) {
  return new URL(Astro.request.url).pathname;
}
