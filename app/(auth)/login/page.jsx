"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useLoginMutation } from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import { getRedirectPath } from "@/lib/utils/authRoutes";

// 1. EXACT ZOD SCHEMA
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { mutate: loginUser, isPending } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  // Auto-Redirect Logic
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [isInitialized, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    loginUser(data, {
      onSuccess: (response) => {
        toast.success("Authentication successful. Welcome back.");
        
        const responseData = response?.data || response;
        const userRole = responseData?.user?.role || "USER";
        
        const redirectPath = getRedirectPath(userRole);
        router.push(redirectPath);
      },
      onError: (error) => {
        const message = error.response?.data?.message || error.message || "Invalid credentials.";
        toast.error(message);
        setError("root.serverError", {
          type: "manual", 
          message: message,
        });
      },
    });
  };

  // Cinematic easing curve
  const cinematicEase = [0.16, 1, 0.3, 1];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
  };

  // Prevent flash while redirecting.
  if (isInitialized && isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#F1F2ED]">
        <svg className="w-6 h-6 animate-spin text-[#303A2D] opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!isInitialized) return null;

  return (
    // Main Container: #F1F2ED Background, pt-32 to clear the custom Navbar
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-[#F1F2ED] selection:bg-[#303A2D]/20 px-6 pt-32 pb-16">
      
    

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase, staggerChildren: 0.1 } }
        }}
        /* Form Card: #303A2D Background, Zero Shadows, 24px Rounding */
        className="w-full max-w-[440px] p-10 md:p-12 z-10 bg-[#303A2D] rounded-[24px] relative overflow-hidden flex flex-col"
      >
        
        {/* 2. Card-Level Dense Noise Texture */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.5] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Subtle Accent Glow inside Card */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--color-brand-accent)] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-12 text-left relative z-10">
          <h1 className="text-3xl font-normal tracking-tight text-[#F1F2ED] mb-3">
            System Access.
          </h1>
          <p className="text-[15px] font-light text-[#F1F2ED]/60 leading-relaxed">
            Authenticate identity to enter the secure workspace.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          
          {/* EMAIL */}
          <motion.div variants={fadeUp} className="group flex flex-col">
            <div className={`relative flex items-center border-b transition-colors duration-700 ease-out ${errors.email ? "border-red-400/50" : "border-[#F1F2ED]/20 group-focus-within:border-[var(--color-brand-accent)]"}`}>
              {/* Ultra-thin Email SVG */}
              <svg className="absolute left-1 h-4 w-4 text-[#F1F2ED]/40 transition-colors duration-700 group-focus-within:text-[var(--color-brand-accent)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              
              <input
                type="email"
                {...register("email")}
                placeholder="Email Address"
                className="w-full bg-transparent pl-9 pr-4 py-3 text-[15px] font-light text-[#F1F2ED] placeholder-[#F1F2ED]/30 outline-none"
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-[11px] text-red-400 font-medium tracking-wide px-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* PASSWORD */}
          <motion.div variants={fadeUp} className="group flex flex-col">
            <div className={`relative flex items-center border-b transition-colors duration-700 ease-out ${errors.password ? "border-red-400/50" : "border-[#F1F2ED]/20 group-focus-within:border-[var(--color-brand-accent)]"}`}>
              {/* Ultra-thin Lock SVG */}
              <svg className="absolute left-1 h-4 w-4 text-[#F1F2ED]/40 transition-colors duration-700 group-focus-within:text-[var(--color-brand-accent)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
                className="w-full bg-transparent pl-9 pr-10 py-3 text-[15px] font-light text-[#F1F2ED] placeholder-[#F1F2ED]/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 p-2 text-[#F1F2ED]/40 hover:text-[var(--color-brand-accent)] transition-colors duration-500 outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            
            {/* Error & Forgot Password */}
            <div className="flex justify-between items-start mt-2 px-1">
              <div className="flex-1">
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-red-400 font-medium tracking-wide"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-[11px] font-normal text-[#F1F2ED]/50 hover:text-[var(--color-brand-accent)] transition-colors duration-500 ml-2 whitespace-nowrap"
              >
                Forgot password?
              </Link>
            </div>
          </motion.div>

          {/* SERVER ERROR */}
          <AnimatePresence>
            {errors.root?.serverError && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-400/20 rounded-[12px] mt-4"
              >
                <svg className="w-4 h-4 text-red-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p className="text-[12px] text-red-400 font-normal">
                  {errors.root.serverError.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT BUTTON */}
          <motion.div variants={fadeUp} className="pt-8">
            <button
              type="submit"
              disabled={isPending}
              /* Contrasting Button: Light #F1F2ED bg with Dark #303A2D text. Elegant hover state */
              className="w-full relative group py-3.5 rounded-[16px] overflow-hidden bg-[#F1F2ED] text-[#303A2D] text-[15px] font-medium tracking-wide disabled:opacity-50 transition-colors duration-700 hover:bg-white cursor-pointer"
            >
              <span className="relative flex items-center justify-center gap-3">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </form>

        {/* FOOTER TEXT */}
        <motion.div variants={fadeUp} className="mt-10 text-center relative z-10 border-t border-[#F1F2ED]/10 pt-6">
          <p className="text-[12px] font-light text-[#F1F2ED]/50 tracking-wide">
            Unregistered entity?{" "}
            <Link href="/register" className="text-[#F1F2ED] font-normal hover:text-[var(--color-brand-accent)] transition-colors duration-500">
              Request access
            </Link>
          </p>
        </motion.div>
        
      </motion.div>
    </div>
  );
}