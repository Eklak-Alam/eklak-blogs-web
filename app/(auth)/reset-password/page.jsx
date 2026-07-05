"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner"; 
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useResetPasswordMutation } from "@/hooks/mutations/useAuthMutations";

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, "Code must be exactly 6 digits").max(6, "Code must be exactly 6 digits"),
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

  // Snappy, lightweight animations optimized for performance
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[360px] flex flex-col"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-black mb-2">
          Establish New Key
        </h1>
        <p className="text-[15px] text-zinc-500 font-medium">
          Input your 6-digit recovery code and a secure new password.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Hidden Email Input */}
        <input type="hidden" {...register("email")} />

        {/* FLAT OTP INPUT */}
        <motion.div variants={itemVariants}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            {...register("otp", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }
            })}
            placeholder="6-Digit Reset Code"
            autoComplete="one-time-code"
            className={`w-full bg-white border py-3.5 px-5 text-[15px] tracking-widest text-center text-black placeholder-zinc-400 placeholder:tracking-normal outline-none transition-colors rounded-2xl focus:border-black ${
              errors.otp ? "border-red-400" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          />
          <AnimatePresence>
            {errors.otp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-1 pt-2 text-[13px] font-medium text-red-500 text-center"
              >
                {errors.otp.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* FLAT NEW PASSWORD INPUT */}
        <motion.div variants={itemVariants} className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("newPassword")}
            placeholder="New Secure Password"
            className={`w-full bg-white border py-3.5 pl-5 pr-12 text-[15px] text-black placeholder-zinc-400 outline-none transition-colors rounded-2xl focus:border-black ${
              errors.newPassword ? "border-red-400" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[14px] text-zinc-400 hover:text-black transition-colors"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
          <AnimatePresence>
            {errors.newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-1 pt-2 text-[13px] font-medium text-red-500"
              >
                {errors.newPassword.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* FLAT CONFIRM PASSWORD INPUT */}
        <motion.div variants={itemVariants} className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="Confirm New Password"
            className={`w-full bg-white border py-3.5 pl-5 pr-12 text-[15px] text-black placeholder-zinc-400 outline-none transition-colors rounded-2xl focus:border-black ${
              errors.confirmPassword ? "border-red-400" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-[14px] text-zinc-400 hover:text-black transition-colors"
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
                Deploying Key...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </motion.div>

        {/* FOOTER LINK */}
        <motion.div variants={itemVariants} className="pt-4 text-center">
          <p className="text-[14px] text-zinc-500 font-medium">
            Remembered your credentials?{" "}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#f2f2f2] flex flex-col justify-center items-center px-6 py-20">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10 p-8">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}