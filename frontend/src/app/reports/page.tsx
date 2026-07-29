"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Filter, Calendar, BarChart2, CheckCircle2,
  Shield, FileSpreadsheet, FileCode, Check, Loader2
} from "lucide-react";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { useToastStore } from "@/store/useToastStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const REPORT_TYPES = [
  { id: "committee", title: "Committee Performance Report", desc: "Comprehensive analysis of committee budgets, member counts, and active status.", icon: Shield, color: "from-indigo-500 to-purple-600" },
  { id: "meetings", title: "Meeting & Attendance Minutes", desc: "Full breakdown of scheduled meetings, attendee quorum, and action item logs.", icon: Calendar, color: "from-blue-500 to-cyan-600" },
  { id: "tasks", title: "Task Completion Analytics", desc: "Detailed task progress, deadline compliance, and member workload summary.", icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
  { id: "audit", title: "System Security & Audit Log", desc: "Historical user login events, role modifications, and resource alterations.", icon: BarChart2, color: "from-purple-500 to-pink-600" },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState("committee");
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [dateRange, setDateRange] = useState("30");
  const [generating, setGenerating] = useState(false);
  const { addToast } = useToastStore();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const timestamp = new Date().toISOString().slice(0, 10);
      const baseFileName = `${selectedType}_report_${timestamp}`;

      let dataRows: any[] = [];

      // 1. Fetch Real Data from Backend Database
      if (selectedType === "committee") {
        const res = await axios.get(`${API}/committees`, { headers });
        const list = res.data.data || [];
        dataRows = list.map((c: any) => ({
          "Committee Name": c.name,
          "Category": c.category,
          "Status": c.status,
          "Budget ($)": c.budget || 0,
          "Location": c.location || "Headquarters",
          "Members Count": c.members?.length || 0,
        }));
      } else if (selectedType === "meetings") {
        const res = await axios.get(`${API}/meetings`, { headers });
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        dataRows = list.map((m: any) => ({
          "Meeting Title": m.title,
          "Date": new Date(m.date).toLocaleString(),
          "Status": m.status,
          "Location": m.location || "Online",
          "Agenda": m.agenda || "N/A",
        }));
      } else if (selectedType === "tasks") {
        const res = await axios.get(`${API}/tasks`, { headers });
        const list = res.data.data || res.data || [];
        dataRows = list.map((t: any) => ({
          "Task Title": t.title,
          "Priority": t.priority,
          "Progress (%)": `${t.progress || 0}%`,
          "Status": t.status,
          "Deadline": t.deadline ? new Date(t.deadline).toLocaleDateString() : "N/A",
        }));
      } else {
        const res = await axios.get(`${API}/logs`, { headers });
        const list = res.data.data || [];
        dataRows = list.map((l: any) => ({
          "Timestamp": new Date(l.createdAt).toLocaleString(),
          "Action": l.action,
          "Module": l.module,
          "User": l.user?.name || "System User",
        }));
      }

      // If no rows, provide fallback row
      if (dataRows.length === 0) {
        dataRows = [{ Info: "No data available for the selected report filter." }];
      }

      // 2. Export based on selected format
      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(dataRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
        XLSX.writeFile(workbook, `${baseFileName}.xlsx`);
      } else if (format === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(dataRows);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${baseFileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Smart Committee System - ${selectedType.toUpperCase()} REPORT`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated Date: ${new Date().toLocaleString()} | Period: Last ${dateRange} Days`, 14, 28);
        doc.text("------------------------------------------------------------------------------------------------", 14, 33);

        let y = 42;
        dataRows.forEach((row, idx) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(11);
          doc.text(`#${idx + 1}`, 14, y);
          let subY = y;
          Object.entries(row).forEach(([key, val]) => {
            doc.setFontSize(9);
            doc.text(`${key}: ${val}`, 24, subY);
            subY += 5;
          });
          y = subY + 3;
        });

        doc.save(`${baseFileName}.pdf`);
      }

      addToast(`Downloaded ${baseFileName}.${format === "excel" ? "xlsx" : format} to your device!`, "success");
    } catch (err: any) {
      console.error("Report generation error:", err);
      addToast(err.response?.data?.message || "Failed to download report", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight gradient-text">System Reports & Exports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate, filter, and export detailed PDF/Excel reports across all committee operations.
        </p>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((r) => {
          const Icon = r.icon;
          const isSel = selectedType === r.id;
          return (
            <motion.div
              key={r.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedType(r.id)}
              className={`glass-card p-5 cursor-pointer relative overflow-hidden transition-all border ${
                isSel ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10" : "border-white/10 opacity-80 hover:opacity-100"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${r.color} text-white flex items-center justify-center mb-3 shadow-md`}>
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-sm text-foreground">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
              {isSel && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                  <Check size={12} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Export Controls Card */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Filter size={18} className="text-indigo-400" /> Report Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "pdf", label: "PDF", icon: FileText },
                { id: "excel", label: "Excel", icon: FileSpreadsheet },
                { id: "csv", label: "CSV", icon: FileCode },
              ].map((f) => {
                const FIcon = f.icon;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      format === f.id
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                        : "border-white/10 text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    <FIcon size={14} /> {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Time Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="7" className="bg-slate-900 text-white">Last 7 Days</option>
              <option value="30" className="bg-slate-900 text-white">Last 30 Days (Current Month)</option>
              <option value="90" className="bg-slate-900 text-white">Last Quarter (90 Days)</option>
              <option value="365" className="bg-slate-900 text-white">Full Year (365 Days)</option>
            </select>
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {generating ? "Generating File..." : `Download ${format.toUpperCase()} Report`}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
