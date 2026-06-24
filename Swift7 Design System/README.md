# Swift7 — Design System

> Affordable web design for UK small businesses. **£500 all-in, live in 7 days.**

This is the brand & UI design system for **Swift7**, a one-person web-design studio
based in Hull, East Yorkshire, run by founder **Callum MacInnes**. Swift7 builds
professional, mobile-first websites for tradespeople and local service businesses
across Yorkshire and the wider UK, for a fixed price of £500, delivered within 7 days —
content writing, on-page SEO, Google Business Profile setup, domain, hosting and SSL
all included.

This folder gives a design agent everything needed to produce on-brand Swift7 work:
brand voice, colour & type tokens, logos & imagery, an iconography guide, and a
high-fidelity UI kit recreating the marketing site.

---

## The company at a glance

| | |
|---|---|
| **Name** | Swift7 |
| **What** | Done-for-you web design for UK small businesses & trades |
| **Offer** | The Swift7 Launch — £500, live in 7 days, up to 10 pages, all-in |
| **Tiers** | Launch (£500 static) · WordPress (£500) · **Swift7 Plus** (growth / monthly) |
| **Founder** | Callum MacInnes (Web Designer & Founder) |
| **Base** | Hull, East Yorkshire — serves the whole UK |
| **Contact** | hello@swift7.co.uk · 07380 218301 · WhatsApp wa.me/447380218301 |
| **Site** | https://swift7.co.uk |
| **Renewal** | £70/yr domain + hosting after year one |
| **Payment** | 50% upfront, 50% on completion |

### Products / surfaces represented in the codebase
1. **Swift7 marketing website** *(the brand — the focus of this system).* A large,
   SEO-driven static HTML site: homepage, What's Included, How It Works, Pricing,
   FAQ, Portfolio, About, Swift7 Plus, plus ~60 programmatic location pages
   (`web-design-hull`, `…-leeds`, `…-sheffield` …), ~40 industry pages
   (`…-for-plumbers`, `…-for-electricians` …), case studies and a blog.
2. **StrangeSkies** *(`client/` — a portfolio / client project, NOT the Swift7 brand).*
   A React + Vite + Mapbox PWA for logging UAP/UFO sightings on a map (dark
   purple/"void" theme, Inter, Tailwind, lucide-react). It is an example of the kind
   of app Swift7 builds for clients and has its **own, separate** visual identity —
   it is documented here only so the reader knows what it is. **Do not** treat its
   purple palette as a Swift7 brand colour.
3. **Outreach Auditor** *(`tools/outreach-auditor/` — internal lead tool, not public-facing).*

> ⚠️ When asked for "Swift7" work, use the forest-green + lime brand below. The
> StrangeSkies purple is a different brand entirely.

---

## Sources

All material was derived from the read-only codebase mounted at `swift7/`:

- **Marketing site** — root-level static HTML (`index.html`, `about.html`,
  `pricing.html`, `how-it-works.html`, `whats-included.html`, `swift7-plus.html`,
  `faq.html`, `portfolio.html`, `start.html`, location/industry/case-study/blog pages).
  All brand CSS lives inline in these files (no shared stylesheet). Live at
  https://swift7.co.uk.
- **`swift7/llms.txt`** — machine-readable site summary & sitemap.
- **`client/`** — the StrangeSkies React PWA (separate brand; see above).
- **Logos & imagery** — `logo.png`, `logo-green.png`, `favicon-*.png`, founder photo
  (`media_1774190080_32a0.*`), and client device-mockup screenshots.

> The reader of this README may not have access to the original codebase — everything
> needed has been copied into this project (see the **Index** at the bottom).

---

## CONTENT FUNDAMENTALS — how Swift7 writes

The voice is **a confident, plain-spoken sole trader talking to another sole trader.**
No agency jargon, no fluff. It sells on speed, price-certainty and outcomes (leads,
Google ranking), and it removes effort from the customer ("we write everything for you").

**Voice & person**
- First person singular on personal/about pages — the founder speaks directly:
  *"Hi, I'm Callum. I build websites that actually work."* *"The problem I kept seeing…"*
- First person plural ("we") in process/offer copy: *"Once we have your details, we start
  immediately."* Both are fine; the brand is one person, so "I" feels authentic and "we"
  feels like a service.
- Addresses the reader as **"you"** throughout. *"You own your website outright."*
  *"You review a preview before launch."*

**Tone & casing**
- **Punchy, short, declarative.** Headlines are often two short sentences:
  *"Everything included. Nothing extra."* · *"Three tiers. One for every business."* ·
  *"Live in 7 days. Here's exactly how."* · *"Stop putting it off."*
- Sentence case for headlines and body. **UPPERCASE only** for small eyebrow/section
  labels and badges (e.g. `THE PROCESS`, `WHAT'S INCLUDED`), tracked out ~0.08em.
- **British English** — *optimise, colour, organise, enquiries, tradespeople.*
- Money is concrete and repeated: **£500**, **7 days**, **£70/yr**, **50% upfront**.
  The "7" is a brand motif (the name, the favicon, the 7-day promise).

