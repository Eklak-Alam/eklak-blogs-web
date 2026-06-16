"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner"; 
import { motion, AnimatePresence } from "framer-motion";

import { 
  useVerifyEmailMutation, 
  useResendVerificationMutation 
} from "@/hooks/mutations/useAuthMutations";

const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";

  const { mutate: verifyOtp, isPending } = useVerifyEmailMutation();
  const { mutate: resendOtp, isPending: isResending } = useResendVerificationMutation();

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
        toast.success(res.message || "Email verified! You can now log in.");
        router.push("/login"); 
      },
      onError: (err) => {
        toast.error(err.message || "Invalid or expired OTP.");
      },
    });
  };

  const handleResend = () => {
    const currentEmail = getValues("email");
    if (!currentEmail) {
      toast.error("Please provide an email to resend the code.");
      return;
    }
    resendOtp(currentEmail, {
      onSuccess: () => toast.success("A new code has been sent."),
      onError: () => toast.error("Failed to resend code.")
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
      <div className="mb-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-extrabold tracking-tighter text-[var(--color-foreground)] mb-2"
        >
          Check your email
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-[var(--color-muted)]"
        >
          We sent a verification code to<br/>
          <span className="font-bold text-[var(--color-brand-accent)] mt-1 block">
            {urlEmail || 'your email'}
          </span>
        </motion.p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-center">
        
        {/* HIDDEN EMAIL INPUT */}
        <input type="hidden" {...register("email")} />

        {/* OTP INPUT */}
        <div className="relative group">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            {...register("otp", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }
            })}
            placeholder="••••••"
            className={`w-full bg-transparent border-b-2 py-4 text-center text-3xl tracking-[0.5em] sm:tracking-[1em] font-light text-[var(--color-foreground)] outline-none transition-all duration-300 placeholder-[var(--color-brand-light)] ${
              errors.otp 
                ? "border-red-500/50 focus:border-red-500" 
                : "border-[var(--color-border)] focus:border-[var(--color-brand-accent)] focus:-translate-y-1"
            }`}
            autoComplete="one-time-code"
          />
          <AnimatePresence>
            {errors.otp && (
              <motion.p 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-3 text-[11px] text-red-500 font-medium tracking-wide text-left"
              >
                {errors.otp.message}
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
                Verifying...
              </>
            ) : (
              <>
                Verify Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </span>
        </motion.button>
      </form>

      {/* FOOTER */}
      <div className="mt-8 text-center">
        <p className="text-[13px] font-medium text-[var(--color-muted)]">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isPending}
            className="text-[var(--color-foreground)] font-bold hover:text-[var(--color-brand-primary)] transition-colors duration-300 disabled:opacity-50 cursor-pointer"
          >
            {isResending ? "Sending..." : "Click to resend"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
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
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand-primary)] rounded-full blur-[140px]"
        />
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10 bg-[var(--color-background)] p-8 rounded-3xl border border-[var(--color-border)]/40">
          <Loader2 className="animate-spin h-8 w-8 text-[var(--color-brand-primary)] mb-4" />
          <p className="text-sm font-bold text-[var(--color-muted)] tracking-wide">Loading environment...</p>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
      
    </div>
  );
}