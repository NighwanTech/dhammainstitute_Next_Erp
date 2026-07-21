"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Building2,
  Timer,
  Clock,
  MessageSquare,
  Megaphone,
  Volume2,
  CalendarDays,
  GraduationCap,
  ChevronsLeft,
  ChevronsRight,
  X,
  Activity,
  BookOpen,
  IndianRupee
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard',    icon: LayoutDashboard, href: '/' },
    { name: 'Appointments', icon: CalendarCheck,   href: '/appointments' },
    { name: 'Doctors',      icon: Stethoscope,     href: '/doctors' },
    { name: 'Faculty',      icon: GraduationCap,   href: '/faculty' },
    { name: 'Departments',  icon: Building2,        href: '/departments' },
    { name: 'OPD Timing',   icon: Timer,            href: '/opd-timing' },
    { name: 'Slots',        icon: Clock,            href: '/slots' },
    { name: 'Contact',      icon: MessageSquare,   href: '/contact' },
    { name: 'Notices',      icon: Megaphone,        href: '/notices' },
    { name: 'Announcements',icon: Volume2,          href: '/announcements' },
    { name: 'News Tickers', icon: Activity,         href: '/news-tickers' },
    { name: 'Events',       icon: CalendarDays,    href: '/events' },
    { name: 'Time Table',   icon: BookOpen,         href: '/timetable' },
    { name: 'Fee Structure',icon: IndianRupee,      href: '/fee-structure' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,31,63,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 md:relative md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          min-h-screen flex flex-col`}
        style={{
          background: "#ffffff",
          borderRight: "1px solid #E2EAF4",
          boxShadow: "4px 0 24px rgba(0,0,0,0.02)",
        }}
      >
        {/* ── Collapse Toggle ── */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center absolute -right-3.5 top-8 w-7 h-7 rounded-full shadow-lg z-20 transition-all"
          style={{
            background: "#ED1C24",
            color: "white",
            border: "2px solid white",
            boxShadow: "0 2px 10px rgba(237,28,36,0.4)",
          }}
        >
          {isCollapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
        </button>

        {/* ── Logo Section ── */}
        <div
          className={`flex items-center py-5 border-b ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            {/* Logo card */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                padding: isCollapsed ? "5px" : "6px 0",
                width: isCollapsed ? 48 : undefined,
                transition: "all 0.3s",
              }}
            >
              {isCollapsed ? (
                // Collapsed: show only the flame icon portion
                <Image
                  src="/dhamma.png"
                  alt="Dhamma"
                  width={34}
                  height={34}
                  className="object-contain"
                  style={{ objectPosition: "left center" }}
                />
              ) : (
                <Image
                  src="/dhamma.png"
                  alt="Dhamma Institute of Medical Sciences"
                  width={130}
                  height={44}
                  className="object-contain"
                />
              )}
            </div>

            {/* Text label (expanded only) */}
            {!isCollapsed && (
              <div className="min-w-0">
                <p
                  className="text-[10px] font-black leading-tight whitespace-nowrap"
                  style={{ color: "#0072CE" }}
                >
                  Admin Portal
                </p>
                <div
                  className="mt-0.5 h-[1.5px] rounded-full"
                  style={{ background: "#ED1C24", width: "40%" }}
                />
              </div>
            )}
          </Link>

          {/* Mobile close */}
          <button
            className="md:hidden p-1.5 rounded-lg ml-1"
            style={{ color: "#6b7280" }}
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Section label ── */}
        {!isCollapsed && (
          <div className="px-4 pt-5 pb-1">
            <p
              className="text-[10px] font-bold tracking-[0.14em] uppercase"
              style={{ color: "#9ca3af" }}
            >
              Main Menu
            </p>
          </div>
        )}

        {/* ── Nav Items ── */}
        <nav className={`flex-1 py-2 space-y-0.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl transition-all group relative"
                style={{
                  padding: isCollapsed ? "10px 0" : "9px 12px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  background: isActive
                    ? "#EBF5FF"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #0072CE"
                    : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#F4F7FB";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                <item.icon
                  size={18}
                  className="shrink-0"
                  style={{ color: isActive ? "#0072CE" : "#6b7280" }}
                />
                {!isCollapsed && (
                  <span
                    className="text-sm truncate"
                    style={{
                      color: isActive ? "#0072CE" : "#4b5563",
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {item.name}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "#ED1C24" }}
                  />
                )}

                {/* Tooltip (collapsed) */}
                {isCollapsed && (
                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50"
                    style={{
                      background: "#003f7d",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                    }}
                  >
                    {item.name}
                    {/* Red dot tooltip accent */}
                    <span
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{ background: "#ED1C24" }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div
          className="border-t py-4"
          style={{ borderColor: "#E2EAF4" }}
        >
          {isCollapsed ? (
            <div className="flex justify-center">
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: "rgba(237,28,36,0.5)" }}
              />
            </div>
          ) : (
            <div className="px-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4ade80" }} />
                <span className="text-[10px] font-medium" style={{ color: "#9ca3af" }}>
                  System Online
                </span>
              </div>
              <p className="text-[10px]" style={{ color: "#d1d5db" }}>
                © {new Date().getFullYear()} Dhamma Institute of Medical Sciences
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
