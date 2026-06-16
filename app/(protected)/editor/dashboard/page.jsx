"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { 
  Loader2, ImagePlus, ArrowLeft, Send, Save, 
  Bold, Italic, Heading2, Heading3, Quote, List, ListOrdered, Camera 
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
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] text-[var(--color-foreground)] leading-relaxed',
      },
    },
  });

  // Keep editor content in sync if the initial content loads asynchronously
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full flex flex-col gap-4 relative">
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] rounded-2xl shadow-sm transition-all sticky top-24 z-40 w-fit">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2.5 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'}`}><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2.5 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'}`}><Italic className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-[var(--color-border)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2.5 rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'}`}><Heading2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2.5 rounded-xl transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'}`}><Heading3 className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-[var(--color-border)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2.5 rounded-xl transition-all ${editor.isActive('blockquote') ? 'bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'}`}><Quote className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2.5 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'}`}><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2.5 rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'}`}><ListOrdered className="w-4 h-4" /></button>
      </div>
      <div className="p-6 md:p-12 bg-transparent transition-colors">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// ==========================================
// 3. EDITOR FORM CONTENT
// ==========================================
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

  // Fetch Existing Post
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
        toast.error("Writers workspace is restricted.");
        router.push("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  // Pre-fill form if editing
  useEffect(() => {
    if (existingPost) {
      reset({
        title: existingPost.title || "",
        content: existingPost.content || "",
        excerpt: existingPost.excerpt || "",
        categoryId: existingPost.category?.id || existingPost.categoryId || ""
      });
      setCoverImageBase64(existingPost.coverImage || null);
      if (existingPost.tags) {
        setSelectedTags(existingPost.tags.map(t => t.id));
      }
      
      // Ownership Guard
      if (existingPost.authorId !== user?.id && user?.role !== 'ADMIN' && user?.role !== 'AUTHOR') {
        toast.error("You do not have permission to edit this post.");
        router.push("/writer/dashboard");
      }
    }
  }, [existingPost, reset, user, router]);

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }, maxFiles: 1,
  });

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const onSubmit = (status) => (data) => {
    const payload = {
      ...data,
      status: status,
      coverImage: coverImageBase64,
      tags: selectedTags 
    };

    if (existingPost) {
      updatePost({ id: existingPost.id, payload }, {
        onSuccess: () => {
          toast.success(`Post updated successfully!`);
          router.push('/writer/dashboard');
        }
      });
    } else {
      createPost(payload, {
        onSuccess: () => {
          toast.success(`Post ${status === "PUBLISHED" ? "published" : "saved"} successfully!`);
          router.push('/writer/dashboard');
        }
      });
    }
  };

  const categories = catResponse?.data?.categories || catResponse?.categories || catResponse?.data || [];
  const tags = tagResponse?.data?.tags || tagResponse?.tags || tagResponse?.data || [];

  if (!isInitialized || (editSlug && postLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-primary)]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30">
      
      {/* Minimal Background Stylings */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[30vh]">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 20%, transparent 80%)",
          }}
        />
      </div>

      {/* Editor Top Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-xl border-b border-[var(--color-border)]/50 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/writer/dashboard" className="p-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-border)] rounded-full transition-colors text-[var(--color-foreground)] shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="hidden md:inline text-xs font-extrabold tracking-widest text-[var(--color-muted)] uppercase">
            {existingPost ? "Edit Mode" : "Draft Mode"}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSubmit(onSubmit("DRAFT"))}
            disabled={isPending}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-[var(--color-foreground)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-all flex items-center gap-2 shadow-sm"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[var(--color-brand-primary)]" />}
            Save Draft
          </button>
          
          <button 
            onClick={handleSubmit(onSubmit("PUBLISHED"))}
            disabled={isPending || user?.role === 'WRITER'}
            className="px-8 py-2.5 rounded-full text-sm font-bold text-[var(--color-background)] bg-[var(--color-foreground)] hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-[var(--color-foreground)]/20 flex items-center gap-2 disabled:opacity-50"
            title={user?.role === 'WRITER' ? "Writers cannot publish directly. Save as draft for Admin approval." : ""}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-background)]" /> : <Send className="w-4 h-4" />}
            {user?.role === 'WRITER' ? 'Publish Blocked' : 'Publish'}
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT: THE WRITING CANVAS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-12"
          >
            
            {/* Title Input */}
            <div>
              <input 
                type="text" 
                placeholder="Story Title..."
                {...register("title")}
                className="w-full text-5xl md:text-6xl font-extrabold bg-transparent border-none outline-none text-[var(--color-foreground)] placeholder-[var(--color-border)] tracking-tight transition-all"
              />
              {errors.title && <p className="text-red-500 text-sm mt-3 font-medium bg-red-500/10 inline-block px-3 py-1 rounded-md">{errors.title.message}</p>}
            </div>

            {/* TipTap Rich Text Editor */}
            <div className="min-h-[500px]">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <TipTapEditor content={field.value} onChange={field.onChange} />
                )}
              />
              {errors.content && <p className="text-red-500 text-sm mt-3 font-medium bg-red-500/10 inline-block px-3 py-1 rounded-md">{errors.content.message}</p>}
            </div>
          </motion.div>

          {/* RIGHT: SETTINGS PANEL */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-xl border border-[var(--color-border)]/50 shadow-2xl lg:sticky lg:top-32 space-y-8">
              <h3 className="text-xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
                Post Meta <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] animate-pulse"></span>
              </h3>

              {/* 1. Cover Image Upload (R2 Integration) */}
              <div>
                <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-3 block">Cover Image</label>
                <div 
                  {...getRootProps()} 
                  className={`relative border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 overflow-hidden group ${isDragActive ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/50 bg-[var(--color-background)]'} ${coverImageBase64 ? 'border-transparent p-0 aspect-video' : 'p-8'}`}
                >
                  <input {...getInputProps()} />
                  {coverImageBase64 ? (
                    <div className="w-full h-full relative">
                      <img src={coverImageBase64} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold text-sm bg-white/20 px-4 py-2 rounded-full flex items-center gap-2"><Camera className="w-4 h-4" /> Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[var(--color-muted)] transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-3">
                        <ImagePlus className="w-5 h-5 text-[var(--color-foreground)]" />
                      </div>
                      <p className="text-sm font-bold text-[var(--color-foreground)] mb-1">Click to upload cover</p>
                      <p className="text-xs font-medium">SVG, PNG, JPG or WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Excerpt */}
              <div>
                <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-3 block">Excerpt / Summary</label>
                <textarea 
                  {...register("excerpt")} rows="4"
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-primary)] transition-all resize-none placeholder-[var(--color-muted)]"
                  placeholder="Write a brief, catchy summary for the public feed..."
                />
                {errors.excerpt && <p className="text-red-500 text-xs mt-2 font-medium">{errors.excerpt.message}</p>}
              </div>

              {/* 3. Category Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest block">Category</label>
                  {catsLoading && <Loader2 className="w-3 h-3 animate-spin text-[var(--color-brand-accent)]" />}
                </div>
                <select 
                  {...register("categoryId")}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm font-bold text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-primary)] transition-all cursor-pointer"
                >
                  <option value="">Select a category...</option>
                  {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              {/* 4. Tags Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest block">Tags</label>
                  {tagsLoading && <Loader2 className="w-3 h-3 animate-spin text-[var(--color-brand-accent)]" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags?.map(tag => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          isSelected ? 'bg-[var(--color-foreground)] border-[var(--color-foreground)] text-[var(--color-background)] shadow-md' : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]'
                        }`}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-primary)]" /></div>}>
      <EditorFormContent />
    </Suspense>
  );
}