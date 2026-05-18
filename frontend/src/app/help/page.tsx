"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Terminal, 
  Cpu, 
  MessageSquare, 
  ChevronDown, 
  Plus, 
  FileText, 
  Wrench, 
  ShieldAlert, 
  Send 
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "defense" | "tech";
}

export default function HelpPage() {
  const { addToast } = useToastStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "general" | "defense" | "tech">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);

  const faqs: FAQItem[] = [
    // category: general
    {
      category: "general",
      question: "How do I schedule a new committee meeting?",
      answer: "Only users logged in as Admin or Committee Heads can schedule meetings. Go to the 'Meetings' tab, click 'Schedule Meeting', fill in the title, agenda, committee, date, and time. Members will instantly see it on their calendars and can mark their attendance."
    },
    {
      category: "general",
      question: "What roles exist and what are their permissions?",
      answer: "1) Admin: Full system access (create committees, manage users, schedule meetings, upload global resources). 2) Committee Head: Moderate assigned committees, create tasks, and manage specific workflows. 3) Member: Access assigned committees, chat in real-time, complete tasks, vote in polls, and view documents."
    },
    {
      category: "general",
      question: "How do the interactive Polls work?",
      answer: "Admins or Committee Heads can launch polls in the 'Polls' module. Once a poll is created, committee members see a card with vote options. When they click to vote, the frontend recalculates scores and updates the interactive Recharts graph in real-time!"
    },
    // category: defense
    {
      category: "defense",
      question: "🎓 (Defense Prep) Explain the real-time chat architecture in this project.",
      answer: "Our real-time chat runs on WebSockets via Socket.io. When a user connects, the frontend establishes a persistent, bi-directional connection to the Node.js backend. When a message is sent, it triggers an event that the backend broadcasts to all clients active in that specific committee channel instantly—bypassing traditional slow HTTP polling!"
    },
    {
      category: "defense",
      question: "🎓 (Defense Prep) How does this application store and protect user passwords?",
      answer: "We never store raw text passwords in our MongoDB Atlas cluster. When a user registers or updates their password, we use bcryptjs to generate a secure cryptographic salt and run 10 hashing rounds. During login, bcrypt compares the incoming password with the secure hash stored in Atlas to verify authenticity safely."
    },
    {
      category: "defense",
      question: "🎓 (Defense Prep) Why did you choose NoSQL (MongoDB) instead of SQL (MySQL/PostgreSQL)?",
      answer: "MongoDB's flexible schema models real-world committee data extremely naturally. Our objects (Committees, Tasks, Meetings, Polls, Documents) have deeply nested structures (e.g., meeting agendas, poll options, message histories) which are highly performant when stored as JSON-like documents, avoiding expensive SQL multi-table joins."
    },
    {
      category: "defense",
      question: "🎓 (Defense Prep) What is rate limiting and how does it protect the API?",
      answer: "We integrated express-rate-limit to protect backend authentication and core routes against brute-force and DDoS attacks. It works by monitoring incoming IP requests within a time-window. In production, if an IP triggers more than 100 requests per 10 minutes, the server blocks them with a JSON response code, preventing resource exhaustion."
    },
    // category: tech
    {
      category: "tech",
      question: "What should I do if the real-time chat shows connection issues?",
      answer: "Ensure your backend server is running on port 5000 and Socket.io handshake is successful. If you are deploying on Render, make sure to add your deployed backend URL as a Socket.io endpoint in the frontend `SocketContext.tsx`!"
    },
    {
      category: "tech",
      question: "How can I set up the environment variables (.env) for deployment?",
      answer: "Create a `.env` file in the `backend/` directory. Add `PORT=5000`, `MONGO_URI` (your MongoDB Atlas connection string), `JWT_SECRET` (a secure secret key), and optional Cloudinary credentials. Never push this `.env` file to your public GitHub repo—it's already ignored in `.gitignore`!"
    },
    {
      category: "tech",
      question: "How do I clear the local session if the state gets stuck?",
      answer: "If you want to clear your local session cache, open your browser Console (F12), type `localStorage.clear()` and refresh the page. This resets your local Next.js client state to blank."
    }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      addToast("Please fill out both ticket fields", "error");
      return;
    }

    setTicketLoading(true);
    setTimeout(() => {
      addToast("Support Ticket submitted successfully! (Mock)", "success");
      setTicketSubject("");
      setTicketMessage("");
      setTicketLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 text-center border border-white/20 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 -z-10" />
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
          <HelpCircle size={28} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">How can we help you today?</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
          Browse operational guides, read key project defense viva preparation questions, and resolve backend troubleshooting.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-lg mx-auto relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search questions, database, websockets, bcrypt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 text-sm transition-colors shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Accordion / FAQ Section (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Categories Tab Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Guides", icon: BookOpen },
              { id: "defense", label: "🎓 Defense Viva Prep", icon: Cpu },
              { id: "general", label: "📘 Operational Guide", icon: MessageSquare },
              { id: "tech", label: "🛠️ Troubleshooting", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id as any);
                    setExpandedIndex(null);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                      : "border-white/10 dark:border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQS Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div
                    key={index}
                    className={`glass-card rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isExpanded 
                        ? "border-indigo-500/30 bg-indigo-500/5 shadow-md shadow-indigo-500/5" 
                        : "border-white/10 dark:border-white/5"
                    }`}
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none"
                    >
                      <span className="text-sm font-bold pr-4 leading-relaxed">{faq.question}</span>
                      <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 dark:border-white/5 transition-transform duration-300 ${isExpanded ? "rotate-180 text-indigo-400" : "text-muted-foreground"}`}>
                        <ChevronDown size={14} />
                      </div>
                    </button>

                    {/* Animated Content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground border-t border-white/10 dark:border-white/5 leading-relaxed bg-black/5">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-12 glass-card rounded-2xl border border-white/10 dark:border-white/5">
                <ShieldAlert size={36} className="mx-auto text-muted-foreground/60 mb-3" />
                <h3 className="font-bold text-sm">No matching questions found</h3>
                <p className="text-xs text-muted-foreground mt-1">Try searching with other keywords or filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Support Ticket Section (Right 1 column) */}
        <div className="space-y-6">
          
          {/* Quick Help Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/5">
            <h3 className="font-extrabold text-sm mb-2 flex items-center space-x-2">
              <Cpu size={16} className="text-indigo-400" />
              <span>Project Core Architecture</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This system is engineered utilizing a reactive monorepo architecture:
            </p>
            <div className="mt-4 space-y-3">
              {[
                { title: "Frontend Client", desc: "Next.js App Router & Tailwind CSS" },
                { title: "API Gateway", desc: "Express.js REST controllers" },
                { title: "Real-time sync", desc: "Socket.io active WebSockets" },
                { title: "Cloud Database", desc: "MongoDB Atlas Cloud Storage" },
              ].map((tech, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-[11px] p-2 rounded-xl bg-black/10 dark:bg-white/5 border border-white/10 dark:border-white/5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <div className="flex-1">
                    <span className="font-bold text-foreground block leading-tight">{tech.title}</span>
                    <span className="text-muted-foreground text-[10px] block leading-tight mt-0.5">{tech.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Support Ticket Form */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/5">
            <h3 className="font-extrabold text-sm mb-1 flex items-center space-x-2">
              <Wrench size={16} className="text-pink-400" />
              <span>Submit Support Ticket</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mb-4">Direct ticket submission form for issues.</p>
            
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Server connection error"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold block mb-1">Describe Issue</label>
                <textarea
                  rows={4}
                  placeholder="Write details about the error..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 dark:border-white/5 bg-black/10 dark:bg-white/5 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={ticketLoading}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {ticketLoading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
