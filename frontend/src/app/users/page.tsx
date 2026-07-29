"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, Search, Filter, Shield, Mail, Building, Briefcase,
  Edit2, Trash2, X, Check, Loader2, AlertTriangle, ChevronLeft, ChevronRight
} from "lucide-react";
import axios from "axios";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "committee_head" | "member";
  department?: string;
  designation?: string;
  phone?: string;
  createdAt: string;
}

const ROLES = [
  { value: "admin", label: "Super Admin", badge: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { value: "committee_head", label: "Committee Head (Staff)", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "member", label: "Committee Member", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToastStore();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "committee_head" | "member">("member");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  const authHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/auth/users`, { headers: authHeader() });
      setUsers(res.data.data || []);
    } catch {
      addToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("member");
    setDepartment("General");
    setDesignation("Committee Member");
    setModal("create");
  };

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setDepartment(u.department || "General");
    setDesignation(u.designation || "Committee Member");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === "create") {
        await axios.post(
          `${API}/auth/register`,
          { name, email, password: password || "password123", role, department, designation },
          { headers: authHeader() }
        );
        addToast("User created successfully!", "success");
      } else if (modal === "edit" && selectedUser) {
        await axios.put(
          `${API}/auth/users/${selectedUser._id}`,
          { name, email, role, department, designation },
          { headers: authHeader() }
        );
        addToast("User updated successfully!", "success");
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      addToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API}/auth/users/${selectedUser._id}`, { headers: authHeader() });
      addToast("User deleted successfully", "success");
      closeModal();
      fetchUsers();
    } catch (err: any) {
      addToast(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage system users, assign roles, departments, and permissions across the platform.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all"
        >
          <UserPlus size={16} /> Add User
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2.5 px-3 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="" className="bg-slate-900 text-white">All Roles</option>
            <option value="admin" className="bg-slate-900 text-white">Super Admin</option>
            <option value="committee_head" className="bg-slate-900 text-white">Staff / Committee Head</option>
            <option value="member" className="bg-slate-900 text-white">Committee Member</option>
          </select>
        </div>
      </div>

      {/* User Table Card */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading user records…
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Users size={32} className="mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No Users Found</p>
            <p className="text-xs">Try clearing search or filters to see all team members.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const roleObj = ROLES.find((r) => r.value === u.role) || ROLES[2];
                  return (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground leading-tight">{u.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail size={12} /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", roleObj.badge)}>
                          <Shield size={11} className="mr-1" /> {roleObj.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Building size={12} /> {u.department || "General"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={12} /> {u.designation || "Member"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-indigo-500/10 hover:text-indigo-400 text-muted-foreground transition-all"
                            title="Edit User"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedUser(u); setModal("delete"); }}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Shell */}
      <AnimatePresence>
        {(modal === "create" || modal === "edit") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-lg font-bold">{modal === "create" ? "Add New User" : "Edit User Details"}</h2>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="john@example.com"
                  />
                </div>

                {modal === "create" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Initial Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="Leave blank for 'password123'"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">System Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="admin" className="bg-slate-900 text-white">Super Admin</option>
                      <option value="committee_head" className="bg-slate-900 text-white">Staff / Head</option>
                      <option value="member" className="bg-slate-900 text-white">Member</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="Finance, IT, etc."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Senior Officer / Lead"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center gap-2"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {modal === "create" ? "Add User" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {modal === "delete" && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-sm p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle size={22} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold">Delete User?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold text-foreground">"{selectedUser.name}"</span> will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-2 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5">Cancel</button>
                <button onClick={handleDelete} disabled={submitting} className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />} Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
