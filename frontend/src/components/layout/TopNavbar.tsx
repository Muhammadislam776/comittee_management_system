"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  LogOut,
  Bell,
  User,
  Menu,
  CheckCircle2,
  AlertCircle,
  Info,
  Search,
  Settings,
  ChevronDown,
  Star,
  Trash2,
  Download,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

const notifications = [
  {
    id: 1,
    title: "Meeting Scheduled",
    desc: "Finance Committee meeting set for Friday at 3PM.",
    time: "10m ago",
    read: false,
    type: "success",
  },
  {
    id: 2,
    title: "New Task Assigned",
    desc: "Review the Q2 budget allocation report by EOD.",
    time: "1h ago",
    read: false,
    type: "info",
  },
  {
    id: 3,
    title: "Meeting Rescheduled",
    desc: "Board review meeting moved to next Monday.",
    time: "1d ago",
    read: true,
    type: "warning",
  },
  {
    id: 4,
    title: "New Committee Member",
    desc: "Sarah Johnson joined the Executive Committee.",
    time: "2d ago",
    read: true,
    type: "success",
  },
];

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard Overview",
  "/committees": "Committees",
  "/meetings": "Meetings",
  "/tasks": "Tasks",
  "/settings": "Settings",
};

function NotifIcon({ type }: { type: string }) {
  if (type === "success")
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />;
  if (type === "warning")
    return <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
  return <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />;
}

export function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useLayoutStore();
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToastStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("[PWA] beforeinstallprompt event captured");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      addToast("CommitteeMS installed successfully!", "success");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [addToast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install choice: ${outcome}`);
    setDeferredPrompt(null);
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifList, setNotifList] = useState(notifications);

  const unreadCount = notifList.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await fetch(`${apiBase}/auth/logout`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {}
    logout();
    addToast("Logged out successfully!", "info");
    router.push("/login");
  };

  const markAllRead = () =>
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const closeAll = () => {
    setNotifOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const pageTitle = breadcrumbMap[pathname] ?? "Page";

  return (
    <>
      {/* Click-away overlay */}
      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-30" onClick={closeAll} />
      )}

      <header
        className="sticky top-0 z-40 w-full glass border-b h-[62px] flex items-center justify-between px-5 top-navbar-spacing"
      >
        <style>{`
          .top-navbar-spacing {
            padding-left: 1.25rem !important;
          }
          @media (min-width: 1024px) {
            .top-navbar-spacing {
              padding-left: calc(var(--sidebar-width) + 1.25rem) !important;
            }
          }
        `}</style>
        {/* Left */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Page breadcrumb */}
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground font-medium">CommitteeMS</span>
            <ChevronDown
              size={14}
              className="text-muted-foreground/40 -rotate-90"
            />
            <span className="font-semibold text-foreground">{pageTitle}</span>
          </div>
        </div>

        {/* Center – Search */}
        <div className="flex-1 max-w-md mx-6 hidden sm:block">
          <div
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-text",
              searchOpen
                ? "bg-card border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "bg-black/5 dark:bg-white/5 border-transparent hover:border-indigo-500/20"
            )}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={15} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search committees, meetings, tasks…"
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-2">
          {/* PWA Install Button */}
          <AnimatePresence>
            {deferredPrompt && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleInstallClick}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/5 hover:bg-indigo-500 hover:text-white text-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-500/5 text-xs font-semibold mr-1"
                aria-label="Install application"
              >
                <Download size={14} className="animate-bounce" />
                <span className="hidden sm:inline">Install App</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <Sun className="h-[18px] w-[18px] text-amber-400" />
                ) : (
                  <Moon className="h-[18px] w-[18px] text-indigo-500" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <div className="relative z-50">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 flex h-[7px] w-[7px]"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-red-500" />
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-full mt-2 w-[340px] glass-card overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-white/5">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-indigo-500 hover:text-indigo-600 font-semibold transition-colors"
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/10 dark:divide-white/5">
                    {notifList.map((n) => (
                      <motion.div
                        key={n.id}
                        layout
                        onClick={() => markRead(n.id)}
                        className={cn(
                          "flex items-start space-x-3 px-4 py-3 cursor-pointer transition-colors",
                          n.read
                            ? "hover:bg-black/4 dark:hover:bg-white/4"
                            : "bg-indigo-500/5 hover:bg-indigo-500/8"
                        )}
                      >
                        <NotifIcon type={n.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[12.5px] font-semibold leading-tight">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {n.desc}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-white/20 dark:border-white/5 bg-black/2 dark:bg-white/2">
                    <button className="w-full text-center text-[11px] text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
                      View all notifications →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative z-50">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className={cn(
                "flex items-center space-x-2 pl-1 pr-2 py-1 rounded-xl transition-all",
                profileOpen
                  ? "bg-black/5 dark:bg-white/5"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
              aria-label="Profile menu"
            >
              <div className="h-[30px] w-[30px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/30">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[12px] font-semibold leading-tight truncate max-w-[100px]">
                  {user?.name?.split(" ")[0] || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize leading-tight">
                  {user?.role || "Member"}
                </p>
              </div>
              <ChevronDown
                size={13}
                className={cn(
                  "text-muted-foreground transition-transform duration-200",
                  profileOpen && "rotate-180"
                )}
              />
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-full mt-2 w-[220px] glass-card overflow-hidden z-50"
                >
                  {/* User info */}
                  <div className="px-4 py-3.5 border-b border-white/20 dark:border-white/5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center space-x-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 capitalize">
                        {user?.role || "Member"}
                      </span>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Online</span>
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5 space-y-0.5 px-1.5">
                    {[
                      { icon: User, label: "My Profile", sub: "View your profile" },
                      { icon: Settings, label: "Settings", sub: "Preferences & config" },
                      { icon: Star, label: "Saved Items", sub: "Bookmarked content" },
                    ].map(({ icon: Icon, label, sub }) => (
                      <button
                        key={label}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
                          <Icon size={13} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium leading-tight">
                            {label}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            {sub}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="px-1.5 pb-1.5 border-t border-white/20 dark:border-white/5 mt-1 pt-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
                    >
                      <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={13} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-red-500 leading-tight">
                          Sign out
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          End current session
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}
