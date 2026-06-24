/* ============================================================
   Swift7 — Hero Variations (4 directions) on a design canvas
   Each artboard is a self-contained 1200×640 hero using the
   brand system + the custom Swift7 Line icon set.
   ============================================================ */

const SPRITE_URL = "assets/icons/swift7-icons.svg";

// Inject the icon sprite once so internal <use href="#id"> resolves.
fetch(SPRITE_URL).then(r => r.text()).then(txt => {
  document.getElementById("sprite").innerHTML = txt;
}).catch(() => {});

const Ic = ({ id, className = "hi" }) => (
  <svg className={className} aria-hidden="true"><use href={`#${id}`} /></svg>
);

// Typing search demo
function useTyping(words, speed = 70) {
  const [t, setT] = React.useState("");
  const ref = React.useRef({ w: 0, c: 0, del: false });
  React.useEffect(() => {
    let to;
    const tick = () => {
      const s = ref.current, word = words[s.w];
      if (!s.del) {
        s.c++; setT(word.slice(0, s.c));
        if (s.c === word.length) { s.del = true; to = setTimeout(tick, 1700); return; }
        to = setTimeout(tick, speed);
      } else {
        s.c--; setT(word.slice(0, s.c));
        if (s.c === 0) { s.del = false; s.w = (s.w + 1) % words.length; }
        to = setTimeout(tick, 34);
      }
    };
    to = setTimeout(tick, 500);
    return () => clearTimeout(to);
  }, []);
  return t;
}

const SearchDemo = ({ words }) => {
  const t = useTyping(words);
  return (
    <div className="search">
      <Ic id="s7-search" />
      <span className="txt">{t}<span className="cursor"></span></span>
    </div>
  );
};

const Stars = () => (
  <span className="stars">{Array.from({ length: 5 }).map((_, i) => (
    <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill="#A8C94A" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.2 6L12 17.9 6.5 19.6l1.2-6L3.2 9.4l6.1-.8L12 3Z" /></svg>
  ))}</span>
);

/* ---- A · Split (the signature layout) ---- */
function HeroA() {
  return (
    <div className="hv hvA" style={{ background: "var(--g900)" }}>
      <div>
        <div className="eyebrow"><span className="dot"></span> Live in 7 days · 3 slots left this month</div>
        <h1>A website that <span className="a">wins you work.</span></h1>
        <p className="sub">Professional, mobile-first sites for UK trades. £500 all-in, content &amp; SEO done for you.</p>
        <div className="actions">
          <button className="btn btn-lime">Get a free audit <Ic id="s7-bolt" className="hi" /></button>
          <button className="btn btn-out">View portfolio</button>
        </div>
        <div className="trust">
          <span><span className="ti">★</span> 5.0 on Google</span>
          <span><span className="ti">✓</span> 15+ years</span>
          <span><span className="ti">✓</span> You own it</span>
        </div>
      </div>
      <div className="card">
        <div className="cl">The Swift7 Launch</div>
        <div className="price"><sup>£</sup>500</div>
        <div className="pn">All-in. Live in 7 days.</div>
        {[["s7-pages", "Up to 10 pages, written for you"], ["s7-search", "On-page SEO + Google Profile"], ["s7-key", "You own it — domain & hosting"]].map(([ic, tx]) => (
          <div className="ck" key={tx}><Ic id={ic} /> {tx}</div>
        ))}
      </div>
    </div>
  );
}

/* ---- B · Centered statement + icon features ---- */
function HeroB() {
  return (
    <div className="hv hvB" style={{ background: "var(--g950)" }}>
      <div className="eyebrow"><span className="dot"></span> Affordable web design · £500 all-in</div>
      <h1>Be the business <span className="a">they find first.</span></h1>
      <p className="sub">A site that ranks on Google and wins you enquiries — live in seven days, every word written for you.</p>
      <SearchDemo words={["web designer near me", "affordable website hull", "best local plumber"]} />
      <div className="actions">
        <button className="btn btn-lime">Get a free audit <Ic id="s7-bolt" /></button>
        <button className="btn btn-wa"><Ic id="s7-chat" /> WhatsApp us</button>
      </div>
      <div className="features">
        {[["s7-seven-day", "Live in 7 days"], ["s7-pen", "Copy written for you"], ["s7-pin", "Found locally"], ["s7-shield", "7-day guarantee"]].map(([ic, tx]) => (
          <div className="feat" key={tx}><Ic id={ic} /><span className="ft">{tx}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ---- C · Image-led / proof ---- */
function HeroC() {
  return (
    <div className="hv hvC" style={{ background: "var(--g950)" }}>
      <div>
        <div className="eyebrow"><span className="dot"></span> Recent work · live &amp; earning</div>
        <h1>Real sites, for <span className="a">real trades.</span></h1>
        <p className="sub">Not mock-ups. Mobile-first websites built to get found and get enquiries — launched in a week.</p>
        <div className="actions">
          <button className="btn btn-lime">Get a free audit <Ic id="s7-bolt" /></button>
          <button className="btn btn-out">See the portfolio</button>
        </div>
        <div className="trust" style={{ marginTop: 28 }}>
          <span><Stars /> &nbsp;5.0 on Google</span>
          <span><span className="ti">✓</span> 40+ sites launched</span>
        </div>
      </div>
      <div className="shot">
        <img src="assets/work-jt-accountancy.webp" alt="Swift7 client site" />
        <div className="pricepill"><b>£500</b><span>All-in · 7 days</span></div>
      </div>
    </div>
  );
}

/* ---- D · Stat / price-forward ---- */
function HeroD() {
  const stats = [
    ["s7-tag", <span><sup>£</sup>500</span>, "All-in, one-off"],
    ["s7-seven-day", "7", "Days to live"],
    ["s7-star", "5.0", "Google rating"],
    ["s7-rocket", "40+", "Sites launched"],
  ];
  return (
    <div className="hv hvD" style={{ background: "var(--g900)" }}>
      <div className="eyebrow"><span className="dot"></span> The Swift7 Launch</div>
      <h1>Everything included. <span className="a">Nothing extra.</span></h1>
      <div className="statgrid">
        {stats.map(([ic, num, sl], i) => (
          <div className="stat" key={i}>
            <Ic id={ic} />
            <div className="num">{num}</div>
            <div className="sl">{sl}</div>
          </div>
        ))}
      </div>
      <div className="row">
        <button className="btn btn-lime">Get a free audit <Ic id="s7-bolt" /></button>
        <span className="note">No hidden fees · 50% upfront, 50% on completion</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="heroes" title="Swift7 — Hero Variations" subtitle="Four directions on the brand system · all use the custom Swift7 Line icons">
        <DCArtboard id="a" label="A · Split (signature)" width={1200} height={640}><HeroA /></DCArtboard>
        <DCArtboard id="b" label="B · Centered + icon features" width={1200} height={640}><HeroB /></DCArtboard>
        <DCArtboard id="c" label="C · Image-led / proof" width={1200} height={640}><HeroC /></DCArtboard>
        <DCArtboard id="d" label="D · Stat / price-forward" width={1200} height={640}><HeroD /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
