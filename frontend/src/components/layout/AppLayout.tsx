"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { CustomCursor } from "@/components/ui/CustomCursor";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, checkAuth } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useLayoutStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    if (!loading) {
      const isAuth =
        AUTH_PATHS.includes(pathname) || pathname.startsWith("/reset-password");
      if (!user && !isAuth) {
        router.push("/login");
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Loading CommitteeMS…
          </p>
        </div>
      </div>
    );
  }

  const isAuthPage =
    AUTH_PATHS.includes(pathname) || pathname.startsWith("/reset-password");

  if (!user && isAuthPage) return <>{children}</>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <CustomCursor />
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ paddingLeft: "var(--sidebar-width)" }}
      >
        {/* Hide sidebar padding on mobile */}
        <style>{`
          @media (max-width: 1023px) {
            .flex-1.flex.flex-col.min-w-0 { padding-left: 0 !important; }
          }
        `}</style>

        <TopNavbar />

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 px-6 py-6 overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
