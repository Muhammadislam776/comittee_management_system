"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Download, Eye, CheckCircle2, XCircle, Clock, Trash2,
  Plus, History, ChevronRight, X, ExternalLink, Shield, Loader2, Sparkles, Filter, AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

interface UserRef { _id: string; name: string; email: string; role: string; }
interface CommitteeRef { _id: string; name: string; }
interface DocVersion { version: number; url: string; fileName: string; uploadedBy?: { name: string; email: string; } | null; createdAt: string; }
interface DocumentItem {
  _id: string;
  title: string;
  description: string;
  committee: CommitteeRef | null;
  createdBy?: UserRef | null;
  currentVersion: number;
  versions: DocVersion[];
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: UserRef | null;
  approvalDate: string | null;
  updatedAt: string;
}

export default function DocumentsPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [committees, setCommittees] = useState<CommitteeRef[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modals / Selection States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [committeeId, setCommitteeId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = selectedCommittee !== "all" 
        ? `${API}/documents?committee=${selectedCommittee}` 
        : `${API}/documents`;
      const res = await axios.get(url, { headers: authHeader() });
      setDocuments(res.data.data);
    } catch (e) {
      addToast("Failed to fetch documents", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommittees = async () => {
    try {
      const res = await axios.get(`${API}/committees`, { headers: authHeader() });
      setCommittees(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCommittee]);

  useEffect(() => {
    fetchCommittees();
  }, []);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) {
      addToast("Please provide a title and select a file", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (committeeId) formData.append("committee", committeeId);
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${API}/documents`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data"
        }
      });
      setDocuments(prev => [res.data.data, ...prev]);
      addToast("Document uploaded successfully!", "success");
      setIsUploadModalOpen(false);
      setTitle("");
      setDescription("");
      setCommitteeId("");
      setSelectedFile(null);
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to upload document", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionFile || !selectedDoc) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", versionFile);

    try {
      const res = await axios.post(`${API}/documents/${selectedDoc._id}/version`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data"
        }
      });
      setDocuments(prev => prev.map(d => d._id === selectedDoc._id ? res.data.data : d));
      addToast(`Uploaded version ${res.data.data.currentVersion} successfully!`, "success");
      setIsVersionModalOpen(false);
      setVersionFile(null);
    } catch (err: any) {
      addToast("Failed to upload new version", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleApproval = async (docId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await axios.put(`${API}/documents/${docId}/approval`, { status }, { headers: authHeader() });
      setDocuments(prev => prev.map(d => d._id === docId ? res.data.data : d));
      addToast(`Document marked as ${status}`, "success");
    } catch (err: any) {
      addToast("Failed to process approval", "error");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await axios.delete(`${API}/documents/${docId}`, { headers: authHeader() });
      setDocuments(prev => prev.filter(d => d._id !== docId));
      addToast("Document deleted", "success");
    } catch (err) {
      addToast("Failed to delete document", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> Approved</span>;
      case "Rejected":
        return <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full"><Clock size={12} /> Pending</span>;
    }
  };

  const inputCls = "w-full bg-black/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder:text-muted-foreground/60";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText size={20} />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white">Document Management</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Upload, review, and tracks version records securely</p>
        </div>

        <button onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-xs font-bold">
          <Plus size={16} /> Add Document
        </button>
      </div>

      {/* Filters & Active Stats */}
      <div className="flex flex-wrap items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Filter by Committee:</span>
          <select value={selectedCommittee} onChange={e => setSelectedCommittee(e.target.value)}
            className="bg-black/20 text-xs font-bold text-white border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="all">All Channels</option>
            {committees.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
          <span>Total Docs: <strong className="text-white">{documents.length}</strong></span>
          <span>Pending Approval: <strong className="text-amber-400">{documents.filter(d => d.approvalStatus === 'Pending').length}</strong></span>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
      ) : documents.length === 0 ? (
        <div className="glass-card text-center py-16 max-w-lg mx-auto flex flex-col items-center gap-3">
          <FileText size={48} className="text-indigo-500/30" />
          <h2 className="font-bold text-base text-white">No documents uploaded</h2>
          <p className="text-xs text-muted-foreground max-w-xs">Upload your PDFs, proposals, or reports to tracks approvals and version control history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const latestVer = doc.versions[doc.versions.length - 1];
            const isUploader = user && doc.createdBy && doc.createdBy._id === user._id;
            const canApprove = user && ['admin', 'Committee Head', 'head'].includes(user.role);

            return (
              <motion.div key={doc._id} layout
                className="glass-card p-5 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 transition-all border border-white/5 hover:border-white/10">
                
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      v{doc.currentVersion}
                    </span>
                    {getStatusBadge(doc.approvalStatus)}
                  </div>

                  <h3 className="font-bold text-sm text-white line-clamp-1">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 h-8">{doc.description || "No description provided."}</p>
                  
                  {doc.committee && (
                    <span className="inline-block mt-3 text-[10px] bg-white/5 border border-white/10 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                      #{doc.committee.name}
                    </span>
                  )}

                  <div className="border-t border-white/5 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Uploaded by:</span>
                      <span className="font-semibold text-white">{doc.createdBy?.name || "Deleted User"}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Last Modified:</span>
                      <span className="font-semibold text-white">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Operations Actions */}
                <div className="border-t border-white/5 mt-4 pt-4 flex flex-col gap-2 shrink-0">
                  <div className="flex justify-between gap-2">
                    {/* View Preview (primarily for PDFs) */}
                    <button onClick={() => { setSelectedDoc(doc); setIsPreviewModalOpen(true); }}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold transition-all">
                      <Eye size={12} /> Preview
                    </button>
                    
                    {/* Direct File Download */}
                    <a href={latestVer?.url} target="_blank" rel="noopener noreferrer" download
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold transition-all">
                      <Download size={12} /> Download
                    </a>
                  </div>

                  <div className="flex gap-2">
                    {/* Version History Trigger */}
                    <button onClick={() => { setSelectedDoc(doc); setIsVersionModalOpen(true); }}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 rounded-lg text-[10px] font-bold border border-white/5 transition-all">
                      <History size={12} /> Versions ({doc.versions.length})
                    </button>

                    {/* Delete button (Author or Admin) */}
                    {(isUploader || user?.role === 'admin') && (
                      <button onClick={() => handleDelete(doc._id)}
                        className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Document Approval Actions for admin/heads */}
                  {canApprove && doc.approvalStatus === 'Pending' && (
                    <div className="flex items-center gap-2 border-t border-white/5 pt-3 mt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1"><Shield size={10} /> Approval:</span>
                      <button onClick={() => handleApproval(doc._id, 'Approved')}
                        className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-[9px] font-extrabold transition-all uppercase">
                        Approve
                      </button>
                      <button onClick={() => handleApproval(doc._id, 'Rejected')}
                        className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-[9px] font-extrabold transition-all uppercase">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE DOCUMENT MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card p-6 relative border border-white/10">
              <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white"><X size={18} /></button>
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <Upload size={18} className="text-indigo-400" />
                <h2 className="font-extrabold text-sm text-white">Add New Document</h2>
              </div>

              <form onSubmit={handleCreateDocument} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Title *</label>
                  <input className={inputCls} placeholder="e.g. Q4 Budget Proposal" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Description</label>
                  <textarea className={inputCls} placeholder="Brief summary of document content..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Assign to Committee (Optional)</label>
                  <select value={committeeId} onChange={e => setCommitteeId(e.target.value)} className={inputCls}>
                    <option value="">Global Workspace (No specific committee)</option>
                    {committees.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Select File (PDF, DOCX, etc.) *</label>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-indigo-500/40 transition-all bg-black/10 cursor-pointer relative">
                    <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} required
                      className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="mx-auto text-indigo-500/60 mb-2 animate-bounce" size={24} />
                    <span className="text-xs font-semibold text-white block">
                      {selectedFile ? selectedFile.name : "Drag & drop or browse your local file"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 mt-1 block">Maximum upload file size: 10MB</span>
                  </div>
                </div>

                <button type="submit" disabled={uploading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 text-xs transition-all flex items-center justify-center gap-2">
                  {uploading ? <Loader2 className="animate-spin" size={14} /> : "Upload Document"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERSION HISTORY MODAL */}
      <AnimatePresence>
        {isVersionModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card p-6 relative border border-white/10">
              <button onClick={() => setIsVersionModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white"><X size={18} /></button>
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <History size={18} className="text-indigo-400" />
                <div>
                  <h2 className="font-extrabold text-sm text-white">Version Control History</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{selectedDoc.title}</p>
                </div>
              </div>

              {/* Version History Log (Timeline) */}
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                {selectedDoc.versions.map((ver, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                        {ver.version}
                      </div>
                      {idx !== selectedDoc.versions.length - 1 && <div className="w-[1px] bg-white/10 grow mt-2 min-h-[20px]" />}
                    </div>
                    
                    <div className="grow bg-white/5 rounded-xl p-3 border border-white/5 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block truncate max-w-[200px]">{ver.fileName}</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">Uploaded by {ver.uploadedBy?.name || "Deleted User"} • {new Date(ver.createdAt).toLocaleString()}</span>
                      </div>
                      <a href={ver.url} target="_blank" rel="noopener noreferrer" download
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all shrink-0">
                        <Download size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload New Version form */}
              <form onSubmit={handleUploadNewVersion} className="border-t border-white/5 pt-4 mt-4 space-y-3">
                <h3 className="text-xs font-bold text-white">Upload New Version (V{selectedDoc.currentVersion + 1})</h3>
                <div className="flex gap-2">
                  <div className="relative grow">
                    <input type="file" onChange={e => setVersionFile(e.target.files?.[0] || null)} required
                      className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="bg-black/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-muted-foreground text-center truncate cursor-pointer hover:border-white/20">
                      {versionFile ? versionFile.name : "Select next file version..."}
                    </div>
                  </div>
                  <button type="submit" disabled={uploading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all">
                    {uploading ? <Loader2 className="animate-spin" size={12} /> : <>Upload</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE FILE PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl h-[85vh] glass-card flex flex-col overflow-hidden relative border border-white/10">
              
              {/* Preview Header */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <FileText size={16} className="text-indigo-400" />
                    {selectedDoc.title}
                  </h2>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Version {selectedDoc.currentVersion} • Status: {selectedDoc.approvalStatus}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <a href={selectedDoc.versions[selectedDoc.versions.length - 1]?.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                    <ExternalLink size={12} /> Open in New Tab
                  </a>
                  <button onClick={() => setIsPreviewModalOpen(false)} className="text-muted-foreground hover:text-white"><X size={18} /></button>
                </div>
              </div>

              {/* Preview Iframe Container */}
              <div className="flex-1 bg-slate-950/20 relative">
                {selectedDoc.versions[selectedDoc.versions.length - 1]?.url ? (
                  <iframe src={selectedDoc.versions[selectedDoc.versions.length - 1]?.url}
                    className="w-full h-full border-none bg-slate-900/40"
                    title={selectedDoc.title} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <AlertCircle size={28} />
                    <span className="text-xs">Unable to load file URL preview</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
