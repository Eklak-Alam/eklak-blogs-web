"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useLoginMutation } from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import { getRedirectPath } from "@/lib/utils/authRoutes";

// 1. ZOD SCHEMA
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

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

  // Fluid Animation Configuration
  const fluidEase = [0.16, 1, 0.3, 1];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: fluidEase } },
  };

  // Loading State
  if (isInitialized && isAuthenticated) {
    return (
      <div className="h-[100dvh] w-full flex justify-center items-center bg-white">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isInitialized) return null;

  return (
    // MAIN WRAPPER: 
    // h-[100dvh] ensures it perfectly fits the screen height (especially on mobile).
    // pt-20 ensures it clears your custom fixed navbar at the top.
    <div className="h-[100dvh] w-full bg-white flex flex-col justify-center items-center relative overflow-hidden px-6 pt-20 pb-6 selection:bg-zinc-200">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-zinc-50 rounded-full blur-[100px] pointer-events-none opacity-60 z-0"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[380px] relative z-10 flex flex-col"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 mb-2">
            Welcome
          </h1>
          <p className="text-sm text-zinc-500 font-light">
            Sign in to your account to continue
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* SOFT ROUNDED EMAIL INPUT */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                placeholder="Email address"
                className={`w-full bg-zinc-50/50 hover:bg-zinc-50 border py-4 pl-5 pr-4 text-[15px] text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-300 rounded-[20px] focus:bg-white focus:ring-[4px] ${
                  errors.email 
                    ? "border-red-200 focus:border-red-400 focus:ring-red-100" 
                    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100"
                }`}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-2 pt-2 text-[12px] font-medium text-red-500"
                >
                  {errors.email.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SOFT ROUNDED PASSWORD INPUT */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
                className={`w-full bg-zinc-50/50 hover:bg-zinc-50 border py-4 pl-5 pr-14 text-[15px] text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-300 rounded-[20px] focus:bg-white focus:ring-[4px] ${
                  errors.password 
                    ? "border-red-200 focus:border-red-400 focus:ring-red-100" 
                    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100"
                }`}
              />
              
              {/* Soft Eye Icon Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors bg-white rounded-full shadow-sm border border-zinc-100"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            
            <AnimatePresence>
              {errors.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-2 pt-2 text-[12px] font-medium text-red-500"
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
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="overflow-hidden"
              >
                <div className="mt-2 py-3 px-4 bg-red-50 text-red-500 text-sm font-medium rounded-[16px] border border-red-100 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {errors.root.serverError.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="pt-6">
            {/* PILL-SHAPED BUTTON: Soft edges, elegant state changes */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-zinc-900 text-white text-[15px] font-medium rounded-full shadow-lg shadow-zinc-900/15 disabled:opacity-50 transition-all duration-300 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4 flex justify-between items-center px-2">
            <Link 
              href="/forgot-password" 
              className="text-[13px] font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              Forgot password?
            </Link>
            <Link 
              href="/register" 
              className="text-[13px] font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
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
      <div className="h-[100dvh] flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}