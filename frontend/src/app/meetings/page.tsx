"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Users, FileText, CheckCircle2,
  AlertCircle, ChevronLeft, ChevronRight, Loader2,
  Plus, X, Search, Filter, Trash2, Edit2, MapPin
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";


const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const STATUSES = ["Scheduled", "In Progress", "Completed", "Cancelled", "Postponed"] as const;

type Status = typeof STATUSES[number];

interface UserRef { _id: string; name: string; email: string; role: string; }
interface CommitteeRef { _id: string; name: string; }
interface Attendance { user: UserRef; status: "Present" | "Absent" | "Excused"; markedAt?: string; }
interface Meeting {
  _id: string; title: string; date: string; endDate?: string;
  location?: string; committee: CommitteeRef; agenda: string;
  minutes?: string; status: Status; attendance: Attendance[];
  createdBy?: UserRef;
}

const statusStyle: Record<string, string> = {
  Scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Postponed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

function MeetingModal({ meeting, committees, onClose, onSave }: { meeting?: Meeting | null; committees: CommitteeRef[]; onClose: () => void; onSave: () => void }) {
  const [title, setTitle] = useState(meeting?.title || "");
  const [date, setDate] = useState(meeting?.date ? new Date(meeting.date).toISOString().slice(0, 16) : "");
  const [endDate, setEndDate] = useState(meeting?.endDate ? new Date(meeting.endDate).toISOString().slice(0, 16) : "");
  const [location, setLocation] = useState(meeting?.location || "");
  const [committee, setCommittee] = useState(meeting?.committee?._id || "");
  const [agenda, setAgenda] = useState(meeting?.agenda || "");
  const [status, setStatus] = useState<Status>(meeting?.status || "Scheduled");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !committee) return addToast("Title, date, and committee are required", "error");
    setLoading(true);
    try {
      const payload = { title, date, endDate, location, committee, agenda, status };
      if (meeting) await axios.put(`${API}/meetings/${meeting._id}`, payload, { headers: authHeader() });
      else await axios.post(`${API}/meetings`, payload, { headers: authHeader() });
      addToast(`Meeting ${meeting ? "updated" : "scheduled"}`, "success");
      onSave(); onClose();
    } catch (e: any) { addToast(e.response?.data?.message || "Failed to save", "error"); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full bg-black/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold">{meeting ? "Edit Meeting" : "Schedule Meeting"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground">Title</label>
            <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-muted-foreground">Start Time</label>
              <input type="datetime-local" className={inputCls} value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-muted-foreground">End Time</label>
              <input type="datetime-local" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-muted-foreground">Committee</label>
              <select className={cn(inputCls, "bg-slate-900 text-white border border-white/20")} value={committee} onChange={e => setCommittee(e.target.value)} required disabled={!!meeting}>
                <option value="" className="bg-slate-900 text-white">Select Committee</option>
                {committees.map(c => <option key={c._id} value={c._id} className="bg-slate-900 text-white">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-muted-foreground">Status</label>
              <select className={cn(inputCls, "bg-slate-900 text-white border border-white/20")} value={status} onChange={e => setStatus(e.target.value as Status)}>
                {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
              </select>
            </div>

          </div>
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground">Location / Link</label>
            <input className={inputCls} value={location} onChange={e => setLocation(e.target.value)} placeholder="Room 101 or Zoom Link" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground">Agenda</label>
            <textarea className={cn(inputCls, "resize-none")} rows={3} value={agenda} onChange={e => setAgenda(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-500 text-white flex gap-2 items-center">
              {loading && <Loader2 size={14} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function MeetingsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [committees, setCommittees] = useState<CommitteeRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Meeting | null>(null);
  const { addToast } = useToastStore();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([
        axios.get(`${API}/meetings`, { headers: authHeader() }),
        axios.get(`${API}/committees`, { headers: authHeader() })
      ]);
      setMeetings(mRes.data.data);
      setCommittees(cRes.data.data);
    } catch (e) { addToast("Failed to fetch meetings", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meeting?")) return;
    try {
      await axios.delete(`${API}/meetings/${id}`, { headers: authHeader() });
      addToast("Meeting deleted", "success");
      fetchAll();
    } catch (e) { addToast("Delete failed", "error"); }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">Meetings Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin ? "Schedule, track attendance, and manage meeting minutes." : "View upcoming scheduled meetings, agenda topics, and locations."}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal("create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-all">
            <Plus size={16} /> Schedule Meeting
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground"><Calendar size={32} className="mb-2"/>No meetings</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-black/5 dark:bg-white/3">
                  <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Meeting Info</th>
                  <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Schedule</th>
                  <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status & Attendance</th>
                  <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {meetings.map((m, i) => (
                  <motion.tr key={m._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-white/5">
                    <td className="py-4 px-5">
                      <p className="font-semibold text-sm">{m.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Users size={11}/>{m.committee?.name}</p>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-sm font-medium"><Calendar size={13} className="text-indigo-400"/> {new Date(m.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1"><Clock size={11}/> {new Date(m.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border", statusStyle[m.status])}>{m.status}</span>
                      <p className="text-[10px] text-muted-foreground mt-1.5">Attending: {m.attendance.filter(a => a.status === 'Present').length} / {m.attendance.length}</p>
                    </td>
                    <td className="py-4 px-5">
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <button onClick={() => { setSelected(m); setModal("edit"); }} className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-blue-400" title="Edit"><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(m._id)} className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-rose-400" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">View Only</span>
                      )}
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <MeetingModal meeting={modal === "edit" ? selected : null} committees={committees} onClose={() => { setModal(null); setSelected(null); }} onSave={fetchAll} />
        )}
      </AnimatePresence>
    </div>
  );
}
