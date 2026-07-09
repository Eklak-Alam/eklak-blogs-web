"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, PenTool, Bookmark, Settings, 
  LogOut, Loader2, ArrowRight, MessageSquare, Lock, 
  Trash2, X, Camera, ArrowLeft, Heart, ImagePlus, 
  LayoutDashboard, Home, ChevronRight, Edit3
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";
import { useGetMeQuery } from "@/hooks/queries/useUserQueries";
import { useLogoutMutation } from "@/hooks/mutations/useAuthMutations";
import { 
  useUpdateProfileMutation, 
  useChangePasswordMutation, 
  useDeleteMyAccountMutation 
} from "@/hooks/mutations/useUserMutations"; 
import { useGetMyBookmarksQuery, useGetMyLikesQuery } from "@/hooks/queries/useUserQueries";
import { useToggleBookmarkMutation, useToggleLikeMutation } from "@/hooks/mutations/useInteractionMutations";

// Fluid easing for high-end cinematic feel
const fluidEase = [0.25, 0.1, 0.25, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: fluidEase } }
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { mutate: logoutUser, isPending: isLoggingOut } = useLogoutMutation();

  const { data: response, isLoading, isError } = useGetMeQuery();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePasswordMutation();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteMyAccountMutation();

  const userData = response?.user || response?.data?.user;

  // Tabs for main content area
  const [activeTab, setActiveTab] = useState("SAVED");

  // Pagination & Data: Bookmarks
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const { data: bookmarksRes, isLoading: isBookmarksLoading } = useGetMyBookmarksQuery({ page: bookmarkPage, limit: 5 });
  const bookmarksList = bookmarksRes?.bookmarks || bookmarksRes?.data?.bookmarks || [];
  const bookmarksPagination = bookmarksRes?.pagination || bookmarksRes?.data?.pagination || {};
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmarkMutation();

  // Pagination & Data: Likes
  const [likePage, setLikePage] = useState(1);
  const { data: likesRes, isLoading: isLikesLoading } = useGetMyLikesQuery({ page: likePage, limit: 5 });
  const likesList = likesRes?.likes || likesRes?.data?.likes || [];
  const likesPagination = likesRes?.pagination || likesRes?.data?.pagination || {};
  const { mutate: toggleLike, isPending: isTogglingLike } = useToggleLikeMutation();

  // Settings Panel State
  const [activeSetting, setActiveSetting] = useState(null); 
  const [avatarBase64, setAvatarBase64] = useState(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm } = useForm();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max size is 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarBase64(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const onUpdateProfile = (data) => {
    const payload = {};
    if (data.name && data.name !== userData.name) payload.name = data.name;
    if (data.phoneNumber && data.phoneNumber !== userData.phoneNumber) payload.phoneNumber = data.phoneNumber;
    if (avatarBase64) payload.image = avatarBase64;
    
    if (Object.keys(payload).length === 0) {
      toast.info("No changes made.");
      setActiveSetting(null);
      return;
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully.");
        setAvatarBase64(null);
        setActiveSetting(null);
      }
    });
  };

  const onChangePassword = (data) => {
    changePassword(data, {
      onSuccess: () => {
        toast.success("Password updated successfully.");
        resetPasswordForm();
        setActiveSetting(null);
      }
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you absolute sure? This will permanently delete your account and all data.")) {
      deleteAccount();
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[#fafafa]">
        <Loader2 className="w-6 h-6 text-black animate-spin" strokeWidth={2.5} />
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#fafafa]">
        <p className="text-[14px] text-zinc-500 font-medium mb-4">Could not load your profile.</p>
        <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-bold transition-colors">
          Log in again
        </button>
      </div>
    );
  }

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
          <p className="text-[13px] text-zinc-400 font-medium mt-1">User Dashboard</p>
        </div>

        <nav className="flex flex-col gap-1.5 mb-10 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-3">Menu</p>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all outline-none">
            <Home className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold bg-zinc-100/80 text-black shadow-sm border border-zinc-200/50">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </div>
          {userData.role !== "USER" && (
            <Link href="/writer/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all outline-none mt-2">
              <PenTool className="w-4 h-4" /> Writer Hub
            </Link>
          )}
          {userData.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-all outline-none mt-2">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        <button 
          onClick={() => logoutUser()}
          disabled={isLoggingOut}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all outline-none w-full"
        >
          {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Log Out
        </button>
      </aside>

      {/* ======================================= */}
      {/* MAIN CONTENT AREA                       */}
      {/* ======================================= */}
      <div className="flex-1 md:ml-[280px] lg:ml-[320px] flex flex-col w-full min-h-screen">
        
        {/* Top Navbar */}
        <header className="flex h-[72px] bg-white/80 backdrop-blur-md border-b border-zinc-200/50 items-center justify-between px-6 lg:px-12 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-[14px] font-semibold tracking-tight">
            <span className="text-zinc-400">Account</span>
            <span className="text-zinc-300">/</span>
            <span className="text-black">Overview</span>
          </div>

          <div className="flex flex-items gap-3 text-right">
             <div className="hidden sm:block">
               <p className="text-[13px] font-bold text-black">{userData.name}</p>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{userData.role}</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0 shadow-sm">
               {userData.image ? <img src={userData.image} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
             </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="p-6 lg:p-12 max-w-[1200px] mx-auto w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Main Features & Content */}
            <motion.div 
              initial="hidden" animate="visible" variants={containerVariants}
              className="lg:col-span-8 flex flex-col gap-8"
            >
              {/* Profile Header Card */}
              <motion.div variants={itemVariants} className="bg-white border border-zinc-200/60 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-2 border-zinc-100 flex-shrink-0 bg-zinc-50 relative overflow-hidden">
                    {userData.image ? (
                      <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-zinc-400">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold tracking-tight text-black">{userData.name}</h1>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                        {userData.role}
                      </span>
                    </div>
                    <p className="text-[14px] text-zinc-500 font-medium">{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="text-center px-4">
                    <p className="text-2xl font-black text-black">{userData._count?.bookmarks || 0}</p>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Saved</p>
                  </div>
                  <div className="w-px bg-zinc-200"></div>
                  <div className="text-center px-4">
                    <p className="text-2xl font-black text-black">{userData._count?.comments || 0}</p>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Comments</p>
                  </div>
                </div>
              </motion.div>

              {/* Feed: Saved & Liked Tabs */}
              <motion.div variants={itemVariants} className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                
                {/* Tab Header */}
                <div className="flex border-b border-zinc-100 bg-zinc-50/50">
                  <button 
                    onClick={() => setActiveTab("SAVED")}
                    className={`flex-1 py-4 text-[13px] font-bold tracking-wide transition-colors outline-none flex items-center justify-center gap-2 ${
                      activeTab === "SAVED" ? "text-black bg-white border-b-2 border-black" : "text-zinc-500 hover:text-black hover:bg-zinc-100/50"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" /> Saved Posts
                  </button>
                  <button 
                    onClick={() => setActiveTab("LIKED")}
                    className={`flex-1 py-4 text-[13px] font-bold tracking-wide transition-colors outline-none flex items-center justify-center gap-2 ${
                      activeTab === "LIKED" ? "text-black bg-white border-b-2 border-black" : "text-zinc-500 hover:text-black hover:bg-zinc-100/50"
                    }`}
                  >
                    <Heart className="w-4 h-4" /> Liked Posts
                  </button>
                </div>

                {/* Tab Content: SAVED */}
                {activeTab === "SAVED" && (
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    {isBookmarksLoading ? (
                      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>
                    ) : bookmarksList.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Bookmark className="w-10 h-10 text-zinc-200 mb-4" />
                        <p className="text-[15px] font-bold text-black mb-1">No saved posts</p>
                        <p className="text-[13px] text-zinc-500">Articles you bookmark will appear here.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {bookmarksList.map(post => (
                          <div key={post.bookmarkId} className="group flex flex-col sm:flex-row gap-5 pb-6 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="w-full sm:w-40 aspect-video flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden relative border border-zinc-200/50">
                              {post.coverImage ? (
                                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImagePlus className="w-5 h-5" /></div>
                              )}
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                  {new Date(post.bookmarkedAt).toLocaleDateString()}
                                </span>
                                <button onClick={() => toggleBookmark(post.id)} disabled={isTogglingBookmark} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 outline-none">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <Link href={`/blog/${post.slug}`} className="text-[16px] font-bold text-black hover:text-zinc-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                                {post.title}
                              </Link>
                              <p className="text-[13px] text-zinc-500 font-medium line-clamp-2">{post.excerpt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Pagination Settings */}
                    {bookmarksPagination?.totalPages > 1 && (
                      <div className="flex justify-between items-center mt-auto pt-6 border-t border-zinc-100">
                        <button onClick={() => setBookmarkPage(p => Math.max(1, p - 1))} disabled={bookmarkPage === 1} className="px-4 py-2 text-[12px] font-bold text-black border border-zinc-200 rounded-lg disabled:opacity-30 hover:bg-zinc-50 transition-colors">Prev</button>
                        <span className="text-[12px] font-bold text-zinc-400 tracking-widest">{bookmarkPage} / {bookmarksPagination.totalPages}</span>
                        <button onClick={() => setBookmarkPage(p => Math.min(bookmarksPagination.totalPages, p + 1))} disabled={bookmarkPage === bookmarksPagination.totalPages} className="px-4 py-2 text-[12px] font-bold text-black border border-zinc-200 rounded-lg disabled:opacity-30 hover:bg-zinc-50 transition-colors">Next</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content: LIKED */}
                {activeTab === "LIKED" && (
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    {isLikesLoading ? (
                      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>
                    ) : likesList.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Heart className="w-10 h-10 text-zinc-200 mb-4" />
                        <p className="text-[15px] font-bold text-black mb-1">No liked posts</p>
                        <p className="text-[13px] text-zinc-500">Articles you like will appear here.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {likesList.map(post => (
                          <div key={post.likeId} className="group flex flex-col sm:flex-row gap-5 pb-6 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="w-full sm:w-40 aspect-video flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden relative border border-zinc-200/50">
                              {post.coverImage ? (
                                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImagePlus className="w-5 h-5" /></div>
                              )}
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                  {new Date(post.likedAt).toLocaleDateString()}
                                </span>
                                <button onClick={() => toggleLike({ postId: post.id })} disabled={isTogglingLike} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 outline-none">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <Link href={`/blog/${post.slug}`} className="text-[16px] font-bold text-black hover:text-zinc-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                                {post.title}
                              </Link>
                              <p className="text-[13px] text-zinc-500 font-medium line-clamp-2">{post.excerpt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Pagination Settings */}
                    {likesPagination?.totalPages > 1 && (
                      <div className="flex justify-between items-center mt-auto pt-6 border-t border-zinc-100">
                        <button onClick={() => setLikePage(p => Math.max(1, p - 1))} disabled={likePage === 1} className="px-4 py-2 text-[12px] font-bold text-black border border-zinc-200 rounded-lg disabled:opacity-30 hover:bg-zinc-50 transition-colors">Prev</button>
                        <span className="text-[12px] font-bold text-zinc-400 tracking-widest">{likePage} / {likesPagination.totalPages}</span>
                        <button onClick={() => setLikePage(p => Math.min(likesPagination.totalPages, p + 1))} disabled={likePage === likesPagination.totalPages} className="px-4 py-2 text-[12px] font-bold text-black border border-zinc-200 rounded-lg disabled:opacity-30 hover:bg-zinc-50 transition-colors">Next</button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* ======================================= */}
            {/* RIGHT COLUMN: Parameters / Settings     */}
            {/* ======================================= */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: fluidEase, delay: 0.1 }}
              className="lg:col-span-4"
            >
              <div className="bg-white border border-zinc-200/60 p-6 md:p-8 rounded-2xl shadow-sm min-h-[500px] relative overflow-hidden sticky top-[100px]">
                
                <AnimatePresence mode="wait">
                  
                  {/* DEFAULT MENU */}
                  {!activeSetting && (
                    <motion.div 
                      key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                      className="flex flex-col h-full"
                    >
                      <h3 className="text-[14px] font-bold tracking-wide uppercase text-black border-b border-zinc-100 pb-4 mb-6">
                        Configuration
                      </h3>
                      
                      <div className="flex flex-col gap-3">
                        <button onClick={() => setActiveSetting('profile')} className="group flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/50 hover:border-zinc-300 transition-all rounded-xl outline-none text-left">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white border border-zinc-200 rounded-md text-zinc-600 shadow-sm"><User className="w-4 h-4" /></div>
                            <div>
                              <h4 className="text-[14px] font-bold text-black mb-0.5">Edit Profile</h4>
                              <p className="text-[12px] font-medium text-zinc-500">Name and avatar</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </button>

                        <button onClick={() => setActiveSetting('password')} className="group flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/50 hover:border-zinc-300 transition-all rounded-xl outline-none text-left">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white border border-zinc-200 rounded-md text-zinc-600 shadow-sm"><Lock className="w-4 h-4" /></div>
                            <div>
                              <h4 className="text-[14px] font-bold text-black mb-0.5">Security</h4>
                              <p className="text-[12px] font-medium text-zinc-500">Change password</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </button>
                      </div>

                      <div className="mt-auto pt-10">
                        <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 text-[13px] font-bold rounded-lg transition-colors outline-none">
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Account
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* EDIT PROFILE FORM */}
                  {activeSetting === 'profile' && (
                    <motion.form 
                      key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                      onSubmit={handleProfileSubmit(onUpdateProfile)} className="flex flex-col h-full"
                    >
                      <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
                        <button type="button" onClick={() => { setActiveSetting(null); setAvatarBase64(null); }} className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-[14px] font-bold tracking-wide uppercase text-black">Edit Profile</h3>
                      </div>

                      {/* Image Upload */}
                      <div className="mb-6 flex flex-col items-center">
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-full text-center cursor-pointer transition-all duration-300 overflow-hidden relative group w-24 h-24 ${isDragActive ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-300 hover:border-black bg-zinc-50/50'}`}>
                          <input {...getInputProps()} />
                          {(avatarBase64 || userData.image) ? (
                            <div className="w-full h-full relative">
                              <img src={avatarBase64 || userData.image} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Edit3 className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 group-hover:text-black">
                              <Camera className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-3">Upload Avatar</span>
                      </div>

                      <div className="mb-5">
                        <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Full Name</label>
                        <input 
                          type="text" defaultValue={userData.name} {...registerProfile("name")} 
                          className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg px-4 py-3 text-[14px] text-black outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" 
                        />
                      </div>

                      <div className="mb-8">
                        <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                        <input 
                          type="text" defaultValue={userData.phoneNumber || ''} placeholder="Optional" {...registerProfile("phoneNumber")} 
                          className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg px-4 py-3 text-[14px] text-black outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" 
                        />
                      </div>

                      <button type="submit" disabled={isUpdatingProfile} className="mt-auto w-full py-3.5 bg-black text-white text-[13px] font-bold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-sm">
                        {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                      </button>
                    </motion.form>
                  )}

                  {/* CHANGE PASSWORD FORM */}
                  {activeSetting === 'password' && (
                    <motion.form 
                      key="password" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                      onSubmit={handlePasswordSubmit(onChangePassword)} className="flex flex-col h-full"
                    >
                      <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
                        <button type="button" onClick={() => { setActiveSetting(null); resetPasswordForm(); }} className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-[14px] font-bold tracking-wide uppercase text-black">Security</h3>
                      </div>

                      <div className="mb-5">
                        <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Current Password</label>
                        <input 
                          type="password" {...registerPassword("currentPassword", { required: true })} 
                          className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg px-4 py-3 text-[14px] text-black outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" 
                        />
                      </div>

                      <div className="mb-8">
                        <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">New Password</label>
                        <input 
                          type="password" {...registerPassword("newPassword", { required: true, minLength: 8 })} 
                          className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg px-4 py-3 text-[14px] text-black outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" 
                        />
                      </div>

                      <button type="submit" disabled={isChangingPassword} className="mt-auto w-full py-3.5 bg-black text-white text-[13px] font-bold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-sm">
                        {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                      </button>
                    </motion.form>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}