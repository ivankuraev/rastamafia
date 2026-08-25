import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties, Ref } from "react";
import LogoLayer from "./LogoLayer";

export type ScreenId = "home" | "book" | "music" | "contacts";

const ITEMS: { id: ScreenId; label: string }[] = [
  { id: "home", label: "Начало" },
  { id: "book", label: "Книга" },
  { id: "music", label: "Музыка" },
  { id: "contacts", label: "Контакты" },
];

interface NavProps {
  active: ScreenId;
  onSelect: (id: ScreenId) => void;
  visible: boolean;
  brandRef?: Ref<HTMLSpanElement>;
  menuOpen: boolean;
  onToggleMenu: () => void;
  isMobile: boolean;
  onLogoReady?: () => void;
}

// Pre-mounted logo for the centred hero on the Start screen (mobile only). It
// is shown ONLY on the "home" screen and is intentionally kept OUT of the
// burger menu — rendering it inside the overlay was what made it flicker /
// "проскакивать" and fail to show. It stays mounted (even while hidden) so
// returning to Start just fades it in instead of re-initialising the WebGL/SVG
// (which previously caused jank). z-index sits BELOW the burger overlay (15),
// so even mid-fade the overlay always paints over it.
const heroLogoStyle: CSSProperties = {
  transform: "translate(0px, 0px)",
  zIndex: 14,
  pointerEvents: "none",
};

export default function Nav({
  active,
  onSelect,
  visible,
  brandRef,
  menuOpen,
  onToggleMenu,
  isMobile,
  onLogoReady,
}: NavProps) {
  return (
    <>
      <nav
        className={`nav${visible ? " is-visible" : ""}${
          menuOpen ? " is-open" : ""
        }`}
      >
        <span
          className="nav__brand"
          ref={brandRef}
          role="button"
          tabIndex={0}
          onClick={() => onSelect("home")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect("home");
          }}
        >
          R▲ST▲ M▲FI▲
        </span>

        <ul className="nav__list">
          {ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav__item${isActive ? " is-active" : ""}`}
                  onClick={() => onSelect(item.id)}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="nav__pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="nav__label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className={`nav__burger${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
        >
          <span className="nav__burger-bar" />
          <span className="nav__burger-bar" />
          <span className="nav__burger-bar" />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="nav__menu">
              {ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav__menu-item${
                      active === item.id ? " is-active" : ""
                    }`}
                    onClick={() => onSelect(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-mounted mobile hero logo. Shown only on the Start screen and
          never inside the burger menu — that combination was what made it
          flicker / not appear. It is hidden on every non-home screen, and
          `menuMode` is ALWAYS on so the SVG3D canvas gets `pointer-events:
          none !important`. Without that, the (often invisible, z-index 14)
          layer would sit above `.screen--content` (z-index 5) and swallow
          every tap / scroll on the book & music screens. It stays mounted
          while hidden, so returning home just fades it back in (no WebGL/SVG
          re-init, no jerk). */}
      {isMobile && (
        <LogoLayer
          visible={active === "home" && !menuOpen}
          style={heroLogoStyle}
          menuMode
          onReady={onLogoReady}
        />
      )}
    </>
  );
}
