"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  // Cinematic easing for the scroll-in animation
  const fluidEase = [0.16, 1, 0.3, 1];
  
  const fadeUpContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: fluidEase } 
    }
  };

  // Heavy, high-end noise texture for the dark background
  const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

  return (
    <footer className="relative w-full bg-[var(--color-brand-darker)] overflow-hidden pt-32 pb-10 flex flex-col items-center">
      
      {/* 1. THE DENSE TEXTURE OVERLAY */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.5] mix-blend-overlay"
        style={{ backgroundImage: noiseTexture }}
      ></div>

      {/* Subtle ambient glow in the top right of the footer */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-brand-primary)] rounded-full blur-[120px] mix-blend-overlay opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10 flex flex-col">
        
        {/* ========================================
            TOP SECTION: The Master Call to Action
            ======================================== */}
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUpContainer}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 pb-24 border-b border-[var(--color-brand-surface)]/10"
        >
          <div className="max-w-2xl">
            <motion.p variants={fadeUpItem} className="text-[var(--color-brand-surface)]/50 font-medium uppercase tracking-[0.2em] text-[11px] mb-6 flex items-center gap-4">
              <span className="w-10 h-[1px] bg-[var(--color-brand-surface)]/50"></span>
              Ready to scale?
            </motion.p>
            <motion.h2 variants={fadeUpItem} className="text-4xl md:text-5xl lg:text-6xl font-normal text-[var(--color-brand-surface)] tracking-tight leading-[1.1]">
              Let's architect the <br className="hidden md:block" />
              <span className="text-[var(--color-brand-primary)]">next ecosystem.</span>
            </motion.h2>
          </div>

          <motion.div variants={fadeUpItem}>
            <Link 
              href="#contact" 
              className="group flex items-center gap-4 text-[var(--color-brand-surface)] hover:text-[var(--color-brand-accent)] transition-colors duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <span className="text-lg font-medium tracking-wide">Initiate Transmission</span>
              <div className="w-12 h-12 rounded-full border border-[var(--color-brand-surface)]/20 flex items-center justify-center group-hover:border-[var(--color-brand-accent)]/50 transition-colors duration-[1s]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* ========================================
            MIDDLE SECTION: Directory & Network
            ======================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 py-20">
          
          {/* Identity Column */}
          <div className="md:col-span-5 flex flex-col">
            <Link href="/" className="text-[var(--color-brand-accent)] font-medium text-2xl tracking-widest mb-6">
              Eklak.
            </Link>
            <p className="text-[var(--color-brand-surface)]/60 font-normal leading-relaxed text-[15px] max-w-sm mb-8">
              System Architect & Full-Stack Engineer. Building resilient digital infrastructures from the database schema to the final pixel.
            </p>
            <div className="flex items-center gap-3 text-[12px] font-medium text-[var(--color-brand-surface)]/40 uppercase tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Base of Operations: India
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 flex flex-col">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-surface)]/40 mb-8">
              Directory
            </h4>
            <div className="flex flex-col gap-4">
              <FooterLink href="/" text="Home" />
              <FooterLink href="/blog" text="The Archive" />
              <FooterLink href="/projects" text="System Logs" />
              <FooterLink href="/about" text="About the Architect" />
            </div>
          </div>

          {/* Social Network Links */}
          <div className="md:col-span-4 flex flex-col">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-surface)]/40 mb-8">
              Network
            </h4>
            <div className="flex flex-col gap-4">
              <FooterSocialLink href="https://linkedin.com/in/yourprofile" text="LinkedIn" icon={<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"/>} />
              <FooterSocialLink href="https://twitter.com/yourprofile" text="X (Twitter)" icon={<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>} />
              <FooterSocialLink href="https://github.com/yourprofile" text="GitHub" icon={<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>} />
            </div>
          </div>

        </div>

        {/* ========================================
            BOTTOM SECTION: Legal & Status
            ======================================== */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--color-brand-surface)]/10 gap-6">
          <p className="text-[13px] font-normal text-[var(--color-brand-surface)]/40 tracking-wide">
            © {new Date().getFullYear()} Eklak Alam. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-primary)]"></span>
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-brand-surface)]/50">
              System Online [OK]
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* Helper for Text Links */
function FooterLink({ href, text }) {
  return (
    <Link href={href} className="group flex items-center w-fit">
      <span className="text-[15px] font-normal text-[var(--color-brand-surface)]/80 group-hover:text-[var(--color-brand-accent)] transition-colors duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]">
        {text}
      </span>
    </Link>
  );
}

/* Helper for Social Links with SVGs */
function FooterSocialLink({ href, text, icon }) {
  return (
    <Link href={href} target="_blank" className="group flex items-center gap-4 w-fit">
      <div className="text-[var(--color-brand-surface)]/40 group-hover:text-[var(--color-brand-accent)] transition-colors duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <span className="text-[15px] font-normal text-[var(--color-brand-surface)]/80 group-hover:text-[var(--color-brand-accent)] transition-colors duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]">
        {text}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-brand-accent)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </Link>
  );
}