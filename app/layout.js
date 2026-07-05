import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import SmoothScrolling from "@/components/providers/SmoothScrolling";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";

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
// ADVANCED SEO METADATA
// ==========================================
export const metadata = {
  metadataBase: new URL("https://yourdomain.com"), // TODO: Replace with your actual domain
  title: {
    default: "Eklak | System Architect & Developer",
    template: "%s | Eklak", // Automatically adds "| Eklak" to child pages
  },
  description: "Keep up-to-date on the latest news, product launches, industry insights, and technical architecture by Eklak.",
  keywords: [
    "System Architect", 
    "Software Engineer", 
    "Web Development", 
    "Tech Blog", 
    "Eklak Portfolio", 
    "React", 
    "Next.js"
  ],
  authors: [{ name: "Eklak" }],
  creator: "Eklak",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    title: "Eklak | System Architect & Developer",
    description: "Keep up-to-date on the latest news, product launches, and industry insights.",
    siteName: "Eklak Tech Blog",
    images: [
      {
        url: "/og-image.jpg", // TODO: Add a 1200x630px image in your public folder
        width: 1200,
        height: 630,
        alt: "Eklak - System Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eklak | System Architect & Developer",
    description: "Keep up-to-date on the latest news, product launches, and industry insights.",
    creator: "@yourtwitterhandle", // TODO: Add your X/Twitter handle
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
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning // Good practice when using third-party script/style injectors
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900 selection:bg-black selection:text-white">
        <QueryProvider>
          <AuthProvider>
            {/* Lenis Smooth Scrolling Wrapper */}
            <SmoothScrolling>
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </SmoothScrolling>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}