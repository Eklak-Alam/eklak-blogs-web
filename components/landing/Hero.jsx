"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";

// Importing your real API hooks
import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCategoriesQuery } from "@/hooks/queries/useCategoryQueries";

export default function BlogHero() {
  // Ultra-smooth, snappy cinematic easing curve
  const cinematicEase = [0.16, 1, 0.3, 1];

  const fadeUpContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: cinematicEase },
    },
  };

  // 1. Fetch Real Data
  const { data: postsResponse, isLoading: postsLoading } = useGetPublishedPostsQuery({
    page: 1,
    limit: 4,
    sort: "-createdAt", 
  });
  
  const { data: catResponse, isLoading: catsLoading } = useGetCategoriesQuery();

  // 2. Safely extract data
  const posts = postsResponse?.data?.posts || postsResponse?.posts || [];
  const categories = catResponse?.data?.categories || catResponse?.categories || [];

  // 3. Separate posts for the layout
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const sidebarPosts = posts.length > 1 ? posts.slice(1, 4) : [];

  // Helper to format dates cleanly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    }).toUpperCase();
  };

  return (
    <section className="relative w-full bg-white text-zinc-900 min-h-screen pt-28 md:pt-[160px] pb-16 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col">
        
        {/* ======================================= */}
        {/* TOP HEADER */}
        {/* ======================================= */}
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col"
        >
          <motion.h1 
            variants={fadeUpItem} 
            className="text-5xl sm:text-6xl md:text-[72px] font-normal tracking-tight text-[#111111] leading-none mb-4"
          >
            Blog
          </motion.h1>
          
          <motion.p 
            variants={fadeUpItem} 
            className="text-base sm:text-[17px] md:text-[18px] text-zinc-700 font-normal max-w-3xl tracking-wide"
          >
            Keep up-to-date on the latest company news, product launches, and industry insights.
          </motion.p>

          {/* ======================================= */}
          {/* TAGS & SEARCH BAR */}
          {/* ======================================= */}
          <motion.div 
            variants={fadeUpItem} 
            className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 mt-6 sm:mt-8 mb-8 sm:mb-10"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {catsLoading ? (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[90px] sm:w-[120px] h-[36px] sm:h-[42px] rounded-full bg-zinc-100 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.id}`}
                    className="px-4 py-1.5 sm:py-2 rounded-full border border-zinc-400 text-sm sm:text-[15px] font-normal text-zinc-800 hover:border-zinc-900 hover:text-zinc-900 transition-colors duration-300 bg-white"
                  >
                    {cat.name}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ======================================= */}
        {/* STICKY GRID LAYOUT */}
        {/* ======================================= */}
        <div className="relative min-h-[500px]">
          
          {postsLoading && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
               <Loader2 className="w-8 h-8 animate-spin text-zinc-500" strokeWidth={1.5} />
             </div>
          )}

          {!postsLoading && posts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center w-full">
               <p className="text-xs sm:text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">Void</p>
               <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 mb-2">No transmissions available.</h3>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start relative">
              
              {/* LEFT SIDE: Featured Post (Sticky on Desktop only) */}
              {featuredPost && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: cinematicEase }}
                  className="lg:col-span-7 lg:sticky lg:top-[30px] flex flex-col gap-4 sm:gap-5 group"
                >
                  <Link href={`/blog/${featuredPost.slug}`} className="block w-full aspect-[4/3] sm:aspect-[16/10] rounded-xl bg-zinc-100 overflow-hidden relative border border-zinc-200/50">
                    {featuredPost.coverImage ? (
                      <Image 
                        src={featuredPost.coverImage} 
                        alt={featuredPost.title}
                        fill
                        priority // Preloads the hero image to prevent lag
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-800 to-zinc-900"></div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                  </Link>

                  <div className="flex flex-col gap-2 sm:gap-3">
                    {featuredPost.category && (
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full border border-zinc-300 text-xs sm:text-[15px] font-medium text-zinc-700 bg-white">
                          {featuredPost.category.name}
                        </span>
                      </div>
                    )}
                    
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <h2 className="text-3xl sm:text-[32px] md:text-[40px] font-normal leading-[1.15] tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                        {featuredPost.title}
                      </h2>
                    </Link>
                    
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-[13px] font-mono tracking-widest text-zinc-500 mt-1 sm:mt-2">
                      <span>{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                      <span>By {featuredPost.author?.name || 'System'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* RIGHT SIDE: Scrollable List */}
              <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.3, ease: cinematicEase }}
                 className="lg:col-span-5 flex flex-col gap-8 sm:gap-10"
              >
                {sidebarPosts.map((post) => (
                  <div key={post.id} className="flex flex-col gap-4 border-b border-zinc-200 pb-8 sm:pb-10 last:border-none group">
                    
                    <Link href={`/blog/${post.slug}`} className="block w-full aspect-[16/9] rounded-xl bg-zinc-100 overflow-hidden relative border border-zinc-200/50">
                       {post.coverImage ? (
                          <Image 
                            src={post.coverImage} 
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                            sizes="(max-width: 1024px) 100vw, 40vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-zinc-700"></div>
                        )}
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                    </Link>

                    <div className="flex flex-col gap-2">
                      {post.category && (
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full border border-zinc-300 text-xs sm:text-[15px] font-medium text-zinc-700 bg-white">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                      
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-xl sm:text-[22px] font-normal leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                          {post.title}
                        </h3>
                      </Link>
                      
                      {post.excerpt && (
                        <p className="text-sm sm:text-[15px] text-zinc-600 font-normal line-clamp-2 mt-1">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs sm:text-[13px] font-mono tracking-widest text-zinc-500 mt-1 sm:mt-2">
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              
            </div>
          )}
        </div>
      </div>
    </section>
  );
}