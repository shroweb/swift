/* ============================================================
   Swift7 UI Kit — Offer teaser · About · Pricing · FAQ
   ============================================================ */

const OFFER = [
  "Up to 10 pages", "Bespoke design", "All copy written for you", "On-page SEO",
  "Google Business Profile", "Mobile-first & responsive", "Contact / enquiry forms",
  "Domain, hosting & SSL", "Cross-browser tested",
];

function Offer() {
  return (
    <section id="offer">
      <div className="container">
        <div className="offer-teaser">
          <div className="reveal">
            <p className="section-label">What's Included</p>
            <h2 className="sec">Everything included. Nothing extra.</h2>
            <p className="section-sub" style={{ marginBottom: 28 }}>One fixed price covers the lot. No upsells, no surprise invoices, no "that'll be extra".</p>
            <button className="btn btn-lime btn-lg" onClick={() => document.getElementById("kit-start")?.click()}>See the full breakdown <IconArrowRight size={17} /></button>
          </div>
          <div className="offer-teaser-items reveal" data-delay="1">
            {OFFER.map((o) => (
              <div className="offer-teaser-item" key={o}><span className="offer-teaser-check">✓</span>{o}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="about-wrap">
          <div className="about-photo-wrap reveal">
            <img className="about-photo" src="assets/callum-founder.webp" alt="Callum MacInnes, founder of Swift7" />
            <div className="about-photo-badge"><span>15+</span>years building sites</div>
          </div>
          <div className="about-content reveal" data-delay="1">
            <p className="section-label">The Person Behind It</p>
            <h2>Hi, I'm Callum. I build sites that actually work.</h2>
            <p>I'm a web designer based in Hull, building for trades and small businesses across Yorkshire and the UK. The problem I kept seeing was good local businesses priced out of a decent website — or stuck with a half-finished template they had to fill in themselves.</p>
            <p>So Swift7 is simple: a fixed £500, live in 7 days, and I write every word for you. You deal with me directly — not an account manager — from the first message to launch day.</p>
            <div className="about-stats">
              <div><span className="about-stat-num">40+</span><span className="about-stat-label">Sites launched</span></div>
              <div><span className="about-stat-num">7</span><span className="about-stat-label">Days to live</span></div>
              <div><span className="about-stat-num">5.0★</span><span className="about-stat-label">Google rating</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PRICE_CHECKS = ["Up to 10 pages", "All content written for you", "On-page SEO + Google Business Profile", "Domain, hosting & SSL (year one)", "Mobile-first, cross-browser tested"];

function Pricing({ onStart }) {
  return (
    <section id="pricing">
      <div className="container">
        <div className="pricing-layout">
          <div className="pricing-left reveal">
            <p className="section-label">Pricing</p>
            <h2 className="sec">One price. Live in a week.</h2>
            <p className="section-sub">No tiers to decode, no feature gating. The Swift7 Launch is everything most small businesses need to get found and get enquiries.</p>
            <ul className="pricing-bullets">
              <li>A website that ranks on Google works 24/7 — bringing in enquiries while you're on the job.</li>
              <li>Static or WordPress — your call. Both £500, both live in 7 days.</li>
              <li>After year one it's just £70/yr for domain &amp; hosting. Nothing else.</li>
              <li>Want ongoing changes, content or SEO? Add <strong style={{ color: "var(--amber)" }}>Swift7 Plus</strong> monthly.</li>
            </ul>
          </div>
          <aside className="pricing-box reveal" data-delay="1">
            <div className="pricing-box-label">The Swift7 Launch</div>
            <div className="price-display"><sup>£</sup>500</div>
            <div className="price-note">All-in, one-off. 50% upfront, 50% on completion.</div>
            <div className="pricing-checks">
              {PRICE_CHECKS.map((c) => (
                <div className="pricing-check" key={c}><span className="pcheck-icon">✓</span>{c}</div>
              ))}
            </div>
            <div className="pricing-urgency"><span className="urgency-dot"></span> 3 build slots left this month</div>
            <button className="btn btn-lime" onClick={onStart}>Get a free audit <IconArrowRight size={16} /></button>
            <button className="btn btn-whatsapp" onClick={(e) => e.preventDefault()}><IconWhatsApp size={18} /> Message on WhatsApp</button>
            <p className="pricing-guarantee">7-day delivery guarantee. If we miss the deadline through our fault, you don't pay the balance.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "Can you really launch my website in 7 days?", a: "Yes. Once we have your details and the first payment, we start immediately. Day 1 is your brief, days 2–5 we build, day 6 you review, day 7 you go live. The 7-day clock starts when you've sent over your info." },
  { q: "Do I have to write the content myself?", a: "No — that's the whole point. You answer a few questions about your business and I write every page for you: homepage, services, about, the lot. You just review and tweak." },
  { q: "What happens after the first year?", a: "It's £70 a year for your domain and hosting. No surprise renewals, no maintenance contract you didn't ask for. If you want ongoing work, Swift7 Plus is optional and monthly." },
  { q: "Do I own the website?", a: "Completely. The domain is registered in your name and the site is yours outright. You're never locked into a proprietary platform — you can take it elsewhere any time." },
  { q: "Static site or WordPress — which do I need?", a: "Both are £500 and live in 7 days. Static is faster and lower-maintenance; WordPress is better if you want to post regular updates or blogs yourself. I'll recommend the right one for your business." },
  { q: "How does payment work?", a: "50% upfront to book your slot and start the build, 50% on completion before launch. No monthly subscription, no hidden fees." },
];

function FAQItem({ q, a, open, onToggle, num }) {
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-btn" aria-expanded={open} onClick={onToggle}>
        <span className="faq-num">{num}</span><span>{q}</span>
      </button>
      <div className="faq-answer"><div className="faq-body"><p>{a}</p></div></div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">FAQ</p>
          <h2 className="sec">The questions everyone asks.</h2>
        </div>
        <div className="faq-list reveal">
          {FAQS.map((f, i) => (
            <FAQItem key={i} num={String(i + 1).padStart(2, "0")} q={f.q} a={f.a}
              open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Offer, About, Pricing, FAQ });
