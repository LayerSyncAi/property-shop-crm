/**
 * The SyncEstate landing page. Spec: docs/landing/MASTER_SPEC.md.
 * Server component; interactive pieces are client islands.
 */
import { Geist_Mono } from "next/font/google";
import "./landing.css";
import { Nav } from "./nav";
import { Hero } from "./hero";
import { noFlashScript, ROOT_ID } from "./theme";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
});

export function Landing() {
  return (
    <div id={ROOT_ID} className={`landing ${geistMono.variable}`} data-theme="dark" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      <a href="#main" className="l-skip">
        Skip to content
      </a>
      <div aria-hidden className="l-grain" />
      <Nav />
      <main id="main">
        <Hero />
      </main>
    </div>
  );
}
