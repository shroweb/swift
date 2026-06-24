# Swift7 — Website UI Kit

A high-fidelity, click-through recreation of the **Swift7 marketing site**
(https://swift7.co.uk) — the £500 / 7-day web-design offer for UK trades and
small businesses. Built in React (inline Babel JSX), styled with the brand's own
ported CSS. It's a cosmetic recreation for prototyping, not production code.

## Run it
Open `index.html`. Everything loads from CDN (React 18 + Babel) and local JSX.

## What it demonstrates (interactive)
- **Sticky nav** that gains a shadow on scroll + a working mobile hamburger menu.
- **Hero** with the animated "search near me" typing demo and the £500 pricing card.
- **Looping feature ticker.**
- **Smooth in-page navigation** — nav links scroll to Portfolio / Process / Pricing / FAQ.
- **Scroll-reveal** fade-ins (IntersectionObserver, one easing).
- **Portfolio** grid (real Swift7 client mockups), **Process** 4-step row,
  **them-vs-us** comparison, **testimonials**, **About Callum**, **Pricing** box,
  **FAQ accordion** (one-open-at-a-time), big closing **CTA** with lime wash.
- **Lead-capture modal** — opens from every "Get a free audit" button, validates
  name + email, shows a success state. (Fake submit — no network.)
- **Floating WhatsApp FAB** + back-to-top button.

## Files
| File | Component(s) |
|---|---|
| `index.html` | Loads fonts, `kit.css`, React/Babel, and every JSX file in order |
| `kit.css` | All component CSS, ported from the live site's inline styles |
| `Primitives.jsx` | `Icon`/Lucide-style line icons, WhatsApp & Google glyphs, `Stars`, `Button` |
| `Nav.jsx` | `Nav` — sticky bar + mobile menu |
| `Hero.jsx` | `Hero` (typing search demo + pricing card), `Ticker` |
| `Sections.jsx` | `Portfolio`, `Process`, `Why`, `Testimonials` |
| `Pricing.jsx` | `Offer`, `About`, `Pricing`, `FAQ` |
| `Chrome.jsx` | `CTA`, `Footer`, `FloatingButtons`, `LeadModal` |
| `App.jsx` | Wires it together; scroll-reveal + in-page nav + modal state |
| `assets/` | Logo + real client device-mockups + founder photo |

## Notes & fidelity
- Each `<script type="text/babel">` has its own scope; components are shared by
  assigning them to `window` at the end of each file (no `type="module"`).
- Copy is lifted verbatim from the live site where possible (ticker, testimonials,
  portfolio, FAQ). Components are simplified cosmetic versions of the originals.
- Colours, type, radii, shadows and motion all come from the root
  `../../colors_and_type.css` token system (inlined into `kit.css` so the kit
  renders standalone).
- The page scrolls inside `#kit-scroll` (a full-height overflow container) so the
  sticky nav and floating buttons behave correctly inside an embedded frame.
