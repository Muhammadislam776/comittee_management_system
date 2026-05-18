"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useToastStore } from "@/store/useToastStore";
import { 
  User, 
  Lock, 
  Palette, 
  Volume2, 
  MousePointer, 
  Sliders, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  Tv, 
  Loader2 
} from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const { user, token } = useAuthStore();
  const { 
    pointerStyle, 
    setPointerStyle, 
    blurAmount, 
    setBlurAmount, 
    audioFxEnabled, 
    setAudioFxEnabled 
  } = useLayoutStore();
  const { addToast } = useToastStore();

  // Profile forms state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast("Name and email cannot be empty", "error");
      return;
    }

    try {
      setProfileLoading(true);
      const res = await axios.put(
        "http://localhost:5000/api/auth/updatedetails",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        addToast("Profile updated successfully!", "success");
        // Update user state locally
        if (typeof window !== "undefined") {
          const authData = localStorage.getItem("auth-storage");
          if (authData) {
            const parsed = JSON.parse(authData);
            parsed.state.user = { ...parsed.state.user, name, email };
            localStorage.setItem("auth-storage", JSON.stringify(parsed));
          }
        }
        // Force refresh to update layout
        window.location.reload();
      }
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to update profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newPassword || !confirmPassword) {
      addToast("Please fill all password fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axios.put(
        "http://localhost:5000/api/auth/updatedetails",
        { password, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        addToast("Password changed successfully!", "success");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to change password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Personalize your interface, customize controls, and manage secure accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Settings & Personalization */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Custom Pointer Section */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <MousePointer size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Pointer Trail & Cursor settings</h2>
                <p className="text-xs text-muted-foreground">Select how your cursor moves and glows on the screen.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "default", label: "Default System", desc: "Classic pointer", color: "bg-slate-500" },
                { id: "glow", label: "Glow Trail", desc: "Glowing indigo halo", color: "bg-indigo-500" },
                { id: "bubble", label: "Glass Bubble", desc: "Trailing air bubble", color: "bg-pink-500" },
                { id: "crosshair", label: "Retro Crosshair", desc: "Tactical UI targeter", color: "bg-emerald-500" },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setPointerStyle(style.id);
                    addToast(`Cursor set to ${style.label}`, "success");
                  }}
                  className={`flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all duration-300 relative group cursor-pointer ${
                    pointerStyle === style.id
                      ? "border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5 scale-[1.02]"
                      : "border-white/10 dark:border-white/5 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg ${style.color}/20 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    <MousePointer size={16} className={pointerStyle === style.id ? "text-indigo-400" : "text-muted-foreground"} />
                  </div>
                  <span className="text-[13px] font-bold block leading-tight">{style.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-1 leading-normal block">{style.desc}</span>
                  
                  {pointerStyle === style.id && (
                    <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Aesthetics & Glassmorphism */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Glassmorphism Intensity</h2>
                <p className="text-xs text-muted-foreground">Adjust panel backdrop blur amounts to suit your system graphics speed.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Backdrop Blur Radius</span>
                  <span className="text-sm font-bold text-indigo-400">{blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                  <span>Fast Graphics (4px)</span>
                  <span>Super Glassmorphic (24px)</span>
                </div>
              </div>

              {/* Accent Color picker (Visual Demo) */}
              <div>
                <label className="text-sm font-semibold block mb-3">Accent Accent Color</label>
                <div className="flex items-center space-x-3">
                  {["indigo", "violet", "emerald", "rose"].map((color) => (
                    <button
                      key={color}
                      onClick={() => addToast(`Accent theme updated to ${color}!`, "success")}
                      className={`h-7 w-7 rounded-full relative cursor-pointer border-2 transition-all ${
                        color === "indigo" 
                          ? "border-white dark:border-slate-100 ring-2 ring-indigo-500" 
                          : "border-transparent hover:scale-110"
                      }`}
                      style={{
                        backgroundColor: 
                          color === "indigo" ? "#4f46e5" : 
                          color === "violet" ? "#7c3aed" : 
                          color === "emerald" ? "#10b981" : "#f43f5e"
                      }}
                    >
                      {color === "indigo" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sound Settings & Alerts */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                <Volume2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Sound Effects & Feedback</h2>
                <p className="text-xs text-muted-foreground">Manage audio feedback and alert triggers on events.</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/5">
              <div>
                <h4 className="text-sm font-bold">Interactive Sound Effects (FX)</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Play elegant alerts when receiving live messages in chats.</p>
              </div>
              <button
                onClick={() => {
                  setAudioFxEnabled(!audioFxEnabled);
                  addToast(`Audio effects ${!audioFxEnabled ? "enabled" : "disabled"}`, "success");
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  audioFxEnabled ? "bg-indigo-500" : "bg-slate-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    audioFxEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Account Security Panels */}
        <div className="space-y-8">
          
          {/* User Profile Details */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">User Profile</h2>
                <p className="text-xs text-muted-foreground">Update your personal account credentials.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Role Permission</label>
                <div className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 dark:border-white/5 bg-slate-500/10 capitalize text-muted-foreground flex items-center justify-between">
                  <span>{user?.role || "Member"}</span>
                  <Sparkles size={12} className="text-indigo-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
              >
                {profileLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Update Profile</span>
                )}
              </button>
            </form>
          </div>

          {/* Change Password Details */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Change Password</h2>
                <p className="text-xs text-muted-foreground">Keep your account guarded with a fresh password.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Current Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
