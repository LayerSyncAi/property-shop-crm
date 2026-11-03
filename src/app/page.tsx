import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";

// Signed-in visitors and white-label deployments are redirected in
// src/middleware.ts before this page renders.

export const metadata: Metadata = {
  title: "SyncEstate: run your agency from your pocket",
  description:
    "Leads, lettings, valuations, trust accounts and developments on one login, on the phone in your hand. Built in Zimbabwe by LayerSync.",
  openGraph: {
    title: "SyncEstate: run your agency from your pocket",
    description:
      "Leads, lettings, valuations, trust accounts and developments on one login, on the phone in your hand. Built in Zimbabwe by LayerSync.",
    images: [{ url: "/landing/og.jpg", width: 1200, height: 630 }],
  },
};

export default function Home() {
  return <Landing />;
}
