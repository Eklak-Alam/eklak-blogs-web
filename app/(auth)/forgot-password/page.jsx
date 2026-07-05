"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner"; 
import { motion, AnimatePresence } from "framer-motion";

import { useForgotPasswordMutation } from "@/hooks/mutations/useAuthMutations";

// Strict Zod Validation Schema
const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
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
        toast.success(res.message || "If registered, a recovery link has been sent.");
        const encodedEmail = encodeURIComponent(data.email);
        router.push(`/reset-password?email=${encodedEmail}`);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to process request.");
      },
    });
  };

  // Snappy, lightweight animations matching Login/Register
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

  return (
    <div className="min-h-[100dvh] w-full bg-[#FFFFFF] flex flex-col justify-center items-center px-6 py-20 selection:bg-black selection:text-[#f2f2f2]">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[360px] flex flex-col"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-black mb-2">
            Reset Password
          </h1>
          <p className="text-[15px] text-zinc-500 font-medium leading-relaxed">
            Enter your email address and we'll send you a link to securely reset your password.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
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

          {/* MINIMAL FLAT BUTTON */}
          <motion.div variants={itemVariants} className="pt-2">
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
                  Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </motion.div>

          {/* FOOTER LINK */}
          <motion.div variants={itemVariants} className="pt-4 text-center">
            <p className="text-[14px] text-zinc-500 font-medium">
              Remembered your password?{" "}
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