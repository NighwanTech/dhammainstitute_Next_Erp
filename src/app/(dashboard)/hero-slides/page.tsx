"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ImageIcon,
  SlidersHorizontal,
  Search,
  RefreshCw,
  ExternalLink,
  Layers,
  Eye,
  EyeOff,
  AlertCircle,
  UploadCloud,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE || "http://localhost:5000";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string | null;
  badge: string | null;
  image: string;
  primaryBtnText: string | null;
  primaryBtnLink: string | null;
  secondaryBtnText: string | null;
  secondaryBtnLink: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editSlide, setEditSlide] = useState<HeroSlide | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [primaryBtnText, setPrimaryBtnText] = useState("");
  const [primaryBtnLink, setPrimaryBtnLink] = useState("");
  const [secondaryBtnText, setSecondaryBtnText] = useState("");
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = () => localStorage.getItem("admin_token") || "";

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hero-slides`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSlides(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch hero slides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, rowsPerPage]);

  const resetForm = () => {
    setEditSlide(null);
    setTitle("");
    setSubtitle("");
    setBadge("");
    setPrimaryBtnText("");
    setPrimaryBtnLink("");
    setSecondaryBtnText("");
    setSecondaryBtnLink("");
    setSortOrder(slides.length + 1);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle || "");
    setBadge(slide.badge || "");
    setPrimaryBtnText(slide.primaryBtnText || "");
    setPrimaryBtnLink(slide.primaryBtnLink || "");
    setSecondaryBtnText(slide.secondaryBtnText || "");
    setSecondaryBtnLink(slide.secondaryBtnLink || "");
    setSortOrder(slide.sortOrder);
    setIsActive(slide.isActive);
    setImageFile(null);
    setImagePreview(resolveImageUrl(slide.image));
    setFormError(null);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Slide Heading (Title) is required.");
      return;
    }

    if (!editSlide && !imageFile) {
      setFormError("Please select a hero image banner for the slide.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("badge", badge.trim());
      formData.append("primaryBtnText", primaryBtnText.trim());
      formData.append("primaryBtnLink", primaryBtnLink.trim());
      formData.append("secondaryBtnText", secondaryBtnText.trim());
      formData.append("secondaryBtnLink", secondaryBtnLink.trim());
      formData.append("sortOrder", sortOrder.toString());
      formData.append("isActive", isActive.toString());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = editSlide
        ? `${API_BASE}/hero-slides/${editSlide.id}`
        : `${API_BASE}/hero-slides`;
      const method = editSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchSlides();
      } else {
        setFormError(data.message || "Failed to save slide.");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this hero slide? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/hero-slides/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.message || "Failed to delete hero slide.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting hero slide.");
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s))
      );

      const res = await fetch(`${API_BASE}/hero-slides/${slide.id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ field: "isActive" }),
      });

      const data = await res.json();
      if (!data.success) {
        fetchSlides();
      }
    } catch (err) {
      fetchSlides();
    }
  };

  const resolveImageUrl = (img: string) => {
    if (!img) return "/images/about-hospital.png";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/uploads/")) return `${ASSET_BASE}${img}`;
    return img;
  };

  // Filter slides
  const filteredSlides = slides.filter((slide) => {
    const matchesSearch =
      slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slide.subtitle && slide.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (slide.badge && slide.badge.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === "active") return matchesSearch && slide.isActive;
    if (statusFilter === "inactive") return matchesSearch && !slide.isActive;
    return matchesSearch;
  });

  const totalCount = slides.length;
  const activeCount = slides.filter((s) => s.isActive).length;
  const inactiveCount = slides.filter((s) => !s.isActive).length;

  // Paginated Slides
  const totalPages = Math.ceil(filteredSlides.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedSlides = filteredSlides.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0072CE]">
              <SlidersHorizontal size={22} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Hero Slider Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create, customize, and reorder website homepage hero banners with headings, subheadings, and call-to-actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSlides}
            title="Refresh Slides"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#0072CE]" : ""} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0072CE] hover:bg-[#005ba6] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Slides</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0072CE] flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active on Homepage</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Eye size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hidden / Draft</p>
            <h3 className="text-2xl font-black text-gray-500 mt-1">{inactiveCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
            <EyeOff size={22} />
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & Filters ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search slides by heading, subheading or badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "all"
                  ? "bg-white text-[#0072CE] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "active"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "inactive"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Draft ({inactiveCount})
            </button>
          </div>

          {/* Rows Per Page */}
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 border border-transparent rounded-xl text-gray-700 focus:bg-white focus:border-[#0072CE] focus:outline-none"
          >
            <option value={6}>6 per page</option>
            <option value={9}>9 per page</option>
            <option value={12}>12 per page</option>
          </select>
        </div>
      </div>

      {/* ── Slide Cards Grid ── */}
      {loading ? (
        <div className="bg-white p-16 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-10 h-10 border-4 border-[#0072CE] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">Loading hero slides...</p>
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="w-16 h-16 bg-blue-50 text-[#0072CE] rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Hero Slides Found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            {searchTerm || statusFilter !== "all"
              ? "No slides matched your search query or filter criteria."
              : "You haven't created any hero slides yet. Click below to add your first slide!"}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0072CE] hover:bg-[#005ba6] text-white text-sm font-bold rounded-xl shadow transition-all"
          >
            <Plus size={16} /> Add Hero Slide
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSlides.map((slide) => {
              const imgUrl = resolveImageUrl(slide.image);
              return (
                <div
                  key={slide.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col shadow-sm hover:shadow-md ${
                    slide.isActive ? "border-gray-200" : "border-dashed border-gray-300 opacity-80"
                  }`}
                >
                  {/* Banner Image Preview with Overlay */}
                  <div className="relative w-full h-48 bg-slate-900 overflow-hidden group">
                    <img
                      src={imgUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/about-hospital.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold rounded-full">
                        Order: #{slide.sortOrder}
                      </span>

                      <button
                        onClick={() => handleToggleActive(slide)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all ${
                          slide.isActive
                            ? "bg-emerald-600/90 text-white hover:bg-emerald-600"
                            : "bg-gray-800/90 text-gray-300 hover:bg-gray-800"
                        }`}
                      >
                        {slide.isActive ? (
                          <>
                            <CheckCircle size={12} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Draft
                          </>
                        )}
                      </button>
                    </div>

                    {/* Tag on Image */}
                    {slide.badge && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 bg-[#ED1C24] text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                          {slide.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base line-clamp-2 leading-snug">
                        {slide.title}
                      </h3>
                      <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {slide.subtitle || <span className="italic text-gray-400">No subheading provided.</span>}
                      </p>

                      {/* CTA Links Preview */}
                      {(slide.primaryBtnText || slide.secondaryBtnText) && (
                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-[11px]">
                          {slide.primaryBtnText && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#0072CE] font-bold rounded-lg">
                              {slide.primaryBtnText}
                            </span>
                          )}
                          {slide.secondaryBtnText && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded-lg">
                              {slide.secondaryBtnText}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-mono">
                        ID: #{slide.id}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(slide)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0072CE] text-xs font-bold rounded-lg transition-colors"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination Bar ── */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(filteredSlides.length, startIndex + rowsPerPage)}
                </span>{" "}
                of <span className="font-bold text-gray-900">{filteredSlides.length}</span> slides
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#0072CE] text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0072CE] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} />
                <h3 className="text-lg font-black">
                  {editSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                  Slide Heading (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. World-Class Healthcare & Advanced Medical Facilities"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                  Slide Subheading (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. State-of-the-art multi-speciality hospital delivering compassionate care and modern diagnostic excellence."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] text-gray-800 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24x7 Emergency & Critical Care"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] text-gray-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                  Hero Background Image {!editSlide && <span className="text-red-500">*</span>}
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 border-2 border-dashed border-gray-300 hover:border-[#0072CE] bg-gray-50 hover:bg-blue-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="space-y-2 w-full">
                      <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-[#0072CE] font-bold">
                        Click here to change image ({imageFile ? imageFile.name : "Current Image"})
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0072CE] flex items-center justify-center">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        Click or drag image here to upload
                      </p>
                      <p className="text-xs text-gray-400">
                        Recommended: High resolution 1920x800 px (PNG, JPG, WEBP)
                      </p>
                    </>
                  )}
                </div>
                {editSlide && !imageFile && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Leave as is to keep the current banner image.
                  </p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Call-to-Action Buttons (Optional)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Primary Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Book Appointment"
                      value={primaryBtnText}
                      onChange={(e) => setPrimaryBtnText(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Primary Button Link</label>
                    <input
                      type="text"
                      placeholder="e.g. #appointment or /appointment"
                      value={primaryBtnLink}
                      onChange={(e) => setPrimaryBtnLink(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg mt-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Secondary Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Explore Departments"
                      value={secondaryBtnText}
                      onChange={(e) => setSecondaryBtnText(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Secondary Button Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /departments"
                      value={secondaryBtnLink}
                      onChange={(e) => setSecondaryBtnLink(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#0072CE] rounded focus:ring-[#0072CE]"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Activate this slide immediately on the homepage slider
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0072CE] hover:bg-[#005ba6] text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Slide...</span>
                    </>
                  ) : (
                    <span>{editSlide ? "Update Slide" : "Create Slide"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
