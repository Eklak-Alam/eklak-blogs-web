"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner"; 
import { motion, AnimatePresence } from "framer-motion";

import { 
  useVerifyEmailMutation, 
  useResendVerificationMutation 
} from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import { getRedirectPath } from "@/lib/utils/authRoutes";

// Strict validation
const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase } }
};

// Autofill CSS Fix
const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:#F1F2ED] [&:-webkit-autofill]:transition-colors [&:-webkit-autofill]:duration-[5000s]";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";

  const { mutate: verifyOtp, isPending } = useVerifyEmailMutation();
  const { mutate: resendOtp, isPending: isResending } = useResendVerificationMutation();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: urlEmail,
      otp: "",
    },
  });

  useEffect(() => {
    if (urlEmail) {
      setValue("email", urlEmail);
    }
  }, [urlEmail, setValue]);

  const onSubmit = (data) => {
    verifyOtp(data, {
      onSuccess: (res) => {
        toast.success(res.message || "Identity verified. Access granted.");
        // User is already logged in (tokens set during registration).
        // Redirect straight to their dashboard — no extra login needed.
        const redirectPath = user ? getRedirectPath(user.role) : "/dashboard";
        router.push(redirectPath);
      },
      onError: (err) => {
        toast.error(err.message || "Invalid or expired code.");
      },
    });
  };

  const handleResend = () => {
    const currentEmail = getValues("email");
    if (!currentEmail) {
      toast.error("Email reference missing.");
      return;
    }
    resendOtp(currentEmail, {
      onSuccess: () => toast.success("A new transmission code has been dispatched."),
      onError: () => toast.error("Failed to resend code.")
    });
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase, staggerChildren: 0.1 } }
      }}
      /* Form Card: Dark #303A2D, Zero Shadows, 24px Rounding */
      className="w-full max-w-[440px] p-10 md:p-12 z-10 bg-[#303A2D] rounded-[24px] relative overflow-hidden flex flex-col mx-auto"
    >
      
      {/* Card-Level Dense Noise Texture */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.5] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Subtle Accent Glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--color-brand-accent)] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-10 text-center relative z-10">
        <div className="w-12 h-12 rounded-full border border-[#F1F2ED]/20 mx-auto flex items-center justify-center mb-6 text-[#F1F2ED]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
        </div>
        <h1 className="text-3xl font-normal tracking-tight text-[#F1F2ED] mb-3">
          Verification Required
        </h1>
        <p className="text-[14px] font-light text-[#F1F2ED]/60 leading-relaxed max-w-[280px] mx-auto">
          We dispatched a 6-digit security code to <span className="text-[#F1F2ED] font-medium">{urlEmail || 'your email'}</span>.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-center relative z-10">
        
        {/* HIDDEN EMAIL INPUT */}
        <input type="hidden" {...register("email")} />

        {/* OTP INPUT - Single field for flawless pasting and typing */}
        <motion.div variants={fadeUp} className="relative group">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            {...register("otp", {
              onChange: (e) => {
                // Strips out non-numbers instantly
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }
            })}
            placeholder="••••••"
            /* Massive tracking to look like distinct boxes, pure minimal border */
            className={`w-full bg-transparent border-b pb-4 text-center text-4xl tracking-[0.5em] font-light text-[#F1F2ED] outline-none transition-colors duration-700 ease-out placeholder-[#F1F2ED]/20 ${autofillFix} ${
              errors.otp 
                ? "border-red-400/50 focus:border-red-400" 
                : "border-[#F1F2ED]/20 focus:border-[var(--color-brand-accent)]"
            }`}
            autoComplete="one-time-code"
          />
          <AnimatePresence>
            {errors.otp && (
              <motion.p 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-3 text-[12px] text-red-400 font-normal tracking-wide"
              >
                {errors.otp.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* SUBMIT BUTTON */}
        <motion.div variants={fadeUp}>
          <button
            type="submit"
            disabled={isPending}
            className="w-full relative group py-3.5 rounded-[16px] overflow-hidden bg-[#F1F2ED] text-[#303A2D] text-[15px] font-medium tracking-wide disabled:opacity-50 transition-colors duration-700 hover:bg-white cursor-pointer"
          >
            <span className="relative flex items-center justify-center gap-3">
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Confirm Code</span>
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
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isPending}
            className="text-[#F1F2ED] font-normal hover:text-[var(--color-brand-accent)] transition-colors duration-500 disabled:opacity-50 outline-none"
          >
            {isResending ? "Dispatching..." : "Resend transmission"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    // Light Background #F1F2ED
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-[#F1F2ED] selection:bg-[#303A2D]/20 px-6 pt-32 pb-16">
      
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
        <VerifyEmailForm />
      </Suspense>
      
    </div>
  );
}