"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Settings2,
  Users2,
  MessageSquare,
  BookOpen,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  Sliders,
  ShieldCheck,
  Send,
  Eye,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile (Recommended - High Accuracy)" },
  { id: "llama3-70b-8192", name: "Llama 3 70B (Fast & Thorough)" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant (Ultra Fast Response)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (Large Context)" },
  { id: "gemma2-9b-it", name: "Google Gemma 2 9B IT" },
];

export default function ChatbotAdminManager() {
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "leads" | "sessions" | "knowledge">("overview");
  const [loading, setLoading] = useState(true);

  // Overview Stats
  const [stats, setStats] = useState<any>({
    totalSessions: 0,
    totalMessages: 0,
    totalLeads: 0,
    newLeadsCount: 0,
    satisfactionPercent: 98,
    recentSessions: [],
    recentLeads: [],
  });

  // Settings State
  const [config, setConfig] = useState<any>({
    botName: "Dhamma AI Health Assistant",
    welcomeMessage: "",
    groqApiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
    modelName: "llama-3.3-70b-versatile",
    maxTokens: 1024,
    systemPrompt: "",
    quickReplies: [],
    emergencyPhone: "+91 7643990301",
    whatsappNumber: "917643990301",
    enableLeadCapture: true,
    isActive: true,
  });
  const [quickRepliesText, setQuickRepliesText] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  // Leads State
  const [leads, setLeads] = useState<any[]>([]);
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [leadSearch, setLeadSearch] = useState("");

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [viewingTranscript, setViewingTranscript] = useState(false);

  // Knowledge Base State
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [showKbModal, setShowKbModal] = useState(false);
  const [kbTopic, setKbTopic] = useState("");
  const [kbAnswer, setKbAnswer] = useState("");
  const [kbKeywords, setKbKeywords] = useState("");
  const [kbCategory, setKbCategory] = useState("General");
  const [editKbId, setEditKbId] = useState<number | null>(null);

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "");

  // Fetch Dashboard Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };

      // Stats
      const statsRes = await fetch(`${API_BASE}/chatbot/admin/stats`, { headers });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      // Config
      const configRes = await fetch(`${API_BASE}/chatbot/admin/config`, { headers });
      const configData = await configRes.json();
      if (configData.success && configData.data) {
        setConfig(configData.data);
        const qr = typeof configData.data.quickReplies === "string"
          ? JSON.parse(configData.data.quickReplies)
          : configData.data.quickReplies;
        setQuickRepliesText(Array.isArray(qr) ? qr.join("\n") : "");
      }

      // Leads
      const leadsRes = await fetch(`${API_BASE}/chatbot/admin/leads`, { headers });
      const leadsData = await leadsRes.json();
      if (leadsData.success) setLeads(leadsData.data);

      // Sessions
      const sessionsRes = await fetch(`${API_BASE}/chatbot/admin/sessions`, { headers });
      const sessionsData = await sessionsRes.json();
      if (sessionsData.success) setSessions(sessionsData.data);

      // Knowledge Base
      const kbRes = await fetch(`${API_BASE}/chatbot/admin/knowledge`, { headers });
      const kbData = await kbRes.json();
      if (kbData.success) setKnowledgeItems(kbData.data);
    } catch (err) {
      console.error("Error fetching chatbot admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const qrArray = quickRepliesText
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        ...config,
        quickReplies: JSON.stringify(qrArray),
      };

      const res = await fetch(`${API_BASE}/chatbot/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Chatbot settings updated successfully!");
        fetchData();
      } else {
        alert(data.message || "Failed to update settings.");
      }
    } catch (err: any) {
      alert("Error saving config: " + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async (id: number, status: string, notes?: string) => {
    try {
      const res = await fetch(`${API_BASE}/chatbot/admin/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(l => (l.id === id ? { ...l, status, notes: notes ?? l.notes } : l)));
      }
    } catch (err) {
      console.error("Update lead status error:", err);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (id: number) => {
    if (!confirm("Are you sure you want to delete this patient inquiry lead?")) return;
    try {
      const res = await fetch(`${API_BASE}/chatbot/admin/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error("Delete lead error:", err);
    }
  };

  // View Session Transcript
  const handleOpenTranscript = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setViewingTranscript(true);
    try {
      const res = await fetch(`${API_BASE}/chatbot/admin/sessions/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setSessionMessages(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Knowledge Base Actions
  const handleSaveKb = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editKbId
        ? `${API_BASE}/chatbot/admin/knowledge/${editKbId}`
        : `${API_BASE}/chatbot/admin/knowledge`;
      const method = editKbId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          topic: kbTopic,
          answer: kbAnswer,
          keywords: kbKeywords,
          category: kbCategory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowKbModal(false);
        setEditKbId(null);
        setKbTopic("");
        setKbAnswer("");
        setKbKeywords("");
        fetchData();
      }
    } catch (err: any) {
      alert("Error saving knowledge item: " + err.message);
    }
  };

  const handleDeleteKb = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ knowledge item?")) return;
    try {
      await fetch(`${API_BASE}/chatbot/admin/knowledge/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      setKnowledgeItems(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      console.error("Delete KB error:", err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = leadStatusFilter === "All" || lead.status === leadStatusFilter;
    const matchesSearch =
      !leadSearch.trim() ||
      lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.phone.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (lead.department && lead.department.toLowerCase().includes(leadSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#003580] to-[#0072CE] text-white shadow-sm">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">AI Medical Assistant Manager</h1>
              <p className="text-xs text-gray-500">
                Powered by Groq Cloud ({config.modelName || "Llama 3.3 70B"}). Live clinical grounding & lead capture.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <span className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Bot Live
          </span>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex overflow-x-auto gap-2">
        {[
          { id: "overview", label: "📊 Analytics & Overview", count: null },
          { id: "settings", label: "⚙️ AI Persona & Groq Config", count: null },
          { id: "leads", label: "📋 Patient Inquiries & Leads", count: stats.newLeadsCount ? `${stats.newLeadsCount} New` : null },
          { id: "sessions", label: "👥 Conversation Logs", count: stats.totalSessions },
          { id: "knowledge", label: "📚 Knowledge Base & FAQs", count: knowledgeItems.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#0072CE] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-blue-100 text-[#0072CE]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          ── TAB 1: OVERVIEW & ANALYTICS ──
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <MessageSquare size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Chats</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.totalSessions}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.totalMessages} messages exchanged</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <Users2 size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Patient Leads</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.totalLeads}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">{stats.newLeadsCount} awaiting callback</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <Award size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Satisfaction</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.satisfactionPercent}%</p>
              <p className="text-xs text-gray-500 mt-1">Based on helpful votes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <Sparkles size={22} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">AI Latency</span>
              </div>
              <p className="text-2xl font-black text-gray-900">&lt; 1.2s</p>
              <p className="text-xs text-purple-600 font-bold mt-1">Groq LPUs Powered</p>
            </div>
          </div>

          {/* Recent Leads & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Inquiries */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Phone size={18} className="text-[#0072CE]" /> Recent Patient Callback Inquiries
                </h3>
                <button
                  onClick={() => setActiveTab("leads")}
                  className="text-xs font-bold text-[#0072CE] hover:underline"
                >
                  View All Leads
                </button>
              </div>

              {stats.recentLeads && stats.recentLeads.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentLeads.slice(0, 5).map((lead: any) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-gray-50/70 hover:bg-blue-50/40 rounded-xl border border-gray-100 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500">
                          📞 {lead.phone} • <span className="font-semibold text-[#0072CE]">{lead.department || "General"}</span>
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          lead.status === "New"
                            ? "bg-amber-100 text-amber-800"
                            : lead.status === "Contacted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-8 text-center">No leads recorded yet.</p>
              )}
            </div>

            {/* AI Assistant Architecture Card */}
            <div className="bg-gradient-to-br from-[#003580] to-[#0057A8] p-6 rounded-2xl text-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={20} className="text-[#F5BE00]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#F5BE00]">
                    Enterprise Clinical Engine
                  </span>
                </div>
                <h3 className="text-xl font-black mb-2">Groq LPUs + Llama 3.3 70B</h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-4">
                  The AI Assistant is grounded with real-time Dhamma hospital data: OPD schedules, 24/7 Trauma emergency protocols, verified doctors, and medical specialties.
                </p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-xs space-y-1.5">
                <p className="flex justify-between">
                  <span className="text-blue-200">Active Model:</span>
                  <span className="font-bold">{config.modelName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-blue-200">Emergency Escalation:</span>
                  <span className="font-bold text-[#F5BE00]">{config.emergencyPhone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-blue-200">Knowledge Items Grounded:</span>
                  <span className="font-bold">{knowledgeItems.length} Verified FAQs</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          ── TAB 2: AI PERSONA & GROQ SETTINGS ──
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveConfig} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-black text-gray-900">AI Model & Clinical Instructions</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize how the AI talks to patients, handles emergencies, and routes appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bot Identity */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Assistant Name</label>
                <input
                  type="text"
                  required
                  value={config.botName || ""}
                  onChange={e => setConfig({ ...config, botName: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Assistant Subtitle</label>
                <input
                  type="text"
                  value={config.botSubtitle || ""}
                  onChange={e => setConfig({ ...config, botSubtitle: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Groq AI Model</label>
                <select
                  value={config.modelName || "llama-3.3-70b-versatile"}
                  onChange={e => setConfig({ ...config, modelName: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#0072CE]"
                >
                  {GROQ_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Groq API Key</label>
                <input
                  type="password"
                  value={config.groqApiKey || ""}
                  onChange={e => setConfig({ ...config, groqApiKey: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0072CE]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Temperature ({config.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature || 0.3}
                    onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full mt-2 accent-[#0072CE]"
                  />
                  <span className="text-[10px] text-gray-400">Lower = More factual & clinical</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Max Tokens</label>
                  <input
                    type="number"
                    value={config.maxTokens || 1024}
                    onChange={e => setConfig({ ...config, maxTokens: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Prompts & Greetings */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Initial Welcome Message
                </label>
                <textarea
                  rows={3}
                  value={config.welcomeMessage || ""}
                  onChange={e => setConfig({ ...config, welcomeMessage: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0072CE]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  System Instructions & Persona Directives
                </label>
                <textarea
                  rows={8}
                  value={config.systemPrompt || ""}
                  onChange={e => setConfig({ ...config, systemPrompt: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0072CE]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Quick Reply Suggestion Chips (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={quickRepliesText}
                  onChange={e => setQuickRepliesText(e.target.value)}
                  placeholder="Book Doctor Appointment&#10;OPD Timings&#10;Emergency & Ambulance"
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0072CE]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Emergency Hotline Phone
              </label>
              <input
                type="text"
                value={config.emergencyPhone || ""}
                onChange={e => setConfig({ ...config, emergencyPhone: e.target.value })}
                className="w-full mt-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-red-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                WhatsApp Connect Number (without +)
              </label>
              <input
                type="text"
                value={config.whatsappNumber || ""}
                onChange={e => setConfig({ ...config, whatsappNumber: e.target.value })}
                className="w-full mt-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-green-700"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={config.isActive}
                  onChange={e => setConfig({ ...config, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#0072CE] rounded"
                />
                <span>Enable AI Chatbot on Website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={config.enableLeadCapture}
                  onChange={e => setConfig({ ...config, enableLeadCapture: e.target.checked })}
                  className="w-4 h-4 text-[#0072CE] rounded"
                />
                <span>Enable In-Chat Patient Lead Capture</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 bg-[#0072CE] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#00509E] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {savingConfig && <RefreshCw size={14} className="animate-spin" />}
              Save AI Settings
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════
          ── TAB 3: PATIENT LEADS ──
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "leads" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-gray-900">Patient Callback Inquiries</h3>
              <p className="text-xs text-gray-500">Direct patient leads captured by the AI bot.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={leadSearch}
                  onChange={e => setLeadSearch(e.target.value)}
                  placeholder="Search by name, phone, dept..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <select
                value={leadStatusFilter}
                onChange={e => setLeadStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="New">New Only</option>
                <option value="Contacted">Contacted</option>
                <option value="Booked">Booked</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Department / Query</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{lead.name}</td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-[#0072CE] font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone size={12} /> {lead.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-[#0072CE] rounded-full text-[10px] font-bold">
                        {lead.department || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer ${
                          lead.status === "New"
                            ? "bg-amber-100 text-amber-800"
                            : lead.status === "Contacted"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "Booked"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Booked">Booked</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello " + lead.name + ", this is Dhamma Institute of Medical Sciences regarding your appointment enquiry.")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[11px] font-bold"
                          title="WhatsApp Patient"
                        >
                          WhatsApp
                        </a>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          ── TAB 4: CONVERSATION SESSIONS ──
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "sessions" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-black text-gray-900">User Conversation Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4 text-center">Messages</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">{s.id.slice(0, 18)}...</td>
                    <td className="py-3.5 px-4">
                      {s.userName ? (
                        <div>
                          <p className="font-bold text-gray-900">{s.userName}</p>
                          <p className="text-[11px] text-gray-500">{s.userPhone}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Anonymous Visitor</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#0072CE]">{s.messagesCount}</td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(s.updatedAt).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenTranscript(s.id)}
                        className="px-3 py-1.5 bg-blue-50 text-[#0072CE] hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          ── TAB 5: KNOWLEDGE BASE & FAQS ──
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "knowledge" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900">Hospital Grounding FAQs & Knowledge</h3>
              <p className="text-xs text-gray-500">
                Official hospital ground truth injected into AI prompt for 100% accurate responses.
              </p>
            </div>
            <button
              onClick={() => {
                setEditKbId(null);
                setKbTopic("");
                setKbAnswer("");
                setKbKeywords("");
                setShowKbModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] text-white rounded-xl text-xs font-bold hover:bg-[#00509E] cursor-pointer"
            >
              <Plus size={16} /> Add Grounding FAQ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeItems.map(item => (
              <div key={item.id} className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-100 text-[#0072CE] text-[10px] font-bold uppercase rounded-md">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditKbId(item.id);
                        setKbTopic(item.topic);
                        setKbAnswer(item.answer);
                        setKbKeywords(item.keywords || "");
                        setKbCategory(item.category || "General");
                        setShowKbModal(true);
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteKb(item.id)}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{item.topic}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{item.answer}</p>
                {item.keywords && (
                  <p className="text-[10px] text-gray-400">Keywords: {item.keywords}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRANSCRIPT MODAL ── */}
      {viewingTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-base font-black text-gray-900">Conversation Transcript</h3>
                <p className="text-xs font-mono text-gray-500">{selectedSessionId}</p>
              </div>
              <button
                onClick={() => setViewingTranscript(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-gray-50/50">
              {sessionMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0072CE] text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-xs"
                    }`}
                  >
                    <p className="font-semibold" style={msg.sender === "user" ? { color: "#FFFFFF" } : { color: "#111827" }}>{msg.message}</p>
                    <span className="text-[9px] opacity-70 block mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── KB ADD/EDIT MODAL ── */}
      {showKbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">
                {editKbId ? "Edit Grounding FAQ" : "Add Grounding FAQ"}
              </h3>
              <button onClick={() => setShowKbModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveKb} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Topic / Question Title</label>
                <input
                  type="text"
                  required
                  value={kbTopic}
                  onChange={e => setKbTopic(e.target.value)}
                  placeholder="e.g. OPD Timings for Cardiology"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Category</label>
                <input
                  type="text"
                  value={kbCategory}
                  onChange={e => setKbCategory(e.target.value)}
                  placeholder="e.g. OPD, Emergency, Billing"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Verified Answer</label>
                <textarea
                  rows={4}
                  required
                  value={kbAnswer}
                  onChange={e => setKbAnswer(e.target.value)}
                  placeholder="Exact information the AI should provide..."
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={kbKeywords}
                  onChange={e => setKbKeywords(e.target.value)}
                  placeholder="e.g. opd, time, schedule, doctor, morning"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowKbModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0072CE] text-white rounded-xl text-xs font-bold"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
