import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import "../styles/globals.css";

let title = "Unoform Kitchen Designer";
let description = "Transform your kitchen with Unoform's signature Danish design - clean lines, natural materials, and timeless elegance.";
let ogimage = "https://genai-kitchen.vercel.app/og-image.png";
let sitename = "Unoform Kitchen Designer";

export const metadata: Metadata = {
  metadataBase: new URL('https://genai-kitchen.vercel.app'),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: "https://genai-kitchen.vercel.app",
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-unoform-white text-unoform-black font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
