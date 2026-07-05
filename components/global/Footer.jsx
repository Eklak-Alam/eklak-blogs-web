"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";

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
    // Changed to a softer #111111 background instead of harsh black
    <footer className="w-full bg-[#111111] text-white py-16 md:py-20 border-t border-zinc-800 selection:bg-zinc-700 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between gap-16 md:gap-8"
        >
          {/* ========================================
              LEFT: Brand & Direct Contact
              ======================================== */}
          <div className="flex flex-col max-w-sm">
            <Link href="/" className="text-2xl font-medium text-white tracking-tight mb-4 hover:text-zinc-300 transition-colors">
              Eklak Alam.
            </Link>
            <p className="text-[15px] leading-relaxed mb-8 text-zinc-300">
              A digital craftsman building minimal, high-performance web experiences. Available for freelance opportunities.
            </p>
            
            <a 
              href="mailto:hello@eklak.com" 
              className="group inline-flex items-center gap-2 text-[15px] font-medium text-white w-fit"
            >
              <span className="relative pb-1 border-b border-zinc-600 group-hover:border-white transition-colors duration-300">
                hello@eklak.com
              </span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
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
          className="mt-20 pt-8 border-t border-zinc-800 flex flex-col-reverse sm:flex-row justify-between items-center gap-6 text-[14px]"
        >
          {/* Made the text pure white and removed the green dot */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-white text-center sm:text-left">
            <p>© {new Date().getFullYear()} Eklak Alam. All rights reserved.</p>
            <span className="hidden sm:block text-zinc-600">•</span>
            <p>Based in Patna, India</p>
          </div>
          
          {/* Social Media Icons */}
          <div className="flex items-center gap-5">
            <SocialIcon href="#" icon={X} label="Twitter" />
            <SocialIcon href="#" icon={FaLinkedin} label="LinkedIn" />
            <SocialIcon href="#" icon={FaInstagram} label="Instagram" />
            <SocialIcon href="#" icon={FaGithub} label="GitHub" />
          </div>
        </motion.div>

      </div>
    </footer>
  );
}

/* Micro-component for minimal text links */
function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-[14px] font-medium text-white mb-1">
        {title}
      </h4>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            // Crisp white text on hover, light gray default
            className="text-[15px] text-zinc-400 hover:text-white transition-colors duration-300 w-fit"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* Micro-component for Social Icons */
function SocialIcon({ href, icon: Icon, label }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={label}
      className="text-zinc-400 hover:text-white hover:-translate-y-1 transition-all duration-300"
    >
      <Icon className="w-5 h-5" strokeWidth={1.5} />
    </a>
  );
}