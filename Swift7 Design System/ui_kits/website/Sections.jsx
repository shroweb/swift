/* ============================================================
   Swift7 UI Kit — Content sections
   Portfolio · Process · Why (them vs us) · Testimonials
   ============================================================ */

const PORTFOLIO = [
  { n: "01", name: "JT Accountancy", img: "assets/work-jt-accountancy.webp", tag: "Static Site", desc: "Professional site for a Hull accountancy practice — built to attract limited companies, sole traders and personal tax clients across East Yorkshire." },
  { n: "02", name: "Hull Cleaning", img: "assets/work-hull-cleaning.webp", tag: "Static Site", desc: "Mobile-friendly site for a local cleaning business — service pages, enquiry forms and Google Business Profile to drive local leads." },
  { n: "03", name: "Elland Road Roofing", img: "assets/work-elland-road.webp", tag: "WordPress", desc: "WordPress site for a Yorkshire roofer — ranking on Google for local terms and generating quote requests directly through the site." },
  { n: "04", name: "UseForge", img: "assets/work-useforge.webp", tag: "Static Site", desc: "Fast, clean app landing page built for conversions — driving app-store downloads with a clear, mobile-first layout." },
  { n: "05", name: "Apex Strength", img: "assets/work-apex-gym.webp", tag: "Concept", desc: "Concept site for a Hull gym — bold design built to drive memberships, with class timetables, pricing and a strong mobile-first layout." },
];

function Portfolio() {
  return (
    <section id="portfolio">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">Recent Work</p>
          <h2 className="sec">Sites that are already earning.</h2>
          <p className="section-sub">Not mock-ups. Real sites, for real businesses — live and already earning enquiries.</p>
        </div>
        <div className="portfolio-grid">
          {PORTFOLIO.map((p, i) => (
            <a className="portfolio-item reveal" key={p.n} data-delay={(i % 3) + 1} href="#" onClick={(e) => e.preventDefault()}>
              <div className="portfolio-image"><img src={p.img} alt={p.name} loading="lazy" /></div>
              <p className="portfolio-num">{p.n}</p>
              <div className="portfolio-info">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <div className="portfolio-tag">{p.tag}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { day: "Day 1", n: "01", h: "The brief", p: "You answer a few quick questions about your business. No tech knowledge needed — we take it from there." },
  { day: "Days 2–5", n: "02", h: "We build", p: "Design, copywriting and on-page SEO, all done for you. You'll get a preview link to follow along." },
  { day: "Day 6", n: "03", h: "You review", p: "Check it over and request any tweaks. We refine until you're happy with every page." },
  { day: "Day 7", n: "04", h: "Go live", p: "Domain, hosting, SSL and Google Business Profile sorted. Your site goes live — on schedule." },
];

function Process() {
  return (
    <section id="process">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">The Process</p>
          <h2 className="sec">Live in 7 days. Here's exactly how.</h2>
          <p className="section-sub">No long agency timelines. No chasing. A clear, fixed schedule from brief to launch.</p>
        </div>
        <div className="process-grid">
          {STEPS.map((s, i) => (
            <div className="process-step reveal" key={s.n} data-delay={i + 1}>
              <span className="step-day">{s.day}</span>
              <div className="step-big-num">{s.n}</div>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const THEM = ["£2,000–£5,000+ quotes", "6–12 week timelines", "You write all the content", "Hidden hosting & maintenance fees", "Locked into their platform", "Chasing for replies"];
const US = ["£500, all-in", "Live in 7 days", "Every word written for you", "£70/yr — domain & hosting, that's it", "You own your site outright", "Direct line to Callum on WhatsApp"];

function Why() {
  return (
    <section id="why">
      <div className="container">
        <div className="why-header reveal">
          <div>
            <p className="section-label">Why Swift7</p>
            <h2 className="sec">Same result. None of the agency nonsense.</h2>
          </div>
          <p className="why-quote">"The problem I kept seeing was good local businesses priced out of a decent website. So I fixed the price and the timeline."</p>
        </div>
        <div className="why-grid reveal">
          <div className="why-col them">
            <div className="why-col-header"><span className="why-col-label">The usual agency</span></div>
            {THEM.map((t) => (
              <div className="why-item" key={t}><span className="why-icon">✕</span><p>{t}</p></div>
            ))}
          </div>
          <div className="why-col us">
            <div className="why-col-header"><span className="why-col-label">With Swift7</span></div>
            {US.map((t) => (
              <div className="why-item" key={t}><span className="why-icon">→</span><p>{t}</p></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { q: "Honestly didn't have to do much at all. Filled in a form, Callum wrote everything, and it was live within the week. Already had people contact us through it.", a: "MM", name: "Marie M.", biz: "Hull Cleaning Co." },
  { q: "Thought the 7 days thing was a gimmick. Callum had it done in 6. Had a couple of people get in touch through the site not long after it went live.", a: "SD", name: "Steve D.", biz: "Elland Road Roofing" },
  { q: "I just answered some questions about the business and that was pretty much it. Callum sorted the domain, emails, everything. Good value for what you get.", a: "IB", name: "Isabelle B.", biz: "UseForge" },
];

function Testimonials() {
  return (
    <section id="testimonials">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">Reviews</p>
          <h2 className="sec">Trades &amp; small businesses rate Swift7.</h2>
        </div>
        <div className="testimonial-grid reveal">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.a}>
              <div className="testimonial-stars"><Stars n={5} /></div>
              <p className="testimonial-quote">{t.q}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.a}</div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-biz">{t.biz}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="google-reviews-cta" style={{ textAlign: "center", marginTop: 40 }}>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--mid)", textDecoration: "none", border: "1px solid var(--border2)", padding: "12px 22px", borderRadius: 100, background: "var(--g700)" }}>
            <IconGoogle size={16} /> See our 5-star Google reviews
          </a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Portfolio, Process, Why, Testimonials });
