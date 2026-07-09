"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { ArrowUpRight, Mail, X } from "lucide-react";

// Your provided social links array
const socialLinks = [
  { 
    name: "LinkedIn", 
    icon: <FaLinkedin className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />, 
    url: "https://www.linkedin.com/in/eklak-alam/" 
  },
  { 
    name: "GitHub", 
    icon: <FaGithub className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />, 
    url: "https://github.com/Eklak-Alam" 
  },
  { 
    name: "X (Twitter)", 
    icon: <X className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />, 
    url: "https://x.com/eklak__alam" 
  },
  { 
    name: "Email Me", 
    icon: <Mail className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />, 
    url: "mailto:hello@eklak.site" 
  },
];

export default function Footer() {
  const pathname = usePathname();

  // HIDE FOOTER ON SPECIFIC ROUTES
  const hiddenRoutes = [
    "/login",
    "/register",
    "/verify",
    "/dashboard",
    "/admin",
    "/writer",
    "/editor",
    "/author",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const shouldHideFooter = hiddenRoutes.some((route) => pathname.startsWith(route));

  if (shouldHideFooter) return null;

  return (
    <footer className="w-full bg-[#111111] text-white py-16 md:py-24 border-t border-zinc-800/80 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between gap-16 md:gap-8"
        >
          {/* ========================================
              LEFT: Brand Logo & Bio
              ======================================== */}
          <div className="flex flex-col max-w-sm">
            {/* Raw Logo - No backgrounds, no shadows, fully responsive */}
            <Link href="/" className="inline-block mb-6 transition-opacity hover:opacity-70">
              <Image
                src="/logo-new-white.png" // Make sure this points to your light/white logo for the dark background!
                alt="Eklak Logo" 
                width={160} 
                height={50} 
                className="w-[120px] md:w-[150px] h-auto object-contain"
                priority
              />
            </Link>
            
            <p className="text-[15px] leading-relaxed mb-8 text-zinc-400">
              A digital craftsman building minimal, high-performance web experiences. Available for freelance opportunities.
            </p>
            
            <a 
              href="mailto:hello@eklak.site" 
              className="group inline-flex items-center gap-2 text-[15px] font-medium text-white w-fit"
            >
              <span className="relative pb-1 border-b border-zinc-700 group-hover:border-white transition-colors duration-300">
                hello@eklak.site
              </span>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
            </a>
          </div>

          {/* ========================================
              RIGHT: Clean Link Columns
              ======================================== */}
          <div className="flex gap-16 sm:gap-24">
            <FooterColumn 
              title="Navigation"
              links={[
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
                { name: "Work", href: "/work" },
                { name: "Services", href: "/services" },
                { name: "Contact", href: "/contact" },
              ]}
            />
            <FooterColumn 
              title="Legal"
              links={[
                { name: "Privacy", href: "/privacy" },
                { name: "Terms", href: "/terms" },
                { name: "Imprint", href: "/imprint" },
              ]}
            />
          </div>
        </motion.div>

        {/* ========================================
            BOTTOM: Copyright, Location & Social Icons
            ======================================== */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 pt-8 border-t border-zinc-800/80 flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-8 text-[14px]"
        >
          {/* Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-zinc-400">
            <p className="text-white">© {new Date().getFullYear()} Eklak Alam.</p>
            {/* <span className="hidden sm:block text-zinc-700">•</span>
            <p>Based in Patna, India</p> */}
          </div>
          
          {/* Dynamic Social Media Links */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {socialLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.name}
                className="group flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300"
              >
                {/* Notice: The icon bounce effect is handled inside the socialLinks array above! */}
                {link.icon}
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </footer>
  );
}

/* Micro-component for minimal text links */
function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-[14px] font-semibold text-white tracking-wide">
        {title}
      </h4>
      <div className="flex flex-col gap-4">
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            className="text-[15px] text-zinc-400 hover:text-white transition-colors duration-300 w-fit"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}