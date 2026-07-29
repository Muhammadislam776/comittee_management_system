"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Building, Briefcase, Shield, Key, Bell, Camera,
  Check, Loader2, Save, Sparkles
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(user?.department || "General");
  const [designation, setDesignation] = useState(user?.designation || "Committee Member");
  const [bio, setBio] = useState(user?.bio || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "General");
      setDesignation(user.designation || "Committee Member");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload: any = { name, phone, department, designation, bio };
      if (password) payload.password = password;

      const res = await axios.put(`${API}/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.data) {
        setUser(res.data.data);
      }
      addToast("Profile updated successfully!", "success");
      setPassword("");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Profile update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight gradient-text">User Profile & Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal details, role preferences, designation, and security settings.
        </p>
      </div>

      <div className="glass-card p-6 space-y-6">
        {/* User Card Top */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
              {(name || "U").substring(0, 2).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 p-1 rounded-full bg-indigo-500 text-white shadow hover:scale-105 transition-all">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{name || "User Name"}</h2>
            <p className="text-xs text-muted-foreground">{email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 capitalize">
                {user?.role || "Member"}
              </span>
              <span className="text-xs text-muted-foreground">{department}</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900/50 text-muted-foreground border border-white/10 opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Bio / About</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief professional background or skillsets..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Key size={13} className="text-indigo-400" /> Update Password (Optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password to change..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving Profile..." : "Save Profile Changes"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
