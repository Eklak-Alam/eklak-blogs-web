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
  
  // Split the data: Top 2 for the massive featured grid, the rest for the sleek list
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

  // Ultra-fluid, cinematic easing curve (Apple-style)
  const fluidEase = [0.16, 1, 0.3, 1];
  
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: fluidEase } 
    }
  };

  if (isGlobalLoading) {
    return (
      <div className="py-32 flex items-center justify-center bg-[var(--color-background)] w-full">
        {/* Soft, minimal loading spinner */}
        <svg className="w-8 h-8 animate-spin text-[var(--color-brand-primary)] opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <section id="read" className="max-w-[1200px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
        
      {/* 
        ========================================
        LEFT COLUMN: Main Editorial Feed
        ========================================
      */}
      <div className="lg:col-span-8 flex flex-col">
        
        {/* Minimal Header */}
        <div className="flex items-end justify-between mb-12 pb-6 border-b border-[var(--color-border)]/50">
          <div>
            <p className="text-[var(--color-brand-dark)] font-medium uppercase tracking-[0.2em] text-[10px] mb-3 flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[var(--color-brand-dark)]"></span>
              The Archive
            </p>
            <h2 className="text-3xl md:text-4xl font-normal text-[var(--color-brand-darker)] tracking-tight">
              Latest Publications
            </h2>
          </div>
          <Link href="/blog" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-brand-accent)] transition-colors flex items-center gap-2 group mb-2 uppercase tracking-widest">
            View All 
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-700 ease-out">
              <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {/* 1. THE FEATURED POSTS (Top 2 get massive priority) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {featuredPosts.map((post) => (
            <motion.article 
              key={post.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              className="group flex flex-col cursor-pointer"
            >
              {/* SHARP EDGES (rounded-none), grayscale effect on rest, color on hover */}
              <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-none aspect-[4/3] bg-[var(--color-brand-surface)]/30 relative mb-6">
                {post.coverImage ? (
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    /* Incredibly slow, cinematic zoom. Grayscale until hovered for that magazine feel. */
                    className="w-full h-full object-cover scale-100 group-hover:scale-[1.05] filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]/50 font-mono text-xs">
                    // Missing Asset
                  </div>
                )}
                {post.category && (
                  <div className="absolute top-0 left-0 px-3 py-1.5 bg-[var(--color-background)] text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-darker)] border-b border-r border-[var(--color-border)]/50">
                    {post.category.name}
                  </div>
                )}
              </Link>

              <div className="flex flex-col px-1">
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-2xl font-normal leading-snug mb-3 text-[var(--color-brand-darker)] group-hover:text-[var(--color-brand-primary)] transition-colors duration-700">
                    {post.title}
                  </h3>
                </Link>
                
                <p className="text-[var(--color-muted)] leading-relaxed line-clamp-2 text-sm font-normal mb-5">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest font-medium text-[var(--color-muted)]/70 mt-auto">
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

        {/* 2. THE INDEX LIST (Remaining Posts rendered as a sleek list) */}
        <div className="flex flex-col">
          {indexPosts.map((post) => (
            <motion.div 
              key={post.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
            >
              <Link href={`/blog/${post.slug}`} className="group flex flex-col sm:flex-row sm:items-baseline gap-4 py-6 border-t border-[var(--color-border)]/40 hover:bg-[var(--color-brand-surface)]/10 transition-colors duration-700 px-2 -mx-2">
                <div className="sm:w-32 shrink-0 text-[11px] font-medium uppercase tracking-widest text-[var(--color-muted)]">
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-normal text-[var(--color-brand-darker)] group-hover:text-[var(--color-brand-primary)] transition-colors duration-700">
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

      {/* 
        ========================================
        RIGHT COLUMN: Sticky Editorial Sidebar
        ========================================
      */}
      <aside className="lg:col-span-4 relative mt-12 lg:mt-0">
        <div className="sticky top-32 flex flex-col gap-16">
          
          {/* Trending Section */}
          <div>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-8 flex items-center gap-3 border-b border-[var(--color-border)]/50 pb-4">
              <span className="w-2 h-2 bg-[var(--color-brand-accent)] rounded-none"></span>
              Trending
            </h2>
            <div className="flex flex-col gap-6">
              {trendingPosts.map((post, idx) => (
                <Link href={`/blog/${post.slug}`} key={post.id} className="flex gap-5 group items-start">
                  {/* Ultra-thin, elegant numbering */}
                  <span className="text-lg font-normal text-[var(--color-brand-dark)]/40 group-hover:text-[var(--color-brand-accent)] transition-colors duration-700 font-mono mt-1">
                    0{idx + 1}.
                  </span>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[15px] font-normal text-[var(--color-brand-darker)] leading-snug group-hover:text-[var(--color-brand-primary)] transition-colors duration-700">
                      {post.title}
                    </h4>
                    <div className="text-[10px] uppercase tracking-widest font-medium text-[var(--color-muted)]/60 flex items-center gap-3">
                      <span>{post.author?.name || 'System'}</span>
                      <span className="w-[1px] h-3 bg-[var(--color-border)]"></span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-brand-accent)]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        {post.likeCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-6 flex items-center gap-3 border-b border-[var(--color-border)]/50 pb-4">
              <span className="w-2 h-2 bg-[var(--color-brand-primary)] rounded-none"></span>
              Index
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  /* Sharp edges, subtle border, highly minimal */
                  className="px-4 py-2 rounded-none bg-transparent border border-[var(--color-border)]/50 text-[12px] font-normal text-[var(--color-brand-darker)] hover:bg-[var(--color-brand-darker)] hover:text-[var(--color-brand-surface)] transition-all duration-700 flex items-center gap-3 group"
                >
                  {cat.name} 
                  <span className="opacity-40 text-[9px] group-hover:opacity-80 transition-opacity">
                    [{cat._count?.posts || 0}]
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </aside>

    </section>
  );
}