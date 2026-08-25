import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { BOOKS } from "../data/books";

const ASPECT = 945 / 1181; // portrait source ratio
const GAP = 0;

type View = "hero" | "ribbon" | "lightbox";

// Cards are laid out left-to-right in a flex ribbon. "hero" variant: every card
// sits under the cover at the stage centre (the cover, index 0, is the only
// visible one). "ribbon" variant: cards sit in their own slots. On open the
// cover slides left to slot 0 while the rest fan out to the right in order.
const childVariants: Variants = {
  hero: (c: { i: number; w: number; cardW: number }) => {
    const centerX = c.w / 2 - c.cardW / 2;
    return {
      x: centerX - c.i * (c.cardW + GAP),
      opacity: c.i ? 0 : 1,
      transition: { duration: 0.45, ease: "easeOut" },
    };
  },
  ribbon: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const parentVariants: Variants = {
  hero: { transition: { staggerChildren: 0.07, staggerDirection: -1 } },
  ribbon: {
    transition: { staggerChildren: 0.07, staggerDirection: 1, delayChildren: 0.03 },
  },
};

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={dir === "left" ? "M15 4 8 12l7 8" : "M9 4l7 8-7 8"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BookScreen() {
  const [bookIdx, setBookIdx] = useState(0);
  const IMAGES = BOOKS[bookIdx]?.images ?? [];
  const [view, setView] = useState<View>("hero");
  const [index, setIndex] = useState(0);
  const [dims, setDims] = useState({ w: 0, cardW: 0 });

  const ribbonRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const indexRef = useRef(index);
  indexRef.current = index;
  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const touchX = useRef<number | null>(null);

  // Scroll the ribbon so card `i` is centred (clamped to the ends so the first
  // and last cards rest at the window edges instead of being forced to centre).
  const scrollToIndex = useCallback((i: number) => {
    const el = ribbonRef.current;
    if (!el) return;
    const cardW = dimsRef.current.cardW || 1;
    const padL = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const cardLeft = padL + i * cardW;
    const max = el.scrollWidth - el.clientWidth;
    let target = cardLeft - (el.clientWidth - cardW) / 2;
    target = Math.max(0, Math.min(max, target));
    el.scrollLeft = target;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      indexRef.current = i;
      setIndex(i);
      scrollToIndex(i);
    },
    [scrollToIndex],
  );
  const prev = useCallback(
    () => goTo((indexRef.current - 1 + IMAGES.length) % IMAGES.length),
    [goTo, IMAGES.length],
  );
  const next = useCallback(
    () => goTo((indexRef.current + 1) % IMAGES.length),
    [goTo, IMAGES.length],
  );

  // Whether we can click a card (a drag should not count as a click).
  const onCardClick = (i: number) => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    if (viewRef.current === "hero") setView("ribbon");
    else if (viewRef.current === "ribbon") {
      indexRef.current = i;
      setIndex(i);
      setView("lightbox");
      scrollToIndex(i);
    }
  };

  // Step back one level: lightbox -> ribbon -> hero (original Book state).
  // Collapsing the ribbon back to the cover must reset the index, otherwise
  // reopening from the cover would jump to where the lightbox was last closed
  // instead of starting at the beginning of the strip.
  const stepBack = () => {
    if (viewRef.current === "ribbon") setIndex(0);
    setView((v) => (v === "lightbox" ? "ribbon" : "hero"));
  };

  // Switch to another book and reset to its cover.
  const selectBook = (i: number) => {
    setBookIdx(i);
    setIndex(0);
    setView("hero");
  };

  // Measure card width (portrait) for the open/close transform math.
  useLayoutEffect(() => {
    const el = ribbonRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight || 1;
      setDims({ w: el.clientWidth, cardW: h * ASPECT });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // On enter: hero -> start; ribbon -> centre on the current image so the
  // ribbon follows the lightbox and closes back onto the last viewed card.
  useEffect(() => {
    if (!ribbonRef.current) return;
    if (view === "hero") ribbonRef.current.scrollLeft = 0;
    else if (view === "ribbon") scrollToIndex(index);
  }, [view, index, scrollToIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stepBack();
      } else if (viewRef.current === "lightbox") {
        if (e.key === "ArrowLeft") prev();
        else if (e.key === "ArrowRight") next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // Drag-to-scroll the ribbon. Touch devices use the browser's native
  // horizontal pan (touch-action: pan-x) for a free, momentum-backed drag, so
  // here we only drive `scrollLeft` manually for mouse. For every pointer type
  // we still flag a real drag so a swipe doesn't count as a card click.
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!ribbonRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 5) moved.current = true;
    if (e.pointerType === "mouse") {
      ribbonRef.current.scrollLeft = startScroll.current - dx;
    }
  }, []);
  const onPointerUp = useCallback(() => {
    dragging.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (viewRef.current !== "ribbon" || !ribbonRef.current) return;
      dragging.current = true;
      moved.current = false;
      startX.current = e.clientX;
      startScroll.current = ribbonRef.current.scrollLeft;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchX.current = null;
  };

  return (
    <div className="screen__inner book">
      <p className="screen__eyebrow">Децл</p>
      <h2 className="screen__title">Книга</h2>

      {BOOKS.length > 1 && (
        <div className="book__tabs" role="tablist">
          {BOOKS.map((book, i) => (
            <button
              type="button"
              key={book.id}
              className={`book__tab${i === bookIdx ? " is-active" : ""}`}
              role="tab"
              aria-selected={i === bookIdx}
              onClick={() => selectBook(i)}
            >
              {book.title}
            </button>
          ))}
        </div>
      )}

      <motion.div
        ref={ribbonRef}
        className={`book__ribbon${view === "hero" ? " is-hero" : ""}`}
        variants={parentVariants}
        initial="hero"
        animate={view === "lightbox" ? "ribbon" : view}
        onPointerDown={onPointerDown}
      >
        {IMAGES.map((src, i) => {
          const isCover = i === 0;
          const interactive = view === "ribbon" || (view === "hero" && isCover);
          return (
            <motion.button
              type="button"
              key={`${bookIdx}-${i}`}
              className="book__card"
              style={{ pointerEvents: interactive ? "auto" : "none" }}
              variants={childVariants}
              custom={{ i, w: dims.w, cardW: dims.cardW }}
              onClick={() => onCardClick(i)}
              aria-label={isCover ? "Подробнее" : `Открыть фото ${i + 1}`}
            >
              <img src={src} alt={`Книга ${i + 1}`} loading="lazy" draggable={false} />
              {isCover && view === "hero" && (
                <span className="book__hint">Подробнее ↓</span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {view === "lightbox" && (
            <motion.div
              className="book__lightbox"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <button
                className="book__back"
                onClick={stepBack}
                aria-label="Назад к галерее"
              >
                ← Назад
              </button>

              <motion.img
                key={index}
                className="book__full"
                src={IMAGES[index]}
                alt={`Книга ${index + 1}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              />

              <div className="book__nav-bar">
                <button
                  className="book__nav book__nav--prev"
                  onClick={prev}
                  aria-label="Предыдущее фото"
                >
                  <ArrowIcon dir="left" />
                </button>
                <span className="book__counter">
                  {index + 1} / {IMAGES.length}
                </span>
                <button
                  className="book__nav book__nav--next"
                  onClick={next}
                  aria-label="Следующее фото"
                >
                  <ArrowIcon dir="right" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
