export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padEnd(6, "0");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Relative luminance 0..1 */
export function luminance(hex: string): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** "#000" or "#fff" for text drawn on top of `hex`. */
export function inkOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#0b0b0b" : "#ffffff";
}

/**
 * Pick a team color that has enough presence to be an accent:
 * not near-black, not near-white. Falls back to the alternate, then a default.
 */
export function accentFor(color: string, alt: string, fallback = "#e8472b"): string {
  for (const c of [color, alt]) {
    const l = luminance(c);
    if (l > 0.06 && l < 0.7) return `#${c.replace("#", "")}`;
  }
  return fallback;
}
