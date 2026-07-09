"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner"; 
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { 
  useVerifyEmailMutation, 
  useResendVerificationMutation 
} from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import { getRedirectPath } from "@/lib/utils/authRoutes";
import Image from "next/image";

// Strict validation
const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

// Fluid easing for high-end cinematic feel
const fluidEase = [0.25, 0.1, 0.25, 1];

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
      onSuccess: () => toast.success("A new code has been sent."),
      onError: () => toast.error("Failed to resend code.")
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
        
        {/* BRAND LOGO */}
        <Image
          src="/logo-new-black.png"
          alt="Eklak Logo"
          width={60}
          height={60}
          priority
          className="w-[60px] md:w-[85px] h-auto object-contain mb-4" 
        />

        <h1 className="text-[26px] font-bold tracking-tight text-black mb-1.5">
          Verify Email
        </h1>
        <p className="text-[14px] text-zinc-500 font-medium leading-relaxed">
          We sent a 6-digit code to <span className="text-black font-bold">{urlEmail || 'your email'}</span>.
        </p>
        
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* HIDDEN EMAIL INPUT */}
        <input type="hidden" {...register("email")} />

        {/* STATIC OTP INPUT */}
        <motion.div variants={itemVariants}>
          <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Verification Code</label>
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
            className={`w-full bg-[#f2f2f2] border py-3 px-4 text-[15px] tracking-[0.2em] text-center text-black placeholder-zinc-400 placeholder:tracking-normal outline-none transition-colors rounded-lg ${
              errors.otp ? "border-red-400 bg-red-50/30" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          />
          <AnimatePresence>
            {errors.otp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-1 pt-2 text-[12px] font-bold text-red-500 text-center"
              >
                {errors.otp.message}
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
                Verifying...
              </>
            ) : (
              "Confirm Code"
            )}
          </button>
        </motion.div>
      </form>

      {/* FOOTER */}
      <motion.div variants={itemVariants} className="mt-2 pt-4 text-center border-t border-zinc-100">
        <p className="text-[13px] text-zinc-500 font-bold mt-2">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isPending}
            className="text-black hover:text-zinc-600 transition-colors disabled:opacity-50 outline-none cursor-pointer"
          >
            {isResending ? "Sending..." : "Resend"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col justify-center items-center px-6 py-20 font-sans text-zinc-900">
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: fluidEase }}
        className="absolute top-8 left-8 md:top-12 md:left-12"
      >
        <Link href="/" className="outline-none cursor-pointer">
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
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}