"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // ==========================================
  // HIDE FOOTER ON SPECIFIC ROUTES
  // ==========================================
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
    <footer className="relative w-full bg-[#121212] text-white pt-24 pb-8 overflow-hidden selection:bg-white selection:text-[#121212]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* ========================================
            TOP SECTION: Grid Layout
            ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 pb-24">
          
          {/* Left Column: CTA & Newsletter */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
                Got a project in mind?
              </h3>
              <Link 
                href="/contact"
                className="group inline-flex items-center gap-2 text-lg text-white pb-1 border-b border-white/40 hover:border-white transition-colors duration-300"
              >
                Let's make it happen 
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </Link>
            </div>

            <div className="mt-16 lg:mt-32">
              <p className="text-sm text-gray-300 mb-4 uppercase tracking-widest font-medium">Subscribe to insights</p>
              <div className="relative max-w-sm flex items-center border-b border-white/30 pb-2 focus-within:border-white transition-colors duration-300">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-400 text-sm"
                />
                <button className="text-sm font-medium text-white hover:text-gray-300 transition-colors">
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Links */}
          <div className="lg:col-span-5 lg:col-start-8 grid grid-cols-2 sm:grid-cols-3 gap-10">
            <FooterColumn 
              title="Menu"
              links={[
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
                { name: "Work", href: "/work" },
                { name: "Services", href: "/services" },
                { name: "Contact", href: "/contact" },
              ]}
            />
            <FooterColumn 
              title="Socials"
              links={[
                { name: "Twitter", href: "#" },
                { name: "LinkedIn", href: "#" },
                { name: "Instagram", href: "#" },
                { name: "GitHub", href: "#" },
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
        </div>

        {/* ========================================
            MIDDLE SECTION: Location / Time
            ======================================== */}
        {/* <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-white/20 text-sm text-[#FFFFFF]">
          <div className="flex items-center gap-3 mb-4 md:mb-0 ">
            <p>Based in Patna, India — Available Worldwide</p>
          </div>
          <div className="flex gap-6">
            <p>© {new Date().getFullYear()} Eklak Alam</p>
            <p>All Rights Reserved</p>
          </div>
        </div> */}

      </div>

      {/* ========================================
          BOTTOM SECTION: Massive Brand Typography
          ======================================== */}
      <div className="w-full flex justify-center items-end leading-none mt-8 overflow-hidden select-none pointer-events-none">
        <motion.h1 
          initial={{ y: "20%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[18vw] font-black text-white text-center tracking-tighter m-0 p-0 leading-[0.75]"
        >
          EKLAK.
        </motion.h1>
      </div>
    </footer>
  );
}

/* Micro-component for clean link columns */
function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
        {title}
      </h4>
      {links.map((link) => (
        <Link 
          key={link.name} 
          href={link.href}
          className="group relative text-white w-fit text-sm md:text-base transition-colors hover:text-gray-300"
        >
          {link.name}
          {/* Minimal underline hover effect */}
          <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
        </Link>
      ))}
    </div>
  );
}