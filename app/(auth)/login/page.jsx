"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
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
        toast.success("Welcome back!");
        
        const responseData = response?.data || response;
        const userRole = responseData?.user?.role || "USER";
        
        const redirectPath = getRedirectPath(userRole);
        router.push(redirectPath);
      },
      onError: (error) => {
        setError("root.serverError", {
          type: "manual", 
          message: error.response?.data?.message || error.message || "Invalid email or password.",
        });
      },
    });
  };

  // Prevent flash of form while redirecting.
  if (isInitialized && isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--color-background)] relative overflow-hidden">
        <Loader2 className="w-8 h-8 text-[var(--color-brand-primary)] animate-spin z-10" />
      </div>
    );
  }

  // Also prevent flash while the auth store is initially loading
  if (!isInitialized) return null;

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-[var(--color-background)] selection:bg-[var(--color-brand-primary)]/30">
      
      {/* Background Grid & Gradient Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(circle 600px at center, black, transparent)",
            WebkitMaskImage: "radial-gradient(circle 600px at center, black, transparent)",
          }}
        />
        {/* Animated Background Blur */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand-primary)] rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] px-8 py-10 z-10 bg-[var(--color-background)]/60 backdrop-blur-xl border border-[var(--color-border)]/40 rounded-3xl shadow-2xl shadow-[var(--color-brand-dark)]/5"
      >
        
        {/* Header */}
        <div className="mb-10 text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold tracking-tighter text-[var(--color-foreground)] mb-2"
          >
            Welcome back
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-[var(--color-muted)]"
          >
            Log in to the <span className="text-[var(--color-brand-accent)] font-bold">Gaprio</span> workspace to continue.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* EMAIL */}
          <div className="group">
            <div className="relative flex items-center">
              <Mail className="absolute left-0 h-4 w-4 text-[var(--color-brand-light)] transition-colors group-focus-within:text-[var(--color-brand-accent)]" />
              <input
                type="email"
                {...register("email")}
                placeholder="Email Address"
                className={`w-full bg-transparent border-b pl-8 pr-4 py-3 text-sm text-[var(--color-foreground)] placeholder-[var(--color-brand-light)] outline-none transition-all duration-300 ${
                  errors.email 
                    ? "border-red-500/50 focus:border-red-500" 
                    : "border-[var(--color-border)] focus:border-[var(--color-brand-accent)]"
                }`}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-1.5 text-[11px] text-red-500 font-medium tracking-wide"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* PASSWORD */}
          <div className="group">
            <div className="relative flex items-center">
              <Lock className="absolute left-0 h-4 w-4 text-[var(--color-brand-light)] transition-colors group-focus-within:text-[var(--color-brand-accent)]" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
                className={`w-full bg-transparent border-b pl-8 pr-10 py-3 text-sm text-[var(--color-foreground)] placeholder-[var(--color-brand-light)] outline-none transition-all duration-300 ${
                  errors.password 
                    ? "border-red-500/50 focus:border-red-500" 
                    : "border-[var(--color-border)] focus:border-[var(--color-brand-accent)]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 p-1 text-[var(--color-brand-light)] hover:text-[var(--color-foreground)] transition-colors outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Error & Forgot Password */}
            <div className="flex justify-between items-start mt-2">
              <div className="flex-1">
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="text-[11px] text-red-500 font-medium tracking-wide"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-[11px] font-bold text-[var(--color-muted)] hover:text-[var(--color-brand-accent)] transition-colors duration-300 ml-2 whitespace-nowrap"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* SERVER ERROR */}
          <AnimatePresence>
            {errors.root?.serverError && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2 backdrop-blur-sm"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-500 font-medium">
                  {errors.root.serverError.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isPending}
            className="w-full relative group mt-8 py-4 rounded-xl overflow-hidden bg-[var(--color-foreground)] text-[var(--color-background)] text-sm font-bold tracking-wide disabled:opacity-50 transition-all duration-300 shadow-xl shadow-[var(--color-foreground)]/10 cursor-pointer"
          >
            <span className="relative flex items-center justify-center gap-2">
              {isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
          </motion.button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center">
          <p className="text-xs font-medium text-[var(--color-muted)]">
            Don't have an account?{" "}
            <Link href="/register" className="text-[var(--color-foreground)] font-bold hover:text-[var(--color-brand-primary)] transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
        
      </motion.div>
    </div>
  );
}