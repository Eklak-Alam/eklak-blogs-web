"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, Clock, Eye, Heart, Bookmark, MessageSquare, 
  Share2, Loader2, X, Copy 
} from "lucide-react";
// Using official brand icons from react-icons
import { FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

import { useGetPostBySlugQuery, useGetPublishedPostsQuery } from "@/hooks/queries/usePostQueries";
import { useGetCommentsQuery, useGetMyInteractionsQuery } from "@/hooks/queries/useInteractionQueries";
import { useToggleLikeMutation, useToggleBookmarkMutation, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "@/hooks/mutations/useInteractionMutations";
import { useIncrementShareCountMutation } from "@/hooks/mutations/usePostMutations";
import { useAuthStore } from "@/store/useAuthStore";

// Smooth editorial easing curve
const smoothEase = [0.25, 1, 0.5, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: smoothEase } }
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

  const { data: myInteractions } = useGetMyInteractionsQuery(isAuthenticated ? post?.id : null);

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (post?.likeCount !== undefined) setLikeCount(post.likeCount);
  }, [post?.likeCount]);

  useEffect(() => {
    if (myInteractions?.data) {
      setIsLiked(myInteractions.data.isLiked);
      setIsBookmarked(myInteractions.data.isBookmarked);
    }
  }, [myInteractions]);

  const requireAuth = (actionCallback) => {
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(`/blog/${slug}`);
      toast("Sign in required", {
        description: "Please sign in to interact with this post.",
        action: {
          label: "Sign In",
          onClick: () => router.push(`/login?callbackUrl=${callbackUrl}`),
        },
      });
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
      }
    });
  });

  const handleBookmark = () => requireAuth(() => {
    const nowBookmarked = !isBookmarked;
    setIsBookmarked(nowBookmarked);
    toggleBookmark({ postId: post.id });
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
    if (confirm("Are you sure you want to delete this comment?")) {
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
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options).toUpperCase();
  };

  const calculateReadTime = (text) => {
    if (!text) return 5;
    const wordCount = text.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" strokeWidth={1.5} />
      </div>
    );
  }

  if (postError || !post) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 relative font-sans">
      
      {/* ======================================== */}
      {/* 1. EDITORIAL HEADER & HERO               */}
      {/* ======================================== */}
      <div className="pt-36 max-w-5xl mx-auto px-6 text-center">
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <span className="font-mono text-[11px] md:text-xs font-medium tracking-[0.15em] text-zinc-500 uppercase">
            {formatDate(post.createdAt)} &nbsp;&bull;&nbsp; {calculateReadTime(post.content)} MINUTE READ
          </span>
        </motion.div>

        <motion.h1 
          initial="hidden" animate="visible" variants={fadeUp} 
          className="text-5xl md:text-6xl lg:text-[4.5rem] font-medium  leading-[1.05] text-zinc-900 mb-16"
        >
          {post.title}
        </motion.h1>
      </div>

      {post.coverImage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: smoothEase, delay: 0.2 }}
          className="w-full max-w-6xl mx-auto px-6 mb-24"
        >
          {/* Made the image taller by changing aspect ratio */}
          <div className="w-full aspect-[16/9] md:aspect-[2/1] overflow-hidden rounded-2xl md:rounded-[2rem]">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            />
          </div>
        </motion.div>
      )}

      {/* ======================================== */}
      {/* 2. MAIN TWO-COLUMN LAYOUT                */}
      {/* ======================================== */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-16 relative pb-24">
        
        {/* LEFT SIDEBAR (Author, Tags, Share) */}
        <div className="lg:w-64 shrink-0 order-2 lg:order-1">
          <div className="sticky top-32 flex flex-col gap-10">
            
            <Link href="/blog" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />
              Blog
            </Link>

            {/* Author */}
            <div>
              <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Written By</p>
              <div className="flex items-center gap-4">
                {post.author?.image ? (
                  <img src={post.author.image} alt={post.author.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-medium">
                    {post.author?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900">{post.author?.name || 'System'}</p>
                  <p className="text-sm text-slate-500 line-clamp-1">{post.author?.bio || 'Member of Technical Staff'}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-slate-200" />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag.id} className="px-4 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors cursor-default">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full h-[1px] bg-slate-200" />

            {/* Actions & Share */}
            <div>
              <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Share</p>
              <div className="flex items-center gap-4">
                <button onClick={handleShare} className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors group outline-none flex items-center justify-center">
                  <FaXTwitter className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
                </button>
                <button onClick={handleShare} className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors group outline-none flex items-center justify-center">
                  <FaLinkedinIn className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                </button>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={handleLike} className="group outline-none flex items-center gap-1.5">
                    <Heart className={`w-5 h-5 transition-colors ${ isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-500' }`} strokeWidth={1.5} />
                    <span className="text-sm font-medium text-slate-500">{likeCount}</span>
                  </button>
                  <button onClick={handleBookmark} className="group outline-none">
                    <Bookmark className={`w-5 h-5 transition-colors ${ isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-slate-400 group-hover:text-blue-500' }`} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <article className="flex-1 min-w-0 order-1 lg:order-2 max-w-[760px]">
          <div 
            className="prose prose-lg md:prose-xl max-w-none 
              prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-slate-900 
              prose-p:font-light prose-p:leading-relaxed prose-p:text-slate-600
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:font-semibold prose-strong:text-slate-900
              prose-img:rounded-2xl prose-img:border prose-img:border-slate-200
              prose-blockquote:font-normal prose-blockquote:border-l-4 prose-blockquote:border-slate-900 prose-blockquote:text-slate-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Comments Section */}
          <div id="comments" className="mt-32 pt-16 border-t border-slate-200">
            <h3 className="text-2xl font-medium tracking-tight mb-8">Comments ({post.commentCount || 0})</h3>

            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-12">
                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 ring-slate-200 transition-shadow">
                  <textarea 
                    value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Join the discussion..."
                    disabled={isCommenting}
                    className="w-full bg-transparent px-4 py-4 text-base outline-none resize-none min-h-[100px] placeholder:text-slate-400"
                  />
                  <div className="flex justify-end items-center px-4 py-3 bg-slate-50 border-t border-slate-200">
                    <button 
                      type="submit" 
                      disabled={!commentText.trim() || isCommenting}
                      className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl mb-12 border border-slate-200 text-center gap-4">
                <p className="text-slate-600">Sign in to join the conversation.</p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/blog/${slug}`)}`}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium transition-transform active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Comments Feed */}
            <div className="space-y-8">
              {commentsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  {comment.user?.image ? (
                    <img src={comment.user.image} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-medium shrink-0">
                      {comment.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-semibold text-slate-900">{comment.user?.name}</span>
                      <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      
                      {user?.id === comment.userId && (
                        <div className="ml-auto flex gap-3 text-xs font-medium text-slate-400">
                          <button onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); }} className="hover:text-slate-900">Edit</button>
                          <button onClick={() => handleDeleteComment(comment.id)} className="hover:text-red-500">Delete</button>
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="mt-2 border border-slate-200 rounded-lg p-3">
                        <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full bg-transparent outline-none mb-3 min-h-[60px]" />
                        <div className="flex gap-3">
                          <button onClick={() => handleEditSubmit(comment.id)} className="text-xs font-medium bg-slate-900 text-white px-3 py-1.5 rounded-md">Save</button>
                          <button onClick={() => setEditingCommentId(null)} className="text-xs font-medium text-slate-500 hover:text-slate-900">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </article>
      </div>

      {/* ======================================== */}
      {/* 3. RELATED POSTS GRID                    */}
      {/* ======================================== */}
      {relatedPosts.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 pt-24 pb-32">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-medium tracking-tight mb-12">Read this next</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group flex flex-col cursor-pointer">
                  <div className="w-full aspect-[16/9] overflow-hidden rounded-2xl mb-6 bg-slate-100">
                    {relatedPost.coverImage && (
                      <img src={relatedPost.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  
                  {/* Fixed Map Key Error Here */}
                  {relatedPost.tags && relatedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {relatedPost.tags.slice(0, 2).map((tag, index) => (
                        <span key={tag.id || tag.name || index} className="px-3 py-1 rounded-full border border-slate-200 text-xs font-medium text-slate-600 bg-white">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-xl font-medium text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <div className="mt-auto pt-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    {formatDate(relatedPost.createdAt)} &nbsp;&bull;&nbsp; {calculateReadTime(relatedPost.content)} MIN READ
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* SHARE MODAL                              */}
      {/* ======================================== */}
      <AnimatePresence>
        {showShareModal && post && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors outline-none bg-slate-100 p-2 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-2xl font-medium mb-6 pr-8">Share this article</h3>

              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl mb-6 border border-slate-200">
                <input
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="flex-1 text-sm bg-transparent outline-none truncate px-3"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-[#0F1419] text-white rounded-xl font-medium text-sm hover:bg-black transition-colors">
                  <FaXTwitter className="w-[18px] h-[18px]" /> X / Twitter
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-[#0A66C2] text-white rounded-xl font-medium text-sm hover:bg-[#004182] transition-colors">
                  <FaLinkedinIn className="w-[18px] h-[18px]" /> LinkedIn
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}