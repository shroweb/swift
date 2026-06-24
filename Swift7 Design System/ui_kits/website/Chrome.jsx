/* ============================================================
   Swift7 UI Kit — CTA · Footer · Floating buttons · Lead Modal
   ============================================================ */

function CTA({ onStart }) {
  return (
    <section id="cta">
      <div className="cta-inner reveal">
        <p className="cta-eyebrow">Stop putting it off</p>
        <h2>Live in 7 days.</h2>
        <p className="cta-sub">Get a free audit of your current site — or a plan for your first one. No pressure, no jargon.</p>
        <div className="cta-buttons">
          <button className="btn btn-lime btn-lg" onClick={onStart}>Get a free audit <IconArrowRight size={18} /></button>
          <button className="btn btn-whatsapp btn-lg" onClick={(e) => e.preventDefault()}><IconWhatsApp size={20} /> WhatsApp us</button>
        </div>
        <p className="cta-email" style={{ marginTop: 28, color: "rgba(240,240,236,0.7)", fontSize: 13 }}>
          Prefer email? <a href="mailto:hello@swift7.co.uk" style={{ color: "rgba(255,255,255,0.85)" }}>hello@swift7.co.uk</a> · 07380 218301
        </p>
      </div>
    </section>
  );
}

const FOOTER_COLS = [
  { label: "Swift7", links: ["What's Included", "How It Works", "Pricing", "Portfolio", "FAQ"] },
  { label: "Tiers", links: ["The Launch — £500", "WordPress — £500", "Swift7 Plus"] },
  { label: "Areas", links: ["Hull", "Leeds", "Sheffield", "York", "Beverley"] },
];

function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <img src="assets/logo.png" alt="Swift7" style={{ height: 26 }} />
          <p className="footer-tagline">Affordable web design for UK small businesses. £500 all-in, live in 7 days. Based in Hull, building for the whole UK.</p>
        </div>
        {FOOTER_COLS.map((c) => (
          <div key={c.label}>
            <p className="footer-col-label">{c.label}</p>
            <div className="footer-links">
              {c.links.map((l) => <a key={l} href="#" onClick={(e) => e.preventDefault()}>{l}</a>)}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>© 2026 Swift7. All rights reserved.</p>
        <p>hello@swift7.co.uk · 07380 218301</p>
      </div>
    </footer>
  );
}

function FloatingButtons({ showTop, onTop }) {
  return (
    <React.Fragment>
      <a className="wa-sticky" href="#" onClick={(e) => e.preventDefault()} aria-label="WhatsApp"><IconWhatsApp size={28} /></a>
      <button className={`back-to-top${showTop ? " visible" : ""}`} onClick={onTop} aria-label="Back to top">↑</button>
    </React.Fragment>
  );
}

/* ---- Lead capture modal ---- */
const BIZ_TYPES = ["Plumber", "Electrician", "Roofer", "Builder", "Cleaner", "Gym / fitness", "Accountant", "Other trade or service"];

function LeadModal({ open, onClose }) {
  const [done, setDone] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", biz: "", contact: "WhatsApp" });
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => { if (open) { setDone(false); setErrors({}); } }, [open]);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = true;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) er.email = true;
    setErrors(er);
    if (Object.keys(er).length === 0) setDone(true);
  };

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        {!done ? (
          <React.Fragment>
            <p className="modal-eyebrow">Free, no obligation</p>
            <h3>Get your free audit</h3>
            <p className="modal-sub">Tell me about your business and I'll send back a quick, honest plan — usually within a day.</p>
            <form onSubmit={submit}>
              <div className="form-field">
                <label>Your name</label>
                <input className={errors.name ? "error" : ""} value={form.name} onChange={upd("name")} placeholder="e.g. Sam Taylor" />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input className={errors.email ? "error" : ""} value={form.email} onChange={upd("email")} placeholder="you@business.co.uk" />
              </div>
              <div className="form-field">
                <label>Business type</label>
                <select value={form.biz} onChange={upd("biz")}>
                  <option value="">Select…</option>
                  {BIZ_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Best way to reach you</label>
                <select value={form.contact} onChange={upd("contact")}>
                  <option>WhatsApp</option><option>Email</option><option>Phone call</option>
                </select>
              </div>
              <button className="modal-submit" type="submit">Send my free audit request</button>
              <p className="modal-guarantee">No spam. No sales pitch. Just a useful plan.</p>
            </form>
          </React.Fragment>
        ) : (
          <div className="modal-success" style={{ display: "block" }}>
            <div className="success-icon">✓</div>
            <h3>Request received.</h3>
            <p>Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}. I'll review your details and get back to you on {form.contact.toLowerCase()} — usually within a day.</p>
            <button className="btn btn-lime" style={{ marginTop: 24 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CTA, Footer, FloatingButtons, LeadModal });
