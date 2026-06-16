"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, Trash2, 
  ChevronLeft, ChevronRight, Loader2, ArrowLeft,
  CheckCircle2, Edit3, BarChart3, Clock,
  MoreHorizontal, PenTool, ExternalLink, ImagePlus
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

export default function AuthorDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user: currentUser } = useAuthStore();
  
  // Tabs State: "POSTS" | "ANALYTICS" | "TAXONOMY"
  const [activeTab, setActiveTab] = useState("POSTS");

  // Local State for Posts Table
  const [postPage, setPostPage] = useState(1);
  const [postSearch, setPostSearch] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState("");
  const [debouncedPostSearch, setDebouncedPostSearch] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState([]);

  // Local State for Taxonomy
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
        toast.error("Security Breach: You do not have Author clearance.");
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
  const postFilters = { page: postPage, limit: 10, ...(debouncedPostSearch && { search: debouncedPostSearch }), ...(postStatusFilter && { status: postStatusFilter }) };
  const { data: postsRes, isLoading: postsLoading } = useGetAllPostsAdminQuery(postFilters);
  const postsList = postsRes?.data?.posts || postsRes?.posts || [];
  const postPagination = postsRes?.data?.pagination || postsRes?.pagination || {};

  // Taxonomy
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

  // Post Handlers
  const handleDeletePost = (postId, title) => {
    if (window.confirm(`Are you sure you want to delete post: "${title}"?`)) {
      deletePost(postId);
    }
  };

  // Bulk Operations
  const handleSelectAllPosts = (e) => {
    if (e.target.checked) setSelectedPostIds(postsList.map(p => p.id));
    else setSelectedPostIds([]);
  };

  const toggleSelectPost = (id) => {
    setSelectedPostIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const handleBulkUpdate = (status) => {
    if (selectedPostIds.length === 0) return toast.error("Select at least one post.");
    if (window.confirm(`Update ${selectedPostIds.length} posts to ${status}?`)) {
      bulkUpdatePosts({ payload: { postIds: selectedPostIds, status } }, {
        onSuccess: () => setSelectedPostIds([]) // clear selection after success
      });
    }
  };

  // Taxonomy Handlers
  const handleTaxSubmit = (e) => {
    e.preventDefault();
    if (!taxName.trim()) return toast.error("Name is required");

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
    if (window.confirm(`Delete ${type.toLowerCase()}: "${name}"? This action cannot be undone.`)) {
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
          className="absolute top-0 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[140px]"
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
        >
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-blue-500 text-sm font-bold mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Workspace
            </Link>
            <div className="flex items-center gap-3">
              <PenTool className="w-10 h-10 text-blue-500" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[var(--color-foreground)]">
                Author Panel
              </h1>
            </div>
            <p className="text-[var(--color-muted)] text-lg font-medium mt-2">
              Manage all platform content, publish drafts, and review engagement.
            </p>
          </div>
        </motion.div>

        {/* TABS NAVIGATION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 bg-[var(--color-surface)]/60 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--color-border)]/50 inline-flex w-full md:w-auto overflow-x-auto"
        >
          {["POSTS", "ANALYTICS", "TAXONOMY"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === tab 
                  ? "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]" 
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-border)]/50 transparent border-transparent"
              }`}
            >
              {tab === "ANALYTICS" && <BarChart3 className="w-4 h-4" />}
              {tab === "POSTS" && <FileText className="w-4 h-4" />}
              {tab === "TAXONOMY" && <CheckCircle2 className="w-4 h-4" />}
              {tab}
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
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              {/* Toolbar & Bulk Actions */}
              <div className="flex flex-col xl:flex-row gap-4 mb-6 justify-between items-start xl:items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                    <input 
                      type="text" placeholder="Search posts..." value={postSearch} onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-[var(--color-brand-accent)] transition-all"
                    />
                  </div>
                  <select 
                    value={postStatusFilter} onChange={(e) => { setPostStatusFilter(e.target.value); setPostPage(1); }}
                    className="bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-[var(--color-brand-accent)] transition-all cursor-pointer w-full md:w-48"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Drafts</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                
                {/* Bulk Actions Panel */}
                <AnimatePresence>
                  {selectedPostIds.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-brand-primary)]/50 p-2 rounded-2xl shadow-lg w-full xl:w-auto"
                    >
                      <span className="text-xs font-bold px-3 text-[var(--color-brand-primary)]">{selectedPostIds.length} Selected</span>
                      <button onClick={() => handleBulkUpdate("PUBLISHED")} disabled={isBulkUpdating} className="text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-xl hover:bg-green-500/20 transition-all">Publish</button>
                      <button onClick={() => handleBulkUpdate("DRAFT")} disabled={isBulkUpdating} className="text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 px-4 py-2 rounded-xl hover:bg-orange-500/20 transition-all">Draft</button>
                      <button onClick={() => handleBulkUpdate("ARCHIVED")} disabled={isBulkUpdating} className="text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-all">Archive</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Table */}
              <div className="bg-[var(--color-surface)]/40 backdrop-blur-xl border border-[var(--color-border)]/60 rounded-3xl shadow-2xl overflow-hidden relative min-h-[400px]">
                {postsLoading && <div className="absolute inset-0 bg-black/5 z-20 flex items-center justify-center backdrop-blur-sm"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-accent)]" /></div>}
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--color-surface)]/80 border-b border-[var(--color-border)]">
                        <th className="p-5 w-10">
                          <input type="checkbox" checked={selectedPostIds.length === postsList.length && postsList.length > 0} onChange={handleSelectAllPosts} className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-background)] accent-[var(--color-brand-primary)] cursor-pointer" />
                        </th>
                        <th className="p-5 text-xs font-extrabold text-[var(--color-muted)] uppercase tracking-widest whitespace-nowrap">Content</th>
                        <th className="p-5 text-xs font-extrabold text-[var(--color-muted)] uppercase tracking-widest whitespace-nowrap">Author</th>
                        <th className="p-5 text-xs font-extrabold text-[var(--color-muted)] uppercase tracking-widest whitespace-nowrap">Status</th>
                        <th className="p-5 text-xs font-extrabold text-[var(--color-muted)] uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]/30">
                      <AnimatePresence>
                        {postsList.length === 0 && !postsLoading ? (
                          <tr><td colSpan="5" className="p-12 text-center text-[var(--color-muted)] font-medium">No posts found.</td></tr>
                        ) : (
                          postsList.map((post) => (
                            <motion.tr 
                              key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="hover:bg-[var(--color-surface)] transition-colors group"
                            >
                              <td className="p-5">
                                <input type="checkbox" checked={selectedPostIds.includes(post.id)} onChange={() => toggleSelectPost(post.id)} className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-brand-primary)] cursor-pointer" />
                              </td>
                              <td className="p-5">
                                <div className="flex flex-col max-w-sm">
                                  <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-bold text-[var(--color-foreground)] line-clamp-1 hover:text-[var(--color-brand-primary)] transition-colors">{post.title}</Link>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span className="text-[10px] font-bold text-[var(--color-muted)]">· {post.viewCount} Views</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5">
                                <div className="text-sm font-bold text-[var(--color-foreground)]">{post.author?.name || 'Unknown'}</div>
                              </td>
                              <td className="p-5">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                                  post.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                  post.status === 'DRAFT' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                  {post.status}
                                </span>
                              </td>
                              <td className="p-5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link href={`/editor/dashboard?slug=${post.slug}`} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl transition-colors" title="Edit Content"><Edit3 className="w-4 h-4" /></Link>
                                  <button onClick={() => handleDeletePost(post.id, post.title)} disabled={isDeletingPost} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors disabled:opacity-50" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Post Pagination */}
              {postPagination?.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-2">
                  <span className="text-xs font-bold text-[var(--color-muted)]">Page {postPage} of {postPagination.totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPostPage(p => Math.max(1, p - 1))} disabled={postPage === 1} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-border)] disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setPostPage(p => Math.min(postPagination.totalPages, p + 1))} disabled={postPage === postPagination.totalPages} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-border)] disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* 2. ANALYTICS TAB */}
          {/* ==================================================== */}
          {activeTab === "ANALYTICS" && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {statsLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-primary)]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Post Stats */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-brand-accent)]/50 transition-all">
                    <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2">Total Posts</p>
                    <p className="text-4xl font-extrabold text-[var(--color-foreground)] mb-4">{postStats.totalPosts || 0}</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm col-span-1 lg:col-span-3 flex items-center justify-around flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{postStats.statusDistribution?.PUBLISHED || 0}</p>
                      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Published</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-500">{postStats.statusDistribution?.DRAFT || 0}</p>
                      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Drafts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{postStats.statusDistribution?.ARCHIVED || 0}</p>
                      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Archived</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--color-foreground)]">{postStats.totalViews || 0}</p>
                      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Platform Views</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* 3. TAXONOMY TAB */}
          {/* ==================================================== */}
          {activeTab === "TAXONOMY" && (
            <motion.div 
              key="taxonomy"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Form Panel */}
              <div className="lg:col-span-1">
                <div className="p-6 bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-3xl sticky top-24 shadow-sm">
                  <h3 className="text-xl font-extrabold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
                    {taxEditingId ? "Edit" : "Create"} Taxonomy
                    {taxEditingId && <button onClick={resetTaxForm} className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md hover:bg-red-500/20 ml-auto transition-colors">Cancel Edit</button>}
                  </h3>
                  
                  <form onSubmit={handleTaxSubmit} className="space-y-4">
                    <div className="flex gap-2 p-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl">
                      {["CATEGORY", "TAG"].map(type => (
                        <button
                          key={type} type="button" onClick={() => { setTaxType(type); resetTaxForm(); }}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${taxType === type ? "bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest block mb-2">Name</label>
                      <input 
                        type="text" required value={taxName} onChange={(e) => setTaxName(e.target.value)}
                        placeholder={`e.g. ${taxType === "CATEGORY" ? "Technology" : "reactjs"}`}
                        className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[var(--color-brand-accent)] transition-all"
                      />
                    </div>

                    {taxType === "CATEGORY" && (
                      <div>
                        <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest block mb-2">Description (Optional)</label>
                        <textarea 
                          value={taxDesc} onChange={(e) => setTaxDesc(e.target.value)} rows="3"
                          placeholder="Brief description of this category..."
                          className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[var(--color-brand-accent)] transition-all resize-none"
                        />
                      </div>
                    )}

                    <button 
                      type="submit" disabled={isTaxPending}
                      className="w-full bg-[var(--color-brand-primary)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      {isTaxPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {taxEditingId ? "Save Changes" : `Create ${taxType.toLowerCase()}`}
                    </button>
                  </form>
                </div>
              </div>

              {/* Lists Panel */}
              <div className="lg:col-span-2 space-y-8">
                {/* Categories */}
                <div className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-[var(--color-border)]/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">Categories <span className="text-xs bg-[var(--color-background)] border border-[var(--color-border)] px-2 py-0.5 rounded-full">{categoriesList.length}</span></h4>
                    {catsLoading && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-accent)]" />}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoriesList.map(cat => (
                      <div key={cat.id} className="p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl group hover:border-[var(--color-brand-primary)]/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-[var(--color-foreground)]">{cat.name}</p>
                            <p className="text-xs text-[var(--color-muted)] font-mono mt-1">/{cat.slug}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditTax("CATEGORY", cat)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteTax("CATEGORY", cat.id, cat.name)} disabled={isDeletingCat} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        {cat.description && <p className="text-xs text-[var(--color-muted)] mt-2 line-clamp-2">{cat.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-[var(--color-surface)]/40 backdrop-blur-md border border-[var(--color-border)]/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">Tags <span className="text-xs bg-[var(--color-background)] border border-[var(--color-border)] px-2 py-0.5 rounded-full">{tagsList.length}</span></h4>
                    {tagsLoading && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-accent)]" />}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {tagsList.map(tag => (
                      <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-full group hover:border-[var(--color-brand-primary)]/50 transition-colors">
                        <span className="text-xs font-bold text-[var(--color-foreground)]">#{tag.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditTax("TAG", tag)} className="text-blue-500 hover:text-blue-400"><Edit3 className="w-3 h-3" /></button>
                          <button onClick={() => handleDeleteTax("TAG", tag.id, tag.name)} disabled={isDeletingTag} className="text-red-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
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
