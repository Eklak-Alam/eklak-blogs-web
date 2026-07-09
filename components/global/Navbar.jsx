"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

// Importing your auth hooks
import { useAuthStore } from "@/store/useAuthStore";
import { useGetMeQuery } from "@/hooks/queries/useUserQueries";
import { useLogoutMutation } from "@/hooks/mutations/useAuthMutations";
import {
  ChevronDown,
  Edit3,
  LayoutDashboard,
  Loader2,
  LogOut,
  PenTool,
  Shield,
  User,
  X,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const { scrollY } = useScroll();
  const pathname = usePathname();

  // 1. Get Auth State
  const { isAuthenticated, isInitialized } = useAuthStore();

  // ==========================================
  // HIDE NAVBAR ON SPECIFIC ROUTES
  // ==========================================
  const hiddenRoutes = [
    "/login",
    "/register",
    "/verify",
    "/dashboard",
    "/admin",
    "/writer",
    "/editor",
    "/author",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const shouldHideNavbar = hiddenRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // ==========================================
  // SMART SCROLL
  // ==========================================
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (isOpen) return;

    if (latest > previous && latest > 80) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

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

  // Updated Navigation Links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Portfolio", href: "https://eklak.site", isExternal: true },
  ];

  // Social Media Links
  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/eklak-alam/",
      icon: FaLinkedin,
    },
    { name: "Twitter", href: "https://x.com/eklak__alam", icon: X },
    { name: "GitHub", href: "https://github.com/Eklak-Alam", icon: FaGithub },
  ];

  if (shouldHideNavbar) return null;

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-50 bg-[#f2f2f2]/80 backdrop-blur-xl border-b border-zinc-200"
      >
        <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between max-w-[1400px] mx-auto">
          <Link
  href="/"
  className="flex items-center z-[60] transition-opacity duration-300 hover:opacity-80"
  onClick={() => setIsOpen(false)}
>
  <Image
    src="/logo-new-black.png" 
    alt="Eklak Logo" 
    // Kept the internal resolution high so it stays crisp
    width={60} 
    height={40} 
    // 👇 FIXED: Much smaller, tighter width. 50px on mobile, 70px on desktop.
    className="object-contain" 
    priority 
  />
</Link>

          <nav className="hidden lg:flex items-center gap-8 relative h-full">
            {navLinks.map((link) => {
              if (link.isExternal) {
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center text-[14px] font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Social Media Icons - Desktop */}
            <div className="flex items-center gap-4 border-l border-zinc-300 pl-6 ml-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-110"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-5 z-50">
            {!isInitialized ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            ) : isAuthenticated ? (
              <DesktopUserMenu setIsOpen={setIsOpen} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-zinc-900 text-[#f2f2f2] text-[13px] font-medium rounded-full hover:bg-zinc-800 transition-all duration-300 active:scale-95"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-zinc-200/50 hover:bg-zinc-300/50 transition-colors focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-zinc-900"
            >
              <motion.line
                x1="3"
                y1="8"
                x2="21"
                y2="8"
                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 4 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.line
                x1="3"
                y1="16"
                x2="21"
                y2="16"
                animate={{
                  rotate: isOpen ? -45 : 0,
                  y: isOpen ? -4 : 0,
                  opacity: isOpen ? 1 : 1,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[#f2f2f2] pt-[100px] px-6 pb-8 flex flex-col lg:hidden overflow-y-auto"
          >
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link, i) => {
                if (link.isExternal) {
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.05 + 0.1,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="text-[32px] font-medium tracking-tight block py-3 border-b border-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        {link.name}
                      </a>
                    </motion.div>
                  );
                }

                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.05 + 0.1,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-[32px] font-medium tracking-tight block py-3 border-b border-zinc-200 transition-colors ${
                        isActive
                          ? "text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-auto pt-8 flex flex-col gap-3"
            >
              {/* Social Media Icons - Mobile */}
              <div className="flex items-center justify-center gap-6 mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-110"
                      aria-label={social.name}
                    >
                      <Icon className="w-6 h-6" />
                    </a>
                  );
                })}
              </div>

              {!isInitialized ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400 mx-auto" />
              ) : isAuthenticated ? (
                <MobileUserMenu setIsOpen={setIsOpen} />
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-zinc-900 text-[#f2f2f2] text-center text-[16px] font-medium rounded-xl active:scale-[0.98] transition-all"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-[#f2f2f2] border border-zinc-300 text-zinc-900 text-center text-[16px] font-medium rounded-xl active:scale-[0.98] transition-all"
                  >
                    Login
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ==========================================
// DESKTOP AUTH MENU COMPONENT
// ==========================================
function DesktopUserMenu({ setIsOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const { data: response, isLoading: isUserLoading } = useGetMeQuery();
  const { mutate: logoutUser, isPending: isLoggingOut } = useLogoutMutation();
  const user = response?.user || response?.data?.user;
  const userRole = user?.role?.toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        setIsProfileOpen(false);
        setIsOpen(false);
        router.push("/login");
      },
    });
  };

  if (isUserLoading || !user)
    return <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full border border-zinc-300 hover:border-zinc-400 hover:shadow-sm bg-[#f2f2f2] transition-all duration-300 active:scale-95"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-zinc-500" />
          )}
        </div>
        <span className="text-[13px] font-medium text-zinc-800 max-w-[100px] truncate">
          {user.name?.split(" ")[0] || "User"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-60 bg-[#f2f2f2] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-zinc-200 overflow-hidden flex flex-col py-2"
          >
            <div className="px-4 py-3 border-b border-zinc-200 mb-2">
              <p className="text-[14px] font-medium text-zinc-900 truncate">
                {user.name}
              </p>
              <p className="text-[12px] text-zinc-500 truncate">{user.email}</p>
            </div>

            {userRole === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 transition-colors"
              >
                <Shield className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}

            {userRole === "AUTHOR" && (
              <Link
                href="/author/dashboard"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 transition-colors"
              >
                <PenTool className="w-4 h-4" /> Author Dashboard
              </Link>
            )}

            {userRole === "WRITER" && (
              <Link
                href="/writer/dashboard"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Writer Dashboard
              </Link>
            )}

            <Link
              href="/dashboard"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 transition-colors mt-2 border-t border-zinc-200 pt-3"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// MOBILE AUTH MENU COMPONENT
// ==========================================
function MobileUserMenu({ setIsOpen }) {
  const router = useRouter();

  const { data: response, isLoading: isUserLoading } = useGetMeQuery();
  const { mutate: logoutUser, isPending: isLoggingOut } = useLogoutMutation();
  const user = response?.user || response?.data?.user;
  const userRole = user?.role?.toUpperCase();

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        router.push("/login");
      },
    });
  };

  if (isUserLoading || !user)
    return <Loader2 className="w-5 h-5 animate-spin text-zinc-400 mx-auto" />;

  return (
    <>
      <div className="flex items-center gap-4 mb-4 p-4 rounded-2xl bg-zinc-200/50 border border-zinc-200">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-300 flex items-center justify-center">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-zinc-500" />
          )}
        </div>
        <div>
          <p className="text-[16px] font-medium text-zinc-900">{user.name}</p>
          <p className="text-[13px] text-zinc-600">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        {userRole === "ADMIN" && (
          <Link
            href="/admin/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-zinc-200/70 text-zinc-900 hover:bg-zinc-300/70 flex justify-center items-center gap-2 text-[14px] font-medium rounded-xl transition-colors"
          >
            <Shield className="w-4 h-4" /> Admin
          </Link>
        )}

        {userRole === "AUTHOR" && (
          <Link
            href="/author/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-zinc-200/70 text-zinc-900 hover:bg-zinc-300/70 flex justify-center items-center gap-2 text-[14px] font-medium rounded-xl transition-colors"
          >
            <PenTool className="w-4 h-4" /> Author
          </Link>
        )}

        {userRole === "WRITER" && (
          <Link
            href="/writer/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-zinc-200/70 text-zinc-900 hover:bg-zinc-300/70 flex justify-center items-center gap-2 text-[14px] font-medium rounded-xl transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Writer
          </Link>
        )}

        <Link
          href="/dashboard"
          onClick={() => setIsOpen(false)}
          className={`w-full py-3 flex justify-center items-center gap-2 text-[14px] font-medium rounded-xl transition-colors ${
            userRole === "USER" || !userRole
              ? "col-span-2 bg-zinc-900 text-[#f2f2f2] hover:bg-zinc-800"
              : "bg-zinc-900 text-[#f2f2f2] hover:bg-zinc-800"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full py-4 bg-[#f2f2f2] border border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/50 flex justify-center items-center gap-2 text-[15px] font-medium rounded-xl mt-2 active:scale-[0.98] transition-all"
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}{" "}
        Logout
      </button>
    </>
  );
}
