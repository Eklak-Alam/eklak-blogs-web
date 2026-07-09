"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, Trash2, 
  ArrowLeft, ArrowRight, Loader2,
  Edit3, BarChart3, Clock,
  PenTool, CheckSquare, X, Tag, Folder, ImagePlus,
  LayoutDashboard, Home, User, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

// Queries & Mutations
import { useGetAllPostsAdminQuery, useAdminPostStatsQuery } from "@/hooks/queries/usePostQueries";
import {
  useAdminUpdatePostStatusMutation,
  useAdminDeletePostMutation,
  useBulkAdminUpdatePostStatusMutation
} from "@/hooks/mutations/usePostMutations";
import { useGetCategoriesQuery, useGetTagsQuery } from "@/hooks/queries/useCategoryQueries";
import { 
  useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
  useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation
} from "@/hooks/mutations/useCategoryMutations";

import { useAuthStore } from "@/store/useAuthStore";

// Fluid easing curve for snappy, premium animations
const fluidEase = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: fluidEase } }
};

export default function AuthorDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user: currentUser } = useAuthStore();
  
  // Tabs State: "POSTS" | "ANALYTICS" | "CATEGORIES_TAGS"
  const [activeTab, setActiveTab] = useState("POSTS");

  // Local State for Posts Table
  const [postPage, setPostPage] = useState(1);
  const [postSearch, setPostSearch] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState("");
  const [debouncedPostSearch, setDebouncedPostSearch] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState([]);

  // Local State for Categories & Tags
  const [taxName, setTaxName] = useState("");
  const [taxDesc, setTaxDesc] = useState("");
  const [taxEditingId, setTaxEditingId] = useState(null);
  const [taxType, setTaxType] = useState("CATEGORY"); // CATEGORY or TAG

  // Debouncers
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedPostSearch(postSearch); setPostPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [postSearch]);

  // Auth Guard
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) router.push("/login");
      else if (currentUser?.role === "USER" || currentUser?.role === "WRITER") {
        toast.error("Access denied. You don't have author privileges.");
        router.push("/writer/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, currentUser, router]);

  // -------------------------
  // 1. DATA FETCHING HOOKS
  // -------------------------
  
  // Analytics
  const { data: postStatsRes, isLoading: statsLoading } = useAdminPostStatsQuery();
  const postStats = postStatsRes?.data || postStatsRes || {};

  // Posts
  const postFilters = { page: postPage, limit: 12, ...(debouncedPostSearch && { search: debouncedPostSearch }), ...(postStatusFilter && { status: postStatusFilter }) };
  const { data: postsRes, isLoading: postsLoading } = useGetAllPostsAdminQuery(postFilters);
  const postsList = postsRes?.data?.posts || postsRes?.posts || [];
  const postPagination = postsRes?.data?.pagination || postsRes?.pagination || {};

  // Categories & Tags
  const { data: catRes, isLoading: catsLoading } = useGetCategoriesQuery();
  const categoriesList = catRes?.data?.categories || catRes?.categories || catRes?.data || [];
  
  const { data: tagRes, isLoading: tagsLoading } = useGetTagsQuery();
  const tagsList = tagRes?.data?.tags || tagRes?.tags || tagRes?.data || [];

  // -------------------------
  // 2. MUTATION HOOKS
  // -------------------------
  const { mutate: deletePost, isPending: isDeletingPost } = useAdminDeletePostMutation();
  const { mutate: bulkUpdatePosts, isPending: isBulkUpdating } = useBulkAdminUpdatePostStatusMutation();

  const { mutate: createCat, isPending: isCreatingCat } = useCreateCategoryMutation();
  const { mutate: updateCat, isPending: isUpdatingCat } = useUpdateCategoryMutation();
  const { mutate: deleteCat, isPending: isDeletingCat } = useDeleteCategoryMutation();
  
  const { mutate: createTag, isPending: isCreatingTag } = useCreateTagMutation();
  const { mutate: updateTag, isPending: isUpdatingTag } = useUpdateTagMutation();
  const { mutate: deleteTag, isPending: isDeletingTag } = useDeleteTagMutation();

  const isTaxPending = isCreatingCat || isUpdatingCat || isDeletingCat || isCreatingTag || isUpdatingTag || isDeletingTag;

  // -------------------------
  // 3. HANDLERS
  // -------------------------

  const handleDeletePost = (postId, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deletePost(postId);
    }
  };

  const handleSelectAllPosts = (e) => {
    if (e.target.checked) setSelectedPostIds(postsList.map(p => p.id));
    else setSelectedPostIds([]);
  };

  const toggleSelectPost = (id) => {
    setSelectedPostIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const handleBulkUpdate = (status) => {
    if (selectedPostIds.length === 0) return toast.error("Please select at least one post.");
    if (window.confirm(`Change status of ${selectedPostIds.length} posts to ${status}?`)) {
      bulkUpdatePosts({ payload: { postIds: selectedPostIds, status } }, {
        onSuccess: () => setSelectedPostIds([])
      });
    }
  };

  const handleTaxSubmit = (e) => {
    e.preventDefault();
    if (!taxName.trim()) return toast.error("Name is required.");

    if (taxType === "CATEGORY") {
      if (taxEditingId) {
        updateCat({ id: taxEditingId, payload: { name: taxName, description: taxDesc } }, { onSuccess: resetTaxForm });
      } else {
        createCat({ name: taxName, description: taxDesc }, { onSuccess: resetTaxForm });
      }
    } else {
      if (taxEditingId) {
        updateTag({ id: taxEditingId, payload: { name: taxName } }, { onSuccess: resetTaxForm });
      } else {
        createTag({ name: taxName }, { onSuccess: resetTaxForm });
      }
    }
  };

  const handleEditTax = (type, item) => {
    setTaxType(type);
    setTaxEditingId(item.id);
    setTaxName(item.name);
    setTaxDesc(item.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTax = (type, id, name) => {
    if (window.confirm(`Delete ${type.toLowerCase()}: "${name}"?`)) {
      if (type === "CATEGORY") deleteCat(id);
      else deleteTag(id);
    }
  };

  const resetTaxForm = () => {
    setTaxEditingId(null);
    setTaxName("");
    setTaxDesc("");
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row font-sans text-zinc-900">
      
      {/* ======================================= */}
      {/* DESKTOP SIDEBAR                         */}
      {/* ======================================= */}
      <aside className="hidden md:flex flex-col w-[280px] lg:w-[320px] fixed inset-y-0 left-0 bg-white border-r border-zinc-200/50 p-6 overflow-y-auto z-30">
        <div className="mb-10">
          <Link href="/" className="inline-block outline-none">
            <h2 className="text-[24px] font-black tracking-tighter text-black hover:opacity-70 transition-opacity">
              Eklak.
            </h2>
          </Link>
          <p className="text-[13px] text-zinc-400 font-medium mt-1">Author Tools</p>
        </div>

        <nav className="flex flex-col gap-1.5 mb-10 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-3">Navigation</p>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all outline-none">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all outline-none">
            <LayoutDashboard className="w-4 h-4" /> User Dashboard
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold bg-zinc-100/80 text-black shadow-sm border border-zinc-200/50 mt-2">
            <PenTool className="w-4 h-4" /> Author Panel
          </div>
          {currentUser?.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-all outline-none mt-2">
              <ShieldAlert className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>
      </aside>

      {/* ======================================= */}
      {/* MAIN CONTENT AREA                       */}
      {/* ======================================= */}
      <div className="flex-1 md:ml-[280px] lg:ml-[320px] flex flex-col w-full min-h-screen">
        
        {/* Top Navbar */}
        <header className="flex h-[72px] bg-white/80 backdrop-blur-md border-b border-zinc-200/50 items-center justify-between px-6 lg:px-12 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-[14px] font-semibold tracking-tight">
            <span className="text-zinc-400">Workspace</span>
            <span className="text-zinc-300">/</span>
            <span className="text-black">Author Panel</span>
          </div>

          <div className="flex flex-items gap-3 text-right">
             <div className="hidden sm:block">
               <p className="text-[13px] font-bold text-black">{currentUser?.name || "Eklak"}</p>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{currentUser?.role}</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0 shadow-sm">
               {currentUser?.profileImage ? <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
             </div>
          </div>
        </header>

        {/* Mobile Header (Phones/Tablets) */}
        <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-zinc-200/50 p-4 sticky top-[72px] z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-bold tracking-tight text-black">Author Tools</h2>
          </div>
        </div>

        {/* Main Body */}
        <main className="p-6 lg:p-12 max-w-[1300px] mx-auto w-full flex-1">
          
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
              Author Dashboard
            </h1>
            <p className="text-[14px] text-zinc-500 font-medium max-w-2xl">
              Oversee editorial flow, analyze network-wide metrics, and manage system taxonomies.
            </p>
          </motion.div>

          {/* Segmented Control Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: fluidEase, delay: 0.1 }}
            className="flex items-center gap-1 overflow-x-auto w-full md:w-max bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 mb-8 no-scrollbar"
          >
            {["POSTS", "ANALYTICS", "CATEGORIES_TAGS"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-[13px] font-bold tracking-wide transition-all duration-200 outline-none flex items-center justify-center gap-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-white text-black shadow-sm border border-zinc-200/50" 
                    : "text-zinc-500 hover:text-black hover:bg-zinc-200/50 border border-transparent"
                }`}
              >
                {tab === "POSTS" && <FileText className="w-4 h-4" />}
                {tab === "ANALYTICS" && <BarChart3 className="w-4 h-4" />}
                {tab === "CATEGORIES_TAGS" && <CheckSquare className="w-4 h-4" />}
                {tab === "CATEGORIES_TAGS" ? "Taxonomies" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            
            {/* ==================================================== */}
            {/* 1. POSTS TAB */}
            {/* ==================================================== */}
            {activeTab === "POSTS" && (
              <motion.div 
                key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: fluidEase }}
              >
                {/* Toolbar & Filters */}
                <div className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text" placeholder="Search articles..." value={postSearch} onChange={(e) => setPostSearch(e.target.value)}
                        className="w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black pl-10 pr-4 py-2.5 rounded-lg text-[13px] font-medium outline-none focus:ring-1 focus:ring-black transition-all text-black placeholder-zinc-400"
                      />
                    </div>
                    
                    {/* Status Select */}
                    <div className="relative w-full sm:w-48">
                      <select 
                        value={postStatusFilter} onChange={(e) => { setPostStatusFilter(e.target.value); setPostPage(1); }}
                        className="appearance-none w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black py-2.5 pr-10 pl-4 rounded-lg text-[13px] font-bold text-black outline-none focus:ring-1 focus:ring-black cursor-pointer transition-all"
                      >
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Drafts</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                      <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  
                  {/* Bulk Actions Panel */}
                  <AnimatePresence>
                    {selectedPostIds.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-1.5 bg-black p-1.5 rounded-lg w-full lg:w-auto shadow-sm overflow-x-auto no-scrollbar border border-black"
                      >
                        <span className="text-[12px] font-bold px-3 text-white whitespace-nowrap">{selectedPostIds.length} Selected</span>
                        <div className="w-[1px] h-4 bg-zinc-800 mx-1"></div>
                        <button onClick={() => handleBulkUpdate("PUBLISHED")} disabled={isBulkUpdating} className="text-[12px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 px-3 py-1.5 rounded-md transition-colors outline-none whitespace-nowrap">Publish</button>
                        <button onClick={() => handleBulkUpdate("DRAFT")} disabled={isBulkUpdating} className="text-[12px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 px-3 py-1.5 rounded-md transition-colors outline-none whitespace-nowrap">Draft</button>
                        <button onClick={() => handleBulkUpdate("ARCHIVED")} disabled={isBulkUpdating} className="text-[12px] font-bold text-red-400 hover:text-red-300 hover:bg-zinc-900 px-3 py-1.5 rounded-md transition-colors outline-none whitespace-nowrap">Archive</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Editorial Table */}
                <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden relative min-h-[400px]">
                  {postsLoading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                          <th className="py-4 px-5 w-12">
                            <input type="checkbox" checked={selectedPostIds.length === postsList.length && postsList.length > 0} onChange={handleSelectAllPosts} className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer" />
                          </th>
                          <th className="py-4 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Article</th>
                          <th className="py-4 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Author</th>
                          <th className="py-4 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                          <th className="py-4 px-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        <AnimatePresence>
                          {postsList.length === 0 && !postsLoading ? (
                            <tr><td colSpan="5" className="py-16 text-center text-[14px] font-medium text-zinc-500">No matching posts found.</td></tr>
                          ) : (
                            postsList.map((post) => (
                              <motion.tr 
                                key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="hover:bg-zinc-50/50 transition-colors group"
                              >
                                <td className="py-4 px-5">
                                  <input type="checkbox" checked={selectedPostIds.includes(post.id)} onChange={() => toggleSelectPost(post.id)} className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer" />
                                </td>
                                <td className="py-4 px-4 min-w-[250px]">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 bg-zinc-100 border border-zinc-200/50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                                      {post.coverImage ? (
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      ) : (
                                        <ImagePlus className="w-4 h-4 text-zinc-400" />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <Link href={`/blog/${post.slug}`} target="_blank" className="text-[14px] font-bold text-black line-clamp-1 hover:text-zinc-600 transition-colors">{post.title}</Link>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[11px] font-semibold text-zinc-500 tracking-wide">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                        <span className="text-[11px] font-semibold text-zinc-500 tracking-wide">{post.viewCount} views</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-[13px] text-zinc-700 font-bold">{post.author?.name || 'System'}</div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md border ${
                                    post.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' :
                                    post.status === 'DRAFT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-zinc-50 text-zinc-600 border-zinc-200'
                                  }`}>
                                    {post.status}
                                  </span>
                                </td>
                                <td className="py-4 px-5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Link href={`/editor/dashboard?slug=${post.slug}`} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors outline-none" title="Edit Post"><Edit3 className="w-4 h-4" /></Link>
                                    <button onClick={() => handleDeletePost(post.id, post.title)} disabled={isDeletingPost} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 outline-none" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Post Pagination */}
                  {postPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center p-5 border-t border-zinc-200 bg-zinc-50">
                      <button onClick={() => setPostPage(p => Math.max(1, p - 1))} disabled={postPage === 1} className="px-4 py-2 text-[12px] font-bold text-black bg-white border border-zinc-200/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm">
                        Previous
                      </button>
                      <span className="text-[12px] font-bold text-zinc-500 tracking-widest">
                        PAGE {postPage} OF {postPagination.totalPages}
                      </span>
                      <button onClick={() => setPostPage(p => Math.min(postPagination.totalPages, p + 1))} disabled={postPage === postPagination.totalPages} className="px-4 py-2 text-[12px] font-bold text-black bg-white border border-zinc-200/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ==================================================== */}
            {/* 2. ANALYTICS TAB */}
            {/* ==================================================== */}
            {activeTab === "ANALYTICS" && (
              <motion.div 
                key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: fluidEase }}
              >
                {statsLoading ? (
                  <div className="py-32 flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    <div className="bg-white p-6 rounded-xl border border-zinc-200/60 shadow-sm flex flex-col">
                      <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-600 mb-6 border border-zinc-200/50"><FileText className="w-4 h-4" /></div>
                      <p className="text-3xl font-black text-black mb-1">{postStats.totalPosts || 0}</p>
                      <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Total Posts</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-zinc-200/60 shadow-sm flex flex-col">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-6 border border-green-100"><CheckSquare className="w-4 h-4" /></div>
                      <p className="text-3xl font-black text-black mb-1">{postStats.statusDistribution?.PUBLISHED || 0}</p>
                      <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Published</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-zinc-200/60 shadow-sm flex flex-col">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-6 border border-orange-100"><PenTool className="w-4 h-4" /></div>
                      <p className="text-3xl font-black text-black mb-1">{postStats.statusDistribution?.DRAFT || 0}</p>
                      <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Drafts</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-zinc-200/60 shadow-sm flex flex-col">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-6 border border-blue-100"><BarChart3 className="w-4 h-4" /></div>
                      <p className="text-3xl font-black text-black mb-1">{postStats.totalViews || 0}</p>
                      <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Total Views</p>
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* ==================================================== */}
            {/* 3. CATEGORIES & TAGS TAB */}
            {/* ==================================================== */}
            {activeTab === "CATEGORIES_TAGS" && (
              <motion.div 
                key="taxonomy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: fluidEase }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                {/* Form Panel */}
                <div className="xl:col-span-4 order-2 xl:order-1">
                  <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200/60 shadow-sm sticky top-[100px]">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
                      <h3 className="text-[14px] font-bold tracking-wide uppercase text-black">
                        {taxEditingId ? "Edit Configuration" : "Create New"}
                      </h3>
                      {taxEditingId && (
                        <button onClick={resetTaxForm} className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <form onSubmit={handleTaxSubmit} className="space-y-6">
                      {/* Segmented Toggle */}
                      <div className="flex p-1 bg-zinc-100 rounded-lg border border-zinc-200/60">
                        {["CATEGORY", "TAG"].map(type => (
                          <button
                            key={type} type="button" onClick={() => { setTaxType(type); resetTaxForm(); }}
                            className={`flex-1 py-2 text-[12px] font-bold tracking-wide rounded-md transition-all outline-none ${
                              taxType === type ? "bg-white text-black shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-black"
                            }`}
                          >
                            {type === "CATEGORY" ? "Category" : "Tag"}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Name</label>
                        <input 
                          type="text" required value={taxName} onChange={(e) => setTaxName(e.target.value)}
                          placeholder={taxType === "CATEGORY" ? "e.g. Engineering" : "e.g. reactjs"}
                          className="w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black rounded-lg px-4 py-3 text-[13px] font-medium text-black outline-none focus:ring-1 focus:ring-black transition-all"
                        />
                      </div>

                      {taxType === "CATEGORY" && (
                        <div>
                          <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Description (Optional)</label>
                          <textarea 
                            value={taxDesc} onChange={(e) => setTaxDesc(e.target.value)} rows="3"
                            placeholder="Brief context..."
                            className="w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black rounded-lg px-4 py-3 text-[13px] font-medium text-black outline-none focus:ring-1 focus:ring-black transition-all resize-none"
                          />
                        </div>
                      )}

                      <button 
                        type="submit" disabled={isTaxPending}
                        className="w-full py-3.5 bg-black text-white text-[13px] font-bold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-sm mt-4"
                      >
                        {isTaxPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {taxEditingId ? "Save Changes" : `Create ${taxType === "CATEGORY" ? "Category" : "Tag"}`}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Lists Panel */}
                <div className="xl:col-span-8 space-y-8 order-1 xl:order-2">
                  
                  {/* Categories Area */}
                  <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                      <h4 className="text-[15px] font-bold text-black flex items-center gap-2">
                        <Folder className="w-4 h-4 text-zinc-400" /> Categories
                      </h4>
                      <span className="px-2.5 py-1 bg-zinc-100 rounded-md text-[11px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-200/60">
                        {categoriesList.length} Total
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoriesList.map(cat => (
                        <div key={cat.id} className="p-5 bg-zinc-50 border border-zinc-200/60 rounded-xl group hover:border-zinc-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-[14px] font-bold text-black">{cat.name}</p>
                              <p className="text-[12px] font-semibold text-zinc-400 mt-0.5">/{cat.slug}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-zinc-200/50 rounded-md shadow-sm p-0.5">
                              <button onClick={() => handleEditTax("CATEGORY", cat)} className="p-1.5 text-zinc-400 hover:text-black rounded transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteTax("CATEGORY", cat.id, cat.name)} disabled={isDeletingCat} className="p-1.5 text-zinc-400 hover:text-red-500 rounded transition-colors disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          {cat.description && <p className="text-[13px] text-zinc-500 font-medium line-clamp-2 mt-2">{cat.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags Area */}
                  <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                      <h4 className="text-[15px] font-bold text-black flex items-center gap-2">
                        <Tag className="w-4 h-4 text-zinc-400" /> Tags
                      </h4>
                      <span className="px-2.5 py-1 bg-zinc-100 rounded-md text-[11px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-200/60">
                        {tagsList.length} Total
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {tagsList.map(tag => (
                        <div key={tag.id} className="flex items-center gap-2 pl-3 pr-1 py-1 bg-zinc-50 border border-zinc-200/80 rounded-md group hover:border-zinc-300 transition-colors">
                          <span className="text-[12px] font-bold text-black">#{tag.name}</span>
                          <div className="flex items-center gap-0.5 overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300 opacity-0 group-hover:opacity-100 pl-2 border-l border-zinc-200">
                            <button onClick={() => handleEditTax("TAG", tag)} className="p-1 text-zinc-400 hover:text-black rounded"><Edit3 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteTax("TAG", tag.id, tag.name)} disabled={isDeletingTag} className="p-1 text-zinc-400 hover:text-red-500 rounded disabled:opacity-50"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}