import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/900-italic.css";
import "@fontsource-variable/archivo";
import "./globals.css";
import "@/components/cards/cards.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Line — share an NBA stat line",
  description: "Type a player. Get a shareable 9-cat fantasy stat line image from last night's game.",
  openGraph: { title: "Line — share an NBA stat line", description: "Type a player. Get a shareable 9-cat fantasy stat line image.", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#111110" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
