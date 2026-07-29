"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare, Calendar, CheckCircle2, FileText, Bell, Users,
  ArrowUpRight, Clock, Shield, Upload, TrendingUp, MessageSquare,
  AlertCircle, Sparkles, Check, ChevronRight, Eye
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
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

const committeeRules = [
  { title: "Attendance Quorum ≥ 80%", desc: "Applies to all scheduled committee meetings & voting sessions.", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  { title: "Weekly Progress Deadlines", desc: "Submit work deliverables & status updates before Friday 5 PM.", color: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  { title: "Document Upload Review", desc: "Upload files to committee folder for head verification.", color: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
];

export function MemberDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    openTasks: 4,
    completedTasks: 12,
    attendancePct: 92,
  });
  const [nextMeeting, setNextMeeting] = useState<any>(null);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      axios.get(`${API}/tasks`, { headers }),
      axios.get(`${API}/meetings`, { headers }),
    ]).then(([taskRes, meetRes]) => {
      let openCount = 4;
      let doneCount = 12;

      if (taskRes.status === "fulfilled") {
        const tList = taskRes.value.data.data || taskRes.value.data || [];
        setAssignedTasks(tList.slice(0, 5));
        openCount = tList.filter((t: any) => t.status !== "Completed").length;
        doneCount = tList.filter((t: any) => t.status === "Completed").length;
      }

      if (meetRes.status === "fulfilled") {
        const mList = Array.isArray(meetRes.value.data) ? meetRes.value.data : (meetRes.value.data?.data || []);
        if (mList.length > 0) {
          setNextMeeting(mList[0]);
        }
      }

      setStats({
        openTasks: openCount || 4,
        completedTasks: doneCount || 12,
        attendancePct: 92,
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Member Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Users size={12} /> Member Workspace Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
            Welcome back, {user?.name || "John Doe"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track your assigned deliverables, review meeting agendas, and participate in active committee polls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tasks"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:opacity-90 flex items-center gap-1.5 transition-all"
          >
            <CheckSquare size={15} /> My Tasks & Board
          </Link>
        </div>
      </div>

      {/* Glassmorphic Stat Cards Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-emerald-500/30 transition-all stat-card-green">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">My Open Tasks</span>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckSquare size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-foreground">{stats.openTasks}</h3>
            <p className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> 1 due tomorrow
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-blue-500/30 transition-all stat-card-blue">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Next Scheduled Meeting</span>
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground truncate">
              {nextMeeting ? new Date(nextMeeting.date).toLocaleDateString() : "Jun 24"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <Clock size={12} /> {nextMeeting?.location || "Room 204 (10:00 AM)"}
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-purple-500/30 transition-all stat-card-purple">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tasks Completed</span>
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-foreground">{stats.completedTasks}</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> ▲ 3 completed this month
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 space-y-3 border border-white/10 hover:border-amber-500/30 transition-all stat-card-amber">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">My Attendance</span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-foreground">{stats.attendancePct}%</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <Shield size={12} /> High Attendance Quorum
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Member Quick Action Shortcuts */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Member Quick Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Update Task Status", href: "/tasks", icon: CheckSquare, color: "from-emerald-500 to-teal-600" },
            { label: "View Meeting Agenda", href: "/meetings", icon: Calendar, color: "from-blue-500 to-indigo-600" },
            { label: "Participate in Polls", href: "/polls", icon: TrendingUp, color: "from-purple-500 to-pink-600" },
            { label: "Team Workspace Chat", href: "/chat", icon: MessageSquare, color: "from-cyan-500 to-blue-600" },
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
                <span className="text-xs font-semibold text-foreground group-hover:text-emerald-400 transition-colors truncate">
                  {act.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Workspace Tasks & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Tasks Table */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-400" /> My Assigned Tasks
              </h3>
              <p className="text-xs text-muted-foreground">Deliverables assigned to you by committee heads.</p>
            </div>
            <Link href="/tasks" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              View All Tasks <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 px-3">Task Deliverable</th>
                  <th className="pb-3 px-3">Due Date</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {assignedTasks.map((t, idx) => (
                  <tr key={t._id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-foreground">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                        {t.description || "Committee assignment"}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                      {t.deadline ? new Date(t.deadline).toLocaleDateString() : "This Week"}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.status === "Completed"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : t.status === "In Progress"
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link
                        href="/tasks"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-500/30 transition-all"
                      >
                        Update <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Committee Guidelines & Quorum Rules */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Shield size={18} className="text-blue-400" /> Committee Guidelines
          </h3>

          <div className="space-y-3">
            {committeeRules.map((r, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${r.color} space-y-1`}>
                <h4 className="font-bold text-xs">{r.title}</h4>
                <p className="text-[11px] leading-relaxed opacity-90">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link
              href="/documents"
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground flex items-center justify-center gap-2 transition-all"
            >
              <FileText size={14} className="text-emerald-400" /> Access Committee Documents Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
