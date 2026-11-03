import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";
import { siteUrl } from "@/config/marketing";

// Signed-in visitors and white-label deployments are redirected in
// src/middleware.ts before this page renders.

const title = "SyncEstate: run your estate agency from your pocket";
const description =
  "Run your estate agency from your phone: leads, lettings, repairs, valuations, trust accounts and developments on one login. Built in Zimbabwe by LayerSync.";
const shareImage = {
  url: "/landing/og.jpg",
  width: 1200,
  height: 630,
  alt: "SyncEstate on a phone: the Hub showing what needs attention across an estate agency, under the headline Run your agency from your pocket.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { absolute: title },
  description,
  applicationName: "SyncEstate",
  keywords: [
    "estate agency software",
    "real estate CRM",
    "property management software",
    "Zimbabwe",
    "Harare",
    "lettings",
    "valuations",
    "trust accounting",
    "SyncEstate",
    "LayerSync",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SyncEstate",
    locale: "en_ZW",
    title,
    description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export default function Home() {
  return <Landing />;
}
