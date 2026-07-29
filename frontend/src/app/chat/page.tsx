"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, MessageSquare, Users, Loader2, Sparkles, Hash, AlertCircle, Info
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

interface UserRef { _id: string; name: string; email: string; role: string; }
interface Message { _id: string; text: string; sender: UserRef; createdAt: string; }
interface Room { id: string; name: string; isCommittee: boolean; }

export default function ChatPage() {
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await axios.get(`${API}/committees`, { headers: authHeader() });
      const committeesData = res.data.data || [];

      let formattedRooms: Room[] = [];

      if (user?.role === "member") {
        // Staff Member: Communicate with Staff Head & Committee Members
        const userComm = committeesData[0] || { _id: "comm_gen", name: "Finance & Audit Committee" };
        formattedRooms = [
          { id: `head_direct_${userComm._id}`, name: "💬 Committee Head Direct Chat", isCommittee: false },
          { id: userComm._id, name: `🛡️ ${userComm.name}`, isCommittee: true },
        ];
      } else if (user?.role === "committee_head") {
        // Committee Head: Communicate with Staff Members & Admin
        const myComm = committeesData[0] || { _id: "comm_head", name: "My Committee Workspace" };
        formattedRooms = [
          { id: myComm._id, name: `🛡️ ${myComm.name}`, isCommittee: true },
          { id: `members_channel_${myComm._id}`, name: "👥 Committee Members Channel", isCommittee: false },
        ];
      } else {
        // Super Admin: Access all workspace channels
        const allComms = committeesData.map((c: any) => ({
          id: c._id,
          name: c.name,
          isCommittee: true
        }));
        formattedRooms = [
          { id: "general", name: "General Workspace", isCommittee: false },
          ...allComms
        ];
      }

      setRooms(formattedRooms);
      if (formattedRooms.length > 0) {
        setActiveRoom(formattedRooms[0]);
      }
    } catch (e) { addToast("Failed to fetch chat rooms", "error"); }
    finally { setLoadingRooms(false); }
  };

  useEffect(() => { fetchRooms(); }, [user]);


  // Room joining & fetching message history
  useEffect(() => {
    if (!activeRoom || !socket) return;

    socket.emit("join_room", activeRoom.id);
    
    // Fetch persistent message history
    const fetchHistory = async () => {
      setLoadingMessages(true);
      try {
        const res = await axios.get(`${API}/chat/${activeRoom.id}`, { headers: authHeader() });
        setMessages(res.data.data);
      } catch (e) { console.error("Error loading chat history", e); }
      finally { setLoadingMessages(false); }
    };

    fetchHistory();

    return () => {
      socket.emit("leave_room", activeRoom.id);
    };
  }, [activeRoom, socket]);

  // Listen for real-time incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !activeRoom) return;

    socket.emit("send_message", {
      committeeId: activeRoom.isCommittee ? activeRoom.id : null,
      text: inputText
    });

    setInputText("");
  };

  const inputCls = "w-full bg-black/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder:text-muted-foreground/60";

  return (
    <div className="flex h-[80vh] gap-6 overflow-hidden pb-4">
      {/* Rooms Sidebar */}
      <div className="w-80 glass-card p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Workspace Rooms</h2>
              <p className="text-[10px] text-muted-foreground">Select a channel to chat</p>
            </div>
          </div>

          {loadingRooms ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-[50vh]">
              {rooms.map(room => {
                const isActive = activeRoom?.id === room.id;
                return (
                  <button key={room.id} onClick={() => setActiveRoom(room)}
                    className={cn("w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all", 
                      isActive ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-muted-foreground hover:bg-white/5 hover:text-white")}>
                    <span className="flex items-center gap-2">
                      {room.isCommittee ? <Hash size={14} className="opacity-60" /> : <Users size={14} className="opacity-60" />}
                      {room.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User active footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || "?"}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block leading-none">{user?.name}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">{user?.role}</span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {onlineUsers.length} Online
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card flex flex-col justify-between overflow-hidden">
        {activeRoom ? (
          <>
            {/* Active Room Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{activeRoom.name}</span>
                <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full font-semibold">
                  {activeRoom.isCommittee ? "Committee Room" : "Public channel"}
                </span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin bg-black/5">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                  <span className="text-xs text-muted-foreground">Loading chat history...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center text-muted-foreground">
                  <MessageSquare size={28} className="stroke-[1.5] text-indigo-500/40" />
                  <span className="text-xs font-medium">No messages in this room yet</span>
                  <span className="text-[10px] max-w-xs text-muted-foreground/60">Be the first to drop a message! Chats are persistent and secured.</span>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = user && msg.sender._id === user._id;
                  const isOnline = onlineUsers.includes(msg.sender._id);

                  return (
                    <div key={msg._id || idx} className={cn("flex items-start gap-2.5 max-w-[80%]", isOwn ? "ml-auto flex-row-reverse" : "mr-auto")}>
                      <div className="relative shrink-0">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold shadow-md">
                          {msg.sender.name?.substring(0, 2).toUpperCase() || "?"}
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-[#08091a]" />
                        )}
                      </div>
                      
                      <div>
                        <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground mb-1", isOwn && "justify-end")}>
                          <span className="text-white">{msg.sender.name}</span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div className={cn("px-4 py-2.5 rounded-2xl text-xs leading-normal shadow-sm", 
                          isOwn ? "bg-indigo-500 text-white rounded-tr-none" : "bg-black/10 dark:bg-white/5 text-slate-200 border border-white/5 rounded-tl-none")}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-white/10 flex gap-3 shrink-0">
              <input className={inputCls} placeholder={`Message #${activeRoom.name}...`} value={inputText} onChange={e => setInputText(e.target.value)} required />
              <button type="submit"
                className="p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all shrink-0">
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center text-muted-foreground">
            <MessageSquare size={32} />
            <p className="font-semibold text-sm">Select a chat channel</p>
          </div>
        )}
      </div>
    </div>
  );
}
