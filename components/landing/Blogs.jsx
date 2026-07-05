"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";

// Extracted animation variants to prevent re-creation on every render
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (index) => ({
    opacity: 1, 
    y: 0, 
    // Modulo 9 ensures the stagger delay resets perfectly on each page
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (index % 9) * 0.08 } 
  })
};

export default function Blogs() {
  // 1. Pagination State
  const [page, setPage] = useState(1);

  // 2. Fetch Posts 
  const { data: response, isLoading, isFetching } = useGetPublishedPostsQuery({
    page,
    limit: 9, 
    sort: "-publishedAt",
  });

  const posts = response?.data?.posts || response?.posts || [];
  const pagination = response?.data?.pagination || response?.pagination || { totalPages: 1 };

  // 3. Smooth scroll to top when changing pages
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    
    // Smoothly scroll back to the header
    const element = document.getElementById("browse-all");
    if (element) {
      // Offset slightly so the header isn't flush against the absolute top of the screen
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Helper to format dates like "JUN 15, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    }).toUpperCase();
  };

  return (
    <section id="browse-all" className="w-full bg-[#FAFAFA] text-zinc-900 font-sans py-16 md:py-24 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-8 md:gap-10">
        
        {/* ======================================= */}
        {/* HEADER: Browse All & Search             */}
        {/* ======================================= */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-3xl md:text-[35px] font-normal tracking-tight text-zinc-900">
            Browse all
          </h2>
          
          <button 
            className="w-10 h-10 md:w-11 md:h-11 rounded-md border border-zinc-300 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 hover:bg-zinc-100 active:scale-95 transition-all duration-300 bg-white"
            aria-label="Search posts"
          >
            <Search className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* ======================================= */}
        {/* GRID LAYOUT / LOADING STATE             */}
        {/* ======================================= */}
        {isLoading ? (
          // Premium Skeleton UI for best UX
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16 w-full mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 w-full animate-pulse">
                <div className="w-full aspect-[16/10] bg-zinc-200 rounded-2xl"></div>
                <div className="px-1 flex flex-col gap-3">
                  <div className="w-24 h-6 bg-zinc-200 rounded-full"></div>
                  <div className="w-full h-7 bg-zinc-200 rounded-md"></div>
                  <div className="w-2/3 h-7 bg-zinc-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="w-full py-32 flex flex-col items-center justify-center text-center">
             <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">Empty</p>
             <h3 className="text-2xl font-normal text-zinc-900">No posts found.</h3>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16 transition-opacity duration-700 ${isFetching ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="flex flex-col gap-4 group"
                >
                  {/* Image Cover */}
                  <Link href={`/blog/${post.slug}`} className="block w-full aspect-[16/10] rounded-2xl bg-zinc-200 overflow-hidden relative shadow-sm border border-zinc-200/50">
                    {post.coverImage ? (
                      <Image 
                        src={post.coverImage} 
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105 will-change-transform"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-zinc-200"></div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                  </Link>

                  {/* Card Content */}
                  <div className="flex flex-col gap-2 md:gap-3 px-1">
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {post.category && (
                        <span className="px-3 py-1 rounded-full border border-zinc-300 text-xs md:text-[14px] font-medium text-zinc-700 bg-white">
                          {post.category.name}
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl md:text-[24px] font-normal leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300 line-clamp-3">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-mono tracking-widest text-zinc-500 mt-1 md:mt-2">
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      <span className="w-[3px] h-[3px] rounded-full bg-zinc-400"></span>
                      <span>{post.readTime || 4} MIN READ</span>
                    </div>
                    
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ======================================= */}
            {/* PAGINATION                              */}
            {/* ======================================= */}
            {pagination.totalPages > 1 && (
              <div className="w-full flex items-center justify-center gap-2 mt-8 md:mt-12 pt-8 border-t border-zinc-200/50">
                
                {/* Prev Button */}
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 font-mono text-sm md:text-base">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 || 
                      pageNum === pagination.totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            page === pageNum 
                              ? "bg-zinc-900 text-white font-medium shadow-md" 
                              : "text-zinc-600 hover:bg-zinc-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === page - 2 || 
                      pageNum === page + 2
                    ) {
                      return <span key={pageNum} className="px-2 text-zinc-400">...</span>;
                    }
                    return null; 
                  })}
                </div>

                {/* Next Button */}
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </button>

              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}