**What it does / doesn't do**
- **No emoji** anywhere in marketing copy. Emphasis comes from a lime `→` arrow,
  a `✓` tick, or weight — never an emoji.
- Avoids hype words; prefers proof: real review quotes ("Callum had it done in 6"),
  fixed numbers, named clients. Trust signals (5★ Google, "guaranteed", "you own it").
- Light, dry confidence over salesy excitement: *"Thought the 7 days thing was a
  gimmick. Callum had it done in 6."*

**Example snippets to match**
- Eyebrow → Headline → sub: `THE PROCESS` / "Live in 7 days. Here's exactly how." / one
  calm sentence of detail.
- CTA labels: **"Get a free audit →"**, **"See What's Included"**, **"Book a Professional
  Clean"**, **"Notify me at launch"**. Verb-first, specific, arrow optional.
- Reassurance lines under forms/prices: *"No hidden fees. No monthly subscriptions.
  No watered-down template."*

---

## VISUAL FOUNDATIONS — how Swift7 looks

**Overall impression.** A **dark, premium, high-contrast** site: deep forest-green
canvases lit by a single electric **lime** accent. Feels modern and decisive, not
corporate-blue or startup-purple. There is **no light theme** — everything sits on green.

**Colour**
- One accent: **lime `#A8C94A`** (the "7", every CTA, section labels, icons, big numerals,
  the 3px top-border on key cards). Brightens to `#BBD35A` on hover.
- A four-step forest-green surface ramp: `#0F2219` (darkest — nav, footer, hero pricing
  card, CTA band) → `#1B3528` (page bg) → `#234432` (solid dark buttons) →
  `#2A5040` (raised panels / trust bar). Sections alternate between these greens for rhythm.
- Text is warm off-white `#F0F0EC`, muted sage `#C8DACC`, or `rgba(240,240,236,.88)`.
- WhatsApp green `#25D366` appears only on WhatsApp buttons/FAB. A green status dot
  (`#4ADE80`) pulses on live/"spots left" indicators.
- Borders are **white at low alpha** (`rgba(255,255,255,.10–.15)`) — never solid lines.

**Type** — Poppins only (see `colors_and_type.css`). Display headlines are **900 weight**
with aggressive negative tracking (−2px to −5px) and tight line-height (~0.95–1.1). Body is
400/500. Small eyebrow labels are 700, 11px, uppercase, tracked +0.08em, in lime.

**Backgrounds & texture** — **flat colour blocks**, no photographic hero backgrounds, no
noise/grain. Two gradient uses only: (1) edge **fade masks** on the auto-scrolling tickers
& image strip (`linear-gradient` to the section colour), and (2) a soft **lime radial wash**
behind the final closing CTA. No repeating patterns.

**Imagery** — client work shown as **laptop/phone device mockups** floating on coloured
or wood backdrops (warm, real, slightly editorial). The founder photo is natural and
candid. Images live in rounded tiles (`8px`) with a faint white border, often in
**auto-scrolling horizontal strips** with edge fades. Imagery is warm, never b&w.

**Motion** — calm and decisive, one easing everywhere: `cubic-bezier(0.22,1,0.36,1)`.
- Scroll reveals: `fade-in-up` / `-left` / `-right` / `scale-in` over ~0.65s, staggered
  with `data-delay` steps of ~0.08s. Gated to run once on enter.
- Looping marquees: feature **ticker** and **image strip** translate linearly (`40s` / `30s`),
  pausing on hover; flanked by gradient fade masks.
- Small life: a 2.5s **pulse** on eyebrow dots, a 2s urgency pulse on the "spots left" dot,
  a blinking text cursor in the hero search demo. **No bounce, no spring, no parallax.**
- Respect `prefers-reduced-motion`.

**Hover states** — buttons drop to **opacity 0.85**; the lime button can brighten to
`#BBD35A`. Cards **lift** `translateY(-3px)` and gain a soft dark shadow; portfolio images
zoom `scale(1.04)` inside their tile. Links shift colour to lime and nudge `padding-left:6px`.

**Press / active** — subtle: `active:scale-95` on app-style buttons (carried over from the
PWA); on the marketing site, press is mostly the opacity drop. No colour inversion.

**Borders, cards & radius** — **sharp by default**: `4px` radius on buttons, inputs, cards,
hero panels. `8px` on image tiles / grids / badges, `14px` on the big feature table, `100px`
pills (search demo, stat strips, review chips). Cards = a darker-green fill + a 1px low-alpha
white border; **key/recommended cards add a 3px lime top-border** (the signature "this one"
treatment). App icon / favicon uses a ~22% rounded square.

**Shadows & elevation** — soft, dark, diffuse: `0 2px 12px` (resting) → `0 8px 32px`
(hover lift) → `0 24px 80px rgba(0,0,0,.45)` (sticky pricing box). **No coloured glows**
except the WhatsApp FAB's green shadow and the one lime CTA wash.

