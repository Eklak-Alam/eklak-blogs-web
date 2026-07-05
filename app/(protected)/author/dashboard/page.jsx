"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, Trash2, 
  ArrowLeft, ArrowRight, Loader2,
  Edit3, BarChart3, Clock,
  PenTool, CheckSquare, X, Tag, Folder, ImagePlus
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

// Fluid easing curve for buttery animations
const fluidEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: fluidEase } }
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
    // Clean #f2f2f2 background, pt-32 clears the global navbar
    <div className="min-h-screen bg-[#f2f2f2] text-zinc-900 pt-10 pb-24 px-4 sm:px-6 relative">
      
      <div className="relative z-10 max-w-[1200px] mx-auto w-full">
        
        {/* ======================================= */}
        {/* HEADER SECTION                          */}
        {/* ======================================= */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="mb-10"
        >
          <motion.div variants={fadeUp}>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-900 shadow-sm shadow-zinc-200/50 hover:shadow-md transition-all duration-300 mb-6 outline-none">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </motion.div>
          
          <motion.div variants={fadeUp} className="mb-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
              Author Dashboard
            </h1>
          </motion.div>
          
          <motion.p variants={fadeUp} className="text-sm md:text-base text-zinc-500 max-w-xl">
            Manage all posts, analyze performance metrics, and organize your categories and tags.
          </motion.p>
        </motion.div>

        {/* ======================================= */}
        {/* SOFT PILL TABS NAVIGATION                 */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: fluidEase, delay: 0.1 }}
          className="flex items-center gap-2 overflow-x-auto w-full md:w-max bg-white p-2 rounded-full shadow-sm shadow-zinc-200/50 mb-10 no-scrollbar"
        >
          {["POSTS", "ANALYTICS", "CATEGORIES_TAGS"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap outline-none flex items-center gap-2 ${
                activeTab === tab 
                  ? "bg-[#f2f2f2] text-zinc-900" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {tab === "POSTS" && <FileText className="w-4 h-4" />}
              {tab === "ANALYTICS" && <BarChart3 className="w-4 h-4" />}
              {tab === "CATEGORIES_TAGS" && <CheckSquare className="w-4 h-4" />}
              {tab === "CATEGORIES_TAGS" ? "Categories & Tags" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          
          {/* ==================================================== */}
          {/* 1. POSTS TAB */}
          {/* ==================================================== */}
          {activeTab === "POSTS" && (
            <motion.div 
              key="posts"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: fluidEase }}
            >
              {/* Toolbar & Filters */}
              <div className="bg-white p-4 md:p-6 rounded-[32px] shadow-sm shadow-zinc-200/50 mb-6 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                  {/* Soft Search Input */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" placeholder="Search posts..." value={postSearch} onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 pl-11 pr-4 py-3 rounded-full text-sm outline-none focus:ring-4 focus:ring-zinc-100 transition-all text-zinc-900 placeholder-zinc-400"
                    />
                  </div>
                  
                  {/* Soft Select */}
                  <div className="relative w-full md:w-48">
                    <select 
                      value={postStatusFilter} onChange={(e) => { setPostStatusFilter(e.target.value); setPostPage(1); }}
                      className="appearance-none w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 py-3 pr-10 pl-5 rounded-full text-sm text-zinc-700 outline-none focus:ring-4 focus:ring-zinc-100 cursor-pointer transition-all"
                    >
                      <option value="">All Statuses</option>
                      <option value="DRAFT">Drafts</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                
                {/* Bulk Actions Panel */}
                <AnimatePresence>
                  {selectedPostIds.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-2 bg-zinc-900 p-2 rounded-full w-full xl:w-auto shadow-md shadow-zinc-900/10 overflow-x-auto no-scrollbar"
                    >
                      <span className="text-xs font-medium px-4 text-white whitespace-nowrap">{selectedPostIds.length} Selected</span>
                      <div className="w-[1px] h-5 bg-zinc-700"></div>
                      <button onClick={() => handleBulkUpdate("PUBLISHED")} disabled={isBulkUpdating} className="text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-1.5 rounded-full transition-colors outline-none whitespace-nowrap">Publish</button>
                      <button onClick={() => handleBulkUpdate("DRAFT")} disabled={isBulkUpdating} className="text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-1.5 rounded-full transition-colors outline-none whitespace-nowrap">Draft</button>
                      <button onClick={() => handleBulkUpdate("ARCHIVED")} disabled={isBulkUpdating} className="text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 px-4 py-1.5 rounded-full transition-colors outline-none whitespace-nowrap">Archive</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* White Card Editorial Table */}
              <div className="bg-white rounded-[32px] shadow-sm shadow-zinc-200/50 overflow-hidden relative min-h-[400px]">
                {postsLoading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>}
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/50">
                        <th className="py-5 px-6 w-12">
                          <input type="checkbox" checked={selectedPostIds.length === postsList.length && postsList.length > 0} onChange={handleSelectAllPosts} className="w-4 h-4 rounded-md border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer" />
                        </th>
                        <th className="py-5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Post</th>
                        <th className="py-5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Author</th>
                        <th className="py-5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="py-5 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      <AnimatePresence>
                        {postsList.length === 0 && !postsLoading ? (
                          <tr><td colSpan="5" className="py-16 text-center text-sm text-zinc-500">No posts found.</td></tr>
                        ) : (
                          postsList.map((post) => (
                            <motion.tr 
                              key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="hover:bg-zinc-50/50 transition-colors group"
                            >
                              <td className="py-4 px-6">
                                <input type="checkbox" checked={selectedPostIds.includes(post.id)} onChange={() => toggleSelectPost(post.id)} className="w-4 h-4 rounded-md border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer" />
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-4 max-w-md">
                                  <div className="w-16 h-12 bg-[#f2f2f2] rounded-[12px] overflow-hidden shrink-0 flex items-center justify-center">
                                    {post.coverImage ? (
                                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                      <ImagePlus className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-medium text-zinc-900 line-clamp-1 hover:text-zinc-600 transition-colors">{post.title}</Link>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[11px] text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                      <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                      <span className="text-[11px] text-zinc-500">{post.viewCount} views</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm text-zinc-700 font-medium">{post.author?.name || 'System'}</div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                                  post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                  post.status === 'DRAFT' ? 'bg-orange-100 text-orange-700' :
                                  'bg-zinc-100 text-zinc-600'
                                }`}>
                                  {post.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link href={`/editor/dashboard?slug=${post.slug}`} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors outline-none" title="Edit Post"><Edit3 className="w-4 h-4" /></Link>
                                  <button onClick={() => handleDeletePost(post.id, post.title)} disabled={isDeletingPost} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 outline-none" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
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
                  <div className="flex justify-between items-center p-6 border-t border-zinc-100 bg-zinc-50/30">
                    <button onClick={() => setPostPage(p => Math.max(1, p - 1))} disabled={postPage === 1} className="px-5 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-full disabled:opacity-50 hover:bg-zinc-50 transition-colors shadow-sm">
                      Previous
                    </button>
                    <span className="text-sm font-medium text-zinc-500">
                      Page {postPage} of {postPagination.totalPages}
                    </span>
                    <button onClick={() => setPostPage(p => Math.min(postPagination.totalPages, p + 1))} disabled={postPage === postPagination.totalPages} className="px-5 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-full disabled:opacity-50 hover:bg-zinc-50 transition-colors shadow-sm">
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
              key="analytics"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: fluidEase }}
            >
              {statsLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white p-8 rounded-[32px] shadow-sm shadow-zinc-200/50 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-[#f2f2f2] rounded-full flex items-center justify-center text-zinc-700 mb-4"><FileText className="w-5 h-5" /></div>
                    <p className="text-4xl font-semibold text-zinc-900 mb-2">{postStats.totalPosts || 0}</p>
                    <p className="text-sm font-medium text-zinc-500">Total Posts</p>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] shadow-sm shadow-zinc-200/50 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4"><CheckSquare className="w-5 h-5" /></div>
                    <p className="text-4xl font-semibold text-zinc-900 mb-2">{postStats.statusDistribution?.PUBLISHED || 0}</p>
                    <p className="text-sm font-medium text-zinc-500">Published</p>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] shadow-sm shadow-zinc-200/50 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-4"><PenTool className="w-5 h-5" /></div>
                    <p className="text-4xl font-semibold text-zinc-900 mb-2">{postStats.statusDistribution?.DRAFT || 0}</p>
                    <p className="text-sm font-medium text-zinc-500">Drafts</p>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] shadow-sm shadow-zinc-200/50 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4"><BarChart3 className="w-5 h-5" /></div>
                    <p className="text-4xl font-semibold text-zinc-900 mb-2">{postStats.totalViews || 0}</p>
                    <p className="text-sm font-medium text-zinc-500">Total Views</p>
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
              key="taxonomy"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: fluidEase }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Form Panel */}
              <div className="lg:col-span-4">
                <div className="bg-white p-8 rounded-[32px] shadow-sm shadow-zinc-200/50 sticky top-[100px]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {taxEditingId ? "Edit" : "Create New"}
                    </h3>
                    {taxEditingId && (
                      <button onClick={resetTaxForm} className="p-2 bg-[#f2f2f2] hover:bg-zinc-200 rounded-full text-zinc-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={handleTaxSubmit} className="space-y-6">
                    {/* Toggle */}
                    <div className="flex p-1 bg-[#f2f2f2] rounded-full">
                      {["CATEGORY", "TAG"].map(type => (
                        <button
                          key={type} type="button" onClick={() => { setTaxType(type); resetTaxForm(); }}
                          className={`flex-1 py-2 text-xs font-medium rounded-full transition-all outline-none ${
                            taxType === type ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          {type === "CATEGORY" ? "Category" : "Tag"}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Name</label>
                      <input 
                        type="text" required value={taxName} onChange={(e) => setTaxName(e.target.value)}
                        placeholder={taxType === "CATEGORY" ? "e.g. Technology" : "e.g. reactjs"}
                        className="w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 rounded-[20px] px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                      />
                    </div>

                    {taxType === "CATEGORY" && (
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Description (Optional)</label>
                        <textarea 
                          value={taxDesc} onChange={(e) => setTaxDesc(e.target.value)} rows="3"
                          placeholder="What is this category about?"
                          className="w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 rounded-[20px] px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-100 transition-all resize-none"
                        />
                      </div>
                    )}

                    <button 
                      type="submit" disabled={isTaxPending}
                      className="w-full py-4 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md shadow-zinc-900/10 mt-4"
                    >
                      {isTaxPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {taxEditingId ? "Save Changes" : `Create ${taxType === "CATEGORY" ? "Category" : "Tag"}`}
                    </button>
                  </form>
                </div>
              </div>

              {/* Lists Panel */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Categories */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm shadow-zinc-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                      <Folder className="w-5 h-5 text-zinc-400" /> Categories
                    </h4>
                    <span className="px-3 py-1 bg-[#f2f2f2] rounded-full text-xs font-medium text-zinc-600">
                      {categoriesList.length} Total
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoriesList.map(cat => (
                      <div key={cat.id} className="p-5 bg-[#f2f2f2] rounded-[24px] group hover:bg-zinc-200/60 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-base font-semibold text-zinc-900">{cat.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">/{cat.slug}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditTax("CATEGORY", cat)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-full transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteTax("CATEGORY", cat.id, cat.name)} disabled={isDeletingCat} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        {cat.description && <p className="text-sm text-zinc-600 line-clamp-2 mt-2">{cat.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm shadow-zinc-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-zinc-400" /> Tags
                    </h4>
                    <span className="px-3 py-1 bg-[#f2f2f2] rounded-full text-xs font-medium text-zinc-600">
                      {tagsList.length} Total
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {tagsList.map(tag => (
                      <div key={tag.id} className="flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] rounded-full group hover:bg-zinc-200/80 transition-colors">
                        <span className="text-sm font-medium text-zinc-700">#{tag.name}</span>
                        <div className="flex items-center gap-1 overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300 opacity-0 group-hover:opacity-100 pl-2 border-l border-zinc-300">
                          <button onClick={() => handleEditTax("TAG", tag)} className="text-zinc-400 hover:text-zinc-900"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteTax("TAG", tag.id, tag.name)} disabled={isDeletingTag} className="text-zinc-400 hover:text-red-500 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}