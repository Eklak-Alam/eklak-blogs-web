import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";

// 1. DM Sans: Warm, highly readable, geometric sans-serif
// Perfect for long-form reading and premium, approachable UI
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  // DM Sans supports variable font weights automatically!
});

// 2. JetBrains Mono: Keeping this for any code snippets or technical metadata
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Eklak | System Architect",
  description: "Keep up-to-date on the latest news, product launches, and industry insights.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <QueryProvider>
        <AuthProvider>
          <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900 selection:bg-zinc-200">
            <Navbar />
            {children}
            <Footer />
          </body>
        </AuthProvider>
      </QueryProvider>
    </html>
  );
}