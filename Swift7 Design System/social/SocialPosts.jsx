/* ============================================================
   Swift7 — Social Post examples
   Instagram square (1080×1080) + story (1080×1920) on a canvas.
   Brand system + custom Swift7 Line icons + real copy/work.
   ============================================================ */

fetch("assets/icons/swift7-icons.svg").then(r => r.text()).then(t => {
  document.getElementById("sprite").innerHTML = t;
}).catch(() => {});

const Ic = ({ id, cls = "si", style }) => <svg className={cls} style={style} aria-hidden="true"><use href={`#${id}`} /></svg>;
const StarFill = ({ size = 44, color = "#A8C94A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.2 6L12 17.9 6.5 19.6l1.2-6L3.2 9.4l6.1-.8L12 3Z" />
  </svg>
);
const Stars = () => <span className="stars">{Array.from({ length: 5 }).map((_, i) => <StarFill key={i} />)}</span>;
const Logo = () => <img src="assets/logo.png" alt="Swift7" />;

const BrandFooter = ({ right = "swift7.co.uk" }) => (
  <div className="brandrow">
    <Logo />
    <span className="url">{right}</span>
  </div>
);

/* ---- 1 · Offer (flagship) ---- */
const PostOffer = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <div className="brandrow">
      <span className="eyebrow"><span className="dot"></span> The Swift7 Launch</span>
    </div>
    <div className="spacer"></div>
    <div className="price" style={{ fontSize: 360 }}><sup>£</sup>500</div>
    <h1 className="big" style={{ fontSize: 76, marginTop: 8 }}>All-in. <span className="a">Live in 7 days.</span></h1>
    <div className="spacer"></div>
    <div className="checks" style={{ marginBottom: 64 }}>
      {[["s7-pages", "Up to 10 pages, written for you"], ["s7-search", "SEO + Google Business Profile"], ["s7-key", "You own it — no lock-in"]].map(([i, t]) => (
        <div className="ck" key={t}><Ic id={i} /> {t}</div>
      ))}
    </div>
    <BrandFooter />
  </div>
);

/* ---- 2 · Testimonial ---- */
const PostTestimonial = () => (
  <div className="post sq pad" style={{ background: "var(--g700)" }}>
    <div className="qmark">&ldquo;</div>
    <div className="brandrow">
      <Stars />
      <span className="chip" style={{ fontSize: 24, padding: "12px 22px" }}><StarFill size={26} /> 5.0 on Google</span>
    </div>
    <div className="spacer"></div>
    <p className="quote">Thought the 7-day thing was a gimmick. Callum had it done in <span className="a">6.</span> Had people getting in touch through the site not long after it went live.</p>
    <div className="spacer"></div>
    <div className="author" style={{ marginBottom: 56 }}>
      <div className="avatar">SD</div>
      <div><div className="aname">Steve D.</div><div className="abiz">Elland Road Roofing</div></div>
    </div>
    <BrandFooter />
  </div>
);

/* ---- 3 · Portfolio showcase ---- */
const PostPortfolio = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <div className="brandrow">
      <span className="eyebrow"><span className="dot"></span> Recent work</span>
      <span className="tag">WordPress</span>
    </div>
    <div style={{ height: 44 }}></div>
    <div className="shot"><img src="assets/work-elland-road.webp" alt="Elland Road Roofing" /></div>
    <div style={{ height: 44 }}></div>
    <h1 className="big" style={{ fontSize: 72 }}>Elland Road Roofing.</h1>
    <p style={{ fontSize: 32, color: "var(--mid)", margin: "16px 0 56px", fontWeight: 500 }}>Live, ranking locally &amp; earning quote requests.</p>
    <BrandFooter />
  </div>
);

/* ---- 4 · Process (educational) ---- */
const STEPS = [
  ["s7-pen", "01", "Tell us about the business", "Day 1"],
  ["s7-browser", "02", "We design, write & build", "Days 2–5"],
  ["s7-search", "03", "You review every page", "Day 6"],
  ["s7-rocket", "04", "Go live — on schedule", "Day 7"],
];
const PostProcess = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <span className="eyebrow"><span className="dot"></span> How it works</span>
    <h1 className="big" style={{ fontSize: 88, margin: "32px 0 20px" }}>Live in <span className="a">7 days.</span><br />Here's how.</h1>
    <div className="spacer"></div>
    <div className="steps">
      {STEPS.map(([ic, n, t, d]) => (
        <div className="step" key={n}>
          <span className="num">{n}</span>
          <Ic id={ic} />
          <span className="stitle">{t}</span>
          <span className="sday">{d}</span>
        </div>
      ))}
    </div>
    <div style={{ height: 56 }}></div>
    <BrandFooter />
  </div>
);

/* ---- 5 · Urgency / CTA ---- */
const PostUrgency = () => (
  <div className="post sq pad wash" style={{ background: "var(--g950)" }}>
    <div className="brandrow" style={{ position: "relative", zIndex: 1 }}>
      <Logo />
      <span className="chip"><span className="live"></span> 3 slots left this month</span>
    </div>
    <div className="spacer"></div>
    <h1 className="big" style={{ fontSize: 132, position: "relative", zIndex: 1 }}>Stop putting<br />it <span className="a">off.</span></h1>
    <p style={{ fontSize: 34, color: "var(--faint)", lineHeight: 1.5, maxWidth: 720, margin: "36px 0 56px", position: "relative", zIndex: 1, fontWeight: 400 }}>Get a free, no-pressure audit of your current site — or a plan for your first one.</p>
    <div className="cta" style={{ position: "relative", zIndex: 1, fontSize: 34 }}>Get a free audit <Ic id="s7-bolt" /></div>
    <div className="spacer"></div>
    <div style={{ position: "relative", zIndex: 1 }}><span className="url">swift7.co.uk · 07380 218301</span></div>
  </div>
);

