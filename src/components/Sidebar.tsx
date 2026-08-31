"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
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
  IndianRupee,
  SlidersHorizontal,
  ImageIcon,
  Newspaper,
  ChevronDown,
  FileText,
  Tv,
  Download,
  Users2,
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mediaDropdownOpen, setMediaDropdownOpen] = useState(true);
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();

  const isMediaActive = pathname.startsWith('/media');

  const menuItems = [
    { name: 'Dashboard',        icon: LayoutDashboard,   href: '/' },
    { name: 'Hero Slider',      icon: SlidersHorizontal, href: '/hero-slides' },
    { name: 'Gallery & Media',  icon: ImageIcon,         href: '/gallery' },
    { name: 'Health Blogs',      icon: BookOpen,          href: '/blogs' },
    { name: 'AI Chatbot',        icon: Bot,               href: '/chatbot' },
    { name: 'Appointments',     icon: CalendarCheck,     href: '/appointments' },
    { name: 'Doctors',          icon: Stethoscope,       href: '/doctors' },
    { name: 'Faculty',          icon: GraduationCap,     href: '/faculty' },
    { name: 'Departments',      icon: Building2,         href: '/departments' },
    { name: 'OPD Timing',       icon: Timer,             href: '/opd-timing' },
    { name: 'Slots',            icon: Clock,             href: '/slots' },
    { name: 'Contact',          icon: MessageSquare,     href: '/contact' },
    { name: 'Notices',          icon: Megaphone,         href: '/notices' },
    { name: 'Announcements',    icon: Volume2,           href: '/announcements' },
    { name: 'News Tickers',     icon: Activity,          href: '/news-tickers' },
    { name: 'Events',           icon: CalendarDays,      href: '/events' },
    { name: 'Time Table',       icon: BookOpen,          href: '/timetable' },
    { name: 'Fee Structure',    icon: IndianRupee,       href: '/fee-structure' },
  ];

  const mediaSubmenu = [
    { name: 'All Media Hub',     icon: Newspaper,  href: '/media' },
    { name: 'Press Release',     icon: FileText,   href: '/media/press-release' },
    { name: 'Media Coverage',    icon: Tv,         href: '/media/media-coverage' },
    { name: 'Newsletters',       icon: Download,   href: '/media/newsletters' },
    { name: 'Health Blogs',      icon: BookOpen,   href: '/blogs' },
    { name: 'Media Connect',     icon: Users2,     href: '/media/media-connect' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
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
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center absolute -right-3.5 top-8 w-7 h-7 rounded-full shadow-lg z-20 transition-all cursor-pointer"
          style={{
            background: "#ED1C24",
            color: "white",
            border: "2px solid white",
            boxShadow: "0 2px 10px rgba(237,28,36,0.4)",
          }}
        >
          {isCollapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
        </button>

        {/* Logo Section */}
        <div
          className={`flex items-center py-5 border-b ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                padding: isCollapsed ? "5px" : "6px 0",
                width: isCollapsed ? 48 : undefined,
                transition: "all 0.3s",
              }}
            >
              {isCollapsed ? (
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
            className="md:hidden p-1.5 rounded-lg ml-1 text-gray-500 cursor-pointer"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section label */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-1">
            <p
              className="text-[10px] font-bold tracking-[0.14em] uppercase"
              style={{ color: "#9ca3af" }}
            >
              Main Navigation
            </p>
          </div>
        )}

        {/* Nav Items */}
        <nav className={`flex-1 py-2 space-y-0.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {/* Dashboard */}
          {(() => {
            const isActive = pathname === '/';
            return (
              <Link
                href="/"
                title="Dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl transition-all group relative mb-1"
                style={{
                  padding: isCollapsed ? "10px 0" : "9px 12px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  background: isActive ? "#EBF5FF" : "transparent",
                  borderLeft: isActive ? "3px solid #0072CE" : "3px solid transparent",
                }}
              >
                <LayoutDashboard size={18} className="shrink-0" style={{ color: isActive ? "#0072CE" : "#6b7280" }} />
                {!isCollapsed && (
                  <span className="text-sm truncate" style={{ color: isActive ? "#0072CE" : "#4b5563", fontWeight: isActive ? 700 : 500 }}>
                    Dashboard
                  </span>
                )}
                {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#ED1C24" }} />}
              </Link>
            );
          })()}

          {/* MEDIA CENTRE DROPDOWN (4 Sections) */}
          <div className="my-1">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setMediaDropdownOpen(!mediaDropdownOpen);
              }}
              className="w-full flex items-center gap-3 rounded-xl transition-all group relative cursor-pointer"
              style={{
                padding: isCollapsed ? "10px 0" : "9px 12px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                background: isMediaActive ? "#EBF5FF" : "transparent",
                borderLeft: isMediaActive ? "3px solid #0072CE" : "3px solid transparent",
              }}
            >
              <Newspaper size={18} className="shrink-0" style={{ color: isMediaActive ? "#0072CE" : "#6b7280" }} />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-bold truncate flex-1 text-left" style={{ color: isMediaActive ? "#0072CE" : "#374151" }}>
                    Media Centre
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${mediaDropdownOpen ? 'rotate-180' : ''}`}
                    style={{ color: isMediaActive ? "#0072CE" : "#9ca3af" }}
                  />
                </>
              )}
            </button>

            {/* Submenu Items */}
            {!isCollapsed && mediaDropdownOpen && (
              <div className="ml-4 pl-3 border-l-2 border-blue-100 my-1 space-y-0.5">
                {mediaSubmenu.map(sub => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: isSubActive ? "#0072CE" : "transparent",
                        color: isSubActive ? "#ffffff" : "#4b5563",
                      }}
                    >
                      <sub.icon size={14} className="shrink-0" />
                      <span className="truncate">{sub.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remaining Menu Items */}
          {menuItems.slice(1).map((item) => {
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
                  background: isActive ? "#EBF5FF" : "transparent",
                  borderLeft: isActive ? "3px solid #0072CE" : "3px solid transparent",
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
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t py-4" style={{ borderColor: "#E2EAF4" }}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 rounded-full" style={{ background: "rgba(237,28,36,0.5)" }} />
            </div>
          ) : (
            <div className="px-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4ade80" }} />
                <span className="text-[10px] font-medium text-gray-400">
                  System Online
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                © {new Date().getFullYear()} Dhamma Institute
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
