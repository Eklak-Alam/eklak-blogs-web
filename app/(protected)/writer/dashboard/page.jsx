"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, PenLine, Trash2, Eye, Calendar, Plus, 
  Loader2, ArrowLeft, Heart, BarChart3, Search, Clock, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useGetMyPostsQuery } from "@/hooks/queries/usePostQueries";
import { useDeleteMyPostMutation } from "@/hooks/mutations/usePostMutations";
import { useGetMyAnalyticsQuery } from "@/hooks/queries/useUserQueries";
import { useAuthStore } from "@/store/useAuthStore";

export default function WriterHubPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  
  // Dashboard Filtering State
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sortParam, setSortParam] = useState("-createdAt"); // Default sort newest
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ApiFeatures Dynamic Query
  const queryFilters = { 
    page, 
    limit: 10, 
    sort: sortParam,
    ...(activeTab !== "ALL" && { status: activeTab }),
    ...(debouncedSearch && { "title[contains]": debouncedSearch }) // Uses advanced API feature!
  };

  const { data: postsData, isLoading: postsLoading } = useGetMyPostsQuery(queryFilters);
  const { mutate: deletePost, isPending: isDeleting } = useDeleteMyPostMutation();

  // Auth Guard
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) router.push("/login");
      else if (user?.role === "USER") {
        toast.error("Writers workspace is restricted.");
        router.push("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deletePost(id);
    }
  };

  const posts = postsData?.data?.posts || postsData?.posts || [];
  const pagination = postsData?.data?.pagination || postsData?.pagination || {};
  const { data: analyticsData } = useGetMyAnalyticsQuery();
  const analytics = analyticsData?.analytics || { totalViews: 0, totalLikes: 0, totalShares: 0, totalComments: 0 };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30">
      
      {/* Background Stylings */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[50vh]">
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-brand-accent)] rounded-full blur-[140px]"
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
        >
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] text-sm font-bold mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Link>
            <div className="flex items-center gap-3">
              <PenLine className="w-10 h-10 text-[var(--color-brand-accent)]" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[var(--color-foreground)]">
                Writer's Hub
              </h1>
            </div>
            <p className="text-[var(--color-muted)] text-lg font-medium mt-2">
              Manage your drafts, track your published posts, and view engagement metrics.
            </p>
          </div>

          <Link 
            href="/editor/dashboard" 
            className="group flex items-center gap-2 px-8 py-4 bg-[var(--color-foreground)] text-[var(--color-background)] rounded-full font-bold shadow-xl shadow-[var(--color-foreground)]/10 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> Draft New Post
          </Link>
        </motion.div>

        {/* QUICK STATS (Based on current loaded data for demo) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="p-6 rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]"><FileText className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest">Total Posts</p>
              <p className="text-2xl font-extrabold text-[var(--color-foreground)]">{pagination.total || 0}</p>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]"><Eye className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest">Total Views</p>
              <p className="text-2xl font-extrabold text-[var(--color-foreground)]">{analytics.totalViews}</p>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-pink-500/10 text-pink-500"><Heart className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest">Total Likes</p>
              <p className="text-2xl font-extrabold text-[var(--color-foreground)]">{analytics.totalLikes}</p>
            </div>
          </div>
        </motion.div>

        {/* TOOLBAR */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center mb-8"
        >
          {/* Tabs */}
          <div className="flex gap-2 bg-[var(--color-surface)]/60 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--color-border)]/50 overflow-x-auto w-full xl:w-auto">
            {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]" 
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-border)]/50 border border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Advanced Filtering */}
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
              <input 
                type="text" placeholder="Search titles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-2xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-[var(--color-brand-primary)] transition-all"
              />
            </div>
            <select 
              value={sortParam} onChange={(e) => { setSortParam(e.target.value); setPage(1); }}
              className="bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-brand-primary)] transition-all cursor-pointer w-full sm:w-48"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-viewCount">Most Viewed</option>
              <option value="-likeCount">Most Liked</option>
            </select>
          </div>
        </motion.div>

        {/* POSTS GRID */}
        <div className="relative min-h-[400px]">
          {postsLoading && (
            <div className="absolute inset-0 bg-[var(--color-background)]/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-primary)]" />
            </div>
          )}

          {posts.length === 0 && !postsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[var(--color-border)] rounded-3xl bg-[var(--color-surface)]/30">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                <PenLine className="w-8 h-8 text-[var(--color-muted)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">No posts found</h3>
              <p className="text-[var(--color-muted)] font-medium max-w-sm mb-6">You haven't written any posts that match these filters.</p>
              <Link href="/editor/dashboard" className="text-[var(--color-brand-primary)] font-bold hover:underline flex items-center gap-1">
                Start writing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-xl border border-[var(--color-border)]/60 shadow-sm hover:border-[var(--color-brand-primary)]/50 hover:shadow-xl transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="w-full sm:w-40 h-48 sm:h-auto rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] overflow-hidden shrink-0 relative">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
                          <FileText className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={`px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-md backdrop-blur-md shadow-sm border ${
                          post.status === 'PUBLISHED' ? 'bg-green-500/80 text-white border-green-500/50' : 
                          post.status === 'DRAFT' ? 'bg-orange-500/80 text-white border-orange-500/50' : 
                          'bg-red-500/80 text-white border-red-500/50'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {post.category && (
                            <span className="text-[10px] font-bold text-[var(--color-brand-accent)] uppercase tracking-widest">{post.category.name}</span>
                          )}
                          <span className="text-[10px] font-bold text-[var(--color-muted)] flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-foreground)] line-clamp-2 mb-2 leading-tight group-hover:text-[var(--color-brand-primary)] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm font-medium text-[var(--color-muted)] line-clamp-2 mb-4">
                          {post.excerpt || "No summary provided."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-4 text-[var(--color-muted)]">
                          <span className="flex items-center gap-1.5 text-xs font-bold"><Eye className="w-4 h-4" /> {post.viewCount}</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold"><Heart className="w-4 h-4" /> {post.likeCount}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link href={`/editor/dashboard?slug=${post.slug}`} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors">
                            <PenLine className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(post.id, post.title)} disabled={isDeleting} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination?.totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full hover:border-[var(--color-brand-primary)] disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5 text-[var(--color-foreground)]" /></button>
            <span className="text-sm font-bold text-[var(--color-muted)]">Page {page} of {pagination.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full hover:border-[var(--color-brand-primary)] disabled:opacity-50 transition-colors shadow-sm"><ChevronRight className="w-5 h-5 text-[var(--color-foreground)]" /></button>
          </div>
        )}

      </div>
    </div>
  );
}