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
  Bold, Italic, Heading2, Heading3, Quote, List, ListOrdered, Camera, X 
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

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
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
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[60vh] text-[var(--color-foreground)] leading-relaxed prose-headings:font-normal prose-p:font-light prose-strong:font-medium',
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full flex flex-col relative group">
      {/* 
        Sleek, Naked Formatting Toolbar (NO STICKY BEHAVIOR)
        Naturally flows with the document structure.
      */}
      <div className="flex items-center gap-1.5 py-3 border-y border-[var(--color-border)]/30 mb-8 opacity-50 group-focus-within:opacity-100 hover:opacity-100 transition-opacity duration-700">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-none transition-colors outline-none ${editor.isActive('bold') ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}><Bold className="w-4 h-4" strokeWidth={1.5} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-none transition-colors outline-none ${editor.isActive('italic') ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}><Italic className="w-4 h-4" strokeWidth={1.5} /></button>
        <div className="w-px h-4 bg-[var(--color-border)]/50 mx-2" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-none transition-colors outline-none ${editor.isActive('heading', { level: 2 }) ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}><Heading2 className="w-4 h-4" strokeWidth={1.5} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-none transition-colors outline-none ${editor.isActive('heading', { level: 3 }) ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}><Heading3 className="w-4 h-4" strokeWidth={1.5} /></button>
        <div className="w-px h-4 bg-[var(--color-border)]/50 mx-2" />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-none transition-colors outline-none ${editor.isActive('blockquote') ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}><Quote className="w-4 h-4" strokeWidth={1.5} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-none transition-colors outline-none ${editor.isActive('bulletList') ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}><List className="w-4 h-4" strokeWidth={1.5} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-none transition-colors outline-none ${editor.isActive('orderedList') ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}><ListOrdered className="w-4 h-4" strokeWidth={1.5} /></button>
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
        toast.error("Access denied. Unauthorized entity.");
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
        toast.error("Permission denied. You cannot modify this record.");
        router.push("/writer/dashboard");
      }
    }
  }, [existingPost, reset, user, router]);

  // Image Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const onSubmit = (status) => (data) => {
    const payload = { ...data, status: status, coverImage: coverImageBase64, tags: selectedTags };

    if (existingPost) {
      updatePost({ id: existingPost.id, payload }, {
        onSuccess: () => {
          toast.success(`Record updated successfully.`);
          router.push('/writer/dashboard');
        }
      });
    } else {
      createPost(payload, {
        onSuccess: () => {
          toast.success(`Record ${status === "PUBLISHED" ? "published" : "saved"} successfully.`);
          router.push('/writer/dashboard');
        }
      });
    }
  };

  const categories = catResponse?.data?.categories || catResponse?.categories || catResponse?.data || [];
  const tags = tagResponse?.data?.tags || tagResponse?.tags || tagResponse?.data || [];

  if (!isInitialized || (editSlug && postLoading)) {
    return <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} /></div>;
  }

  return (
    // pt-32 ensures this entire layout sits cleanly under your custom global navbar
    <div className="min-h-screen bg-[var(--color-background)] relative selection:bg-[var(--color-brand-primary)]/30 pt-32 pb-24">
      
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

      {/* ======================================= */}
      {/* MAIN WORKSPACE GRID                       */}
      {/* ======================================= */}
      <div className="relative z-10 max-w-[1300px] mx-auto px-6 py-4 md:py-8">
        
        {/* Top Minimal Info Bar (Natural Flow, Not Sticky) */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-6 mb-16"
        >
          <Link href="/writer/dashboard" className="group flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors duration-500 outline-none">
            <ArrowLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-500" strokeWidth={1.5} />
            Return to Hub
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
            [{existingPost ? "Edit Module" : "Initialization Module"}]
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* ======================================= */}
          {/* LEFT: THE WRITING CANVAS                  */}
          {/* ======================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: cinematicEase }}
            className="lg:col-span-8 flex flex-col"
          >
            {/* Title Input: Architectural Separator */}
            <div className="mb-4 pb-8 border-b border-[var(--color-border)]/20">
              <input 
                type="text" 
                placeholder="Architectural Title."
                {...register("title")}
                className="w-full text-4xl md:text-5xl lg:text-[4rem] font-normal bg-transparent border-none outline-none text-[var(--color-foreground)] placeholder-[var(--color-muted)]/30 tracking-tight leading-[1.05]"
              />
              <AnimatePresence>
                {errors.title && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-[11px] mt-4 font-medium uppercase tracking-widest">{errors.title.message}</motion.p>
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
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-[11px] mt-4 font-medium uppercase tracking-widest">{errors.content.message}</motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ======================================= */}
          {/* RIGHT: THE META SETTINGS PANEL            */}
          {/* ======================================= */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease: cinematicEase, delay: 0.2 }}
            className="lg:col-span-4"
          >
            {/* Natural flow, NOT STICKY */}
            <div className="space-y-12 pb-12">
              
              <div className="border-b border-[var(--color-border)]/40 pb-4 mb-8">
                <h3 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] flex items-center justify-between">
                  Parameters
                  <span className="w-1.5 h-1.5 rounded-none bg-[var(--color-brand-accent)] animate-pulse"></span>
                </h3>
              </div>

              {/* 1. Cover Image Upload */}
              <div>
                <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4 block">Visual Asset</label>
                <div 
                  {...getRootProps()} 
                  className={`relative border rounded-none text-center cursor-pointer transition-colors duration-700 overflow-hidden group ${isDragActive ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5' : 'border-[var(--color-border)]/50 hover:border-[var(--color-foreground)]/30 bg-transparent'} ${coverImageBase64 ? 'border-transparent p-0 aspect-[4/3]' : 'p-10'}`}
                >
                  <input {...getInputProps()} />
                  {coverImageBase64 ? (
                    <div className="w-full h-full relative">
                      <img src={coverImageBase64} alt="Preview" className="w-full h-full object-cover filter grayscale-[20%]" />
                      <div className="absolute inset-0 bg-[var(--color-background)]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                        <span className="text-[10px] font-medium text-[var(--color-foreground)] uppercase tracking-widest flex items-center gap-2"><Camera className="w-3.5 h-3.5" strokeWidth={1.5} /> Modify Asset</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverImageBase64(null); }}
                          className="text-[10px] font-medium text-red-400 uppercase tracking-widest hover:underline flex items-center gap-1.5 outline-none"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} /> Purge
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[var(--color-muted)]">
                      <ImagePlus className="w-6 h-6 mb-4 opacity-50" strokeWidth={1.5} />
                      <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-foreground)] mb-2">Drop Asset Here</p>
                      <p className="text-[9px] font-mono tracking-widest uppercase opacity-50">PNG, JPG, WEBP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Excerpt */}
              <div>
                <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] mb-4 block">Summary Directive</label>
                <textarea 
                  {...register("excerpt")} rows="4"
                  className="w-full bg-transparent border border-[var(--color-border)]/50 rounded-none px-4 py-4 text-[13px] font-light text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-accent)] transition-colors duration-700 resize-none placeholder-[var(--color-muted)]/50"
                  placeholder="Define a brief summary for the index..."
                />
                <AnimatePresence>
                  {errors.excerpt && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] mt-2 font-medium uppercase tracking-widest">{errors.excerpt.message}</motion.p>}
                </AnimatePresence>
              </div>

              {/* 3. Category */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] block">Primary Module</label>
                  {catsLoading && <Loader2 className="w-3 h-3 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} />}
                </div>
                <div className="relative">
                  <select 
                    {...register("categoryId")}
                    className="w-full appearance-none bg-transparent border border-[var(--color-border)]/50 rounded-none px-4 py-3.5 text-[13px] font-light text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand-accent)] transition-colors duration-700 cursor-pointer"
                  >
                    <option value="" className="text-[var(--color-background)]">Select module assignment...</option>
                    {categories?.map(cat => <option key={cat.id} value={cat.id} className="text-[var(--color-background)]">{cat.name}</option>)}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-muted)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              {/* 4. Tags */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.2em] block">Index Tags</label>
                  {tagsLoading && <Loader2 className="w-3 h-3 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags?.map(tag => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-none text-[10px] font-medium uppercase tracking-[0.1em] border transition-colors duration-500 cursor-pointer outline-none ${
                          isSelected 
                            ? 'bg-[var(--color-foreground)] border-[var(--color-foreground)] text-[var(--color-background)]' 
                            : 'bg-transparent border-[var(--color-border)]/50 text-[var(--color-muted)] hover:border-[var(--color-foreground)]/40 hover:text-[var(--color-foreground)]'
                        }`}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ======================================= */}
              {/* ACTION / PUBLISHING MODULE (Rounded)      */}
              {/* ======================================= */}
              <div className="pt-12 mt-12 border-t border-[var(--color-border)]/40">
                <h3 className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-foreground)] mb-6">
                  Execution Protocol
                </h3>
                <div className="flex flex-col gap-4">
                  
                  <button 
                    onClick={handleSubmit(onSubmit("PUBLISHED"))}
                    disabled={isPending || user?.role === 'WRITER'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-foreground)] text-[var(--color-background)] rounded-full text-[12px] font-medium uppercase tracking-[0.15em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 outline-none"
                    title={user?.role === 'WRITER' ? "Authorization restricted. Save as draft." : ""}
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Send className="w-4 h-4" strokeWidth={1.5} />}
                    {user?.role === 'WRITER' ? 'Restricted' : 'Publish Protocol'}
                  </button>
                  
                  <button 
                    onClick={handleSubmit(onSubmit("DRAFT"))}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[var(--color-foreground)] border border-[var(--color-border)]/50 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] hover:border-[var(--color-foreground)] active:scale-[0.98] transition-all disabled:opacity-30 outline-none"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Save className="w-4 h-4 opacity-50" strokeWidth={1.5} />}
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

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted)]" strokeWidth={1.5} /></div>}>
      <EditorFormContent />
    </Suspense>
  );
}