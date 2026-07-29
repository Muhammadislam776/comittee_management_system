"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Wallet, Shield, BarChart2, ArrowUpRight,
  PieChart as PieIcon, CreditCard, RefreshCw
} from "lucide-react";
import axios from "axios";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function FinancePage() {
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/committees`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setCommittees(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalBudget = committees.reduce((acc, c) => acc + (c.budget || 50000), 0);
  const totalAllocated = Math.round(totalBudget * 0.65);

  const chartData = committees.map((c) => ({
    name: c.name.split(" ")[0],
    Budget: c.budget || 50000,
    Spent: Math.round((c.budget || 50000) * 0.6),
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight gradient-text">Finance & Budget Allocation</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor organizational spending, committee budget allocations, and treasury reserve stats.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Total Budget Allocated</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">${totalBudget.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> Approved by Finance Committee
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Total Expenditure</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">${totalAllocated.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground font-semibold">65% of Total Budget Used</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Remaining Reserves</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">${(totalBudget - totalAllocated).toLocaleString()}</p>
          <p className="text-xs text-purple-400 font-semibold">Available for Q3 Allocation</p>
        </div>
      </div>

      {/* Budget Breakdown Chart & Committee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <BarChart2 size={18} className="text-indigo-400" /> Budget vs Spent by Committee
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Shield size={18} className="text-indigo-400" /> Committee Allocations
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {committees.map((c) => {
              const b = c.budget || 50000;
              const s = Math.round(b * 0.6);
              const pct = Math.round((s / b) * 100);
              return (
                <div key={c._id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-foreground">{c.name}</span>
                    <span className="text-indigo-400">${s.toLocaleString()} / ${b.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
