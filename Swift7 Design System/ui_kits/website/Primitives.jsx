/* ============================================================
   Swift7 UI Kit — shared primitives & icons
   Lucide-style line icons (2px stroke) inlined as small components,
   plus the brand WhatsApp/Google glyphs. Exposed on window.
   ============================================================ */

const Icon = ({ d, size = 18, fill = "none", stroke = "currentColor", sw = 2, children, vb = "0 0 24 24", style }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>;
const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>;
const IconPhone = (p) => <Icon {...p} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />;
const IconShield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icon>;
const IconStar = ({ size = 14, color = "#A8C94A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </svg>
);
const Stars = ({ n = 5, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: 3 }}>{Array.from({ length: n }).map((_, i) => <IconStar key={i} size={size} />)}</span>
);
const IconWhatsApp = ({ size = 22, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.27-.1-.46-.15-.65.15s-.74.94-.9 1.13c-.17.2-.34.22-.63.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.67-2.07c-.17-.3 0-.46.13-.6.13-.14.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49l-.55-.01a1.06 1.06 0 0 0-.77.36c-.26.29-1 .98-1 2.4s1.03 2.78 1.17 2.97c.14.2 2.02 3.08 4.9 4.32.68.3 1.22.47 1.63.6.69.22 1.31.19 1.8.12.55-.08 1.7-.7 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.2-.55-.34zM12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.1 1.52 5.83L.06 23.88l6.2-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0zm0 21.8a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.97 1-3.63-.24-.37A9.8 9.8 0 1 1 12 21.8z" />
  </svg>
);
const IconGoogle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

/* Button — variants match the brand. */
const Button = ({ variant = "lime", size, className = "", children, ...rest }) => (
  <button className={`btn btn-${variant}${size ? " btn-" + size : ""} ${className}`} {...rest}>{children}</button>
);

Object.assign(window, {
  Icon, IconSearch, IconArrowRight, IconPhone, IconShield, IconClock,
  IconStar, Stars, IconWhatsApp, IconGoogle, Button,
});
