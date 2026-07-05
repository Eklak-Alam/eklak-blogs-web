"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCategoriesQuery } from "@/hooks/queries/useCategoryQueries";

// Clean, snappy SaaS easing
const smoothEase = [0.25, 1, 0.5, 1];

function BlogFeedContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || null);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "-createdAt");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== searchParams.get("search")) {
        setPage(1);
        updateUrl({ search: searchQuery, page: 1 });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const updateUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
    updateUrl({ category: catId, page: 1 });
  };

  const handleSortChange = (e) => {
    const sortId = e.target.value;
    setSortBy(sortId);
    setPage(1);
    updateUrl({ sort: sortId, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrl({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSortBy("-createdAt");
    setPage(1);
    updateUrl({ search: null, category: null, sort: "-createdAt", page: 1 });
  };

  // Data Fetching
  const queryFilters = {
    page,
    limit: 12,
    sort: sortBy,
    ...(debouncedSearch && { "title[contains]": debouncedSearch }),
    ...(selectedCategory && { categoryId: selectedCategory })
  };

  const { data: postsResponse, isLoading: postsLoading } = useGetPublishedPostsQuery(queryFilters);
  const { data: catResponse, isLoading: catsLoading } = useGetCategoriesQuery();

  const posts = postsResponse?.data?.posts || postsResponse?.posts || [];
  const pagination = postsResponse?.data?.pagination || postsResponse?.pagination || {};
  const categories = catResponse?.data?.categories || catResponse?.categories || [];

  return (
    // Beautiful, clean layout 
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900 relative pt-32 pb-24 px-6 font-san">
      
      <div className="max-w-[1200px] mx-auto">
        
        {/* ======================================= */}
        {/* HEADER: Clean & Confident */}
        {/* ======================================= */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-4">
              Read this next
            </h1>
            <p className="text-[16px] text-zinc-600 max-w-md">
              Insights, updates, and deep dives into system architecture and interface engineering.
            </p>
          </div>
        </div>

        {/* ======================================= */}
        {/* CONTROL BAR: Pill Filters */}
        {/* ======================================= */}
        <div className="w-full py-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-200">
          
          {/* Categories: Pill buttons mimicking the screenshots */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                !selectedCategory 
                  ? 'bg-zinc-900 text-white border border-zinc-900' 
                  : 'bg-transparent text-zinc-600 border border-zinc-300 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              All
            </button>
            {!catsLoading && categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                  selectedCategory === cat.id 
                    ? 'bg-zinc-900 text-white border border-zinc-900' 
                    : 'bg-transparent text-zinc-600 border border-zinc-300 hover:border-zinc-400 hover:text-zinc-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Controls: Search & Sort */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-300 focus:border-zinc-900 rounded-full pl-9 pr-4 py-2 text-[14px] outline-none transition-colors text-zinc-900 placeholder-zinc-400"
              />
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="appearance-none bg-white border border-zinc-300 focus:border-zinc-900 rounded-full py-2 pr-8 pl-4 text-[14px] text-zinc-600 hover:text-zinc-900 outline-none cursor-pointer transition-colors"
              >
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
                <option value="-viewCount">Popular</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* GRID: High-End SaaS Cards */}
        {/* ======================================= */}
        <div className="relative min-h-[400px]">
          {postsLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f2f2f2]/80 backdrop-blur-sm rounded-3xl">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-900" strokeWidth={1.5} />
            </div>
          )}

          {posts.length === 0 && !postsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <h3 className="text-2xl font-medium text-zinc-900 mb-2">No articles found</h3>
              <p className="text-zinc-500 mb-6">We couldn't find any content matching your criteria.</p>
              <button 
                onClick={clearFilters} 
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-[14px] font-medium hover:bg-zinc-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              <AnimatePresence>
                {posts.map((post, index) => {
                  // Rough estimation for read time if not provided by backend
                  const readTime = Math.max(3, Math.ceil((post.excerpt?.length || 200) / 50));
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, ease: smoothEase, delay: index * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full cursor-pointer">
                        
                        {/* Image Frame: Beautifully Rounded like the screenshots */}
                        <div className="w-full aspect-[1.6] bg-zinc-200 overflow-hidden relative mb-6 rounded-[20px]">
                          {post.coverImage ? (
                            <img 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1s] ease-out" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 border border-zinc-200/50">
                              <span className="text-[12px] font-medium text-zinc-400">No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col flex-1">
                          {/* Minimal Category Pill Tag */}
                          {post.category && (
                            <div className="flex mb-4">
                              <span className="px-3 py-1 rounded-full border border-zinc-300 text-[12px] text-zinc-700 bg-white group-hover:border-zinc-400 transition-colors">
                                {post.category.name}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h3 className="text-[22px] font-medium text-zinc-900 leading-[1.3] mb-4 group-hover:text-zinc-600 transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h3>
                          
                          {/* Meta Data (Date & Read Time) */}
                          <div className="mt-auto pt-2 flex items-center text-[12px] uppercase tracking-wider font-mono text-zinc-500">
                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                            <span className="mx-3 text-zinc-300">•</span>
                            <span>{readTime} MIN READ</span>
                          </div>
                        </div>

                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* ======================================= */}
          {/* PAGINATION: Clean Pill Buttons */}
          {/* ======================================= */}
          {pagination?.totalPages > 1 && (
            <div className="flex justify-between items-center mt-20 pt-8 border-t border-zinc-200">
              <button 
                onClick={() => handlePageChange(Math.max(1, page - 1))} 
                disabled={page === 1} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 text-[14px] font-medium text-zinc-700 hover:bg-white hover:border-zinc-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all outline-none bg-white/50"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Previous
              </button>
              
              <span className="text-[13px] font-medium text-zinc-500">
                Page {page} of {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))} 
                disabled={page === pagination.totalPages} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 text-[14px] font-medium text-zinc-700 hover:bg-white hover:border-zinc-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all outline-none bg-white/50"
              >
                Next
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function PublicBlogFeed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" strokeWidth={1.5} />
      </div>
    }>
      <BlogFeedContent />
    </Suspense>
  );
}