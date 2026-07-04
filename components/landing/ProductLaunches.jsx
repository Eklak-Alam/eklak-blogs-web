"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

// Importing your real API hooks
import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";

export default function ProductLaunches() {
  const scrollContainerRef = useRef(null);

  // Fetching real data
  const { data: postsResponse, isLoading } = useGetPublishedPostsQuery({
    page: 1,
    limit: 6,
    sort: "-createdAt",
  });

  const posts = postsResponse?.data?.posts || postsResponse?.posts || [];

  // Smooth scroll handler for the arrows
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      // 440 matches the width of the card + the gap for a perfect 1-card scroll
      const scrollAmount = direction === "left" ? -440 : 440; 
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Helper to format dates cleanly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).toUpperCase();
  };

  if (isLoading) {
    return (
      <section className="w-full py-24 bg-[#F3F2EC] flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" strokeWidth={1.5} />
      </section>
    );
  }

  if (!posts || posts.length === 0) return null;

  return (
    // MATCHED: The warm editorial background color
    <section className="w-full py-[80px] bg-[#F3F2EC] text-zinc-900 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-3 md:px-1 w-full flex flex-col gap-7">
         
        {/* ======================================= */}
        {/* HEADER: Title & Navigation Arrows       */}
        {/* ======================================= */}
        <div className="flex items-end justify-between w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            // MATCHED: Specific heading size, color, and weight
            className="text-[26px] md:text-[30px] font-normal tracking-tight text-[#111111]"
          >
            Product launches
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => scroll("left")}
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors duration-300"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-2 text-zinc-900 hover:text-zinc-600 transition-colors duration-300"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>

        {/* ======================================= */}
        {/* SCROLL CONTAINER                        */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-8
                     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {posts.map((post) => (
            <div 
              key={post.id} 
              // MATCHED: specific width mapping to the reference image proportions
              className="flex flex-col min-w-[320px] md:min-w-[420px] w-[85vw] md:w-[420px] snap-start group"
            >
              {/* Image Frame */}
              <Link href={`/blog/${post.slug}`} className="block w-full aspect-[16/10] rounded-[16px] bg-zinc-200 border border-zinc-200/50 overflow-hidden relative shadow-sm mb-6">
                {post.coverImage ? (
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-zinc-200"></div>
                )}
                
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
              </Link>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-4 py-1.5 rounded-full border border-zinc-400 text-[13px] font-normal text-zinc-800 bg-transparent">
                  Product Launch
                </span>
                {post.category && (
                  <span className="px-3 py-1 rounded-full border border-zinc-400 text-[15px] font-normal text-zinc-800 bg-transparent">
                    {post.category.name}
                  </span>
                )}
              </div>
              
              {/* Title */}
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-[22px] md:text-[24px] font-normal leading-snug tracking-tight text-[#111111] group-hover:text-zinc-600 transition-colors duration-300 line-clamp-3 mb-6">
                  {post.title}
                </h3>
              </Link>
              
              {/* Meta Data - MATCHED: Using literal bullet point and exact spacing */}
              <div className="flex items-center gap-3 text-[11px] font-mono tracking-widest text-zinc-600 uppercase mt-auto">
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                <span>•</span>
                <span>4 MIN READ</span>
              </div>

            </div>
          ))}

          {/* Spacer to allow the last item to scroll fully to the left on desktop */}
          <div className="min-w-[20px] md:min-w-[100px] shrink-0"></div>
        </motion.div>

      </div>
    </section>
  );
}