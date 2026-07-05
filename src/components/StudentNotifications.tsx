import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, ShieldAlert, Sparkles, UserCheck, Eye, BookmarkCheck } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { NotificationItem } from "../types";

interface StudentNotificationsProps {
  initialNotifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export default function StudentNotifications({ initialNotifications, onMarkRead, onClearAll }: StudentNotificationsProps) {
  const { showToast } = useToast();

  // Local notifications copy to simulate reads
  const [notifs, setNotifs] = useState<NotificationItem[]>(initialNotifications);

  // Sync state with parent prop updates
  useEffect(() => {
    setNotifs(initialNotifications);
  }, [initialNotifications]);

  // Filters state
  const [senderFilter, setSenderFilter] = useState<"All" | "Faculty" | "Administrator">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Unread" | "Read">("All");

  const handleMarkAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    onMarkRead(id);
    showToast("Notification marked as read.", "success");
  };

  const handleClear = () => {
    setNotifs([]);
    onClearAll();
    showToast("All notifications cleared.", "info");
  };

  // Filter logic: Only receive from Administrator or Faculty (guaranteed because we default all mock senders to those or filter them)
  const filteredNotifs = notifs.filter((n) => {
    // 1. Enforce sender filter
    const sender = n.sender || "Administrator"; // Fallback to Admin if undefined
    if (senderFilter !== "All" && sender !== senderFilter) {
      return false;
    }

    // 2. Enforce status filter
    if (statusFilter === "Unread" && n.read) return false;
    if (statusFilter === "Read" && !n.read) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="notifications-spec-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Official Circulars & Bulletins</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Read urgent messages broadcasted exclusively by college faculty instructors and administrators.</p>
        </div>
        
        {filteredNotifs.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold border border-slate-200 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Filter Options Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Filter Channels</h4>

            {/* Sender Origin Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Sender Origin</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: "All", label: "All Senders" },
                  { value: "Faculty", label: "Faculty Only" },
                  { value: "Administrator", label: "Administrators Only" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSenderFilter(option.value as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${senderFilter === option.value ? "bg-indigo-50 text-indigo-700 font-extrabold" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Read/Unread Filter */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Read Status</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: "All", label: "All Statuses" },
                  { value: "Unread", label: "Unread Alerts" },
                  { value: "Read", label: "Archived Read" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === option.value ? "bg-indigo-50 text-indigo-700 font-extrabold" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Filtered Notifications list */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 border-b border-slate-50 pb-3 flex justify-between items-center">
              <span>Inbox Feed</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">{filteredNotifs.length} shown</span>
            </h4>

            <div className="space-y-3">
              {filteredNotifs.map((n) => {
                const isUnread = !n.read;
                const sender = n.sender || "Administrator";
                
                return (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all flex gap-4 items-start ${isUnread ? "bg-indigo-50/15 border-indigo-100" : "bg-slate-50/20 border-slate-100 opacity-80"}`}
                  >
                    {/* Visual dot */}
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${isUnread ? "bg-indigo-600" : "bg-slate-300"}`} />

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h5 className={`text-xs font-extrabold ${isUnread ? "text-slate-900" : "text-slate-700"}`}>
                            {n.title}
                          </h5>
                          {/* Sender details badge */}
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5 uppercase tracking-wide flex items-center gap-1">
                            {sender === "Administrator" ? <ShieldAlert size={10} /> : <UserCheck size={10} />}
                            Broadcasted by: {sender}
                          </p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                          {new Date(n.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed leading-normal">{n.message}</p>
                      
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-1 cursor-pointer"
                        >
                          <BookmarkCheck size={12} /> Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredNotifs.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600">Your notification tray is clean!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No notifications match your chosen filters.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
