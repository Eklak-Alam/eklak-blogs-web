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
  // SMART SCROLL (Hide on scroll down, show on scroll up)
  // ==========================================
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    
    // Don't hide if the mobile menu is open
    if (isOpen) return;

    // Hide navbar if scrolling down past 80px, show if scrolling up
    if (latest > previous && latest > 80) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Updated Navigation Links
  const navLinks = [
    { name: "Portfolio", href: "/portfolio" },
    { name: "Projects", href: "/projects" },
    { name: "Blogs", href: "/blogs" },
  ];

  return (
    <>
      {/* ======================================= */}
      {/* DESKTOP & MOBILE HEADER                   */}
      {/* ======================================= */}
      <motion.header 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/50" 
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-[80px] flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 z-50" onClick={() => setIsOpen(false)}>
            <span className="text-[22px] font-extrabold text-black tracking-tight hover:opacity-70 transition-opacity duration-300">
              Eklak
            </span>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`relative px-4 py-2 text-[14px] font-medium rounded-full transition-all duration-300 ${
                    isActive 
                      ? "text-black bg-zinc-100/80" 
                      : "text-zinc-500 hover:text-black hover:bg-zinc-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions (Right) - Zero Shadows */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/login" 
                className="px-5 py-2.5 text-[14px] font-medium text-zinc-500 hover:text-black transition-colors duration-300"
              >
                Login
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/contact" 
                className="px-6 py-2.5 bg-black text-white text-[14px] font-medium rounded-full hover:bg-zinc-800 transition-colors duration-300"
              >
                Contact us
              </Link>
            </motion.div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="lg:hidden z-50 text-zinc-900 p-2 -mr-2 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {isOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
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
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-[100px] px-6 pb-8 flex flex-col lg:hidden overflow-y-auto"
          >
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div 
                    key={link.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link 
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-3xl font-medium tracking-tight block py-4 border-b border-zinc-100 transition-colors ${
                        isActive ? "text-black" : "text-zinc-400 hover:text-black"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Mobile Buttons - Zero Shadows */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-auto pt-12 flex flex-col gap-3"
            >
              <Link 
                href="/contact" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-black text-white text-center text-[16px] font-medium rounded-[20px] active:scale-[0.98] transition-all"
              >
                Contact us
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-zinc-100 text-black text-center text-[16px] font-medium rounded-[20px] active:scale-[0.98] transition-all"
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