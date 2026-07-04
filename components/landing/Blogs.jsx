"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";

export default function Blogs() {
  // 1. Pagination State
  const [page, setPage] = useState(1);

  // 2. Fetch Posts (Using real API with page state)
  const { data: response, isLoading, isFetching } = useGetPublishedPostsQuery({
    page,
    limit: 9, // 9 items fits perfectly in a 3-column grid (3x3)
    sort: "-publishedAt",
  });

  const posts = response?.data?.posts || response?.posts || [];
  const pagination = response?.data?.pagination || response?.pagination || { totalPages: 1 };

  // 3. Smooth scroll to top when changing pages
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    
    // Smoothly scroll back to the "Browse all" header
    const element = document.getElementById("browse-all");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Helper to format dates like "JUN 15, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    }).toUpperCase(); // Force uppercase to match your design
  };

  // Cinematic fluid easing for load-in
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 } 
    })
  };

  return (
    <section id="browse-all" className="w-full bg-[#FAFAFA] text-zinc-900 font-sans py-24 px-6 md:px-12 selection:bg-zinc-200 min-h-screen">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-9">
        
        {/* ======================================= */}
        {/* HEADER: Browse All & Search             */}
        {/* ======================================= */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-4xl md:text-[35px] font-normal tracking-tight text-zinc-900">
            Browse all
          </h2>
          
          <button className="w-11 h-11 rounded-md border border-zinc-300 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 transition-colors bg-white">
            <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* ======================================= */}
        {/* LOADING STATE                           */}
        {/* ======================================= */}
        {isLoading ? (
          <div className="w-full py-32 flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-zinc-400" strokeWidth={1.5} />
          </div>
        ) : posts.length === 0 ? (
          <div className="w-full py-32 text-center text-zinc-500 font-normal">
            No posts found.
          </div>
        ) : (
          <>
            {/* ======================================= */}
            {/* GRID LAYOUT                             */}
            {/* ======================================= */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 transition-opacity duration-500 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
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
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-zinc-200"></div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                  </Link>

                  {/* Card Content */}
                  <div className="flex flex-col gap-3 px-1">
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {post.category && (
                        <span className="px-3 py-1 rounded-full border border-zinc-300 text-[15px] font-medium text-zinc-700 bg-white">
                          {post.category.name}
                        </span>
                      )}
                      {/* You can map post.tags here if your data returns an array of tags */}
                    </div>
                    
                    {/* Title */}
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-[22px] md:text-[24px] font-normal leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Meta Info (Date & Read Time) */}
                    <div className="flex items-center gap-3 text-[11px] font-mono tracking-widest text-zinc-500 mt-2">
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
              <div className="w-full flex items-center justify-center gap-2 mt-12 pt-8">
                
                {/* Prev Button */}
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                </button>

                {/* Page Numbers (Simplified logic for illustration) */}
                <div className="flex items-center gap-1 font-mono text-sm">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Basic logic to show current, first, last, and a few around current
                    if (
                      pageNum === 1 || 
                      pageNum === pagination.totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                            page === pageNum 
                              ? "bg-zinc-900 text-white font-medium" 
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
                      return <span key={pageNum} className="px-1 text-zinc-400">...</span>;
                    }
                    return null; // Hide others
                  })}
                </div>

                {/* Next Button */}
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>

              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}