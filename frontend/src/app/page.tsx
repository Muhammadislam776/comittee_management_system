"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, CheckSquare, PlusCircle, ArrowUpRight,
  Activity, Clock, RefreshCw, TrendingUp, Target, Zap,
  BarChart2, Bell, FileText,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

interface Stats {
  committees: number;
  meetings: number;
  tasks: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
};

const meetingTrendData = [
  { name: "Jan", Meetings: 2, Completed: 2 },
  { name: "Feb", Meetings: 5, Completed: 4 },
  { name: "Mar", Meetings: 8, Completed: 7 },
  { name: "Apr", Meetings: 6, Completed: 5 },
  { name: "May", Meetings: 12, Completed: 10 },
  { name: "Jun", Meetings: 9, Completed: 8 },
  { name: "Jul", Meetings: 14, Completed: 12 },
];

const taskStatusData = [
  { name: "HR", Completed: 12, Pending: 4 },
  { name: "Finance", Completed: 18, Pending: 6 },
  { name: "Marketing", Completed: 8, Pending: 9 },
  { name: "Executive", Completed: 22, Pending: 3 },
];

const pieData = [
  { name: "Completed", value: 60, color: "#6366f1" },
  { name: "In Progress", value: 25, color: "#8b5cf6" },
  { name: "Pending", value: 15, color: "#ec4899" },
];

const recentActivities = [
  { id: 1, text: "Finance committee meeting minutes approved", time: "10 mins ago", category: "Meeting", dot: "bg-indigo-500", icon: Calendar },
  { id: 2, text: "New task 'Audit Annual Report' assigned to Sarah", time: "1 hour ago", category: "Task", dot: "bg-purple-500", icon: CheckSquare },
  { id: 3, text: "Executive committee created successfully", time: "4 hours ago", category: "Committee", dot: "bg-pink-500", icon: Users },
  { id: 4, text: "Marketing campaign milestone reviewed", time: "1 day ago", category: "Milestone", dot: "bg-amber-500", icon: Target },
  { id: 5, text: "Q3 performance report submitted", time: "2 days ago", category: "Report", dot: "bg-emerald-500", icon: FileText },
];

const quickActions = [
  {
    label: "Create Committee",
    href: "/committees",
    icon: Users,
    gradient: "from-indigo-500 to-purple-600",
    glow: "shadow-indigo-500/30",
    primary: true,
  },
  {
    label: "Schedule Meeting",
    href: "/meetings",
    icon: Calendar,
    gradient: "",
    glow: "",
    primary: false,
  },
  {
    label: "Assign Task",
    href: "/tasks",
    icon: CheckSquare,
    gradient: "",
    glow: "",
    primary: false,
  },
  {
    label: "View Reports",
    href: "/",
    icon: BarChart2,
    gradient: "",
    glow: "",
    primary: false,
  },
];

const categoryColors: Record<string, string> = {
  Meeting: "text-indigo-600 bg-indigo-500/10",
  Task: "text-purple-600 bg-purple-500/10",
  Committee: "text-pink-600 bg-pink-500/10",
  Milestone: "text-amber-600 bg-amber-500/10",
  Report: "text-emerald-600 bg-emerald-500/10",
};

