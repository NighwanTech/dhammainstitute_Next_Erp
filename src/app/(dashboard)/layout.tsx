"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { SidebarProvider } from '@/components/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Show nothing while checking auth (prevents flash)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F7FB" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{ border: "3px solid #E2EAF4", borderTop: "3px solid #0072CE" }}
            />
            <div
              className="w-3 h-3 rounded-full absolute"
              style={{ background: "#ED1C24", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
          </div>
          <p className="text-sm font-bold" style={{ color: "#0072CE" }}>Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen font-sans overflow-hidden" style={{ background: "#F4F7FB" }}>
        <Sidebar />
        <div className="flex-1 flex flex-col w-full min-w-0 h-full overflow-hidden">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
