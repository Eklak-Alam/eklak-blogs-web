"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

// Importing your real API hooks
import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCategoriesQuery } from "@/hooks/queries/useCategoryQueries";

export default function BlogHero() {
  // Ultra-smooth, cinematic easing curve
  const cinematicEase = [0.16, 1, 0.3, 1];

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
      transition: { duration: 1, ease: cinematicEase },
    },
  };

  // 1. Fetch Real Data (Limit to 4: 1 Featured + 3 Sidebar)
  const { data: postsResponse, isLoading: postsLoading } = useGetPublishedPostsQuery({
    page: 1,
    limit: 4,
    sort: "-createdAt", // Get the newest posts
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
    <section className="relative w-full bg-white text-zinc-900 min-h-screen pt-[160px] pb-16 px-6 md:px-12 font-sans selection:bg-zinc-200">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col">
        
        {/* ======================================= */}
        {/* TOP HEADER: Exact Image Match Typography*/}
        {/* ======================================= */}
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col"
        >
          {/* 
            MATCHED: 
            - font-normal, tight tracking, huge size (matches the "Blog" reference perfectly)
            - #111111 for that slightly softer-than-pure-black ink look
          */}
          <motion.h1 variants={fadeUpItem} className="text-[64px] md:text-[72px] font-normal tracking-tight text-[#111111] leading-none mb-4">
            Blog
          </motion.h1>
          
          {/* MATCHED: Subtitle spacing and color */}
          <motion.p variants={fadeUpItem} className="text-[17px] md:text-[18px] text-zinc-700 font-normal max-w-3xl tracking-wide">
            Keep up-to-date on the latest company news, product launches, and industry insights.
          </motion.p>

          {/* ======================================= */}
          {/* TAGS & SEARCH BAR - EXACT PILLS         */}
          {/* ======================================= */}
          {/* MATCHED: mt-8 gives the exact visual gap seen in the image */}
          <motion.div variants={fadeUpItem} className="flex flex-wrap items-center justify-between gap-6 mt-8 mb-10">
            
            {/* Dynamic Categories Mapping */}
            <div className="flex flex-wrap items-center gap-3">
              {catsLoading ? (
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[120px] h-[42px] rounded-full bg-zinc-100 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.id}`}
                    /* 
                      MATCHED PILL STYLING:
                      - border-zinc-400 (slightly darker border like the image)
                      - px-5 py-2 (perfect oval padding)
                      - text-[15px] (readable, clean)
                    */
                    className="px-3 py-1 rounded-full border border-zinc-400 text-[20px] font-normal text-zinc-800 hover:border-zinc-900 hover:text-zinc-900 transition-colors duration-300 bg-white"
                  >
                    {cat.name}
                  </Link>
                ))
              )}
            </div>
            
            {/* MATCHED: Exact square Search Icon Button with identical border to tags */}
            {/* <button className="w-[42px] h-[42px] rounded-md border border-zinc-400 flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:border-zinc-900 transition-colors bg-white shrink-0">
              <Search className="w-[18px] h-[18px]" strokeWidth={2} />
            </button> */}
          </motion.div>
        </motion.div>

        {/* ======================================= */}
        {/* STICKY GRID LAYOUT (Real Data)          */}
        {/* ======================================= */}
        <div className="relative min-h-[500px]">
          
          {postsLoading && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
               <Loader2 className="w-8 h-8 animate-spin text-zinc-500" strokeWidth={1.5} />
             </div>
          )}

          {!postsLoading && posts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 text-center w-full">
               <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">Void</p>
               <h3 className="text-2xl font-normal text-zinc-900 mb-2">No transmissions available.</h3>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start relative">
              
              {/* LEFT SIDE: Featured Post (Sticky) */}
              {featuredPost && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: cinematicEase }}
                  className="lg:col-span-7 sticky top-[30px] flex flex-col gap-5 group"
                >
                  <Link href={`/blog/${featuredPost.slug}`} className="block w-full aspect-[16/10] rounded-xl bg-zinc-100 overflow-hidden relative border border-zinc-200/50">
                    {featuredPost.coverImage ? (
                      <img 
                        src={featuredPost.coverImage} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-800 to-zinc-900"></div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                  </Link>

                  <div className="flex flex-col gap-3">
                    {featuredPost.category && (
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full border border-zinc-300 text-[15px] font-medium text-zinc-700 bg-white">
                          {featuredPost.category.name}
                        </span>
                      </div>
                    )}
                    
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <h2 className="text-[32px] md:text-[40px] font-normal leading-[1.15] tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                        {featuredPost.title}
                      </h2>
                    </Link>
                    
                    <div className="flex items-center gap-3 text-[13px] font-mono tracking-widest text-zinc-500 mt-2">
                      <span>{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                      <span>By {featuredPost.author?.name || 'System'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* RIGHT SIDE: Scrollable List */}
              <motion.div 
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 1.2, delay: 0.5, ease: cinematicEase }}
                 className="lg:col-span-5 flex flex-col gap-10"
              >
                {sidebarPosts.map((post) => (
                  <div key={post.id} className="flex flex-col gap-4 border-b border-zinc-200 pb-10 last:border-none group">
                    
                    <Link href={`/blog/${post.slug}`} className="block w-full aspect-[16/9] rounded-xl bg-zinc-100 overflow-hidden relative border border-zinc-200/50">
                       {post.coverImage ? (
                          <img 
                            src={post.coverImage} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-zinc-700"></div>
                        )}
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                    </Link>

                    <div className="flex flex-col gap-2">
                      {post.category && (
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full border border-zinc-300 text-[15px] font-medium text-zinc-700 bg-white">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                      
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-[22px] font-normal leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                          {post.title}
                        </h3>
                      </Link>
                      
                      {post.excerpt && (
                        <p className="text-[15px] text-zinc-600 font-normal line-clamp-2 mt-1">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[13px] font-mono tracking-widest text-zinc-500 mt-2">
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