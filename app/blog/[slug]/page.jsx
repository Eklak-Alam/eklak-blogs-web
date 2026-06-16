"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, Clock, Eye, Heart, Bookmark, MessageSquare, 
  Share2, Loader2, Send, CornerDownRight, MoreHorizontal, Trash2, Edit2 
} from "lucide-react";

import { useGetPostBySlugQuery, useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCommentsQuery } from "@/hooks/queries/useInteractionQueries";
import { useToggleLikeMutation, useToggleBookmarkMutation, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "@/hooks/mutations/useInteractionMutations";
import { useIncrementShareCountMutation } from "@/hooks/mutations/usePostMutations";
import { useAuthStore } from "@/store/useAuthStore";

export default function PostReadingPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  
  const [commentText, setCommentText] = useState("");
  const [commentsPage, setCommentsPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Queries
  const { data: postResponse, isLoading: postLoading, error: postError } = useGetPostBySlugQuery(slug);
  const post = postResponse?.data?.post || postResponse?.post;
  
  // Conditionally fetch comments only if we have a valid postId
  const { data: commentsResponse, isLoading: commentsLoading } = useGetCommentsQuery(post?.id, { page: commentsPage, limit: 10 });
  const comments = commentsResponse?.comments || commentsResponse?.data?.comments || [];
  const commentPagination = commentsResponse?.pagination || commentsResponse?.data?.pagination;

  // Related Posts Query (Excluding current post)
  const { data: relatedResponse } = useGetPublishedPostsQuery({
    categoryId: post?.category?.id,
    limit: 4
  });
  const rawRelatedPosts = relatedResponse?.data?.posts || relatedResponse?.posts || [];
  const relatedPosts = rawRelatedPosts.filter(p => p.id !== post?.id).slice(0, 3);

  // Mutations
  const { mutate: toggleLike, isPending: isLiking } = useToggleLikeMutation();
  const { mutate: toggleBookmark, isPending: isBookmarking } = useToggleBookmarkMutation();
  const { mutate: addComment, isPending: isCommenting } = useAddCommentMutation();
  const { mutate: updateComment } = useUpdateCommentMutation();
  const { mutate: deleteComment } = useDeleteCommentMutation();
  const { mutate: incrementShare } = useIncrementShareCountMutation();

  const { user } = useAuthStore();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Handle Authentication Gate for Interactions
  const requireAuth = (actionCallback) => {
    if (!isAuthenticated) {
      toast.error("Please login to interact with posts!");
      router.push("/login");
      return;
    }
    actionCallback();
  };

  const handleLike = () => requireAuth(() => toggleLike({ postId: post.id }));
  const handleBookmark = () => requireAuth(() => toggleBookmark({ postId: post.id }));
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    requireAuth(() => {
      addComment({ postId: post.id, payload: { content: commentText } }, {
        onSuccess: () => {
          setCommentText("");
          setCommentsPage(1); // Jump back to first page to see the new comment
        }
      });
    });
  };

  const handleEditSubmit = (commentId) => {
    if (!editCommentText.trim()) return;
    updateComment({ id: commentId, postId: post.id, payload: { content: editCommentText } }, {
      onSuccess: () => {
        setEditingCommentId(null);
        setEditCommentText("");
      }
    });
  };

  const handleDeleteComment = (commentId) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment({ id: commentId, postId: post.id });
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    if (post?.id) {
      incrementShare(post.id);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-extrabold text-[var(--color-foreground)] mb-4">Post not found</h1>
        <p className="text-[var(--color-muted)] font-medium mb-8">The article you are looking for doesn't exist or has been removed.</p>
        <Link href="/blog" className="px-6 py-3 rounded-full bg-[var(--color-foreground)] text-[var(--color-background)] font-bold hover:scale-105 transition-transform">
          Back to Knowledge Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30 pb-32">
      
      {/* Top Reading Progress Bar (Static for design purposes, can be dynamic later) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-surface)] z-50">
        <div className="h-full bg-[var(--color-brand-primary)] w-1/3" />
      </div>

      {/* Hero Header Section */}
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-[var(--color-border)]">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {post.coverImage ? (
            <>
              <img src={post.coverImage} alt="" className="w-full h-full object-cover opacity-20 blur-xl scale-110" />
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/50 to-[var(--color-background)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-primary)]/5 to-[var(--color-background)]" />
          )}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] text-sm font-bold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to feed
          </Link>

          {post.category && (
            <div className="mb-6 flex justify-center">
              <span className="px-4 py-1.5 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20 text-xs font-extrabold uppercase tracking-widest">
                {post.category.name}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-[var(--color-foreground)] mb-8 leading-[1.1]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-[var(--color-muted)]">
            <div className="flex items-center gap-3">
              {post.author?.image ? (
                <img src={post.author.image} alt="" className="w-10 h-10 rounded-full object-cover border border-[var(--color-border)]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)]">
                  {post.author?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <span className="text-[var(--color-foreground)]">{post.author?.name || 'Anonymous'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}</span>
            <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {post.viewCount} views</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
        
        {/* LEFT: Floating Actions (Sticky) */}
        <div className="hidden lg:block w-16 shrink-0 relative">
          <div className="sticky top-32 flex flex-col gap-4">
            <button onClick={handleLike} disabled={isLiking} className="w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] text-[var(--color-muted)] transition-all shadow-sm group">
              <Heart className="w-5 h-5 group-hover:fill-[var(--color-brand-primary)] transition-colors" />
            </button>
            <button onClick={handleBookmark} disabled={isBookmarking} className="w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-yellow-500 hover:text-yellow-500 text-[var(--color-muted)] transition-all shadow-sm group">
              <Bookmark className="w-5 h-5 group-hover:fill-yellow-500 transition-colors" />
            </button>
            <button onClick={() => { document.getElementById('comments').scrollIntoView({ behavior: 'smooth' }); }} className="w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)] text-[var(--color-muted)] transition-all shadow-sm group">
              <MessageSquare className="w-5 h-5 group-hover:fill-[var(--color-brand-accent)] transition-colors" />
            </button>
            <div className="w-full h-px bg-[var(--color-border)] my-2" />
            <button onClick={handleShare} className="w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] text-[var(--color-muted)] transition-all shadow-sm">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MIDDLE: Article Body */}
        <article className="flex-1 max-w-3xl min-w-0">
          
          {/* Cover Image in content if exists */}
          {post.coverImage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-xl">
              <img src={post.coverImage} alt={post.title} className="w-full h-auto max-h-[600px] object-cover" />
            </motion.div>
          )}

          {/* Render Rich HTML Content safely */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:text-[var(--color-foreground)]/80 prose-p:leading-relaxed prose-a:text-[var(--color-brand-primary)] prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-wrap gap-2">
              <span className="text-sm font-bold text-[var(--color-muted)] mr-2 flex items-center">Tags:</span>
              {post.tags.map(tag => (
                <span key={tag.id} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-foreground)]">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </article>

      </div>

      {/* Mobile Floating Action Bar (Sticky Bottom) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] p-2 rounded-full shadow-2xl flex justify-between items-center px-6">
        <button onClick={handleLike} className="p-3 text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] flex items-center gap-2 font-bold"><Heart className="w-5 h-5" /> {post.likeCount}</button>
        <div className="w-px h-6 bg-[var(--color-border)]" />
        <button onClick={() => { document.getElementById('comments').scrollIntoView({ behavior: 'smooth' }); }} className="p-3 text-[var(--color-muted)] hover:text-[var(--color-brand-accent)] flex items-center gap-2 font-bold"><MessageSquare className="w-5 h-5" /> {post.commentCount}</button>
        <div className="w-px h-6 bg-[var(--color-border)]" />
        <button onClick={handleBookmark} className="p-3 text-[var(--color-muted)] hover:text-yellow-500 font-bold"><Bookmark className="w-5 h-5" /></button>
        <div className="w-px h-6 bg-[var(--color-border)]" />
        <button onClick={handleShare} className="p-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] font-bold"><Share2 className="w-5 h-5" /></button>
      </div>

      {/* COMMENTS SECTION */}
      <div id="comments" className="max-w-4xl mx-auto px-6 mt-12 pt-16 border-t-2 border-dashed border-[var(--color-border)]">
        <h2 className="text-3xl font-extrabold text-[var(--color-foreground)] mb-8 flex items-center gap-3">
          Discussion <span className="px-3 py-1 rounded-full bg-[var(--color-surface)] text-sm">{post.commentCount || 0}</span>
        </h2>

        {/* Comment Input Box */}
        <div className="mb-12 flex gap-4 p-6 rounded-3xl bg-[var(--color-surface)]/40 border border-[var(--color-border)] shadow-sm">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
            {isAuthenticated ? 'You' : '?'}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex-1">
            <textarea 
              value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder={isAuthenticated ? "Share your thoughts..." : "Login to join the discussion..."}
              disabled={isCommenting}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[var(--color-brand-primary)] transition-all resize-none min-h-[100px] mb-4"
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={!commentText.trim() || isCommenting}
                className="px-6 py-2.5 bg-[var(--color-foreground)] text-[var(--color-background)] rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
              >
                {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Comment
              </button>
            </div>
          </form>
        </div>

        {/* Comments Feed */}
        <div className="space-y-6">
          {commentsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-accent)]" /></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-surface)]/30 rounded-3xl border border-dashed border-[var(--color-border)]">
              <MessageSquare className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-3" />
              <p className="text-[var(--color-muted)] font-medium">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 group">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
                  {comment.user?.image ? <img src={comment.user.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{comment.user?.name?.charAt(0).toUpperCase()}</div>}
                </div>
                <div className="flex-1">
                  <div className="p-5 rounded-2xl rounded-tl-none bg-[var(--color-surface)]/60 border border-[var(--color-border)] shadow-sm group-hover:border-[var(--color-brand-primary)]/30 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-[var(--color-foreground)]">{comment.user?.name || 'Anonymous'}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--color-muted)]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        {user?.id === comment.userId && (
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); }} className="text-[var(--color-muted)] hover:text-blue-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-[var(--color-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-2">
                        <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm outline-none mb-2" />
                        <div className="flex gap-2">
                          <button onClick={() => handleEditSubmit(comment.id)} className="px-3 py-1 bg-[var(--color-foreground)] text-[var(--color-background)] rounded-full text-xs font-bold">Save</button>
                          <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-xs font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-foreground)]/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                  
                  {/* Nested Replies (If backend supports depth, render them here) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-6 border-l-2 border-[var(--color-border)]/50">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-3">
                          <CornerDownRight className="w-4 h-4 text-[var(--color-muted)] shrink-0 mt-2" />
                          <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
                            {reply.user?.image ? <img src={reply.user.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[10px]">{reply.user?.name?.charAt(0).toUpperCase()}</div>}
                          </div>
                          <div className="flex-1 p-4 rounded-2xl rounded-tl-none bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-[var(--color-foreground)]">{reply.user?.name}</span>
                            </div>
                            <p className="text-sm text-[var(--color-foreground)]/80 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {/* Comment Pagination */}
          {commentPagination?.totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-4">
              <button onClick={() => setCommentsPage(p => Math.max(1, p - 1))} disabled={commentsPage === 1} className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-xs font-bold disabled:opacity-50">Previous</button>
              <button onClick={() => setCommentsPage(p => Math.min(commentPagination.totalPages, p + 1))} disabled={commentsPage === commentPagination.totalPages} className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-xs font-bold disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* RELATED POSTS SECTION */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-16 border-t border-[var(--color-border)]">
          <h2 className="text-2xl font-extrabold text-[var(--color-foreground)] mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="block h-full group">
                <div className="flex flex-col h-full rounded-3xl bg-[var(--color-surface)]/60 border border-[var(--color-border)]/60 shadow-sm hover:shadow-xl hover:border-[var(--color-brand-primary)]/50 transition-all duration-300 overflow-hidden relative">
                  <div className="w-full aspect-video bg-[var(--color-background)] overflow-hidden">
                    {relatedPost.coverImage ? (
                      <img src={relatedPost.coverImage} alt={relatedPost.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)]" />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-extrabold text-[var(--color-foreground)] leading-tight mb-2 line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
                      {relatedPost.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-4 text-[var(--color-muted)]">
                      <span className="flex items-center gap-1.5 text-xs font-bold"><Eye className="w-3.5 h-3.5" /> {relatedPost.viewCount}</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold"><Heart className="w-3.5 h-3.5" /> {relatedPost.likeCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SHARE MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {showShareModal && post && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-muted)] transition-colors text-lg font-bold"
              >
                ×
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-[var(--color-brand-primary)]" />
                </div>
                <h3 className="text-xl font-extrabold text-[var(--color-foreground)]">Share this article</h3>
                <p className="text-sm text-[var(--color-muted)] mt-1 line-clamp-2 font-medium">{post.title}</p>
              </div>

              {/* Copy Link */}
              <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl mb-6">
                <input
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="flex-1 text-sm text-[var(--color-muted)] bg-transparent outline-none truncate font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all flex-shrink-0 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 bg-black text-white rounded-2xl font-bold text-sm hover:bg-black/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 bg-[#0077B5] text-white rounded-2xl font-bold text-sm hover:bg-[#0077B5]/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 bg-[#25D366] text-white rounded-2xl font-bold text-sm hover:bg-[#25D366]/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2.5 p-3.5 bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-2xl font-bold text-sm hover:bg-[var(--color-border)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Copy Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
