"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner"; 
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

import { useForgotPasswordMutation } from "@/hooks/mutations/useAuthMutations";

// Strict Zod Validation Schema
const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

// Fluid easing for high-end cinematic feel
const fluidEase = [0.25, 0.1, 0.25, 1];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { mutate: requestReset, isPending } = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data) => {
    requestReset(data.email, {
      onSuccess: (res) => {
        toast.success(res.message || "If registered, a recovery link has been sent.");
        const encodedEmail = encodeURIComponent(data.email);
        router.push(`/reset-password?email=${encodedEmail}`);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to process request.");
      },
    });
  };

  // Snappy, lightweight animations matching the new auth flow
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
        <motion.div variants={itemVariants} className="mb-8">
          <Link href="/login" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-500 hover:text-black transition-colors mb-6 outline-none">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-[26px] font-bold tracking-tight text-black mb-2">
            Reset Password
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium leading-relaxed">
            Enter your email address and we'll send you a link to securely reset your password.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* STATIC EMAIL INPUT (No Focus Classes) */}
          <motion.div variants={itemVariants}>
            <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="name@example.com"
              className={`w-full bg-zinc-50 border py-3 px-4 text-[14px] font-medium text-black placeholder-zinc-400 outline-none transition-colors rounded-xl ${
                errors.email ? "border-red-400 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
              }`}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-1.5 text-[12px] font-bold text-red-500"
                >
                  {errors.email.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SOLID BUTTON */}
          <motion.div variants={itemVariants} className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 cursor-pointer bg-black text-white text-[14px] font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </motion.div>

          {/* FOOTER LINK */}
          <motion.div variants={itemVariants} className="text-center border-t border-zinc-100 mt-4">
            <p className="text-[13px] text-zinc-500 font-bold mt-4">
              Remembered your password?{" "}
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