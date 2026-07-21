"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

export default function AuthPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.data.user));
        router.push("/");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Server not reachable. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F7FB" }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col items-center justify-center"
        style={{
          background: "#ffffff",
          borderRight: "1px solid #E2EAF4",
        }}
      >
        {/* Background decorative rings */}
        <div
          className="absolute top-[-100px] left-[-100px] w-[420px] h-[420px] rounded-full opacity-10"
          style={{ border: "2px solid rgba(0,114,206,0.1)" }}
        />
        <div
          className="absolute top-[-100px] left-[-100px] w-[280px] h-[280px] rounded-full opacity-30"
          style={{ border: "1px solid rgba(0,114,206,0.1)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full opacity-10"
          style={{ border: "2px solid rgba(0,114,206,0.05)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[240px] h-[240px] rounded-full opacity-30"
          style={{ border: "1px solid rgba(0,114,206,0.05)" }}
        />

        {/* Diagonal stripe pattern top-right */}
        <div
          className="absolute top-0 right-0 w-48 h-48 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, rgba(0,114,206,0.03) 0px, rgba(0,114,206,0.03) 1px, transparent 1px, transparent 12px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-14 max-w-[520px] w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div
              className="relative"
              style={{
                filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.35))",
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  padding: "10px",
                }}
              >
                <Image
                  src="/dhamma.png"
                  alt="Dhamma Institute of Medical Sciences"
                  width={200}
                  height={70}
                  className="object-contain"
                  priority
                />
              </div>
              {/* Red accent bar below logo */}
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: "80%", height: "2px", background: "rgba(255,255,255,0.2)" }}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
            Admin Management Portal
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Manage appointments, doctors, departments, and hospital operations from one powerful dashboard.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { val: "20+", label: "Departments" },
              { val: "50+", label: "Doctors" },
              { val: "200+", label: "Patients/day" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl py-4 px-3 text-center"
                style={{
                  background: "#F4F7FB",
                  border: "1px solid #E2EAF4",
                }}
              >
                <div className="text-2xl font-black text-[#0072CE] mb-0.5">{s.val}</div>
                <div className="text-gray-500 text-[11px] font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature bullets */}
          <div className="space-y-2.5 text-left">
            {[
              "Real-time appointment management",
              "Doctor & faculty records",
              "OPD slot scheduling",
              "Notice & announcement board",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(237,28,36,0.7)" }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-gray-600 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 py-3 px-8 text-center"
          style={{ background: "#F4F7FB", borderTop: "1px solid #E2EAF4" }}
        >
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Dhamma Institute of Medical Sciences — All rights reserved
          </p>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 relative">
        {/* Subtle bg dots */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 85% 15%, rgba(0,114,206,0.07) 0%, transparent 50%),
              radial-gradient(circle at 15% 85%, rgba(237,28,36,0.04) 0%, transparent 50%)`,
          }}
        />

        <div className="w-full max-w-[420px] relative z-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-7">
            <div
              className="flex items-center justify-center"
            >
              <Image src="/dhamma.png" alt="Dhamma Institute of Medical Sciences" width={160} height={55} className="object-contain" />
            </div>
          </div>

          {/* Card header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} style={{ color: "#0072CE" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#0072CE" }}>
                Secure Admin Access
              </span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your DIMS Admin Portal
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-7"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 6px rgba(0,114,206,0.06), 0 20px 50px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,114,206,0.12)",
              borderTop: "3px solid #0072CE",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#374151" }}>
                  Email / Username
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#0072CE" }} />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="admin@dhamma.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-gray-700 bg-gray-50 placeholder-gray-300 outline-none transition-all"
                    style={{ border: "1.5px solid #E2EAF4" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0072CE";
                      e.target.style.boxShadow = "0 0 0 3px rgba(0,114,206,0.12)";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E2EAF4";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#F9FAFB";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#374151" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#0072CE" }} />
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-11 py-3.5 rounded-xl text-sm text-gray-700 bg-gray-50 placeholder-gray-300 outline-none transition-all"
                    style={{ border: "1.5px solid #E2EAF4" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0072CE";
                      e.target.style.boxShadow = "0 0 0 3px rgba(0,114,206,0.12)";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E2EAF4";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#F9FAFB";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#0072CE" }}
                  />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold transition-colors hover:underline"
                  style={{ color: "#ED1C24" }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="text-sm px-4 py-3 rounded-xl flex items-center gap-2"
                  style={{ background: "#FDECEE", border: "1px solid #FAD7DC", color: "#C8111A" }}
                >
                  <span>⚠</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #0072CE 0%, #00509E 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(0,114,206,0.35)",
                  transform: "translateY(0)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "linear-gradient(135deg, #00509E 0%, #003f7d 100%)";
                    btn.style.boxShadow = "0 8px 28px rgba(0,114,206,0.45)";
                    btn.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "linear-gradient(135deg, #0072CE 0%, #00509E 100%)";
                    btn.style.boxShadow = "0 4px 20px rgba(0,114,206,0.35)";
                    btn.style.transform = "translateY(0)";
                  }
                }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                ) : (
                  <><ArrowRight size={16} /> Sign In to Dashboard</>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "#E2EAF4" }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-gray-400 bg-white">Authorized Access Only</span>
              </div>
            </div>

            {/* Info box */}
            <div
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "#EBF5FF", border: "1px solid rgba(0,114,206,0.15)" }}
            >
              <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: "#0072CE" }} />
              <p className="text-xs text-gray-500 leading-relaxed">
                This portal is restricted to authorized DIMS administrators. Contact IT for access.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-5">
            © {new Date().getFullYear()} Dhamma Institute of Medical Sciences
          </p>
        </div>
      </div>
    </div>
  );
}
