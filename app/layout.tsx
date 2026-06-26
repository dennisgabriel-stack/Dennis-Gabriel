import type { Metadata } from "next";
import { Space_Grotesk, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import SoundManager from "@/components/sound/SoundManager";
import TapBurst from "@/components/TapBurst";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dennis Gabriel — Full-Stack & Blockchain Developer",
  description:
    "Dennis Gabriel — Full-Stack & Blockchain Developer mit Schwerpunkt KI, Automatisierung und Grafik-Design. Next.js, React, Node, PostgreSQL, Solana.",
  openGraph: {
    title: "Dennis Gabriel — Full-Stack & Blockchain Developer",
    description:
      "KI · Automatisierung · Kreativ-Design · Full-Stack & Blockchain Engineering.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${display.variable} ${sans.variable} ${serif.variable}`}
    >
      <body className="font-sans antialiased grain">
        <SmoothScroll>{children}</SmoothScroll>
        <SoundManager />
        <TapBurst />
      </body>
    </html>
  );
}
