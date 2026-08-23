import { SVG3D } from "3dsvg";

interface LogoLayerProps {
  onReady?: () => void;
  visible: boolean;
}

export default function LogoLayer({ onReady, visible }: LogoLayerProps) {
  return (
    <div className={`logo-layer${visible ? " is-visible" : ""}`}>
      <SVG3D
        svg="/rastamafia.svg"
        material="glass"
        color="#ffffff"
        depth={1.0}
        smoothness={0.4}
        animate="none"
        interactive
        intro="none"
        draggable={false}
        cursorOrbit
        orbitStrength={0.1}
        resetOnIdle
        resetDelay={3}
        lightPosition={[5, 8, 5]}
        lightIntensity={1.2}
        ambientIntensity={0.4}
        shadow={false}
        background="transparent"
        width="min(103vmin, 96vw)"
        height="min(103vmin, 96vw)"
        onReady={onReady}
      />
    </div>
  );
}
