"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Shield, Search, Ban, Trash2, 
  ArrowLeft, ArrowRight, Loader2,
  CheckCircle2, XCircle, FileText, CheckSquare, BarChart3,
  MoreHorizontal, Calendar, Mail, Check, PenTool, ExternalLink,
  Edit3, X, ImagePlus, Folder, Tag, LayoutDashboard, Home, User, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

// Queries & Mutations
import { useGetAllUsersQuery, useAdminUserStatsQuery } from "@/hooks/queries/useUserQueries";
import { useGetAllPostsAdminQuery, useAdminPostStatsQuery } from "@/hooks/queries/usePostQueries";
import { 
  useUpdateUserRoleMutation, 
  useToggleUserBanMutation, 
  useAdminDeleteUserMutation 
} from "@/hooks/mutations/useUserMutations";
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

// Fluid easing for high-end cinematic feel
const fluidEase = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: fluidEase } }
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user: currentUser } = useAuthStore();
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("ANALYTICS");

  // Local State for Users Table
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

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
  const [taxType, setTaxType] = useState("CATEGORY"); 

  // Debouncers
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedUserSearch(userSearch); setUserPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [userSearch]);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedPostSearch(postSearch); setPostPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [postSearch]);

  // Auth Guard
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) router.push("/login");
      else if (currentUser?.role !== "ADMIN") {
        toast.error("Access denied. Admin privileges required.");
        router.push("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, currentUser, router]);

  // -------------------------
  // 1. DATA FETCHING HOOKS
  // -------------------------
  const { data: userStatsRes, isLoading: statsLoading1 } = useAdminUserStatsQuery();
  const { data: postStatsRes, isLoading: statsLoading2 } = useAdminPostStatsQuery();
  const userStats = userStatsRes?.data || userStatsRes || {};
  const postStats = postStatsRes?.data || postStatsRes || {};

  const userFilters = { page: userPage, limit: 12, ...(debouncedUserSearch && { search: debouncedUserSearch }), ...(userRoleFilter && { role: userRoleFilter }) };
  const { data: usersRes, isLoading: usersLoading } = useGetAllUsersQuery(userFilters);
  const usersList = usersRes?.data?.users || usersRes?.users || [];
  const userPagination = usersRes?.data?.pagination || usersRes?.pagination || {};

  const postFilters = { page: postPage, limit: 12, ...(debouncedPostSearch && { search: debouncedPostSearch }), ...(postStatusFilter && { status: postStatusFilter }) };
  const { data: postsRes, isLoading: postsLoading } = useGetAllPostsAdminQuery(postFilters);
  const postsList = postsRes?.data?.posts || postsRes?.posts || [];
  const postPagination = postsRes?.data?.pagination || postsRes?.pagination || {};

  const { data: catRes, isLoading: catsLoading } = useGetCategoriesQuery();
  const categoriesList = catRes?.data?.categories || catRes?.categories || catRes?.data || [];
  
  const { data: tagRes, isLoading: tagsLoading } = useGetTagsQuery();
  const tagsList = tagRes?.data?.tags || tagRes?.tags || tagRes?.data || [];

  // -------------------------
  // 2. MUTATION HOOKS
  // -------------------------
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRoleMutation();
  const { mutate: toggleBan, isPending: isTogglingBan } = useToggleUserBanMutation();
  const { mutate: deleteUser, isPending: isDeletingUser } = useAdminDeleteUserMutation();
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
  const handleRoleChange = (userId, newRole) => {
    if (userId === currentUser.id) return toast.error("You cannot change your own admin role.");
    updateRole({ id: userId, payload: { role: newRole } });
  };
  
  const handleToggleBan = (userId, currentBanStatus, userName) => {
    if (userId === currentUser.id) return toast.error("You cannot suspend yourself.");
    if (window.confirm(`Are you sure you want to ${currentBanStatus ? "unsuspend" : "suspend"} ${userName}?`)) {
      toggleBan({ id: userId, payload: { isBanned: !currentBanStatus } });
    }
  };
  
  const handleDeleteUser = (userId, userName) => {
    if (userId === currentUser.id) return toast.error("You cannot delete your own account here.");
    if (window.confirm(`Delete user ${userName} and all their data? This cannot be undone.`)) {
      deleteUser(userId);
    }
  };

  const handleDeletePost = (postId, title) => {
    if (window.confirm(`Are you sure you want to delete the post "${title}"?`)) {
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
    if (window.confirm(`Update ${selectedPostIds.length} posts to ${status}?`)) {
      bulkUpdatePosts({ payload: { postIds: selectedPostIds, status } }, {
        onSuccess: () => setSelectedPostIds([])
      });
    }
  };

  const handleTaxSubmit = (e) => {
    e.preventDefault();
    if (!taxName.trim()) return toast.error("Name is required.");

    if (taxType === "CATEGORY") {
      if (taxEditingId) updateCat({ id: taxEditingId, payload: { name: taxName, description: taxDesc } }, { onSuccess: resetTaxForm });
      else createCat({ name: taxName, description: taxDesc }, { onSuccess: resetTaxForm });
    } else {
      if (taxEditingId) updateTag({ id: taxEditingId, payload: { name: taxName } }, { onSuccess: resetTaxForm });
      else createTag({ name: taxName }, { onSuccess: resetTaxForm });
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
          <p className="text-[13px] text-zinc-400 font-medium mt-1">Admin Tools</p>
        </div>

        <nav className="flex flex-col gap-1.5 mb-10 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-3">Navigation</p>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all outline-none">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all outline-none">
            <LayoutDashboard className="w-4 h-4" /> User Dashboard
          </Link>
          <Link href="/author/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all outline-none mt-2">
            <PenTool className="w-4 h-4" /> Author Panel
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold bg-red-50 text-red-600 shadow-sm border border-red-100 mt-2">
            <ShieldAlert className="w-4 h-4" /> Admin Panel
          </div>
        </nav>
      </aside>

      {/* ======================================= */}
      {/* MAIN CONTENT AREA                       */}
      {/* ======================================= */}
      <div className="flex-1 md:ml-[280px] lg:ml-[320px] flex flex-col w-full min-h-screen">
        
        {/* Top Navbar */}
        <header className="flex h-[72px] bg-white/80 backdrop-blur-md border-b border-zinc-200/50 items-center justify-between px-6 lg:px-12 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-[14px] font-semibold tracking-tight">
            <span className="text-zinc-400">System</span>
            <span className="text-zinc-300">/</span>
            <span className="text-red-600">Admin Dashboard</span>
          </div>

          <div className="flex flex-items gap-3 text-right">
             <div className="hidden sm:block">
               <p className="text-[13px] font-bold text-black">{currentUser?.name || "Eklak"}</p>
               <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{currentUser?.role}</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0 shadow-sm">
               {currentUser?.profileImage ? <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
             </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-zinc-200/50 p-4 sticky top-[72px] z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-bold tracking-tight text-red-600">System Admin</h2>
          </div>
        </div>

        {/* Main Body */}
        <main className="p-6 lg:p-12 max-w-[1300px] mx-auto w-full flex-1">
          
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
              System Dashboard
            </h1>
            <p className="text-[14px] text-zinc-500 font-medium max-w-2xl">
              Superuser controls: Manage all network users, oversee platform content, analyze core metrics, and configure global taxonomy.
            </p>
          </motion.div>

          {/* Segmented Control Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: fluidEase, delay: 0.1 }}
            className="flex items-center gap-1 overflow-x-auto w-full md:w-max bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 mb-8 no-scrollbar"
          >
            {["ANALYTICS", "USERS", "POSTS", "CATEGORIES_TAGS"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-[13px] font-bold tracking-wide transition-all duration-200 outline-none flex items-center justify-center gap-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-white text-black shadow-sm border border-zinc-200/50" 
                    : "text-zinc-500 hover:text-black hover:bg-zinc-200/50 border border-transparent"
                }`}
              >
                {tab === "ANALYTICS" && <BarChart3 className="w-4 h-4" />}
                {tab === "USERS" && <Users className="w-4 h-4" />}
                {tab === "POSTS" && <FileText className="w-4 h-4" />}
                {tab === "CATEGORIES_TAGS" && <CheckSquare className="w-4 h-4" />}
                {tab === "CATEGORIES_TAGS" ? "Taxonomies" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            
            {/* ==================================================== */}
            {/* 1. ANALYTICS TAB */}
            {/* ==================================================== */}
            {activeTab === "ANALYTICS" && (
              <motion.div 
                key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: fluidEase }}
                className="space-y-8"
              >
                {(statsLoading1 || statsLoading2) ? (
                  <div className="py-32 flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                  </div>
                ) : (
                  <>
                    {/* User Demographics */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200/60 shadow-sm">
                      <h2 className="text-[15px] font-bold text-black mb-6 flex items-center gap-2 border-b border-zinc-100 pb-4">
                        <Users className="w-4 h-4 text-zinc-400" /> User Demographics
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                        <div className="flex flex-col items-center text-center p-5 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                          <p className="text-3xl font-black text-black mb-1">{userStats.totalUsers || 0}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total Users</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-zinc-50 border border-[#E7000B]/80 rounded-xl">
                          <p className="text-3xl font-black text-red-600 mb-1">{userStats.roleDistribution?.ADMIN || 0}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Admins</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-zinc-50 border border-[#6CBE8A]/80 rounded-xl">
                          <p className="text-3xl font-black text-black mb-1">{userStats.roleDistribution?.AUTHOR || 0}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Authors</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-zinc-50 border border-[#F54A00]/80 rounded-xl">
                          <p className="text-3xl font-black text-black mb-1">{userStats.roleDistribution?.WRITER || 0}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Writers</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-zinc-50 border border-[#155DFC]/80 rounded-xl">
                          <p className="text-3xl font-black text-black mb-1">{userStats.roleDistribution?.USER || 0}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">USERS</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Metrics */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200/60 shadow-sm">
                      <h2 className="text-[15px] font-bold text-black mb-6 flex items-center gap-2 border-b border-zinc-100 pb-4">
                        <FileText className="w-4 h-4 text-zinc-400" /> Platform Content
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="flex flex-col items-center text-center p-5 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                          <p className="text-3xl font-black text-black mb-1">{postStats.totalPosts || 0}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total Posts</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-green-50 border border-green-100 rounded-xl">
                          <p className="text-3xl font-black text-green-600 mb-1">{postStats.statusDistribution?.PUBLISHED || 0}</p>
                          <p className="text-[11px] font-bold text-green-600/70 uppercase tracking-widest">Published</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-orange-50 border border-orange-100 rounded-xl">
                          <p className="text-3xl font-black text-orange-600 mb-1">{postStats.statusDistribution?.DRAFT || 0}</p>
                          <p className="text-[11px] font-bold text-orange-600/70 uppercase tracking-widest">Drafts</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-3xl font-black text-blue-600 mb-1">{postStats.totalViews || 0}</p>
                          <p className="text-[11px] font-bold text-blue-600/70 uppercase tracking-widest">Total Views</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ==================================================== */}
            {/* 2. USERS TAB */}
            {/* ==================================================== */}
            {activeTab === "USERS" && (
              <motion.div 
                key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: fluidEase }}
              >
                {/* Toolbar */}
                <div className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black pl-10 pr-4 py-2.5 rounded-lg text-[13px] font-medium outline-none focus:ring-1 focus:ring-black transition-all text-black placeholder-zinc-400"
                      />
                    </div>
                    <div className="relative w-full sm:w-48">
                      <select 
                        value={userRoleFilter} onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); setExpandedUserId(null); }}
                        className="appearance-none w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black py-2.5 pr-10 pl-4 rounded-lg text-[13px] font-bold text-black outline-none focus:ring-1 focus:ring-black cursor-pointer transition-all"
                      >
                        <option value="">All Roles</option>
                        <option value="USER">Users</option>
                        <option value="WRITER">Writers</option>
                        <option value="AUTHOR">Authors</option>
                        <option value="ADMIN">Admins</option>
                      </select>
                      <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden relative min-h-[500px]">
                  {usersLoading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                          <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">User</th>
                          <th className="py-4 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                          <th className="py-4 px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                          <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right whitespace-nowrap">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        <AnimatePresence mode="popLayout">
                          {usersList.length === 0 && !usersLoading ? (
                            <tr><td colSpan="4" className="py-16 text-center text-[14px] font-medium text-zinc-500">No users found.</td></tr>
                          ) : (
                            usersList.map((usr) => (
                              <React.Fragment key={usr.id}>
                                <motion.tr 
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  onClick={() => setExpandedUserId(expandedUserId === usr.id ? null : usr.id)}
                                  className={`transition-colors group cursor-pointer ${expandedUserId === usr.id ? 'bg-zinc-50/80' : 'hover:bg-zinc-50/50'}`}
                                >
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center font-bold text-zinc-500 overflow-hidden shrink-0 shadow-sm">
                                        {usr.image ? <img src={usr.image} alt="" className="w-full h-full object-cover" /> : usr.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col">
                                        <p className="text-[14px] font-bold text-black line-clamp-1 group-hover:text-zinc-600 transition-colors">{usr.name}</p>
                                        <p className="text-[12px] font-medium text-zinc-500 line-clamp-1">{usr.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                                      usr.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                    }`}>
                                      {usr.role}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    {usr.isBanned ? (
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">Suspended</span>
                                    ) : (
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">Active</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-right relative">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === usr.id ? null : usr.id); }}
                                      className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors outline-none"
                                    >
                                      <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Popover Menu */}
                                    <AnimatePresence>
                                      {activeMenuId === usr.id && (
                                        <motion.div 
                                          initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 5 }} transition={{ duration: 0.15 }}
                                          className="absolute right-14 top-10 w-48 bg-white border border-zinc-200/80 rounded-xl shadow-xl z-50 overflow-hidden text-left"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="p-1.5 border-b border-zinc-100">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-1.5 pt-1.5">Change Role</p>
                                            {["USER", "WRITER", "AUTHOR", "ADMIN"].map(role => (
                                              <button 
                                                key={role} onClick={() => { handleRoleChange(usr.id, role); setActiveMenuId(null); }} disabled={usr.role === role || isUpdatingRole || usr.id === currentUser.id}
                                                className="w-full text-left px-3 py-2 text-[12px] font-bold text-black hover:bg-zinc-100 transition-colors flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed rounded-md outline-none"
                                              >
                                                {role.charAt(0) + role.slice(1).toLowerCase()} {usr.role === role && <Check className="w-3.5 h-3.5 text-black" />}
                                              </button>
                                            ))}
                                          </div>
                                          <div className="p-1.5">
                                            <button 
                                              onClick={() => { handleToggleBan(usr.id, usr.isBanned, usr.name); setActiveMenuId(null); }} disabled={isTogglingBan || usr.id === currentUser.id}
                                              className="w-full text-left px-3 py-2 text-[12px] font-bold text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-md outline-none"
                                            >
                                              <Ban className="w-3.5 h-3.5" /> {usr.isBanned ? "Unsuspend" : "Suspend"}
                                            </button>
                                            <button 
                                              onClick={() => { handleDeleteUser(usr.id, usr.name); setActiveMenuId(null); }} disabled={isDeletingUser || usr.id === currentUser.id}
                                              className="w-full text-left px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-md outline-none mt-1"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" /> Delete User
                                            </button>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </td>
                                </motion.tr>

                                {/* Expanded Detail Drawer */}
                                <AnimatePresence>
                                  {expandedUserId === usr.id && (
                                    <motion.tr 
                                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                      className="bg-zinc-50 border-b border-zinc-200 overflow-hidden shadow-inner"
                                    >
                                      <td colSpan="4" className="p-0">
                                        <div className="px-6 py-6 border-l-2 border-black ml-6 my-2 bg-white rounded-r-xl shadow-sm">
                                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Detailed Intel</h4>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Email</p>
                                              <p className="text-[13px] font-bold text-black">{usr.email}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Joined</p>
                                              <p className="text-[13px] font-bold text-black">{new Date(usr.createdAt).toLocaleDateString()}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  )}
                                </AnimatePresence>
                              </React.Fragment>
                            ))
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Close Menus Layer */}
                  {activeMenuId && <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />}
                  
                  {/* User Pagination */}
                  {userPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center p-5 border-t border-zinc-200 bg-zinc-50">
                      <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="px-4 py-2 text-[12px] font-bold text-black bg-white border border-zinc-200/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm">
                        Previous
                      </button>
                      <span className="text-[12px] font-bold text-zinc-500 tracking-widest">
                        PAGE {userPage} OF {userPagination.totalPages}
                      </span>
                      <button onClick={() => setUserPage(p => Math.min(userPagination.totalPages, p + 1))} disabled={userPage === userPagination.totalPages} className="px-4 py-2 text-[12px] font-bold text-black bg-white border border-zinc-200/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ==================================================== */}
            {/* 3. POSTS TAB */}
            {/* ==================================================== */}
            {activeTab === "POSTS" && (
              <motion.div 
                key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: fluidEase }}
              >
                {/* Toolbar */}
                <div className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text" placeholder="Search articles..." value={postSearch} onChange={(e) => setPostSearch(e.target.value)}
                        className="w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black pl-10 pr-4 py-2.5 rounded-lg text-[13px] font-medium outline-none focus:ring-1 focus:ring-black transition-all text-black placeholder-zinc-400"
                      />
                    </div>
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
                  
                  {/* Bulk Actions */}
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

                {/* Posts Table */}
                <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden relative min-h-[400px]">
                  {postsLoading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                          <th className="py-4 px-5 w-12"><input type="checkbox" checked={selectedPostIds.length === postsList.length && postsList.length > 0} onChange={handleSelectAllPosts} className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer" /></th>
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
                              <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-zinc-50/50 transition-colors group">
                                <td className="py-4 px-5"><input type="checkbox" checked={selectedPostIds.includes(post.id)} onChange={() => toggleSelectPost(post.id)} className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer" /></td>
                                <td className="py-4 px-4 min-w-[250px]">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 bg-zinc-100 border border-zinc-200/50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                                      {post.coverImage ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ImagePlus className="w-4 h-4 text-zinc-400" />}
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
                                <td className="py-4 px-4"><div className="text-[13px] text-zinc-700 font-bold">{post.author?.name || 'System'}</div></td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md border ${
                                    post.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : post.status === 'DRAFT' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                                  }`}>{post.status}</span>
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

                  {postPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center p-5 border-t border-zinc-200 bg-zinc-50">
                      <button onClick={() => setPostPage(p => Math.max(1, p - 1))} disabled={postPage === 1} className="px-4 py-2 text-[12px] font-bold text-black bg-white border border-zinc-200/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm">Previous</button>
                      <span className="text-[12px] font-bold text-zinc-500 tracking-widest">PAGE {postPage} OF {postPagination.totalPages}</span>
                      <button onClick={() => setPostPage(p => Math.min(postPagination.totalPages, p + 1))} disabled={postPage === postPagination.totalPages} className="px-4 py-2 text-[12px] font-bold text-black bg-white border border-zinc-200/80 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm">Next</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ==================================================== */}
            {/* 4. CATEGORIES & TAGS TAB */}
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
                      <h3 className="text-[14px] font-bold tracking-wide uppercase text-black">{taxEditingId ? "Edit Configuration" : "Create New"}</h3>
                      {taxEditingId && (
                        <button onClick={resetTaxForm} className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                    
                    <form onSubmit={handleTaxSubmit} className="space-y-6">
                      <div className="flex p-1 bg-zinc-100 rounded-lg border border-zinc-200/60">
                        {["CATEGORY", "TAG"].map(type => (
                          <button
                            key={type} type="button" onClick={() => { setTaxType(type); resetTaxForm(); }}
                            className={`flex-1 py-2 text-[12px] font-bold tracking-wide rounded-md transition-all outline-none ${taxType === type ? "bg-white text-black shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-black"}`}
                          >
                            {type === "CATEGORY" ? "Category" : "Tag"}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Name</label>
                        <input 
                          type="text" required value={taxName} onChange={(e) => setTaxName(e.target.value)} placeholder={taxType === "CATEGORY" ? "e.g. Engineering" : "e.g. reactjs"}
                          className="w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black rounded-lg px-4 py-3 text-[13px] font-medium text-black outline-none focus:ring-1 focus:ring-black transition-all"
                        />
                      </div>

                      {taxType === "CATEGORY" && (
                        <div>
                          <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Description (Optional)</label>
                          <textarea 
                            value={taxDesc} onChange={(e) => setTaxDesc(e.target.value)} rows="3" placeholder="Brief context..."
                            className="w-full bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-black rounded-lg px-4 py-3 text-[13px] font-medium text-black outline-none focus:ring-1 focus:ring-black transition-all resize-none"
                          />
                        </div>
                      )}

                      <button type="submit" disabled={isTaxPending} className="w-full py-3.5 bg-black text-white text-[13px] font-bold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-sm mt-4">
                        {isTaxPending && <Loader2 className="w-4 h-4 animate-spin" />} {taxEditingId ? "Save Changes" : `Create ${taxType === "CATEGORY" ? "Category" : "Tag"}`}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Lists Panel */}
                <div className="xl:col-span-8 space-y-8 order-1 xl:order-2">
                  <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                      <h4 className="text-[15px] font-bold text-black flex items-center gap-2"><Folder className="w-4 h-4 text-zinc-400" /> Categories</h4>
                      <span className="px-2.5 py-1 bg-zinc-100 rounded-md text-[11px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-200/60">{categoriesList.length} Total</span>
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

                  <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                      <h4 className="text-[15px] font-bold text-black flex items-center gap-2"><Tag className="w-4 h-4 text-zinc-400" /> Tags</h4>
                      <span className="px-2.5 py-1 bg-zinc-100 rounded-md text-[11px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-200/60">{tagsList.length} Total</span>
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