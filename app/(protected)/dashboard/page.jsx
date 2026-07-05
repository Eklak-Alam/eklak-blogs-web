"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, PenTool, Bookmark, Settings, 
  LogOut, Loader2, ArrowRight, MessageSquare, Lock, Trash2, X, Camera, ArrowLeft, Heart, ImagePlus
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

// Fluid easing curve for buttery animations
const fluidEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: fluidEase } }
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

  const [bookmarkPage, setBookmarkPage] = useState(1);
  const { data: bookmarksRes, isLoading: isBookmarksLoading } = useGetMyBookmarksQuery({ page: bookmarkPage, limit: 5 });
  const bookmarksList = bookmarksRes?.bookmarks || bookmarksRes?.data?.bookmarks || [];
  const bookmarksPagination = bookmarksRes?.pagination || bookmarksRes?.data?.pagination || {};
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmarkMutation();

  const [likePage, setLikePage] = useState(1);
  const { data: likesRes, isLoading: isLikesLoading } = useGetMyLikesQuery({ page: likePage, limit: 5 });
  const likesList = likesRes?.likes || likesRes?.data?.likes || [];
  const likesPagination = likesRes?.pagination || likesRes?.data?.pagination || {};
  const { mutate: toggleLike, isPending: isTogglingLike } = useToggleLikeMutation();

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
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
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
    if (window.confirm("Are you sure? This action will permanently delete your account and all your data.")) {
      deleteAccount();
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[#f2f2f2]">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" strokeWidth={2} />
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#f2f2f2]">
        <p className="text-sm text-zinc-500 mb-4">Could not load your profile.</p>
        <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
          Log in again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#f2f2f2] text-zinc-900 pt-12 pb-24 px-4 sm:px-6">
      
      <div className="relative z-10 max-w-[1200px] mx-auto w-full">
        
        {/* ======================================= */}
        {/* HEADER SECTION                          */}
        {/* ======================================= */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-6 md:p-8 rounded-[32px] shadow-sm shadow-zinc-200/50"
        >
          <div className="flex items-center gap-6">
            {/* Avatar: Soft Circle */}
            <motion.div variants={fadeUp} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-zinc-50 flex-shrink-0 bg-zinc-100 relative overflow-hidden shadow-sm">
              {userData.image ? (
                <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-medium text-3xl text-zinc-400 bg-zinc-100">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>
            
            <div className="flex flex-col">
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
                  {userData.name}
                </h1>
                <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-zinc-100 text-zinc-500">
                  {userData.role}
                </span>
              </motion.div>
              <motion.p variants={fadeUp} className="text-zinc-500 text-sm font-medium">
                {userData.email}
              </motion.p>
            </div>
          </div>

          <motion.button 
            variants={fadeUp}
            onClick={() => logoutUser()}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 text-sm font-medium rounded-full transition-colors outline-none disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Log Out
          </motion.button>
        </motion.div>

        {/* ======================================= */}
        {/* DASHBOARD GRID                          */}
        {/* ======================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* ======================================= */}
          {/* LEFT COLUMN: Main Features & Content    */}
          {/* ======================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: fluidEase, delay: 0.1 }}
            className="lg:col-span-8 flex flex-col gap-6 lg:gap-8"
          >
            
            {/* WRITER WORKSPACE (If not USER) */}
            {userData.role !== "USER" && (
              <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm shadow-zinc-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#f2f2f2] rounded-full text-zinc-900">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900">Writer's Workspace</h2>
                </div>
                <p className="text-sm text-zinc-500 mb-8 max-w-md">
                  Manage your drafts, publish new stories, and see how your posts are performing.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/editor/dashboard" className="px-6 py-3 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors shadow-md shadow-zinc-900/10 flex items-center gap-2">
                    Write New Post <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/writer/dashboard" className="px-6 py-3 bg-[#f2f2f2] text-zinc-700 hover:text-zinc-900 text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors">
                    Manage Posts
                  </Link>
                  {(userData.role === "AUTHOR" || userData.role === "ADMIN") && (
                    <Link href="/author/dashboard" className="px-6 py-3 bg-[#f2f2f2] text-zinc-700 hover:text-zinc-900 text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors">
                      Author Tools
                    </Link>
                  )}
                  {userData.role === "ADMIN" && (
                    <Link href="/admin/dashboard" className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium rounded-full transition-colors">
                      Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-[32px] shadow-sm shadow-zinc-200/50 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-[#f2f2f2] rounded-full flex items-center justify-center text-zinc-700 mb-3">
                  <Bookmark className="w-5 h-5" />
                </div>
                <p className="text-3xl font-semibold text-zinc-900 mb-1">{userData._count?.bookmarks || 0}</p>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Saved Posts</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] shadow-sm shadow-zinc-200/50 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-[#f2f2f2] rounded-full flex items-center justify-center text-zinc-700 mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-3xl font-semibold text-zinc-900 mb-1">{userData._count?.comments || 0}</p>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Comments Made</p>
              </div>
            </div>

            {/* SAVED ARTICLES (BOOKMARKS) */}
            <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm shadow-zinc-200/50">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-6">
                <Bookmark className="w-5 h-5" /> Saved Posts
              </h2>

              {isBookmarksLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-300" /></div>
              ) : bookmarksList.length === 0 ? (
                <div className="py-12 text-center bg-[#f2f2f2] rounded-[24px]">
                  <p className="text-sm text-zinc-500">You haven't saved any posts yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {bookmarksList.map(post => (
                    <div key={post.bookmarkId} className="group flex flex-col sm:flex-row gap-5 pb-6 border-b border-zinc-100 last:border-0 last:pb-0">
                      {/* Soft Image Frame */}
                      <div className="w-full sm:w-36 aspect-video flex-shrink-0 bg-[#f2f2f2] rounded-[16px] overflow-hidden relative">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImagePlus className="w-6 h-6" /></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-zinc-400">
                            Saved on {new Date(post.bookmarkedAt).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => toggleBookmark(post.id)}
                            disabled={isTogglingBookmark}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 outline-none"
                            title="Remove Bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Link href={`/blog/${post.slug}`} className="text-lg font-medium text-zinc-900 hover:text-zinc-600 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </Link>
                        <p className="text-sm text-zinc-500 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                  ))}

                  {/* Bookmarks Pagination */}
                  {bookmarksPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100">
                      <button onClick={() => setBookmarkPage(p => Math.max(1, p - 1))} disabled={bookmarkPage === 1} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-[#f2f2f2] rounded-full disabled:opacity-50 hover:bg-zinc-200 transition-colors">
                        Previous
                      </button>
                      <span className="text-xs font-medium text-zinc-500">
                        Page {bookmarkPage} of {bookmarksPagination.totalPages}
                      </span>
                      <button onClick={() => setBookmarkPage(p => Math.min(bookmarksPagination.totalPages, p + 1))} disabled={bookmarkPage === bookmarksPagination.totalPages} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-[#f2f2f2] rounded-full disabled:opacity-50 hover:bg-zinc-200 transition-colors">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LIKED ARTICLES (LIKES) */}
            <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm shadow-zinc-200/50">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-red-500" /> Liked Posts
              </h2>

              {isLikesLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-300" /></div>
              ) : likesList.length === 0 ? (
                <div className="py-12 text-center bg-[#f2f2f2] rounded-[24px]">
                  <p className="text-sm text-zinc-500">You haven't liked any posts yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {likesList.map(post => (
                    <div key={post.likeId} className="group flex flex-col sm:flex-row gap-5 pb-6 border-b border-zinc-100 last:border-0 last:pb-0">
                      {/* Soft Image Frame */}
                      <div className="w-full sm:w-36 aspect-video flex-shrink-0 bg-[#f2f2f2] rounded-[16px] overflow-hidden relative">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImagePlus className="w-6 h-6" /></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-zinc-400">
                            Liked on {new Date(post.likedAt).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => toggleLike({ postId: post.id })}
                            disabled={isTogglingLike}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 outline-none"
                            title="Unlike Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Link href={`/blog/${post.slug}`} className="text-lg font-medium text-zinc-900 hover:text-zinc-600 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </Link>
                        <p className="text-sm text-zinc-500 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                  ))}

                  {/* Likes Pagination */}
                  {likesPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100">
                      <button onClick={() => setLikePage(p => Math.max(1, p - 1))} disabled={likePage === 1} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-[#f2f2f2] rounded-full disabled:opacity-50 hover:bg-zinc-200 transition-colors">
                        Previous
                      </button>
                      <span className="text-xs font-medium text-zinc-500">
                        Page {likePage} of {likesPagination.totalPages}
                      </span>
                      <button onClick={() => setLikePage(p => Math.min(likesPagination.totalPages, p + 1))} disabled={likePage === likesPagination.totalPages} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-[#f2f2f2] rounded-full disabled:opacity-50 hover:bg-zinc-200 transition-colors">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* ======================================= */}
          {/* RIGHT COLUMN: Parameters / Settings     */}
          {/* ======================================= */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: fluidEase, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm shadow-zinc-200/50 min-h-[450px] relative overflow-hidden sticky top-[100px]">
              
              <AnimatePresence mode="wait">
                
                {/* DEFAULT MENU */}
                {!activeSetting && (
                  <motion.div 
                    key="menu"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    className="flex flex-col h-full"
                  >
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Settings
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setActiveSetting('profile')}
                        className="group flex items-center justify-between p-4 bg-[#f2f2f2] hover:bg-zinc-200/60 transition-colors rounded-[20px] outline-none text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-full text-zinc-600 shadow-sm"><User className="w-4 h-4" /></div>
                          <div>
                            <h4 className="text-sm font-medium text-zinc-900 mb-0.5">Edit Profile</h4>
                            <p className="text-xs text-zinc-500">Change your name and photo</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
                      </button>

                      <button 
                        onClick={() => setActiveSetting('password')}
                        className="group flex items-center justify-between p-4 bg-[#f2f2f2] hover:bg-zinc-200/60 transition-colors rounded-[20px] outline-none text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-full text-zinc-600 shadow-sm"><Lock className="w-4 h-4" /></div>
                          <div>
                            <h4 className="text-sm font-medium text-zinc-900 mb-0.5">Password</h4>
                            <p className="text-xs text-zinc-500">Update your security key</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>

                    <div className="mt-auto pt-10">
                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-[20px] transition-colors outline-none"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete Account
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* EDIT PROFILE FORM */}
                {activeSetting === 'profile' && (
                  <motion.form 
                    key="profile"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                    onSubmit={handleProfileSubmit(onUpdateProfile)} 
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <button type="button" onClick={() => { setActiveSetting(null); setAvatarBase64(null); }} className="p-2 bg-[#f2f2f2] hover:bg-zinc-200 rounded-full text-zinc-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h3 className="text-lg font-semibold text-zinc-900">Edit Profile</h3>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6 flex justify-center">
                      <div {...getRootProps()} 
                        className={`border-2 border-dashed rounded-full text-center cursor-pointer transition-all duration-300 overflow-hidden relative group w-24 h-24 ${isDragActive ? 'border-zinc-400 bg-zinc-100' : 'border-zinc-200 hover:border-zinc-300 bg-[#f2f2f2]'}`}
                      >
                        <input {...getInputProps()} />
                        {(avatarBase64 || userData.image) ? (
                          <div className="w-full h-full relative">
                            <img src={avatarBase64 || userData.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-5 h-5 text-zinc-800" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-400 group-hover:text-zinc-600">
                            <Camera className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={userData.name}
                        {...registerProfile("name")} 
                        className="w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 rounded-[20px] px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-100 transition-all" 
                      />
                    </div>

                    <div className="mb-8">
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Phone Number</label>
                      <input 
                        type="text" 
                        defaultValue={userData.phoneNumber || ''}
                        placeholder="Optional"
                        {...registerProfile("phoneNumber")} 
                        className="w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 rounded-[20px] px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-100 transition-all" 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isUpdatingProfile} 
                      className="mt-auto w-full py-4 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md shadow-zinc-900/10"
                    >
                      {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                  </motion.form>
                )}

                {/* CHANGE PASSWORD FORM */}
                {activeSetting === 'password' && (
                  <motion.form 
                    key="password"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                    onSubmit={handlePasswordSubmit(onChangePassword)} 
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <button type="button" onClick={() => { setActiveSetting(null); resetPasswordForm(); }} className="p-2 bg-[#f2f2f2] hover:bg-zinc-200 rounded-full text-zinc-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h3 className="text-lg font-semibold text-zinc-900">Change Password</h3>
                    </div>

                    <div className="mb-4">
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Current Password</label>
                      <input 
                        type="password" 
                        {...registerPassword("currentPassword", { required: true })} 
                        className="w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 rounded-[20px] px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-100 transition-all" 
                      />
                    </div>

                    <div className="mb-8">
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">New Password</label>
                      <input 
                        type="password" 
                        {...registerPassword("newPassword", { required: true, minLength: 8 })} 
                        className="w-full bg-[#f2f2f2] focus:bg-white border border-transparent focus:border-zinc-300 rounded-[20px] px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-100 transition-all" 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isChangingPassword} 
                      className="mt-auto w-full py-4 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md shadow-zinc-900/10"
                    >
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </button>
                  </motion.form>
                )}

              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}