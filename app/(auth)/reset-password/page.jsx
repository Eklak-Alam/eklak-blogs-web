"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner"; 
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

import { useResetPasswordMutation } from "@/hooks/mutations/useAuthMutations";
import Image from "next/image";

// Strict Zod Validation Schema
const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, "Code must be exactly 6 digits").max(6, "Code must be exactly 6 digits"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Fluid easing for high-end cinematic feel
const fluidEase = [0.25, 0.1, 0.25, 1];

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";

  const { mutate: resetPassword, isPending } = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: urlEmail,
      otp: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (urlEmail) setValue("email", urlEmail);
  }, [urlEmail, setValue]);

  const onSubmit = (data) => {
    const { confirmPassword, ...payload } = data;
    resetPassword(payload, {
      onSuccess: (res) => {
        toast.success(res.message || "Security credentials updated. Access granted.");
        router.push("/login");
      },
      onError: (err) => {
        toast.error(err.message || "Invalid transmission code or request failed.");
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[380px] flex flex-col bg-white p-8 md:p-10 rounded-2xl border border-zinc-200/60 shadow-sm"
    >
      {/* Header */}
<motion.div variants={itemVariants} className="mb-8 flex flex-col items-center w-full">
  
  {/* 1. LOGO ALONE AT THE TOP */}
  <Image
    src="/logo-new-black.png"
    alt="Eklak Logo"
    width={60}
    height={60}
    priority
    className="w-[60px] md:w-[85px] h-auto object-contain mb-4" 
  />

  {/* 2. ARROW & HEADING ON THE SAME ROW */}
  <div className="flex items-center gap-7 mb-2 w-full">
    <Link 
      href="/forgot-password" 
      className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-[#f2f2f2] hover:bg-[#e5e5e5] border border-zinc-200/80 text-zinc-500 hover:text-black transition-colors outline-none cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
    </Link>
    <h1 className="text-[26px] font-bold tracking-tight text-black leading-none mt-1">
      Establish New Key
    </h1>
  </div>

  {/* 3. SUBTITLE */}
  <p className="text-[14px] text-zinc-500 font-medium">
    Input your 6-digit recovery code and a secure new password.
  </p>
  
</motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Hidden Email Input */}
        <input type="hidden" {...register("email")} />

        {/* STATIC OTP INPUT */}
        <motion.div variants={itemVariants}>
          <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Reset Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            {...register("otp", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }
            })}
            placeholder="000000"
            autoComplete="one-time-code"
            className={`w-full bg-zinc-50 border py-3 px-4 text-[15px] tracking-widest text-center text-black placeholder-zinc-300 placeholder:tracking-normal outline-none transition-colors rounded-xl ${
              errors.otp ? "border-red-400 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          />
          <AnimatePresence>
            {errors.otp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="px-1 pt-1.5 text-[12px] font-bold text-red-500 text-center"
              >
                {errors.otp.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* STATIC NEW PASSWORD INPUT */}
        <motion.div variants={itemVariants} className="relative">
          <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              placeholder="••••••••"
              className={`w-full bg-zinc-50 border py-3 pl-4 pr-12 text-[14px] font-medium text-black placeholder-zinc-400 outline-none transition-colors rounded-xl ${
                errors.newPassword ? "border-red-400 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors outline-none p-1 cursor-pointer"
              tabIndex="-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <AnimatePresence>
            {errors.newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="px-1 pt-1.5 text-[12px] font-bold text-red-500"
              >
                {errors.newPassword.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* STATIC CONFIRM PASSWORD INPUT */}
        <motion.div variants={itemVariants} className="relative">
          <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={`w-full bg-zinc-50 border py-3 pl-4 pr-12 text-[14px] font-medium text-black placeholder-zinc-400 outline-none transition-colors rounded-xl ${
                errors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors outline-none p-1 cursor-pointer"
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

        {/* SOLID SUBMIT BUTTON */}
        <motion.div variants={itemVariants} className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-black text-white text-[14px] font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying Key...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </motion.div>

      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
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

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10 p-8">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}