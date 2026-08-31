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
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Upload,
  Link as LinkIcon,
  Video,
  User,
  Mail,
  Phone,
  Tag,
  CheckSquare,
  Square,
  AlertCircle
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE || "http://localhost:5000";

export type MediaCategory = "press-release" | "media-coverage" | "newsletters" | "media-connect";

export interface MediaItem {
  id: number;
  title: string;
  slug: string;
  category: MediaCategory;
  subtitle?: string | null;
  content?: string | null;
  hospital?: string | null;
  publishDate: string;
  expiryDate?: string | null;
  image?: string | null;
  gallery?: string | null;
  publicationSource?: string | null;
  sourceUrl?: string | null;
  author?: string | null;
  documentUrl?: string | null;
  fileSize?: string | null;
  edition?: string | null;
  videoUrl?: string | null;
  location?: string | null;
  tags?: string | null;
  partnerOrganization?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  pressKitUrl?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  viewsCount: number;
  downloadCount: number;
  sortOrder: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MediaManagerProps {
  fixedCategory?: MediaCategory;
  pageTitle?: string;
  pageSubtitle?: string;
}

const CATEGORY_META: Record<MediaCategory, { label: string; color: string; bg: string; border: string; icon: any }> = {
  "press-release": { label: "Press Release", color: "#0072CE", bg: "#EBF5FF", border: "#B9E1FF", icon: FileText },
  "media-coverage": { label: "Media Coverage", color: "#7C3AED", bg: "#F3E8FF", border: "#DDD6FE", icon: ExternalLink },
  "newsletters": { label: "Newsletters", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", icon: Download },
  "media-connect": { label: "Media Connect", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: User },
};

const resolveAssetUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${ASSET_BASE}${url}`;
  return url;
};

export default function MediaManager({ fixedCategory, pageTitle, pageSubtitle }: MediaManagerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | MediaCategory>(fixedCategory || "all");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views" | "title">("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Form State
  const [formCategory, setFormCategory] = useState<MediaCategory>(fixedCategory || "press-release");
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formHospital, setFormHospital] = useState("Dhamma Institute of Medical Sciences, Patna");
  const [formPublishDate, setFormPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formPublicationSource, setFormPublicationSource] = useState("");
  const [formSourceUrl, setFormSourceUrl] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formDocumentUrl, setFormDocumentUrl] = useState("");
  const [formFileSize, setFormFileSize] = useState("");
  const [formEdition, setFormEdition] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formLocation, setFormLocation] = useState("Patna, Bihar");
  const [formTags, setFormTags] = useState("");
  const [formPartnerOrg, setFormPartnerOrg] = useState("");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formPressKitUrl, setFormPressKitUrl] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [formTab, setFormTab] = useState<"basic" | "media" | "specific" | "content" | "seo">("basic");

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "");

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/media?page=${currentPage}&limit=${rowsPerPage}&sort=${sortBy}`;
      if (fixedCategory) {
        url += `&category=${fixedCategory}`;
      } else if (activeTab !== "all") {
        url += `&category=${activeTab}`;
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
        setItems(data.data || []);
        if (data.pagination) {
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching media items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fixedCategory, activeTab, statusFilter, featuredFilter, sortBy, currentPage, rowsPerPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchItems();
  };

  const resetForm = () => {
    setEditId(null);
    setFormCategory(fixedCategory || "press-release");
    setFormTitle("");
    setFormSlug("");
    setFormSubtitle("");
    setFormContent("");
    setFormHospital("Dhamma Institute of Medical Sciences, Patna");
    setFormPublishDate(new Date().toISOString().slice(0, 10));
    setFormExpiryDate("");
    setFormImageUrl("");
    setFormPublicationSource("");
    setFormSourceUrl("");
    setFormAuthor("");
    setFormDocumentUrl("");
    setFormFileSize("");
    setFormEdition("");
    setFormVideoUrl("");
    setFormLocation("Patna, Bihar");
    setFormTags("");
    setFormPartnerOrg("");
    setFormContactPerson("");
    setFormContactEmail("");
    setFormContactPhone("");
    setFormPressKitUrl("");
    setFormIsFeatured(false);
    setFormIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setDocFile(null);
    setFormTab("basic");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item: MediaItem) => {
    setEditId(item.id);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormSubtitle(item.subtitle || "");
    
    // Parse content if JSON array
    let parsedContent = item.content || "";
    try {
      const arr = JSON.parse(item.content || "");
      if (Array.isArray(arr)) parsedContent = arr.join("\n\n");
    } catch {
      // keep raw string
    }
    setFormContent(parsedContent);

    setFormHospital(item.hospital || "Dhamma Institute of Medical Sciences, Patna");
    setFormPublishDate(item.publishDate ? item.publishDate.slice(0, 10) : "");
    setFormExpiryDate(item.expiryDate ? item.expiryDate.slice(0, 10) : "");
    setFormImageUrl(item.image || "");
    setFormPublicationSource(item.publicationSource || "");
    setFormSourceUrl(item.sourceUrl || "");
    setFormAuthor(item.author || "");
    setFormDocumentUrl(item.documentUrl || "");
    setFormFileSize(item.fileSize || "");
    setFormEdition(item.edition || "");
    setFormVideoUrl(item.videoUrl || "");
    setFormLocation(item.location || "Patna, Bihar");
    
    // Parse tags
    let parsedTags = item.tags || "";
    try {
      const tagArr = JSON.parse(item.tags || "");
      if (Array.isArray(tagArr)) parsedTags = tagArr.join(", ");
    } catch {
      // keep raw string
    }
    setFormTags(parsedTags);

    setFormPartnerOrg(item.partnerOrganization || "");
    setFormContactPerson(item.contactPerson || "");
    setFormContactEmail(item.contactEmail || "");
    setFormContactPhone(item.contactPhone || "");
    setFormPressKitUrl(item.pressKitUrl || "");
    setFormIsFeatured(item.isFeatured);
    setFormIsActive(item.isActive);
    setImageFile(null);
    setImagePreview(resolveAssetUrl(item.image) || null);
    setDocFile(null);
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

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile(file);
      if (!formFileSize) {
        const mb = (file.size / (1024 * 1024)).toFixed(1);
        setFormFileSize(`${mb} MB`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPublishDate) {
      alert("Please enter a title and publish date.");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `${API_BASE}/media/${editId}` : `${API_BASE}/media`;
      const method = editId ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("title", formTitle.trim());
      formData.append("category", formCategory);
      formData.append("publishDate", formPublishDate);
      if (formSlug.trim()) formData.append("slug", formSlug.trim());
      if (formSubtitle.trim()) formData.append("subtitle", formSubtitle.trim());
      
      // Convert content to JSON paragraphs
      const paragraphs = formContent.split("\n\n").map(p => p.trim()).filter(Boolean);
      formData.append("content", JSON.stringify(paragraphs.length > 0 ? paragraphs : [formContent]));

      formData.append("hospital", formHospital.trim());
      if (formExpiryDate) formData.append("expiryDate", formExpiryDate);
      if (formPublicationSource.trim()) formData.append("publicationSource", formPublicationSource.trim());
      if (formSourceUrl.trim()) formData.append("sourceUrl", formSourceUrl.trim());
      if (formAuthor.trim()) formData.append("author", formAuthor.trim());
      if (formFileSize.trim()) formData.append("fileSize", formFileSize.trim());
      if (formEdition.trim()) formData.append("edition", formEdition.trim());
      if (formVideoUrl.trim()) formData.append("videoUrl", formVideoUrl.trim());
      if (formLocation.trim()) formData.append("location", formLocation.trim());
      
      // Tags as JSON array
      const tagList = formTags.split(",").map(t => t.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(tagList));

      if (formPartnerOrg.trim()) formData.append("partnerOrganization", formPartnerOrg.trim());
      if (formContactPerson.trim()) formData.append("contactPerson", formContactPerson.trim());
      if (formContactEmail.trim()) formData.append("contactEmail", formContactEmail.trim());
      if (formContactPhone.trim()) formData.append("contactPhone", formContactPhone.trim());
      if (formPressKitUrl.trim()) formData.append("pressKitUrl", formPressKitUrl.trim());

      formData.append("isFeatured", formIsFeatured.toString());
      formData.append("isActive", formIsActive.toString());

      // Files or direct URLs
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (formImageUrl.trim()) {
        formData.append("image", formImageUrl.trim());
      }

      if (docFile) {
        formData.append("document", docFile);
      } else if (formDocumentUrl.trim()) {
        formData.append("documentUrl", formDocumentUrl.trim());
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
        fetchItems();
      } else {
        alert(data.message || "Failed to save media article.");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert("An error occurred while saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this media article?")) return;
    try {
      const res = await fetch(`${API_BASE}/media/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      } else {
        alert(data.message || "Failed to delete item.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleToggle = async (id: number, field: "isActive" | "isFeatured") => {
    try {
      const res = await fetch(`${API_BASE}/media/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ field }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev =>
          prev.map(item => (item.id === id ? { ...item, [field]: !item[field] } : item))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  // Stats calculation
  const totalArticles = totalCount || items.length;
  const activeCount = items.filter(i => i.isActive).length;
  const featuredCount = items.filter(i => i.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">
              {pageTitle || (fixedCategory ? CATEGORY_META[fixedCategory].label : "Media Centre Hub")}
            </h1>
            {fixedCategory && (
              <span
                className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
                style={{
                  color: CATEGORY_META[fixedCategory].color,
                  backgroundColor: CATEGORY_META[fixedCategory].bg,
                  border: `1px solid ${CATEGORY_META[fixedCategory].border}`,
                }}
              >
                {CATEGORY_META[fixedCategory].label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {pageSubtitle || "Manage press releases, media coverage, newsletters, and media connect records."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchItems()}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:opacity-95 cursor-pointer"
            style={{ background: "#0072CE" }}
          >
            <Plus size={18} /> Add New Article
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-[#0072CE]">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Articles</p>
            <p className="text-xl font-black text-gray-900">{totalArticles}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active & Published</p>
            <p className="text-xl font-black text-gray-900">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
            <Star size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</p>
            <p className="text-xl font-black text-gray-900">{featuredCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Media Categories</p>
            <p className="text-xl font-black text-gray-900">{fixedCategory ? "1 Selected" : "4 Active"}</p>
          </div>
        </div>
      </div>

      {/* Category Tabs (Only if All Media page) */}
      {!fixedCategory && (
        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex overflow-x-auto gap-2">
          {[
            { key: "all", label: "All Media (Everything)" },
            { key: "press-release", label: "📰 Press Releases" },
            { key: "media-coverage", label: "📺 Media Coverage" },
            { key: "newsletters", label: "📑 Newsletters" },
            { key: "media-connect", label: "🤝 Media Connect" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#0072CE] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter & Search Control Panel */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search title, source, content..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072CE]"
          />
        </form>

        {/* Dropdowns */}
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
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select
            value={featuredFilter}
            onChange={e => {
              setFeaturedFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white focus:outline-none focus:border-[#0072CE]"
          >
            <option value="all">All Items</option>
            <option value="featured">Featured ⭐</option>
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

          {/* Rows per page */}
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
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Content: Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-[#0072CE]" />
            <p className="text-sm font-medium">Loading media records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-base font-bold text-gray-800">No media articles found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No records match your criteria. Click &quot;Add New Article&quot; to publish a new piece of content.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-[#0072CE] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
            >
              Add Article Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">#</th>
                  <th className="py-3.5 px-4 w-16">Image</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  {!fixedCategory && <th className="py-3.5 px-4">Category</th>}
                  <th className="py-3.5 px-4">Publish Date</th>
                  <th className="py-3.5 px-4">Source / Partner</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Active</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {items.map((item, idx) => {
                  const meta = CATEGORY_META[item.category] || CATEGORY_META["press-release"];
                  const resolvedImg = resolveAssetUrl(item.image);

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-3.5 px-4 text-center text-gray-400 font-bold">
                        {(currentPage - 1) * rowsPerPage + idx + 1}
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 flex items-center justify-center shrink-0">
                          {resolvedImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolvedImg}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={18} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* Title & Info */}
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#0072CE] transition-colors">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.subtitle}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Building2 size={11} /> {item.hospital || "Dhamma Institute"}
                          </span>
                          {item.documentUrl && (
                            <a
                              href={resolveAssetUrl(item.documentUrl) || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                            >
                              <Download size={11} /> PDF {item.fileSize ? `(${item.fileSize})` : ""}
                            </a>
                          )}
                          {item.viewsCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye size={11} /> {item.viewsCount} views
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      {!fixedCategory && (
                        <td className="py-3.5 px-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{
                              color: meta.color,
                              backgroundColor: meta.bg,
                              border: `1px solid ${meta.border}`,
                            }}
                          >
                            {meta.label}
                          </span>
                        </td>
                      )}

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <Calendar size={12} className="text-gray-400" />
                          {item.publishDate}
                        </span>
                      </td>

                      {/* Category-Specific Source Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.category === "media-coverage" && (
                          <div>
                            <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                              {item.publicationSource || "News Outlet"}
                            </span>
                            {item.sourceUrl && (
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-[10px] text-blue-600 hover:underline mt-0.5"
                              >
                                View Source <ExternalLink size={9} className="inline" />
                              </a>
                            )}
                          </div>
                        )}

                        {item.category === "newsletters" && (
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            {item.edition || "Monthly Issue"}
                          </span>
                        )}

                        {item.category === "media-connect" && (
                          <div>
                            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                              {item.partnerOrganization || item.contactPerson || "Liaison"}
                            </span>
                            {item.contactPhone && (
                              <p className="text-[10px] text-gray-400 mt-0.5">{item.contactPhone}</p>
                            )}
                          </div>
                        )}

                        {item.category === "press-release" && (
                          <span className="text-gray-500 text-[11px]">PR Bureau</span>
                        )}
                      </td>

                      {/* Featured Toggle */}
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

                      {/* Active Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(item.id, "isActive")}
                          title={item.isActive ? "Active (Click to disable)" : "Inactive (Click to activate)"}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            item.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {item.isActive ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Article"
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

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>
              Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount} records
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editId ? "Edit Media Article" : "Create New Media Article"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fill in the details below. All fields are synchronized with the main website.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Stepper / Tabs */}
            <div className="px-6 border-b border-gray-100 flex overflow-x-auto gap-4 text-xs font-bold">
              {[
                { id: "basic", label: "1. Basic Details" },
                { id: "media", label: "2. Images & Files" },
                { id: "specific", label: "3. Category Specifics" },
                { id: "content", label: "4. Full Content" },
                { id: "seo", label: "5. Tags & SEO" },
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

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: BASIC DETAILS */}
              {formTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="e.g. Dhamma Institute Performs Milestone Cartilage Surgery"
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072CE]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Category *
                      </label>
                      <select
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value as any)}
                        disabled={!!fixedCategory}
                        className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#0072CE]"
                      >
                        <option value="press-release">📰 Press Release</option>
                        <option value="media-coverage">📺 Media Coverage</option>
                        <option value="newsletters">📑 Newsletters</option>
                        <option value="media-connect">🤝 Media Connect</option>
                      </select>
                    </div>

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
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Subtitle / Deck / Summary
                    </label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={e => setFormSubtitle(e.target.value)}
                      placeholder="Short 1-line lead summary for cards and hero"
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072CE]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Hospital / Institution Branch
                      </label>
                      <input
                        type="text"
                        value={formHospital}
                        onChange={e => setFormHospital(e.target.value)}
                        placeholder="Dhamma Institute of Medical Sciences, Patna"
                        className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Location / City
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={e => setFormLocation(e.target.value)}
                        placeholder="Patna, Bihar"
                        className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0072CE]"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={e => setFormIsActive(e.target.checked)}
                        className="w-4 h-4 text-[#0072CE] rounded focus:ring-0"
                      />
                      <span>Active & Published on Website</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={e => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-0"
                      />
                      <span>⭐ Feature on Media Homepage</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES & FILES */}
              {formTab === "media" && (
                <div className="space-y-5">
                  {/* Featured Image */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                      Featured Primary Image (Thumbnail & Hero Header)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0072CE] file:text-white hover:file:bg-[#00509E] cursor-pointer"
                        />
                        <p className="text-[11px] text-gray-400 mt-2">
                          Upload high resolution PNG, JPG, or WebP. Or enter an image URL below:
                        </p>
                        <input
                          type="text"
                          value={formImageUrl}
                          onChange={e => {
                            setFormImageUrl(e.target.value);
                            setImagePreview(e.target.value);
                          }}
                          placeholder="or paste URL e.g. /images/media/media_1.png"
                          className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      {/* Live Image Preview */}
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
                            <span className="text-xs">No image selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document / PDF Attachment */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                      PDF Document Attachment (For Newsletters, Press Kits & Research Reports)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleDocFileChange}
                          className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formDocumentUrl}
                          onChange={e => setFormDocumentUrl(e.target.value)}
                          placeholder="or paste PDF link e.g. /uploads/media/newsletter.pdf"
                          className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 uppercase">File Size Label</label>
                        <input
                          type="text"
                          value={formFileSize}
                          onChange={e => setFormFileSize(e.target.value)}
                          placeholder="e.g. 4.2 MB"
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Video / YouTube Embed URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formVideoUrl}
                      onChange={e => setFormVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORY SPECIFICS */}
              {formTab === "specific" && (
                <div className="space-y-4">
                  {formCategory === "media-coverage" && (
                    <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                      <p className="text-xs font-black text-purple-900 uppercase">Media Coverage Specifics</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700">Publication Source / Media Outlet</label>
                          <input
                            type="text"
                            value={formPublicationSource}
                            onChange={e => setFormPublicationSource(e.target.value)}
                            placeholder="e.g. Times of India, NDTV, Dainik Bhaskar"
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700">Original Article External URL</label>
                          <input
                            type="url"
                            value={formSourceUrl}
                            onChange={e => setFormSourceUrl(e.target.value)}
                            placeholder="https://timesofindia.indiatimes.com/..."
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formCategory === "newsletters" && (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-4">
                      <p className="text-xs font-black text-emerald-900 uppercase">Newsletter Edition Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700">Edition / Issue Title</label>
                          <input
                            type="text"
                            value={formEdition}
                            onChange={e => setFormEdition(e.target.value)}
                            placeholder="e.g. June 2026 | Vol. 4 Issue 6"
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700">Author / Editorial Board</label>
                          <input
                            type="text"
                            value={formAuthor}
                            onChange={e => setFormAuthor(e.target.value)}
                            placeholder="e.g. Medical Editorial Committee"
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formCategory === "media-connect" && (
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4">
                      <p className="text-xs font-black text-amber-900 uppercase">Media Connect & PR Liaison Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700">Partner Organization / MoU Entity</label>
                          <input
                            type="text"
                            value={formPartnerOrg}
                            onChange={e => setFormPartnerOrg(e.target.value)}
                            placeholder="e.g. AIIMS Patna, WHO, NMC"
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700">Spokesperson / Media Contact Person</label>
                          <input
                            type="text"
                            value={formContactPerson}
                            onChange={e => setFormContactPerson(e.target.value)}
                            placeholder="e.g. Dr. Rajesh Verma (Media Liaison)"
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700">Official Press Email</label>
                          <input
                            type="email"
                            value={formContactEmail}
                            onChange={e => setFormContactEmail(e.target.value)}
                            placeholder="press@dhammainstitute.com"
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700">Official Press Phone</label>
                          <input
                            type="text"
                            value={formContactPhone}
                            onChange={e => setFormContactPhone(e.target.value)}
                            placeholder="+91 7643990301"
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formCategory === "press-release" && (
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4">
                      <p className="text-xs font-black text-blue-900 uppercase">Press Release Bureau Info</p>
                      <div>
                        <label className="text-xs font-bold text-gray-700">Author / PR Bureau</label>
                        <input
                          type="text"
                          value={formAuthor}
                          onChange={e => setFormAuthor(e.target.value)}
                          placeholder="Hospital Communications & Media Bureau"
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CONTENT */}
              {formTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Full Article Body / Content *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Separate paragraphs by pressing Enter twice (a blank line between paragraphs).
                    </p>
                    <textarea
                      rows={12}
                      value={formContent}
                      onChange={e => setFormContent(e.target.value)}
                      placeholder="Write or paste full press release or article text here..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072CE]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: SEO & TAGS */}
              {formTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Custom URL Slug (Auto-generated from title if blank)
                    </label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={e => setFormSlug(e.target.value)}
                      placeholder="e.g. cartilage-repair-surgery-milestone"
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tags / Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      placeholder="e.g. Cardiology, Surgery, AIIMS, Rural Healthcare"
                      className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0072CE]"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                  {formTab !== "basic" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ("basic" | "media" | "specific" | "content" | "seo")[] = ["basic", "media", "specific", "content", "seo"];
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
                        const tabs: ("basic" | "media" | "specific" | "content" | "seo")[] = ["basic", "media", "specific", "content", "seo"];
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
                    {editId ? "Update Article" : "Publish Article"}
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
