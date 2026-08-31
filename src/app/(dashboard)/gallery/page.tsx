"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ImageIcon,
  Video,
  Search,
  RefreshCw,
  Play,
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

interface MediaItem {
  id: number;
  title: string;
  category: string;
  type: "image" | "video";
  mediaUrl: string;
  videoId: string | null;
  thumbnail: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Campus",
  "Hospital",
  "Facilities",
  "Academic",
  "Laboratories",
  "Events",
  "Sports",
  "Emergency",
  "General",
];

export default function GalleryMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Campus");
  const [customCategory, setCustomCategory] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const getToken = () => localStorage.getItem("admin_token") || "";

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gallery`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch gallery media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, categoryFilter, statusFilter, rowsPerPage]);

  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const resetForm = () => {
    setEditItem(null);
    setTitle("");
    setCategory("Campus");
    setCustomCategory("");
    setType("image");
    setMediaUrl("");
    setVideoId("");
    setDescription("");
    setSortOrder(items.length + 1);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item: MediaItem) => {
    setEditItem(item);
    setTitle(item.title);
    if (CATEGORIES.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory("");
    } else {
      setCategory("Other");
      setCustomCategory(item.category);
    }
    setType(item.type);
    setMediaUrl(item.mediaUrl);
    setVideoId(item.videoId || "");
    setDescription(item.description || "");
    setSortOrder(item.sortOrder);
    setIsActive(item.isActive);
    setImageFile(null);
    setThumbnailFile(null);
    setImagePreview(resolveMediaUrl(item.mediaUrl));
    setThumbnailPreview(item.thumbnail ? resolveMediaUrl(item.thumbnail) : null);
    setFormError(null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Media Title / Caption is required.");
      return;
    }

    const finalCategory = category === "Other" ? (customCategory.trim() || "General") : category;

    if (type === "image" && !editItem && !imageFile && !mediaUrl) {
      setFormError("Please upload an image file or provide an image link.");
      return;
    }

    if (type === "video" && !mediaUrl.trim() && !videoId.trim()) {
      setFormError("Please provide a YouTube video link or embed URL.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", finalCategory);
      formData.append("type", type);
      formData.append("description", description.trim());
      formData.append("sortOrder", sortOrder.toString());
      formData.append("isActive", isActive.toString());

      if (type === "video") {
        formData.append("mediaUrl", mediaUrl.trim());
        if (videoId) formData.append("videoId", videoId.trim());
        if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      } else {
        if (imageFile) {
          formData.append("image", imageFile);
        } else if (mediaUrl) {
          formData.append("mediaUrl", mediaUrl.trim());
        }
      }

      const url = editItem
        ? `${API_BASE}/gallery/${editItem.id}`
        : `${API_BASE}/gallery`;
      const method = editItem ? "PUT" : "POST";

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
        fetchMedia();
      } else {
        setFormError(data.message || "Failed to save media item.");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;

    try {
      const res = await fetch(`${API_BASE}/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.message || "Failed to delete item.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting item.");
    }
  };

  const handleToggleActive = async (item: MediaItem) => {
    try {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isActive: !it.isActive } : it))
      );

      const res = await fetch(`${API_BASE}/gallery/${item.id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ field: "isActive" }),
      });

      const data = await res.json();
      if (!data.success) {
        fetchMedia();
      }
    } catch (err) {
      fetchMedia();
    }
  };

  const resolveMediaUrl = (url: string | null) => {
    if (!url) return "/images/gallery/gallery-1.png";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads/")) return `${ASSET_BASE}${url}`;
    return url;
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = item.isActive;
    if (statusFilter === "inactive") matchesStatus = !item.isActive;

    return matchesSearch && matchesType && matchesCat && matchesStatus;
  });

  const totalCount = items.length;
  const photoCount = items.filter((i) => i.type === "image").length;
  const videoCount = items.filter((i) => i.type === "video").length;
  const activeCount = items.filter((i) => i.isActive).length;

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + rowsPerPage);

  const currentExtractedVideoId = extractYouTubeId(mediaUrl);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0072CE]">
              <ImageIcon size={22} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Gallery & Media Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage hospital photos, campus video tours, laboratory showcases, and interactive media sliders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedia}
            title="Refresh Media"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#0072CE]" : ""} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0072CE] hover:bg-[#005ba6] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            <span>Add Media Item</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Media</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0072CE] flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Photos</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{photoCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ImageIcon size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Videos</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{videoCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Video size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active on Website</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Eye size={20} />
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & Filters ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search photos, videos, descriptions..."
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "all" ? "bg-white text-[#0072CE] shadow-sm" : "text-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("image")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "image" ? "bg-white text-[#0072CE] shadow-sm" : "text-gray-600"
              }`}
            >
              Photos ({photoCount})
            </button>
            <button
              onClick={() => setTypeFilter("video")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "video" ? "bg-white text-red-600 shadow-sm" : "text-gray-600"
              }`}
            >
              Videos ({videoCount})
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 border border-transparent rounded-xl text-gray-700 focus:bg-white focus:border-[#0072CE] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 border border-transparent rounded-xl text-gray-700 focus:bg-white focus:border-[#0072CE] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Draft / Hidden</option>
          </select>

          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 border border-transparent rounded-xl text-gray-700 focus:bg-white focus:border-[#0072CE] focus:outline-none"
          >
            <option value={8}>8 per page</option>
            <option value={12}>12 per page</option>
            <option value={16}>16 per page</option>
            <option value={24}>24 per page</option>
          </select>
        </div>
      </div>

      {/* ── Media Items Grid ── */}
      {loading ? (
        <div className="bg-white p-16 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-10 h-10 border-4 border-[#0072CE] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">Loading gallery items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="w-16 h-16 bg-blue-50 text-[#0072CE] rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Media Items Found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            {searchTerm || typeFilter !== "all" || categoryFilter !== "all"
              ? "No items matched your current filter criteria."
              : "No media items added yet. Click below to add your first photo or video!"}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0072CE] hover:bg-[#005ba6] text-white text-sm font-bold rounded-xl shadow transition-all"
          >
            <Plus size={16} /> Add Media
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedItems.map((item) => {
              const thumbUrl = resolveMediaUrl(item.thumbnail || item.mediaUrl);
              const isVid = item.type === "video";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col shadow-sm hover:shadow-md ${
                    item.isActive ? "border-gray-200" : "border-dashed border-gray-300 opacity-75"
                  }`}
                >
                  {/* Media Thumbnail */}
                  <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden group">
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/gallery/gallery-1.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Type Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {isVid ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow">
                          <Video size={11} /> Video
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0072CE] text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow">
                          <ImageIcon size={11} /> Photo
                        </span>
                      )}

                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md border border-white/20">
                        {item.category}
                      </span>
                    </div>

                    {/* Active Toggle */}
                    <div className="absolute top-2.5 right-2.5">
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? "Click to deactivate" : "Click to activate"}
                        className={`p-1 rounded-lg backdrop-blur-md transition-all ${
                          item.isActive
                            ? "bg-emerald-600/90 text-white hover:bg-emerald-600"
                            : "bg-gray-800/90 text-gray-400 hover:bg-gray-800"
                        }`}
                      >
                        {item.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      </button>
                    </div>

                    {/* Video Play Icon */}
                    {isVid && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={18} className="fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Order Tag */}
                    <div className="absolute bottom-2 left-2.5 text-white/70 text-[10px] font-mono">
                      Order: #{item.sortOrder}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">#{item.id}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#0072CE] rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={13} />
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
                  {Math.min(filteredItems.length, startIndex + rowsPerPage)}
                </span>{" "}
                of <span className="font-bold text-gray-900">{filteredItems.length}</span> items
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

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0072CE] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} />
                <h3 className="text-lg font-black">
                  {editItem ? "Edit Media Item" : "Add Media Item"}
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

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Media Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("image")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-bold text-xs transition-all ${
                      type === "image"
                        ? "bg-blue-50 border-[#0072CE] text-[#0072CE] shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ImageIcon size={16} /> Photo / Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("video")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-bold text-xs transition-all ${
                      type === "video"
                        ? "bg-red-50 border-red-600 text-red-600 shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Video size={16} /> Video (YouTube)
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                  Title / Caption <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Hospital Campus Overview"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] font-semibold text-gray-800"
                />
              </div>

              {/* Category & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] font-semibold text-gray-800"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] font-bold text-gray-800"
                  />
                </div>
              </div>

              {/* Custom Category Input if Other */}
              {category === "Other" && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20"
                  />
                </div>
              )}

              {/* Photo Upload Section */}
              {type === "image" ? (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                    Upload Photo Image {!editItem && <span className="text-red-500">*</span>}
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 border-2 border-dashed border-gray-300 hover:border-[#0072CE] bg-gray-50 hover:bg-blue-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="space-y-2 w-full">
                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-[#0072CE] font-bold">
                          Click to change image ({imageFile ? imageFile.name : "Current Image"})
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0072CE] flex items-center justify-center">
                          <UploadCloud size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-700">Click or drag image file here</p>
                        <p className="text-[11px] text-gray-400">PNG, JPG, WEBP (up to 20MB)</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Video Input Section */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                      YouTube Video URL or Video ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-semibold text-gray-800"
                    />
                  </div>

                  {currentExtractedVideoId && (
                    <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-3">
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-red-200">
                        <img
                          src={`https://img.youtube.com/vi/${currentExtractedVideoId}/hqdefault.jpg`}
                          alt="YouTube Thumb"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play size={12} className="fill-white text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-red-700">YouTube Video Detected</p>
                        <p className="text-[11px] text-gray-500 font-mono truncate">
                          ID: {currentExtractedVideoId}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Custom Video Thumbnail (Optional)
                    </label>
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbChange}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                  Description / Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional brief description of this photo or video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 text-gray-800"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="isActiveToggleMedia"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#0072CE] rounded focus:ring-[#0072CE]"
                />
                <label htmlFor="isActiveToggleMedia" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Make this item immediately visible in website gallery &amp; sliders
                </label>
              </div>

              {/* Submit / Cancel buttons */}
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
                      <span>Saving Media...</span>
                    </>
                  ) : (
                    <span>{editItem ? "Update Item" : "Create Item"}</span>
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
