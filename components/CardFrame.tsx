"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { CARD_H, CARD_W } from "./cards/data";

/** Renders children (a 1080×1350 card) scaled to the container width. `ref` points at the unscaled card node for export. */
export const CardFrame = forwardRef<HTMLDivElement, { children: React.ReactNode; loading?: boolean }>(function CardFrame(
  { children, loading },
  cardRef,
) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / CARD_W));
    ro.observe(el);
    setScale(el.clientWidth / CARD_W);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className={`frame card-root${loading ? " loading" : ""}`} style={{ height: CARD_H * scale }}>
      <div className="frame-inner" style={{ transform: `scale(${scale})` }}>
        <div ref={cardRef} style={{ width: CARD_W, height: CARD_H }}>
          {children}
        </div>
      </div>
    </div>
  );
});
