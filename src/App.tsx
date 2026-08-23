import { useEffect, useRef, useState } from "react";
import SmokeBackground from "./components/SmokeBackground";
import LogoLayer from "./components/LogoLayer";
import "./styles.css";

const MIN_REVEAL_MS = 2000;
const MAX_WAIT_MS = 6000;

export default function App() {
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const startRef = useRef(performance.now());

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

  return (
    <main className="app">
      <SmokeBackground visible={revealed} />
      <LogoLayer onReady={() => setReady(true)} visible={revealed} />
      <div className={`watermark${revealed ? " hidden" : ""}`} aria-hidden="true">
        R▲ST▲M▲FI▲
      </div>
    </main>
  );
}