/* ---- 6 · Story — offer (1080×1920) ---- */
const StoryOffer = () => (
  <div className="post st pad-st wash" style={{ background: "var(--g900)" }}>
    <div className="brandrow" style={{ position: "relative", zIndex: 1 }}><Logo /></div>
    <div style={{ height: 120 }}></div>
    <span className="eyebrow" style={{ position: "relative", zIndex: 1 }}><span className="dot"></span> Affordable web design</span>
    <h1 className="big" style={{ fontSize: 128, margin: "40px 0 0", position: "relative", zIndex: 1 }}>Be the business <span className="a">they find first.</span></h1>
    <div style={{ height: 64 }}></div>
    <div className="search" style={{ position: "relative", zIndex: 1 }}>
      <Ic id="s7-search" /><span className="txt">web designer near me<span className="cursor"></span></span>
    </div>
    <div className="spacer"></div>
    <div className="checks" style={{ marginBottom: 80, position: "relative", zIndex: 1 }}>
      {[["s7-seven-day", "Live in 7 days"], ["s7-tag", "£500 all-in, no extras"], ["s7-pen", "Every word written for you"]].map(([i, t]) => (
        <div className="ck" key={t}><Ic id={i} /> {t}</div>
      ))}
    </div>
    <div className="cta" style={{ alignSelf: "stretch", justifyContent: "center", position: "relative", zIndex: 1, fontSize: 36 }}>Tap the link to start <Ic id="s7-bolt" /></div>
  </div>
);

/* ---- 7 · Story — testimonial / proof (1080×1920) ---- */
const StoryProof = () => (
  <div className="post st pad-st" style={{ background: "var(--g950)" }}>
    <div className="qmark" style={{ fontSize: 520, top: 120 }}>&ldquo;</div>
    <div className="brandrow" style={{ position: "relative", zIndex: 1 }}><Logo /><span className="url">5.0 ★ Google</span></div>
    <div style={{ height: 160 }}></div>
    <div style={{ position: "relative", zIndex: 1 }}><Stars /></div>
    <p className="quote" style={{ fontSize: 72, marginTop: 40 }}>Honestly didn't have to do much at all. Filled in a form, Callum wrote everything — live within the <span className="a">week.</span></p>
    <div className="spacer"></div>
    <div className="author" style={{ position: "relative", zIndex: 1 }}>
      <div className="avatar" style={{ width: 96, height: 96, fontSize: 34 }}>MM</div>
      <div><div className="aname" style={{ fontSize: 38 }}>Marie M.</div><div className="abiz" style={{ fontSize: 30 }}>Hull Cleaning Co.</div></div>
    </div>
    <div style={{ height: 80 }}></div>
    <div className="cta" style={{ alignSelf: "stretch", justifyContent: "center", position: "relative", zIndex: 1, fontSize: 36 }}>Get your free audit <Ic id="s7-bolt" /></div>
  </div>
);

/* ---- WhatsApp brand glyph (filled) ---- */
const WAGlyph = ({ size = 40, color = "#0F2219" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.27-.1-.46-.15-.65.15s-.74.94-.9 1.13c-.17.2-.34.22-.63.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.67-2.07c-.17-.3 0-.46.13-.6.13-.14.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49l-.55-.01a1.06 1.06 0 0 0-.77.36c-.26.29-1 .98-1 2.4s1.03 2.78 1.17 2.97c.14.2 2.02 3.08 4.9 4.32.68.3 1.22.47 1.63.6.69.22 1.31.19 1.8.12.55-.08 1.7-.7 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.2-.55-.34zM12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.1 1.52 5.83L.06 23.88l6.2-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0zm0 21.8a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.97 1-3.63-.24-.37A9.8 9.8 0 1 1 12 21.8z" />
  </svg>
);

/* ---- 6 · Them vs Us (the maths) ---- */
const PostMaths = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <span className="eyebrow"><span className="dot"></span> The maths</span>
    <h1 className="big" style={{ fontSize: 80, margin: "30px 0 56px" }}>Same site.<br />A <span className="a">fraction</span> of the price.</h1>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, flex: 1 }}>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 16, padding: 44, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 24 }}>Typical agency</div>
        <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: "-4px", color: "var(--mid)", textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.25)", lineHeight: 1 }}>£2k+</div>
        <div className="spacer"></div>
        <div style={{ fontSize: 26, color: "var(--faint)", lineHeight: 1.5 }}>6–12 weeks · you write the content · hidden fees</div>
      </div>
      <div style={{ background: "rgba(168,201,74,0.10)", border: "1px solid var(--border)", borderTop: "4px solid var(--amber)", borderRadius: 16, padding: 44, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 24 }}>With Swift7</div>
        <div className="price" style={{ fontSize: 92 }}><sup>£</sup>500</div>
        <div className="spacer"></div>
        <div style={{ fontSize: 26, color: "#fff", lineHeight: 1.5, fontWeight: 500 }}>7 days · written for you · all-in, no extras</div>
      </div>
    </div>
    <div style={{ height: 56 }}></div>
    <BrandFooter />
  </div>
);

/* ---- 7 · Statement / hook ---- */
const PostStatement = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <div className="brandrow"><Logo /></div>
    <div className="spacer"></div>
    <h1 className="big" style={{ fontSize: 128 }}>If they can't <span className="a">Google</span> you,<br />you don't exist.</h1>
    <p style={{ fontSize: 36, color: "var(--faint)", lineHeight: 1.5, maxWidth: 760, margin: "44px 0 0", fontWeight: 400 }}>A website that ranks works while you're on the job — bringing in enquiries 24/7.</p>
    <div className="spacer"></div>
    <span className="url">swift7.co.uk</span>
  </div>
);

