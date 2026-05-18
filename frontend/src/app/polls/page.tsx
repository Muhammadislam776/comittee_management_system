"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";
import {
  BarChart2, Plus, X, Loader2, CheckCircle2, Clock, Trash2, Calendar
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

interface Option { _id: string; text: string; voteCount: number; }
interface Poll {
  _id: string; title: string; description: string; options: Option[];
  expiresAt: string; status: "Active" | "Closed";
  voters: string[]; createdBy?: { _id: string; name: string } | null;
  committee?: { _id: string; name: string } | null;
  createdAt: string;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [committees, setCommittees] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Create Poll Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [committee, setCommittee] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");

  const { addToast } = useToastStore();
  const { user } = useAuthStore();

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/polls`, { headers: authHeader() });
      setPolls(res.data.data);
    } catch (e: any) { addToast("Failed to fetch polls", "error"); }
    finally { setLoading(false); }
  };

  const fetchCommittees = async () => {
    try {
      const res = await axios.get(`${API}/committees`, { headers: authHeader() });
      setCommittees(res.data.data);
    } catch (e) { console.error("Failed to fetch committees", e); }
  };

  useEffect(() => {
    fetchPolls();
    fetchCommittees();
  }, []);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== "");
    if (!title || !expiresAt || validOptions.length < 2) {
      addToast("Please provide a title, expiration date, and at least 2 valid options.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/polls`, {
        title, description, committee: committee || null,
        options: validOptions, expiresAt
      }, { headers: authHeader() });
      addToast("Poll created successfully", "success");
      setIsCreateOpen(false);
      setTitle(""); setDescription(""); setCommittee(""); setOptions(["", ""]); setExpiresAt("");
      fetchPolls();
    } catch (e: any) { addToast(e.response?.data?.message || "Failed to create poll", "error"); }
    finally { setSubmitting(false); }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      await axios.put(`${API}/polls/${pollId}/vote`, { optionId }, { headers: authHeader() });
      addToast("Vote cast successfully", "success");
      fetchPolls();
    } catch (e: any) { addToast(e.response?.data?.message || "Failed to vote", "error"); }
  };

  const handleDelete = async (pollId: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) return;
    try {
      await axios.delete(`${API}/polls/${pollId}`, { headers: authHeader() });
      addToast("Poll deleted", "success");
      fetchPolls();
    } catch (e: any) { addToast(e.response?.data?.message || "Failed to delete poll", "error"); }
  };

  const addOptionField = () => setOptions([...options, ""]);
  const removeOptionField = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };
  const updateOption = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  const inputCls = "w-full bg-black/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">Voting & Decisions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Participate in anonymous polls and view real-time analytics.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all">
          <Plus size={16} /> Create Poll
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <span className="text-sm text-muted-foreground font-medium">Loading polls...</span>
        </div>
      ) : polls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center glass-card">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <BarChart2 size={24} className="text-indigo-400" />
          </div>
          <p className="font-semibold text-sm">No polls available</p>
          <p className="text-xs text-muted-foreground max-w-xs">There are currently no active polls. Create one to gather opinions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {polls.map((poll, i) => {
            const hasVoted = !!(user && user._id && poll.voters.includes(user._id));
            const isClosed = poll.status === "Closed" || new Date(poll.expiresAt) < new Date();
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

            return (
              <motion.div key={poll._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col justify-between hover:border-white/10 transition-all">
                
                {/* Poll Header */}
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold leading-tight">{poll.title}</h3>
                    {(user?.role === 'admin' || (poll.createdBy && user?._id === poll.createdBy._id)) && (
                      <button onClick={() => handleDelete(poll._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 min-h-[2.5rem]">{poll.description || "No description provided."}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border", 
                      isClosed ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", isClosed ? "bg-slate-400" : "bg-emerald-400 animate-pulse")} />
                      {isClosed ? "Closed" : "Active"}
                    </span>
                    {poll.committee && (
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {poll.committee.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      <Clock size={10} />
                      Ends: {new Date(poll.expiresAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      Creator: {poll.createdBy?.name || "Deleted User"}
                    </span>
                  </div>
                </div>

                {/* Poll Body (Vote Form OR Chart) */}
                <div className="mt-6 flex-1 flex flex-col justify-end">
                  {(!isClosed && !hasVoted) ? (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Cast Your Vote</p>
                      {poll.options.map(opt => (
                        <button key={opt._id} onClick={() => handleVote(poll._id, opt._id)}
                          className="w-full text-left px-4 py-3 rounded-xl border border-white/10 bg-white/3 dark:bg-white/2 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group flex justify-between items-center">
                          <span className="text-sm font-medium group-hover:text-indigo-400">{opt.text}</span>
                          <span className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-indigo-400" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Poll Results</span>
                        <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{totalVotes} Votes Cast</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        {/* Custom Animated Progress Bars */}
                        <div className="md:col-span-3 space-y-3">
                          {poll.options.map((opt, index) => {
                            const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                            const optionColor = COLORS[index % COLORS.length];
                            return (
                              <div key={opt._id} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-medium text-slate-200">
                                  <span className="truncate max-w-[150px]">{opt.text}</span>
                                  <span className="font-bold shrink-0" style={{ color: optionColor }}>{opt.voteCount} ({percentage}%)</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: optionColor }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pie Chart Visualizer */}
                        {totalVotes > 0 ? (
                          <div className="md:col-span-2 h-32 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={poll.options}
                                  dataKey="voteCount"
                                  nameKey="text"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={25}
                                  outerRadius={45}
                                  paddingAngle={3}
                                >
                                  {poll.options.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="md:col-span-2 h-32 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-[10px] text-muted-foreground text-center px-2 leading-tight">
                            No votes recorded yet.
                          </div>
                        )}
                      </div>
                      
                      {hasVoted && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg mt-2">
                          <CheckCircle2 size={14} /> You have voted in this poll
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Poll Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold">Create New Poll</h2>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">Poll Title</label>
                  <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Quarterly Budget Approval" required />
                </div>
                
                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">Description</label>
                  <textarea className={cn(inputCls, "resize-none")} rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Additional context..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">Restrict to Committee (Optional)</label>
                    <select className={cn(inputCls, "dark:bg-[#0f1120]")} value={committee} onChange={e => setCommittee(e.target.value)}>
                      <option value="">Global Poll (Everyone)</option>
                      {committees.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">Expiration Date</label>
                    <input type="datetime-local" className={inputCls} value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground flex justify-between items-end">
                    Poll Options
                    <button type="button" onClick={addOptionField} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Plus size={12} /> Add Option
                    </button>
                  </label>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input className={inputCls} value={opt} onChange={e => updateOption(idx, e.target.value)} placeholder={`Option ${idx + 1}`} required />
                      {options.length > 2 && (
                        <button type="button" onClick={() => removeOptionField(idx)} className="p-2.5 rounded-xl border border-white/10 text-rose-400 hover:bg-rose-500/10">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-500 text-white flex gap-2 items-center">
                    {submitting && <Loader2 size={14} className="animate-spin" />} Create Poll
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
