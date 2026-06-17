"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner"; 
import { motion, AnimatePresence } from "framer-motion";

import { useForgotPasswordMutation } from "@/hooks/mutations/useAuthMutations";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Advanced Tailwind class to prevent browser autofill background color changes
const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:#F1F2ED] [&:-webkit-autofill]:transition-colors [&:-webkit-autofill]:duration-[5000s]";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { mutate: requestReset, isPending } = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data) => {
    requestReset(data.email, {
      onSuccess: (res) => {
        toast.success(res.message || "If registered, a recovery transmission has been sent.");
        const encodedEmail = encodeURIComponent(data.email);
        router.push(`/reset-password?email=${encodedEmail}`);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to process request.");
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

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: cinematicEase, staggerChildren: 0.1 } }
        }}
        /* Form Card: #303A2D Background, Zero Shadows, 24px Rounding */
        className="w-full max-w-[440px] p-10 md:p-12 z-10 bg-[#303A2D] rounded-[24px] relative overflow-hidden flex flex-col"
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
            System Recovery
          </p>
          <h1 className="text-3xl font-normal tracking-tight text-[#F1F2ED] mb-2">
            Reset Password
          </h1>
          <p className="text-[14px] font-light text-[#F1F2ED]/60 leading-relaxed">
            Provide your designated email to request a secure recovery transmission.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          
          {/* EMAIL INPUT */}
          <motion.div variants={fadeUp} className="group flex flex-col">
            <div className={`relative flex items-center border-b transition-colors duration-700 ease-out ${errors.email ? "border-red-400/50" : "border-[#F1F2ED]/20 group-focus-within:border-[var(--color-brand-accent)]"}`}>
              {/* Ultra-thin Email SVG */}
              <svg className="absolute left-1 h-4 w-4 text-[#F1F2ED]/40 transition-colors duration-700 group-focus-within:text-[var(--color-brand-accent)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              
              <input
                type="email"
                {...register("email")}
                placeholder="Email Address"
                className={`w-full bg-transparent pl-9 pr-4 py-3 text-[15px] font-light text-[#F1F2ED] placeholder-[#F1F2ED]/30 outline-none ${autofillFix}`}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-[11px] text-red-400 font-medium tracking-wide px-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SUBMIT BUTTON */}
          <motion.div variants={fadeUp} className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              /* Contrasting Button: Light #F1F2ED bg with Dark #303A2D text. Elegant hover state */
              className="w-full relative group py-3.5 rounded-[16px] overflow-hidden bg-[#F1F2ED] text-[#303A2D] text-[15px] font-medium tracking-wide disabled:opacity-50 transition-colors duration-700 hover:bg-white cursor-pointer"
            >
              <span className="relative flex items-center justify-center gap-3">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Request Transmission</span>
                    <svg className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </form>

        {/* FOOTER TEXT */}
        <motion.div variants={fadeUp} className="mt-10 text-center relative z-10 border-t border-[#F1F2ED]/10 pt-6">
          <p className="text-[12px] font-light text-[#F1F2ED]/50 tracking-wide">
            Remembered your credentials?{" "}
            <Link href="/login" className="text-[#F1F2ED] font-normal hover:text-[var(--color-brand-accent)] transition-colors duration-500">
              Initiate session
            </Link>
          </p>
        </motion.div>
        
      </motion.div>
    </div>
  );
}