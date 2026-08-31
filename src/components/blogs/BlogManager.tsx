"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Star,
  BookOpen,
  FileText,
  ImageIcon,
  Calendar,
  Clock,
  User,
  Tag,
  RefreshCw,
  X,
  Upload,
  AlertCircle,
  ShieldCheck,
  Building2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE || "http://localhost:5000";

export interface BlogItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  department?: string | null;
  subtitle?: string | null;
  content: string;
  readTime?: string | null;
  publishDate: string;
  image?: string | null;
  author?: string | null;
  authorRole?: string | null;
  authorAvatar?: string | null;
  tags?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  viewsCount: number;
  likesCount: number;
  sortOrder: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

const BLOG_CATEGORIES = [
  "All",
  "Cardiology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "General Health",
  "Accident and Emergency Care",
  "Bariatric Surgery",
  "Arthritis",
  "Alzheimers",
  "Pediatrics",
  "Orthopaedics"
];

const resolveAssetUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${ASSET_BASE}${url}`;
  return url;
};

export default function BlogManager() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views" | "title">("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Cardiology");
  const [formDepartment, setFormDepartment] = useState("DEPARTMENT OF CARDIOLOGY");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formReadTime, setFormReadTime] = useState("6 Min Read");
  const [formPublishDate, setFormPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formAuthor, setFormAuthor] = useState("Dhamma Medical Editorial Team");
  const [formAuthorRole, setFormAuthorRole] = useState("Consultant Specialist");
  const [formAuthorAvatarUrl, setFormAuthorAvatarUrl] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [formTab, setFormTab] = useState<"basic" | "media" | "content" | "seo">("basic");

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/blogs?page=${currentPage}&limit=${rowsPerPage}&sort=${sortBy}`;
      if (selectedCategory !== "All") {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (statusFilter === "active") url += "&isActive=true";
      if (statusFilter === "inactive") url += "&isActive=false";
      if (featuredFilter === "featured") url += "&isFeatured=true";
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data || []);
        if (data.pagination) {
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, statusFilter, featuredFilter, sortBy, currentPage, rowsPerPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const resetForm = () => {
    setEditId(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Cardiology");
    setFormDepartment("DEPARTMENT OF CARDIOLOGY");
    setFormSubtitle("");
    setFormContent("");
    setFormReadTime("6 Min Read");
    setFormPublishDate(new Date().toISOString().slice(0, 10));
    setFormImageUrl("");
    setFormAuthor("Dhamma Medical Editorial Team");
    setFormAuthorRole("Consultant Specialist");
    setFormAuthorAvatarUrl("");
    setFormTags("");
    setFormIsFeatured(false);
    setFormIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setAvatarFile(null);
    setFormTab("basic");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item: BlogItem) => {
    setEditId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormCategory(item.category || "General Health");
    setFormDepartment(item.department || "DEPARTMENT OF GENERAL MEDICINE");
    setFormSubtitle(item.subtitle || "");
    setFormContent(item.content || "");
    setFormReadTime(item.readTime || "6 Min Read");
    setFormPublishDate(item.publishDate ? item.publishDate.slice(0, 10) : "");
    setFormImageUrl(item.image || "");
    setFormAuthor(item.author || "Dhamma Medical Editorial Team");
    setFormAuthorRole(item.authorRole || "Consultant Specialist");
    setFormAuthorAvatarUrl(item.authorAvatar || "");

    // Parse tags
    let parsedTags = item.tags || "";
    try {
      const tagArr = JSON.parse(item.tags || "");
      if (Array.isArray(tagArr)) parsedTags = tagArr.join(", ");
    } catch {
      // keep raw string
    }
    setFormTags(parsedTags);

    setFormIsFeatured(item.isFeatured);
    setFormIsActive(item.isActive);
    setImageFile(null);
    setImagePreview(resolveAssetUrl(item.image) || null);
    setAvatarFile(null);
    setFormTab("basic");
    setShowModal(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !formPublishDate) {
      alert("Please enter a title, content body, and publish date.");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `${API_BASE}/blogs/${editId}` : `${API_BASE}/blogs`;
      const method = editId ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("title", formTitle.trim());
      formData.append("category", formCategory);
      formData.append("department", formDepartment.trim());
      formData.append("publishDate", formPublishDate);
      if (formSlug.trim()) formData.append("slug", formSlug.trim());
      if (formSubtitle.trim()) formData.append("subtitle", formSubtitle.trim());
      formData.append("content", formContent.trim());
      formData.append("readTime", formReadTime.trim());
      formData.append("author", formAuthor.trim());
      formData.append("authorRole", formAuthorRole.trim());

      const tagList = formTags.split(",").map(t => t.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(tagList));

      formData.append("isFeatured", formIsFeatured.toString());
      formData.append("isActive", formIsActive.toString());

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (formImageUrl.trim()) {
        formData.append("image", formImageUrl.trim());
      }

      if (avatarFile) {
        formData.append("authorAvatar", avatarFile);
      } else if (formAuthorAvatarUrl.trim()) {
        formData.append("authorAvatar", formAuthorAvatarUrl.trim());
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchBlogs();
      } else {
        alert(data.message || "Failed to save blog post.");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert("An error occurred while saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this health blog?")) return;
    try {
      const res = await fetch(`${API_BASE}/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchBlogs();
      } else {
        alert(data.message || "Failed to delete item.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleToggle = async (id: number, field: "isActive" | "isFeatured") => {
    try {
      const res = await fetch(`${API_BASE}/blogs/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ field }),
      });
      const data = await res.json();
      if (data.success) {
        setBlogs(prev =>
          prev.map(item => (item.id === id ? { ...item, [field]: !item[field] } : item))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;
  const activeCount = blogs.filter(b => b.isActive).length;
  const featuredCount = blogs.filter(b => b.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">Health Blogs & Articles</h1>
            <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-blue-50 text-[#0072CE] border border-blue-100">
              Patient Corner
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Publish medical advice, disease awareness guides, lifestyle tips, and clinical updates for patients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBlogs()}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:opacity-95 cursor-pointer"
            style={{ background: "#0072CE" }}
          >
            <Plus size={18} /> Add New Blog Post
          </button>
        </div>
      </div>

      {/* ── Stats Summary Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-[#0072CE]">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Blogs</p>
            <p className="text-xl font-black text-gray-900">{totalCount || blogs.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Published</p>
            <p className="text-xl font-black text-gray-900">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
            <Star size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Featured ⭐</p>
            <p className="text-xl font-black text-gray-900">{featuredCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</p>
            <p className="text-xl font-black text-gray-900">12 Specialties</p>
          </div>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex overflow-x-auto gap-2">
        {BLOG_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#0072CE] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Filter & Search Control Panel ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search blogs by title, department, author..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072CE]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white focus:outline-none focus:border-[#0072CE]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Published Only</option>
            <option value="inactive">Drafts Only</option>
          </select>

          <select
            value={featuredFilter}
            onChange={e => {
              setFeaturedFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white focus:outline-none focus:border-[#0072CE]"
          >
            <option value="all">All Articles</option>
            <option value="featured">Featured Only ⭐</option>
          </select>

          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white focus:outline-none focus:border-[#0072CE]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Viewed</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <select
            value={rowsPerPage}
            onChange={e => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white focus:outline-none"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      {/* ── Content Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-[#0072CE]" />
            <p className="text-sm font-medium">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-base font-bold text-gray-800">No blog posts found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Click &quot;Add New Blog Post&quot; to write and publish your first health article.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-[#0072CE] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
            >
              Add Blog Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">#</th>
                  <th className="py-3.5 px-4 w-16">Cover</th>
                  <th className="py-3.5 px-4">Title & Department</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author & Read Time</th>
                  <th className="py-3.5 px-4">Publish Date</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {blogs.map((item, idx) => {
                  const resolvedImg = resolveAssetUrl(item.image) || "/images/blogs/thumb.png";

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-3.5 px-4 text-center text-gray-400 font-bold">
                        {(currentPage - 1) * rowsPerPage + idx + 1}
                      </td>

                      {/* Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolvedImg}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Department */}
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#0072CE] transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                          {item.department || "General Medicine"}
                        </p>
                        {item.viewsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <Eye size={10} /> {item.viewsCount} reads
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0072CE] border border-blue-200">
                          {item.category}
                        </span>
                      </td>

                      {/* Author & Read time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-gray-800 text-xs">{item.author || "Dhamma Team"}</p>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {item.readTime || "5 Min Read"}
                        </span>
                      </td>

                      {/* Publish Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar size={12} className="text-gray-400" />
                          {item.publishDate}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(item.id, "isFeatured")}
                          title={item.isFeatured ? "Featured (Click to unset)" : "Set as Featured"}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            item.isFeatured
                              ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                              : "text-gray-300 hover:text-amber-500"
                          }`}
                        >
                          <Star size={16} fill={item.isFeatured ? "currentColor" : "none"} />
                        </button>
                      </td>

                      {/* Active Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(item.id, "isActive")}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            item.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {item.isActive ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Blog"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Blog"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ── */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>
              Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount} blogs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const hasGap = prev && page - prev > 1;

                  return (
                    <div key={page} className="flex items-center">
                      {hasGap && <span className="px-1 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg font-bold transition-colors cursor-pointer ${
                          page === currentPage
                            ? "bg-[#0072CE] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          ── CREATE / EDIT MODAL ──
      ══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editId ? "Edit Health Blog" : "Create New Health Blog"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Write clinical insights and patient awareness guides. Live sync with the main website.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 border-b border-gray-100 flex overflow-x-auto gap-4 text-xs font-bold">
              {[
                { id: "basic", label: "1. Article Info" },
                { id: "media", label: "2. Cover & Author" },
                { id: "content", label: "3. Content Body" },
                { id: "seo", label: "4. Tags & SEO" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFormTab(tab.id as any)}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    formTab === tab.id
                      ? "border-[#0072CE] text-[#0072CE]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: BASIC INFO */}
              {formTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Blog Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="e.g. Fluttering in Chest: Causes, Symptoms & When to See a Doctor"
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Medical Category *
                      </label>
                      <select
                        value={formCategory}
                        onChange={e => {
                          setFormCategory(e.target.value);
                          setFormDepartment(`DEPARTMENT OF ${e.target.value.toUpperCase()}`);
                        }}
                        className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#0072CE]"
                      >
                        {BLOG_CATEGORIES.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formDepartment}
                        onChange={e => setFormDepartment(e.target.value)}
                        placeholder="e.g. DEPARTMENT OF CARDIOLOGY"
                        className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Publish Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formPublishDate}
                        onChange={e => setFormPublishDate(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#0072CE]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estimated Read Time
                      </label>
                      <input
                        type="text"
                        value={formReadTime}
                        onChange={e => setFormReadTime(e.target.value)}
                        placeholder="e.g. 6 Min Read"
                        className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Subtitle / One-Line Excerpt
                    </label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={e => setFormSubtitle(e.target.value)}
                      placeholder="Brief excerpt for preview cards..."
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={e => setFormIsActive(e.target.checked)}
                        className="w-4 h-4 text-[#0072CE] rounded focus:ring-0"
                      />
                      <span>Published & Live on Patient Corner</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={e => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-0"
                      />
                      <span>⭐ Feature as Top Highlight</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: COVER & AUTHOR */}
              {formTab === "media" && (
                <div className="space-y-5">
                  {/* Cover Image */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                      Blog Featured Cover Image
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0072CE] file:text-white hover:file:bg-[#00509E] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formImageUrl}
                          onChange={e => {
                            setFormImageUrl(e.target.value);
                            setImagePreview(e.target.value);
                          }}
                          placeholder="or paste image URL e.g. /images/blogs/thumb.png"
                          className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="w-full h-36 rounded-xl bg-white border border-gray-200 overflow-hidden relative flex items-center justify-center">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                            <span className="text-xs">No cover selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Author Details */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-3">
                      Author & Clinical Contributor Details
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">Author Name</label>
                        <input
                          type="text"
                          value={formAuthor}
                          onChange={e => setFormAuthor(e.target.value)}
                          placeholder="e.g. Dr. Arvind Kumar"
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">Specialty / Role</label>
                        <input
                          type="text"
                          value={formAuthorRole}
                          onChange={e => setFormAuthorRole(e.target.value)}
                          placeholder="e.g. Senior Interventional Cardiologist"
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTENT */}
              {formTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Full Blog Content (HTML or Formatted Text) *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Supports HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; or plain paragraphs.
                    </p>
                    <textarea
                      rows={14}
                      required
                      value={formContent}
                      onChange={e => setFormContent(e.target.value)}
                      placeholder="Write your article body here... <p>Introduction paragraph...</p>"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono leading-relaxed focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SEO & TAGS */}
              {formTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Custom URL Slug (Auto-generated if empty)
                    </label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={e => setFormSlug(e.target.value)}
                      placeholder="e.g. fluttering-in-chest-symptoms"
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Keywords & Topic Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      placeholder="e.g. Cardiology, Heart Health, Emergency, Palpitations"
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                  {formTab !== "basic" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ("basic" | "media" | "content" | "seo")[] = ["basic", "media", "content", "seo"];
                        const currIdx = tabs.indexOf(formTab);
                        if (currIdx > 0) setFormTab(tabs[currIdx - 1]);
                      }}
                      className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {formTab !== "seo" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ("basic" | "media" | "content" | "seo")[] = ["basic", "media", "content", "seo"];
                        const currIdx = tabs.indexOf(formTab);
                        if (currIdx < tabs.length - 1) setFormTab(tabs[currIdx + 1]);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                    >
                      Next Step
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0072CE] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#00509E] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {saving && <RefreshCw size={14} className="animate-spin" />}
                    {editId ? "Update Blog" : "Publish Blog Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