/* ---- 8 · Stat / proof ---- */
const PostStat = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <span className="eyebrow"><span className="dot"></span> The numbers</span>
    <div className="spacer"></div>
    <div className="price" style={{ fontSize: 400, color: "var(--amber)" }}>40+</div>
    <h1 className="big" style={{ fontSize: 72, marginTop: 4 }}>local businesses now<br />live on Swift7.</h1>
    <div className="spacer"></div>
    <div style={{ display: "flex", gap: 0, marginBottom: 56 }}>
      {[["7 days", "to live"], ["£500", "all-in"], ["5.0★", "on Google"]].map(([n, l], i) => (
        <div key={i} style={{ flex: 1, paddingRight: 28, marginRight: 28, borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", color: "var(--ink)", lineHeight: 1 }}>{n}</div>
          <div style={{ fontSize: 26, color: "var(--mid)", marginTop: 8, fontWeight: 500 }}>{l}</div>
        </div>
      ))}
    </div>
    <BrandFooter />
  </div>
);

/* ---- 9 · FAQ ---- */
const PostFaq = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <span className="eyebrow"><span className="dot"></span> You asked</span>
    <div className="spacer"></div>
    <div style={{ fontSize: 40, fontWeight: 900, color: "var(--amber)", marginBottom: 24 }}>Q.</div>
    <h1 className="big" style={{ fontSize: 76 }}>Can you really build it in 7 days?</h1>
    <p style={{ fontSize: 34, color: "var(--faint)", lineHeight: 1.55, maxWidth: 800, margin: "44px 0 0", fontWeight: 400 }}>
      <span style={{ color: "var(--amber)", fontWeight: 700 }}>Yes.</span> Day 1 you send a quick brief, days 2–5 we build, day 6 you review, day 7 you're live. We've not missed it yet.
    </p>
    <div className="spacer"></div>
    <BrandFooter />
  </div>
);

/* ---- 10 · Just launched ---- */
const PostLaunch = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <div className="brandrow">
      <span className="chip"><span className="live"></span> Just launched</span>
      <span className="tag">Static Site</span>
    </div>
    <div style={{ height: 44 }}></div>
    <div className="shot"><img src="assets/work-jt-accountancy.webp" alt="JT Accountancy" /></div>
    <div style={{ height: 44 }}></div>
    <h1 className="big" style={{ fontSize: 76 }}>JT Accountancy <span className="a">is live.</span></h1>
    <p style={{ fontSize: 32, color: "var(--mid)", margin: "16px 0 56px", fontWeight: 500 }}>Another Hull business, now found on Google.</p>
    <BrandFooter />
  </div>
);

/* ---- 11 · WhatsApp CTA ---- */
const PostWhatsApp = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <div className="brandrow"><Logo /></div>
    <div className="spacer"></div>
    <div style={{ width: 130, height: 130, borderRadius: 30, background: "var(--wa)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
      <WAGlyph size={78} color="#0F2219" />
    </div>
    <h1 className="big" style={{ fontSize: 96 }}>Got a question?<br /><span className="a">Just message.</span></h1>
    <p style={{ fontSize: 34, color: "var(--faint)", lineHeight: 1.5, margin: "40px 0 0", fontWeight: 400 }}>No forms, no phone tag. Message Callum directly — reply usually same day.</p>
    <div className="spacer"></div>
    <span className="url">wa.me/447380218301</span>
  </div>
);

/* ---- 12 · Landscape · Offer (1200×627) ---- */
const LandOffer = () => (
  <div className="post ls pad-ls" style={{ background: "var(--g900)", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 56, alignItems: "center" }}>
    <div>
      <span className="eyebrow" style={{ fontSize: 22 }}><span className="dot"></span> Affordable web design</span>
      <h1 className="big" style={{ fontSize: 64, margin: "24px 0 0" }}>A website that <span className="a">wins you work.</span></h1>
      <p style={{ fontSize: 26, color: "var(--faint)", margin: "22px 0 0", lineHeight: 1.5, fontWeight: 400 }}>£500 all-in · live in 7 days · written for you.</p>
    </div>
    <div style={{ background: "var(--g950)", borderTop: "4px solid var(--amber)", borderRadius: 12, padding: 40 }}>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 14 }}>The Swift7 Launch</div>
      <div className="price" style={{ fontSize: 140 }}><sup>£</sup>500</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, color: "var(--g950)", background: "var(--amber)", borderRadius: 8, padding: "18px 28px", fontWeight: 800, fontSize: 26, justifyContent: "center" }}>
        Get a free audit <Ic id="s7-bolt" style={{ width: 26, height: 26, stroke: "var(--g950)" }} />
      </div>
    </div>
  </div>
);

/* ---- 13 · Landscape · Quote (1200×627) ---- */
const LandQuote = () => (
  <div className="post ls pad-ls" style={{ background: "var(--g700)", justifyContent: "center" }}>
    <div className="qmark" style={{ fontSize: 300, top: 0, right: 60 }}>&ldquo;</div>
    <div style={{ position: "relative", zIndex: 1 }}><span className="stars">{Array.from({ length: 5 }).map((_, i) => <StarFill key={i} size={34} />)}</span></div>
    <p className="quote" style={{ fontSize: 52, margin: "28px 0 0", maxWidth: 980 }}>Thought the 7-day thing was a gimmick. Callum had it done in <span className="a">6.</span></p>
    <div className="author" style={{ marginTop: 40, position: "relative", zIndex: 1 }}>
      <div className="avatar" style={{ width: 72, height: 72, fontSize: 26 }}>SD</div>
      <div><div className="aname" style={{ fontSize: 28 }}>Steve D.</div><div className="abiz" style={{ fontSize: 23 }}>Elland Road Roofing · swift7.co.uk</div></div>
    </div>
  </div>
);

/* ---- Case studies (richer portfolio: client → what we did → result) ---- */
const CSStat = ({ n, l, last }) => (
  <div style={{ flex: 1, paddingRight: last ? 0 : 28, marginRight: last ? 0 : 28, borderRight: last ? "none" : "1px solid var(--border)" }}>
    <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-1.5px", color: "var(--amber)", lineHeight: 1 }}>{n}</div>
    <div style={{ fontSize: 24, color: "var(--mid)", marginTop: 8, fontWeight: 500, lineHeight: 1.25 }}>{l}</div>
  </div>
);

