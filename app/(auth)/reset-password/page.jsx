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

// Advanced Tailwind class to prevent browser autofill background color changes
const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:#F1F2ED] [&:-webkit-autofill]:transition-colors [&:-webkit-autofill]:duration-[5000s]";

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

  // Cinematic easing curve
  const cinematicEase = [0.16, 1, 0.3, 1];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase, staggerChildren: 0.1 } }
      }}
      /* Form Card: #303A2D Background, Zero Shadows, 24px Rounding */
      className="w-full max-w-[440px] p-10 md:p-12 z-10 bg-[#303A2D] rounded-[24px] relative overflow-hidden flex flex-col mx-auto"
    >
      
      {/* Card-Level Dense Noise Texture */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.5] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Subtle Accent Glow inside Card */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--color-brand-accent)] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-10 text-left relative z-10">
        <p className="text-[var(--color-brand-dark)] font-medium uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-3">
          <span className="w-6 h-[1px] bg-[var(--color-brand-dark)]"></span>
          System Restoration
        </p>
        <h1 className="text-3xl font-normal tracking-tight text-[#F1F2ED] mb-2">
          Establish New Key
        </h1>
        <p className="text-[14px] font-light text-[#F1F2ED]/60 leading-relaxed">
          Input your 6-digit recovery transmission and a secure new password.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
        
        {/* Hidden Email Input */}
        <input type="hidden" {...register("email")} />

        {/* OTP INPUT */}
        <motion.div variants={fadeUp} className="group flex flex-col">
          <div className={`relative flex items-center border-b transition-colors duration-700 ease-out ${errors.otp ? "border-red-400/50" : "border-[#F1F2ED]/20 group-focus-within:border-[var(--color-brand-accent)]"}`}>
            {/* Ultra-thin Key SVG */}
            <svg className="absolute left-1 h-4 w-4 text-[#F1F2ED]/40 transition-colors duration-700 group-focus-within:text-[var(--color-brand-accent)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>
            
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
              className={`w-full bg-transparent pl-9 pr-4 py-3 text-[15px] tracking-[0.2em] font-mono font-light text-[#F1F2ED] placeholder:font-sans placeholder:tracking-normal placeholder-[#F1F2ED]/30 outline-none ${autofillFix}`}
              autoComplete="one-time-code"
            />
          </div>
          <AnimatePresence>
            {errors.otp && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-[11px] text-red-400 font-medium tracking-wide px-1"
              >
                {errors.otp.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* NEW PASSWORD INPUT */}
        <motion.div variants={fadeUp} className="group flex flex-col">
          <div className={`relative flex items-center border-b transition-colors duration-700 ease-out ${errors.newPassword ? "border-red-400/50" : "border-[#F1F2ED]/20 group-focus-within:border-[var(--color-brand-accent)]"}`}>
            <svg className="absolute left-1 h-4 w-4 text-[#F1F2ED]/40 transition-colors duration-700 group-focus-within:text-[var(--color-brand-accent)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            
            <input
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              placeholder="New Secure Password"
              className={`w-full bg-transparent pl-9 pr-10 py-3 text-[15px] font-light text-[#F1F2ED] placeholder-[#F1F2ED]/30 outline-none ${autofillFix}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 p-2 text-[#F1F2ED]/40 hover:text-[var(--color-brand-accent)] transition-colors duration-500 outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          <AnimatePresence>
            {errors.newPassword && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-[11px] text-red-400 font-medium tracking-wide px-1"
              >
                {errors.newPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CONFIRM PASSWORD INPUT */}
        <motion.div variants={fadeUp} className="group flex flex-col">
          <div className={`relative flex items-center border-b transition-colors duration-700 ease-out ${errors.confirmPassword ? "border-red-400/50" : "border-[#F1F2ED]/20 group-focus-within:border-[var(--color-brand-accent)]"}`}>
            <svg className="absolute left-1 h-4 w-4 text-[#F1F2ED]/40 transition-colors duration-700 group-focus-within:text-[var(--color-brand-accent)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm New Password"
              className={`w-full bg-transparent pl-9 pr-10 py-3 text-[15px] font-light text-[#F1F2ED] placeholder-[#F1F2ED]/30 outline-none ${autofillFix}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-1 p-2 text-[#F1F2ED]/40 hover:text-[var(--color-brand-accent)] transition-colors duration-500 outline-none"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-[11px] text-red-400 font-medium tracking-wide px-1"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* SUBMIT BUTTON */}
        <motion.div variants={fadeUp} className="pt-8">
          <button
            type="submit"
            disabled={isPending}
            className="w-full relative group py-3.5 rounded-[16px] overflow-hidden bg-[#F1F2ED] text-[#303A2D] text-[15px] font-medium tracking-wide disabled:opacity-50 transition-colors duration-700 hover:bg-white cursor-pointer"
          >
            <span className="relative flex items-center justify-center gap-3">
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Updating System...</span>
                </>
              ) : (
                <>
                  <span>Deploy New Key</span>
                  <svg className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </>
              )}
            </span>
          </button>
        </motion.div>
      </form>

      {/* FOOTER */}
      <motion.div variants={fadeUp} className="mt-8 text-center relative z-10 border-t border-[#F1F2ED]/10 pt-6">
        <p className="text-[12px] font-light text-[#F1F2ED]/50 tracking-wide">
          Remembered your credentials?{" "}
          <Link href="/login" className="text-[#F1F2ED] font-normal hover:text-[var(--color-brand-accent)] transition-colors duration-500">
            Initiate session
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    // Main Container: #F1F2ED Background, pt-32 to clear the custom Navbar
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-[#F1F2ED] selection:bg-[#303A2D]/20 px-6 pt-32 pb-16">
      
      {/* Page-Level Subtle Noise Texture */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.4] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Abstract Architectural Lines - INFINITELY ROTATING */}
      <motion.svg 
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] text-[#303A2D] opacity-[0.15] pointer-events-none origin-center" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.2"
        style={{ transformOrigin: 'center center' }}
      >
        <circle cx="50" cy="50" r="40" />
        <circle cx="50" cy="50" r="30" />
        <line x1="10" y1="50" x2="90" y2="50" />
        <line x1="50" y1="10" x2="50" y2="90" />
      </motion.svg>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10 p-8">
          <svg className="animate-spin h-6 w-6 text-[#303A2D] mb-4 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
      
    </div>
  );
}