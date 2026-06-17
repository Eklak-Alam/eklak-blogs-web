"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, Clock, Eye, Heart, Bookmark, MessageSquare, 
  Share2, Loader2, ArrowRight, CornerDownRight, Edit2, Trash2, X 
} from "lucide-react";

import { useGetPostBySlugQuery, useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCommentsQuery } from "@/hooks/queries/useInteractionQueries";
import { useToggleLikeMutation, useToggleBookmarkMutation, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "@/hooks/mutations/useInteractionMutations";
import { useIncrementShareCountMutation } from "@/hooks/mutations/usePostMutations";
import { useAuthStore } from "@/store/useAuthStore";

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
};

export default function PostReadingPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  
  const [commentText, setCommentText] = useState("");
  const [commentsPage, setCommentsPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Queries
  const { data: postResponse, isLoading: postLoading, error: postError } = useGetPostBySlugQuery(slug);
  const post = postResponse?.data?.post || postResponse?.post;
  
  const { data: commentsResponse, isLoading: commentsLoading } = useGetCommentsQuery(post?.id, { page: commentsPage, limit: 10 });
  const comments = commentsResponse?.comments || commentsResponse?.data?.comments || [];
  const commentPagination = commentsResponse?.pagination || commentsResponse?.data?.pagination;

  // Related Posts Query
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

  // Optimistic like/bookmark state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (post?.likeCount !== undefined) setLikeCount(post.likeCount);
  }, [post?.likeCount]);

  // Auth Gate
  const requireAuth = (actionCallback) => {
    if (!isAuthenticated) {
      toast.error("Authentication required for this action.");
      router.push("/login");
      return;
    }
    actionCallback();
  };

  const handleLike = () => requireAuth(() => {
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    setLikeCount(prev => nowLiked ? prev + 1 : prev - 1);
    toggleLike({ postId: post.id }, {
      onError: () => {
        setIsLiked(!nowLiked);
        setLikeCount(prev => nowLiked ? prev - 1 : prev + 1);
        toast.error("Failed to sync status.");
      }
    });
  });

  const handleBookmark = () => requireAuth(() => {
    const nowBookmarked = !isBookmarked;
    setIsBookmarked(nowBookmarked);
    toggleBookmark({ postId: post.id }, {
      onSuccess: () => toast.success(nowBookmarked ? "Saved to archive." : "Removed from archive."),
      onError: () => {
        setIsBookmarked(!nowBookmarked);
        toast.error("Failed to sync status.");
      }
    });
  });
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    requireAuth(() => {
      addComment({ postId: post.id, payload: { content: commentText } }, {
        onSuccess: () => {
          setCommentText("");
          setCommentsPage(1); 
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
    if (confirm("Confirm deletion of this record?")) {
      deleteComment({ id: commentId, postId: post.id });
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    if (post?.id) incrementShare(post.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl font-normal text-[var(--color-foreground)] mb-4">Record Not Found</h1>
        <p className="text-[14px] font-light text-[var(--color-muted)] mb-8">The requested transmission does not exist in the archive.</p>
        <Link href="/blog" className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-accent)] hover:underline">
          Return to Index
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30 pb-32">
      
      {/* Ultra-thin Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-transparent z-50">
        <div className="h-full bg-[var(--color-brand-accent)] w-1/3" />
      </div>

      {/* ======================================== */}
      {/* 1. EDITORIAL HEADER                      */}
      {/* ======================================== */}
      <div className="pt-32 pb-16 max-w-[1000px] mx-auto px-6">
        
        {/* Navigation & Category */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-6 mb-12"
        >
          <button onClick={() => router.back()} className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors duration-500 outline-none">
            <ArrowLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
            Back
          </button>
          {post.category && (
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
              {post.category.name}
            </span>
          )}
        </motion.div>

        {/* Title & Meta */}
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="text-center flex flex-col items-center">
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-[4.5rem] font-normal tracking-tight text-[var(--color-foreground)] leading-[1.05] mb-10">
            {post.title}
          </motion.h1>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
            <div className="flex items-center gap-3">
              {post.author?.image ? (
                <img src={post.author.image} alt="" className="w-6 h-6 rounded-none object-cover grayscale" />
              ) : (
                <div className="w-6 h-6 rounded-none bg-[var(--color-border)]/30 flex items-center justify-center text-[var(--color-foreground)]">
                  {post.author?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <span className="text-[var(--color-foreground)]">{post.author?.name || 'System'}</span>
            </div>
            <span className="w-1 h-1 rounded-none bg-[var(--color-border)]" />
            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-none bg-[var(--color-border)]" />
            <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> {post.viewCount} Reads</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ======================================== */}
      {/* 2. CINEMATIC COVER IMAGE (Sharp Edges)   */}
      {/* ======================================== */}
      {post.coverImage && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: cinematicEase, delay: 0.3 }}
          className="w-full max-w-[1200px] mx-auto px-6 mb-24"
        >
          <div className="w-full aspect-[21/9] bg-[var(--color-surface)]/20 overflow-hidden rounded-none border border-[var(--color-border)]/40">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover filter grayscale-[30%] hover:grayscale-0 transition-all duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)]" 
            />
          </div>
        </motion.div>
      )}

      {/* ======================================== */}
      {/* 3. MAIN CONTENT & SIDEBAR                */}
      {/* ======================================== */}
      <div className="max-w-[1000px] mx-auto px-6 flex flex-col lg:flex-row gap-16 relative">
        
        {/* LEFT: Raw, Naked Action Icons (Sticky) */}
        <div className="hidden lg:block w-12 shrink-0 relative">
          <div className="sticky top-32 flex flex-col items-center gap-8">
            <button 
              onClick={handleLike} 
              disabled={isLiking}
              className="group flex flex-col items-center gap-2 outline-none"
            >
              <Heart className={`w-5 h-5 transition-colors duration-700 ${ isLiked ? 'fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-brand-accent)]' }`} strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-[var(--color-muted)] tracking-widest">{likeCount}</span>
            </button>
            
            <button 
              onClick={handleBookmark}
              disabled={isBookmarking}
              className="group flex flex-col items-center outline-none"
            >
              <Bookmark className={`w-5 h-5 transition-colors duration-700 ${ isBookmarked ? 'fill-[var(--color-brand-primary)] text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-brand-primary)]' }`} strokeWidth={1.5} />
            </button>
            
            <button onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })} className="group outline-none">
              <MessageSquare className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors duration-500" strokeWidth={1.5} />
            </button>
            
            <div className="w-[1px] h-12 bg-[var(--color-border)]/40 my-2" />
            
            <button onClick={handleShare} className="group outline-none">
              <Share2 className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors duration-500" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* MIDDLE: Pure Typography Body */}
        <article className="flex-1 min-w-0">
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:font-normal prose-headings:tracking-tight prose-headings:text-[var(--color-foreground)] 
              prose-p:font-light prose-p:leading-[1.9] prose-p:text-[var(--color-muted)]
              prose-a:text-[var(--color-brand-accent)] prose-a:no-underline hover:prose-a:underline
              prose-strong:font-medium prose-strong:text-[var(--color-foreground)]
              prose-img:rounded-none prose-img:border prose-img:border-[var(--color-border)]/30
              prose-blockquote:font-light prose-blockquote:border-l-[var(--color-brand-primary)] prose-blockquote:text-[var(--color-brand-dark)]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-20 pt-8 border-t border-[var(--color-border)]/40 flex flex-wrap gap-4 items-center">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">Index Tags:</span>
              {post.tags.map(tag => (
                <span key={tag.id} className="px-3 py-1 bg-transparent border border-[var(--color-border)]/50 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-foreground)] rounded-none">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </article>

      </div>

      {/* ======================================== */}
      {/* MOBILE ACTION BAR (Flat Bottom Edge)     */}
      {/* ======================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background)] border-t border-[var(--color-border)]/40 px-6 py-4 flex justify-between items-center">
        <button onClick={handleLike} className="flex items-center gap-2 outline-none">
          <Heart className={`w-5 h-5 transition-colors ${ isLiked ? 'fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]' : 'text-[var(--color-muted)]' }`} strokeWidth={1.5} /> 
          <span className="text-[11px] font-medium text-[var(--color-muted)]">{likeCount}</span>
        </button>
        <button onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })} className="outline-none">
          <MessageSquare className="w-5 h-5 text-[var(--color-muted)]" strokeWidth={1.5} />
        </button>
        <button onClick={handleBookmark} className="outline-none">
          <Bookmark className={`w-5 h-5 transition-colors ${ isBookmarked ? 'fill-[var(--color-brand-primary)] text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)]' }`} strokeWidth={1.5} />
        </button>
        <button onClick={handleShare} className="outline-none">
          <Share2 className="w-5 h-5 text-[var(--color-muted)]" strokeWidth={1.5} />
        </button>
      </div>

      {/* ======================================== */}
      {/* 4. EDITORIAL COMMENTS SECTION            */}
      {/* ======================================== */}
      <div id="comments" className="max-w-[700px] mx-auto px-6 mt-32">
        <div className="border-b border-[var(--color-border)]/40 pb-6 mb-12 flex items-center justify-between">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)]">
            Discourse Log
          </h2>
          <span className="text-[10px] font-medium tracking-widest text-[var(--color-muted)] font-mono">
            [{post.commentCount || 0}]
          </span>
        </div>

        {/* Comment Input */}
        <div className="mb-16">
          <form onSubmit={handleCommentSubmit} className="flex flex-col border border-[var(--color-border)]/40 bg-[var(--color-surface)]/10 rounded-none focus-within:border-[var(--color-brand-accent)]/50 transition-colors duration-700">
            <textarea 
              value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder={isAuthenticated ? "Log your perspective..." : "Authentication required to log perspective."}
              disabled={isCommenting || !isAuthenticated}
              className="w-full bg-transparent px-4 py-4 text-[14px] font-light outline-none resize-none min-h-[120px] text-[var(--color-foreground)] placeholder-[var(--color-muted)]/50"
            />
            <div className="flex justify-between items-center px-4 py-3 border-t border-[var(--color-border)]/20 bg-[var(--color-surface)]/20">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-muted)]">
                {isAuthenticated ? user?.name : 'Guest'}
              </span>
              <button 
                type="submit" 
                disabled={!commentText.trim() || isCommenting}
                className="px-6 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] rounded-none text-[11px] font-medium uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-30 outline-none flex items-center gap-2"
              >
                {isCommenting ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} /> : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Comments Feed */}
        <div className="space-y-10">
          {commentsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} /></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[13px] font-light text-[var(--color-muted)]">No logs recorded for this transmission yet.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col pb-8 border-b border-[var(--color-border)]/20">
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-none bg-[var(--color-border)]/30 flex items-center justify-center text-[10px] text-[var(--color-foreground)]">
                      {comment.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[12px] text-[var(--color-foreground)] uppercase tracking-wider">{comment.user?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[var(--color-muted)] uppercase tracking-widest font-mono">
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    {user?.id === comment.userId && (
                      <div className="flex gap-3">
                        <button onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); }} className="hover:text-[var(--color-brand-primary)] transition-colors outline-none">Edit</button>
                        <button onClick={() => handleDeleteComment(comment.id)} className="hover:text-red-500 transition-colors outline-none">Purge</button>
                      </div>
                    )}
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="flex flex-col border border-[var(--color-border)]/40 p-2">
                    <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full bg-transparent text-[14px] font-light outline-none mb-3 min-h-[60px]" />
                    <div className="flex gap-4">
                      <button onClick={() => handleEditSubmit(comment.id)} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-brand-accent)] hover:underline outline-none">Save</button>
                      <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-muted)] hover:underline outline-none">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] font-light text-[var(--color-foreground)]/80 leading-relaxed whitespace-pre-wrap pl-9">
                    {comment.content}
                  </p>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-6 space-y-6 pl-9 border-l border-[var(--color-border)]/30 ml-3">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-[11px] text-[var(--color-muted)] uppercase tracking-wider">{reply.user?.name}</span>
                        </div>
                        <p className="text-[13px] font-light text-[var(--color-foreground)]/70 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}

          {/* Comment Pagination */}
          {commentPagination?.totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <button onClick={() => setCommentsPage(p => Math.max(1, p - 1))} disabled={commentsPage === 1} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-foreground)] disabled:opacity-30 outline-none hover:text-[var(--color-brand-accent)] transition-colors">Previous Log</button>
              <button onClick={() => setCommentsPage(p => Math.min(commentPagination.totalPages, p + 1))} disabled={commentsPage === commentPagination.totalPages} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-foreground)] disabled:opacity-30 outline-none hover:text-[var(--color-brand-accent)] transition-colors">Next Log</button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================== */}
      {/* 5. SHARP RELATED POSTS GRID              */}
      {/* ======================================== */}
      {relatedPosts.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 mt-40 pt-16 border-t border-[var(--color-border)]/40">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] mb-12">
            Related Transmissions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block cursor-pointer">
                <div className="w-full aspect-[4/3] bg-[var(--color-surface)]/20 overflow-hidden rounded-none border border-[var(--color-border)]/30 mb-5">
                  {relatedPost.coverImage ? (
                    <img src={relatedPost.coverImage} alt="" className="w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]/30">
                      <span className="text-[9px] font-mono tracking-widest uppercase">No Asset</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-normal text-[var(--color-foreground)] leading-snug mb-3 line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors duration-700">
                  {relatedPost.title}
                </h3>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-medium text-[var(--color-muted)]">
                  <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> {relatedPost.viewCount}</span>
                  <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" strokeWidth={1.5} /> {relatedPost.likeCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* FLAT SHARE MODAL                         */}
      {/* ======================================== */}
      <AnimatePresence>
        {showShareModal && post && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.5, ease: cinematicEase }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-background)] border border-[var(--color-border)]/40 rounded-none p-8 w-full max-w-md relative"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors outline-none"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <div className="mb-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3">Distribute</p>
                <h3 className="text-2xl font-normal text-[var(--color-foreground)]">{post.title}</h3>
              </div>

              <div className="flex items-center gap-3 p-3 bg-transparent border border-[var(--color-border)]/50 rounded-none mb-8">
                <input
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="flex-1 text-[13px] font-light text-[var(--color-muted)] bg-transparent outline-none truncate font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition-all flex-shrink-0 outline-none rounded-none border border-[var(--color-foreground)] ${
                    copied ? "bg-[var(--color-brand-primary)] text-[var(--color-background)] border-[var(--color-brand-primary)]" : "bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-80"
                  }`}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-black text-white rounded-none font-medium text-[11px] uppercase tracking-widest hover:bg-black/80 transition-colors border border-transparent">
                  X / Twitter
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-[#0077B5] text-white rounded-none font-medium text-[11px] uppercase tracking-widest hover:bg-[#0077B5]/80 transition-colors border border-transparent">
                  LinkedIn
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}