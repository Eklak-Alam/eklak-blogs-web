"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Search, FileText, Clock, Eye, Heart, Loader2, 
  ArrowRight, Filter, ChevronRight, Hash 
} from "lucide-react";

import { useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCategoriesQuery } from "@/hooks/queries/useCategoryQueries";

function BlogFeedContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || null);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "-createdAt");

  // Debounce search input
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

  // Sync state to URL helper
  const updateUrl = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
    updateUrl({ category: catId, page: 1 });
  };

  const handleSortChange = (sortId) => {
    setSortBy(sortId);
    setPage(1);
    updateUrl({ sort: sortId, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrl({ page: newPage });
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
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30 pt-24 pb-20 px-6">
      
      {/* Background Styling */}
      <div className="absolute inset-x-0 top-0 h-[60vh] z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 20%, transparent 80%)",
          }}
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 right-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-brand-primary)] rounded-full blur-[140px]"
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[var(--color-foreground)] mb-6">
            The Knowledge <span className="text-[var(--color-brand-primary)]">Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-muted)] font-medium leading-relaxed">
            Discover cutting-edge ideas, engineering insights, and captivating stories written by our community of experts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
              <input 
                type="text" 
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-[var(--color-brand-primary)]/10 transition-all text-[var(--color-foreground)]"
              />
            </div>

            {/* Sort Order */}
            <div className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-[var(--color-border)]/50 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-[var(--color-foreground)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--color-brand-accent)]" /> Sort By
              </h3>
              <div className="space-y-2">
                {[
                  { id: "-createdAt", label: "Newest Arrivals" },
                  { id: "createdAt", label: "Oldest Archives" },
                  { id: "-viewCount", label: "Most Viewed" },
                  { id: "-likeCount", label: "Most Liked" }
                ].map(sort => (
                  <button
                    key={sort.id}
                    onClick={() => handleSortChange(sort.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      sortBy === sort.id 
                        ? 'bg-[var(--color-brand-primary)] text-white shadow-md' 
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-foreground)]'
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-[var(--color-border)]/50 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-[var(--color-foreground)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-[var(--color-brand-primary)]" /> Categories
              </h3>
              {catsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[var(--color-brand-primary)]" /></div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      !selectedCategory 
                        ? 'bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)]' 
                        : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]'
                    }`}
                  >
                    All Topics
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        selectedCategory === cat.id 
                          ? 'bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)]' 
                          : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </motion.div>

          {/* RIGHT MAIN: POSTS FEED */}
          <div className="lg:col-span-9 relative min-h-[500px]">
            {postsLoading && (
              <div className="absolute inset-0 bg-[var(--color-background)]/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-brand-primary)]" />
              </div>
            )}

            {posts.length === 0 && !postsLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-[var(--color-border)] rounded-3xl bg-[var(--color-surface)]/30">
                <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-[var(--color-muted)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">No articles found</h3>
                <p className="text-[var(--color-muted)] font-medium max-w-sm mb-6">We couldn't find anything matching your search criteria. Try removing some filters.</p>
                <button onClick={clearFilters} className="text-[var(--color-brand-primary)] font-bold hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`} className="block h-full group">
                        <div className="flex flex-col h-full rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-xl border border-[var(--color-border)]/60 shadow-sm hover:shadow-2xl hover:border-[var(--color-brand-primary)]/50 transition-all duration-300 overflow-hidden relative">
                          
                          {/* Image Header */}
                          <div className="w-full aspect-[4/3] bg-[var(--color-background)] border-b border-[var(--color-border)] overflow-hidden relative shrink-0">
                            {post.coverImage ? (
                              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] bg-[var(--color-surface)]">
                                <FileText className="w-12 h-12 opacity-20" />
                              </div>
                            )}
                            {/* Overlay category */}
                            {post.category && (
                              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
                                {post.category.name}
                              </div>
                            )}
                          </div>

                          {/* Content Body */}
                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              {post.author?.image ? (
                                <img src={post.author.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-dark)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {post.author?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-bold text-[var(--color-foreground)] line-clamp-1">{post.author?.name || 'Anonymous'}</p>
                                <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <h3 className="text-xl font-extrabold text-[var(--color-foreground)] leading-tight mb-3 line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {post.title}
                            </h3>
                            
                            <p className="text-sm font-medium text-[var(--color-muted)] line-clamp-3 mb-6">
                              {post.excerpt || "Dive into this article to read more about this fascinating topic."}
                            </p>

                            <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                              <div className="flex items-center gap-4 text-[var(--color-muted)]">
                                <span className="flex items-center gap-1.5 text-xs font-bold">
                                  <Eye className="w-4 h-4" /> {post.viewCount}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold">
                                  <Heart className="w-4 h-4" /> {post.likeCount}
                                </span>
                              </div>
                              <span className="w-8 h-8 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-brand-primary)] group-hover:border-[var(--color-brand-primary)] transition-colors">
                                <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-white transition-colors" />
                              </span>
                            </div>
                          </div>

                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 gap-6">
                <button 
                  onClick={() => handlePageChange(Math.max(1, page - 1))} 
                  disabled={page === 1} 
                  className="px-6 py-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] font-bold text-sm text-[var(--color-foreground)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] disabled:opacity-50 transition-all shadow-sm"
                >
                  Previous
                </button>
                <span className="text-sm font-extrabold text-[var(--color-muted)] uppercase tracking-widest">
                  Page {page} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))} 
                  disabled={page === pagination.totalPages} 
                  className="px-6 py-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] font-bold text-sm text-[var(--color-foreground)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] disabled:opacity-50 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default function PublicBlogFeed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-brand-primary)]" />
      </div>
    }>
      <BlogFeedContent />
    </Suspense>
  );
}
