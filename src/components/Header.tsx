"use client";

import { useEffect, useState, useRef } from 'react';
import { Bell, ChevronRight, Home, Menu, LogOut, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/SidebarContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Header() {
  const { setIsMobileOpen } = useSidebar();
  const [userName, setUserName] = useState("Admin");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : "";
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("admin_user");
    if (u) {
      try {
        const parsed = JSON.parse(u);
        if (parsed?.name) setUserName(parsed.name);
      } catch {}
    }
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      const removed = notifications.find(n => n.id === id);
      if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const deleteAllNotifications = async () => {
    if (!confirm("Delete all notifications?")) return;
    try {
      await fetch(`${API_BASE}/notifications/delete-all`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.replace("/login");
  };

  const getNotificationRoute = (type: string): string => {
    const t = type?.toLowerCase() || "";
    if (t.includes("appointment")) return "/appointments";
    if (t.includes("contact"))     return "/contact";
    if (t.includes("doctor"))      return "/doctors";
    if (t.includes("slot"))        return "/slots";
    if (t.includes("department"))  return "/departments";
    return "/";
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) await markAsRead(notification.id);
    setShowDropdown(false);
    router.push(getNotificationRoute(notification.type));
  };

  return (
    <header
      className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40"
      style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E2EAF4",
        borderLeft: "4px solid #0072CE",
        boxShadow: "0 1px 12px rgba(0,114,206,0.08)",
      }}
    >
      {/* ── Left: Mobile menu + Logo + Breadcrumb ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: "#0072CE" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#EBF5FF"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
        >
          <Menu size={22} />
        </button>

        {/* Dhamma Logo — desktop only in header */}
        <Link href="/" className="hidden md:flex items-center gap-2 group">
          <div className="flex items-center justify-center">
            <Image
              src="/dhamma.png"
              alt="Dhamma Institute of Medical Sciences"
              width={100}
              height={34}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Separator + Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium">
          <span className="text-gray-300 hidden md:block">|</span>
          <Link
            href="/"
            className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
            style={{ color: "#6b7280" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#0072CE";
              (e.currentTarget as HTMLAnchorElement).style.background = "#EBF5FF";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#6b7280";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span
            className="font-bold px-2 py-1 rounded-lg"
            style={{ color: "#0072CE", background: "#EBF5FF", fontSize: "13px" }}
          >
            Dashboard
          </span>
        </div>
      </div>

      {/* ── Right: Bell + User + Logout ── */}
      <div className="flex items-center gap-2.5">

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2.5 rounded-xl transition-all"
            style={{ color: "#0072CE" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#EBF5FF"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white"
                style={{ background: "#ED1C24" }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="fixed sm:absolute top-16 sm:top-full right-4 sm:right-0 mt-1 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] rounded-2xl overflow-hidden z-[100] animate-fadeIn"
              style={{
                background: "white",
                boxShadow: "0 20px 60px rgba(0,114,206,0.15), 0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #E2EAF4",
                borderTop: "3px solid #0072CE",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "#E2EAF4", background: "#F4F7FB" }}
              >
                <div className="flex items-center gap-2">
                  <Bell size={14} style={{ color: "#0072CE" }} />
                  <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: "#ED1C24" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-semibold flex items-center gap-1 transition-colors"
                      style={{ color: "#0072CE" }}
                    >
                      <Check size={12} /> Read All
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={deleteAllNotifications}
                      className="text-xs font-semibold flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-[340px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell size={28} className="mx-auto mb-3 opacity-20" style={{ color: "#0072CE" }} />
                    <p className="text-gray-400 text-sm font-medium">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: "#F4F7FB" }}>
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className="px-4 py-3 cursor-pointer group flex gap-3 transition-colors"
                        style={{ background: !notification.isRead ? "#EBF5FF" : "white" }}
                        onClick={() => handleNotificationClick(notification)}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F4F7FB"}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = !notification.isRead ? "#EBF5FF" : "white"}
                      >
                        {/* Blue dot or check */}
                        <div className="shrink-0 mt-1">
                          {!notification.isRead
                            ? <div className="w-2 h-2 rounded-full mt-1" style={{ background: "#0072CE" }} />
                            : <div className="w-2 h-2 rounded-full mt-1 bg-gray-200" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className={`text-sm truncate pr-2 ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{notification.message}</p>
                          <p className="text-[10px] mt-1 font-medium uppercase tracking-wider" style={{ color: "#0072CE" }}>
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t" style={{ borderColor: "#E2EAF4", background: "#F4F7FB" }}>
                <Link
                  href="/contact"
                  onClick={() => setShowDropdown(false)}
                  className="block w-full py-2 text-center text-xs font-bold transition-colors"
                  style={{ color: "#0072CE" }}
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>



        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-all border"
          style={{ color: "#ED1C24", borderColor: "transparent" }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "#FDECEE";
            btn.style.borderColor = "#FAD7DC";
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "transparent";
            btn.style.borderColor = "transparent";
          }}
        >
          <LogOut size={15} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
