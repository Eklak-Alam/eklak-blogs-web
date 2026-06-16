"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { KeyRound, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; 
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useResetPasswordMutation } from "@/hooks/mutations/useAuthMutations";

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, "OTP must be exactly 6 characters").max(6, "OTP must be exactly 6 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";

  const { mutate: resetPassword, isPending } = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);

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
        toast.success(res.message || "Password reset successfully!");
        router.push("/login");
      },
      onError: (err) => {
        toast.error(err.message || "Invalid OTP or request failed.");
      },
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[420px] px-8 py-10 z-10 bg-[var(--color-background)]/60 backdrop-blur-xl border border-[var(--color-border)]/40 rounded-3xl shadow-2xl shadow-[var(--color-brand-dark)]/5 mx-auto"
    >
      
      {/* Header */}
      <div className="mb-10 text-left">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-extrabold tracking-tighter text-[var(--color-foreground)] mb-2"
        >
          Create new password
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-[var(--color-muted)]"
        >
          Your new password must be different from previous used passwords to keep your workspace secure.
        </motion.p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Hidden Email Input */}
        <input type="hidden" {...register("email")} />

        {/* OTP INPUT */}
        <div className="group">
          <div className="relative flex items-center">
            <KeyRound className="absolute left-0 h-4 w-4 text-[var(--color-brand-light)] transition-colors group-focus-within:text-[var(--color-brand-accent)]" />
            <input
              type="text"
              maxLength={6}
              {...register("otp")}
              placeholder="6-Digit Reset Code"
              className={`w-full bg-transparent border-b pl-8 pr-4 py-3 text-sm text-[var(--color-foreground)] tracking-[0.2em] placeholder:tracking-normal placeholder-[var(--color-brand-light)] outline-none transition-all duration-300 ${
                errors.otp 
                  ? "border-red-500/50 focus:border-red-500" 
                  : "border-[var(--color-border)] focus:border-[var(--color-brand-accent)]"
              }`}
            />
          </div>
          <AnimatePresence>
            {errors.otp && (
              <motion.p 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-1.5 text-[11px] text-red-500 font-medium tracking-wide"
              >
                {errors.otp.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* NEW PASSWORD INPUT */}
        <div className="group">
          <div className="relative flex items-center">
            <Lock className="absolute left-0 h-4 w-4 text-[var(--color-brand-light)] transition-colors group-focus-within:text-[var(--color-brand-accent)]" />
            <input
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              placeholder="New Password"
              className={`w-full bg-transparent border-b pl-8 pr-10 py-3 text-sm text-[var(--color-foreground)] placeholder-[var(--color-brand-light)] outline-none transition-all duration-300 ${
                errors.newPassword 
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
          <AnimatePresence>
            {errors.newPassword && (
              <motion.p 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-1.5 text-[11px] text-red-500 font-medium tracking-wide"
              >
                {errors.newPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* CONFIRM PASSWORD INPUT */}
        <div className="group">
          <div className="relative flex items-center">
            <Lock className="absolute left-0 h-4 w-4 text-[var(--color-brand-light)] transition-colors group-focus-within:text-[var(--color-brand-accent)]" />
            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm New Password"
              className={`w-full bg-transparent border-b pl-8 pr-10 py-3 text-sm text-[var(--color-foreground)] placeholder-[var(--color-brand-light)] outline-none transition-all duration-300 ${
                errors.confirmPassword 
                  ? "border-red-500/50 focus:border-red-500" 
                  : "border-[var(--color-border)] focus:border-[var(--color-brand-accent)]"
              }`}
            />
          </div>
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-1.5 text-[11px] text-red-500 font-medium tracking-wide"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

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
                Updating Password...
              </>
            ) : (
              <>
                Set New Password <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </span>
        </motion.button>
      </form>

      {/* FOOTER */}
      <div className="mt-8 text-center">
        <p className="text-xs font-medium text-[var(--color-muted)]">
          Remembered your password?{" "}
          <Link href="/login" className="text-[var(--color-foreground)] font-bold hover:text-[var(--color-brand-primary)] transition-colors duration-300">
            Back to Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-[var(--color-background)] selection:bg-[var(--color-brand-primary)]/30">
      
      {/* Structural Background Grid & Orbs */}
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-brand-accent)] rounded-full blur-[140px]"
        />
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10 bg-[var(--color-background)] p-8 rounded-3xl border border-[var(--color-border)]/40">
          <Loader2 className="animate-spin h-8 w-8 text-[var(--color-brand-primary)] mb-4" />
          <p className="text-sm font-bold text-[var(--color-muted)] tracking-wide">Securing connection...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
      
    </div>
  );
}