"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import {
  FileText, Download, TrendingUp, Users, Calendar, CheckSquare, Award,
  Loader2, Sparkles, Printer, Info, HelpCircle
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Summary {
  totalCommittees: number;
  totalMeetings: number;
  totalTasks: number;
  taskCompletionRate: number;
  overallAttendanceRate: number;
}

interface AnalyticsData {
  summary: Summary;
  tasks: {
    total: number;
    statusStats: { Pending: number; 'In Progress': number; Completed: number; };
    priorityStats: { Low: number; Medium: number; High: number; };
  };
  attendance: {
    breakdown: { present: number; absent: number; excused: number; };
    trends: Array<{ date: string; meetingTitle: string; attendanceRate: number; }>;
  };
  committees: Array<{
    committeeId: string;
    committeeName: string;
    membersCount: number;
    meetingsCount: number;
    tasksCount: number;
    taskCompletionRate: number;
    averageAttendance: number;
  }>;
}

export default function AnalyticsPage() {
  const { addToast } = useToastStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/analytics`, { headers: authHeader() });
      setData(res.data.data);
    } catch (e) {
      addToast("Failed to fetch analytics reporting metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // CSV Report Generator (Excel Export)
  const exportExcel = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Summary Section
    csvContent += "Operational Overview Report\n";
    csvContent += `Generated On,${new Date().toLocaleDateString()}\n\n`;
    csvContent += "Metric,Value\n";
    csvContent += `Total Committees,${data.summary.totalCommittees}\n`;
    csvContent += `Total Meetings,${data.summary.totalMeetings}\n`;
    csvContent += `Total Tasks,${data.summary.totalTasks}\n`;
    csvContent += `Task Completion Rate %,${data.summary.taskCompletionRate}%\n`;
    csvContent += `Overall Attendance Rate %,${data.summary.overallAttendanceRate}%\n\n`;

    // Committee Table section
    csvContent += "Committee Performance metrics\n";
    csvContent += "Committee Name,Members Count,Meetings Held,Tasks Assigned,Task Completion Rate %,Average Attendance Rate %\n";
    
    data.committees.forEach(c => {
      csvContent += `"${c.committeeName}",${c.membersCount},${c.meetingsCount},${c.tasksCount},${c.taskCompletionRate}%,${c.averageAttendance}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Operational_Analytics_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("CSV Report downloaded successfully!", "success");
  };

  // PDF Export via native print stream with formatted print layout styling
  const exportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card text-center py-20 max-w-lg mx-auto">
        <Info size={40} className="text-indigo-500/40 mx-auto mb-3" />
        <h2 className="text-white font-bold text-base">Analytics Data Unavailable</h2>
        <p className="text-xs text-muted-foreground mt-1">Please ensure you have committees and meetings set up to visualize metric trends.</p>
      </div>
    );
  }

  // Prepping pie chart data for tasks status
  const taskStatusPieData = Object.entries(data.tasks.statusStats).map(([key, val]) => ({
    name: key,
    value: val
  }));

  // Prepping bar chart data for tasks priority
  const taskPriorityBarData = Object.entries(data.tasks.priorityStats).map(([key, val]) => ({
    priority: key,
    tasks: val
  }));

  return (
    <div className="space-y-6 print-container">
      {/* Dynamic inline styles for premium printing configuration */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide Sidebar and top headers in printing */
          aside, nav, .print-hide, button {
            display: none !important;
          }
          main, .print-container {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .glass-card {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            color: black !important;
          }
          h1, h2, h3, span, strong, td, th {
            color: black !important;
          }
        }
      `}</style>

      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 print-hide">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp size={20} />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white">System Reports & Analytics</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Comprehensive overview of metrics, tasks completion, and attendance metrics</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={exportPDF}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl shadow-lg border border-white/5 transition-all text-xs font-semibold">
            <Printer size={14} /> Export PDF
          </button>
          <button onClick={exportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-xs font-bold">
            <Download size={14} /> Export Excel (CSV)
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Operational Overview & KPI Report</h1>
        <p className="text-xs text-slate-500 mt-1">Committee Management System Analytics • Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* KPI Cards Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={20} /></div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Committees</span>
            <strong className="text-white text-lg font-extrabold">{data.summary.totalCommittees}</strong>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Calendar size={20} /></div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Meetings Held</span>
            <strong className="text-white text-lg font-extrabold">{data.summary.totalMeetings}</strong>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><CheckSquare size={20} /></div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Tasks</span>
            <strong className="text-white text-lg font-extrabold">{data.summary.totalTasks}</strong>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Award size={20} /></div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Task Done %</span>
            <strong className="text-white text-lg font-extrabold">{data.summary.taskCompletionRate}%</strong>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl"><TrendingUp size={20} /></div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Attendance Rate</span>
            <strong className="text-white text-lg font-extrabold">{data.summary.overallAttendanceRate}%</strong>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Rate Trends Area Chart */}
        <div className="glass-card p-5 border border-white/5">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" /> Attendance Trends Over Time
          </h3>
          <div className="h-72 w-full">
            {data.attendance.trends.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No attendance register data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.attendance.trends}>
                  <defs>
                    <linearGradient id="attRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="meetingTitle" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip contentStyle={{ background: "#0f111a", borderColor: "rgba(255,255,255,0.1)" }} />
                  <Area type="monotone" dataKey="attendanceRate" name="Attendance %" stroke="#3b82f6" fillOpacity={1} fill="url(#attRate)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task Priorities Bar Chart */}
        <div className="glass-card p-5 border border-white/5">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <CheckSquare size={16} className="text-indigo-400" /> Tasks by Priority Workload
          </h3>
          <div className="h-72 w-full">
            {data.tasks.total === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No tasks logs created yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskPriorityBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="priority" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip contentStyle={{ background: "#0f111a", borderColor: "rgba(255,255,255,0.1)" }} />
                  <Bar dataKey="tasks" name="Active Tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {taskPriorityBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Committee Operations Radar & Comparison Chart */}
      <div className="glass-card p-5 border border-white/5">
        <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
          <Award size={16} className="text-indigo-400" /> Committee Performance KPI Matrix
        </h3>
        <div className="h-80 w-full">
          {data.committees.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No operational committees data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.committees}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="committeeName" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <Tooltip contentStyle={{ background: "#0f111a", borderColor: "rgba(255,255,255,0.1)" }} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="taskCompletionRate" name="Task Completion Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="averageAttendance" name="Average Attendance %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed operational reporting table log */}
      <div className="glass-card p-5 border border-white/5">
        <h3 className="font-bold text-sm text-white mb-4">Detailed Performance metrics Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Committee Name</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Meetings Held</th>
                <th className="py-3 px-4">Tasks Assigned</th>
                <th className="py-3 px-4">Task Completion Rate</th>
                <th className="py-3 px-4">Average Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {data.committees.map((c) => (
                <tr key={c.committeeId} className="hover:bg-white/5 transition-all">
                  <td className="py-3 px-4 font-bold text-white">{c.committeeName}</td>
                  <td className="py-3 px-4">{c.membersCount} Members</td>
                  <td className="py-3 px-4">{c.meetingsCount} Meetings</td>
                  <td className="py-3 px-4">{c.tasksCount} Tasks</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-400">{c.taskCompletionRate}%</span>
                      <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden shrink-0">
                        <div className="bg-emerald-400 h-full" style={{ width: `${c.taskCompletionRate}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-amber-400">{c.averageAttendance}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
