import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const rawValue = trimmed.slice(eq + 1).trim()
    const value = rawValue.replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(path.join(__dirname, '.env'))
loadEnvFile(path.join(process.cwd(), '.env'))

const PORT = Number(process.env.OUTREACH_PORT || 4177)
const HOST = process.env.OUTREACH_HOST || '127.0.0.1'
const REVIEW_MIN_MS = Number(process.env.REVIEW_MIN_MS || 10000)
function realSecret(value, placeholders) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (placeholders.some(placeholder => trimmed.includes(placeholder))) return ''
  return trimmed
}

const GOOGLE_PAGESPEED_KEY = process.env.GOOGLE_PAGESPEED_KEY || ''
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'
const NOTION_TOKEN = realSecret(process.env.NOTION_TOKEN, ['your_notion', 'secret_your'])
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || process.env.NOTION_OUTREACH_DATABASE_ID || '5ad7c6b5e18d4157babe9e694c3aef18'
const NOTION_VERSION = '2022-06-28'

function json(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function normalizeUrl(input) {
  const trimmed = String(input || '').trim()
  if (!trimmed) throw new Error('Website URL is required')
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const url = new URL(withProtocol)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http and https URLs are supported')
  return url.toString()
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#8217;|&rsquo;/gi, "'")
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/gi, '-')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchAllUnique(text, regex) {
  const found = new Set()
  for (const match of text.matchAll(regex)) {
    const value = (match[1] || match[0] || '').trim()
    if (value) found.add(value)
  }
  return [...found]
}

function attrLinks(html, baseUrl) {
  const links = []
  for (const match of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    try {
      const href = match[1].trim()
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue
      links.push(new URL(href, baseUrl).toString())
    } catch {
      // Ignore malformed links.
    }
  }
  return [...new Set(links)]
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractTitle(html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return stripHtml(og || title || '').replace(/\s*[|-]\s*Home\s*$/i, '').slice(0, 90)
}

function extractMetaDescription(html) {
  const meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
  return stripHtml(meta || '').slice(0, 220)
}

function extractBusinessName(title, host) {
  const clean = title
    .replace(/\s*\|\s*.*$/g, '')
    .replace(/\s*[–—]\s*.*$/g, '')
    .replace(/^(Services|Our Services|Accounting Services|Contact|About)\s*[-:]\s*/i, '')
    .replace(/\s*-\s*(Home|Welcome|Contact|Official Site).*$/gi, '')
    .replace(/\s*-\s*(Affordable|Professional|Web Design|Home).*$/gi, '')
    .trim()

  // Detect generic category titles: start with a trade/service noun + location words
  // e.g. "Accountants in Melton, East Yorkshire" or "Plumbers Hull"
  const looksLikeCategory = /^(accountant|plumber|electrician|roofer|roofing|joiner|carpenter|builder|solicitor|solicitors|dentist|physio|cleaner|cleaning|landscap|gardener|decorator|painter|taxi|courier|florist|photographer|therapist|driving instructor|personal trainer|hairdress|barber|locksmith|removal|skip hire|pest control|tree surgeon|scaffolding|drainage|garage|mot|window|glazing|decorator|plasterer|tiler|flooring|estate agent|letting agent|mortgage|financial advis|insurance|surveyor|architect)\w*(\s+in\b|\s+for\b|\s+near\b|,\s|\s+hull|\s+yorkshire|\s+east|\s+north|\s+south|\s+west)/i.test(clean)

  if (clean && clean.length > 2 && !looksLikeCategory) return clean

  // Fall back to hostname → readable business name
  return host.replace(/^www\./, '').split('.')[0].replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function extractHeadings(html) {
  return [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map(match => stripHtml(match[1]))
    .filter(Boolean)
    .slice(0, 30)
}

function extractEmails(html, text) {
  const fromMailto = matchAllUnique(html, /mailto:([^"'?<>#\s]+)/gi)
  const fromText = matchAllUnique(text, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)
  const cleaned = [...new Set([...fromMailto, ...fromText])]
    .map(email => email.replace(/^mailto:/i, '').toLowerCase())
    .map(email => email.replace(/^([^@\s]+@)+([^@\s]+\.[^@\s]+)$/i, (match) => {
      const parts = match.split('@')
      return `${parts.at(-2)}@${parts.at(-1)}`
    }))
    .filter(email => !email.includes('example.com') && !email.endsWith('.png') && !email.endsWith('.jpg'))
  return [...new Set(cleaned)]
}

function extractPhones(text) {
  return matchAllUnique(text, /(?:\+44\s?|0)(?:\d[\s().-]?){9,12}\d/g).slice(0, 3)
}

function extractInstagram(links) {
  return links.find(link => /instagram\.com/i.test(link) && !/\/p\//i.test(link)) || ''
}

function extractInstagramFromHtml(html, baseUrl) {
  return extractInstagram(attrLinks(html, baseUrl))
}

function imageStats(html) {
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0])
  const missingAlt = imgs.filter(img => !/\balt\s*=\s*["'][^"']{3,}["']/i.test(img)).length
  const stockLike = imgs.filter(img => /(unsplash|pexels|shutterstock|istock|getty|stock)/i.test(img)).length
  return { count: imgs.length, missingAlt, stockLike }
}

function formStats(html) {
  return {
    count: (html.match(/<form\b/gi) || []).length,
    hasErrorText: /error sending|oops|failed|not working|invalid/i.test(stripHtml(html)),
  }
}

function detectSpamInjection(html, text, businessType) {
  // Strategy: require the spam keyword to appear in a hyperlink — either as anchor text or
  // as part of a link's href. This eliminates false positives from legitimate mentions of
  // words like "testosterone" in health articles or embedded widgets.
  // A real hack almost always manifests as an outbound link, not just a stray word.

  const lowerHtml = html.toLowerCase()
  const lowerText = text.toLowerCase()

  // Extract all <a> tags with their href and anchor text
  const linkPattern = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  const links = []
  let m
  while ((m = linkPattern.exec(html)) !== null) {
    links.push({ href: m[1].toLowerCase(), anchor: stripHtmlTags(m[2]).toLowerCase() })
  }

  const spamSets = [
    { label: 'pharmaceutical spam', linkKeywords: ['roids', 'steroid', 'testosterone', 'viagra', 'cialis', 'pharmacy', 'anabolic', 'sarm', 'hgh', 'human-growth'], textKeywords: ['buy testosterone', 'buy steroids', 'buy viagra', 'buy cialis', 'anabolic steroid', 'online pharmacy'] },
    { label: 'gambling spam', linkKeywords: ['casino', 'poker', 'betting', 'slots', 'bet365', 'gambling', 'wager'], textKeywords: ['online casino', 'free spins', 'casino bonus', 'sports betting', 'poker site'] },
    { label: 'payday loan spam', linkKeywords: ['payday', 'cash-advance', 'logbook-loan', 'doorstep-loan'], textKeywords: ['payday loan', 'cash advance', 'same day loan', 'bad credit loan', 'logbook loan'] },
    { label: 'forex/crypto spam', linkKeywords: ['forex', 'binary-option', 'crypto-invest', 'trading-robot'], textKeywords: ['forex trading signals', 'binary options', 'crypto investment', 'trading robot', 'passive income crypto'] },
    { label: 'adult content spam', linkKeywords: ['escort', 'adult-dating', 'cam-girl', 'onlyfans'], textKeywords: ['escort service', 'adult dating', 'cam girls', 'onlyfans leak'] },
    { label: 'replica/counterfeit spam', linkKeywords: ['replica', 'fake-rolex', 'counterfeit', 'knockoff'], textKeywords: ['replica handbag', 'fake rolex', 'cheap replica', 'buy knockoff'] },
    { label: 'follower spam', linkKeywords: ['buy-followers', 'buy-views', 'buy-likes'], textKeywords: ['buy instagram followers', 'buy youtube views', 'buy tiktok likes', 'buy twitter followers'] },
  ]

  const isPharmacy = /pharmacy|pharmacist|chemist|medical practice|health clinic/i.test(businessType)
  const isFinanceLender = /payday|lending|loan company|credit broker/i.test(businessType)
  const isFitness = /gym|fitness|personal train|nutrition|supplement|sport/i.test(businessType)
  const isGambling = /betting|casino|gambling/i.test(businessType)
  const isAdult = /adult|escort|entertainment/i.test(businessType)

  for (const { label, linkKeywords, textKeywords } of spamSets) {
    if (label.includes('pharmaceutical') && (isPharmacy || isFitness)) continue
    if (label.includes('payday') && isFinanceLender) continue
    if (label.includes('gambling') && isGambling) continue
    if (label.includes('adult') && isAdult) continue

    // Primary signal: a link whose href or anchor text contains a spam keyword
    const spamLink = links.find(lk =>
      linkKeywords.some(kw => lk.href.includes(kw) || lk.anchor.includes(kw))
    )
    if (spamLink) {
      const keyword = linkKeywords.find(kw => spamLink.href.includes(kw) || spamLink.anchor.includes(kw))
      return {
        issues: [`The site appears to contain injected spam content — a link to an external ${label.replace(' spam', '')} site has no business being here. This usually means the site has been compromised, and Google can penalise it for it.`],
        spamCategory: label,
        spamKeyword: keyword,
      }
    }

    // Secondary signal: highly specific multi-word phrases in visible text (much lower false-positive risk)
    const textMatch = textKeywords.find(kw => lowerText.includes(kw))
    if (textMatch) {
      return {
        issues: [`The site appears to contain injected spam content — "${textMatch}" has no place on a site like this. This usually means the site has been compromised, and Google can penalise it for it.`],
        spamCategory: label,
        spamKeyword: textMatch,
      }
    }
  }

  return { issues: [], spamCategory: '', spamKeyword: '' }
}

function stripHtmlTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function classifyBusiness(text, title, description = '') {
  const hay = `${title} ${description} ${text.slice(0, 2500)}`.toLowerCase()
  const checks = [
    // Trades
    ['electrician', 'electrician'],
    ['electrical contractor', 'electrician'],
    ['roofing', 'roofing company'],
    ['roofer', 'roofing company'],
    ['plumb', 'plumbing and heating business'],
    ['gas engineer', 'plumbing and heating business'],
    ['joiner', 'joinery business'],
    ['carpenter', 'joinery business'],
    ['builder', 'building company'],
    ['construction', 'building company'],
    ['plasterer', 'plastering business'],
    ['painter', 'painting and decorating business'],
    ['decorator', 'painting and decorating business'],
    ['landscap', 'landscaping business'],
    ['gardener', 'gardening business'],
    ['garden design', 'landscaping business'],
    ['tiler', 'tiling business'],
    ['flooring', 'flooring business'],
    ['window', 'window and glazing business'],
    ['double glazing', 'window and glazing business'],
    ['garage', 'garage'],
    ['mot ', 'garage'],
    ['removal', 'removal company'],
    ['skip hire', 'skip hire business'],
    ['cleaning', 'cleaning company'],
    ['cleaner', 'cleaning company'],
    ['pest control', 'pest control business'],
    ['tree surgeon', 'tree surgery business'],
    ['locksmith', 'locksmith'],
    ['security', 'security company'],
    ['scaffolding', 'scaffolding company'],
    ['drainage', 'drainage business'],
    // Professional services
    ['accountant', 'accountancy practice'],
    ['accountancy', 'accountancy practice'],
    ['bookkeep', 'bookkeeping business'],
    ['solicitor', 'solicitors'],
    ['law firm', 'law firm'],
    ['conveyancing', 'solicitors'],
    ['mortgage', 'mortgage adviser'],
    ['financial advis', 'financial adviser'],
    ['ifa ', 'financial adviser'],
    ['insurance', 'insurance broker'],
    ['estate agent', 'estate agency'],
    ['letting agent', 'letting agency'],
    ['surveyor', 'surveying practice'],
    ['architect', 'architecture practice'],
    ['consultant', 'consultancy'],
    ['recruitment', 'recruitment agency'],
    ['hr consultant', 'HR consultancy'],
    // Health
    ['dentist', 'dental practice'],
    ['dental', 'dental practice'],
    ['physio', 'physiotherapy practice'],
    ['osteopath', 'osteopathic practice'],
    ['chiropract', 'chiropractic practice'],
    ['optician', 'opticians'],
    ['pharmacy', 'pharmacy'],
    ['veterinary', 'veterinary practice'],
    ['vet ', 'veterinary practice'],
    ['therapist', 'therapy practice'],
    ['counselling', 'counselling practice'],
    ['psycholog', 'psychology practice'],
    ['nutritionist', 'nutrition business'],
    // Fitness / wellness
    ['personal trainer', 'personal training business'],
    ['personal training', 'personal training business'],
    ['gym', 'gym or fitness studio'],
    ['fitness', 'gym or fitness studio'],
    ['yoga', 'yoga or wellness studio'],
    ['pilates', 'pilates studio'],
    ['martial arts', 'martial arts club'],
    ['boxing', 'boxing club'],
    ['sports', 'sports business'],
    // Beauty
    ['beauty', 'beauty business'],
    ['aesthetic', 'aesthetics clinic'],
    ['hair salon', 'hair salon'],
    ['hairdress', 'hairdresser'],
    ['barber', 'barbershop'],
    ['nail', 'nail salon'],
    ['spa', 'spa or wellness business'],
    ['tattoo', 'tattoo studio'],
    // Food & hospitality
    ['restaurant', 'restaurant'],
    ['cafe', 'cafe'],
    ['coffee shop', 'coffee shop'],
    ['takeaway', 'takeaway'],
    ['catering', 'catering business'],
    ['bakery', 'bakery'],
    ['pub ', 'pub or bar'],
    ['bar ', 'pub or bar'],
    ['hotel', 'hotel'],
    ['bed and breakfast', 'B&B'],
    ['b&b', 'B&B'],
    // Creative
    ['photograph', 'photography business'],
    ['videograph', 'videography business'],
    ['graphic design', 'graphic design studio'],
    ['web design', 'web design business'],
    ['marketing', 'marketing agency'],
    ['seo', 'SEO agency'],
    ['social media', 'social media agency'],
    ['print', 'print business'],
    ['florist', 'florist'],
    ['wedding', 'wedding business'],
    ['event', 'event company'],
    // Education
    ['driving school', 'driving school'],
    ['driving instruct', 'driving school'],
    ['tutor', 'tutoring business'],
    ['nursery', 'nursery or childcare'],
    ['childcare', 'nursery or childcare'],
    ['childminder', 'nursery or childcare'],
    ['training provider', 'training provider'],
    // Transport
    ['taxi', 'taxi or private hire business'],
    ['courier', 'courier business'],
    ['haulage', 'haulage company'],
    ['logistics', 'logistics company'],
    // Other
    ['funeral', 'funeral director'],
    ['charity', 'charity or non-profit'],
    ['church', 'church or community group'],
    ['letting', 'letting agency'],
    ['property manag', 'property management company'],
  ]
  return checks.find(([needle]) => hay.includes(needle))?.[1] || 'local business'
}

function findIssues({ url, html, text, emails, instagram, title, description, buttons, links, headings, images, forms, businessType, reviewedUrls }) {
  const lower = `${html} ${text}`.toLowerCase()
  const issues = []
  const host = new URL(url).host.replace(/^www\./, '')
  const email = emails[0] || ''
  const firstScreen = text.slice(0, 2200).toLowerCase()

  if (url.startsWith('http://')) {
    issues.push('The site is loading over HTTP rather than HTTPS, which can make browsers and customers treat it as less trustworthy.')
  }

  if (email && /@(gmail|hotmail|outlook|live|yahoo|icloud)\./i.test(email)) {
    issues.push(`The public email is ${email}, which feels less professional than a domain email for customer enquiries.`)
  }

  if (email && !email.endsWith(`@${host}`) && !/@(gmail|hotmail|outlook|live|yahoo|icloud)\./i.test(email)) {
    issues.push(`The email domain does not match the website domain, which can create a small trust wobble.`)
  }

  if (/wixstatic|wix\.com|editorx|powered by wix/i.test(lower)) issues.push('The site shows Wix/template traces, so it can feel rented rather than properly owned.')
  if (/ueniweb|ueni\.com|powered by ueni/i.test(lower)) issues.push('The site appears to use UENI/platform wording, which can make the business feel less independent.')
  if (/yell\.com|business\.yell\.com|hibu/i.test(lower)) issues.push('The site has directory-builder traces, which can make it feel more like a listing than a proper business website.')
  if (/lorem ipsum|coming soon|under construction/i.test(lower)) issues.push('There is placeholder or unfinished wording visible, which hurts credibility.')

  const years = matchAllUnique(text, /\b20(1[0-9]|2[0-5])\b/g).map(Number)
  const oldestRecent = Math.min(...years.filter(Boolean))
  if (oldestRecent && oldestRecent <= new Date().getFullYear() - 2 && /copyright|all rights reserved|updated|news|latest/i.test(lower)) {
    issues.push('Some dated year/content signals make the site feel like it may not be actively maintained.')
  }

  const ctaText = buttons.join(' ').toLowerCase()
  const ctaLinks = links.join(' ').toLowerCase()
  const hasStrongCta = /(book|quote|call|enquir|contact|consult|valuation|appointment|estimate)/i.test(`${ctaText} ${ctaLinks} ${text.slice(0, 2500)}`)
  if (!hasStrongCta) issues.push('There is no obvious high-confidence call to action near the top of the site.')
  if (buttons.length > 0 && buttons.every(button => /^(read more|learn more|more|submit|send)$/i.test(button.trim()))) {
    issues.push(`The visible buttons are mostly generic labels like "${buttons[0]}", so the next step does not feel specific or persuasive.`)
  }

  if (!headings.some(heading => heading.length > 8)) {
    issues.push('The page headings are thin, so visitors do not get a clear service promise as they scan.')
  } else if (/welcome|home/i.test(headings[0] || '') && !/(quote|book|service|help|local|specialist)/i.test(headings[0] || '')) {
    issues.push(`The main heading "${headings[0]}" is vague and does not immediately sell the service or outcome.`)
  }

  if (forms.count > 0 && forms.hasErrorText) {
    issues.push('The contact form area appears to show error/failure wording, which is a direct enquiry risk.')
  }

  if (images.count >= 5 && images.missingAlt / images.count > 0.55) {
    issues.push('The image setup looks a bit unfinished, with lots of missing alt text, so the build feels less polished.')
  }
  if (images.stockLike > 0) {
    issues.push('Some imagery looks stock-sourced, so the site may not show enough real work, team or premises.')
  }

  if (!description || description.length < 55) {
    issues.push('The meta description is missing or thin, which is an easy local SEO win.')
  }

  if (!/(review|testimonial|google|rated|stars|trustpilot)/i.test(lower)) {
    issues.push('I could not see strong reviews or testimonials surfaced on the reviewed pages.')
  }

  if (/(electrician|roofing|plumbing|joinery|window|garage)/i.test(businessType) && !/(gallery|recent work|our work|projects|case stud|before|after|qualified|niceic|napit|gas safe|checkatrade)/i.test(lower)) {
    issues.push('For a trade business, there is not enough visible proof of recent work, qualifications or project examples.')
  }

  if (/(accountancy|bookkeeping|solicitors|law firm|mortgage)/i.test(businessType) && !/(team|qualified|regulated|accredit|review|testimonial|fixed fee|consultation)/i.test(lower)) {
    issues.push('For a trust-led professional service, team credentials, reassurance and next-step guidance are not prominent enough.')
  }

  if (reviewedUrls.length < 3 && !/(about|services|gallery|testimonials|reviews|case studies)/i.test(links.join(' '))) {
    issues.push('The site seems shallow, with few obvious supporting pages for proof, services or reviews.')
  }

  if (!instagram && isVisualBusinessText(lower) && !isProfessionalServiceText(lower)) {
    issues.push('I could not see a clear Instagram link from the site, which matters for visual/local businesses.')
  }

  if (text.length < 900) issues.push('The page is very light on content, so visitors get limited proof before deciding whether to enquire.')
  if (text.length > 9000) issues.push('The page is very text heavy, so key services and trust points may be hard to scan on mobile.')

  // #15 — no visible phone number
  const hasPhone = /(\+44|0[0-9]{2,4})[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,4}/.test(text)
  if (!hasPhone && !/(accountancy|bookkeeping|solicitors|law firm)/i.test(businessType)) {
    issues.push('No phone number is visible on the site — anyone who prefers to call rather than fill in a form has no quick way to do it.')
  }

  if (issues.length < 3) {
    if (!/(same day|free quote|book|call|contact|enquire|estimate)/i.test(firstScreen)) {
      issues.push('The first screen does not make the main action obvious enough for a visitor in a hurry.')
    }
    if (!/(hull|beverley|cottingham|yorkshire|east yorkshire|north yorkshire|scarborough|hornsea)/i.test(firstScreen)) {
      issues.push('Local positioning is not obvious early on, which weakens the “near me” relevance.')
    }
    if (!/(why choose|trusted|established|family|years|qualified|insured|reviews)/i.test(lower)) {
      issues.push('The trust story is not packaged clearly, so the business has to rely on visitors digging for confidence.')
    }
  }

  return [...new Set(issues)].slice(0, 5)
}

function extractButtons(html) {
  const labels = [
    ...matchAllUnique(html, /<button[^>]*>([\s\S]*?)<\/button>/gi),
    ...matchAllUnique(html, /<a[^>]+(?:class|role)=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi),
  ]
  return labels.map(stripHtml).filter(Boolean).slice(0, 20)
}

function uniquePush(list, value) {
  if (value && !list.includes(value)) list.push(value)
}

function normalizeIssue(issue) {
  return String(issue || '')
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/^i could not see a clear\s+/, 'missing ')
    .replace(/\s+/g, ' ')
    .replace(/[.“”"]/g, '')
    .trim()
}

function isVisualBusinessText(text) {
  return /\b(beauty|aesthetic|aesthetics|salon|fitness|restaurant|cafe|bar|hair|nail|photography|tattoo|venue|clinic)\b/i.test(text)
}

function isProfessionalServiceText(text) {
  return /\b(accountant|accountants|accountancy|bookkeeping|bookkeeper|solicitor|solicitors|law firm|mortgage|ifa|financial adviser|financial planner)\b/i.test(text)
}

function uniqueIssues(issues) {
  const seen = new Set()
  const out = []
  for (const issue of issues) {
    const key = normalizeIssue(issue)
    if (!key || seen.has(key)) continue
    if (key.includes('instagram link') && [...seen].some(existing => existing.includes('instagram link'))) continue
    if (key.includes('text heavy') && [...seen].some(existing => existing.includes('text heavy'))) continue
    seen.add(key)
    out.push(issue)
  }
  return out
}

function analyseBuckets({ html, text, links, buttons, headings, images, forms, description, businessType, reviewedUrls, emails, instagram }) {
  const lower = `${html} ${text}`.toLowerCase()
  const buckets = {
    services: [],
    ui: [],
    cta: [],
    ux: [],
    seo: [],
    painPoints: [],
  }
  const title = extractTitle(html)
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || ''
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(match => stripHtml(match[1])).filter(Boolean)
  const hasSchema = /application\/ld\+json|schema\.org/i.test(html)
  const homeHost = reviewedUrls[0] ? new URL(reviewedUrls[0]).host : ''
  const serviceIndexPaths = new Set(['/services', '/services/', '/what-we-do', '/what-we-do/', '/practice-areas', '/practice-areas/'])
  const allKnownUrls = [...links, ...reviewedUrls]
  const serviceIndexLinks = allKnownUrls.filter(link => {
    const parsed = new URL(link)
    return (!homeHost || parsed.host === homeHost) && serviceIndexPaths.has(parsed.pathname.toLowerCase())
  })
  const isIndividualServicePage = link => {
    const parsed = new URL(link)
    const pathname = parsed.pathname.toLowerCase().replace(/\/+$/, '')
    if (homeHost && parsed.host !== homeHost) return false
    if (/\/(feed|rss|atom|xml)$/i.test(pathname)) return false
    if (serviceIndexPaths.has(`${pathname}/`) || serviceIndexPaths.has(pathname)) return false
    if (/\/services\/[^/]+$|\/what-we-do\/[^/]+$|\/practice-areas?\/[^/]+$/i.test(pathname)) return true
    return /\/(bookkeeping|payroll|vat-returns|tax-returns|tax-planning|limited-company-accounts|sole-trader|management-accounts|conveyancing|probate|wills|family-law|commercial-law|roof-repairs|new-roof|boiler|plumbing|electrical|rewire|joinery|windows|mot|servicing)$/i.test(pathname)
  }
  const serviceLinks = links.filter(isIndividualServicePage)
  const reviewedServicePages = reviewedUrls.filter(isIndividualServicePage)
  const serviceHeadingCount = headings.filter(heading => /(service|repair|installation|maintenance|accounts|tax|payroll|bookkeeping|conveyancing|probate|wills|quote|domestic|commercial)/i.test(heading)).length

  if (serviceLinks.length === 0 && serviceIndexLinks.length > 0) {
    uniquePush(buckets.services, 'Services are all on one overview page — no individual service pages exist, so Google has nothing specific to rank for each service.')
  } else if (serviceLinks.length === 0) {
    uniquePush(buckets.services, 'No separate service pages found — visitors and Google only get a broad overview rather than a dedicated page for each offer.')
  } else if (reviewedServicePages.length < Math.min(2, serviceLinks.length)) {
    uniquePush(buckets.services, 'There are service links, but they are not easy to surface or review from the main journey, so the structure may be too hidden.')
  }
  if (serviceHeadingCount < 2 && /(electrician|roofing|plumbing|joinery|window|garage|accountancy|bookkeeping|solicitors|law firm)/i.test(businessType)) {
    uniquePush(buckets.services, 'Services are not broken down clearly enough in the headings, which makes the offer harder to scan.')
  }
  if (!/(area|hull|east yorkshire|nearby|local|cover|serve)/i.test(lower)) {
    uniquePush(buckets.services, 'Local service-area wording is weak, which is a missed local SEO and trust opportunity.')
  }

  if (headings.length === 0) uniquePush(buckets.ui, 'The page has very little heading structure, so the visual hierarchy is weak.')
  if (/welcome|home/i.test(headings[0] || '') && !/(quote|book|service|specialist|trusted|local)/i.test(headings[0] || '')) {
    uniquePush(buckets.ui, `The main heading "${headings[0]}" is vague and does not immediately sell the service.`)
  }
  if (images.count >= 5 && images.missingAlt / images.count > 0.55) {
    uniquePush(buckets.ui, 'The image setup looks unfinished in places, with lots of missing alt text, so the build feels less polished.')
  }
  if (images.stockLike > 0) uniquePush(buckets.ui, 'Some imagery looks stock-sourced rather than showing real work, team or premises.')
  if (/wixstatic|wix\.com|editorx|ueniweb|ueni\.com|business\.yell\.com|hibu/i.test(lower)) {
    uniquePush(buckets.ui, 'The site has template/platform traces, so it can feel rented rather than professionally owned.')
  }
  if (text.length > 9000) uniquePush(buckets.ui, 'The site is text heavy, so important proof and services may be hard to scan on mobile.')

  const joinedButtons = buttons.join(' ').toLowerCase()
  const ctaSurface = `${joinedButtons} ${links.join(' ')} ${text.slice(0, 2500)}`.toLowerCase()
  if (!/(book|quote|call|enquir|contact|consult|valuation|appointment|estimate)/i.test(ctaSurface)) {
    uniquePush(buckets.cta, 'There is no obvious high-confidence call to action near the top of the site.')
  }
  if (buttons.length > 0 && buttons.every(button => /^(read more|learn more|more|submit|send|click here)$/i.test(button.trim()))) {
    uniquePush(buckets.cta, `The visible buttons are mostly generic labels like "${buttons[0]}", so the next step is not persuasive.`)
  }
  if (!/(free quote|request a quote|book|call now|start|speak|appointment|consultation)/i.test(text.slice(0, 4000))) {
    uniquePush(buckets.cta, 'The early page copy does not push a clear action like booking, calling or requesting a quote.')
  }

  if (forms.count > 0 && forms.hasErrorText) uniquePush(buckets.ux, 'The contact form area appears to show error/failure wording, which is a direct enquiry risk.')
  if (!emails.length && !/(contact form|send message|get in touch|call us)/i.test(lower)) {
    uniquePush(buckets.ux, 'The contact route is not obvious enough, which adds friction for ready-to-buy visitors.')
  }
  if (!description || description.length < 55) uniquePush(buckets.ux, 'The meta description is missing or thin, which is an easy local SEO gap.')
  if (!/(review|testimonial|google|rated|stars|trustpilot)/i.test(lower)) {
    uniquePush(buckets.ux, 'Reviews or testimonials are not surfaced strongly on the reviewed pages.')
  }
  if (!instagram && isVisualBusinessText(lower) && !isProfessionalServiceText(lower)) {
    uniquePush(buckets.ux, 'I could not see a clear Instagram link, which matters for visual/local businesses.')
  }

  if (!title || title.length < 18) uniquePush(buckets.seo, 'The page title is thin, so it may not sell the business clearly in Google results.')
  if (!description || description.length < 55) uniquePush(buckets.seo, 'The meta description is missing or thin, so the Google snippet is probably not doing much selling.')
  if (h1s.length === 0) uniquePush(buckets.seo, 'There is no clear H1 heading, which weakens the page structure for search and scanning.')
  if (h1s.length > 1) uniquePush(buckets.seo, 'There are multiple H1 headings, which can make the page structure messy.')
  if (!canonical) uniquePush(buckets.seo, 'I could not see a canonical URL, which is a small but useful SEO hygiene gap.')
  if (!hasSchema && /(accountancy|bookkeeping|solicitors|law firm|electrician|roofing|plumbing|joinery|window|garage|beauty|aesthetics)/i.test(businessType)) {
    uniquePush(buckets.seo, 'I could not see obvious structured data, so Google may be getting fewer local business signals than it could.')
  }
  if (serviceLinks.length < 2 && /(accountancy|bookkeeping|solicitors|law firm|electrician|roofing|plumbing|joinery|window|garage)/i.test(businessType)) {
    uniquePush(buckets.seo, 'There are not enough dedicated service pages to target specific local searches.')
  }

  if (!/(review|testimonial|google|rated|stars|trustpilot)/i.test(lower)) {
    uniquePush(buckets.painPoints, 'A cautious buyer has little visible social proof before making contact.')
  }
  if (!/(book|quote|call|enquir|contact|consult|appointment|estimate)/i.test(`${buttons.join(' ')} ${text.slice(0, 2500)}`)) {
    uniquePush(buckets.painPoints, 'A ready-to-buy visitor may not immediately know what to do next.')
  }
  if (serviceLinks.length === 0) {
    uniquePush(buckets.painPoints, 'Someone comparing providers may not quickly find the exact service they need.')
  }
  if (/(accountancy|bookkeeping|solicitors|law firm|mortgage)/i.test(businessType) && !/(team|qualified|regulated|accredit|fixed fee|consultation|years)/i.test(lower)) {
    uniquePush(buckets.painPoints, 'The site does not quickly answer the trust question: why should I trust these people with something important?')
  }
  if (/(electrician|roofing|plumbing|joinery|window|garage)/i.test(businessType) && !/(gallery|our work|projects|before|after|qualified|insured|guarantee|niceic|napit|gas safe)/i.test(lower)) {
    uniquePush(buckets.painPoints, 'The site does not show enough work/proof for someone comparing local trades.')
  }

  return {
    buckets,
    servicePages: [...new Set(serviceLinks)].slice(0, 8),
    reviewedServicePages: [...new Set(reviewedServicePages)].slice(0, 8),
  }
}

function buildNotes({ businessType, leadRating, spamCategory, buckets, finalIssues, pagespeed, website, auditedAt }) {
  const lines = []
  // #17 — date + URL in header
  const dateStr = auditedAt || new Date().toISOString().slice(0, 10)
  lines.push(`**${leadRating.label} lead · ${leadRating.score}/100 · ${businessType}**`)
  if (website) lines.push(website)
  lines.push(`Audited ${dateStr} · ${leadRating.approach}`)
  if (spamCategory) lines.push(`⚠️ Site compromised — ${spamCategory} detected`)

  if (pagespeed?.scores) {
    const s = pagespeed.scores
    lines.push(`PageSpeed (mobile) — Perf: ${s.performance} · A11y: ${s.accessibility} · SEO: ${s.seo} · BP: ${s.bestPractices}`)
  }

  lines.push('')

  // #18 — deduplicate by normalised text (strip trailing punctuation, lowercase) so near-identical items don't repeat
  const normalise = str => str.replace(/[.!?]+$/, '').toLowerCase().trim()
  const seen = new Set()
  const allItems = [...(finalIssues || []), ...Object.values(buckets || {}).flat()]
  for (const item of allItems) {
    const key = normalise(item)
    if (!seen.has(key)) {
      lines.push(`- ${item}`)
      seen.add(key)
    }
  }

  return lines.join('\n').trim()
}

function makeEmail({ businessName, businessType, issues, personalDetail = '', spamCategory = '', spamKeyword = '' }) {
  // Deterministic variation based on businessName so the same business always gets the same draft
  const seed = businessName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const pick = (arr) => arr[seed % arr.length]

  const openers = [
    `I came across ${businessName} and checked out your site — a few things worth flagging:`,
    `I came across ${businessName} and had a look at your site — a few things stood out:`,
    `I spotted ${businessName} recently and had a look at your site — a couple of things worth mentioning:`,
    `I had a look at the ${businessName} site — a few quick things stood out:`,
  ]
  const firstLine = pick(openers)

  const issueMap = (issue) => {
    const heading = issue.match(/main heading\s+"([^"]+)"/i)?.[1]
    if (/main heading|vague|thin heading|service promise/i.test(issue)) {
      return heading
        ? `the homepage opens with "${heading}" — that could do more to tell someone why they should choose you`
        : 'the homepage could do more upfront to show why someone should choose you over a competitor'
    }
    if (/stock-sourced|stock/i.test(issue)) return pick([
      'a few of the images feel quite generic — real photos of your work tend to convert a lot better',
      'some of the imagery looks a bit stock-heavy, which makes it harder to build trust quickly',
    ])
    if (/text heavy|hard to scan/i.test(issue)) return 'there is a lot to read — the key services and contact route get a bit buried, especially on mobile'
    if (/page structure|heading structure|visual hierarchy/i.test(issue)) return pick([
      'the page structure makes it harder to scan than it needs to be',
      'the layout buries some of the important stuff — a bit of structure would make it much easier to scan',
    ])
    if (/services are all on one overview page|no individual service pages/i.test(issue)) return pick([
      'there is a services page, but everything sits together on it — a separate page for each service would help Google rank you for specific searches',
      'the services are covered in one place, which means Google has nothing more specific to rank — individual pages would open up a lot more search traffic',
    ])
    if (/no separate service pages|broad overview/i.test(issue)) return pick([
      'all the services sit on one page at the moment — Google can only rank you on that, so anyone searching for something specific probably won\'t find you',
      'there is no separate page for each service, which means Google has nothing specific to rank beyond the homepage',
    ])
    if (/call to action|next step|ready-to-buy|booking|requesting a quote/i.test(issue)) return pick([
      'it is not immediately obvious what to do next — someone ready to enquire has to hunt for it',
      'the next step is a bit buried — there is no strong prompt to book or call near the top',
    ])
    if (/reviews|testimonials|social proof|proof|trust question/i.test(issue)) return pick([
      'there is not much social proof on the site, which is often what tips someone over the line to get in touch',
      'reviews or recent work are not very visible — that is usually the thing that makes a cautious buyer commit',
    ])
    if (/gmail|hotmail|outlook|public email|domain email/i.test(issue)) return 'the public email is a Gmail/Hotmail address — a branded one tends to make the business feel more established'
    if (/wix|ueni|yell|template|platform|rented/i.test(issue)) return pick([
      'the site has a bit of a template feel — it works, but it does not stand out much against competitors',
      'it looks like it was built on a website builder, which is fine, but a proper site tends to perform better in search',
    ])
    // #1 — service headings raw text → natural
    if (/services are not broken down clearly enough in the headings/i.test(issue)) return 'the services are listed but not broken down clearly enough — a visitor scanning quickly would struggle to see the full offer'
    // #2 — local service-area wording raw text → natural
    if (/local service-area wording is weak/i.test(issue)) return 'the site does not make it obvious which area you cover — that matters for anyone searching locally'
    // #3 — comparing providers raw text → natural
    if (/someone comparing providers/i.test(issue)) return pick([
      'someone shopping around would find it hard to quickly see which specific service fits their situation',
      'there is not enough to go on for someone comparing a few options before deciding who to call',
    ])
    // #4 — ready to buy CTA raw text → natural
    if (/ready-to-buy visitor|immediately know what to do next/i.test(issue)) return pick([
      'someone ready to get in touch would have to hunt around a bit to find out how',
      'there is no obvious prompt to call or book — someone ready to act can easily drift off',
    ])
    // #5 — social proof / cautious buyer raw text → natural
    if (/cautious buyer has little visible social proof/i.test(issue)) return pick([
      'there are no visible reviews, which is often the thing that tips a cautious buyer over the line',
      'the site does not surface any customer feedback — that is usually what turns a browser into an enquiry',
    ])
    // #6 — trust question (professional services) raw text → natural
    if (/trust question|why should I trust/i.test(issue)) return 'for a professional service, visitors want to quickly see qualifications, experience or a known name — that reassurance is not very visible'
    // #7 — trades proof raw text → natural
    if (/not show enough work\/proof for someone comparing local trades/i.test(issue)) return pick([
      'there is not much evidence of past work — photos, accreditations or guarantees make a big difference for a local trade',
      'someone comparing local tradespeople will want to see proof of work before they call, and it is not easy to find here',
    ])
    // #8 — contact route friction raw text → natural
    if (/contact route is not obvious enough|adds friction/i.test(issue)) return 'the contact details are not easy to spot — someone on mobile who wants to call quickly would have to search for it'
    // #9 — no H1 heading
    if (/no clear h1|there is no clear h1/i.test(issue)) return 'the page is missing a clear main heading, which weakens how Google reads what the page is about'
    // #10 — page title thin
    if (/page title is thin/i.test(issue)) return 'the page title in Google results is quite bare — it is the first thing people see before clicking'
    // #11 — generic button labels
    if (/visible buttons are mostly generic|generic labels/i.test(issue)) return pick([
      `the main call to action just says "${issue.match(/"([^"]+)"/)?.[1] || 'click here'}" — something more specific would convert better`,
      'the buttons use very generic labels, which makes it easy for someone to miss what to do next',
    ])
    // #12 — early copy no clear action
    if (/early page copy does not push a clear action/i.test(issue)) return 'the opening section of the page does not push anyone to book or call — it describes the business without asking for anything'
    // #13 — contact form error
    if (/contact form area appears to show error/i.test(issue)) return 'the contact form looks like it may have an error on it — anyone trying to get in touch would hit a wall'
    // existing mappings
    if (/contact route|friction/i.test(issue)) return 'the contact route is a bit tricky to find — that can cost enquiries from people who are ready to buy'
    if (/local positioning|near me|service-area/i.test(issue)) return 'the local area is not mentioned prominently, which weakens how relevant it feels for "near me" searches'
    if (/shallow|limited proof|light on content/i.test(issue)) return 'the site is quite sparse — visitors do not get much to go on before deciding whether to get in touch'
    if (/dated|maintained/i.test(issue)) return 'a few parts of the site feel like they may not have been touched in a while'
    if (/http|less trustworthy/i.test(issue)) return 'the site is not running on HTTPS, which browsers now flag — that can put people off before they even read it'
    // #14 — no phone number
    if (/no phone number|phone not visible/i.test(issue)) return 'there is no phone number visible — anyone who prefers to call rather than fill in a form has no quick way to do it'
    if (/multiple h1|h1 heading/i.test(issue)) return 'the page has a few main headings competing with each other, which makes it harder for Google to work out what the page is about'
    if (/structured data|schema/i.test(issue)) return 'Google is missing some of the signals it uses for local search — things like business address, opening hours and services in a format it can read directly'
    if (/meta description/i.test(issue)) return 'the snippet that shows up in Google results is either missing or too thin to do much selling'
    if (/alt text/i.test(issue)) return 'some of the images have no description, which can make the page look unfinished to Google'
    if (/injected spam|compromised|spam content/i.test(issue)) {
      // Change 4+7: be direct and name what was found where possible
      const categoryPhrases = {
        'pharmaceutical spam': 'there is something hidden in the site code that should not be there — an outbound link Google can see but visitors cannot, which can quietly damage search rankings',
        'gambling spam': 'there is something hidden in the site code that should not be there — an outbound link Google can see but visitors cannot, which can quietly damage search rankings',
        'payday loan spam': 'there is something hidden in the site code that should not be there — an outbound link Google can see but visitors cannot, which can quietly damage search rankings',
        'forex/crypto spam': 'there is something hidden in the site code that should not be there — an outbound link Google can see but visitors cannot, which can quietly damage search rankings',
        'adult content spam': 'there is something hidden in the site code that should not be there — content Google can see but visitors cannot, which can quietly damage search rankings',
        'replica/counterfeit spam': 'there is something hidden in the site code that should not be there — outbound links Google can see but visitors cannot, which can quietly damage search rankings',
        'follower spam': 'there is something hidden in the site code that should not be there — outbound links Google can see but visitors cannot, which can quietly damage search rankings',
      }
      return categoryPhrases[spamCategory] || 'there is something hidden in the site code that should not be there — it is the kind of thing that can quietly damage search rankings without the site owner knowing'
    }
    return issue.replace(/\.$/, '')
  }

  // Map all issues to natural language, deduplicate, drop low-value ones, take top 5
  const emailIssues = issues
    .map(issue => ({ issue, natural: issueMap(issue) }))
    .filter(item => !/canonical|instagram/i.test(item.issue))
    .filter(item => !(spamCategory && /alt text|meta description|screen reader|google snippet/i.test(item.issue)))
    .filter((item, index, list) => {
      const norm = s => s.toLowerCase().replace(/[.!?,]+$/, '').replace(/\s+/g, ' ').trim()
      return list.findIndex(other => norm(other.natural) === norm(item.natural)) === index
    })
    .slice(0, spamCategory ? 3 : 5)

  const bullets = emailIssues.map(({ natural }) => `- ${natural.charAt(0).toUpperCase() + natural.slice(1)}.`).join('\n')
    || '- The site could work harder to bring in enquiries.'

  const bridges = ['']

  // Pitch — "content written for you" always in. Email only if they're on a free address.
  const hasEmailIssue = issues.some(i => /gmail|hotmail|outlook|public email|domain email/i.test(i))
  const pitches = hasEmailIssue ? [
    `I build websites for small businesses — £250, live in 7 days, Yorkshire based. I write all the content for you. Hosting, a business email and basic SEO included.`,
    `I run Swift 7 — fixed-price web design for small businesses. £250, live within a week. I write all the copy, and hosting, a domain email and SEO basics are included.`,
    `I design websites for small businesses — £250, live in 7 days, Yorkshire based. Content written for you, plus hosting, a business email and basic SEO.`,
  ] : [
    `I build websites for small businesses — £250, live in 7 days, Yorkshire based. I write all the content for you. Hosting and basic SEO included.`,
    `I run Swift 7 — fixed-price web design for small businesses. £250, live within a week. I write all the copy, and hosting and SEO basics are included.`,
    `I design websites for small businesses — £250, live in 7 days, Yorkshire based. Content written for you, plus hosting and basic SEO.`,
  ]

  // Closer — varied
  const closers = [
    `Worth a quick chat?`,
    `Happy to chat it through if useful.`,
    `Let me know if it's worth a conversation.`,
    `No pressure — happy to chat if any of that's useful.`,
    `Let me know if it's worth a quick call.`,
  ]

  return `Hi,\n\n${firstLine}\n\n${bullets}\n\n${pick(pitches)}\n\n${pick(closers)}\n\nCallum\nwww.swift7.co.uk`
}

function makeMailto(email, businessName, message) {
  if (!email) return ''
  const subject = `Quick website thought for ${businessName}`
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}

function instagramMattersForLead(lead) {
  return isVisualBusinessText(`${lead.businessType || ''} ${lead.title || ''}`)
}

function removeLowValueIssues(lead, issues) {
  return issues.filter(issue => instagramMattersForLead(lead) || !/instagram/i.test(issue))
}

function extractJson(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) throw new Error('Empty model response')
  try { return JSON.parse(trimmed) } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Model did not return JSON')
  return JSON.parse(match[0])
}

function normalizeAiEmail(email) {
  let text = String(email || '')
    .replace(/\r\n/g, '\n')
    .replace(/[–—]/g, '-')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!text || text.length < 80) throw new Error('Model email was too short')
  if (!/^hi\b/i.test(text)) text = `Hi,\n\n${text}`

  const closeIndex = text.search(/worth a quick chat\?/i)
  if (closeIndex >= 0) {
    text = text.slice(0, closeIndex).trim()
  } else {
    text = text
      .replace(/(?:does that sound worth a chat\?|would it be worth a chat\?|worth a chat\?|open to a quick chat\?)\s*$/i, '')
      .trim()
  }

  text = text
    .replace(/\n*Callum\s*$/i, '')
    .replace(/\n*www\.swift7\.co\.uk\s*$/i, '')
    .trim()

  return `${text}\n\nWorth a quick chat?\n\nCallum\nwww.swift7.co.uk`
}

async function enhanceWithAI(lead) {
  const prompt = {
    businessName: lead.businessName,
    businessType: lead.businessType,
    website: lead.website,
    title: lead.title,
    description: lead.description,
    pageText: lead.pageText || '',
    pageHeadings: lead.pageHeadings || [],
    reviewedUrls: lead.reviewedUrls,
    servicePages: lead.servicePages,
    leadRating: lead.leadRating,
    issues: lead.issues,
    buckets: lead.buckets,
    emailFound: Boolean(lead.email),
    homepageInstagram: lead.homepageInstagram,
    seoFindings: lead.buckets?.seo || [],
    painPoints: lead.buckets?.painPoints || [],
  }

  const instructions = [
    'You are helping build a cold outreach tool for a web designer. Read the audit facts below and return a JSON object with exactly these keys:',
    '',
    'correctedBusinessName: If businessName looks like a generic category ("Accountants in Hull", "Plumbers Beverley") rather than an actual trading name, return the real name from pageText, the title tag, or the domain. Otherwise return empty string.',
    '',
    'personalDetail: Read pageText and pageHeadings and find ONE specific genuine detail a real person would notice — a memorable tagline, how long they have been established, a specific speciality, a certification, or something distinctive. Return it as a natural phrase (max 15 words) written so it can complete the sentence "Came across [Business] — ..." without sounding stiff. The phrase should stand on its own without needing "is a good line" tacked on. Examples: "that \'Big enough to cope, small enough to care.\' caught my eye" or "you\'ve been going since 1987, which shows" or "the focus on family law sets it apart". If nothing specific stands out, return empty string. Do not invent things.',
    '',
    '',
    'leadScore: number 0-100',
    'leadLabel: one of: Strong / Good / Maybe / Weak',
    'approach: one sentence on why this is or is not a good lead',
    '',
    'Return valid JSON only. Do not write an email.',
  ].join('\n')

  if (OLLAMA_URL) {
    try {
      const response = await fetch(`${OLLAMA_URL.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          format: 'json',
          prompt: `${instructions}\n\nAudit facts:\n${JSON.stringify(prompt, null, 2)}`,
        }),
        signal: AbortSignal.timeout(30000),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || `Ollama returned HTTP ${response.status}`)
      const parsed = extractJson(data.response)
      const enhanced = applyAiResult(lead, parsed, `ollama:${OLLAMA_MODEL}`)
      return enhanced
    } catch (error) {
      return { ...lead, aiEnhanced: false, aiError: error.message || 'Ollama enhancement failed' }
    }
  }
  return { ...lead, aiEnhanced: false }
}

function applyAiResult(lead, parsed, modelName) {
  // Use AI-corrected business name if it looks valid and different
  const correctedName = String(parsed.correctedBusinessName || '').trim()
  const businessName = correctedName && correctedName.length > 2 && correctedName !== lead.businessName
    ? correctedName
    : lead.businessName

  const personalDetail = String(parsed.personalDetail || '').trim()
  // Always use the full issues list for the email — makeEmail handles filtering and dedup.
  // Ollama's selectedIssues is used only for the notes/rating context.
  const outreachEmail = makeEmail({ businessName, businessType: lead.businessType, issues: lead.issues, personalDetail, spamCategory: lead.spamCategory, spamKeyword: lead.spamKeyword })
  const aiEmailSource = personalDetail ? 'template with AI personalisation' : 'template'
  const usableIssues = lead.issues

  const leadScore = Number.isFinite(Number(parsed.leadScore)) ? Math.max(0, Math.min(100, Number(parsed.leadScore))) : lead.leadRating.score
  const leadLabel = String(parsed.leadLabel || lead.leadRating.label)
  const approach = String(parsed.approach || lead.leadRating.approach)
  const leadRating = { score: leadScore, label: leadLabel, approach }

  return {
    ...lead,
    businessName,
    aiEnhanced: true,
    aiModel: modelName,
    aiEmailSource,
    personalDetail,
    outreachEmail,
    issues: usableIssues,
    leadRating,
    notes: buildNotes({ businessType: lead.businessType, leadRating, spamCategory: lead.spamCategory, buckets: lead.buckets, finalIssues: usableIssues, pagespeed: lead.pagespeed, website: lead.website, auditedAt: lead.auditedAt }),
  }
}

async function fetchPage(url) {
  const resp = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; Swift7OutreachAuditor/1.0; +https://swift7.co.uk)',
      accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  })
  const contentType = resp.headers.get('content-type') || ''
  if (!resp.ok) throw new Error(`Website returned HTTP ${resp.status}`)
  if (!contentType.includes('text/html')) throw new Error(`Website did not return HTML (${contentType || 'unknown content type'})`)
  const html = await resp.text()
  return { finalUrl: resp.url, html, status: resp.status }
}

function chooseReviewLinks(links, finalUrl) {
  const host = new URL(finalUrl).host
  const scored = links
    .filter(link => {
      const parsed = new URL(link)
      return parsed.host === host && !/\.(pdf|jpg|jpeg|png|webp|gif|zip|docx?)$/i.test(parsed.pathname)
    })
    .map(link => {
      const path = new URL(link).pathname.toLowerCase()
      let score = 0
      if (/contact|get-in-touch|enquiry|quote|book/.test(path)) score += 100
      if (/about|team|who-we-are/.test(path)) score += 80
      if (/service|what-we-do|practice-area|legal|account|roof|electric|plumb|join/.test(path)) score += 70
      if (/gallery|portfolio|case-stud|our-work|projects/.test(path)) score += 65
      if (/review|testimonial/.test(path)) score += 60
      if (/price|fee|cost/.test(path)) score += 45
      if (/blog|news|privacy|terms|cookie|sitemap/.test(path)) score -= 80
      return { link, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
  return [...new Set(scored.map(item => item.link))].slice(0, 5)
}

function rateLead({ issues, buckets, servicePages, reviewedUrls, emails, website }) {
  const text = issues.join(' ').toLowerCase()
  const seoText = (buckets?.seo || []).join(' ').toLowerCase()
  const painText = (buckets?.painPoints || []).join(' ').toLowerCase()
  let score = 45
  const add = (condition, points) => { if (condition) score += points }
  const sub = (condition, points) => { if (condition) score -= points }

  add(/gmail|hotmail|outlook|live|yahoo|icloud/.test(text), 12)
  add(/wix|ueni|yell|template|platform|rented|directory-builder/.test(text), 14)
  add(/no obvious|call to action|generic labels|early page copy/.test(text), 14)
  add(/separate service pages|services are not broken|service-area/.test(text), 12)
  add(/reviews|testimonials|proof|qualifications|project examples|credentials/.test(text), 12)
  add(/service pages|local searches|structured data|google snippet/.test(seoText), 10)
  add(/ready-to-buy|comparing|trust question|social proof/.test(painText), 12)
  add(/http rather than https|placeholder|unfinished|error\/failure|dated year/.test(text), 16)
  add(/injected spam|compromised|spam content/.test(text), 20)
  add(servicePages.length === 0, 8)
  add(reviewedUrls.length <= 2, 5)

  sub(emails.length === 0, 8)
  sub(servicePages.length >= 4, 8)
  sub(!/no obvious|call to action|generic labels|early page copy/.test(text), 8)
  sub(!/template|wix|ueni|yell|gmail|hotmail|outlook|proof|reviews|separate service|dated|unfinished|placeholder|http/.test(text), 18)

  score = Math.max(0, Math.min(100, score))
  let label = 'Weak'
  if (score >= 75) label = 'Strong'
  else if (score >= 58) label = 'Good'
  else if (score >= 42) label = 'Maybe'
  const approach = score >= 58
    ? 'Worth approaching'
    : score >= 42
      ? 'Approach only if the business is a perfect fit'
      : 'Probably skip'

  return { score, label, approach }
}

async function runPageSpeed(url) {
  if (!GOOGLE_PAGESPEED_KEY) return null
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=PERFORMANCE&category=ACCESSIBILITY&category=SEO&category=BEST_PRACTICES&key=${GOOGLE_PAGESPEED_KEY}`
    const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(20000) })
    if (!resp.ok) return null
    const data = await resp.json()
    const cats = data.lighthouseResult?.categories || {}
    const scores = {
      performance: Math.round((cats.performance?.score ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
      seo: Math.round((cats.seo?.score ?? 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    }
    // Pull out the top failed audits as plain issues
    const audits = data.lighthouseResult?.audits || {}
    const failures = Object.values(audits)
      .filter(a => a.score !== null && a.score < 0.9 && a.details?.type !== 'opportunity' && a.description)
      .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
      .slice(0, 5)
      .map(a => a.title)

    return { scores, failures }
  } catch {
    return null
  }
}

async function auditWebsite(inputUrl) {
  const startedAt = Date.now()
  const url = normalizeUrl(inputUrl)
  const main = await fetchPage(url)
  const links = attrLinks(main.html, main.finalUrl)
  const reviewLinks = chooseReviewLinks(links, main.finalUrl)

  let combinedHtml = main.html
  let reviewedUrls = [main.finalUrl]
  for (const link of reviewLinks) {
    if (reviewedUrls.includes(link)) continue
    try {
      const page = await fetchPage(link)
      combinedHtml += `\n${page.html}`
      reviewedUrls.push(page.finalUrl)
    } catch {
      // Keep reviewing the other pages.
    }
  }

  const text = stripHtml(combinedHtml)
  const title = extractTitle(main.html)
  const description = extractMetaDescription(main.html)
  const host = new URL(main.finalUrl).host
  const businessName = extractBusinessName(title, host)
  const allLinks = attrLinks(combinedHtml, main.finalUrl)
  const emails = extractEmails(combinedHtml, text)
  const phones = extractPhones(text)
  const instagram = extractInstagram(allLinks)
  const homepageInstagram = extractInstagramFromHtml(main.html, main.finalUrl)
  const buttons = extractButtons(combinedHtml)
  const headings = extractHeadings(combinedHtml)
  const images = imageStats(combinedHtml)
  const forms = formStats(combinedHtml)
  const businessType = classifyBusiness(text, title, description)
  const analysis = analyseBuckets({ html: combinedHtml, text, links: allLinks, buttons, headings, images, forms, description, businessType, reviewedUrls, emails, instagram })
  const issues = findIssues({ url: main.finalUrl, html: combinedHtml, text, emails, instagram, title, description, buttons, links: allLinks, headings, images, forms, businessType, reviewedUrls })
  const { issues: spamIssues, spamCategory, spamKeyword } = detectSpamInjection(combinedHtml, text, businessType)
  const bucketIssues = Object.values(analysis.buckets).flat()
  // Spam goes first — it's the most urgent thing to flag
  const finalIssues = uniqueIssues([...spamIssues, ...bucketIssues, ...issues]).slice(0, 7)
  const leadRating = rateLead({ issues: finalIssues, buckets: analysis.buckets, servicePages: analysis.servicePages, reviewedUrls, emails, website: main.finalUrl })
  // Run PageSpeed in parallel with the minimum wait
  const [pagespeed] = await Promise.all([
    runPageSpeed(main.finalUrl),
    (async () => {
      const elapsed = Date.now() - startedAt
      if (elapsed < REVIEW_MIN_MS) await sleep(REVIEW_MIN_MS - elapsed)
    })(),
  ])

  // #16 — low PageSpeed mobile performance → add as an issue
  const pagespeedIssues = []
  if (pagespeed?.scores?.performance < 45) {
    pagespeedIssues.push('The site loads slowly on mobile — most local searches happen on phones, and a slow site loses visitors before they even read it.')
  }
  const allIssues = uniqueIssues([...pagespeedIssues, ...finalIssues])

  const email = makeEmail({ businessName, businessType, issues: allIssues, spamCategory, spamKeyword })
  const verifiedEmail = emails[0] || ''

  const lead = {
    businessName,
    businessType,
    website: main.finalUrl,
    reviewedUrls,
    title,
    description,
    // First 2000 chars of visible homepage text — passed to Ollama so it can read the actual site
    pageText: stripHtml(main.html).slice(0, 2000),
    pageHeadings: headings.slice(0, 6),
    email: verifiedEmail,
    emails,
    phone: phones[0] || '',
    phones,
    instagram,
    homepageInstagram,
    leadRating,
    headings: headings.slice(0, 8),
    buttons,
    servicePages: analysis.servicePages,
    reviewedServicePages: analysis.reviewedServicePages,
    buckets: analysis.buckets,
    issues: allIssues,
    spamCategory,
    spamKeyword,
    pagespeed,
    auditedAt: new Date().toISOString().slice(0, 10),
    outreachEmail: email,
    mailto: makeMailto(verifiedEmail, businessName, email),
    notes: buildNotes({ businessType, leadRating, spamCategory, buckets: analysis.buckets, finalIssues: allIssues, pagespeed, website: main.finalUrl, auditedAt: new Date().toISOString().slice(0, 10) }),
  }
  const enhanced = await enhanceWithAI(lead)
  return {
    ...enhanced,
    mailto: makeMailto(verifiedEmail, businessName, enhanced.outreachEmail),
  }
}

function notionRichText(text) {
  return [{ type: 'text', text: { content: String(text || '').slice(0, 1900) } }]
}

function pageBlocks(lead) {
  const audit = (lead.issues || []).map(issue => `- ${issue}`).join('\n') || '- Manual review needed.'
  const contact = lead.email
    ? `## Click to send\n[Open email](${lead.mailto})`
    : `## Contact Method\n${lead.instagram ? `Instagram: ${lead.instagram}` : lead.phone ? `Phone: ${lead.phone}` : 'No verified email found. Use the website contact form.'}`
  const body = `## Swift 7 Sales Audit\n${audit}\n\n## Snappy Outreach\n${lead.outreachEmail}\n\n${contact}`

  return body.split('\n\n').map(chunk => {
    const heading = chunk.match(/^##\s+(.+)$/m)
    if (heading && chunk.trim() === `## ${heading[1]}`) {
      return { object: 'block', type: 'heading_2', heading_2: { rich_text: notionRichText(heading[1]) } }
    }
    if (chunk.startsWith('## ')) {
      const [first, ...rest] = chunk.split('\n')
      return [
        { object: 'block', type: 'heading_2', heading_2: { rich_text: notionRichText(first.replace(/^##\s+/, '')) } },
        { object: 'block', type: 'paragraph', paragraph: { rich_text: notionRichText(rest.join('\n')) } },
      ]
    }
    return { object: 'block', type: 'paragraph', paragraph: { rich_text: notionRichText(chunk) } }
  }).flat()
}

async function createNotionLead(lead) {
  if (!NOTION_TOKEN) throw new Error('NOTION_TOKEN is missing. Add it to your environment before saving to Notion.')
  const properties = {
    Name: { title: [{ text: { content: lead.businessName || 'Untitled lead' } }] },
    Status: { status: { name: 'Drafting message' } },
    Website: { url: lead.website || null },
    'Location / TZ': { rich_text: notionRichText(lead.location || 'Hull / Yorkshire') },
    Notes: { rich_text: notionRichText(lead.notes || '') },
  }
  if (lead.email) properties.Email = { email: lead.email }

  const resp = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${NOTION_TOKEN}`,
      'content-type': 'application/json',
      'notion-version': NOTION_VERSION,
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
      children: pageBlocks(lead),
    }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data.message || `Notion returned HTTP ${resp.status}`)
  return { id: data.id, url: data.url }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    if (req.method === 'GET' && url.pathname === '/') {
      const html = await readFile(path.join(__dirname, 'index.html'), 'utf8')
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      json(res, 200, {
        ok: true,
        notionConfigured: Boolean(NOTION_TOKEN),
        databaseId: NOTION_DATABASE_ID,
        ollamaConfigured: Boolean(OLLAMA_URL),
        ollamaUrl: OLLAMA_URL,
        ollamaModel: OLLAMA_MODEL,
      })
      return
    }
    if (req.method === 'POST' && url.pathname === '/api/audit') {
      const body = await readBody(req)
      const audit = await auditWebsite(body.url)
      json(res, 200, audit)
      return
    }
    if (req.method === 'POST' && url.pathname === '/api/notion') {
      const lead = await readBody(req)
      const result = await createNotionLead(lead)
      json(res, 200, result)
      return
    }
    json(res, 404, { error: 'Not found' })
  } catch (error) {
    json(res, 400, { error: error.message || 'Something went wrong' })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Swift 7 outreach auditor running at http://${HOST}:${PORT}`)
  console.log(`Local AI writer: ${OLLAMA_URL ? `available if Ollama is running (${OLLAMA_MODEL})` : 'disabled'}`)
  console.log(`Notion saving: ${NOTION_TOKEN ? 'enabled' : 'disabled until NOTION_TOKEN is set'}`)
})