const CaseStudy = ({ img, sector, name, blurb, stats, bg = "var(--g950)" }) => (
  <div className="post sq pad" style={{ background: bg }}>
    <div className="brandrow">
      <span className="eyebrow"><span className="dot"></span> Case study</span>
      <span className="tag">{sector}</span>
    </div>
    <div style={{ height: 40 }}></div>
    <div className="shot" style={{ flex: "none", height: 408 }}><img src={img} alt={name} /></div>
    <div style={{ height: 38 }}></div>
    <h1 className="big" style={{ fontSize: 62 }}>{name}</h1>
    <p style={{ fontSize: 30, color: "var(--mid)", margin: "14px 0 0", fontWeight: 500, lineHeight: 1.4 }}>{blurb}</p>
    <div className="spacer"></div>
    <div style={{ display: "flex", paddingTop: 34, borderTop: "1px solid var(--border)", marginBottom: 40 }}>
      {stats.map(([n, l], i) => <CSStat key={i} n={n} l={l} last={i === stats.length - 1} />)}
    </div>
    <BrandFooter />
  </div>
);

const PostCaseCleaning = () => (
  <CaseStudy bg="var(--g900)" sector="Static Site" img="assets/work-hull-cleaning.webp?v=1"
    name="Hull Cleaning Co." blurb="A local cleaning firm with no web presence — invisible when people searched."
    stats={[["6 days", "to live"], ["10 pages", "written for them"], ["£500", "all-in"]]} />
);
const PostCaseUseForge = () => (
  <CaseStudy bg="var(--g950)" sector="App Landing" img="assets/work-useforge.webp?v=1"
    name="UseForge." blurb="A new app that needed downloads, not a brochure — built to convert on mobile."
    stats={[["7 days", "to live"], ["1 page", "built to convert"], ["Mobile", "first"]]} />
);
const PostCaseApex = () => (
  <CaseStudy bg="var(--g900)" sector="Concept" img="assets/work-apex-gym.webp?v=1"
    name="Apex Strength." blurb="A Hull gym concept — bold, mobile-first design built to drive memberships."
    stats={[["7 days", "turnaround"], ["£500", "all-in"], ["5.0★", "rated"]]} />
);
const PostCaseJT = () => (
  <CaseStudy bg="var(--g950)" sector="Static Site" img="assets/work-jt-accountancy.webp"
    name="JT Accountancy." blurb="An accountancy practice that needed to look the part and rank locally."
    stats={[["6 days", "to live"], ["Found", "on Google"], ["5.0★", "rated"]]} />
);

/* ---- More posts (batch 3) ---- */

/* A · Found on Google — local SEO ranking mockup */
const PostFound = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <span className="eyebrow"><span className="dot"></span> Get found</span>
    <h1 className="big" style={{ fontSize: 84, margin: "30px 0 44px" }}>Be the <span className="a">first</span> name they call.</h1>
    <div className="search" style={{ marginBottom: 34 }}>
      <Ic id="s7-search" /><span className="txt">roofer near me</span>
    </div>
    <div style={{ background: "var(--g950)", border: "1px solid var(--border2)", borderRadius: 16, padding: 40, display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 26px", background: "rgba(168,201,74,0.10)", border: "1px solid var(--border)", borderLeft: "5px solid var(--amber)", borderRadius: 10 }}>
        <Ic id="s7-pin" style={{ width: 44, height: 44, stroke: "var(--amber)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>Your Business</div>
          <div style={{ fontSize: 24, color: "var(--amber)", marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}><Stars /><span style={{ color: "var(--mid)" }}>· 5.0 · Open now</span></div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--g950)", background: "var(--amber)", borderRadius: 100, padding: "8px 18px" }}>#1</div>
      </div>
      {["A competitor", "Another competitor"].map((t, i) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 26px", opacity: 0.4 }}>
          <Ic id="s7-pin" style={{ width: 36, height: 36, stroke: "var(--mid)", flexShrink: 0 }} />
          <div style={{ fontSize: 28, fontWeight: 600, color: "var(--mid)" }}>{t}</div>
        </div>
      ))}
    </div>
    <div style={{ height: 44 }}></div>
    <BrandFooter />
  </div>
);

/* B · What's included — the full checklist */
const INCLUDED = [
  ["s7-pages", "Up to 10 pages"], ["s7-pen", "All copy written"], ["s7-search", "On-page SEO"],
  ["s7-pin", "Google Business Profile"], ["s7-mobile", "Mobile-first design"], ["s7-mail", "Enquiry forms"],
  ["s7-key", "Domain & hosting"], ["s7-shield", "SSL & security"], ["s7-gauge", "Speed-optimised"],
];
const PostIncluded = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <span className="eyebrow"><span className="dot"></span> What's included</span>
    <h1 className="big" style={{ fontSize: 80, margin: "28px 0 12px" }}>Everything in.<br /><span className="a">Nothing extra.</span></h1>
    <div className="spacer"></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 56 }}>
      {INCLUDED.map(([ic, t]) => (
        <div key={t} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Ic id={ic} style={{ width: 44, height: 44, stroke: "var(--amber)" }} />
          <span style={{ fontSize: 25, fontWeight: 600, color: "var(--ink)", lineHeight: 1.25 }}>{t}</span>
        </div>
      ))}
    </div>
    <BrandFooter right="£500 all-in" />
  </div>
);

