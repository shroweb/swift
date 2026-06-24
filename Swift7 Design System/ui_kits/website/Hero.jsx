/* ============================================================
   Swift7 UI Kit — Hero (search demo + pricing card) + Ticker
   ============================================================ */

const HERO_QUERIES = ["web designer near me", "affordable website for my business", "web design hull"];

function Hero({ onStart, onNavigate }) {
  const [typed, setTyped] = React.useState("");
  const qi = React.useRef(0);
  const ci = React.useRef(0);
  const deleting = React.useRef(false);

  React.useEffect(() => {
    let t;
    const tick = () => {
      const word = HERO_QUERIES[qi.current];
      if (!deleting.current) {
        ci.current++;
        setTyped(word.slice(0, ci.current));
        if (ci.current === word.length) { deleting.current = true; t = setTimeout(tick, 1800); return; }
        t = setTimeout(tick, 70);
      } else {
        ci.current--;
        setTyped(word.slice(0, ci.current));
        if (ci.current === 0) { deleting.current = false; qi.current = (qi.current + 1) % HERO_QUERIES.length; }
        t = setTimeout(tick, 35);
      }
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-eyebrow"><span className="eyebrow-dot"></span> Live in 7 days · 3 build slots left this month</div>
          <h1>A website that <span className="accent">wins you work.</span></h1>
          <p className="hero-sub">Professional, mobile-first websites for UK trades and small businesses. £500 all-in, live in seven days — content, SEO and Google Business Profile done for you.</p>

          <p className="search-demo-label">Be the business they find first:</p>
          <div className="search-demo">
            <IconSearch size={18} className="search-demo-icon" style={{ flexShrink: 0, opacity: 0.5 }} />
            <span className="search-demo-text">{typed}<span className="search-cursor"></span></span>
          </div>

          <div className="hero-actions">
            <button className="btn btn-lime" onClick={onStart}>Get a free audit <IconArrowRight size={17} /></button>
            <button className="btn btn-outline" onClick={() => onNavigate?.("portfolio")}>View portfolio</button>
          </div>

          <div className="hero-trust-row">
            <span className="hero-trust"><span className="trust-icon">★</span> 5.0 on Google</span>
            <span className="hero-trust"><span className="trust-icon">✓</span> 15+ years building sites</span>
            <span className="hero-trust"><span className="trust-icon">✓</span> You own it outright</span>
          </div>
        </div>

        <aside className="hero-right">
          <div className="hero-pricing">
            <div className="hero-card-label">The Swift7 Launch</div>
            <div className="hero-price"><sup>£</sup>500</div>
            <div className="hero-price-note">All-in. No monthly fees. Live in 7 days.</div>
            <div className="hero-checks">
              {["Up to 10 pages, written for you", "On-page SEO + Google Business Profile", "Domain, hosting & SSL — year one", "50% upfront, 50% on completion"].map((c) => (
                <div className="hero-check" key={c}><span className="check-icon">✓</span>{c}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}

const TICKER_ITEMS = [
  "7-day delivery guarantee", "£500 all-in, no extras", "All content written for you",
  "Google Business Profile included", "Mobile-friendly & cross-browser tested",
  "Domain, hosting & SSL included", "15+ years building websites", "No hidden costs",
  "50% upfront · 50% on completion", "Static or WordPress",
];

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span className="ticker-item" key={i}>{t} <span className="ticker-dot"></span></span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Hero, Ticker });
