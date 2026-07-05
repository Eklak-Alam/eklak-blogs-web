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
          Verify Email
        </h1>
        <p className="text-[15px] text-zinc-500 font-medium leading-relaxed">
          We sent a 6-digit code to <span className="text-black font-semibold">{urlEmail || 'your email'}</span>.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* HIDDEN EMAIL INPUT */}
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
            placeholder="••••••"
            autoComplete="one-time-code"
            className={`w-full bg-white border py-4 px-5 text-[24px] tracking-[0.5em] text-center text-black placeholder-zinc-300 placeholder:tracking-normal outline-none transition-colors rounded-2xl focus:border-black ${
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

        {/* MINIMAL FLAT SUBMIT BUTTON */}
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
                Verifying...
              </>
            ) : (
              "Confirm Code"
            )}
          </button>
        </motion.div>
      </form>

      {/* FOOTER */}
      <motion.div variants={itemVariants} className="mt-6 text-center">
        <p className="text-[14px] text-zinc-500 font-medium">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isPending}
            className="text-black hover:text-zinc-600 transition-colors disabled:opacity-50 outline-none font-medium"
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
    <div className="min-h-[100dvh] w-full bg-[#f2f2f2] flex flex-col justify-center items-center px-6 py-20">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10 p-8">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}