/* C · Meet Callum — founder */
const PostFounder = () => (
  <div className="post sq" style={{ background: "var(--g900)", flexDirection: "row", padding: 0 }}>
    <div style={{ width: "44%", flexShrink: 0, overflow: "hidden", borderRight: "1px solid var(--border2)" }}>
      <img src="assets/callum-founder.webp" alt="Callum MacInnes" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "78% 35%", display: "block" }} />
    </div>
    <div style={{ flex: 1, padding: 72, display: "flex", flexDirection: "column" }}>
      <span className="eyebrow"><span className="dot"></span> The person behind it</span>
      <div className="spacer"></div>
      <h1 className="big" style={{ fontSize: 76 }}>Hi, I'm <span className="a">Callum.</span></h1>
      <p style={{ fontSize: 32, color: "var(--faint)", lineHeight: 1.5, margin: "28px 0 0", fontWeight: 400 }}>You deal with me directly — not an account manager — from first message to launch day.</p>
      <div className="spacer"></div>
      <div style={{ display: "flex", gap: 0, marginBottom: 44 }}>
        {[["15+", "years"], ["40+", "sites"], ["5.0★", "rated"]].map(([n, l], i) => (
          <div key={l} style={{ flex: 1, paddingRight: i < 2 ? 22 : 0, marginRight: i < 2 ? 22 : 0, borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontSize: 46, fontWeight: 900, color: "var(--amber)", letterSpacing: "-1.5px", lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 22, color: "var(--mid)", marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
      <BrandFooter />
    </div>
  </div>
);

/* D · No surprises — pricing transparency */
const PostNoSurprises = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <span className="eyebrow"><span className="dot"></span> No surprises</span>
    <h1 className="big" style={{ fontSize: 80, margin: "30px 0 52px" }}>What you pay.<br /><span className="a">That's it.</span></h1>
    <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24, padding: "34px 0", borderBottom: "1px solid var(--border)" }}>
        <div><div style={{ fontSize: 36, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>To build &amp; launch</div><div style={{ fontSize: 24, color: "var(--mid)", marginTop: 6 }}>One-off · 50% upfront, 50% on completion</div></div>
        <div className="price" style={{ fontSize: 100 }}><sup>£</sup>500</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24, padding: "34px 0", borderBottom: "1px solid var(--border)" }}>
        <div><div style={{ fontSize: 36, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>After year one</div><div style={{ fontSize: 24, color: "var(--mid)", marginTop: 6 }}>Domain &amp; hosting · per year</div></div>
        <div className="price" style={{ fontSize: 100 }}><sup>£</sup>70</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "30px 0" }}>
        <Ic id="s7-shield" style={{ width: 44, height: 44, stroke: "var(--amber)" }} />
        <div style={{ fontSize: 30, fontWeight: 600, color: "var(--faint)" }}>No monthly fees. No hidden extras. Ever.</div>
      </div>
    </div>
    <div style={{ height: 32 }}></div>
    <BrandFooter />
  </div>
);

/* E · 3 signs — tips / value post */
const SIGNS = [
  ["You're not on page one", "If they can't Google you, they can't call you."],
  ["It looks wrong on a phone", "Most people will find you on mobile first."],
  ["You built it yourself in 2019", "A tired site quietly costs you work every week."],
];
const PostSigns = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <span className="eyebrow"><span className="dot"></span> Worth a check</span>
    <h1 className="big" style={{ fontSize: 76, margin: "28px 0 16px" }}>3 signs your site is<br /><span className="a">costing you work.</span></h1>
    <div className="spacer"></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--border)", marginBottom: 52 }}>
      {SIGNS.map(([t, d], i) => (
        <div key={t} style={{ display: "flex", gap: 28, padding: "32px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "var(--amber)", letterSpacing: "-1px", lineHeight: 1, minWidth: 48 }}>{i + 1}</span>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.6px" }}>{t}</div>
            <div style={{ fontSize: 27, color: "var(--mid)", marginTop: 8, lineHeight: 1.4 }}>{d}</div>
          </div>
        </div>
      ))}
    </div>
    <BrandFooter right="Free audit · swift7.co.uk" />
  </div>
);

/* ---- Social branding: avatars + covers ---- */

/* Avatar A · brand mark (the "7" tile) — circle-safe */
const AvatarMark = () => (
  <div className="post sq" style={{ background: "var(--g950)", alignItems: "center", justifyContent: "center", padding: 0 }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 38%, rgba(168,201,74,0.16) 0%, transparent 62%)" }}></div>
    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontWeight: 900, fontSize: 620, lineHeight: 0.8, letterSpacing: "-30px", color: "var(--amber)" }}>7</div>
      <div style={{ fontWeight: 800, fontSize: 84, letterSpacing: "-2px", color: "var(--ink)", marginTop: 8 }}>Swift7</div>
    </div>
  </div>
);

/* Avatar B · founder face — personal brand, circle-safe */
const AvatarFace = () => (
  <div className="post sq" style={{ background: "var(--g950)", padding: 0, alignItems: "center", justifyContent: "center" }}>
    <img src="assets/callum-founder.webp" alt="Callum" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "68% 32%", transform: "scale(1.16)", transformOrigin: "68% 32%" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(15,34,25,0.92) 100%)" }}></div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 74, display: "flex", justifyContent: "center", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", background: "var(--amber)", color: "var(--g950)", padding: "20px 44px", borderRadius: 100, fontWeight: 900, fontSize: 52, letterSpacing: "-1.5px" }}>Swift7</div>
    </div>
  </div>
);

/* Cover A · brand banner (1500×500) — X / LinkedIn header */
const CoverBrand = () => (
  <div className="post cov pad-cov" style={{ background: "var(--g950)", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 56 }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 88% 50%, rgba(168,201,74,0.16) 0%, transparent 58%)" }}></div>
    <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
        <span style={{ fontWeight: 900, fontSize: 60, letterSpacing: "-2px", color: "var(--ink)" }}>Swift<span className="a">7</span></span>
        <span style={{ width: 1, height: 40, background: "var(--border2)" }}></span>
        <span style={{ fontSize: 24, fontWeight: 600, color: "var(--mid)", letterSpacing: "-0.3px" }}>Web design, Hull · UK-wide</span>
      </div>
      <h1 className="big" style={{ fontSize: 76 }}>A website that <span className="a">wins you work.</span></h1>
    </div>
    <div style={{ position: "relative", zIndex: 1, textAlign: "right", flexShrink: 0 }}>
      <div className="price" style={{ fontSize: 150, lineHeight: 0.85 }}><sup>£</sup>500</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--amber)", marginTop: 10, letterSpacing: "-0.3px" }}>all-in · live in 7 days</div>
    </div>
  </div>
);

