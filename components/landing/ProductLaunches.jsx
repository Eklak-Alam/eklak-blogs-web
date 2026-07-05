"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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

  // Dynamic, perfectly measured scroll handler
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Dynamically calculate the width of one card + the gap (32px from gap-8)
      // This ensures the arrows work perfectly on BOTH mobile and desktop
      const cardWidth = container.firstElementChild?.clientWidth || 400;
      const gap = 32; 
      const scrollAmount = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap); 
      
      container.scrollBy({
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
    <section className="w-full py-16 md:py-[80px] bg-[#F3F2EC] text-zinc-900 font-sans overflow-hidden">
      {/* Adjusted padding to be responsive: px-4 on mobile, px-12 on desktop */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 w-full flex flex-col gap-6 md:gap-8">
         
        {/* ======================================= */}
        {/* HEADER: Title & Navigation Arrows       */}
        {/* ======================================= */}
        <div className="flex items-end justify-between w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-[30px] font-normal tracking-tight text-[#111111]"
          >
            Product launches
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2 md:gap-4"
          >
            <button 
              onClick={() => scroll("left")}
              className="p-2 text-zinc-400 hover:text-zinc-900 active:scale-95 transition-all duration-300 rounded-full hover:bg-zinc-200/50"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-2 text-zinc-900 hover:text-zinc-600 active:scale-95 transition-all duration-300 rounded-full hover:bg-zinc-200/50"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>

        {/* ======================================= */}
        {/* SCROLL CONTAINER                        */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          ref={scrollContainerRef}
          // Added scroll-smooth and proper hide-scrollbar utilities
          className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 pt-2
                     scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {posts.map((post) => (
            <div 
              key={post.id} 
              // Perfect responsive widths. shrink-0 is vital so they don't squish together
              className="flex flex-col w-[85vw] sm:w-[320px] md:w-[400px] shrink-0 snap-start group"
            >
              {/* Image Frame */}
              <Link href={`/blog/${post.slug}`} className="block w-full aspect-[4/3] md:aspect-[16/10] rounded-[16px] bg-zinc-200 border border-zinc-200/50 overflow-hidden relative shadow-sm mb-4 md:mb-6">
                {post.coverImage ? (
                  <Image 
                    src={post.coverImage} 
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 320px, 400px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-zinc-200"></div>
                )}
                
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
              </Link>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-zinc-400 text-xs md:text-[13px] font-normal text-zinc-800 bg-transparent">
                  Product Launch
                </span>
                {post.category && (
                  <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-zinc-400 text-xs md:text-[13px] font-normal text-zinc-800 bg-transparent">
                    {post.category.name}
                  </span>
                )}
              </div>
              
              {/* Title */}
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-xl md:text-[24px] font-normal leading-snug tracking-tight text-[#111111] group-hover:text-zinc-600 transition-colors duration-300 line-clamp-3 mb-4 md:mb-6">
                  {post.title}
                </h3>
              </Link>
              
              {/* Meta Data */}
              <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-mono tracking-widest text-zinc-600 uppercase mt-auto">
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-zinc-400"></span>
                <span>4 MIN READ</span>
              </div>

            </div>
          ))}

          {/* Spacer to allow the last item to scroll fully to the left */}
          <div className="min-w-[4px] md:min-w-[100px] shrink-0"></div>
        </motion.div>

      </div>
    </section>
  );
}