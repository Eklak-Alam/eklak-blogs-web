"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  // Smooth, subtle entrance animations
  const fadeUpContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 20 },
    },
  };

  return (
    <section className="relative min-h-[90vh] w-full bg-[var(--color-brand-surface)] overflow-hidden flex flex-col justify-center pt-32 pb-16">
      
      {/* 1. SUBTLE GRAIN/NOISE OVERLAY */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10 flex flex-col gap-12">
        
        {/* ======================================= */}
        {/* HEADER: Soft, Normal-Weight Typography  */}
        {/* ======================================= */}
        <motion.div 
          variants={fadeUpContainer}
          initial="hidden"
          animate="show"
          className="w-full max-w-3xl"
        >
          <motion.p variants={fadeUpItem} className="text-[var(--color-brand-dark)] font-medium uppercase tracking-widest text-xs mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[var(--color-brand-dark)]"></span>
            Insights & Perspectives
          </motion.p>
          
          <motion.h1 
            variants={fadeUpItem}
            /* Removed bold, scaled down to 5xl/6xl, tightened tracking */
            className="text-5xl md:text-6xl font-normal text-[var(--color-brand-darker)] tracking-tight leading-[1.1] mb-6"
          >
            Exploring the intersection of <span className="text-[var(--color-brand-primary)]">design,</span> code, and digital craft.
          </motion.h1>

          <motion.p 
            variants={fadeUpItem}
            className="text-lg text-[var(--color-brand-dark)] font-normal leading-relaxed max-w-2xl"
          >
            A curated collection of thoughts on modern web development, interface architecture, and the pursuit of building better digital experiences.
          </motion.p>
        </motion.div>

        {/* ======================================= */}
        {/* BENTO GRID: Rounded Cards & Featured    */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4"
        >
          
          {/* Main Featured Article Card (Rounded & Clean) */}
          <Link href="/blog/latest" className="md:col-span-8 bg-[var(--color-background)] rounded-3xl p-8 md:p-10 border border-[var(--color-border)]/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[320px]">
            {/* Subtle glow effect on hover */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--color-brand-light)] rounded-full mix-blend-multiply filter blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-12">
              <span className="px-4 py-1.5 bg-[var(--color-brand-surface)] text-[var(--color-brand-darker)] rounded-full text-xs font-medium tracking-wide border border-[var(--color-border)]/50">
                Featured Post
              </span>
              <div className="w-10 h-10 rounded-full bg-[var(--color-brand-surface)] flex items-center justify-center text-[var(--color-brand-dark)] group-hover:bg-[var(--color-brand-accent)] group-hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-normal leading-snug mb-3 text-[var(--color-brand-darker)]">
                The Quiet Luxury of Minimalist UI Architecture.
              </h3>
              <div className="flex items-center gap-3 text-sm text-[var(--color-muted)] font-normal">
                <span>June 16, 2026</span>
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                <span>8 min read</span>
              </div>
            </div>
          </Link>

          {/* Secondary Bento Card: Categories / Newsletter */}
          <div className="md:col-span-4 bg-[var(--color-brand-darker)] rounded-3xl p-8 flex flex-col justify-between text-[var(--color-brand-surface)] min-h-[320px]">
            <div>
              <h4 className="text-lg font-normal mb-6 text-white/90">Popular Topics</h4>
              <div className="flex flex-col gap-4">
                <TopicLink title="Interface Design" count="12" />
                <TopicLink title="React Ecosystem" count="08" />
                <TopicLink title="System Architecture" count="05" />
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-[var(--color-brand-light)]/20">
               <Link href="/blog" className="text-sm font-normal text-white hover:text-[var(--color-brand-accent)] transition-colors flex items-center justify-between">
                 Explore all topics
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
               </Link>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

/* Helper for the Topics list */
function TopicLink({ title, count }) {
  return (
    <Link href={`/category/${title.toLowerCase().replace(' ', '-')}`} className="group flex items-center justify-between">
      <span className="text-sm font-normal text-[var(--color-brand-surface)]/70 group-hover:text-[var(--color-brand-accent)] transition-colors">
        {title}
      </span>
      <span className="text-xs font-normal px-2 py-1 rounded-lg bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors">
        {count}
      </span>
    </Link>
  );
}