/* Cover B · founder banner (1500×500) — Facebook / LinkedIn */
const CoverFounder = () => (
  <div className="post cov" style={{ background: "var(--g900)", flexDirection: "row", padding: 0 }}>
    <div style={{ flex: 1, padding: "0 84px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
      <span className="eyebrow" style={{ fontSize: 22, marginBottom: 22 }}><span className="dot"></span> Hi, I'm Callum</span>
      <h1 className="big" style={{ fontSize: 62 }}>I build sites that <span className="a">actually work.</span></h1>
      <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 30 }}>
        {[["£500", "all-in"], ["7 days", "to live"], ["5.0★", "rated"]].map(([n, l], i) => (
          <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: "var(--amber)", letterSpacing: "-1px" }}>{n}</span>
            <span style={{ fontSize: 22, color: "var(--mid)" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ width: 460, flexShrink: 0, overflow: "hidden", position: "relative" }}>
      <img src="assets/callum-founder.webp" alt="Callum MacInnes" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "66% 32%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--g900) 0%, transparent 24%)" }}></div>
    </div>
  </div>
);

/* ---- New batch · Editable/export-friendly templates ---- */
const PostAuditChecklist = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <span className="eyebrow"><span className="dot"></span> Free audit</span>
    <h1 className="big" style={{ fontSize: 82, margin: "30px 0 42px" }}>Want to know if your site is <span className="a">costing you work?</span></h1>
    <div style={{ display: "grid", gap: 20, marginBottom: 54 }}>
      {["Can people find you on Google?", "Does it work properly on mobile?", "Can visitors enquire in one tap?", "Does it look current and trusted?"].map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <Ic id="s7-shield" style={{ width: 38, height: 38, stroke: "var(--amber)", flexShrink: 0 }} />
          <span style={{ fontSize: 31, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>{t}</span>
        </div>
      ))}
    </div>
    <div className="spacer"></div>
    <BrandFooter right="Free audit · swift7.co.uk" />
  </div>
);

const PostSiteRefresh = () => (
  <div className="post sq" style={{ background: "var(--g900)", padding: 0 }}>
    <div style={{ height: 560, position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border2)" }}>
      <img src="assets/work-hull-cleaning.webp" alt="Replace with website screenshot" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--g900) 0%, rgba(27,53,40,0.28) 55%, transparent 100%)" }}></div>
      <span className="tag" style={{ position: "absolute", left: 72, bottom: 56 }}>Website refresh</span>
    </div>
    <div style={{ padding: "58px 72px 72px", display: "flex", flexDirection: "column", flex: 1 }}>
      <h1 className="big" style={{ fontSize: 76 }}>Still using the site you built in <span className="a">2019?</span></h1>
      <p style={{ fontSize: 31, color: "var(--faint)", lineHeight: 1.45, margin: "30px 0 0" }}>A modern site can make the same business feel instantly more trusted.</p>
      <div className="spacer"></div>
      <BrandFooter />
    </div>
  </div>
);

const PostBeforeAfter = () => (
  <div className="post sq pad" style={{ background: "var(--g950)" }}>
    <span className="eyebrow"><span className="dot"></span> Before / after</span>
    <h1 className="big" style={{ fontSize: 70, margin: "28px 0 36px" }}>From basic template to <span className="a">proper business website.</span></h1>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, flex: 1 }}>
      {[["Before", "assets/work-elland-road.webp"], ["After", "assets/work-jt-accountancy.webp"]].map(([label, img]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="shot" style={{ flex: 1 }}><img src={img} alt={`${label} website`} /></div>
          <div style={{ fontSize: 28, fontWeight: 900, color: label === "After" ? "var(--amber)" : "var(--mid)" }}>{label}</div>
        </div>
      ))}
    </div>
    <div style={{ height: 46 }}></div>
    <BrandFooter />
  </div>
);

const PostServiceSpotlight = () => (
  <div className="post sq pad" style={{ background: "var(--g900)" }}>
    <div className="brandrow">
      <span className="eyebrow"><span className="dot"></span> Built for trades</span>
      <span className="tag">SEO ready</span>
    </div>
    <div className="spacer"></div>
    <h1 className="big" style={{ fontSize: 86 }}>Plumbers. Roofers. Cleaners. <span className="a">Found on Google.</span></h1>
    <div style={{ height: 44 }}></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
      {["plumber near me", "roofer near me", "cleaner near me"].map((t) => (
        <div key={t} className="search" style={{ padding: "20px 22px", gap: 12 }}>
          <Ic id="s7-search" style={{ width: 28, height: 28 }} /><span className="txt" style={{ fontSize: 22 }}>{t}</span>
        </div>
      ))}
    </div>
    <div className="spacer"></div>
    <BrandFooter right="£500 · live in 7 days" />
  </div>
);

const PostSlots = () => (
  <div className="post sq pad wash" style={{ background: "var(--g950)" }}>
    <Logo />
    <div className="spacer"></div>
    <span className="chip" style={{ alignSelf: "flex-start", marginBottom: 34 }}><span className="live"></span> 2 launch slots open</span>
    <h1 className="big" style={{ fontSize: 118 }}>Need your site live <span className="a">next week?</span></h1>
    <p style={{ fontSize: 34, color: "var(--faint)", lineHeight: 1.45, maxWidth: 760, margin: "34px 0 0" }}>Send a quick brief today. Review on day 6. Go live on day 7.</p>
    <div className="spacer"></div>
    <BrandFooter right="Start at swift7.co.uk" />
  </div>
);

const PostQuoteImage = () => (
  <div className="post sq" style={{ background: "var(--g900)", padding: 0, flexDirection: "row" }}>
    <div style={{ width: "42%", position: "relative", overflow: "hidden", borderRight: "1px solid var(--border2)" }}>
      <img src="assets/callum-founder.webp" alt="Replace with client or founder photo" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "68% 34%", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,34,25,.72), transparent 60%)" }}></div>
    </div>
    <div style={{ flex: 1, padding: 70, display: "flex", flexDirection: "column" }}>
      <Stars />
      <div className="spacer"></div>
      <p className="quote" style={{ fontSize: 56 }}>“Fast, clear and exactly what my business needed.”</p>
      <div style={{ height: 34 }}></div>
      <div className="author">
        <div className="avatar">CM</div>
        <div><div className="aname">Client name</div><div className="abiz">Local business owner</div></div>
      </div>
      <div className="spacer"></div>
      <BrandFooter />
    </div>
  </div>
);

