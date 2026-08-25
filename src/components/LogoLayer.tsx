import { SVG3D } from "3dsvg";
import type { CSSProperties } from "react";

interface LogoLayerProps {
  onReady?: () => void;
  visible: boolean;
  style?: CSSProperties;
  size?: number;
  flying?: boolean;
  // On mobile the logo only appears (in the burger menu / on home) and must
  // not animate its transform — otherwise it visibly slides when the menu
  // opens/closes. Keep only the opacity transition in this mode.
  menuMode?: boolean;
}

export default function LogoLayer({
  onReady,
  visible,
  style,
  size,
  flying,
  menuMode,
}: LogoLayerProps) {
  // Mobile hero (Начало) default: ~3% larger than before for better presence.
  const dim = size ? `${size}px` : "min(106vmin, 99vw)";
  // Camera fills ~77% of the canvas at zoom=5.6 (leaves margin for tilt when
  // flown) and ~54% at zoom=8 (comfortable hero on the start screen).
  const zoom = flying ? 5.6 : 8;
  return (
    <div
      className={`logo-layer${visible ? " is-visible" : ""}${
        flying ? " is-flying" : ""
      }${menuMode ? " logo-layer--menu" : ""}`}
      style={style}
    >
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
        fov={50}
        zoom={zoom}
        width={dim}
        height={dim}
        onReady={onReady}
      />
    </div>
  );
}
