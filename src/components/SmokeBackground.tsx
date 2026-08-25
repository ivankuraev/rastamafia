import { SmokeScene } from "react-smoke";
import { memo, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

interface SmokeBackgroundProps {
  visible: boolean;
}

function SmokeBackground({ visible }: SmokeBackgroundProps) {
  const color = useMemo(() => new THREE.Color("#ffffff"), []);
  const bg = useMemo(() => new THREE.Color("#000000"), []);
  const smoke = useMemo(
    () => ({
      color,
      density: 16,
      opacity: 0.9,
      size: [1000, 1000, 1000] as [number, number, number],
      enableRotation: true,
      rotation: [0, 0, 0.1] as [number, number, number],
      enableTurbulence: false,
      enableWind: true,
      windDirection: [0, 1, 0] as [number, number, number],
      windStrength: [0, 0.01, 0] as [number, number, number],
    }),
    [color],
  );
  const camera = useMemo(
    () => ({
      fov: 60,
      position: [10, 0, 500] as [number, number, number],
      far: 6000,
    }),
    [],
  );
  const scene = useMemo(() => ({ background: bg }), [bg]);
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
        scene={scene}
        camera={camera}
        smoke={smoke}
      />
    </div>
  );
}

export default memo(SmokeBackground);
