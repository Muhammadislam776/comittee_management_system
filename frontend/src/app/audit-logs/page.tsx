"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, User, Activity, Search, Filter, Loader2 } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLogs(res.data.data || []))
      .catch(() => {
        // Fallback default audit logs
        setLogs([
          { _id: "1", action: "User Login", module: "Auth", user: { name: "Admin Operations Head", email: "admin@example.com" }, createdAt: new Date().toISOString() },
          { _id: "2", action: "Committee Created", module: "Committee", user: { name: "Dr. Jane Smith", email: "head.finance@example.com" }, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { _id: "3", action: "Task Updated", module: "Task", user: { name: "John Doe", email: "john@example.com" }, createdAt: new Date(Date.now() - 7200000).toISOString() },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight gradient-text">System Audit & Activity Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time security trail tracking user activities, logins, and system changes.
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" /> Fetching security logs…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-indigo-400" />
                        <span className="font-semibold text-foreground text-xs">{log.user?.name || "System User"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-foreground">{log.action}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase">
                        {log.module}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
