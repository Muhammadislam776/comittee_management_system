"use client";

import { useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required.");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || "Something went wrong.");

      addToast("Reset token generated successfully! (Check console or below)", "success");
      
      // Because we simulate email delivery, let's capture the token to let the user reset easily!
      if (data.token) {
        setSimulatedLink(`/reset-password/${data.token}`);
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass-card"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Forgot Password
          </h2>
          <p className="text-muted-foreground mt-2">Enter your email to request a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 bg-background/50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                error ? "border-red-500/50 focus:ring-red-500" : ""
              }`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {simulatedLink && (
          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
              Simulated Reset Link Generated!
            </p>
            <Link
              href={simulatedLink}
              className="inline-block py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Go to Reset Form
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
