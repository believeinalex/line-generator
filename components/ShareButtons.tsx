"use client";

import { useState } from "react";
import { CARD_H, CARD_W } from "./cards/data";

async function render(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  // Make sure web fonts and every image are ready, or the export can miss them.
  await document.fonts.ready;
  await Promise.all(
    [...node.querySelectorAll("img")].map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined))),
  );
  const opts = { width: CARD_W, height: CARD_H, pixelRatio: 1, style: { transform: "none" } };
  // Safari sometimes drops images on the first rasterisation; a throw-away warm-up pass fixes it.
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) await toBlob(node, opts);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error("render failed");
  return blob;
}

export function ShareButtons({ getNode, filename }: { getNode: () => HTMLElement | null; filename: string }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };

  async function run(kind: "download" | "copy" | "share") {
    const node = getNode();
    if (!node) return;
    setBusy(kind);
    try {
      if (kind === "copy") {
        // Pass a promise so Safari keeps the user-gesture context.
        await navigator.clipboard.write([new ClipboardItem({ "image/png": render(node) })]);
        flash("Copied — paste it in your chat");
      } else {
        const blob = await render(node);
        const file = new File([blob], filename, { type: "image/png" });
        if (kind === "share") {
          await navigator.share({ files: [file] });
        } else {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") flash("Couldn’t do that here — try Download");
    } finally {
      setBusy("");
    }
  }

  const canCopy = typeof ClipboardItem !== "undefined" && !!navigator.clipboard?.write;
  const canShare = typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files: [new File([], "x.png", { type: "image/png" })] });

  return (
    <div className="panel">
      <div className="actions">
        {canShare && (
          <button className="btn" disabled={!!busy} onClick={() => run("share")}>
            {busy === "share" ? "Preparing…" : "Share"}
          </button>
        )}
        {canCopy && (
          <button className={canShare ? "btn ghost" : "btn"} disabled={!!busy} onClick={() => run("copy")}>
            {busy === "copy" ? "Copying…" : "Copy image"}
          </button>
        )}
        <button className="btn ghost" disabled={!!busy} onClick={() => run("download")}>
          {busy === "download" ? "Rendering…" : "Download PNG"}
        </button>
      </div>
      <div className="note" style={{ textAlign: "center", marginTop: 10, minHeight: 20 }}>
        {msg}
      </div>
    </div>
  );
}
