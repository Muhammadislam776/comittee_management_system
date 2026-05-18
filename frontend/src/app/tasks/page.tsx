"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Calendar, CheckSquare, X, Check, Loader2, Info, MessageSquare, Paperclip, 
  Trash2, User, Clock, AlertTriangle, ArrowRight, Eye, Send, FileText
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { useSocket } from "@/context/SocketContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Meeting {
  _id: string;
  title: string;
  date: string;
}

interface Comment {
  _id: string;
  text: string;
  user: User;
  createdAt: string;
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: User;
  meeting?: Meeting;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  deadline?: string;
  comments: Comment[];
  attachments: Attachment[];
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drag state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Modal / Detail state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [deadline, setDeadline] = useState("");
  
  // Comments / Attachments Form states
  const [commentText, setCommentText] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const { addToast } = useToastStore();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to fetch tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndMeetings = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const usersRes = await axios.get(`${API}/auth/users`, { headers });
      setUsers(usersRes.data.data);

      const meetingsRes = await axios.get(`${API}/meetings`, { headers });
      setMeetings(meetingsRes.data);
    } catch (err: any) {
      console.error("Failed to load selectors data", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsersAndMeetings();
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask: Task) => {
      setTasks(prev => {
        if (prev.some(t => t._id === newTask._id)) return prev;
        return [newTask, ...prev];
      });
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      
      // Update local inspect modal if open
      setSelectedTask(prev => {
        if (prev && prev._id === updatedTask._id) {
          return updatedTask;
        }
        return prev;
      });
    };

    const handleTaskDeleted = (deletedTaskId: string) => {
      setTasks(prev => prev.filter(t => t._id !== deletedTaskId));
      setSelectedTask(prev => {
        if (prev && prev._id === deletedTaskId) {
          return null;
        }
        return prev;
      });
    };

    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);

    return () => {
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);
    };
  }, [socket]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    setDragOverCol(colName);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: "Pending" | "In Progress" | "Completed") => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
    setDraggingTaskId(null);
    setDragOverCol(null);

    if (!taskId) return;

    // Optimistically update the UI status
    const previousTasks = [...tasks];
    const taskToUpdate = tasks.find(t => t._id === taskId);
    if (!taskToUpdate || taskToUpdate.status === targetStatus) return;

    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: targetStatus } : t));

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/tasks/${taskId}`,
        { status: targetStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast(`Task moved to ${targetStatus}`, "success");
      
      // Update selected task detail view if open
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      setTasks(previousTasks); // Revert state
      addToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !assignedToId) {
      addToast("Please fill in Title, Description, and Assigned User.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/tasks`,
        {
          title,
          description,
          assignedTo: assignedToId,
          meeting: meetingId || undefined,
          priority,
          deadline: deadline || undefined,
          status: "Pending"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast("Task created successfully", "success");
      setTasks([res.data, ...tasks]);
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to create task", "error");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/tasks/${selectedTask._id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTask(res.data.data);
      setCommentText("");
      // Update tasks list state with new comment
      setTasks(tasks.map(t => t._id === selectedTask._id ? res.data.data : t));
      addToast("Comment posted", "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to add comment", "error");
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim() || !attachmentUrl.trim() || !selectedTask) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/tasks/${selectedTask._id}/attachments`,
        { name: attachmentName, url: attachmentUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTask(res.data.data);
      setAttachmentName("");
      setAttachmentUrl("");
      setTasks(tasks.map(t => t._id === selectedTask._id ? res.data.data : t));
      addToast("Attachment added", "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to add attachment", "error");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast("Task deleted successfully", "success");
      setTasks(tasks.filter(t => t._id !== taskId));
      if (selectedTask?._id === taskId) setSelectedTask(null);
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to delete task", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedToId("");
    setMeetingId("");
    setPriority("Medium");
    setDeadline("");
  };

  const columns: ("Pending" | "In Progress" | "Completed")[] = [
    "Pending",
    "In Progress",
    "Completed"
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Task Kanban Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize priorities, schedule tasks, and track statuses in a beautiful Trello workspace.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="flex items-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-yellow-500/20 transition-all font-medium"
        >
          <Plus size={18} className="mr-2" />
          Create Task
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-yellow-500" size={32} />
          <span className="text-muted-foreground text-sm font-medium">Loading Kanban Board...</span>
        </div>
      ) : (
        /* Kanban Board Columns Wrapper */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div
                key={col}
                onDragOver={(e) => handleDragOver(e, col)}
                onDrop={(e) => handleDrop(e, col)}
                className={`flex flex-col max-h-[80vh] bg-slate-900/40 dark:bg-slate-900/20 border rounded-2xl p-4 transition-all duration-300 ${
                  dragOverCol === col
                    ? "border-yellow-500/50 bg-slate-900/70 shadow-lg shadow-yellow-500/5 scale-[1.01]"
                    : "border-slate-800/80"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/85">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      col === "Pending" ? "bg-amber-500 animate-pulse" :
                      col === "In Progress" ? "bg-blue-400" :
                      "bg-emerald-400"
                    }`} />
                    <h3 className="font-bold text-white tracking-wide">{col}</h3>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-md">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards Feed */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[60vh] scrollbar-thin">
                  {colTasks.length > 0 ? (
                    colTasks.map((task, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={task._id}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, task._id)}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 bg-slate-950/80 border border-slate-850 hover:border-slate-750 rounded-xl cursor-grab active:cursor-grabbing hover:bg-slate-950 transition-all shadow-md group relative overflow-hidden"
                        >
                          {/* Custom visual priority indicator pill */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                              task.priority === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                              task.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-slate-500/10 text-slate-400 border border-slate-800"
                            }`}>
                              {task.priority} Priority
                            </span>
                            
                            {/* Attachments / Comments icons */}
                            <div className="flex gap-2 text-slate-500">
                              {task.attachments?.length > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px]">
                                  <Paperclip size={10} />
                                  {task.attachments.length}
                                </span>
                              )}
                              {task.comments?.length > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px]">
                                  <MessageSquare size={10} />
                                  {task.comments.length}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title & Description */}
                          <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors leading-snug">
                            {task.title || task.description}
                          </h4>
                          
                          {task.title && (
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 h-7">
                              {task.description}
                            </p>
                          )}

                          {/* Card Footer: Assignee & Deadline */}
                          <div className="flex justify-between items-center border-t border-slate-900/90 pt-3 mt-3 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-[9px] font-bold shrink-0">
                                {task.assignedTo?.name?.substring(0, 2).toUpperCase() || "?"}
                              </div>
                              <span className="text-[10px] text-muted-foreground truncate font-medium">
                                {task.assignedTo?.name || "N/A"}
                              </span>
                            </div>

                            {task.deadline && (
                              <span className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold shrink-0">
                                <Calendar size={10} />
                                {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-800 rounded-xl text-slate-600 gap-1.5">
                      <Clock size={20} className="stroke-[1.5]" />
                      <span className="text-[11px] font-medium">No tasks in this lane</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-in & Dynamic Modals */}
      <AnimatePresence>
        {/* Create Task Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-lg w-full p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                <h3 className="text-xl font-bold text-white">Create Task Item</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white placeholder:text-slate-600 text-sm"
                    placeholder="Enter task header"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white placeholder:text-slate-600 text-sm resize-none"
                    placeholder="Provide details about the action item..."
                  />
                </div>

                {/* Assign User & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Assignee</label>
                    <select
                      required
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white text-sm"
                    >
                      <option value="" className="bg-slate-950">Select user</option>
                      {users.map(u => (
                        <option key={u.id || u._id} value={u.id || u._id} className="bg-slate-950">
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white text-sm"
                    >
                      <option value="Low" className="bg-slate-950">Low</option>
                      <option value="Medium" className="bg-slate-950">Medium</option>
                      <option value="High" className="bg-slate-950">High</option>
                    </select>
                  </div>
                </div>

                {/* Optional Meeting Assignment & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Link Meeting</label>
                    <select
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white text-sm"
                    >
                      <option value="" className="bg-slate-950">No Meeting (Optional)</option>
                      {meetings.map(m => (
                        <option key={m._id} value={m._id} className="bg-slate-950">
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-900 text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 text-sm font-medium transition-all"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Task Details Trello Card Inspector Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckSquare className="text-yellow-500" size={20} />
                    {selectedTask.title || "Task Action Detail"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">In Column:</span>
                    <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded font-bold text-slate-300">{selectedTask.status}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(selectedTask._id)}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left pane: description, comments */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Description Box */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                    <p className="text-sm text-slate-200 bg-slate-900/30 border border-slate-850 p-3 rounded-xl leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>

                  {/* Add & List Comments */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-blue-400" />
                      Activity Log / Comments
                    </h4>

                    {/* New Comment input */}
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white placeholder:text-slate-600 text-xs"
                      />
                      <button
                        type="submit"
                        className="p-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl shadow-md transition-all shrink-0"
                      >
                        <Send size={14} />
                      </button>
                    </form>

                    {/* Comments Feed */}
                    {selectedTask.comments?.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {selectedTask.comments.map((comment) => (
                          <div key={comment._id} className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {comment.user?.name || "Member"}
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">No activity yet. Leave a comment above!</p>
                    )}
                  </div>
                </div>

                {/* Right Pane: Assigned details & Attachments */}
                <div className="md:col-span-1 space-y-6 border-l border-slate-900/80 pl-0 md:pl-6">
                  {/* Meta Details */}
                  <div className="space-y-4">
                    {/* Assignee info */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assignee</label>
                      <div className="flex items-center gap-2 p-2 bg-slate-900/30 border border-slate-850 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
                          {selectedTask.assignedTo?.name?.substring(0, 2).toUpperCase() || "?"}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-white block leading-none">{selectedTask.assignedTo?.name}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{selectedTask.assignedTo?.role}</span>
                        </div>
                      </div>
                    </div>

                    {/* Priority Info */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</label>
                      <span className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                        selectedTask.priority === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        selectedTask.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-slate-500/10 text-slate-400 border border-slate-800"
                      }`}>
                        {selectedTask.priority}
                      </span>
                    </div>

                    {/* Deadline Info */}
                    {selectedTask.deadline && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Due Date</label>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                          <Clock size={14} className="text-yellow-500" />
                          <span>{new Date(selectedTask.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attachments Section */}
                  <div className="space-y-3 pt-4 border-t border-slate-900/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Paperclip size={14} className="text-purple-400" />
                      Attachments
                    </h4>

                    {/* Upload Mock form */}
                    <form onSubmit={handleAddAttachment} className="space-y-2 bg-slate-900/10 border border-slate-850 p-2.5 rounded-xl">
                      <input
                        type="text"
                        placeholder="File Name (e.g. Agenda.pdf)"
                        required
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none text-[11px] text-white"
                      />
                      <input
                        type="text"
                        placeholder="Link / URL (http://...)"
                        required
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none text-[11px] text-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-all"
                      >
                        Attach Link
                      </button>
                    </form>

                    {/* Attachments Feed */}
                    {selectedTask.attachments?.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedTask.attachments.map((file) => (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={file._id}
                            className="flex items-center gap-2 p-2 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-slate-850 text-slate-300 hover:text-white transition-colors text-[10px] truncate"
                          >
                            <FileText size={12} className="text-purple-400 shrink-0" />
                            <span className="truncate font-semibold">{file.name}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">No attachments yet.</p>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
