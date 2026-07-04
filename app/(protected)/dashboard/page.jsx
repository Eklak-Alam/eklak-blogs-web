"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, PenTool, Bookmark, Settings, 
  LogOut, Loader2, ArrowRight, Activity, Lock, Trash2, X, Camera, ArrowLeft, Heart
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

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
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

  // Likes state
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
      toast.info("No modifications detected.");
      setActiveSetting(null);
      return;
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Identity parameters updated.");
        setAvatarBase64(null);
        setActiveSetting(null);
      }
    });
  };

  const onChangePassword = (data) => {
    changePassword(data, {
      onSuccess: () => {
        toast.success("Security key updated successfully.");
        resetPasswordForm();
        setActiveSetting(null);
      }
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("CRITICAL WARNING: This action will permanently purge your identity and all associated data. Proceed?")) {
      deleteAccount();
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--color-background)]">
        <Loader2 className="w-6 h-6 text-[var(--color-muted)] animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--color-background)]">
        <p className="text-[13px] font-light text-[var(--color-muted)] mb-4">Identity verification failed.</p>
        <button onClick={() => router.push('/login')} className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-accent)] hover:underline outline-none">
          Initiate Session
        </button>
      </div>
    );
  }

  return (
    // pt-32 ensures clearance of the custom top navbar
    <div className="min-h-screen w-full relative bg-[var(--color-background)] selection:bg-[var(--color-brand-primary)]/30 pt-32 pb-24 px-6 overflow-hidden">
      
      {/* Structural Background Lines */}
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
          <div className="flex items-end gap-8">
            {/* Avatar: Sharp Square Architectural Box */}
            <motion.div variants={fadeUp} className="w-24 h-24 rounded-none border border-[var(--color-border)]/50 p-1 flex-shrink-0 bg-[var(--color-surface)]/10">
              <div className="w-full h-full rounded-none bg-[var(--color-background)] overflow-hidden flex items-center justify-center font-normal text-3xl text-[var(--color-foreground)] filter grayscale-[20%]">
                {userData.image ? (
                  <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                ) : (
                  userData.name.charAt(0).toUpperCase()
                )}
              </div>
            </motion.div>
            
            <div className="flex flex-col">
              <motion.div variants={fadeUp} className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-[var(--color-foreground)] leading-none">
                  {userData.name.split(' ')[0]}.
                </h1>
                <span className="px-3 py-1 text-[9px] font-medium tracking-[0.2em] uppercase rounded-none border border-[var(--color-border)]/50 text-[var(--color-muted)] bg-[var(--color-surface)]/20">
                  {userData.role}
                </span>
              </motion.div>
              <motion.p variants={fadeUp} className="text-[var(--color-muted)] text-[14px] font-light">
                Identity confirmed. Welcome to the central terminal.
              </motion.p>
            </div>
          </div>

          <motion.button 
            variants={fadeUp}
            onClick={() => logoutUser()}
            disabled={isLoggingOut}
            className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-red-400 transition-colors duration-500 outline-none"
          >
            {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} /> : <LogOut className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />}
            Terminate Session
          </motion.button>
        </motion.div>

        {/* ======================================= */}
        {/* DASHBOARD GRID                          */}
        {/* ======================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* ======================================= */}
          {/* LEFT COLUMN: Main Features & Content    */}
          {/* ======================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: cinematicEase, delay: 0.1 }}
            className="lg:col-span-8 flex flex-col"
          >
            
            {/* WRITER WORKSPACE PROMO (If not USER) */}
            {userData.role !== "USER" && (
              <div className="mb-16 border border-[var(--color-border)]/40 p-8 md:p-12 rounded-none bg-[var(--color-surface)]/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                  <PenTool className="w-48 h-48 text-[var(--color-foreground)]" strokeWidth={0.5} />
                </div>
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-primary)] mb-4">Command Module</h2>
                <h3 className="text-3xl font-normal text-[var(--color-foreground)] mb-3 relative z-10">Writer's Workspace</h3>
                <p className="text-[14px] font-light text-[var(--color-muted)] mb-10 relative z-10 max-w-md leading-relaxed">
                  Access the editorial suite to initialize drafts, review publications, and analyze transmission metrics.
                </p>
                <div className="flex flex-wrap gap-8 relative z-10">
                  <Link href="/editor/dashboard" className="group flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-foreground)] hover:text-[var(--color-brand-accent)] transition-colors outline-none">
                    Initialize Draft <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" strokeWidth={1.5} />
                  </Link>
                  <Link href="/writer/dashboard" className="group flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors outline-none">
                    View Records <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" strokeWidth={1.5} />
                  </Link>
                  {(userData.role === "AUTHOR" || userData.role === "ADMIN") && (
                    <Link href="/author/dashboard" className="group flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors outline-none">
                      Author Suite <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" strokeWidth={1.5} />
                    </Link>
                  )}
                  {userData.role === "ADMIN" && (
                    <Link href="/admin/dashboard" className="group flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-red-400 hover:text-red-300 transition-colors outline-none">
                      Admin Root <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" strokeWidth={1.5} />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-y border-[var(--color-border)]/40 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)]/40 mb-16">
              <div className="py-8 flex flex-col justify-center items-center text-center">
                <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} /> Index Archives
                </p>
                <p className="text-4xl font-normal text-[var(--color-foreground)]">{userData._count?.bookmarks || 0}</p>
              </div>
              <div className="py-8 flex flex-col justify-center items-center text-center">
                <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" strokeWidth={1.5} /> Discourse Logs
                </p>
                <p className="text-4xl font-normal text-[var(--color-foreground)]">{userData._count?.comments || 0}</p>
              </div>
            </div>

            {/* SAVED ARTICLES (BOOKMARKS) */}
            <div className="relative overflow-hidden">
              <h2 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-border)]/40">
                <Bookmark className="w-4 h-4 text-[var(--color-brand-primary)]" strokeWidth={1.5} /> Archived Transmissions
              </h2>

              {isBookmarksLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} /></div>
              ) : bookmarksList.length === 0 ? (
                <div className="py-16 text-center border border-[var(--color-border)]/30 rounded-none bg-[var(--color-surface)]/5">
                  <p className="text-[13px] font-light text-[var(--color-muted)]">Zero records archived.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {bookmarksList.map(post => (
                    <div key={post.bookmarkId} className="group flex flex-col sm:flex-row gap-6 pb-8 border-b border-[var(--color-border)]/20">
                      {/* Naked Image Frame */}
                      <div className="w-full sm:w-40 aspect-video sm:aspect-[4/3] flex-shrink-0 bg-[var(--color-surface)]/20 rounded-none overflow-hidden relative border border-[var(--color-border)]/30">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s]" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]/30"><span className="text-[9px] font-mono tracking-widest uppercase">No Asset</span></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col py-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-widest flex items-center gap-2">
                            Saved {new Date(post.bookmarkedAt).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => toggleBookmark(post.id)}
                            disabled={isTogglingBookmark}
                            className="text-[var(--color-muted)] hover:text-red-400 transition-colors disabled:opacity-50 outline-none"
                            title="Purge Bookmark"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <Link href={`/blog/${post.slug}`} className="text-xl font-normal text-[var(--color-foreground)] line-clamp-2 hover:text-[var(--color-brand-primary)] transition-colors duration-700 leading-snug mb-3">
                          {post.title}
                        </Link>
                        <p className="text-[13px] font-light text-[var(--color-muted)] line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                  ))}

                  {/* Bookmarks Pagination */}
                  {bookmarksPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <button onClick={() => setBookmarkPage(p => Math.max(1, p - 1))} disabled={bookmarkPage === 1} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-foreground)] disabled:opacity-30 outline-none hover:text-[var(--color-brand-accent)] transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" strokeWidth={1.5} /> Prev
                      </button>
                      <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-widest font-mono">
                        {bookmarkPage} / {bookmarksPagination.totalPages}
                      </span>
                      <button onClick={() => setBookmarkPage(p => Math.min(bookmarksPagination.totalPages, p + 1))} disabled={bookmarkPage === bookmarksPagination.totalPages} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-foreground)] disabled:opacity-30 outline-none hover:text-[var(--color-brand-accent)] transition-colors flex items-center gap-2">
                        Next <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LIKED ARTICLES (LIKES) */}
            <div className="relative overflow-hidden mt-16">
              <h2 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-border)]/40">
                <Heart className="w-4 h-4 text-red-500" strokeWidth={1.5} /> Liked Transmissions
              </h2>

              {isLikesLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} /></div>
              ) : likesList.length === 0 ? (
                <div className="py-16 text-center border border-[var(--color-border)]/30 rounded-none bg-[var(--color-surface)]/5">
                  <p className="text-[13px] font-light text-[var(--color-muted)]">Zero records liked.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {likesList.map(post => (
                    <div key={post.likeId} className="group flex flex-col sm:flex-row gap-6 pb-8 border-b border-[var(--color-border)]/20">
                      {/* Naked Image Frame */}
                      <div className="w-full sm:w-40 aspect-video sm:aspect-[4/3] flex-shrink-0 bg-[var(--color-surface)]/20 rounded-none overflow-hidden relative border border-[var(--color-border)]/30">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s]" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]/30"><span className="text-[9px] font-mono tracking-widest uppercase">No Asset</span></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col py-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-widest flex items-center gap-2">
                            Liked {new Date(post.likedAt).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => toggleLike({ postId: post.id })}
                            disabled={isTogglingLike}
                            className="text-[var(--color-muted)] hover:text-red-400 transition-colors disabled:opacity-50 outline-none"
                            title="Unlike Post"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <Link href={`/blog/${post.slug}`} className="text-xl font-normal text-[var(--color-foreground)] line-clamp-2 hover:text-[var(--color-brand-primary)] transition-colors duration-700 leading-snug mb-3">
                          {post.title}
                        </Link>
                        <p className="text-[13px] font-light text-[var(--color-muted)] line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                  ))}

                  {/* Likes Pagination */}
                  {likesPagination?.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <button onClick={() => setLikePage(p => Math.max(1, p - 1))} disabled={likePage === 1} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-foreground)] disabled:opacity-30 outline-none hover:text-[var(--color-brand-accent)] transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" strokeWidth={1.5} /> Prev
                      </button>
                      <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-widest font-mono">
                        {likePage} / {likesPagination.totalPages}
                      </span>
                      <button onClick={() => setLikePage(p => Math.min(likesPagination.totalPages, p + 1))} disabled={likePage === likesPagination.totalPages} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-foreground)] disabled:opacity-30 outline-none hover:text-[var(--color-brand-accent)] transition-colors flex items-center gap-2">
                        Next <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
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
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease: cinematicEase, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="border border-[var(--color-border)]/40 p-8 md:p-10 rounded-none bg-[var(--color-surface)]/5 relative overflow-hidden min-h-[400px]">
              
              <AnimatePresence mode="wait">
                
                {/* DEFAULT MENU */}
                {!activeSetting && (
                  <motion.div 
                    key="menu"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="flex flex-col h-full"
                  >
                    <h3 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] mb-8 flex items-center gap-3 border-b border-[var(--color-border)]/40 pb-4">
                      <Settings className="w-4 h-4 text-[var(--color-brand-accent)]" strokeWidth={1.5} /> System Parameters
                    </h3>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setActiveSetting('profile')}
                        className="group flex items-center justify-between p-4 bg-transparent border border-[var(--color-border)]/40 hover:border-[var(--color-foreground)]/40 transition-colors duration-500 rounded-none outline-none text-left"
                      >
                        <div className="flex items-center gap-4">
                          <User className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors" strokeWidth={1.5} />
                          <div>
                            <h4 className="text-[13px] font-medium text-[var(--color-foreground)] uppercase tracking-wider mb-1">Identity Config</h4>
                            <p className="text-[11px] font-light text-[var(--color-muted)]">Modify designation and avatar</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-muted)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" strokeWidth={1.5} />
                      </button>

                      <button 
                        onClick={() => setActiveSetting('password')}
                        className="group flex items-center justify-between p-4 bg-transparent border border-[var(--color-border)]/40 hover:border-[var(--color-foreground)]/40 transition-colors duration-500 rounded-none outline-none text-left"
                      >
                        <div className="flex items-center gap-4">
                          <Lock className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors" strokeWidth={1.5} />
                          <div>
                            <h4 className="text-[13px] font-medium text-[var(--color-foreground)] uppercase tracking-wider mb-1">Security Protocol</h4>
                            <p className="text-[11px] font-light text-[var(--color-muted)]">Update cryptographic keys</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-muted)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="mt-auto pt-16">
                      <button 
                        onClick={handleDeleteAccount}
                        className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-red-400/70 hover:text-red-400 transition-colors duration-500 outline-none w-full text-left"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} /> : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                        Purge Identity
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* EDIT PROFILE FORM */}
                {activeSetting === 'profile' && (
                  <motion.form 
                    key="profile"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}
                    onSubmit={handleProfileSubmit(onUpdateProfile)} 
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-4 mb-8">
                      <h3 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)]">Identity Config</h3>
                      <button type="button" onClick={() => { setActiveSetting(null); setAvatarBase64(null); }} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors outline-none">
                        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-8">
                      <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4 block">Visual Asset</label>
                      <div {...getRootProps()} 
                        className={`border border-[var(--color-border)]/50 rounded-none text-center cursor-pointer transition-colors duration-500 overflow-hidden relative group ${isDragActive ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5' : 'hover:border-[var(--color-foreground)]/30 bg-transparent'} ${avatarBase64 || userData.image ? 'p-0 aspect-square w-24 rounded-none' : 'p-6'}`}
                      >
                        <input {...getInputProps()} />
                        {(avatarBase64 || userData.image) ? (
                          <div className="w-full h-full relative">
                            <img src={avatarBase64 || userData.image} alt="Preview" className="w-full h-full object-cover filter grayscale-[20%]" />
                            <div className="absolute inset-0 bg-[var(--color-background)]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                              <Camera className="w-5 h-5 text-[var(--color-foreground)]" strokeWidth={1.5} />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[var(--color-muted)]">
                            <Camera className="w-5 h-5 mb-3 opacity-50" strokeWidth={1.5} />
                            <p className="text-[10px] font-medium text-[var(--color-foreground)] uppercase tracking-widest">Update Asset</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 block">Designation (Name)</label>
                      <input 
                        type="text" 
                        defaultValue={userData.name}
                        {...registerProfile("name")} 
                        className="w-full bg-transparent border-b border-[var(--color-border)]/50 rounded-none px-2 py-2 text-[13px] font-light text-[var(--color-foreground)] outline-none focus:border-[var(--color-foreground)] transition-colors" 
                      />
                    </div>

                    <div className="mb-10">
                      <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 block">Comm Channel (Phone)</label>
                      <input 
                        type="text" 
                        defaultValue={userData.phoneNumber || ''}
                        placeholder="+1 234..."
                        {...registerProfile("phoneNumber")} 
                        className="w-full bg-transparent border-b border-[var(--color-border)]/50 rounded-none px-2 py-2 text-[13px] font-light text-[var(--color-foreground)] outline-none focus:border-[var(--color-foreground)] transition-colors placeholder-[var(--color-muted)]/50" 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isUpdatingProfile} 
                      className="mt-auto w-full py-3.5 bg-[var(--color-foreground)] text-[var(--color-background)] text-[11px] font-medium uppercase tracking-[0.15em] hover:opacity-90 transition-opacity flex justify-center items-center gap-2 outline-none"
                    >
                      {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : "Update Parameters"}
                    </button>
                  </motion.form>
                )}

                {/* CHANGE PASSWORD FORM */}
                {activeSetting === 'password' && (
                  <motion.form 
                    key="password"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}
                    onSubmit={handlePasswordSubmit(onChangePassword)} 
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-4 mb-8">
                      <h3 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)]">Security Protocol</h3>
                      <button type="button" onClick={() => { setActiveSetting(null); resetPasswordForm(); }} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors outline-none">
                        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="mb-6">
                      <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 block">Current Key</label>
                      <input 
                        type="password" 
                        {...registerPassword("currentPassword", { required: true })} 
                        className="w-full bg-transparent border-b border-[var(--color-border)]/50 rounded-none px-2 py-2 text-[13px] font-light text-[var(--color-foreground)] outline-none focus:border-[var(--color-foreground)] transition-colors" 
                      />
                    </div>

                    <div className="mb-10">
                      <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-2 block">New Key</label>
                      <input 
                        type="password" 
                        {...registerPassword("newPassword", { required: true, minLength: 8 })} 
                        className="w-full bg-transparent border-b border-[var(--color-border)]/50 rounded-none px-2 py-2 text-[13px] font-light text-[var(--color-foreground)] outline-none focus:border-[var(--color-foreground)] transition-colors" 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isChangingPassword} 
                      className="mt-auto w-full py-3.5 bg-[var(--color-foreground)] text-[var(--color-background)] text-[11px] font-medium uppercase tracking-[0.15em] hover:opacity-90 transition-opacity flex justify-center items-center gap-2 outline-none"
                    >
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : "Update Key"}
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