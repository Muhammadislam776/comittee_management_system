"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, Plus, Search, Edit2, Trash2, Eye, X, Check,
  ChevronLeft, ChevronRight, Loader2, Award, Info,
  AlertTriangle, Filter, Tag, Shield,
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const CATEGORIES = ["Executive","Finance","HR","Marketing","Technical","Operations","Legal","Other"];
const STATUSES = ["Active","Inactive","Dissolved"] as const;

type Status = typeof STATUSES[number];

interface UserRef { _id: string; name: string; email: string; role: string; }
interface Committee {
  _id: string; name: string; description: string;
  category: string; head?: UserRef; members: UserRef[];
  status: Status; createdAt: string;
}

// ... existing helper components ...


const statusStyle: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Inactive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Dissolved: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};
const statusDot: Record<string, string> = {
  Active: "bg-emerald-400 animate-pulse",
  Inactive: "bg-amber-400",
  Dissolved: "bg-rose-400",
};

const token = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

// ─── Reusable Field ────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
}

// ─── Input / Textarea / Select shared styles ───────────────────────────────
const inputCls = "w-full bg-black/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-muted-foreground/50";

// ─── Committee Form (shared for create & edit) ─────────────────────────────
function CommitteeForm({
  initial, users, onSubmit, onClose, submitting,
}: {
  initial?: Partial<Committee> & { headId?: string; memberIds?: string[] };
  users: UserRef[];
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Other");
  const [headId, setHeadId] = useState(initial?.headId ?? "");
  const [memberIds, setMemberIds] = useState<string[]>(initial?.memberIds ?? []);
  const [status, setStatus] = useState<Status>((initial?.status as Status) ?? "Active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = (id: string) =>
    setMemberIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 3) e.name = "Min 3 characters";
    if (desc.length > 500) e.desc = "Max 500 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), description: desc, category, head: headId || null, members: memberIds, status });
  };

  return (
    <form onSubmit={submit} className="space-y-4 mt-4">
      <Field label="Committee Name" error={errors.name}>
        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Finance Committee" />
      </Field>

      <Field label="Description" error={errors.desc}>
        <textarea className={cn(inputCls, "resize-none")} rows={3} value={desc}
          onChange={e => setDesc(e.target.value)} placeholder="Brief objective of this committee..." />
        <p className="text-[10px] text-muted-foreground text-right">{desc.length}/500</p>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select className={cn(inputCls, "bg-slate-900 text-white border border-white/20")} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={cn(inputCls, "bg-slate-900 text-white border border-white/20")} value={status} onChange={e => setStatus(e.target.value as Status)}>
            {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Committee Head">
        <select className={cn(inputCls, "bg-slate-900 text-white border border-white/20")} value={headId} onChange={e => setHeadId(e.target.value)}>
          <option value="" className="bg-slate-900 text-white">— No head assigned —</option>
          {users.map(u => <option key={u._id} value={u._id} className="bg-slate-900 text-white">{u.name} ({u.role})</option>)}
        </select>
      </Field>


      <Field label={`Members (${memberIds.length} selected)`}>
        <div className="border border-white/10 rounded-xl p-2 max-h-40 overflow-y-auto grid grid-cols-2 gap-1.5 bg-black/5 dark:bg-white/3">
          {users.map(u => {
            const sel = memberIds.includes(u._id);
            return (
              <div key={u._id} onClick={() => toggle(u._id)}
                className={cn("flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-[12px] transition-all border",
                  sel ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "border-transparent text-muted-foreground hover:bg-white/5")}>
                <span className="truncate font-medium">{u.name}</span>
                {sel && <Check size={12} className="text-indigo-400 flex-shrink-0" />}
              </div>
            );
          })}
          {!users.length && <p className="col-span-2 text-center text-xs text-muted-foreground py-3">No users found</p>}
        </div>
      </Field>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {initial?._id ? "Update Committee" : "Create Committee"}
        </button>
      </div>
    </form>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="glass-card w-full max-w-lg max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onClose, loading }: { name: string; onConfirm: () => void; onClose: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-sm p-6 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
          <AlertTriangle size={22} className="text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Delete Committee?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">"{name}"</span> will be permanently deleted. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
            {loading && <Loader2 size={14} className="animate-spin" />}Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function CommitteesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [committees, setCommittees] = useState<Committee[]>([]);
  const [users, setUsers] = useState<UserRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Committee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToastStore();


  const fetchCommittees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/committees`, {
        params: { search, page, limit: 8, ...(statusFilter && { status: statusFilter }) },
        headers: authHeader(),
      });
      setCommittees(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch { addToast("Failed to fetch committees", "error"); }
    finally { setLoading(false); }
  }, [search, page, statusFilter]);

  useEffect(() => { fetchCommittees(); }, [fetchCommittees]);
  useEffect(() => { axios.get(`${API}/auth/users`, { headers: authHeader() }).then(r => setUsers(r.data.data)).catch(() => {}); }, []);

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleCreate = async (data: any) => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/committees`, data, { headers: authHeader() });
      addToast("Committee created!", "success");
      closeModal(); fetchCommittees();
    } catch (e: any) { addToast(e.response?.data?.message || "Create failed", "error"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (data: any) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/committees/${selected._id}`, data, { headers: authHeader() });
      addToast("Committee updated!", "success");
      closeModal(); fetchCommittees();
    } catch (e: any) { addToast(e.response?.data?.message || "Update failed", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API}/committees/${selected._id}`, { headers: authHeader() });
      addToast("Committee deleted", "success");
      closeModal(); fetchCommittees();
    } catch (e: any) { addToast(e.response?.data?.message || "Delete failed", "error"); }
    finally { setSubmitting(false); }
  };

  const openEdit = (c: Committee) => {
    setSelected(c);
    setModal("edit");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">Committee Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin ? "Manage committees, members, and heads across your organization." : "View active committees and member rosters."}
          </p>
        </div>
        {isAdmin && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setModal("create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all">
            <Plus size={16} /> Create Committee
          </motion.button>
        )}
      </div>


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search committees…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-3 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="" className="bg-slate-900 text-white">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
          </select>

        </div>
        <span className="self-center text-sm text-muted-foreground ml-auto">
          <span className="font-semibold text-foreground">{total}</span> total
        </span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <span className="text-sm text-muted-foreground font-medium">Loading committees…</span>
          </div>
        ) : committees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Info size={24} className="text-indigo-400" />
            </div>
            <p className="font-semibold text-sm">No committees found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {search ? "Try adjusting your search or filter." : "Create your first committee to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-black/5 dark:bg-white/3">
                  {["Committee", "Category", "Head", "Members", "Status", "Created", "Actions"].map(h => (
                    <th key={h} className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {committees.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }} className="hover:bg-white/3 dark:hover:bg-white/2 group transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-semibold text-sm group-hover:text-indigo-400 transition-colors">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] truncate">{c.description || "—"}</p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400">
                        <Tag size={9} />{c.category || "Other"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {c.head ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {c.head.name[0]}
                          </div>
                          <span className="text-xs font-medium">{c.head.name}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground italic">Unassigned</span>}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <Users size={13} className="text-indigo-400" />{c.members?.length ?? 0}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", statusStyle[c.status])}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[c.status])} />{c.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/committees/${c._id}`}
                          className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400 transition-all" title="View">
                          <Eye size={15} />
                        </Link>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(c)}
                              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-all" title="Edit">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => { setSelected(c); setModal("delete"); }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-white/10 px-5 py-3.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{totalPages}</span></p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("h-8 w-8 rounded-lg text-xs font-semibold transition-all",
                    p === page ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "border border-white/10 text-muted-foreground hover:bg-white/5")}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 text-muted-foreground hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-muted-foreground hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === "create" && (
          <Modal title="Create Committee" onClose={closeModal}>
            <CommitteeForm users={users} onSubmit={handleCreate} onClose={closeModal} submitting={submitting} />
          </Modal>
        )}
        {modal === "edit" && selected && (
          <Modal title="Edit Committee" onClose={closeModal}>
            <CommitteeForm
              initial={{
                ...selected,
                headId: (selected.head as any)?._id ?? "",
                memberIds: selected.members.map((m: any) => m._id ?? m),
              }}
              users={users} onSubmit={handleEdit} onClose={closeModal} submitting={submitting} />
          </Modal>
        )}
        {modal === "delete" && selected && (
          <DeleteModal name={selected.name} onConfirm={handleDelete} onClose={closeModal} loading={submitting} />
        )}
      </AnimatePresence>
    </div>
  );
}
