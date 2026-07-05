"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useRegisterMutation } from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import { getRedirectPath } from "@/lib/utils/authRoutes";

// 1. Strict Zod Validation Schema
const registerSchema = z.object({
  name: z.string().trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  email: z.string().trim()
    .email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[\W_]/, "Must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-Redirect Logic
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      router.push(getRedirectPath(user.role));
    }
  }, [isInitialized, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    setError, 
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...payload } = data;
    registerUser(payload, {
      onSuccess: () => {
        toast.success("Account created. Please verify your email.");
        const encodedEmail = encodeURIComponent(data.email);
        router.push(`/verify-email?email=${encodedEmail}`);
      },
      onError: (error) => {
        const message = error.response?.data?.message || error.message || "Registration failed. Please try again.";
        toast.error(message);
        setError("root.serverError", {
          type: "manual",
          message: message,
        });
      },
    });
  };

  // Snappy, lightweight animations (optimized for performance)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  if (!isInitialized) return null; 

  return (
    <div className="min-h-[100dvh] w-full bg-[#FFFFFF] flex flex-col justify-center items-center px-6 pt-32 py-24 selection:bg-black selection:text-[#f2f2f2]">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[360px] flex flex-col"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-black mb-2">
            Create Account
          </h1>
          <p className="text-[15px] text-zinc-500 font-medium">
            Enter your details to get started.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* FLAT NAME INPUT */}
          <motion.div variants={itemVariants}>
            <input
              type="text"
              {...register("name")}
              placeholder="Full Name"
              className={`w-full bg-white border py-3.5 px-5 text-[15px] text-black placeholder-zinc-400 outline-none transition-colors rounded-2xl focus:border-black ${
                errors.name ? "border-red-400" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-2 text-[13px] font-medium text-red-500"
                >
                  {errors.name.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FLAT EMAIL INPUT */}
          <motion.div variants={itemVariants}>
            <input
              type="email"
              {...register("email")}
              placeholder="Email address"
              className={`w-full bg-white border py-3.5 px-5 text-[15px] text-black placeholder-zinc-400 outline-none transition-colors rounded-2xl focus:border-black ${
                errors.email ? "border-red-400" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-2 text-[13px] font-medium text-red-500"
                >
                  {errors.email.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FLAT PASSWORD INPUT */}
          <motion.div variants={itemVariants} className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Create password"
              className={`w-full bg-white border py-3.5 pl-5 pr-12 text-[15px] text-black placeholder-zinc-400 outline-none transition-colors rounded-2xl focus:border-black ${
                errors.password ? "border-red-400" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[18px] text-zinc-400 hover:text-black transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
            <AnimatePresence>
              {errors.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-2 text-[13px] font-medium text-red-500"
                >
                  {errors.password.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FLAT CONFIRM PASSWORD INPUT */}
          <motion.div variants={itemVariants} className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm password"
              className={`w-full bg-white border py-3.5 pl-5 pr-12 text-[15px] text-black placeholder-zinc-400 outline-none transition-colors rounded-2xl focus:border-black ${
                errors.confirmPassword ? "border-red-400" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[18px] text-zinc-400 hover:text-black transition-colors"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-2 text-[13px] font-medium text-red-500"
                >
                  {errors.confirmPassword.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SERVER ERROR */}
          <AnimatePresence>
            {errors.root?.serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 py-3 px-4 bg-red-50 text-red-600 text-[13px] font-medium rounded-2xl flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {errors.root.serverError.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MINIMAL FLAT SUBMIT BUTTON */}
          <motion.div variants={itemVariants} className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-black text-[#f2f2f2] text-[15px] font-semibold rounded-2xl disabled:opacity-50 transition-colors duration-200 hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#f2f2f2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-3 text-center">
            <p className="text-[14px] text-zinc-500 font-medium">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-black hover:text-zinc-600 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

        </form>
      </motion.div>
    </div>
  );
}