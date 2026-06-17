"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, PenLine, Trash2, Eye, Heart, Plus, 
  Loader2, ArrowLeft, Search, Clock, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useGetMyPostsQuery } from "@/hooks/queries/usePostQueries";
import { useDeleteMyPostMutation } from "@/hooks/mutations/usePostMutations";
import { useGetMyAnalyticsQuery } from "@/hooks/queries/useUserQueries";
import { useAuthStore } from "@/store/useAuthStore";

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
};

export default function WriterHubPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  
  // Dashboard Filtering State
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sortParam, setSortParam] = useState("-createdAt");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => { 
      setDebouncedSearch(searchQuery); 
      setPage(1); 
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Dynamic Query parameters
  const queryFilters = { 
    page, 
    limit: 10, 
    sort: sortParam,
    ...(activeTab !== "ALL" && { status: activeTab }),
    ...(debouncedSearch && { "title[contains]": debouncedSearch })
  };

  const { data: postsData, isLoading: postsLoading } = useGetMyPostsQuery(queryFilters);
  const { mutate: deletePost, isPending: isDeleting } = useDeleteMyPostMutation();

  // Auth Guard
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) router.push("/login");
      else if (user?.role === "USER") {
        toast.error("Access denied. Unauthorized entity.");
        router.push("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Confirm permanent purge of record: "${title}"?`)) {
      deletePost(id);
    }
  };

  const posts = postsData?.data?.posts || postsData?.posts || [];
  const pagination = postsData?.data?.pagination || postsData?.pagination || {};
  const { data: analyticsData } = useGetMyAnalyticsQuery();
  const analytics = analyticsData?.analytics || { totalViews: 0, totalLikes: 0, totalShares: 0, totalComments: 0 };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30 pt-32 pb-24 px-6 overflow-hidden">
      
      {/* Abstract Background Grid (Minimal, No heavy textures) */}
      <div className="absolute inset-x-0 top-0 h-[50vh] z-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--color-border)]" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-background)]" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        
        {/* ======================================= */}
        {/* HEADER: Massive & Architectural */}
        {/* ======================================= */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-[var(--color-border)]/40 pb-12"
        >
          <div className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <Link href="/dashboard" className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors duration-500 outline-none mb-8">
                <ArrowLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                Return to Profile
              </Link>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-normal tracking-tight text-[var(--color-foreground)] leading-[1.05] mb-4">
              Workspace.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[15px] font-light text-[var(--color-muted)] leading-relaxed">
              Construct drafts, monitor published transmissions, and evaluate network engagement.
            </motion.p>
          </div>

          <motion.div variants={fadeUp}>
            <Link 
              href="/editor/dashboard" 
              className="group flex items-center gap-3 px-6 py-3.5 bg-[var(--color-foreground)] text-[var(--color-background)] rounded-none text-[11px] font-medium uppercase tracking-[0.15em] hover:opacity-80 transition-opacity outline-none"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} /> Initialize Draft
            </Link>
          </motion.div>
        </motion.div>

        {/* ======================================= */}
        {/* QUICK STATS: Flat & Minimal             */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: cinematicEase, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 border-y border-[var(--color-border)]/40 mb-16 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]/40"
        >
          <div className="py-8 md:px-8 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> System Records
            </p>
            <p className="text-4xl font-normal text-[var(--color-foreground)]">{pagination.total || 0}</p>
          </div>
          <div className="py-8 md:px-8 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> Total Exposure
            </p>
            <p className="text-4xl font-normal text-[var(--color-foreground)]">{analytics.totalViews}</p>
          </div>
          <div className="py-8 md:px-8 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" strokeWidth={1.5} /> Network Resonance
            </p>
            <p className="text-4xl font-normal text-[var(--color-foreground)]">{analytics.totalLikes}</p>
          </div>
        </motion.div>

        {/* ======================================= */}
        {/* NAKED TOOLBAR: Tabs & Search            */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: cinematicEase, delay: 0.3 }}
          className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center mb-12"
        >
          {/* Tabs: Thin Underline Style */}
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto w-full lg:w-auto border-b border-[var(--color-border)]/40">
            {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`pb-3 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-500 whitespace-nowrap border-b border-transparent relative top-[1px] outline-none ${
                  activeTab === tab 
                    ? "text-[var(--color-foreground)] border-[var(--color-foreground)]" 
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Controls: Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            {/* Minimal Search Input */}
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] group-focus-within:text-[var(--color-foreground)] transition-colors" strokeWidth={1.5} />
              <input 
                type="text" placeholder="Search architecture..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--color-border)]/50 focus:border-[var(--color-foreground)] pl-6 pr-2 py-2 text-[13px] font-light outline-none transition-colors text-[var(--color-foreground)] placeholder-[var(--color-muted)]"
              />
            </div>
            
            {/* Minimal Select */}
            <div className="relative w-full sm:w-auto">
              <select 
                value={sortParam} onChange={(e) => { setSortParam(e.target.value); setPage(1); }}
                className="appearance-none bg-transparent border-b border-[var(--color-border)]/50 focus:border-[var(--color-foreground)] py-2 pr-6 pl-2 text-[13px] font-light text-[var(--color-muted)] hover:text-[var(--color-foreground)] outline-none cursor-pointer transition-colors w-full"
              >
                <option value="-createdAt">Sequence: Newest</option>
                <option value="createdAt">Sequence: Oldest</option>
                <option value="-viewCount">Sequence: Most Viewed</option>
                <option value="-likeCount">Sequence: Most Liked</option>
              </select>
              <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-muted)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </motion.div>

        {/* ======================================= */}
        {/* POSTS LIST: Sharp, Linear Architecture  */}
        {/* ======================================= */}
        <div className="relative min-h-[400px]">
          {postsLoading && (
            <div className="absolute inset-0 bg-[var(--color-background)]/50 backdrop-blur-sm z-20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} />
            </div>
          )}

          {posts.length === 0 && !postsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-[var(--color-border)]/40 rounded-none bg-transparent">
              <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-4">Void</p>
              <h3 className="text-xl font-normal text-[var(--color-foreground)] mb-2">No records found.</h3>
              <p className="text-[14px] font-light text-[var(--color-muted)] mb-6">The specified parameters yielded zero results.</p>
              <Link href="/editor/dashboard" className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-brand-accent)] hover:underline flex items-center gap-2">
                Initialize Draft <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 1.2, ease: cinematicEase, delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row gap-6 p-4 border border-[var(--color-border)]/40 rounded-none bg-transparent hover:border-[var(--color-brand-primary)]/50 transition-colors duration-[1s] group"
                  >
                    {/* Thumbnail: Sharp edges, cinematic hover */}
                    <div className="w-full sm:w-48 aspect-video sm:aspect-[4/3] bg-[var(--color-border)]/10 overflow-hidden shrink-0 relative rounded-none border border-[var(--color-border)]/30">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.01]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]/30">
                          <span className="text-[9px] font-mono tracking-widest uppercase">No Asset</span>
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-[9px] font-medium uppercase tracking-[0.2em] border rounded-none ${
                              post.status === 'PUBLISHED' ? 'text-green-500 border-green-500/30 bg-green-500/5' : 
                              post.status === 'DRAFT' ? 'text-orange-500 border-orange-500/30 bg-orange-500/5' : 
                              'text-[var(--color-muted)] border-[var(--color-border)]/50 bg-[var(--color-surface)]/10'
                            }`}>
                              {post.status}
                            </span>
                            <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-widest flex items-center gap-1.5">
                              <Clock className="w-3 h-3" strokeWidth={1.5} /> {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Raw Action Icons (Edit / Delete) */}
                          <div className="flex items-center gap-4">
                            <Link href={`/editor/dashboard?slug=${post.slug}`} className="text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] transition-colors outline-none">
                              <PenLine className="w-4 h-4" strokeWidth={1.5} />
                            </Link>
                            <button onClick={() => handleDelete(post.id, post.title)} disabled={isDeleting} className="text-[var(--color-muted)] hover:text-red-500 transition-colors disabled:opacity-30 outline-none">
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl md:text-2xl font-normal text-[var(--color-foreground)] line-clamp-2 mb-3 leading-snug group-hover:text-[var(--color-brand-primary)] transition-colors duration-700">
                          {post.title}
                        </h3>
                        <p className="text-[14px] font-light text-[var(--color-muted)] line-clamp-2 leading-relaxed">
                          {post.excerpt || "No summary parameters provided for this record."}
                        </p>
                      </div>

                      {/* Footer Meta */}
                      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[var(--color-border)]/30 text-[var(--color-muted)]">
                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium"><Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> {post.viewCount} Reads</span>
                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium"><Heart className="w-3.5 h-3.5" strokeWidth={1.5} /> {post.likeCount} Likes</span>
                        {post.category && (
                          <span className="ml-auto text-[10px] font-medium text-[var(--color-brand-accent)] uppercase tracking-[0.2em]">
                            {post.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ======================================= */}
        {/* PAGINATION: Raw & Minimal               */}
        {/* ======================================= */}
        {pagination?.totalPages > 1 && (
          <div className="flex justify-between items-center mt-20 border-t border-[var(--color-border)]/40 pt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="group flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-foreground)] hover:text-[var(--color-brand-accent)] disabled:opacity-30 disabled:hover:text-[var(--color-foreground)] transition-colors outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              Previous
            </button>
            <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] font-mono">
              {page} / {pagination.totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} 
              disabled={page === pagination.totalPages} 
              className="group flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-foreground)] hover:text-[var(--color-brand-accent)] disabled:opacity-30 disabled:hover:text-[var(--color-foreground)] transition-colors outline-none"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}