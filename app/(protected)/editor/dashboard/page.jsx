"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, ImagePlus, ArrowLeft, Send, Save, 
  Bold, Italic, Heading2, Heading3, Quote, List, ListOrdered, Camera, X, ChevronDown,
  LayoutDashboard, FileText, Plus, User, ShieldAlert, Home,
  PenLine
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// TipTap Editor
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// API Hooks & Store
import { useCreatePostMutation, useUpdateMyPostMutation } from "@/hooks/mutations/usePostMutations";
import { useGetPostBySlugQuery } from "@/hooks/queries/usePostQueries";
import { useGetCategoriesQuery, useGetTagsQuery } from "@/hooks/queries/useCategoryQueries";
import { useAuthStore } from "@/store/useAuthStore";

// Fluid easing curve for snappy, premium animations
const fluidEase = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: fluidEase } }
};

// ==========================================
// 1. ZOD VALIDATION SCHEMA
// ==========================================
const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content is too short to publish"),
  excerpt: z.string().max(300, "Excerpt cannot exceed 300 characters").optional(),
  categoryId: z.string().optional(),
});

// ==========================================
// 2. INLINE TIPTAP EDITOR 
// ==========================================
const TipTapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    immediatelyRender: false, 
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-lg max-w-none focus:outline-none min-h-[60vh] text-zinc-800 leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight prose-p:font-normal prose-a:text-black',
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, children }) => (
    <button 
      type="button" 
      onClick={onClick} 
      className={`p-2 rounded-md transition-all outline-none flex items-center justify-center ${
        isActive 
          ? 'bg-black text-[#f2f2f2] shadow-sm' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full flex flex-col relative group">
      {/* Sleek Floating Toolbar */}
      <div className="sticky top-[90px] z-20 flex items-center gap-1 p-1.5 bg-[#f2f2f2]/90 backdrop-blur-md border border-zinc-200/80 rounded-lg w-max mb-6 shadow-sm opacity-60 focus-within:opacity-100 hover:opacity-100 transition-opacity duration-200">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" strokeWidth={2.5} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" strokeWidth={2.5} /></ToolbarButton>
        <div className="w-px h-5 bg-zinc-200 mx-1.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" strokeWidth={2.5} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}><Heading3 className="w-4 h-4" strokeWidth={2.5} /></ToolbarButton>
        <div className="w-px h-5 bg-zinc-200 mx-1.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}><Quote className="w-4 h-4" strokeWidth={2.5} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="w-4 h-4" strokeWidth={2.5} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" strokeWidth={2.5} /></ToolbarButton>
      </div>
      
      {/* Editor Canvas */}
      <div className="bg-transparent transition-colors">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN EDITOR INTERFACE
// ==========================================
export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#f2f2f2] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    }>
      <EditorFormContent />
    </Suspense>
  );
}

function EditorFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");

  const { isAuthenticated, isInitialized, user } = useAuthStore();
  
  // Dynamic Dashboard Path based on User Role
  const dashboardPath = user?.role === 'WRITER' ? '/writer/dashboard' : '/editor/dashboard';

  const { data: catResponse, isLoading: catsLoading } = useGetCategoriesQuery();
  const { data: tagResponse, isLoading: tagsLoading } = useGetTagsQuery();
  const { mutate: createPost, isPending: isCreating } = useCreatePostMutation();
  const { mutate: updatePost, isPending: isUpdating } = useUpdateMyPostMutation();

  const isPending = isCreating || isUpdating;

  const { data: postResponse, isLoading: postLoading } = useGetPostBySlugQuery(editSlug);
  const existingPost = postResponse?.data?.post || postResponse?.post || null;

  const [coverImageBase64, setCoverImageBase64] = useState(null); 
  const [selectedTags, setSelectedTags] = useState([]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", excerpt: "", categoryId: "" }
  });

  // Auth Guard
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) router.push("/login");
      else if (user?.role === "USER") {
        toast.error("Access denied.");
        router.push("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  // Pre-fill form
  useEffect(() => {
    if (existingPost) {
      reset({
        title: existingPost.title || "",
        content: existingPost.content || "",
        excerpt: existingPost.excerpt || "",
        categoryId: existingPost.category?.id || existingPost.categoryId || ""
      });
      setCoverImageBase64(existingPost.coverImage || null);
      if (existingPost.tags) setSelectedTags(existingPost.tags.map(t => t.id));
      
      if (existingPost.authorId !== user?.id && user?.role !== 'ADMIN' && user?.role !== 'AUTHOR') {
        toast.error("Permission denied.");
        router.push(dashboardPath);
      }
    }
  }, [existingPost, reset, user, router, dashboardPath]);

  // Image Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image is too large. Maximum size is 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setCoverImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1, maxSize: 10 * 1024 * 1024,
    onDropRejected: () => toast.error("File rejected. Must be a valid image under 10MB.")
  });

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const onSubmit = (status) => (data) => {
    const payload = { ...data, status: status, coverImage: coverImageBase64, tags: selectedTags };
    if (!payload.categoryId) payload.categoryId = null;

    if (existingPost) {
      updatePost({ id: existingPost.id, payload }, {
        onSuccess: () => {
          toast.success("Post updated successfully", {
            description: "Routing back to your dashboard...",
          });
          setTimeout(() => {
            router.push(dashboardPath);
          }, 1500);
        }
      });
    } else {
      createPost(payload, {
        onSuccess: () => {
          // Fire premium success toast
          toast.success(
            status === "PUBLISHED" ? "Post Published! 🎉" : "Draft Saved! 📝", 
            {
              description: "Routing back to your dashboard...",
              duration: 3000,
            }
          );
          
          // Clear everything so the user sees the slate wipe clean
          reset({ title: "", content: "", excerpt: "", categoryId: "" });
          setCoverImageBase64(null);
          setSelectedTags([]);
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Delay the redirect slightly so the toast and clean slate are visible
          setTimeout(() => {
            router.push(dashboardPath);
          }, 1500);
        }
      });
    }
  };

  const categories = catResponse?.data?.categories || catResponse?.categories || catResponse?.data || [];
  const tags = tagResponse?.data?.tags || tagResponse?.tags || tagResponse?.data || [];

  if (!isInitialized || (editSlug && postLoading)) {
    return (
      <div className="h-screen bg-[#f2f2f2] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col md:flex-row font-sans text-zinc-900">
      
      {/* ======================================= */}
      {/* DESKTOP SIDEBAR                         */}
      {/* ======================================= */}
      <aside className="hidden md:flex flex-col w-[280px] lg:w-[320px] fixed inset-y-0 left-0 bg-[#f2f2f2] border-r border-zinc-200/50 p-6 overflow-y-auto z-30">
        <div className="mb-10">
          <Link href="/" className="inline-block outline-none">
            <h2 className="text-[24px] font-black tracking-tighter text-black hover:opacity-70 transition-opacity">
              Eklak.
            </h2>
          </Link>
          <p className="text-[13px] text-zinc-400 font-medium mt-1">Writer Workspace</p>
        </div>

        <nav className="flex flex-col gap-1.5 mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-3">Navigation</p>
          <Link href={dashboardPath} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 border border-transparent transition-all outline-none">
            <LayoutDashboard className="w-4 h-4" /> My Posts
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold bg-zinc-100/80 text-black shadow-sm border border-zinc-200/50 outline-none">
            <PenLine className="w-4 h-4" /> {existingPost ? "Edit Post" : "New Post"}
          </div>
        </nav>
      </aside>

      {/* ======================================= */}
      {/* MAIN CONTENT AREA                       */}
      {/* ======================================= */}
      <div className="flex-1 md:ml-[280px] lg:ml-[320px] flex flex-col w-full min-h-screen">
        
        {/* Top Navbar */}
        <header className="flex h-[72px] bg-[#f2f2f2]/80 backdrop-blur-md border-b border-zinc-200/50 items-center justify-between px-6 lg:px-12 sticky top-0 z-20">
          <div className="flex items-center gap-3 text-[14px] font-semibold tracking-tight">
            <Link href={dashboardPath} className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-zinc-400">Workspace</span>
            <span className="text-zinc-300">/</span>
            <span className="text-black">{existingPost ? "Editing Post" : "Drafting"}</span>
          </div>

          <div className="hidden sm:flex flex-items gap-3 text-right">
             <p className="text-[13px] font-bold text-black">{user?.name || "Eklak"}</p>
             <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0">
               {user?.image ? <img src={user.image} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
             </div>
          </div>
        </header>

        {/* ======================================= */}
        {/* EDITOR WORKSPACE GRID                   */}
        {/* ======================================= */}
        <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-8 lg:py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* LEFT: THE WRITING CANVAS */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: fluidEase }}
              className="lg:col-span-8 flex flex-col"
            >
              {/* Brutalist Title Input */}
              <div className="mb-6">
                <input 
                  type="text" 
                  placeholder="Post Title..."
                  {...register("title")}
                  className="w-full text-3xl md:text-4xl lg:text-5xl font-bold bg-transparent border-none outline-none text-black placeholder-zinc-300 tracking-tighter leading-[1.1] py-2"
                />
                <AnimatePresence>
                  {errors.title && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm mt-2 font-medium">
                      {errors.title.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* TipTap Rich Text Editor */}
              <div className="flex-1 w-full relative">
                <Controller
                  name="content" control={control}
                  render={({ field }) => (
                    <TipTapEditor content={field.value} onChange={field.onChange} />
                  )}
                />
                <AnimatePresence>
                  {errors.content && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm mt-4 font-medium">
                      {errors.content.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* RIGHT: THE META SETTINGS PANEL */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: fluidEase, delay: 0.1 }}
              className="lg:col-span-4"
            >
              <div className="space-y-8 sticky top-[100px] bg-[#f2f2f2] border border-zinc-200/60 p-6 rounded-xl shadow-sm">
                
                <h3 className="text-[14px] font-bold tracking-wide uppercase text-black border-b border-zinc-200/80 pb-4">
                  Settings
                </h3>

                {/* 1. Cover Image Upload */}
                <div>
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Cover Image</label>
                  <div 
                    {...getRootProps()} 
                    className={`relative border rounded-lg text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                      isDragActive ? 'border-zinc-400 bg-zinc-50' : 'border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
                    } ${coverImageBase64 ? 'border-solid border-transparent p-0 aspect-video' : 'p-8 aspect-video flex items-center justify-center'}`}
                  >
                    <input {...getInputProps()} />
                    {coverImageBase64 ? (
                      <div className="w-full h-full relative">
                        <img src={coverImageBase64} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                          <span className="text-[12px] font-bold text-black flex items-center gap-2 bg-[#f2f2f2] px-4 py-2 rounded-md shadow-sm">
                            <Camera className="w-4 h-4" /> Change
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCoverImageBase64(null); }}
                            className="text-[12px] font-bold text-white hover:text-red-400 transition-colors flex items-center gap-1.5 outline-none"
                          >
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                        <ImagePlus className="w-6 h-6 mb-3" strokeWidth={1.5} />
                        <p className="text-[13px] font-semibold mb-1">Upload Thumbnail</p>
                        <p className="text-[11px] font-medium opacity-70">Max 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Excerpt */}
                <div>
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Excerpt</label>
                  <textarea 
                    {...register("excerpt")} rows="3"
                    className="w-full bg-zinc-50 hover:bg-zinc-100/50 border border-zinc-200/80 rounded-lg px-4 py-3 text-[14px] text-black outline-none focus:bg-[#f2f2f2] focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 resize-none placeholder-zinc-400"
                    placeholder="Brief summary..."
                  />
                  <AnimatePresence>
                    {errors.excerpt && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[12px] mt-1.5 font-semibold">{errors.excerpt.message}</motion.p>}
                  </AnimatePresence>
                </div>

                {/* 3. Category */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest block">Category</label>
                    {catsLoading && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                  </div>
                  <div className="relative">
                    <select 
                      {...register("categoryId")}
                      className="w-full appearance-none bg-zinc-50 hover:bg-zinc-100/50 border border-zinc-200/80 rounded-lg px-4 py-3 text-[14px] font-medium text-black outline-none focus:bg-[#f2f2f2] focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 cursor-pointer"
                    >
                      <option value="">Select category...</option>
                      {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Tags */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest block">Tags</label>
                    {tagsLoading && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags?.map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1.5 rounded-md text-[12px] font-bold tracking-wide transition-all duration-200 cursor-pointer outline-none border ${
                            isSelected 
                              ? 'bg-black text-[#f2f2f2] border-black shadow-sm' 
                              : 'bg-[#f2f2f2] text-zinc-500 hover:text-black border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {tag.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* PUBLISHING ACTIONS */}
                <div className="pt-6 mt-6 border-t border-zinc-200/80 flex flex-col gap-3">
                  <button 
                    onClick={handleSubmit(onSubmit("PUBLISHED"))}
                    disabled={isPending || user?.role === 'WRITER'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-[#f2f2f2] rounded-lg text-[13px] font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none shadow-sm"
                    title={user?.role === 'WRITER' ? "Writers can only save drafts." : ""}
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {user?.role === 'WRITER' ? 'Restricted' : 'Publish Post'}
                  </button>
                  
                  <button 
                    onClick={handleSubmit(onSubmit("DRAFT"))}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#f2f2f2] border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-[13px] font-bold active:scale-[0.98] transition-all disabled:opacity-50 outline-none"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Draft
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}