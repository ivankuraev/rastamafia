import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SmokeBackground from "./components/SmokeBackground";
import Nav, { type ScreenId } from "./components/Nav";
import LogoLayer from "./components/LogoLayer";
import BookScreen from "./screens/BookScreen";
import MusicScreen from "./screens/MusicScreen";
import ContactsScreen from "./screens/ContactsScreen";
import "./styles.css";

const MIN_REVEAL_MS = 2000;
const MAX_WAIT_MS = 6000;
const MOBILE_QUERY = "(max-width: 760px)";

function useIsMobile(query: string) {
  const [match, setMatch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = () => setMatch(m.matches);
    handler();
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);
  return match;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState<ScreenId>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile(MOBILE_QUERY);
  const startRef = useRef(performance.now());
  const brandRef = useRef<HTMLSpanElement>(null);
  const screenRef = useRef<HTMLElement>(null);
  // Start with pointer-events: none so that on mobile (where the placement
  // effect early-returns and never overrides it) the full-screen logo layer
  // never intercepts clicks. The desktop branch of the effect replaces this
  // style and restores interactivity where needed.
  const [logoStyle, setLogoStyle] = useState<CSSProperties>({
    pointerEvents: "none",
  });
  const [logoSize, setLogoSize] = useState<number | undefined>(undefined);
  const [logoFlying, setLogoFlying] = useState(false);

  useEffect(() => {
    const fallback = setTimeout(() => setReady(true), MAX_WAIT_MS);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const elapsed = performance.now() - startRef.current;
    const wait = Math.max(0, MIN_REVEAL_MS - elapsed);
    const t = setTimeout(() => setRevealed(true), wait);
    return () => clearTimeout(t);
  }, [ready]);

  // Close the burger menu when leaving mobile (e.g. on resize to desktop).
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  // Logo behaviour differs on mobile vs desktop:
  // - Desktop: the 3D logo flies under the brand text when a screen is open.
  // - Mobile: the global logo is only the home hero (centered). It never flies
  //   to the header, and a pre-mounted instance lives in the burger menu. The
  //   App-level logo is therefore not rendered on mobile at all — this avoids an
  //   always-on, hidden WebGL context on every other screen.
  useEffect(() => {
    if (isMobile) return;

    // Desktop: fly the logo under the brand text (or center on home).
    if (active === "home") {
      setLogoStyle({ transform: "translate(0px, 0px)", zIndex: 6 });
      setLogoSize(undefined);
      setLogoFlying(false);
      return;
    }
    let raf = 0;
    let ticking = false;
    const place = () => {
      const el = brandRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const bw = r.width;
      const FILL = 0.766;
      const maxDim = Math.min(window.innerWidth, window.innerHeight) * 1.03;
      const size = Math.max(28, Math.min(bw / FILL, maxDim));
      const logoH = 0.935 * bw;
      const targetCx = r.left + bw / 2;
      const targetCy = r.bottom + logoH / 2 + 14;
      const dx = targetCx - window.innerWidth / 2;
      const dy = targetCy - window.innerHeight / 2;
      setLogoStyle({ transform: `translate(${dx}px, ${dy}px)`, zIndex: 6 });
      setLogoSize(size);
      setLogoFlying(true);
    };
    // Throttle scroll/resize to one update per animation frame so we don't
    // churn React state (and re-render) on every scroll event.
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        place();
        ticking = false;
      });
    };
    raf = requestAnimationFrame(place);
    window.addEventListener("resize", schedule);
    const screen = screenRef.current;
    if (screen) screen.addEventListener("scroll", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      if (screen) screen.removeEventListener("scroll", schedule);
    };
  }, [active, revealed, isMobile, menuOpen]);

  // reset content scroll on every navigation
  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = 0;
  }, [active]);

  const handleNav = (id: ScreenId) => {
    setActive(id);
    setMenuOpen(false);
  };

  // On mobile the logo is shown as the home hero and inside the burger menu
  // (handled by a separate instance there), but never flies to the header
  // during navigation between content screens.
  const logoVisible =
    revealed && (!isMobile || (active === "home" && !menuOpen));

  return (
    <div className="app">
      {!isMobile && (
        <LogoLayer
          visible={logoVisible}
          onReady={() => setReady(true)}
          style={logoStyle}
          size={logoSize}
          flying={logoFlying}
          menuMode={isMobile}
        />
      )}
      <Nav
        active={active}
        onSelect={handleNav}
        visible={revealed}
        brandRef={brandRef}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        isMobile={isMobile}
        onLogoReady={() => setReady(true)}
      />

      <AnimatePresence mode="wait">
        {active !== "home" && (
          <motion.main
            key={active}
            ref={screenRef}
            className="screen screen--content"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {active === "book" && <BookScreen />}
            {active === "music" && <MusicScreen />}
            {active === "contacts" && <ContactsScreen />}
          </motion.main>
        )}
      </AnimatePresence>

      <SmokeBackground visible={revealed} />

      <div className={`watermark${revealed ? " hidden" : ""}`} aria-hidden="true">
        RASTA MAFIA
      </div>
    </div>
  );
}
