"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search, MessageSquare, Plus, Calendar, CheckSquare, Users,
  Loader2, Award, TrendingUp, RefreshCw, Clipboard, CheckCircle2, ChevronRight, AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";

const API = "http://localhost:5000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

interface UserItem { _id: string; name: string; email: string; }
interface MeetingItem { _id: string; title: string; date: string; agenda: string; }
interface CommitteeItem { _id: string; name: string; }
interface RecommendedTask { title: string; description: string; priority: 'Low' | 'Medium' | 'High'; days: number; }

export default function AICopilotPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  // Unified State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [committees, setCommittees] = useState<CommitteeItem[]>([]);
  
  // Loading States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // AI Search Assistant states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    committees: any[];
    meetings: any[];
    tasks: any[];
    aiResponseText?: string;
  } | null>(null);

  // Meeting co-pilot states
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [meetingSummary, setMeetingSummary] = useState("");
  const [recommendedTasks, setRecommendedTasks] = useState<RecommendedTask[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

  // Committee Insights states
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("");
  const [attendanceInsights, setAttendanceInsights] = useState("");
  const [performanceReport, setPerformanceReport] = useState("");

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    try {
      const [meetingsRes, committeesRes, usersRes] = await Promise.all([
        axios.get(`${API}/meetings`, { headers: authHeader() }),
        axios.get(`${API}/committees`, { headers: authHeader() }),
        axios.get(`${API}/auth/users`, { headers: authHeader() }).catch(() => ({ data: { data: [] } }))
      ]);

      setMeetings(meetingsRes.data.data || []);
      setCommittees(committeesRes.data.data || []);
      
      const parsedUsers = usersRes.data.data || usersRes.data || [];
      setUsers(parsedUsers);
      
      if (parsedUsers.length > 0) {
        setSelectedAssignee(parsedUsers[0]._id);
      } else if (user) {
        setSelectedAssignee((user as any)._id || user.id || "");
      }
    } catch (e) {
      console.error(e);
      addToast("Failed to compile workspace context", "error");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // AI SEARCH TRIGGER
  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setAiLoading(true);
    try {
      const res = await axios.post(`${API}/ai/search-assistant`, { query: searchQuery }, { headers: authHeader() });
      setSearchResults(res.data.data);
      addToast("AI parsed search intents successfully!", "success");
    } catch (err) {
      addToast("AI Assistant failed to parse request", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // AI MEETING SUMMARY TRIGGER
  const handleGenerateSummary = async () => {
    if (!selectedMeetingId) {
      addToast("Please select a meeting first", "error");
      return;
    }
    setAiLoading(true);
    setMeetingSummary("");
    try {
      const res = await axios.post(`${API}/ai/meeting-summary`, { meetingId: selectedMeetingId }, { headers: authHeader() });
      setMeetingSummary(res.data.summary);
      addToast("AI summary generated!", "success");
    } catch (err) {
      addToast("Failed to generate AI meeting summary", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // AI SMART TASK RECOMMENDATIONS TRIGGER
  const handleGetRecommendations = async () => {
    if (!selectedMeetingId) {
      addToast("Please select a meeting first", "error");
      return;
    }
    setAiLoading(true);
    setRecommendedTasks([]);
    try {
      const res = await axios.post(`${API}/ai/task-recommendations`, { meetingId: selectedMeetingId }, { headers: authHeader() });
      setRecommendedTasks(res.data.recommendations);
      addToast("AI generated smart task recommendations!", "success");
    } catch (err) {
      addToast("Failed to generate task recommendations", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // QUICK ADD TASK ON KANBAN BOARD
  const handleQuickAddTask = async (task: RecommendedTask) => {
    if (!selectedAssignee) {
      addToast("Please select an assignee first", "error");
      return;
    }

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + task.days);

    try {
      await axios.post(`${API}/tasks`, {
        title: task.title,
        description: task.description,
        assignedTo: selectedAssignee,
        meeting: selectedMeetingId || undefined,
        priority: task.priority,
        deadline: deadlineDate.toISOString()
      }, { headers: authHeader() });

      addToast(`Task "${task.title}" added to Kanban board!`, "success");
      // Remove task from recommendations after successfully adding
      setRecommendedTasks(prev => prev.filter(t => t.title !== task.title));
    } catch (err) {
      addToast("Failed to insert recommended task", "error");
    }
  };

  // COMMITTEE ATTENDANCE INSIGHTS TRIGGER
  const handleGetAttendanceInsights = async () => {
    if (!selectedCommitteeId) {
      addToast("Please select a committee first", "error");
      return;
    }
    setAiLoading(true);
    setAttendanceInsights("");
    try {
      const res = await axios.post(`${API}/ai/attendance-insights`, { committeeId: selectedCommitteeId }, { headers: authHeader() });
      setAttendanceInsights(res.data.insights);
      addToast("Attendance patterns analyzed successfully!", "success");
    } catch (err) {
      addToast("Failed to analyze attendance insights", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // COMMITTEE AUTOMATED REPORT TRIGGER
  const handleGenerateReport = async () => {
    if (!selectedCommitteeId) {
      addToast("Please select a committee first", "error");
      return;
    }
    setAiLoading(true);
    setPerformanceReport("");
    try {
      const res = await axios.post(`${API}/ai/automated-report`, { committeeId: selectedCommitteeId }, { headers: authHeader() });
      setPerformanceReport(res.data.report);
      addToast("Automated performance review generated!", "success");
    } catch (err) {
      addToast("Failed to generate operational report", "error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title Section with Rotating AI Sparkles Orb */}
      <div className="relative overflow-hidden glass-card p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Background Visual Flare */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 animate-pulse">
              <Sparkles size={20} />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white">AI Operations Co-Pilot</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Leverage context-rich smart analytics, meeting assistants, and semantic search queries.</p>
        </div>

        {/* Global Loading Spinner */}
        {aiLoading && (
          <span className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            <Loader2 className="animate-spin" size={14} /> AI Processing Request...
          </span>
        )}
      </div>

      {loadingInitial ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: AI Search Assistant & Results */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* SEARCH ASSISTANT BOX */}
            <div className="glass-card p-5 border border-white/5 space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Search size={16} className="text-indigo-400" /> Natural Language AI Assistant
              </h3>
              <p className="text-[11px] text-muted-foreground">Ask the assistant about tasks, schedules, or committees (e.g. <i>"show high priority tasks"</i>, <i>"completed meetings"</i>, or <i>"finance"</i>)</p>

              <form onSubmit={handleAISearch} className="flex gap-2">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} required
                  placeholder="Ask the co-pilot anything about your workspace..."
                  className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder:text-muted-foreground/60" />
                <button type="submit" disabled={aiLoading}
                  className="px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0">
                  {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> Ask</>}
                </button>
              </form>
            </div>

            {/* SEARCH RESULTS OUTPUT PANEL */}
            <AnimatePresence>
              {searchResults && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="glass-card p-5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h4 className="text-xs font-bold text-slate-300">AI Co-Pilot Workspace Assistant</h4>
                    <button onClick={() => setSearchResults(null)} className="text-[10px] text-muted-foreground hover:text-white uppercase font-bold">Clear Results</button>
                  </div>

                  {/* Smart Conversational Response Dialog */}
                  {searchResults.aiResponseText && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-xs leading-relaxed space-y-2 text-slate-100 shadow-lg shadow-indigo-500/5">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-extrabold">
                        <span className="p-1 rounded-lg bg-indigo-500/20 animate-pulse">
                          <Sparkles size={12} />
                        </span>
                        <span>AI Assistant Response</span>
                      </div>
                      <p className="whitespace-pre-wrap font-sans text-[11px] text-slate-200">{searchResults.aiResponseText}</p>
                    </div>
                  )}

                  {searchResults.committees.length === 0 && searchResults.meetings.length === 0 && searchResults.tasks.length === 0 ? (
                    !searchResults.aiResponseText && (
                      <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-indigo-500/40" />
                        <span>No matching records found for this query context. Try searching "tasks" or "meetings".</span>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider border-b border-white/5 pb-1">Related Workspace Records:</div>
                      
                      {/* Matched Committees */}
                      {searchResults.committees.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Committees ({searchResults.committees.length})</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {searchResults.committees.map(c => (
                              <div key={c._id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-xs text-white block">#{c.name}</span>
                                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Head: {c.head?.name || 'Unassigned'} • Status: {c.status}</span>
                                </div>
                                <span className="text-[10px] bg-white/5 text-white border border-white/10 px-2 py-0.5 rounded-full">{c.members?.length || 0} Members</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Meetings */}
                      {searchResults.meetings.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Meetings ({searchResults.meetings.length})</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {searchResults.meetings.map(m => (
                              <div key={m._id} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                                <span className="font-bold text-xs text-white block line-clamp-1">{m.title}</span>
                                <span className="text-[10px] text-muted-foreground block">Committee: {m.committee?.name || 'Global'}</span>
                                <span className="text-[10px] text-slate-300 block font-semibold">Date: {new Date(m.date).toLocaleDateString()} • {m.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Tasks */}
                      {searchResults.tasks.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Tasks ({searchResults.tasks.length})</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {searchResults.tasks.map(t => (
                              <div key={t._id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-xs text-white block line-clamp-1">{t.title}</span>
                                  <span className="text-[10px] text-muted-foreground block truncate max-w-[200px]">{t.description}</span>
                                  <span className="text-[10px] text-slate-300 block mt-1 font-semibold">Assigned To: {t.assignedTo?.name || 'Unknown'}</span>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  t.priority === 'High' ? 'text-rose-400 bg-rose-500/10' : t.priority === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10'
                                }`}>{t.priority}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI MEETING CO-PILOT CARD */}
            <div className="glass-card p-5 border border-white/5 space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Calendar size={16} className="text-indigo-400" /> AI Meeting Co-Pilot Assistant
              </h3>
              <p className="text-[11px] text-muted-foreground">Select a recently scheduled or completed meeting to auto-summarize transcripts and extract smart tasks suggestions.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <select value={selectedMeetingId} onChange={e => { setSelectedMeetingId(e.target.value); setMeetingSummary(""); setRecommendedTasks([]); }}
                  className="flex-1 bg-black/20 text-xs font-semibold text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">-- Choose Target Session --</option>
                  {meetings.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button onClick={handleGenerateSummary} disabled={!selectedMeetingId || aiLoading}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-xl text-xs font-semibold transition-all">
                    Generate AI Summary
                  </button>
                  <button onClick={handleGetRecommendations} disabled={!selectedMeetingId || aiLoading}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/10">
                    Suggest Tasks
                  </button>
                </div>
              </div>

              {/* Display AI Meeting Summary in Markdown style */}
              <AnimatePresence>
                {meetingSummary && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="bg-black/20 border border-white/5 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {meetingSummary}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Display Recommended Tasks with Quick Add Actions */}
              <AnimatePresence>
                {recommendedTasks.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t border-white/5 pt-4 mt-2">
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5"><Sparkles size={12} /> AI Recommended Kanban Tasks:</span>
                      
                      {/* Assignee choice before Quick Adding */}
                      {users.length > 0 && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-[10px] text-muted-foreground shrink-0">Assign to:</span>
                          <select value={selectedAssignee} onChange={e => setSelectedAssignee(e.target.value)}
                            className="bg-black/20 text-[10px] font-bold text-white border border-white/10 rounded-lg px-2 py-1 focus:outline-none">
                            {users.map(u => (
                              <option key={u._id} value={u._id}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {recommendedTasks.map((task, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between hover:border-white/10 transition-all">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                task.priority === 'High' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                              }`}>{task.priority}</span>
                              <span className="text-[9px] text-muted-foreground">{task.days} Days ETA</span>
                            </div>
                            <h4 className="font-bold text-[11px] text-white line-clamp-1">{task.title}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-3 leading-normal h-12">{task.description}</p>
                          </div>
                          
                          <button onClick={() => handleQuickAddTask(task)}
                            className="w-full mt-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all border border-indigo-500/10">
                            <Plus size={10} /> Quick Add to Board
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Committee Insights */}
          <div className="space-y-6">
            
            {/* COMMITTEE REPORTS & PERFORMANCE ENGINE */}
            <div className="glass-card p-5 border border-white/5 space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Users size={16} className="text-indigo-400" /> AI Committee Insights Engine
              </h3>
              <p className="text-[11px] text-muted-foreground">Select a committee to analyze dynamic attendance metrics patterns and compile automated operational reports.</p>

              <select value={selectedCommitteeId} onChange={e => { setSelectedCommitteeId(e.target.value); setAttendanceInsights(""); setPerformanceReport(""); }}
                className="w-full bg-black/20 text-xs font-semibold text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">-- Choose Target Committee --</option>
                {committees.map(c => (
                  <option key={c._id} value={c._id}>#{c.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button onClick={handleGetAttendanceInsights} disabled={!selectedCommitteeId || aiLoading}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-xl text-[10px] font-bold transition-all">
                  Get Attendance Insights
                </button>
                <button onClick={handleGenerateReport} disabled={!selectedCommitteeId || aiLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-blue-500/10">
                  Generate AI Report
                </button>
              </div>

              {/* Display Attendance Insights (Markdown styling) */}
              <AnimatePresence>
                {attendanceInsights && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-black/25 border border-white/5 rounded-xl p-4 text-[11px] text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {attendanceInsights}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Display Automated Operational Report (Markdown styling) */}
              <AnimatePresence>
                {performanceReport && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-black/25 border border-white/5 rounded-xl p-4 text-[11px] text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {performanceReport}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
