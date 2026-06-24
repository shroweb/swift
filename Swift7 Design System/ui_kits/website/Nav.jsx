/* ============================================================
   Swift7 UI Kit — Nav (sticky) + mobile menu
   ============================================================ */

const NAV_LINKS = [
  { label: "What's Included", id: "offer" },
  { label: "How It Works", id: "process" },
  { label: "Pricing", id: "pricing" },
  { label: "Portfolio", id: "portfolio" },
  { label: "FAQ", id: "faq" },
];

function Nav({ onStart, onNavigate }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const el = document.getElementById("kit-scroll");
    const onScroll = () => setScrolled((el ? el.scrollTop : window.scrollY) > 8);
    const target = el || window;
    target.addEventListener("scroll", onScroll);
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => { setMobileOpen(false); onNavigate?.(id); };

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <div className="nav-inner">
        <a className="logo" href="#" onClick={(e) => { e.preventDefault(); go("top"); }}>
          <img src="assets/logo.png" alt="Swift7" />
        </a>
        <div className="nav-right">
          {NAV_LINKS.map((l) => (
            <button key={l.id} className="nav-link" onClick={() => go(l.id)}>{l.label}</button>
          ))}
          <button className="nav-link plus" onClick={() => go("pricing")}>Swift7 Plus</button>
          <button className="btn btn-nav" onClick={onStart}>Get a free audit</button>
        </div>
        <button className={`nav-hamburger${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
      {mobileOpen && (
        <div className="mobile-nav open">
          {NAV_LINKS.map((l) => (
            <button key={l.id} onClick={() => go(l.id)}>{l.label}</button>
          ))}
          <button onClick={() => go("pricing")} style={{ color: "var(--amber)" }}>Swift7 Plus</button>
          <button className="mobile-nav-cta" onClick={() => { setMobileOpen(false); onStart(); }}>Get a free audit</button>
          <a className="mobile-nav-wa" href="#" onClick={(e) => e.preventDefault()}>
            <IconWhatsApp size={18} /> WhatsApp us
          </a>
        </div>
      )}
    </nav>
  );
}

window.Nav = Nav;
