"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Layers } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuthStore();
  const { addToast } = useToastStore();
  const router = useRouter();

  const validateForm = () => {
    const tempErrors: { email?: string; password?: string } = {};
    if (!email) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Invalid email format.";
    }

    if (!password) {
      tempErrors.password = "Password is required.";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please correct the validation errors.", "error");
      return;
    }

    setIsSubmitting(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || "Invalid credentials");
      
      login(data.token, data.user);
      addToast(`Successfully logged in as ${data.user.name}!`, "success");
      router.push("/");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 25 } }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4 py-12 select-none bg-slate-950/5 dark:bg-black/0">
      
      {/* Background Animated Gradient Mesh and Floating Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep background light radial bursts */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-600/15" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-pink-500/10 rounded-full blur-[120px] dark:bg-pink-600/15" />
        
        {/* Dynamic floating light circle */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[30%] right-[25%] w-80 h-80 bg-purple-500/10 rounded-full blur-[80px]"
        />
      </div>

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg z-10 glass-card p-6 md:p-10 border border-slate-200/80 dark:border-white/10 shadow-2xl relative"
      >
        {/* Visual brand logo header */}
        <motion.div variants={itemVariants} className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 mb-3 animate-pulse">
            <Layers size={26} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Apex Committee Portal
          </h2>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
            Intelligent operations, real-time analytics, and collaborative governance.
          </p>
        </motion.div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin or member email..."
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-100/70 dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all font-semibold ${
                  errors.email ? "border-red-500/50 focus:ring-red-500" : ""
                }`}
              />
            </div>
            {errors.email && <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block">{errors.email}</span>}
          </motion.div>
          
          {/* Password Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-100/70 dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all font-semibold ${
                  errors.password ? "border-red-500/50 focus:ring-red-500" : ""
                }`}
              />
            </div>
            {errors.password && <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block">{errors.password}</span>}
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-extrabold rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-1.5 text-xs tracking-wider uppercase disabled:opacity-60"
            >
              {isSubmitting ? "Connecting..." : <>Sign In <ArrowRight size={13} /></>}
            </button>
          </motion.div>
        </form>

        {/* Register Guide */}
        <motion.p variants={itemVariants} className="mt-6 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
          Don't have an account yet?{" "}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline font-bold">
            Register here
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
