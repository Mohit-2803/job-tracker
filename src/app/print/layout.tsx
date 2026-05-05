import { Inter } from "next/font/google";

// Print-only layout. Overrides the app's Poppins (a display font, wrong vibe for
// a resume) with Inter — modern, ATS-friendly, prints crisply.
//
// Nested layouts in Next.js render INSIDE the root layout's <html><body>, so we
// just add an Inter className wrapper. CSS inheritance does the rest.

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={inter.className}>{children}</div>;
}