const StoryAudit = () => (
  <div className="post st pad-st" style={{ background: "var(--g950)" }}>
    <Logo />
    <div style={{ height: 130 }}></div>
    <span className="eyebrow"><span className="dot"></span> Free website audit</span>
    <h1 className="big" style={{ fontSize: 126, margin: "40px 0 0" }}>Is your site winning work or wasting clicks?</h1>
    <div className="spacer"></div>
    <div className="shot" style={{ flex: "none", height: 540 }}><img src="assets/work-apex-gym.webp" alt="Replace with website screenshot" /></div>
    <div style={{ height: 70 }}></div>
    <div className="cta" style={{ alignSelf: "stretch", justifyContent: "center", fontSize: 38 }}>Message for a free audit <Ic id="s7-bolt" /></div>
  </div>
);

const LandPortfolio = () => (
  <div className="post ls pad-ls" style={{ background: "var(--g950)", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 44, alignItems: "center" }}>
    <div>
      <span className="eyebrow" style={{ fontSize: 21 }}><span className="dot"></span> Recent work</span>
      <h1 className="big" style={{ fontSize: 60, margin: "22px 0 0" }}>A cleaner site. <span className="a">More trust.</span></h1>
      <p style={{ fontSize: 25, color: "var(--faint)", lineHeight: 1.45, margin: "24px 0 0" }}>Replace the image, edit the client name, export and post.</p>
    </div>
    <div className="shot" style={{ height: 450 }}><img src="assets/work-useforge.webp" alt="Replace with portfolio screenshot" /></div>
  </div>
);

const SWIFT7_SOCIAL_TEMPLATES = [
  { id: "avatar-mark", name: "Avatar · Mark", format: "Square", width: 1080, height: 1080, component: AvatarMark },
  { id: "avatar-face", name: "Avatar · Founder", format: "Square", width: 1080, height: 1080, component: AvatarFace },
  { id: "cover-brand", name: "Cover · Brand", format: "Cover", width: 1500, height: 500, component: CoverBrand },
  { id: "cover-founder", name: "Cover · Founder", format: "Cover", width: 1500, height: 500, component: CoverFounder },
  { id: "offer", name: "Offer", format: "Square", width: 1080, height: 1080, component: PostOffer },
  { id: "testimonial", name: "Testimonial", format: "Square", width: 1080, height: 1080, component: PostTestimonial },
  { id: "portfolio", name: "Portfolio", format: "Square", width: 1080, height: 1080, component: PostPortfolio },
  { id: "process", name: "How it works", format: "Square", width: 1080, height: 1080, component: PostProcess },
  { id: "urgency", name: "Urgency / CTA", format: "Square", width: 1080, height: 1080, component: PostUrgency },
  { id: "maths", name: "Them vs Us", format: "Square", width: 1080, height: 1080, component: PostMaths },
  { id: "statement", name: "Statement / hook", format: "Square", width: 1080, height: 1080, component: PostStatement },
  { id: "proof", name: "Stat / proof", format: "Square", width: 1080, height: 1080, component: PostStat },
  { id: "faq", name: "FAQ", format: "Square", width: 1080, height: 1080, component: PostFaq },
  { id: "launch", name: "Just launched", format: "Square", width: 1080, height: 1080, component: PostLaunch },
  { id: "whatsapp", name: "WhatsApp CTA", format: "Square", width: 1080, height: 1080, component: PostWhatsApp },
  { id: "found", name: "Found on Google", format: "Square", width: 1080, height: 1080, component: PostFound },
  { id: "included", name: "What's included", format: "Square", width: 1080, height: 1080, component: PostIncluded },
  { id: "founder", name: "Meet Callum", format: "Square", width: 1080, height: 1080, component: PostFounder },
  { id: "nosurprises", name: "No surprises", format: "Square", width: 1080, height: 1080, component: PostNoSurprises },
  { id: "signs", name: "3 signs", format: "Square", width: 1080, height: 1080, component: PostSigns },
  { id: "audit-checklist", name: "Audit checklist", format: "Square", width: 1080, height: 1080, component: PostAuditChecklist },
  { id: "site-refresh", name: "Website refresh", format: "Square", width: 1080, height: 1080, component: PostSiteRefresh },
  { id: "before-after", name: "Before / after", format: "Square", width: 1080, height: 1080, component: PostBeforeAfter },
  { id: "service-spotlight", name: "Service spotlight", format: "Square", width: 1080, height: 1080, component: PostServiceSpotlight },
  { id: "slots", name: "Launch slots", format: "Square", width: 1080, height: 1080, component: PostSlots },
  { id: "quote-image", name: "Quote + image", format: "Square", width: 1080, height: 1080, component: PostQuoteImage },
  { id: "case-cleaning", name: "Case · Hull Cleaning", format: "Square", width: 1080, height: 1080, component: PostCaseCleaning },
  { id: "case-useforge", name: "Case · UseForge", format: "Square", width: 1080, height: 1080, component: PostCaseUseForge },
  { id: "case-apex", name: "Case · Apex Strength", format: "Square", width: 1080, height: 1080, component: PostCaseApex },
  { id: "case-jt", name: "Case · JT Accountancy", format: "Square", width: 1080, height: 1080, component: PostCaseJT },
  { id: "ls-offer", name: "Landscape · Offer", format: "Landscape", width: 1200, height: 627, component: LandOffer },
  { id: "ls-quote", name: "Landscape · Quote", format: "Landscape", width: 1200, height: 627, component: LandQuote },
  { id: "ls-portfolio", name: "Landscape · Portfolio", format: "Landscape", width: 1200, height: 627, component: LandPortfolio },
  { id: "story-offer", name: "Story · Offer", format: "Story", width: 1080, height: 1920, component: StoryOffer },
  { id: "story-proof", name: "Story · Proof", format: "Story", width: 1080, height: 1920, component: StoryProof },
  { id: "story-audit", name: "Story · Audit", format: "Story", width: 1080, height: 1920, component: StoryAudit },
];

