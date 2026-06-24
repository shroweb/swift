/* ============================================================
   Swift7 UI Kit — App (wires everything together)
   ============================================================ */

function App() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [showTop, setShowTop] = React.useState(false);
  const scrollRef = React.useRef(null);

  const start = () => setModalOpen(true);

  const navigate = (id) => {
    const root = scrollRef.current;
    if (!root) return;
    if (id === "top") { root.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = document.getElementById(id);
    if (el) root.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
  };

  React.useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => setShowTop(root.scrollTop > 600);
    root.addEventListener("scroll", onScroll);

    // scroll-reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
    }, { root, threshold: 0.12 });
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => { root.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  return (
    <div id="kit-scroll" ref={scrollRef}>
      <Nav onStart={start} onNavigate={navigate} />
      <Hero onStart={start} onNavigate={navigate} />
      <Ticker />
      <Offer />
      <Portfolio />
      <Process />
      <Why />
      <Testimonials />
      <About />
      <Pricing onStart={start} />
      <FAQ />
      <CTA onStart={start} />
      <Footer />
      <FloatingButtons showTop={showTop} onTop={() => navigate("top")} />
      <button id="kit-start" style={{ display: "none" }} onClick={start}></button>
      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