const tooltipStyle = {
  background: "rgba(10, 10, 30, 0.92)",
  border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  fontSize: "12px",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ committees: 0, meetings: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [commRes, meetRes, taskRes] = await Promise.all([
        axios.get("http://localhost:5000/api/committees"),
        axios.get("http://localhost:5000/api/meetings"),
        axios.get("http://localhost:5000/api/tasks/user"),
      ]);
      setStats({
        committees: commRes.data.length,
        meetings: meetRes.data.length,
        tasks: taskRes.data.filter((t: any) => t.status !== "Completed").length,
      });
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = [
    {
      title: "Total Committees",
      value: stats.committees,
      change: "+2 this month",
      trend: "+18%",
      icon: Users,
      iconBg: "from-blue-500 to-indigo-600",
      iconGlow: "shadow-blue-500/40",
      accent: "text-blue-500",
      hoverClass: "stat-card-blue",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Upcoming Meetings",
      value: stats.meetings,
      change: "+4 scheduled",
      trend: "+32%",
      icon: Calendar,
      iconBg: "from-purple-500 to-violet-600",
      iconGlow: "shadow-purple-500/40",
      accent: "text-purple-500",
      hoverClass: "stat-card-purple",
      badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Pending Tasks",
      value: stats.tasks,
      change: "3 done today",
      trend: "-12%",
      icon: CheckSquare,
      iconBg: "from-amber-400 to-orange-500",
      iconGlow: "shadow-amber-500/40",
      accent: "text-amber-500",
      hoverClass: "stat-card-amber",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Completion Rate",
      value: "84%",
      change: "Goal: 90%",
      trend: "+5%",
      icon: Target,
      iconBg: "from-emerald-500 to-teal-600",
      iconGlow: "shadow-emerald-500/40",
      accent: "text-emerald-500",
      hoverClass: "stat-card-green",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Zap size={10} />
              <span>Live Dashboard</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across your committees today.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass border text-sm font-semibold hover:border-indigo-500/40 transition-all shadow-sm disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin text-indigo-500" : "text-muted-foreground"} />
          <span>Sync Data</span>
        </motion.button>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
              className={`glass-card p-5 relative overflow-hidden group cursor-default transition-all duration-300 ${stat.hoverClass}`}
            >
              {/* Decorative orb */}
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-tr ${stat.iconBg} opacity-10 group-hover:opacity-20 blur-xl transition-opacity`} />

              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[12.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <div className="flex items-end space-x-2">
                    <h3 className="text-3xl font-black tracking-tight">
                      {loading ? (
                        <span className="skeleton inline-block h-9 w-14 rounded-lg" />
                      ) : (
                        stat.value
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.badge}`}>
                      <TrendingUp size={9} />
                      <span>{stat.trend}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${stat.iconBg} text-white shadow-lg ${stat.iconGlow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${60 + i * 10}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${stat.iconBg}`}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-bold flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10">
                  <Activity size={15} className="text-blue-500" />
                </span>
                <span>Meeting Activity</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Monthly breakdown of scheduled vs completed</p>
            </div>
            <span className="text-[11px] text-muted-foreground px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/5">
              2025
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={meetingTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Area type="monotone" dataKey="Meetings" stroke="#6366f1" strokeWidth={2.5} fill="url(#gMeetings)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
                <Area type="monotone" dataKey="Completed" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gCompleted)" dot={false} activeDot={{ r: 4, fill: "#8b5cf6" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <div className="mb-5">
            <h3 className="text-[14px] font-bold flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10">
                <Target size={15} className="text-purple-500" />
              </span>
              <span>Task Status</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Overall completion breakdown</p>
          </div>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bar Chart Row */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[14px] font-bold flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10">
                <BarChart2 size={15} className="text-amber-500" />
              </span>
              <span>Task Allocation by Committee</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Completed vs Pending tasks per department</p>
          </div>
          <span className="text-[11px] text-muted-foreground px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/5">
            By Category
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar dataKey="Completed" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-bold flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10">
                <Clock size={15} className="text-indigo-500" />
              </span>
              <span>Recent Activity</span>
            </h3>
            <button className="text-[11px] text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {recentActivities.map((act, i) => {
              const Icon = act.icon;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-black/4 dark:hover:bg-white/4 transition-colors group cursor-default"
                >
                  <div className={`p-2 rounded-xl ${categoryColors[act.category] || "bg-indigo-500/10 text-indigo-600"} flex-shrink-0`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium truncate">{act.text}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 inline-block ${categoryColors[act.category] || "bg-indigo-500/10 text-indigo-600"}`}>
                      {act.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {act.time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 flex flex-col"
        >
          <div className="mb-5">
            <h3 className="text-[14px] font-bold flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-pink-500/10">
                <Zap size={15} className="text-pink-500" />
              </span>
              <span>Quick Actions</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Accelerate your workflow</p>
          </div>
          <div className="space-y-2.5 flex-1">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={action.href}
                    className={
                      action.primary
                        ? `flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white text-[13px] font-semibold shadow-lg ${action.glow} hover:opacity-90 transition-all`
                        : "flex items-center justify-between w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/8 bg-black/3 dark:bg-white/3 hover:bg-indigo-500/5 hover:border-indigo-500/30 text-[13px] font-medium transition-all group"
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={15} className={action.primary ? "text-white/90" : "text-muted-foreground group-hover:text-indigo-500 transition-colors"} />
                      <span>{action.label}</span>
                    </div>
                    <ArrowUpRight size={14} className={action.primary ? "text-white/70" : "text-muted-foreground/50 group-hover:text-indigo-500 transition-colors"} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Mini status widget */}
          <div className="mt-5 pt-4 border-t border-white/20 dark:border-white/5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">System Status</p>
            {[
              { label: "API Server", ok: true },
              { label: "Database", ok: true },
              { label: "Notifications", ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-[11.5px] text-muted-foreground">{label}</span>
                <span className={`flex items-center space-x-1 text-[10px] font-semibold ${ok ? "text-emerald-500" : "text-red-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span>{ok ? "Operational" : "Down"}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