**Transparency & blur** — used sparingly: the modal overlay is `rgba(12,12,12,.7)` +
`backdrop-filter: blur(4px)`; tinted lime fills (`rgba(168,201,74,.10)`) make chips and
"us" comparison columns. The site does **not** lean on glassmorphism (that's StrangeSkies'
look, not Swift7's).

**Layout rules** — `1120px` max container, `40px` gutters. Sticky nav (`#0F2219`, 60px tall)
that gains a shadow on scroll. A sticky WhatsApp FAB bottom-right; a mobile sticky-price CTA
bar; a back-to-top button. Generous section padding (`96px` vertical). Comparison tables,
"them vs us" two-column grids, 3-up portfolio/testimonial/offer grids, and 4-step process
rows with big lime numerals and `→` connectors between steps.

---

## ICONOGRAPHY

Swift7's icon language is **thin-stroke line icons**: `viewBox="0 0 24 24"`, `fill="none"`,
`stroke="currentColor"`, `stroke-width="2"`, round caps/joins. The original site hand-inlines
SVGs in this idiom (mail, phone, shield, chevrons, map) and the StrangeSkies app imports
`lucide-react`.

**Swift7 Line — the custom brand set (use this first).** `assets/icons/swift7-icons.svg`
is a bespoke 19-icon set drawn on a 24px grid, 2px rounded stroke, with a *swift / speed*
personality — a swift-bird mascot, bolt, rocket, a 7-day calendar, price tag, gauge, plus
the service essentials (SEO search, map-pin, pages, pen, shield-check, key, chat, mail,
phone, headset, star). It's a single SVG sprite of `<symbol>`s; reference an icon with
`<svg class="s7i"><use href="swift7-icons.svg#s7-bolt"/></svg>` and colour it via
`stroke` (sage/off-white in UI, lime when active or for the mascot/bolt/rocket/star).
The set's specimen card is `preview/brand-iconset.html`; it's used live across the four
hero directions in `ui_kits/website/hero-variations.html`. **Reach for Swift7 Line first;**
fall back to **[Lucide](https://lucide.dev)** (identical 2px line idiom) only for a glyph
the custom set doesn't cover, so weight and corner style stay consistent.

- **Stroke, not fill.** Icons are outlined, 2px stroke, currentColor — they inherit text
  colour (sage/off-white in UI, lime when active or as bullets).
- **Brand-mark SVGs are filled,** and kept exact: the **WhatsApp** glyph and the **Google**
  "G"/stars are filled multi-path SVGs used verbatim for those partners.
- **No emoji.** Decorative "icons" in lists are a lime `→` arrow or a `✓` tick inside a
  small circular tinted badge — not emoji, not unicode dingbats (aside from `★` for
  review stars and `→`/`+`/`−` used as functional glyphs in process steps and the FAQ
  accordion toggle).
- **No custom pictographic icon set, no icon font** beyond Lucide. Numerals double as
  graphics — the giant lime step numbers and the "7" are a deliberate motif.

Assets copied into `assets/` (logos, favicon/app-icon tile, founder photo, client
device-mockups). See the Index. Lucide is linked from CDN in the UI kit rather than vendored.

---

## Index — what's in this folder

| Path | What it is |
|---|---|
| `README.md` | This file — brand overview, voice, visual & icon foundations |
| `colors_and_type.css` | All colour + type + radius + shadow + motion tokens (`--s7-*`) and semantic type classes (`.s7-h1`, `.s7-eyebrow`, …) |
| `SKILL.md` | Agent-Skill manifest so this system works inside Claude Code |
| `assets/` | Logos (`logo.png` white, `logo-green.png`), favicon/app-icon tile, founder photo, client device-mockups for portfolio use |
| `assets/icons/swift7-icons.svg` | **Swift7 Line** — the custom 19-icon brand sprite (see ICONOGRAPHY) |
| `preview/` | Small HTML specimen cards that populate the Design System tab (colours, type, components, brand) |
| `ui_kits/website/` | High-fidelity, click-through recreation of the Swift7 marketing site — `index.html` + modular JSX components (see its own `README.md`) |
| `social/` | On-brand social-post examples — `social-posts.html` (16 squares + 4 case studies + 2 landscape + 2 stories) on a design canvas |

**UI kits**
- `ui_kits/website/` — the Swift7 marketing site (nav, hero + typing search demo, ticker, portfolio, process, them-vs-us, testimonials, about, pricing, FAQ, CTA, footer, lead-capture modal, WhatsApp FAB). The only public-facing product surface.

- `ui_kits/website/hero-variations.html` — a design-canvas exploring **four hero directions** (Split · Centered + icon features · Image-led/proof · Stat/price-forward), all built on the brand system and the custom Swift7 Line icons.

> No slide template was present in the source material, so no `slides/` were created.
> The `client/` StrangeSkies PWA was intentionally **not** recreated — it's a separate
> client brand, not Swift7's, and is documented for context only.

**Quick-start for a new artifact:** link `colors_and_type.css`, load Poppins, put content
on `--s7-green-900`, lead with a lime `.s7-eyebrow`, set headlines in `.s7-h1`/`.s7-h2`
(weight 900, tight tracking), use the lime `→`/`✓` for lists, and reach into
`ui_kits/website/` for ready-made buttons, cards, nav and the lead-capture modal.
