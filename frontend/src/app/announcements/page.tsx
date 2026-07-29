"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Bell, Plus, Calendar, Tag, User, Shield } from "lucide-react";
import axios from "axios";
import { useToastStore } from "@/store/useToastStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    // Mock or fetch announcements
    setAnnouncements([
      { id: 1, title: "Q3 Committee Budget Review Scheduled", date: "Today", tag: "Finance", author: "Admin Operations Head" },
      { id: 2, title: "New Security Protocol & Multi-Factor Auth Enforcement", date: "Yesterday", tag: "System", author: "Prof. Alan Turing" },
      { id: 3, title: "Annual General Assembly Meeting Details", date: "3 Days ago", tag: "General", author: "Dr. Jane Smith" },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">Broadcast Announcements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Official system notices, policy updates, and committee broadcasts.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <motion.div key={a.id} whileHover={{ x: 2 }} className="glass-card p-5 space-y-2 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Tag size={11} /> {a.tag}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar size={12} /> {a.date}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">{a.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <User size={12} /> Posted by <span className="text-foreground font-medium">{a.author}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
