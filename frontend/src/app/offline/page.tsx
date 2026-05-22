"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function OfflinePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOnlineStatus(navigator.onLine);

      const handleOnline = () => setOnlineStatus(true);
      const handleOffline = () => setOnlineStatus(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    // Simulate a brief check
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (navigator.onLine) {
      router.push("/");
    } else {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background styling to match AppLayout */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50 dark:from-[#060814] dark:via-[#08091a] dark:to-[#060814]" />
        {/* Glowing blobs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/6 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/8 dark:bg-purple-500/5 blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] dark:opacity-20 opacity-60" />
      </div>

      <div className="w-full max-w-md text-center z-10">
        {/* Icon Animation Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative inline-flex items-center justify-center p-8 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 dark:border-indigo-500/10 shadow-2xl mb-8"
        >
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 animate-pulse" />
          
          <WifiOff className="h-16 w-16 text-indigo-500 dark:text-indigo-400" />
        </motion.div>

        {/* Text Details */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3"
        >
          Connection Lost
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed"
        >
          You are currently offline. Check your internet connection or try reloading the application.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-75 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? "Checking..." : "Try Again"}</span>
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-200/80 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold border border-slate-300 dark:border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        </motion.div>
      </div>

      {/* Premium Footer indicator */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          CommitteeMS Progressive Web App Mode
        </p>
      </div>
    </div>
  );
}
