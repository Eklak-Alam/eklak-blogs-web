"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  // Cinematic, high-tension easing curve
  const ease = [0.16, 1, 0.3, 1];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease },
    },
  };

  return (
    <footer className="relative w-full bg-[#050505] text-zinc-300 overflow-hidden pt-32 pb-8 border-t border-white/5 font-sans selection:bg-white selection:text-black">
      
      {/* Subtle background glow - pure white/gray for monochrome sleekness */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] rounded-[100%] pointer-events-none -z-10 transform -translate-y-1/2"></div>

      <div className="max-w-[1200px] w-full mx-auto px-6 md:px-12 relative z-10 flex flex-col">
        
        {/* ========================================
            THE HERO CTA: Massive & Confident
            ======================================== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center text-center pb-32 border-b border-white/5"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="px-3 py-1 rounded-full border border-white/10 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              Ready for deployment
            </span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants} 
            className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter text-white leading-[0.9] mb-8"
          >
            Let's build <br className="hidden md:block" />
            <span className="text-zinc-600">the impossible.</span>
          </motion.h2>

          <motion.div variants={itemVariants}>
            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-[15px] hover:scale-105 transition-transform duration-500 ease-out"
            >
              Start a project
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ========================================
            THE GRID: Ultra-Clean Links
            ======================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <Link href="/" className="text-white font-bold text-2xl tracking-tighter mb-2">
              Eklak.
            </Link>
            <p className="text-zinc-500 text-[13px] leading-relaxed max-w-[200px]">
              Engineering digital experiences that operate at the edge of what's possible.
            </p>
          </div>

          <ListCol 
            title="Navigation" 
            links={[
              { name: "Home", href: "/" },
              { name: "Work", href: "/work" },
              { name: "About", href: "/about" },
              { name: "Contact", href: "/contact" },
            ]} 
          />

          <ListCol 
            title="Socials" 
            links={[
              { name: "Twitter / X", href: "https://twitter.com" },
              { name: "LinkedIn", href: "https://linkedin.com" },
              { name: "GitHub", href: "https://github.com" },
            ]} 
          />

          <ListCol 
            title="Legal" 
            links={[
              { name: "Privacy Policy", href: "/privacy" },
              { name: "Terms of Service", href: "/terms" },
            ]} 
          />

        </div>

        {/* ========================================
            THE BOTTOM: Razor Sharp & Minimal
            ======================================== */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-[13px] text-zinc-600">
            © {new Date().getFullYear()} Eklak Alam. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
              Systems Normal
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* Micro-component for the link lists */
function ListCol({ title, links }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[11px] uppercase tracking-widest text-zinc-600 font-semibold mb-2">
        {title}
      </h4>
      {links.map((link) => (
        <Link 
          key={link.name} 
          href={link.href}
          className="text-[14px] text-zinc-400 hover:text-white transition-colors duration-300 w-fit"
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
}