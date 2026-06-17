"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, Trash2, 
  ArrowLeft, ArrowRight, Loader2,
  Edit3, BarChart3, Clock,
  PenTool, CheckSquare, X
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

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
};

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
        toast.error("Security Breach: Insufficient clearance.");
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

  const handleDeletePost = (postId, title) => {
    if (window.confirm(`Confirm permanent purge of transmission: "${title}"?`)) {
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
    if (selectedPostIds.length === 0) return toast.error("Selection required.");
    if (window.confirm(`Update ${selectedPostIds.length} records to [${status}]?`)) {
      bulkUpdatePosts({ payload: { postIds: selectedPostIds, status } }, {
        onSuccess: () => setSelectedPostIds([])
      });
    }
  };

  const handleTaxSubmit = (e) => {
    e.preventDefault();
    if (!taxName.trim()) return toast.error("Nomenclature required.");

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
    if (window.confirm(`Purge ${type.toLowerCase()}: "${name}"?`)) {
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
    // pt-32 ensures full clearance of the global navbar
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30 pt-32 pb-24 px-6 overflow-hidden">
      
      {/* Structural Background Lines (No blur orbs) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[50vh]">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1300px] mx-auto w-full">
        
        {/* ======================================= */}
        {/* HEADER SECTION                          */}
        {/* ======================================= */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-[var(--color-border)]/40 pb-12"
        >
          <div className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <Link href="/dashboard" className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors duration-500 outline-none mb-8">
                <ArrowLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                Return to Workspace
              </Link>
            </motion.div>
            
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-normal tracking-tight text-[var(--color-foreground)] leading-[1.05]">
                Author Suite.
              </h1>
            </motion.div>
            
            <motion.p variants={fadeUp} className="text-[15px] font-light text-[var(--color-muted)] leading-relaxed">
              Command center for content orchestration, taxonomy configuration, and network analytics.
            </motion.p>
          </div>
        </motion.div>

        {/* ======================================= */}
        {/* NAKED TABS NAVIGATION                   */}
        {/* ======================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: cinematicEase, delay: 0.2 }}
          className="flex items-center gap-8 overflow-x-auto w-full border-b border-[var(--color-border)]/40 mb-12"
        >
          {["POSTS", "ANALYTICS", "TAXONOMY"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-500 whitespace-nowrap border-b border-transparent relative top-[1px] outline-none flex items-center gap-2 ${
                activeTab === tab 
                  ? "text-[var(--color-foreground)] border-[var(--color-foreground)]" 
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {tab === "POSTS" && <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {tab === "ANALYTICS" && <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {tab === "TAXONOMY" && <CheckSquare className="w-3.5 h-3.5" strokeWidth={1.5} />}
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
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: cinematicEase }}
            >
              {/* Toolbar & Bulk Actions */}
              <div className="flex flex-col xl:flex-row gap-6 mb-8 justify-between items-start xl:items-center">
                
                <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
                  {/* Minimal Search */}
                  <div className="relative group w-full md:w-80">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] group-focus-within:text-[var(--color-foreground)] transition-colors" strokeWidth={1.5} />
                    <input 
                      type="text" placeholder="Query records..." value={postSearch} onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full bg-transparent border-b border-[var(--color-border)]/50 focus:border-[var(--color-foreground)] pl-6 pr-2 py-2 text-[13px] font-light outline-none transition-colors text-[var(--color-foreground)] placeholder-[var(--color-muted)]"
                    />
                  </div>
                  
                  {/* Minimal Select */}
                  <div className="relative w-full md:w-48">
                    <select 
                      value={postStatusFilter} onChange={(e) => { setPostStatusFilter(e.target.value); setPostPage(1); }}
                      className="appearance-none w-full bg-transparent border-b border-[var(--color-border)]/50 focus:border-[var(--color-foreground)] py-2 pr-6 pl-2 text-[13px] font-light text-[var(--color-muted)] hover:text-[var(--color-foreground)] outline-none cursor-pointer transition-colors"
                    >
                      <option value="" className="text-[var(--color-background)]">All States</option>
                      <option value="DRAFT" className="text-[var(--color-background)]">Drafts</option>
                      <option value="PUBLISHED" className="text-[var(--color-background)]">Published</option>
                      <option value="ARCHIVED" className="text-[var(--color-background)]">Archived</option>
                    </select>
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-muted)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
                
                {/* Bulk Actions Panel (Flat design) */}
                <AnimatePresence>
                  {selectedPostIds.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                      className="flex items-center gap-4 border border-[var(--color-border)]/40 p-2 rounded-none bg-[var(--color-surface)]/10 w-full xl:w-auto"
                    >
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] px-3 text-[var(--color-foreground)]">[{selectedPostIds.length}] Active</span>
                      <div className="w-[1px] h-4 bg-[var(--color-border)]/40"></div>
                      <button onClick={() => handleBulkUpdate("PUBLISHED")} disabled={isBulkUpdating} className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors px-2 outline-none">Publish</button>
                      <button onClick={() => handleBulkUpdate("DRAFT")} disabled={isBulkUpdating} className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors px-2 outline-none">Draft</button>
                      <button onClick={() => handleBulkUpdate("ARCHIVED")} disabled={isBulkUpdating} className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-muted)] hover:text-red-400 transition-colors px-2 outline-none">Archive</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Editorial Table */}
              <div className="relative min-h-[400px]">
                {postsLoading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-background)]/50 backdrop-blur-sm"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} /></div>}
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]/40">
                        <th className="py-4 pr-4 w-10">
                          <input type="checkbox" checked={selectedPostIds.length === postsList.length && postsList.length > 0} onChange={handleSelectAllPosts} className="w-3.5 h-3.5 rounded-none border-[var(--color-border)] bg-transparent accent-[var(--color-brand-primary)] cursor-pointer" />
                        </th>
                        <th className="py-4 px-4 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] whitespace-nowrap">Transmission</th>
                        <th className="py-4 px-4 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] whitespace-nowrap">Entity</th>
                        <th className="py-4 px-4 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] whitespace-nowrap">State</th>
                        <th className="py-4 pl-4 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] text-right whitespace-nowrap">Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]/20">
                      <AnimatePresence>
                        {postsList.length === 0 && !postsLoading ? (
                          <tr><td colSpan="5" className="py-16 text-center text-[13px] font-light text-[var(--color-muted)]">No records present in the active query.</td></tr>
                        ) : (
                          postsList.map((post) => (
                            <motion.tr 
                              key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="hover:bg-[var(--color-surface)]/5 transition-colors group"
                            >
                              <td className="py-5 pr-4">
                                <input type="checkbox" checked={selectedPostIds.includes(post.id)} onChange={() => toggleSelectPost(post.id)} className="w-3.5 h-3.5 rounded-none border-[var(--color-border)] accent-[var(--color-brand-primary)] cursor-pointer" />
                              </td>
                              <td className="py-5 px-4">
                                <div className="flex flex-col max-w-md">
                                  <Link href={`/blog/${post.slug}`} target="_blank" className="text-[14px] font-normal text-[var(--color-foreground)] line-clamp-1 hover:text-[var(--color-brand-primary)] transition-colors duration-500">{post.title}</Link>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[9px] font-mono text-[var(--color-muted)] uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 bg-[var(--color-border)]/50 rounded-none"></span>
                                    <span className="text-[9px] font-mono text-[var(--color-muted)] uppercase tracking-widest">[{post.viewCount}] Reads</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-4">
                                <div className="text-[12px] font-medium text-[var(--color-foreground)]">{post.author?.name || 'System'}</div>
                              </td>
                              <td className="py-5 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-medium tracking-[0.2em] uppercase border rounded-none ${
                                  post.status === 'PUBLISHED' ? 'text-green-500 border-green-500/30' :
                                  post.status === 'DRAFT' ? 'text-orange-500 border-orange-500/30' :
                                  'text-red-500 border-red-500/30'
                                }`}>
                                  {post.status}
                                </span>
                              </td>
                              <td className="py-5 pl-4 text-right">
                                <div className="flex items-center justify-end gap-4 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                  <Link href={`/editor/dashboard?slug=${post.slug}`} className="text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] transition-colors outline-none" title="Modify Record"><Edit3 className="w-4 h-4" strokeWidth={1.5} /></Link>
                                  <button onClick={() => handleDeletePost(post.id, post.title)} disabled={isDeletingPost} className="text-[var(--color-muted)] hover:text-red-400 transition-colors disabled:opacity-30 outline-none" title="Purge Record"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
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
                <div className="flex justify-between items-center mt-12 border-t border-[var(--color-border)]/40 pt-8">
                  <button onClick={() => setPostPage(p => Math.max(1, p - 1))} disabled={postPage === 1} className="group flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-foreground)] disabled:opacity-30 transition-colors outline-none hover:text-[var(--color-brand-accent)]">
                    <ArrowLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} /> Prev
                  </button>
                  <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] font-mono">
                    {postPage} / {postPagination.totalPages}
                  </span>
                  <button onClick={() => setPostPage(p => Math.min(postPagination.totalPages, p + 1))} disabled={postPage === postPagination.totalPages} className="group flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-foreground)] disabled:opacity-30 transition-colors outline-none hover:text-[var(--color-brand-accent)]">
                    Next <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </button>
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
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: cinematicEase }}
              className="space-y-8"
            >
              {statsLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 border-y border-[var(--color-border)]/40 py-12 divide-y md:divide-y-0 lg:divide-x divide-[var(--color-border)]/40">
                  
                  <div className="flex flex-col justify-center items-center text-center">
                    <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4">Total Records</p>
                    <p className="text-5xl font-normal text-[var(--color-foreground)]">{postStats.totalPosts || 0}</p>
                  </div>

                  <div className="flex flex-col justify-center items-center text-center pt-8 md:pt-0">
                    <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4">Published</p>
                    <p className="text-5xl font-normal text-green-500/80">{postStats.statusDistribution?.PUBLISHED || 0}</p>
                  </div>

                  <div className="flex flex-col justify-center items-center text-center pt-8 lg:pt-0">
                    <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4">Drafts</p>
                    <p className="text-5xl font-normal text-orange-500/80">{postStats.statusDistribution?.DRAFT || 0}</p>
                  </div>

                  <div className="flex flex-col justify-center items-center text-center pt-8 lg:pt-0">
                    <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4">Platform Views</p>
                    <p className="text-5xl font-normal text-[var(--color-brand-primary)]">{postStats.totalViews || 0}</p>
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
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: cinematicEase }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-16"
            >
              {/* Form Panel */}
              <div className="lg:col-span-4">
                <div className="border border-[var(--color-border)]/40 p-8 rounded-none bg-[var(--color-surface)]/5">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-4 mb-8">
                    <h3 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] flex items-center gap-2">
                      {taxEditingId ? "Modify" : "Initialize"} Node
                    </h3>
                    {taxEditingId && <button onClick={resetTaxForm} className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-widest hover:text-red-400 outline-none transition-colors"><X className="w-4 h-4" strokeWidth={1.5} /></button>}
                  </div>
                  
                  <form onSubmit={handleTaxSubmit} className="space-y-8">
                    {/* Toggle */}
                    <div className="flex gap-4 border-b border-[var(--color-border)]/40 pb-4">
                      {["CATEGORY", "TAG"].map(type => (
                        <button
                          key={type} type="button" onClick={() => { setTaxType(type); resetTaxForm(); }}
                          className={`text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 outline-none ${taxType === type ? "text-[var(--color-brand-primary)]" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] block mb-2">Nomenclature</label>
                      <input 
                        type="text" required value={taxName} onChange={(e) => setTaxName(e.target.value)}
                        placeholder={taxType === "CATEGORY" ? "Architecture" : "reactjs"}
                        className="w-full bg-transparent border-b border-[var(--color-border)]/50 rounded-none px-2 py-2 text-[13px] font-light outline-none focus:border-[var(--color-foreground)] transition-colors text-[var(--color-foreground)] placeholder-[var(--color-muted)]/50"
                      />
                    </div>

                    {taxType === "CATEGORY" && (
                      <div>
                        <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] block mb-2">Parameters (Optional)</label>
                        <textarea 
                          value={taxDesc} onChange={(e) => setTaxDesc(e.target.value)} rows="3"
                          placeholder="Define the scope..."
                          className="w-full bg-transparent border border-[var(--color-border)]/50 rounded-none px-4 py-3 text-[13px] font-light outline-none focus:border-[var(--color-foreground)] transition-colors resize-none text-[var(--color-foreground)] placeholder-[var(--color-muted)]/50"
                        />
                      </div>
                    )}

                    <button 
                      type="submit" disabled={isTaxPending}
                      className="w-full bg-[var(--color-foreground)] text-[var(--color-background)] font-medium text-[11px] uppercase tracking-[0.15em] py-3.5 rounded-none hover:opacity-90 transition-opacity flex items-center justify-center gap-2 outline-none"
                    >
                      {isTaxPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} /> : null}
                      {taxEditingId ? "Execute Modification" : `Deploy ${taxType}`}
                    </button>
                  </form>
                </div>
              </div>

              {/* Lists Panel */}
              <div className="lg:col-span-8 space-y-16">
                
                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-4 mb-8">
                    <h4 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)]">Modules (Categories)</h4>
                    <span className="text-[10px] font-mono tracking-widest text-[var(--color-muted)]">[{categoriesList.length}]</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {categoriesList.map(cat => (
                      <div key={cat.id} className="p-5 bg-transparent border border-[var(--color-border)]/40 rounded-none group hover:border-[var(--color-foreground)]/30 transition-colors duration-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[14px] font-normal text-[var(--color-foreground)]">{cat.name}</p>
                            <p className="text-[10px] text-[var(--color-muted)] font-mono mt-1 opacity-60">/{cat.slug}</p>
                          </div>
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <button onClick={() => handleEditTax("CATEGORY", cat)} className="text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] transition-colors outline-none"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                            <button onClick={() => handleDeleteTax("CATEGORY", cat.id, cat.name)} disabled={isDeletingCat} className="text-[var(--color-muted)] hover:text-red-400 disabled:opacity-50 transition-colors outline-none"><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                          </div>
                        </div>
                        {cat.description && <p className="text-[12px] font-light text-[var(--color-muted)] leading-relaxed line-clamp-2">{cat.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-4 mb-8">
                    <h4 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)]">Index Tags</h4>
                    <span className="text-[10px] font-mono tracking-widest text-[var(--color-muted)]">[{tagsList.length}]</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {tagsList.map(tag => (
                      <div key={tag.id} className="flex items-center gap-3 px-4 py-2 bg-transparent border border-[var(--color-border)]/50 rounded-none group hover:border-[var(--color-foreground)]/40 transition-colors duration-500">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-foreground)]">#{tag.name}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <button onClick={() => handleEditTax("TAG", tag)} className="text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] outline-none"><Edit3 className="w-3 h-3" strokeWidth={1.5} /></button>
                          <button onClick={() => handleDeleteTax("TAG", tag.id, tag.name)} disabled={isDeletingTag} className="text-[var(--color-muted)] hover:text-red-400 disabled:opacity-50 outline-none"><Trash2 className="w-3 h-3" strokeWidth={1.5} /></button>
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