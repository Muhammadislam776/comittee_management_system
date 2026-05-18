"use client";

import { useToastStore, ToastMessage } from "@/store/useToastStore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0" />,
    error: <XCircle className="text-red-500 h-5 w-5 flex-shrink-0" />,
    info: <Info className="text-blue-500 h-5 w-5 flex-shrink-0" />,
  };

  const bgStyles = {
    success: "border-green-500/20 bg-green-500/10 text-green-900 dark:text-green-100",
    error: "border-red-500/20 bg-red-500/10 text-red-900 dark:text-red-100",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-900 dark:text-blue-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`flex items-center justify-between p-4 border rounded-xl glass shadow-lg backdrop-blur-md ${bgStyles[toast.type]}`}
    >
      <div className="flex items-center space-x-3">
        {icons[toast.type]}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
