import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import SmoothScrolling from "@/components/providers/SmoothScrolling";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

// 1. DM Sans: Warm, highly readable, geometric sans-serif
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// 2. JetBrains Mono: Technical metadata & code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// ==========================================
// ADVANCED JSON-LD SCHEMA FOR THE BLOG
// ==========================================
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Eklak Alam | Tech Blog",
  url: "https://blogs.eklak.site",
  description:
    "Keep up-to-date on the latest news, product launches, industry insights, and technical architecture by Eklak Alam.",
  author: {
    "@type": "Person",
    name: "Eklak Alam",
    url: "https://eklak.site",
    jobTitle: "Software Engineer",
    sameAs: [
      "https://x.com/eklak__alam",
      "https://github.com/Eklak-Alam",
      "https://www.linkedin.com/in/eklak-alam/",
    ],
  },
};

// ==========================================
// ADVANCED SEO METADATA
// ==========================================
export const metadata = {
  metadataBase: new URL("https://blogs.eklak.site"),
  title: {
    default: "Eklak Alam | Tech Blog & System Architecture",
    template: "%s | Eklak's Blog",
  },
  description:
    "Keep up-to-date on the latest news, product launches, industry insights, and technical architecture by Eklak.",
  keywords: [
    "System Architect",
    "Software Engineer",
    "Web Development",
    "Tech Blog",
    "Eklak Portfolio",
    "React",
    "Next.js",
    "Cloud DevOps",
    "TypeScript",
  ],
  authors: [{ name: "Eklak Alam", url: "https://eklak.site" }],
  creator: "Eklak Alam",
  publisher: "Eklak Alam",
  alternates: { canonical: "https://blogs.eklak.site" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blogs.eklak.site",
    title: "Eklak Alam | Tech Blog & System Architecture",
    description:
      "Keep up-to-date on the latest news, product launches, and industry insights.",
    siteName: "Eklak Tech Blog",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Eklak Alam - Tech Blog",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@eklak__alam",
    creator: "@eklak__alam",
    title: "Eklak Alam | Tech Blog & System Architecture",
    description:
      "Keep up-to-date on the latest news, product launches, and industry insights.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  applicationName: "Eklak Tech Blog",
  category: "technology",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900 selection:bg-black selection:text-white">
        {/* CUSTOM TOASTER WITH BRAND COLORS */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#f2f2f2", // Your preferred minimal bg
              color: "#1a1a1a",
              border: "1px solid #e5e5e5",
              fontWeight: "600",
              letterSpacing: "0.05em",
            },
            iconTheme: {
              primary: "#e8751a", // Your signature orange
              secondary: "#f2f2f2",
            },
          }}
        />

        {/* JSON-LD INJECTION */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />

        <QueryProvider>
          <AuthProvider>
            <SmoothScrolling>
              <Analytics />
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </SmoothScrolling>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
