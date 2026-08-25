import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ALBUMS } from "../data/albums";

export default function MusicScreen() {
  // null = grid of album tiles; number = that album opened in split view.
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected === null ? null : ALBUMS[selected];
  const rootRef = useRef<HTMLDivElement>(null);

  // When the selected album changes (incl. switching albums inside the split
  // view), smoothly but quickly scroll the screen back to the top so the
  // updated player — which sits above the list on mobile — is in view.
  useEffect(() => {
    const el = rootRef.current?.closest(
      ".screen--content",
    ) as HTMLElement | null;
    if (!el) return;
    const start = el.scrollTop;
    if (start === 0) return;
    const duration = 250;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.scrollTop = start * (1 - eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [selected]);

  return (
    <div
      ref={rootRef}
      className={`screen__inner screen__inner--music${
        active !== null ? " screen__inner--fill" : ""
      }`}
    >
      <header className="music__head">
        <div className="music__head-titles">
          <p className="screen__eyebrow">Музыка</p>
          <h2 className="screen__title">{active ? active.title : "Альбомы"}</h2>
        </div>
        {active && (
          <button
            type="button"
            className="music__back"
            onClick={() => setSelected(null)}
          >
            ← Назад
          </button>
        )}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {active === null ? (
          <motion.ul
            key="grid"
            className="albums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {ALBUMS.map((album, i) => (
              <li className="album" key={album.id}>
                <button
                  type="button"
                  className="album__card"
                  onClick={() => setSelected(i)}
                >
                  <span className="album__cover">
                    {album.cover ? (
                      <img src={album.cover} alt={album.title} loading="lazy" />
                    ) : (
                      <span className="album__cover-ph" aria-hidden="true" />
                    )}
                    <span className="album__play" aria-hidden="true">
                      ▶
                    </span>
                  </span>
                  <span className="album__meta">
                    <span className="album__title">{album.title}</span>
                    <span className="album__year">
                      {album.year}
                      {album.type ? ` · ${album.type}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : (
          <motion.div
            key="split"
            className="music__split"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <aside className="music__list">
              <ul className="music__items">
                {ALBUMS.map((album, i) => (
                  <li key={album.id}>
                    <button
                      type="button"
                      className={`music__item${i === selected ? " is-active" : ""}`}
                      onClick={() => setSelected(i)}
                    >
                      <span className="music__item-cover">
                        {album.cover ? (
                          <img src={album.cover} alt="" loading="lazy" />
                        ) : (
                          <span className="album__cover-ph" aria-hidden="true" />
                        )}
                      </span>
                      <span className="music__item-meta">
                        <span className="music__item-title">{album.title}</span>
                        <span className="music__item-year">
                          {album.year}
                          {album.type ? ` · ${album.type}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="music__player">
              <div className="album-embed">
                <iframe
                  title={active.title}
                  src={active.embed}
                  frameBorder={0}
                  allow="clipboard-write"
                  width={614}
                  height={556}
                />
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
