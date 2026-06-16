"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Calendar, Layers, Menu, PenTool, User, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.nav
        initial={false}
        animate={{
          /* 
            Slightly decreased width: 360px closed, expanding to 420px open.
            Perfect middle ground.
          */
          width: isOpen ? "min(420px, 90vw)" : "min(360px, 90vw)", 
          height: isOpen ? "auto" : 60, // Sleek 60px height
          borderRadius: 16, // Beautiful 16px modern rectangle (no more bubble)
        }}
        transition={{
          type: "spring",
          stiffness: 180, 
          damping: 24,    
          mass: 0.9,
        }}
        className="pointer-events-auto overflow-hidden bg-[var(--color-brand-darker)]/95 backdrop-blur-2xl border border-[var(--color-brand-surface)]/15 shadow-[0_20px_50px_rgb(0,0,0,0.15)] flex flex-col"
      >
        {/* TOP ROW (Always Visible) */}
        <div className="flex items-center justify-between h-[60px] px-5 shrink-0 w-full">
          {/* Left Icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[var(--color-brand-surface)]/5 text-[var(--color-brand-surface)] border border-[var(--color-brand-surface)]/10">
            <PenTool size={16} strokeWidth={1.5} />
          </div>

          {/* Center Logo - Normal/Medium Font ONLY */}
          <Link href="/" className="flex items-center justify-center" onClick={() => setIsOpen(false)}>
            <span className="text-[var(--color-brand-accent)] font-medium text-lg tracking-widest">
              Eklak.
            </span>
          </Link>

          {/* Hamburger Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-[var(--color-brand-surface)]/80 hover:text-white transition-colors duration-500 focus:outline-none w-8 h-8 flex items-center justify-end"
            aria-label="Toggle menu"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 0.9 : 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {isOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </motion.div>
          </button>
        </div>

        {/* EXPANDED MENU CONTENT */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }} 
              className="px-3 pb-4 flex flex-col w-full"
            >
              {/* Single Column Layout for Links */}
              <div className="flex flex-col gap-1 mb-6 mt-4 border-b border-[var(--color-brand-surface)]/10 pb-6">
                <MenuItem 
                  href="/" 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} 
                  title="Home" 
                  onClick={() => setIsOpen(false)} 
                />
                <MenuItem href="/blog" icon={<BookOpen size={18} strokeWidth={1.5} />} title="Blogs" onClick={() => setIsOpen(false)} />
                <MenuItem href="/about" icon={<User size={18} strokeWidth={1.5} />} title="About" onClick={() => setIsOpen(false)} />
                <MenuItem href="/projects" icon={<Layers size={18} strokeWidth={1.5} />} title="Projects" onClick={() => setIsOpen(false)} />
              </div>

              {/* Bottom Section: Socials and CTA vertically stacked */}
              <div className="flex flex-col gap-6 px-2">
                
                {/* Socials Centered */}
                <div className="flex items-center justify-center gap-8 text-[var(--color-brand-surface)]/50 w-full">
                  <Link href="https://linkedin.com/in/yourprofile" target="_blank" className="hover:text-[var(--color-brand-accent)] transition-colors duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"/></svg>
                  </Link>
                  <Link href="https://twitter.com/yourprofile" target="_blank" className="hover:text-[var(--color-brand-accent)] transition-colors duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </Link>
                  <Link href="https://github.com/yourprofile" target="_blank" className="hover:text-[var(--color-brand-accent)] transition-colors duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  </Link>
                </div>

                {/* CTA Button Spanning Full Width */}
                <button className="w-full bg-[var(--color-brand-surface)]/5 hover:bg-[var(--color-brand-surface)]/10 text-[var(--color-brand-surface)] font-medium py-3 px-5 rounded-[12px] flex items-center justify-between transition-colors duration-500 border border-[var(--color-brand-surface)]/10 group">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} strokeWidth={1.5} className="text-[var(--color-brand-accent)]" />
                    <span className="text-[15px]">Let's talk</span>
                  </div>
                  <ArrowUpRight size={16} strokeWidth={1.5} className="opacity-50 group-hover:opacity-100 group-hover:text-[var(--color-brand-accent)] transition-all" />
                </button>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}

/* Single Column Helper Component */
function MenuItem({ icon, title, href, onClick }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3.5 rounded-[12px] text-[var(--color-brand-surface)]/80 hover:bg-[var(--color-brand-surface)]/5 hover:text-[var(--color-brand-surface)] transition-all duration-500 group"
    >
      <div className="flex items-center gap-4">
        <span className="opacity-60 group-hover:opacity-100 group-hover:text-[var(--color-brand-accent)] transition-colors duration-500 flex items-center justify-center">
          {icon}
        </span>
        <span className="font-normal text-[15px] tracking-wide">{title}</span>
      </div>
      <ArrowUpRight size={16} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 text-[var(--color-brand-accent)] -translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
    </Link>
  );
}