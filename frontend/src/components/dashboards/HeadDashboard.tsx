"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, CheckSquare, Shield, FileText, Bell,
  PlusCircle, ArrowUpRight, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Upload, Megaphone, BarChart2, UserCheck
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { useAuthStore } from "@/store/useAuthStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
};

const taskProgressData = [
  { day: "Mon", Completed: 4, Pending: 2 },
  { day: "Tue", Completed: 7, Pending: 3 },
  { day: "Wed", Completed: 12, Pending: 4 },
  { day: "Thu", Completed: 15, Pending: 2 },
  { day: "Fri", Completed: 18, Pending: 1 },
];

export function HeadDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    membersCount: 14,
    upcomingMeetings: 3,
    openTasks: 5,
    performancePct: 88,
  });
  const [nextMeeting, setNextMeeting] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      axios.get(`${API}/committees`, { headers }),
      axios.get(`${API}/meetings`, { headers }),
      axios.get(`${API}/tasks`, { headers }),
    ]).then(([commRes, meetRes, taskRes]) => {
      let totalMembers = 14;
      let upcomingMeets = 3;
      let pendingTasks = 5;

      if (commRes.status === "fulfilled") {
        const comms = commRes.value.data.data || [];
        totalMembers = comms.reduce((acc: number, c: any) => acc + (c.members?.length || 4), 0);
      }

      if (meetRes.status === "fulfilled") {
        const meets = Array.isArray(meetRes.value.data) ? meetRes.value.data : (meetRes.value.data?.data || []);
        upcomingMeets = meets.filter((m: any) => m.status === "Scheduled" || m.status === "In Progress").length;
        if (meets.length > 0) {
          setNextMeeting(meets[0]);
        }
      }

      if (taskRes.status === "fulfilled") {
        const tList = taskRes.value.data.data || taskRes.value.data || [];
        pendingTasks = tList.filter((t: any) => t.status !== "Completed").length;
        setRecentTasks(tList.slice(0, 4));
      }

      setStats({
        membersCount: totalMembers || 14,
        upcomingMeetings: upcomingMeets || 3,
        openTasks: pendingTasks || 5,
        performancePct: 88,
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
            <Shield size={12} /> Staff & Committee Head Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
            Welcome back, {user?.name || "Dr. Jane Smith"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Overview for <span className="text-foreground font-semibold">Finance & Audit Committee</span>. View meetings, member status & track task progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/meetings"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 hover:opacity-90 flex items-center gap-1.5 transition-all"
          >
            <Calendar size={15} /> View Meetings Schedule
          </Link>
        </div>
      </div>


      {/* Stat Cards Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-blue-500/30 transition-all stat-card-blue">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Committee Members</span>
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-foreground">{stats.membersCount}</h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> 2 added this month
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-emerald-500/30 transition-all stat-card-green">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Upcoming Meetings</span>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-foreground">{stats.upcomingMeetings}</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <Clock size={12} /> Next: {nextMeeting ? new Date(nextMeeting.date).toLocaleDateString() : "This Week"}
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-amber-500/30 transition-all stat-card-amber">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Pending Tasks</span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <CheckSquare size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-foreground">{stats.openTasks}</h3>
            <p className="text-xs text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> 3 due this week
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-purple-500/30 transition-all stat-card-purple">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Committee Rating</span>
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <BarChart2 size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-foreground">{stats.performancePct}%</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Above Quarterly Target
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Action Control Bar */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Meeting Schedule", href: "/meetings", icon: Calendar, color: "from-blue-500 to-indigo-600" },
            { label: "Tasks & Board", href: "/tasks", icon: CheckSquare, color: "from-amber-500 to-orange-600" },
            { label: "Upload Document", href: "/documents", icon: Upload, color: "from-emerald-500 to-teal-600" },
            { label: "Export Report", href: "/reports", icon: BarChart2, color: "from-purple-500 to-pink-600" },
            { label: "Announcements", href: "/announcements", icon: Megaphone, color: "from-cyan-500 to-blue-600" },
          ].map((act, i) => {

            const Icon = act.icon;
            return (
              <Link
                key={i}
                href={act.href}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2.5 group"
              >
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${act.color} text-white flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-indigo-400 transition-colors truncate">
                  {act.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts & Task Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-400" /> Weekly Task Progress & Output
              </h3>
              <p className="text-xs text-muted-foreground">Task completion trajectory across your committee members.</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Meeting Card & Member Attendance */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Calendar size={18} className="text-emerald-400" /> Next Scheduled Meeting
          </h3>
          {nextMeeting ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 space-y-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                {nextMeeting.status}
              </span>
              <h4 className="font-bold text-foreground text-sm leading-snug">{nextMeeting.title}</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-400" /> {new Date(nextMeeting.date).toLocaleString()}
                </p>
                <p className="flex items-center gap-1.5">
                  <Users size={13} className="text-blue-400" /> Location: {nextMeeting.location || "Boardroom A"}
                </p>
              </div>
              <Link
                href="/meetings"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors pt-1"
              >
                View Meeting Minutes & Attendance <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No meetings currently scheduled. Click Schedule Meeting above to create one.
            </div>
          )}

          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Recent Member Tasks</span>
              <Link href="/tasks" className="text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-2">
              {recentTasks.slice(0, 3).map((t, idx) => (
                <div key={t._id || idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 text-xs">
                  <span className="truncate font-medium text-foreground max-w-[170px]">{t.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === "Completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
