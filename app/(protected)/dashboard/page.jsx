"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, PenTool, Bookmark, Settings, 
  LogOut, Loader2, ArrowRight, Activity, Lock, Trash2, X, Camera
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
import { useGetMyBookmarksQuery } from "@/hooks/queries/useUserQueries";
import { useToggleBookmarkMutation } from "@/hooks/mutations/useInteractionMutations";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { mutate: logoutUser, isPending: isLoggingOut } = useLogoutMutation();

  const { data: response, isLoading, isError } = useGetMeQuery();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePasswordMutation();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteMyAccountMutation();

  const userData = response?.user || response?.data?.user;

  // Bookmarks state
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const { data: bookmarksRes, isLoading: isBookmarksLoading } = useGetMyBookmarksQuery({ page: bookmarkPage, limit: 5 });
  const bookmarksList = bookmarksRes?.bookmarks || bookmarksRes?.data?.bookmarks || [];
  const bookmarksPagination = bookmarksRes?.pagination || bookmarksRes?.data?.pagination || {};
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmarkMutation();

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
      const reader = new FileReader();
      reader.onloadend = () => setAvatarBase64(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
  });

  const onUpdateProfile = (data) => {
    const payload = {};
    if (data.name && data.name !== userData.name) payload.name = data.name;
    if (data.phoneNumber && data.phoneNumber !== userData.phoneNumber) payload.phoneNumber = data.phoneNumber;
    if (avatarBase64) payload.image = avatarBase64;
    
    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save.");
      setActiveSetting(null);
      return;
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        setAvatarBase64(null);
        setActiveSetting(null);
      }
    });
  };

  const onChangePassword = (data) => {
    changePassword(data, {
      onSuccess: () => {
        toast.success("Password changed successfully!");
        resetPasswordForm();
        setActiveSetting(null);
      }
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("CRITICAL WARNING: This will permanently delete your workspace, posts, and comments. Proceed?")) {
      deleteAccount();
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--color-background)]">
        <Loader2 className="w-8 h-8 text-[var(--color-brand-primary)] animate-spin" />
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--color-background)]">
        <p className="text-[var(--color-muted)] font-medium">Failed to load profile data.</p>
        <button onClick={() => router.push('/login')} className="mt-4 text-[var(--color-brand-accent)] font-bold">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[var(--color-background)] selection:bg-[var(--color-brand-primary)]/30 pt-24 pb-16 px-6">
      
      {/* Structural Background Grid & Ambient Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[60vh]">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)",
          }}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 right-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-brand-primary)] rounded-full blur-[140px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
        >
          <div className="flex items-center gap-6">
            {/* Display Avatar if exists */}
            <div className="w-20 h-20 rounded-full border-2 border-[var(--color-brand-primary)]/50 p-1 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[var(--color-surface)] overflow-hidden flex items-center justify-center font-bold text-2xl text-[var(--color-brand-primary)]">
                {userData.image ? (
                  <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                ) : (
                  userData.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[var(--color-foreground)]">
                  Welcome, {userData.name.split(' ')[0]}
                </h1>
                <span className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border ${userData.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : userData.role === 'AUTHOR' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : userData.role === 'WRITER' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[var(--color-brand-dark)] text-[var(--color-brand-lightest)] border-transparent'}`}>
                  {userData.role}
                </span>
              </div>
              <p className="text-[var(--color-muted)] text-lg font-medium">
                Manage your profile, security, and workspace preferences.
              </p>
            </div>
          </div>

          <button 
            onClick={() => logoutUser()}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] text-[var(--color-foreground)] font-bold hover:bg-[var(--color-surface)] transition-all duration-300 disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign Out
          </button>
        </motion.div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Features & Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            
            {userData.role !== "USER" && (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--color-brand-dark)] to-[#151515] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <PenTool className="w-40 h-40 text-[var(--color-brand-lightest)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-brand-lightest)] mb-2 relative z-10">Writer's Workspace</h2>
                <p className="text-[var(--color-brand-light)] font-medium mb-8 relative z-10 max-w-md">
                  Jump back into the editor. Draft new ideas or manage your published articles.
                </p>
                <div className="flex flex-wrap gap-4 relative z-10">
                  <Link 
                    href="/editor/dashboard" 
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-accent)] text-white font-bold rounded-full hover:bg-[#d16815] transition-colors shadow-lg shadow-[var(--color-brand-accent)]/20"
                  >
                    Write New Post <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    href="/writer/dashboard" 
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/20 transition-colors"
                  >
                    View My Posts
                  </Link>
                  {(userData.role === "AUTHOR" || userData.role === "ADMIN") && (
                    <Link 
                      href="/author/dashboard" 
                      className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 backdrop-blur-md text-blue-300 font-bold rounded-full hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                    >
                      <PenTool className="w-4 h-4 text-blue-400" /> Author Panel
                    </Link>
                  )}
                  {userData.role === "ADMIN" && (
                    <Link 
                      href="/admin/dashboard" 
                      className="flex items-center gap-2 px-6 py-3 bg-[var(--color-surface)]/10 backdrop-blur-md text-[var(--color-brand-lightest)] font-bold rounded-full hover:bg-[var(--color-surface)]/20 transition-colors border border-white/10"
                    >
                      <Shield className="w-4 h-4 text-[var(--color-brand-accent)]" /> Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-[var(--color-background)]/60 backdrop-blur-xl border border-[var(--color-border)]/40 shadow-sm hover:border-[var(--color-brand-primary)]/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[var(--color-brand-primary)]/10 rounded-xl text-[var(--color-brand-primary)]">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-foreground)]">Reading List</h3>
                </div>
                <p className="text-3xl font-extrabold text-[var(--color-foreground)] mb-1">
                  {userData._count?.bookmarks || 0}
                </p>
                <p className="text-sm font-medium text-[var(--color-muted)]">Saved articles</p>
              </div>

              <div className="p-6 rounded-3xl bg-[var(--color-background)]/60 backdrop-blur-xl border border-[var(--color-border)]/40 shadow-sm hover:border-[var(--color-brand-primary)]/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[var(--color-brand-accent)]/10 rounded-xl text-[var(--color-brand-accent)]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-foreground)]">Interactions</h3>
                </div>
                <p className="text-3xl font-extrabold text-[var(--color-foreground)] mb-1">
                  {userData._count?.comments || 0}
                </p>
                <p className="text-sm font-medium text-[var(--color-muted)]">Comments posted</p>
              </div>
            </div>

            {/* Saved Articles Section */}
            <div className="mt-12 bg-[var(--color-surface)]/60 backdrop-blur-xl border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2 mb-6">
                <Bookmark className="w-5 h-5 text-[var(--color-brand-primary)]" /> My Saved Articles
              </h2>

              {isBookmarksLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-brand-primary)]" /></div>
              ) : bookmarksList.length === 0 ? (
                <div className="py-12 text-center text-[var(--color-muted)] font-medium bg-[var(--color-background)]/50 rounded-2xl border border-[var(--color-border)]/50 border-dashed">
                  You haven't saved any articles yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarksList.map(post => (
                    <div key={post.bookmarkId} className="group flex flex-col sm:flex-row gap-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-4 hover:border-[var(--color-brand-primary)]/50 transition-colors">
                      <div className="w-full sm:w-32 h-24 flex-shrink-0 bg-[var(--color-surface)] rounded-xl overflow-hidden relative">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]"><Activity className="w-6 h-6 opacity-20" /></div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <Link href={`/blog/${post.slug}`} className="text-lg font-bold text-[var(--color-foreground)] line-clamp-1 hover:text-[var(--color-brand-primary)] transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-sm text-[var(--color-muted)] line-clamp-1 mt-1 mb-2">{post.excerpt}</p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider mt-auto">
                          {post.author?.name && <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author.name}</span>}
                          <span>·</span>
                          <span>Saved {new Date(post.bookmarkedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center justify-end gap-2 mt-4 sm:mt-0">
                        <button 
                          onClick={() => toggleBookmark(post.id)}
                          disabled={isTogglingBookmark}
                          className="p-2.5 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-colors disabled:opacity-50"
                          title="Remove Bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Bookmarks Pagination */}
                  {bookmarksPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--color-border)]">
                      <span className="text-xs font-bold text-[var(--color-muted)]">Page {bookmarkPage} of {bookmarksPagination.totalPages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setBookmarkPage(p => Math.max(1, p - 1))} disabled={bookmarkPage === 1} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-brand-primary)] disabled:opacity-50 transition-colors">
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button onClick={() => setBookmarkPage(p => Math.min(bookmarksPagination.totalPages, p + 1))} disabled={bookmarkPage === bookmarksPagination.totalPages} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-brand-primary)] disabled:opacity-50 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-[var(--color-background)]/60 backdrop-blur-xl border border-[var(--color-border)]/40 shadow-xl overflow-hidden relative">
              
              <AnimatePresence mode="wait">
                
                {/* DEFAULT MENU */}
                {!activeSetting && (
                  <motion.div 
                    key="menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[var(--color-brand-accent)]" /> Account Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div 
                        onClick={() => setActiveSetting('profile')}
                        className="group cursor-pointer p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors" />
                          <div>
                            <h4 className="text-sm font-bold text-[var(--color-foreground)]">Edit Profile</h4>
                            <p className="text-xs font-medium text-[var(--color-muted)]">Update name, avatar, phone</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveSetting('password')}
                        className="group cursor-pointer p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors" />
                          <div>
                            <h4 className="text-sm font-bold text-[var(--color-foreground)]">Change Password</h4>
                            <p className="text-xs font-medium text-[var(--color-muted)]">Secure your workspace</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="my-6 border-[var(--color-border)]/50" />

                    <div 
                      onClick={handleDeleteAccount}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isDeleting ? <Loader2 className="w-5 h-5 text-red-500 animate-spin" /> : <Trash2 className="w-5 h-5 text-red-500" />}
                        <div>
                          <h4 className="text-sm font-bold text-red-500">Delete Workspace</h4>
                          <p className="text-xs font-medium text-red-500/80">Permanent destructive action</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* EDIT PROFILE FORM */}
                {activeSetting === 'profile' && (
                  <motion.form 
                    key="profile"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleProfileSubmit(onUpdateProfile)} 
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-[var(--color-foreground)]">Edit Profile</h3>
                      <button type="button" onClick={() => { setActiveSetting(null); setAvatarBase64(null); }} className="p-1 hover:bg-[var(--color-border)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--color-muted)]" />
                      </button>
                    </div>

                    {/* R2 Cloudflare Image Upload */}
                    <div>
                      <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2 block">Avatar Upload</label>
                      <div {...getRootProps()} 
                        className={`border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 overflow-hidden relative group ${isDragActive ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/50 bg-[var(--color-surface)]'} ${avatarBase64 || userData.image ? 'p-0 aspect-square w-24 h-24 mx-auto rounded-full' : 'p-6'}`}
                      >
                        <input {...getInputProps()} />
                        {(avatarBase64 || userData.image) ? (
                          <>
                            <img src={avatarBase64 || userData.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="p-3 bg-[var(--color-background)] rounded-full text-[var(--color-muted)] group-hover:text-[var(--color-brand-primary)] group-hover:scale-110 transition-all">
                              <Camera className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[var(--color-foreground)]">Upload Avatar</p>
                              <p className="text-xs text-[var(--color-muted)] mt-1">JPEG, PNG, WEBP max 5MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={userData.name}
                        {...registerProfile("name")} 
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-primary)] transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-1 block">Phone Number</label>
                      <input 
                        type="text" 
                        defaultValue={userData.phoneNumber || ''}
                        placeholder="+1 234..."
                        {...registerProfile("phoneNumber")} 
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-primary)] transition-colors" 
                      />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isUpdatingProfile} 
                      className="w-full py-3.5 mt-2 rounded-xl bg-[var(--color-foreground)] text-[var(--color-background)] font-bold text-sm hover:opacity-90 transition-all flex justify-center items-center gap-2 shadow-lg"
                    >
                      {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </motion.button>
                  </motion.form>
                )}

                {/* CHANGE PASSWORD FORM */}
                {activeSetting === 'password' && (
                  <motion.form 
                    key="password"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handlePasswordSubmit(onChangePassword)} 
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-[var(--color-foreground)]">Change Password</h3>
                      <button type="button" onClick={() => { setActiveSetting(null); resetPasswordForm(); }} className="p-1 hover:bg-[var(--color-border)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--color-muted)]" />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-1 block">Current Password</label>
                      <input 
                        type="password" 
                        {...registerPassword("currentPassword", { required: true })} 
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-primary)] transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-1 block">New Password</label>
                      <input 
                        type="password" 
                        {...registerPassword("newPassword", { required: true, minLength: 8 })} 
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-primary)] transition-colors" 
                      />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isChangingPassword} 
                      className="w-full py-3.5 mt-2 rounded-xl bg-[var(--color-foreground)] text-[var(--color-background)] font-bold text-sm hover:opacity-90 transition-all flex justify-center items-center gap-2 shadow-lg"
                    >
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </motion.button>
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