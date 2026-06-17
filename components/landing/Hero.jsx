"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  // Ultra-smooth, cinematic easing curve (No bouncing, pure luxury glide)
  const cinematicEase = [0.16, 1, 0.3, 1];

  const fadeUpContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: cinematicEase },
    },
  };

  return (
    <section className="relative min-h-[85vh] w-full bg-[var(--color-brand-surface)] overflow-hidden flex flex-col justify-center pt-32 pb-16">
      
      {/* 1. OVERALL PAGE SUBTLE GRAIN */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10 flex flex-col gap-12">
        
        {/* ======================================= */}
        {/* HEADER: Ultra-Minimal Typography        */}
        {/* ======================================= */}
        <motion.div 
          variants={fadeUpContainer}
          initial="hidden"
          animate="show"
          className="w-full max-w-4xl"
        >
          <motion.p variants={fadeUpItem} className="text-[var(--color-brand-dark)] font-medium uppercase tracking-[0.2em] text-[11px] mb-8 flex items-center gap-4">
            {/* <span className="w-10 h-[1px] bg-[var(--color-brand-dark)]"></span> */}
            Insights & Perspectives
          </motion.p>
          
          <motion.h1 
            variants={fadeUpItem}
            /* Strictly font-normal, perfectly tracked */
            className="text-5xl md:text-6xl lg:text-[4.5rem] font-normal text-[var(--color-brand-darker)] tracking-tight leading-[1.05]"
          >
            Exploring the intersection of <span className="text-[var(--color-brand-primary)]">design,</span> code, and digital craft.
          </motion.h1>
          {/* Paragraph removed exactly as requested for maximum minimalism */}
        </motion.div>

        {/* ======================================= */}
        {/* BENTO GRID: Perfect [20px] Corners      */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: cinematicEase }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4"
        >
          
          {/* LEFT: Abstract Editorial Visual Anchor (Replaced the Featured Post) */}
          <div className="md:col-span-8 bg-[var(--color-brand-light)]/10 rounded-[20px] border border-[var(--color-border)]/40 relative overflow-hidden flex flex-col justify-between min-h-[340px] group cursor-default">
            
            {/* SVG Noise Texture specifically inside this card */}
            <div 
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.5] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            ></div>

            {/* Abstract Geometric SVG Grid - Represents Architecture/Code */}
            <svg className="absolute -right-20 -bottom-20 w-[400px] h-[400px] text-[var(--color-brand-primary)] opacity-10 group-hover:opacity-20 group-hover:rotate-3 transition-all duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="30" />
              <circle cx="50" cy="50" r="20" />
              <line x1="10" y1="50" x2="90" y2="50" />
              <line x1="50" y1="10" x2="50" y2="90" />
              <line x1="22" y1="22" x2="78" y2="78" />
              <line x1="22" y1="78" x2="78" y2="22" />
            </svg>

            <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-between">
              <div className="w-12 h-12 rounded-full bg-[var(--color-brand-surface)]/80 backdrop-blur-sm border border-[var(--color-border)]/50 flex items-center justify-center text-[var(--color-brand-darker)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
              </div>

              <div>
                <h3 className="text-3xl md:text-4xl font-normal leading-snug mb-3 text-[var(--color-brand-darker)] tracking-tight">
                  The System Log.
                </h3>
                <p className="text-[15px] text-[var(--color-muted)] font-normal max-w-sm leading-relaxed">
                  A continuous documentation of software architecture, interface design, and the philosophy of building.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Textured "Popular Topics" Box with Heavy Grain */}
          <div className="md:col-span-4 bg-[var(--color-brand-darker)] rounded-[20px] p-8 flex flex-col justify-between text-[var(--color-brand-surface)] min-h-[340px] relative overflow-hidden">
            
            {/* Dark, Dense SVG Noise Texture (Matches your reference image perfectly) */}
            <div 
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.6] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            ></div>

            <div className="relative z-10 flex flex-col h-full">
              <h4 className="text-[12px] uppercase tracking-[0.15em] font-medium mb-8 text-[var(--color-brand-surface)]/60">
                Popular Topics
              </h4>
              
              <div className="flex flex-col gap-5">
                <TopicLink title="Interface Design" count="12" />
                <TopicLink title="React Ecosystem" count="08" />
                <TopicLink title="System Architecture" count="05" />
              </div>
              
              <div className="mt-auto pt-8 border-t border-[var(--color-brand-surface)]/10">
                 <Link href="/blog" className="text-[13px] font-normal text-[var(--color-brand-surface)]/90 hover:text-[var(--color-brand-accent)] transition-colors duration-500 flex items-center justify-between group">
                   Explore all topics
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"><polyline points="9 18 15 12 9 6"></polyline></svg>
                 </Link>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

/* Helper for the Topics list - No heavy backgrounds, just clean text */
function TopicLink({ title, count }) {
  return (
    <Link href={`/category/${title.toLowerCase().replace(' ', '-')}`} className="group flex items-center justify-between border-b border-[var(--color-brand-surface)]/5 pb-2 hover:border-[var(--color-brand-accent)]/30 transition-colors duration-500">
      <span className="text-[15px] font-normal text-[var(--color-brand-surface)]/90 group-hover:text-[var(--color-brand-accent)] transition-colors duration-500">
        {title}
      </span>
      {/* Clean, minimalist number format */}
      <span className="text-[11px] font-medium text-[var(--color-brand-surface)]/40 group-hover:text-[var(--color-brand-accent)] transition-colors duration-500 font-mono tracking-widest">
        0{count}
      </span>
    </Link>
  );
}