"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { useRegisterMutation } from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import { getRedirectPath } from "@/lib/utils/authRoutes";
import Image from "next/image";

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

// Fluid easing for high-end cinematic feel
const fluidEase = [0.25, 0.1, 0.25, 1];

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
        <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center w-full">
          
          {/* BRAND LOGO - Matching the Login screen exactly */}
          <Image
            src="/logo-new-black.png"
            alt="Eklak Logo"
            width={160}
            height={60}
            priority
            className="w-[60px] md:w-[85px] h-auto object-contain mb-6" 
          />

          <h1 className="text-[26px] font-bold tracking-tight text-black mb-1.5">
            Create Account
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium">
            Enter your details to get started.
          </p>
          
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* NAME INPUT */}
          <motion.div variants={itemVariants}>
            <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Full Name</label>
            <input
              type="text"
              {...register("name")}
              placeholder="John Doe"
              className={`w-full bg-zinc-50 border py-3 px-4 text-[14px] font-medium text-black placeholder-zinc-400 outline-none transition-all rounded-xl ${
                errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-1.5 text-[12px] font-bold text-red-500"
                >
                  {errors.name.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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
                placeholder="Create password"
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

          {/* CONFIRM PASSWORD INPUT */}
          <motion.div variants={itemVariants} className="relative">
            <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm password"
                className={`w-full bg-zinc-50 border py-3 pl-4 pr-12 text-[14px] font-medium text-black placeholder-zinc-400 outline-none transition-all rounded-xl ${
                  errors.confirmPassword ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors outline-none p-1"
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-1.5 text-[12px] font-bold text-red-500"
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
              className="w-full py-3.5 bg-black text-white text-[14px] cursor-pointer font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className=" text-center border-t border-zinc-100 mt-4">
            <p className="text-[13px] text-zinc-500 font-bold mt-4">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-black hover:text-zinc-600 transition-colors outline-none"
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