"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { useLoginMutation } from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import { getRedirectPath } from "@/lib/utils/authRoutes";
import Image from "next/image";

// 1. ZOD SCHEMA
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Fluid easing for high-end cinematic feel
const fluidEase = [0.25, 0.1, 0.25, 1];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { mutate: loginUser, isPending } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  // Auto-Redirect Logic
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const redirectPath = callbackUrl || getRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [isInitialized, isAuthenticated, user, router, callbackUrl]);

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
        toast.success("Welcome back.");
        const responseData = response?.data || response;
        const userRole = responseData?.user?.role || "USER";
        const redirectPath = callbackUrl || getRedirectPath(userRole);
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

  // Snappy, lightweight animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: fluidEase } },
  };

  // Loading State
  if (isInitialized && isAuthenticated) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-[#fafafa]">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );
  }

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col justify-center items-center px-6 py-20 font-sans text-zinc-900">
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: fluidEase }}
        className="absolute top-8 left-8 md:top-12 md:left-12"
      >
        <Link href="/" className="outline-none">
          <h2 className="text-[24px] font-black tracking-tighter text-black hover:opacity-70 transition-opacity">
            Eklak.
          </h2>
        </Link>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[380px] flex flex-col bg-white p-8 md:p-10 rounded-2xl border border-zinc-200/60 shadow-sm"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center">
          
          {/* BRAND LOGO */}
          <Image
            src="/logo-new-black.png"
            alt="Eklak Logo"
            width={60} // High internal resolution for crispness
            height={60}
            priority // Good to have on auth pages so the logo pops instantly
            className="w-[60px] md:w-[85px] h-auto object-contain mb-4" // Slightly larger for the login context, with nice spacing below
          />

          <h1 className="text-[26px] font-bold tracking-tight text-black mb-1.5">
            Welcome back
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium">
            Enter your credentials to sign in.
          </p>
          
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* EMAIL INPUT */}
          <motion.div variants={itemVariants}>
            <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="name@example.com"
              className={`w-full bg-zinc-50 border py-3 px-4 text-[14px] font-medium text-black placeholder-zinc-400 outline-none transition-all rounded-xl ${
                errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-1.5 text-[12px] font-bold text-red-500"
                >
                  {errors.email.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* PASSWORD INPUT */}
          <motion.div variants={itemVariants} className="relative">
            <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                className={`w-full bg-zinc-50 border py-3 pl-4 pr-12 text-[14px] font-medium text-black placeholder-zinc-400 outline-none transition-all rounded-xl ${
                  errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
                }`}
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors outline-none p-1"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <AnimatePresence>
              {errors.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-1.5 text-[12px] font-bold text-red-500"
                >
                  {errors.password.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SERVER ERROR */}
          <AnimatePresence>
            {errors.root?.serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 py-3 px-4 bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.root.serverError.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="pt-4">
            {/* SOLID BUTTON */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 cursor-pointer bg-black font-bold text-white text-[14px] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4 flex justify-between items-center px-1 border-t border-zinc-100">
            <Link 
              href="/forgot-password" 
              className="text-[13px] font-bold text-zinc-500 hover:text-black transition-colors outline-none"
            >
              Forgot password?
            </Link>
            <Link 
              href="/register" 
              className="text-[13px] font-bold text-zinc-500 hover:text-black transition-colors outline-none"
            >
              Create account
            </Link>
          </motion.div>

        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}