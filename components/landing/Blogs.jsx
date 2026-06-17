"use client";

import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCategoriesQuery } from "@/hooks/queries/useCategoryQueries";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Blogs() {
  // 1. Fetch Latest Posts
  const { data: latestData, isLoading: loadingLatest } = useGetPublishedPostsQuery({
    page: 1,
    limit: 6, 
    sort: "-publishedAt",
  });
  const recentPosts = latestData?.data?.posts || latestData?.posts || [];
  
  const featuredPosts = recentPosts.slice(0, 2);
  const indexPosts = recentPosts.slice(2, 6);

  // 2. Fetch Trending Posts
  const { data: trendingData, isLoading: loadingTrending } = useGetPublishedPostsQuery({
    page: 1,
    limit: 4,
    sort: "-likeCount",
  });
  const trendingPosts = trendingData?.data?.posts || trendingData?.posts || [];

  // 3. Fetch Categories
  const { data: categoriesData, isLoading: loadingCategories } = useGetCategoriesQuery();
  const categories = categoriesData?.categories || [];

  const isGlobalLoading = loadingLatest || loadingTrending || loadingCategories;

  // Cinematic, Apple-style fluid easing
  const fluidEase = [0.16, 1, 0.3, 1];
  
  const fadeUpContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: fluidEase } 
    }
  };

  if (isGlobalLoading) {
    return (
      <div className="py-32 flex items-center justify-center bg-[var(--color-background)] w-full">
        <svg className="w-8 h-8 animate-spin text-[var(--color-brand-primary)] opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Heavy, highly visible noise texture
  const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

  return (
    <section id="read" className="relative w-full py-24 overflow-hidden bg-[var(--color-background)]">
      
      {/* ========================================
        THE PREMIUM TOP GLOW / HALF-CIRCLE
        ========================================
      */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] max-w-[100vw] h-[400px] bg-[var(--color-brand-light)]/20 rounded-full blur-[100px] mix-blend-multiply opacity-60 pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] max-w-[50vw] h-[200px] bg-[var(--color-brand-accent)]/10 rounded-full blur-[80px] mix-blend-multiply opacity-40 pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* ========================================
          CENTERED HEADER: Clean & Animated
          ========================================
        */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUpContainer}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20"
        >
          <motion.span variants={fadeUp} className="w-12 h-[1px] bg-[var(--color-brand-accent)] mb-8"></motion.span>
          
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-normal text-[var(--color-brand-darker)] tracking-tight mb-6">
            Latest Publications
          </motion.h2>
          
          <motion.p variants={fadeUp} className="text-[17px] text-[var(--color-brand-dark)] font-normal leading-relaxed opacity-90">
            A curated collection of thoughts on modern web development, interface architecture, and the pursuit of building better digital experiences.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* ======================================= */}
          {/* LEFT COLUMN: The Main Feed */}
          {/* ======================================= */}
          <div className="lg:col-span-8 flex flex-col">
            
            {/* 1. TEXTURED FEATURED CARDS (Top 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {featuredPosts.map((post) => (
                <motion.article 
                  key={post.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  /* Visible textured background. Subtle color shift on hover, NO image scale */
                  className="group relative flex flex-col bg-[var(--color-brand-surface)]/50 border border-[var(--color-border)]/60 rounded-[24px] p-3 transition-colors duration-[1s] hover:bg-[var(--color-brand-surface)]/70 overflow-hidden cursor-pointer"
                >
                  {/* Heavy Background Grain Texture */}
                  <div 
                    className="absolute inset-0 z-0 opacity-[0.5] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: noiseTexture }}
                  ></div>

                  {/* Inner Image Frame - NO HOVER SCALE */}
                  <Link href={`/blog/${post.slug}`} className="relative z-10 block overflow-hidden rounded-[16px] aspect-[4/3] bg-[var(--color-brand-darker)]/10 mb-6 border border-[var(--color-border)]/20">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        /* No scale. Just a smooth grayscale-to-color transition */
                        className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-brand-surface)]/50 font-mono text-xs">
                        // Missing Asset
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-[var(--color-background)]/90 backdrop-blur-md text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--color-brand-darker)] rounded-full">
                        {post.category.name}
                      </div>
                    )}
                  </Link>

                  {/* Text Content */}
                  <div className="flex flex-col px-2 pb-2 relative z-10">
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl md:text-2xl font-normal leading-snug mb-3 text-[var(--color-brand-darker)] group-hover:text-[var(--color-brand-primary)] transition-colors duration-[1s] line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-[var(--color-muted)] leading-relaxed line-clamp-2 text-sm font-normal mb-5">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-[11px] uppercase tracking-widest font-medium text-[var(--color-muted)]/70 mt-auto pt-4 border-t border-[var(--color-border)]/40">
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        {post.viewCount}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* 2. THE INDEX LIST (Remaining Posts) */}
            <div className="flex flex-col">
              {indexPosts.map((post) => (
                <motion.div 
                  key={post.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                >
                  {/* Highly minimal hover state, no dramatic background changes */}
                  <Link href={`/blog/${post.slug}`} className="group flex flex-col sm:flex-row sm:items-baseline gap-4 py-6 border-t border-[var(--color-border)]/40 hover:border-[var(--color-border)] transition-colors duration-[1s] px-2 -mx-2 rounded-[16px]">
                    <div className="sm:w-28 shrink-0 text-[11px] font-medium uppercase tracking-widest text-[var(--color-muted)]">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-[17px] font-normal text-[var(--color-brand-darker)] group-hover:text-[var(--color-brand-primary)] transition-colors duration-[1s]">
                        {post.title}
                      </h3>
                      <p className="text-sm font-normal text-[var(--color-muted)] line-clamp-1">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ========================================
            RIGHT COLUMN: Sticky Editorial Sidebar
            ========================================
          */}
          <aside className="lg:col-span-4 relative mt-12 lg:mt-0">
            <div className="sticky top-32 flex flex-col gap-16">
              
              {/* Trending Section - REMOVED NUMBERS */}
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-8 flex items-center gap-3 border-b border-[var(--color-border)]/50 pb-4">
                  <span className="w-2 h-2 bg-[var(--color-brand-accent)] rounded-full"></span>
                  Trending
                </h2>
                <div className="flex flex-col gap-6">
                  {trendingPosts.map((post) => (
                    <Link href={`/blog/${post.slug}`} key={post.id} className="flex gap-4 group items-start rounded-[12px] transition-colors duration-[1s]">
                      <div className="flex flex-col gap-2">
                        <h4 className="text-[15px] font-normal text-[var(--color-brand-darker)] leading-snug group-hover:text-[var(--color-brand-primary)] transition-colors duration-[1s]">
                          {post.title}
                        </h4>
                        <div className="text-[10px] uppercase tracking-widest font-medium text-[var(--color-muted)]/60 flex items-center gap-3">
                          <span>{post.author?.name || 'System'}</span>
                          <span className="w-[1px] h-3 bg-[var(--color-border)]"></span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-brand-accent)] opacity-70"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            {post.likeCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories Section - REMOVED COUNTERS */}
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-6 flex items-center gap-3 border-b border-[var(--color-border)]/50 pb-4">
                  <span className="w-2 h-2 bg-[var(--color-brand-primary)] rounded-full"></span>
                  Index
                </h2>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <Link 
                      href={`/category/${cat.name.toLowerCase().replace(' ', '-')}`}
                      key={cat.id} 
                      /* Pure typography badge, no heavy background or counters */
                      className="px-4 py-2.5 rounded-[12px] bg-[var(--color-brand-surface)]/30 border border-[var(--color-border)]/60 text-[13px] font-normal text-[var(--color-brand-darker)] hover:bg-[var(--color-brand-surface)]/80 hover:border-[var(--color-brand-primary)]/50 transition-all duration-[1s]"
                    >
                      {cat.name} 
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}