window.SWIFT7_SOCIAL_TEMPLATES = SWIFT7_SOCIAL_TEMPLATES;

function App() {
  return (
    <DesignCanvas>
      <DCSection id="branding" title="Profile & Branding" subtitle="Avatars (1080×1080) · cover banners (1500×500)">
        <DCArtboard id="avatar-mark" label="Avatar · Mark" width={1080} height={1080}><AvatarMark /></DCArtboard>
        <DCArtboard id="avatar-face" label="Avatar · Founder" width={1080} height={1080}><AvatarFace /></DCArtboard>
        <DCArtboard id="cover-brand" label="Cover · Brand" width={1500} height={500}><CoverBrand /></DCArtboard>
        <DCArtboard id="cover-founder" label="Cover · Founder" width={1500} height={500}><CoverFounder /></DCArtboard>
      </DCSection>
      <DCSection id="square" title="Swift7 — Social Posts" subtitle="Instagram / Facebook square · 1080×1080">
        <DCArtboard id="offer" label="Offer" width={1080} height={1080}><PostOffer /></DCArtboard>
        <DCArtboard id="testimonial" label="Testimonial" width={1080} height={1080}><PostTestimonial /></DCArtboard>
        <DCArtboard id="portfolio" label="Portfolio" width={1080} height={1080}><PostPortfolio /></DCArtboard>
        <DCArtboard id="process" label="How it works" width={1080} height={1080}><PostProcess /></DCArtboard>
        <DCArtboard id="urgency" label="Urgency / CTA" width={1080} height={1080}><PostUrgency /></DCArtboard>
        <DCArtboard id="maths" label="Them vs Us" width={1080} height={1080}><PostMaths /></DCArtboard>
        <DCArtboard id="statement" label="Statement / hook" width={1080} height={1080}><PostStatement /></DCArtboard>
        <DCArtboard id="proof" label="Stat / proof" width={1080} height={1080}><PostStat /></DCArtboard>
        <DCArtboard id="faq" label="FAQ" width={1080} height={1080}><PostFaq /></DCArtboard>
        <DCArtboard id="launch" label="Just launched" width={1080} height={1080}><PostLaunch /></DCArtboard>
        <DCArtboard id="whatsapp" label="WhatsApp CTA" width={1080} height={1080}><PostWhatsApp /></DCArtboard>
      </DCSection>
      <DCSection id="more" title="More Posts" subtitle="Get found · included · founder · pricing · tips · 1080×1080">
        <DCArtboard id="found" label="Found on Google" width={1080} height={1080}><PostFound /></DCArtboard>
        <DCArtboard id="included" label="What's included" width={1080} height={1080}><PostIncluded /></DCArtboard>
        <DCArtboard id="founder" label="Meet Callum" width={1080} height={1080}><PostFounder /></DCArtboard>
        <DCArtboard id="nosurprises" label="No surprises" width={1080} height={1080}><PostNoSurprises /></DCArtboard>
        <DCArtboard id="signs" label="3 signs" width={1080} height={1080}><PostSigns /></DCArtboard>
        <DCArtboard id="audit-checklist" label="Audit checklist" width={1080} height={1080}><PostAuditChecklist /></DCArtboard>
        <DCArtboard id="site-refresh" label="Website refresh" width={1080} height={1080}><PostSiteRefresh /></DCArtboard>
        <DCArtboard id="before-after" label="Before / after" width={1080} height={1080}><PostBeforeAfter /></DCArtboard>
        <DCArtboard id="service-spotlight" label="Service spotlight" width={1080} height={1080}><PostServiceSpotlight /></DCArtboard>
        <DCArtboard id="slots" label="Launch slots" width={1080} height={1080}><PostSlots /></DCArtboard>
        <DCArtboard id="quote-image" label="Quote + image" width={1080} height={1080}><PostQuoteImage /></DCArtboard>
      </DCSection>
      <DCSection id="cases" title="Case Studies" subtitle="Client → what we did → result · 1080×1080">
        <DCArtboard id="case-cleaning" label="Case · Hull Cleaning" width={1080} height={1080}><PostCaseCleaning /></DCArtboard>
        <DCArtboard id="case-useforge" label="Case · UseForge" width={1080} height={1080}><PostCaseUseForge /></DCArtboard>
        <DCArtboard id="case-apex" label="Case · Apex Strength" width={1080} height={1080}><PostCaseApex /></DCArtboard>
        <DCArtboard id="case-jt" label="Case · JT Accountancy" width={1080} height={1080}><PostCaseJT /></DCArtboard>
      </DCSection>
      <DCSection id="landscape" title="Landscape" subtitle="LinkedIn / X / Facebook link · 1200×627">
        <DCArtboard id="ls-offer" label="Landscape · Offer" width={1200} height={627}><LandOffer /></DCArtboard>
        <DCArtboard id="ls-quote" label="Landscape · Quote" width={1200} height={627}><LandQuote /></DCArtboard>
        <DCArtboard id="ls-portfolio" label="Landscape · Portfolio" width={1200} height={627}><LandPortfolio /></DCArtboard>
      </DCSection>
      <DCSection id="story" title="Stories" subtitle="Instagram / Facebook story · 1080×1920">
        <DCArtboard id="story-offer" label="Story · Offer" width={1080} height={1920}><StoryOffer /></DCArtboard>
        <DCArtboard id="story-proof" label="Story · Proof" width={1080} height={1920}><StoryProof /></DCArtboard>
        <DCArtboard id="story-audit" label="Story · Audit" width={1080} height={1920}><StoryAudit /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

if (!document.body.dataset.socialExporter) {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
