"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Award, Calendar, CheckSquare, ArrowLeft, Loader2,
  Info, CheckCircle2, Clock, AlertCircle, Tag, Edit2,
  UserPlus, Trash2, X, ChevronRight,
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/utils";

const API = "http://localhost:5000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

interface UserRef { _id: string; name: string; email: string; role: string; }
interface Committee {
  _id: string; name: string; description: string;
  category: string; head?: UserRef; members: UserRef[];
  status: "Active" | "Inactive" | "Dissolved"; createdAt: string;
}
interface Meeting { _id: string; title: string; date: string; agenda: string; minutes?: string; }
interface Task {
  _id: string; description: string; status: "Pending" | "In Progress" | "Completed";
  deadline: string; assignedTo?: UserRef; meeting?: { _id: string; title: string };
}

const statusStyle: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Inactive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Dissolved: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};
const taskStatusStyle: Record<string, string> = {
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Pending: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};
const TaskIcon = ({ status }: { status: string }) => {
  if (status === "Completed") return <CheckCircle2 size={11} />;
  if (status === "In Progress") return <Clock size={11} />;
  return <AlertCircle size={11} />;
};

function Avatar({ name, gradient = "from-indigo-500 to-purple-600", size = "h-9 w-9" }: { name: string; gradient?: string; size?: string }) {
  return (
    <div className={cn(size, "rounded-full bg-gradient-to-tr flex items-center justify-center text-white font-bold text-xs flex-shrink-0", gradient)}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function SectionCard({ title, icon, count, children }: { title: string; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          {icon}{title}
        </h3>
        {count !== undefined && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function AddMemberModal({ committeeId, existingIds, onClose, onAdded }: {
  committeeId: string; existingIds: string[]; onClose: () => void; onAdded: () => void;
}) {
  const [users, setUsers] = useState<UserRef[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    axios.get(`${API}/auth/users`, { headers: authHeader() })
      .then(r => setUsers(r.data.data.filter((u: UserRef) => !existingIds.includes(u._id))))
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await axios.post(`${API}/committees/${committeeId}/members`, { userId: selected }, { headers: authHeader() });
      addToast("Member added!", "success");
      onAdded(); onClose();
    } catch (e: any) { addToast(e.response?.data?.message || "Failed to add member", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-bold">Add Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X size={16} /></button>
        </div>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="w-full bg-black/10 dark:bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:bg-[#0f1120]">
          <option value="">— Select a user —</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
        </select>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={submit} disabled={!selected || loading}
            className="flex-1 py-2 text-sm font-semibold rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading && <Loader2 size={13} className="animate-spin" />}Add
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CommitteeDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addToast } = useToastStore();

  const [committee, setCommittee] = useState<Committee | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, mRes, tRes] = await Promise.all([
        axios.get(`${API}/committees/${id}`, { headers: authHeader() }),
        axios.get(`${API}/meetings/committee/${id}`, { headers: authHeader() }),
        axios.get(`${API}/tasks`, { headers: authHeader() }),
      ]);
      const comm: Committee = cRes.data.data;
      const meet: Meeting[] = mRes.data;
      const meetIds = meet.map(m => m._id);
      setCommittee(comm);
      setMeetings(meet);
      setTasks(tRes.data.filter((t: any) => t.meeting && meetIds.includes(t.meeting._id ?? t.meeting)));
    } catch (e: any) { addToast(e.response?.data?.message || "Failed to load", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchAll(); }, [id]);

  const removeMember = async (userId: string) => {
    try {
      await axios.delete(`${API}/committees/${id}/members/${userId}`, { headers: authHeader() });
      addToast("Member removed", "success");
      fetchAll();
    } catch { addToast("Failed to remove member", "error"); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-3">
      <Loader2 size={36} className="animate-spin text-indigo-500" />
      <span className="text-muted-foreground text-sm">Loading details…</span>
    </div>
  );

  if (!committee) return (
    <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
        <Info size={24} className="text-indigo-400" />
      </div>
      <h3 className="font-bold text-lg">Committee Not Found</h3>
      <p className="text-sm text-muted-foreground">This committee doesn't exist or has been removed.</p>
      <button onClick={() => router.push("/committees")}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">
        <ArrowLeft size={15} /> Back to Directory
      </button>
    </div>
  );

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const completionPct = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.push("/committees")} className="hover:text-foreground transition-colors flex items-center gap-1.5 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />Committees
        </button>
        <ChevronRight size={13} />
        <span className="font-semibold text-foreground truncate">{committee.name}</span>
      </div>

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold">{committee.name}</h1>
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", statusStyle[committee.status])}>
                <span className={cn("h-1.5 w-1.5 rounded-full", committee.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-current")} />
                {committee.status}
              </span>
              {committee.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400">
                  <Tag size={9} />{committee.category}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{committee.description || "No description provided."}</p>
            {/* Stats row */}
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { icon: <Users size={13} className="text-indigo-400" />, label: `${committee.members.length} Members` },
                { icon: <Calendar size={13} className="text-blue-400" />, label: `${meetings.length} Meetings` },
                { icon: <CheckSquare size={13} className="text-purple-400" />, label: `${tasks.length} Tasks` },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  {s.icon}<span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">Established</p>
            <p className="text-sm font-semibold">{new Date(committee.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            <Link href={`/committees/${id}/edit`}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:bg-white/5 transition-colors">
              <Edit2 size={12} />Edit
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Task Completion</span><span className="font-semibold text-foreground">{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Head */}
          <SectionCard title="Committee Head" icon={<Award size={14} className="text-amber-400" />}>
            {committee.head ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <Avatar name={committee.head.name} gradient="from-amber-400 to-orange-500" size="h-10 w-10" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{committee.head.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{committee.head.email}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mt-1 inline-block capitalize">
                    {committee.head.role}
                  </span>
                </div>
              </div>
            ) : <p className="text-xs text-muted-foreground italic text-center py-3">No head assigned</p>}
          </SectionCard>

          {/* Members */}
          <SectionCard title="Members" icon={<Users size={14} className="text-indigo-400" />} count={committee.members.length}>
            <button onClick={() => setAddMemberOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-indigo-500/30 text-xs text-indigo-400 hover:bg-indigo-500/5 transition-colors font-medium">
              <UserPlus size={13} />Add Member
            </button>
            {committee.members.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {committee.members.map(m => (
                  <div key={m._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                    <Avatar name={m.name} size="h-8 w-8" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                    </div>
                    <button onClick={() => removeMember(m._id)}
                      className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-400 transition-all" title="Remove">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground italic text-center py-3">No members yet</p>}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Meetings */}
          <SectionCard title="Meetings" icon={<Calendar size={14} className="text-blue-400" />} count={meetings.length}>
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map(m => (
                  <div key={m._id} className="p-3.5 rounded-xl border border-white/8 bg-white/3 dark:bg-white/2 hover:bg-white/5 transition-colors space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-sm">{m.title}</p>
                      <span className="text-[11px] text-blue-400 font-medium whitespace-nowrap">
                        {new Date(m.date).toLocaleDateString()}
                      </span>
                    </div>
                    {m.agenda && <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">Agenda:</span> {m.agenda}</p>}
                    {m.minutes && (
                      <div className="text-[11px] bg-black/10 dark:bg-white/5 border border-white/8 p-2 rounded-lg text-muted-foreground">
                        <span className="font-semibold text-foreground/80">Minutes:</span> {m.minutes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground italic text-center py-4">No meetings scheduled</p>}
          </SectionCard>

          {/* Tasks */}
          <SectionCard title="Action Tasks" icon={<CheckSquare size={14} className="text-purple-400" />} count={tasks.length}>
            {tasks.length > 0 ? (
              <div className="space-y-2.5">
                {tasks.map(t => (
                  <div key={t._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/8 bg-white/3 dark:bg-white/2 hover:bg-white/5 transition-colors">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{t.description}</p>
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span>Assigned: <span className="text-indigo-400 font-medium">{t.assignedTo?.name || "Unassigned"}</span></span>
                        {t.meeting && <span>• Meeting: <span className="text-foreground/70">{t.meeting.title}</span></span>}
                        {t.deadline && <span>• Due: {new Date(t.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap flex-shrink-0", taskStatusStyle[t.status])}>
                      <TaskIcon status={t.status} />{t.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground italic text-center py-4">No tasks linked to this committee</p>}
          </SectionCard>
        </div>
      </div>

      {addMemberOpen && (
        <AddMemberModal
          committeeId={id}
          existingIds={committee.members.map(m => m._id)}
          onClose={() => setAddMemberOpen(false)}
          onAdded={fetchAll}
        />
      )}
    </div>
  );
}
