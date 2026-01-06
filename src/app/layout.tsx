import type { Metadata } from "next";
import "./globals.css";
import { Inter, Sora } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PeerPlates",
  description: "Peer-to-peer food platform waitlist",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} w-full overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body
        className="font-sans w-full overflow-x-hidden bg-white text-slate-900 antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
