import { SmokeScene } from "react-smoke";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

interface SmokeBackgroundProps {
  visible: boolean;
}

export default function SmokeBackground({ visible }: SmokeBackgroundProps) {
  const color = useMemo(() => new THREE.Color("#ffffff"), []);
  const bg = useMemo(() => new THREE.Color("#000000"), []);
  const [active, setActive] = useState(!document.hidden);

  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div className={`smoke-bg${visible ? " is-visible" : ""}`}>
      <SmokeScene
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.35]}
        scene={{ background: bg }}
        camera={{ fov: 60, position: [10, 0, 500], far: 6000 }}
        smoke={{
          color,
          density: 22,
          opacity: 0.2,
          size: [1200, 1200, 1200],
          enableRotation: true,
          rotation: [0, 0, 0.13],
          enableTurbulence: false,
          enableWind: true,
          windDirection: [0, 1, 0],
          windStrength: [0, 0.01, 0],
        }}
      />
    </div>
  );
}
