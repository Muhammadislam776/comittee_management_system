"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  X,
  ChevronRight,
  Sparkles,
  Zap,
  Settings,
  HelpCircle,
  Shield,
  BarChart2,
  MessageSquare,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, badge: null },
      { name: "Committees", href: "/committees", icon: Users, badge: null },
      { name: "Meetings", href: "/meetings", icon: Calendar, badge: "3" },
      { name: "Tasks", href: "/tasks", icon: CheckSquare, badge: "5" },
      { name: "Polls", href: "/polls", icon: BarChart2, badge: null },
      { name: "Chat", href: "/chat", icon: MessageSquare, badge: null },
      { name: "Documents", href: "/documents", icon: FileText, badge: null },
      { name: "Analytics", href: "/analytics", icon: TrendingUp, badge: null },
      { name: "AI Assistant", href: "/ai", icon: Sparkles, badge: "PRO" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings, badge: null },
      { name: "Help", href: "/help", icon: HelpCircle, badge: null },
    ],
  },
];

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: "spring", stiffness: 200 },
  }),
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useLayoutStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  let itemIndex = 0;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col sidebar-glass"
        style={{ width: "var(--sidebar-width)" }}>
        <SidebarContent
          pathname={pathname}
          user={user}
          initials={initials}
          setSidebarOpen={setSidebarOpen}
          isDesktop
          itemIndex={itemIndex}
        />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col sidebar-glass"
            style={{ width: "var(--sidebar-width)" }}
          >
            <SidebarContent
              pathname={pathname}
              user={user}
              initials={initials}
              setSidebarOpen={setSidebarOpen}
              isDesktop={false}
              itemIndex={itemIndex}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  pathname,
  user,
  initials,
  setSidebarOpen,
  isDesktop,
  itemIndex,
}: {
  pathname: string;
  user: any;
  initials: string;
  setSidebarOpen: (v: boolean) => void;
  isDesktop: boolean;
  itemIndex: number;
}) {
  let idx = 0;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/20 dark:border-white/5">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold gradient-text leading-tight tracking-tight">
              CommitteeMS
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              Management Suite
            </p>
          </div>
        </Link>
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const currentIdx = idx++;
                return (
                  <motion.div
                    key={item.href}
                    custom={currentIdx}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={item.href}
                      onClick={() => !isDesktop && setSidebarOpen(false)}
                      className={cn(
                        "relative flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group",
                        isActive
                          ? "nav-active-pill text-indigo-600 dark:text-indigo-400"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-bg"
                            className="absolute inset-0 rounded-xl nav-active-pill"
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                          />
                        )}
                        <div
                          className={cn(
                            "relative z-10 p-1.5 rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                              : "text-muted-foreground group-hover:text-foreground group-hover:bg-black/5 dark:group-hover:bg-white/5"
                          )}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="relative z-10">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 relative z-10">
                        {item.badge && (
                          <span
                            className={cn(
                              "flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold",
                              isActive
                                ? "bg-indigo-500 text-white"
                                : "bg-black/8 dark:bg-white/8 text-muted-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight
                            size={12}
                            className="text-indigo-400 opacity-60"
                          />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pro Upgrade Banner */}
      <div className="px-3 mb-3">
        <div className="relative rounded-xl overflow-hidden p-3.5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 dark:border-indigo-500/15">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
              <Zap size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-foreground">Upgrade to Pro</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                Unlock advanced analytics & unlimited committees
              </p>
              <Link href="/upgrade" onClick={() => !isDesktop && setSidebarOpen(false)}
                className="inline-block mt-2 text-[10px] font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity text-center">
                Upgrade Now →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="px-3 pb-4 border-t border-white/20 dark:border-white/5 pt-3">
        <div className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold truncate leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate leading-tight flex items-center space-x-1">
              <Shield size={9} className="text-indigo-400" />
              <span className="capitalize">{user?.role || "Member"}</span>
            </p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}
