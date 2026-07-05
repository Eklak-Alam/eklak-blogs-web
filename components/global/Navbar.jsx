"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  // ==========================================
  // HIDE NAVBAR ON SPECIFIC ROUTES
  // ==========================================
  // Add any base paths here where you DO NOT want the navbar to show.
  const hiddenRoutes = [
    "/login",
    "/register",
    "/verify",
    "/dashboard",
    "/admin",
    "/writer",
    "/editor",
    "/author",
    "forgot-password",
    "reset-password",
    "verify-email",
  ];

  // Check if the current pathname starts with any of the hidden routes
  // We use .startsWith() so it also hides on sub-pages (e.g., /dashboard/settings)
  const shouldHideNavbar = hiddenRoutes.some((route) => pathname.startsWith(route));

  // ==========================================
  // SMART SCROLL: Hide down, Show up
  // ==========================================
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    
    // Don't hide if the mobile menu is open
    if (isOpen) return;

    if (latest > previous && latest > 80) {
      setIsHidden(true); // Scrolling down
    } else {
      setIsHidden(false); // Scrolling up
    }
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Expanded Navigation Links
  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Projects", href: "/projects" },
    { name: "Blogs", href: "/blogs" },
  ];

  // If we are on a hidden route, don't render the Navbar at all
  if (shouldHideNavbar) return null;

  return (
    <>
      {/* ======================================= */}
      {/* FULL WIDTH DESKTOP HEADER               */}
      {/* ======================================= */}
      <motion.header 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="w-full px-6 md:px-12 h-[80px] flex items-center justify-between max-w-[1600px] mx-auto">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50" onClick={() => setIsOpen(false)}>
            <span className="text-[22px] font-extrabold text-black tracking-tight hover:opacity-70 transition-opacity duration-300">
              Eklak.
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 relative h-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="relative flex items-center h-full text-[14px] font-medium transition-colors duration-300 group"
                >
                  <span className={`relative z-10 ${isActive ? "text-black" : "text-gray-500 group-hover:text-black"}`}>
                    {link.name}
                  </span>
                  {/* Premium animated underline for active link */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link 
              href="/login" 
              className="text-[14px] font-medium text-gray-500 hover:text-black transition-colors duration-300"
            >
              Login
            </Link>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/contact" 
                className="px-6 py-2.5 bg-black text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 hover:shadow-md transition-all duration-300"
              >
                Contact us
              </Link>
            </motion.div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="lg:hidden z-[60] text-black p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {isOpen ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
            </motion.div>
          </button>

        </div>
      </motion.header>

      {/* ======================================= */}
      {/* MOBILE FULL-SCREEN MENU                 */}
      {/* ======================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-white/95 pt-[100px] px-6 pb-8 flex flex-col lg:hidden overflow-y-auto"
          >
            <nav className="flex flex-col gap-1 mt-4">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link 
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-[28px] font-semibold tracking-tight block py-4 border-b border-gray-100 transition-colors ${
                        isActive ? "text-black" : "text-gray-400 hover:text-black"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Mobile Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-auto pt-12 flex flex-col gap-3"
            >
              <Link 
                href="/contact" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-black text-white text-center text-[16px] font-medium rounded-xl active:scale-[0.98] transition-all shadow-md"
              >
                Contact us
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-gray-50 border border-gray-200 text-black text-center text-[16px] font-medium rounded-2xl active:scale-[0.98] transition-all"
              >
                Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}