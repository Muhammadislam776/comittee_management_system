"use client";

import Image from "next/image";
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
  User,
  Bell
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { motion, AnimatePresence } from "framer-motion";

const getNavItems = (role: string) => {
  if (role === "admin") {
    return [
      {
        label: "Dashboard",
        items: [
          { name: "Dashboard", href: "/", icon: LayoutDashboard, badge: null },
        ]
      },
      {
        label: "Management",
        items: [
          { name: "Users", href: "/users", icon: Users, badge: null },
          { name: "Committees", href: "/committees", icon: Shield, badge: null },
          { name: "Meetings", href: "/meetings", icon: Calendar, badge: null },
          { name: "Tasks", href: "/tasks", icon: CheckSquare, badge: null },
          { name: "Voting Polls", href: "/polls", icon: TrendingUp, badge: null },
          { name: "Group Chat", href: "/chat", icon: MessageSquare, badge: null },
          { name: "Reports", href: "/reports", icon: BarChart2, badge: null },
        ]
      },
      {
        label: "System",
        items: [
          { name: "Finance", href: "/finance", icon: TrendingUp, badge: null },
          { name: "Documents", href: "/documents", icon: FileText, badge: null },
          { name: "Announcements", href: "/announcements", icon: Bell, badge: null },
          { name: "System Settings", href: "/settings", icon: Settings, badge: null },
          { name: "Audit Logs", href: "/audit-logs", icon: FileText, badge: null },
        ]
      }
    ];
  } else if (role === "committee_head") {
    return [
      {
        label: "Dashboard",
        items: [
          { name: "Dashboard", href: "/", icon: LayoutDashboard, badge: null },
        ]
      },
      {
        label: "My Committee",
        items: [
          { name: "My Committee", href: "/committees", icon: Shield, badge: null },
          { name: "Meeting Schedule", href: "/meetings", icon: Calendar, badge: null },
          { name: "Tasks & Board", href: "/tasks", icon: CheckSquare, badge: null },
          { name: "Voting Sessions", href: "/polls", icon: TrendingUp, badge: null },
          { name: "Committee Chat", href: "/chat", icon: MessageSquare, badge: null },
          { name: "Committee Reports", href: "/reports", icon: BarChart2, badge: null },
          { name: "Documents Hub", href: "/documents", icon: FileText, badge: null },
          { name: "Announcements", href: "/announcements", icon: Bell, badge: null },
        ]
      },
      {
        label: "Account",
        items: [
          { name: "My Profile", href: "/profile", icon: User, badge: null },
          { name: "Settings", href: "/settings", icon: Settings, badge: null },
        ]
      }
    ];
  } else {
    // Member / Staff
    return [
      {
        label: "Dashboard",
        items: [
          { name: "Dashboard", href: "/", icon: LayoutDashboard, badge: null },
          { name: "My Tasks", href: "/tasks", icon: CheckSquare, badge: null },
          { name: "Meeting Schedule", href: "/meetings", icon: Calendar, badge: null },
        ]
      },
      {
        label: "My Workspace",
        items: [
          { name: "Voting Polls", href: "/polls", icon: TrendingUp, badge: null },
          { name: "Team Chat", href: "/chat", icon: MessageSquare, badge: null },
          { name: "Announcements", href: "/announcements", icon: Bell, badge: null },
          { name: "Documents", href: "/documents", icon: FileText, badge: null },
        ]
      },
      {
        label: "Account",
        items: [
          { name: "My Profile", href: "/profile", icon: User, badge: null },
          { name: "Settings", href: "/settings", icon: Settings, badge: null },
        ]
      }
    ];
  }
};


const getThemeStyles = (role: string) => {
  if (role === "admin") {
    return {
      sidebarBg: "bg-[#2D1B69]",
      textNormal: "text-purple-200 hover:text-white hover:bg-white/10",
      textActive: "text-white bg-[#432C9A]",
      iconNormal: "text-purple-300",
      iconActive: "text-white",
      logoBg: "bg-purple-600",
      label: "text-purple-300/70",
      border: "border-purple-800/50"
    };
  } else if (role === "committee_head") {
    return {
      sidebarBg: "bg-[#1E3A5F]",
      textNormal: "text-blue-200 hover:text-white hover:bg-white/10",
      textActive: "text-white bg-[#2A5288]",
      iconNormal: "text-blue-300",
      iconActive: "text-white",
      logoBg: "bg-blue-500",
      label: "text-blue-300/70",
      border: "border-blue-800/50"
    };
  } else {
    return {
      sidebarBg: "bg-[#1B4D3E]",
      textNormal: "text-green-200 hover:text-white hover:bg-white/10",
      textActive: "text-white bg-[#266B56]",
      iconNormal: "text-green-300",
      iconActive: "text-white",
      logoBg: "bg-green-600",
      label: "text-green-300/70",
      border: "border-green-800/50"
    };
  }
};

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: "spring" as const, stiffness: 200 },
  }),
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useLayoutStore();

  const role = user?.role || "staff";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  let itemIndex = 0;

  const themeStyles = getThemeStyles(role);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col shadow-xl", themeStyles.sidebarBg)}
        style={{ width: "var(--sidebar-width)" }}>
        <SidebarContent
          pathname={pathname}
          user={user}
          role={role}
          initials={initials}
          setSidebarOpen={setSidebarOpen}
          isDesktop
          itemIndex={itemIndex}
          themeStyles={themeStyles}
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
            className={cn("lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl", themeStyles.sidebarBg)}
            style={{ width: "var(--sidebar-width)" }}
          >
            <SidebarContent
              pathname={pathname}
              user={user}
              role={role}
              initials={initials}
              setSidebarOpen={setSidebarOpen}
              isDesktop={false}
              itemIndex={itemIndex}
              themeStyles={themeStyles}
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
  role,
  initials,
  setSidebarOpen,
  isDesktop,
  itemIndex,
  themeStyles
}: {
  pathname: string;
  user: any;
  role: string;
  initials: string;
  setSidebarOpen: (v: boolean) => void;
  isDesktop: boolean;
  itemIndex: number;
  themeStyles: any;
}) {
  let idx = 0;
  const navItems = getNavItems(role);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center justify-between px-5 py-5 border-b", themeStyles.border)}>
        <Link href="/" className="flex items-center space-x-3 group">
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-lg", themeStyles.logoBg)}>
            C
          </div>
          <div>
            <h1 className="text-[14px] font-bold text-white leading-tight tracking-tight">
              Committee
            </h1>
            <p className="text-[11px] text-white/70 font-medium leading-tight">
              Management System
            </p>
          </div>
        </Link>
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.label}>
            <p className={cn("px-3 mb-2 text-[10px] font-bold uppercase tracking-widest", themeStyles.label)}>
              {group.label}
            </p>
            <div className="space-y-1">
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
                        "relative flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 group",
                        isActive ? themeStyles.textActive : themeStyles.textNormal
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={16} className={isActive ? themeStyles.iconActive : themeStyles.iconNormal} />
                        <span className="relative z-10">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 relative z-10">
                        {item.badge && (
                          <span
                            className={cn(
                              "flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-white/10 text-white/70"
                            )}
                          >
                            {item.badge}
                          </span>
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

      {/* User Footer */}
      <div className={cn("px-3 pb-4 border-t pt-3", themeStyles.border)}>
        <div className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="relative flex-shrink-0">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md", themeStyles.logoBg)}>
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-white truncate leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-white/70 truncate leading-tight flex items-center space-x-1">
              <span className="capitalize">{user?.role || "Staff"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

