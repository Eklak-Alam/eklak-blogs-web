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
  Bold, Italic, Heading2, Heading3, Quote, List, ListOrdered, Camera, X, ChevronDown
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

// Fluid easing curve
const fluidEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: fluidEase } }
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
        class: 'prose prose-zinc prose-lg max-w-none focus:outline-none min-h-[60vh] text-zinc-800 leading-relaxed prose-headings:font-medium prose-p:font-light prose-a:text-zinc-900',
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
      className={`p-2 rounded-xl transition-all outline-none flex items-center justify-center ${
        isActive 
          ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full flex flex-col relative group">
      {/* Soft Floating Toolbar */}
      <div className="sticky top-[100px] z-20 flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-2xl w-max mb-8 shadow-sm opacity-50 focus-within:opacity-100 hover:opacity-100 transition-opacity duration-300">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" strokeWidth={2} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" strokeWidth={2} /></ToolbarButton>
        <div className="w-px h-6 bg-zinc-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" strokeWidth={2} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}><Heading3 className="w-4 h-4" strokeWidth={2} /></ToolbarButton>
        <div className="w-px h-6 bg-zinc-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}><Quote className="w-4 h-4" strokeWidth={2} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="w-4 h-4" strokeWidth={2} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" strokeWidth={2} /></ToolbarButton>
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
      <div className="h-[100dvh] bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
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
      
      // Ownership Guard
      if (existingPost.authorId !== user?.id && user?.role !== 'ADMIN' && user?.role !== 'AUTHOR') {
        toast.error("Permission denied.");
        router.push("/writer/dashboard");
      }
    }
  }, [existingPost, reset, user, router]);

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
          toast.success("Post updated successfully.");
          router.push('/writer/dashboard');
        }
      });
    } else {
      createPost(payload, {
        onSuccess: () => {
          toast.success(`Post ${status === "PUBLISHED" ? "published" : "saved"} successfully.`);
          router.push('/writer/dashboard');
        }
      });
    }
  };

  const categories = catResponse?.data?.categories || catResponse?.categories || catResponse?.data || [];
  const tags = tagResponse?.data?.tags || tagResponse?.tags || tagResponse?.data || [];

  if (!isInitialized || (editSlug && postLoading)) {
    return (
      <div className="h-[100dvh] bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 relative pt-3 pb-24">
      
      {/* ======================================= */}
      {/* MAIN WORKSPACE GRID                       */}
      {/* ======================================= */}
      <div className="relative z-10 max-w-[1300px] mx-auto px-6 py-4 md:py-8">
        
        {/* Top Minimal Info Bar */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between pb-6 mb-12"
        >
          <Link 
            href="/writer/dashboard" 
            className="group flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-300 outline-none bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 opacity-70 group-hover:-translate-x-0.5 transition-all duration-300" strokeWidth={2} />
            Back to Dashboard
          </Link>
          <span className="text-[12px] font-medium text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full">
            {existingPost ? "Editing Post" : "New Draft"}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* ======================================= */}
          {/* LEFT: THE WRITING CANVAS                  */}
          {/* ======================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: fluidEase }}
            className="lg:col-span-8 flex flex-col"
          >
            {/* Soft Title Input */}
            <div className="mb-8">
              <input 
                type="text" 
                placeholder="Story Title..."
                {...register("title")}
                className="w-full text-4xl md:text-5xl lg:text-6xl font-medium bg-transparent border-none outline-none text-zinc-900 placeholder-zinc-300 tracking-tight leading-[1.1] py-2"
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

          {/* ======================================= */}
          {/* RIGHT: THE META SETTINGS PANEL            */}
          {/* ======================================= */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: fluidEase, delay: 0.1 }}
            className="lg:col-span-4"
          >
            <div className="space-y-8 sticky top-[100px]">
              
              <h3 className="text-sm font-semibold text-zinc-900 mb-6">
                Post Settings
              </h3>

              {/* 1. Cover Image Upload */}
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-3 block">Cover Image</label>
                <div 
                  {...getRootProps()} 
                  className={`relative border-2 rounded-[24px] text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                    isDragActive ? 'border-zinc-400 bg-zinc-100' : 'border-dashed border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100/50'
                  } ${coverImageBase64 ? 'border-solid border-transparent p-0 aspect-video' : 'p-10 aspect-video flex items-center justify-center'}`}
                >
                  <input {...getInputProps()} />
                  {coverImageBase64 ? (
                    <div className="w-full h-full relative">
                      <img src={coverImageBase64} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-zinc-900 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                          <Camera className="w-4 h-4" /> Change Image
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverImageBase64(null); }}
                          className="text-xs font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 outline-none"
                        >
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                      <ImagePlus className="w-6 h-6 mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium mb-1">Click or drag image</p>
                      <p className="text-[11px] font-medium opacity-60">PNG, JPG, WEBP (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Excerpt */}
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-3 block">Short Excerpt</label>
                <textarea 
                  {...register("excerpt")} rows="3"
                  className="w-full bg-zinc-50 hover:bg-zinc-100/50 border border-zinc-200 rounded-[20px] px-5 py-4 text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-400 focus:ring-[4px] focus:ring-zinc-100 transition-all duration-300 resize-none placeholder-zinc-400"
                  placeholder="A brief summary for the blog feed..."
                />
                <AnimatePresence>
                  {errors.excerpt && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs mt-2 font-medium">{errors.excerpt.message}</motion.p>}
                </AnimatePresence>
              </div>

              {/* 3. Category */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-zinc-500 block">Category</label>
                  {catsLoading && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                </div>
                <div className="relative">
                  <select 
                    {...register("categoryId")}
                    className="w-full appearance-none bg-zinc-50 hover:bg-zinc-100/50 border border-zinc-200 rounded-[20px] px-5 py-4 text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-400 focus:ring-[4px] focus:ring-zinc-100 transition-all duration-300 cursor-pointer"
                  >
                    <option value="">Select a category...</option>
                    {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* 4. Tags */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-zinc-500 block">Tags</label>
                  {tagsLoading && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags?.map(tag => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer outline-none ${
                          isSelected 
                            ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10' 
                            : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60'
                        }`}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ======================================= */}
              {/* PUBLISHING ACTIONS                        */}
              {/* ======================================= */}
              <div className="pt-6 mt-6 border-t border-zinc-100">
                <div className="flex flex-col gap-3">
                  
                  <button 
                    onClick={handleSubmit(onSubmit("PUBLISHED"))}
                    disabled={isPending || user?.role === 'WRITER'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-full text-[14px] font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none shadow-lg shadow-zinc-900/15"
                    title={user?.role === 'WRITER' ? "Writers can only save drafts." : ""}
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {user?.role === 'WRITER' ? 'Publishing Restricted' : 'Publish Post'}
                  </button>
                  
                  <button 
                    onClick={handleSubmit(onSubmit("DRAFT"))}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 rounded-full text-[14px] font-medium active:scale-[0.98] transition-all disabled:opacity-50 outline-none"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-zinc-500" />}
                    Save as Draft
                  </button>

                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}