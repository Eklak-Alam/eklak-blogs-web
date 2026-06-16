"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner"; 
import { motion, AnimatePresence } from "framer-motion";

import { useForgotPasswordMutation } from "@/hooks/mutations/useAuthMutations";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { mutate: requestReset, isPending } = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data) => {
    requestReset(data.email, {
      onSuccess: (res) => {
        toast.success(res.message || "If the email exists, an OTP has been sent.");
        const encodedEmail = encodeURIComponent(data.email);
        router.push(`/reset-password?email=${encodedEmail}`);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to process request.");
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-[var(--color-background)] selection:bg-[var(--color-brand-primary)]/30">
      
      {/* Background Grid & Animated Orbs */}
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
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-brand-accent)] rounded-full blur-[140px]"
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
            Reset Password
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-[var(--color-muted)]"
          >
            Enter your email and we'll send you a 6-digit code to securely reset your access.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* EMAIL INPUT */}
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
                  Sending Code...
                </>
              ) : (
                <>
                  Send Reset Code <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
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
    </div>
  );
}