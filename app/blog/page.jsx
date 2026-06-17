"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCategoriesQuery } from "@/hooks/queries/useCategoryQueries";

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
};

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
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30 pt-32 pb-24 px-6">
      
      <div className="max-w-[1400px] mx-auto">
        
        {/* ======================================= */}
        {/* HEADER: Massive & Architectural */}
        {/* ======================================= */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="max-w-2xl">
            <motion.p variants={fadeUp} className="text-[var(--color-brand-dark)] font-medium uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-[var(--color-brand-dark)]"></span>
              The Index
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-normal tracking-tight text-[var(--color-foreground)] leading-[1.05]">
              Journal & <br className="hidden md:block" /> Transmissions.
            </motion.h1>
          </div>
          <motion.p variants={fadeUp} className="text-[15px] font-light text-[var(--color-muted)] max-w-sm leading-relaxed pb-2">
            A continuous documentation of software architecture, interface engineering, and the philosophy of building.
          </motion.p>
        </motion.div>

        {/* ======================================= */}
        {/* CONTROL BAR: Horizontal Filters (No sidebars) */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: cinematicEase, delay: 0.2 }}
          className="w-full border-y border-[var(--color-border)]/40 py-4 mb-16 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Categories: Minimal text links */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 w-full md:w-auto">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-500 ${
                !selectedCategory ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }`}
            >
              All Topics
            </button>
            {!catsLoading && categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-500 ${
                  selectedCategory === cat.id ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Controls: Search & Sort */}
          <div className="flex items-center gap-6 w-full md:w-auto">
            {/* Search - Sleek Bottom Border */}
            <div className="relative group w-full md:w-48">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] group-focus-within:text-[var(--color-foreground)] transition-colors" strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--color-border)]/50 focus:border-[var(--color-foreground)] pl-6 pr-2 py-2 text-[13px] font-light outline-none transition-colors text-[var(--color-foreground)] placeholder-[var(--color-muted)]"
              />
            </div>
            
            {/* Sort - Minimal Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="appearance-none bg-transparent border-b border-[var(--color-border)]/50 focus:border-[var(--color-foreground)] py-2 pr-6 pl-2 text-[13px] font-light text-[var(--color-muted)] hover:text-[var(--color-foreground)] outline-none cursor-pointer transition-colors"
              >
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
                <option value="-viewCount">Most Viewed</option>
                <option value="-likeCount">Most Liked</option>
              </select>
              {/* Custom thin dropdown arrow */}
              <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-muted)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </motion.div>

        {/* ======================================= */}
        {/* GRID: Raw, Frameless Cards */}
        {/* ======================================= */}
        <div className="relative min-h-[500px]">
          {postsLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-background)]/50 backdrop-blur-sm">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} />
            </div>
          )}

          {posts.length === 0 && !postsLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-4">Void</p>
              <h3 className="text-2xl font-normal text-[var(--color-foreground)] mb-2">No transmissions found.</h3>
              <button onClick={clearFilters} className="text-[13px] font-light text-[var(--color-brand-accent)] hover:underline transition-all">
                Clear parameters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 1.2, ease: cinematicEase, delay: index * 0.05 }}
                  >
                    <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full cursor-pointer">
                      
                      {/* Image Frame: Zero Rounding, Cinematic Hover */}
                      <div className="w-full aspect-[4/3] bg-[var(--color-border)]/10 overflow-hidden relative mb-6 rounded-none">
                        {post.coverImage ? (
                          <img 
                            src={post.coverImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.01]" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]/30">
                            <span className="text-[10px] font-mono tracking-widest uppercase">No Asset</span>
                          </div>
                        )}
                        
                        {/* Minimal Category Tag */}
                        {post.category && (
                          <div className="absolute top-0 left-0 bg-[var(--color-background)] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] border-b border-r border-[var(--color-border)]/40 rounded-none">
                            {post.category.name}
                          </div>
                        )}
                      </div>

                      {/* Content Body: Pure Typography */}
                      <div className="flex flex-col flex-1 px-1">
                        
                        {/* Meta Data */}
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.1em] font-medium text-[var(--color-muted)] mb-3">
                          <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                          <span className="w-1 h-1 bg-[var(--color-border)]/50 rounded-none"></span>
                          <span>{post.author?.name || 'System'}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-normal text-[var(--color-foreground)] leading-snug mb-4 line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors duration-700">
                          {post.title}
                        </h3>
                        
                        {/* Excerpt */}
                        <p className="text-[14px] font-light text-[var(--color-muted)] line-clamp-2 leading-relaxed mb-6">
                          {post.excerpt}
                        </p>

                        {/* Minimal Footer */}
                        <div className="mt-auto flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-accent)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]">
                          Read <ArrowRight className="w-3 h-3 ml-1" strokeWidth={1.5} />
                        </div>
                      </div>

                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ======================================= */}
          {/* PAGINATION: Raw & Minimal */}
          {/* ======================================= */}
          {pagination?.totalPages > 1 && (
            <div className="flex justify-between items-center mt-24 border-t border-[var(--color-border)]/40 pt-8">
              <button 
                onClick={() => handlePageChange(Math.max(1, page - 1))} 
                disabled={page === 1} 
                className="group flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--color-foreground)] hover:text-[var(--color-brand-accent)] disabled:opacity-30 disabled:hover:text-[var(--color-foreground)] transition-all duration-500 outline-none"
              >
                <ArrowLeft className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                Previous
              </button>
              <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] font-mono">
                {page} / {pagination.totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))} 
                disabled={page === pagination.totalPages} 
                className="group flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--color-foreground)] hover:text-[var(--color-brand-accent)] disabled:opacity-30 disabled:hover:text-[var(--color-foreground)] transition-all duration-500 outline-none"
              >
                Next
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
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
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} />
      </div>
    }>
      <BlogFeedContent />
    </Suspense>
  );
}