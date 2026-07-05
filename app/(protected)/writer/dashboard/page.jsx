"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, PenLine, Trash2, Eye, Heart, Plus, 
  Loader2, Search, Clock, ArrowLeft, ArrowRight, 
  LayoutDashboard, User, ShieldAlert, Home
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
  const { data: analyticsData } = useGetMyAnalyticsQuery();

  // Auth Guard
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) router.push("/login");
      else if (user?.role === "USER") {
        toast.error("Access denied. Writer privileges required.");
        router.push("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deletePost(id, {
        onSuccess: () => toast.success("Post deleted successfully."),
        onError: () => toast.error("Failed to delete post.")
      });
    }
  };

  const posts = postsData?.data?.posts || postsData?.posts || [];
  const pagination = postsData?.data?.pagination || postsData?.pagination || {};
  const analytics = analyticsData?.data || { totalViews: 0, totalLikes: 0, totalShares: 0, totalComments: 0 };

  // Smooth Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (!isInitialized) return null;

  return (
    // MAIN WRAPPER: Removed the top padding, full viewport height
    <div className="min-h-[100dvh] bg-[#f2f2f2] flex flex-col md:flex-row selection:bg-black selection:text-[#f2f2f2]">
      
      {/* ======================================= */}
      {/* DESKTOP SIDEBAR                         */}
      {/* ======================================= */}
      <aside className="hidden md:flex flex-col w-[280px] lg:w-[320px] fixed inset-y-0 left-0 bg-white border-r border-zinc-200/80 p-6 overflow-y-auto z-20">
        
        <div className="mb-8">
          <Link href="/">
            <h2 className="text-[22px] font-black tracking-tighter text-black hover:opacity-70 transition-opacity">Eklak.</h2>
          </Link>
          <p className="text-[14px] text-zinc-500 font-medium mt-1">Writer Workspace</p>
        </div>

        <Link 
          href="/editor/dashboard" 
          className="w-full py-3.5 mb-8 bg-black text-[#f2f2f2] text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" /> Write a Post
        </Link>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-2 mb-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-3">Filter Status</p>
          {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors outline-none text-left ${
                activeTab === tab 
                  ? "bg-[#f2f2f2] text-black" 
                  : "text-zinc-500 hover:text-black hover:bg-zinc-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {tab === "ALL" ? "All Posts" : tab.charAt(0) + tab.slice(1).toLowerCase() + "s"}
            </button>
          ))}
        </nav>

        {/* Sidebar Stats Widget */}
        <div className="mt-auto bg-[#f2f2f2] rounded-xl p-5 border border-zinc-200/50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-4">Analytics Overview</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-zinc-500 font-medium flex items-center gap-2"><FileText className="w-4 h-4" /> Total Posts</span>
              <span className="text-[14px] font-bold text-black">{pagination.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-zinc-500 font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> Total Views</span>
              <span className="text-[14px] font-bold text-black">{analytics.totalViews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-zinc-500 font-medium flex items-center gap-2"><Heart className="w-4 h-4" /> Total Likes</span>
              <span className="text-[14px] font-bold text-black">{analytics.totalLikes}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ======================================= */}
      {/* MAIN CONTENT AREA                       */}
      {/* ======================================= */}
      <div className="flex-1 md:ml-[280px] lg:ml-[320px] flex flex-col w-full min-h-screen">
        
        {/* --------------------------------------- */}
        {/* TOP NAVBAR (Desktop)                    */}
        {/* --------------------------------------- */}
        <header className="hidden md:flex h-[74px] bg-white border-b border-zinc-200/80 items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
          
          {/* Left Side: Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-[14px] font-semibold">
            <span className="text-zinc-400">Workspace</span>
            <span className="text-zinc-300">/</span>
            <span className="text-black">My Posts</span>
          </div>

          {/* Right Side: Quick Links & Profile */}
          <div className="flex items-center gap-6">
            
            <nav className="flex items-center gap-5">
              <Link href="/" className="text-[13px] font-bold text-zinc-500 hover:text-black flex items-center gap-1.5 transition-colors">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link href="/dashboard" className="text-[13px] font-bold text-zinc-500 hover:text-black flex items-center gap-1.5 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              
              {/* Render Admin button only if user is ADMIN */}
              {user?.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="text-[13px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors bg-red-50 px-3 py-1.5 rounded-md">
                  <ShieldAlert className="w-4 h-4" /> Admin Panel
                </Link>
              )}
            </nav>

            <div className="w-[1px] h-6 bg-zinc-200"></div>

            {/* Profile Block */}
            <Link href="/profile" className="flex items-center gap-3 group outline-none">
              <div className="text-right">
                <p className="text-[13px] font-bold text-black group-hover:text-zinc-600 transition-colors">
                  {user?.name || "Eklak"}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  {user?.role || "WRITER"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 overflow-hidden group-hover:bg-zinc-200 transition-colors">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </Link>

          </div>
        </header>

        {/* --------------------------------------- */}
        {/* MOBILE HEADER (Phones/Tablets)          */}
        {/* --------------------------------------- */}
        <div className="md:hidden bg-white border-b border-zinc-200/80 p-4 sticky top-0 z-20 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h2 className="text-[22px] font-black tracking-tighter text-black">Eklak.</h2>
            </Link>
            
            <div className="flex items-center gap-3">
              {user?.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </Link>
              )}
              <Link href="/editor/dashboard" className="p-2 bg-black text-[#f2f2f2] rounded-lg active:scale-95 transition-transform">
                <Plus className="w-5 h-5" />
              </Link>
              <Link href="/profile" className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-zinc-500" />
                )}
              </Link>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
            {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? "bg-black text-[#f2f2f2]" 
                    : "bg-[#f2f2f2] text-zinc-600 hover:text-black"
                }`}
              >
                {tab === "ALL" ? "All Posts" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* --------------------------------------- */}
        {/* MAIN BODY CONTENT                       */}
        {/* --------------------------------------- */}
        <main className="p-6 lg:p-10 max-w-[1200px] mx-auto w-full flex-1">
          
          {/* Toolbar: Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search posts..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-200/80 rounded-xl py-3 pl-11 pr-4 text-[14px] text-black placeholder-zinc-400 outline-none focus:border-black transition-colors"
              />
            </div>
            
            <div className="relative min-w-[180px]">
              <select 
                value={sortParam} 
                onChange={(e) => { setSortParam(e.target.value); setPage(1); }}
                className="w-full appearance-none bg-white border border-zinc-200/80 rounded-xl py-3 pl-4 pr-10 text-[14px] font-medium text-black outline-none focus:border-black transition-colors cursor-pointer"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-viewCount">Most Viewed</option>
                <option value="-likeCount">Most Liked</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          {/* Posts List */}
          <div className="relative min-h-[400px]">
            {postsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f2f2f2]/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              </div>
            )}

            {posts.length === 0 && !postsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-200/80 rounded-2xl text-center px-6">
                <FileText className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="text-[20px] font-bold text-black mb-2">No posts found</h3>
                <p className="text-[15px] text-zinc-500 font-medium mb-6">You don't have any posts matching these filters.</p>
                <Link href="/editor/dashboard" className="text-[14px] font-bold text-black border-b border-black hover:opacity-70 transition-opacity">
                  Write your first post
                </Link>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-5"
              >
                {posts.map((post) => (
                  <motion.div 
                    key={post.id}
                    variants={itemVariants}
                    className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:border-zinc-300 transition-colors group"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-full sm:w-[200px] aspect-[16/10] bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-200/50 relative">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[12px] font-semibold">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Post Details */}
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-md ${
                              post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                              post.status === 'DRAFT' ? 'bg-orange-100 text-orange-700' : 
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {post.status}
                            </span>
                            <span className="text-[12px] font-medium text-zinc-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Link href={`/editor/dashboard?slug=${post.slug}`} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors">
                              <PenLine className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(post.id, post.title)} disabled={isDeleting} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-[18px] sm:text-[20px] font-bold text-black line-clamp-2 leading-tight mb-2">
                          {post.title}
                        </h3>
                        <p className="text-[14px] text-zinc-500 font-medium line-clamp-2">
                          {post.excerpt || "No excerpt provided for this post."}
                        </p>
                      </div>

                      {/* Stats Footer */}
                      <div className="flex items-center gap-5 mt-4 pt-4 border-t border-zinc-100 text-zinc-500">
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold"><Eye className="w-4 h-4" /> {post.viewCount}</span>
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold"><Heart className="w-4 h-4" /> {post.likeCount}</span>
                        {post.category && (
                          <span className="ml-auto text-[12px] font-bold text-black uppercase">
                            {post.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div className="flex justify-between items-center mt-10 mb-8">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-bold text-black disabled:opacity-30 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-[14px] font-bold text-zinc-500">
                {page} / {pagination.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} 
                disabled={page === pagination.totalPages} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-bold text-black disabled:opacity-30 hover:bg-zinc-50 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}