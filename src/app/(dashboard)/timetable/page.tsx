"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle, FileText, ImageIcon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE || "http://localhost:5000";

interface TimeTable {
    id: number;
    title: string;
    programme: string;
    year: string;
    semester: string | null;
    session: string | null;
    pdfFile: string | null;
    imageFile: string | null;
    displayOrder: number;
    isActive: boolean;
}

export default function TimeTableAdminPage() {
    const [items, setItems] = useState<TimeTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [title, setTitle] = useState("");
    const [programme, setProgramme] = useState("MBBS");
    const [year, setYear] = useState("");
    const [semester, setSemester] = useState("");
    const [session, setSession] = useState("");
    const [displayOrder, setDisplayOrder] = useState(999);
    const [isActive, setIsActive] = useState(true);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;
    const token = () => localStorage.getItem("admin_token") || "";

    const fetchItems = () => {
        setLoading(true);
        fetch(`${API_BASE}/timetable/admin/all`, { headers: { Authorization: `Bearer ${token()}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setItems(d.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchItems(); }, []);

    const resetForm = () => {
        setTitle(""); setProgramme("MBBS"); setYear(""); setSemester("");
        setSession(""); setDisplayOrder(999); setIsActive(true);
        setPdfFile(null); setImageFile(null);
    };

    const handleSave = async () => {
        if (!title || !programme || !year) return alert("Title, Programme, and Year are required.");
        const url = editId ? `${API_BASE}/timetable/${editId}` : `${API_BASE}/timetable`;
        const method = editId ? "PUT" : "POST";

        const formData = new FormData();
        formData.append("title", title);
        formData.append("programme", programme);
        formData.append("year", year);
        if (semester) formData.append("semester", semester);
        if (session) formData.append("session", session);
        formData.append("displayOrder", displayOrder.toString());
        formData.append("isActive", isActive.toString());
        if (pdfFile) formData.append("pdfFile", pdfFile);
        if (imageFile) formData.append("imageFile", imageFile);

        const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: formData });
        const data = await res.json();
        if (data.success) { setShowForm(false); setEditId(null); resetForm(); fetchItems(); }
        else alert(data.message || "Failed to save.");
    };

    const handleEdit = (item: TimeTable) => {
        setEditId(item.id); setTitle(item.title); setProgramme(item.programme);
        setYear(item.year); setSemester(item.semester || ""); setSession(item.session || "");
        setDisplayOrder(item.displayOrder); setIsActive(item.isActive);
        setPdfFile(null); setImageFile(null); setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this time table?")) return;
        await fetch(`${API_BASE}/timetable/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
        fetchItems();
    };

    const handleToggle = async (id: number) => {
        await fetch(`${API_BASE}/timetable/${id}/toggle-status`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}` } });
        fetchItems();
    };

    const totalPages = Math.ceil(items.length / rowsPerPage) || 1;
    const paginated = items.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Academic Time Tables</h1>
                <button onClick={() => { setShowForm(true); setEditId(null); resetForm(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white text-sm font-semibold rounded-lg hover:bg-[#0f2557] w-fit">
                    <Plus size={16} /> Add Time Table
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">{editId ? "Edit Time Table" : "Add Time Table"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-full">
                                <label className="text-xs font-bold text-gray-600 uppercase">Title *</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. MBBS 1st Year Time Table 2024-25" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Programme *</label>
                                <select value={programme} onChange={e => setProgramme(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 bg-white">
                                    <option>MBBS</option><option>MD</option><option>MS</option><option>BSc Nursing</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Year *</label>
                                <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 bg-white">
                                    <option value="">Select Year</option>
                                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>Final Year</option><option>All Years</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Semester (Optional)</label>
                                <input value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. 1st Semester" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Session (Optional)</label>
                                <input value={session} onChange={e => setSession(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. 2024-25" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Display Order</label>
                                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">PDF File (Optional)</label>
                                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700" />
                                {editId && !pdfFile && <p className="text-[10px] text-gray-400 mt-1">Leave empty to keep existing PDF.</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Preview Image (Optional)</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
                                {editId && !imageFile && <p className="text-[10px] text-gray-400 mt-1">Leave empty to keep existing image.</p>}
                            </div>
                            <div className="col-span-full bg-gray-50 p-3 rounded-lg border">
                                <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                                    Active (Visible on Website)
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">Save</button>
                            <button onClick={() => { setShowForm(false); setEditId(null); resetForm(); }} className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginated.map(item => (
                            <div key={item.id} className={`bg-white rounded-xl border p-0 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition ${!item.isActive ? 'opacity-60' : 'border-gray-200'}`}>
                                <div className="h-28 bg-gray-100 relative border-b">
                                    {item.imageFile ? (
                                        <img src={`${ASSET_BASE}${item.imageFile}`} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon size={28} />
                                        </div>
                                    )}
                                    {item.pdfFile && (
                                        <a href={`${ASSET_BASE}${item.pdfFile}`} target="_blank" className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-red-600 p-1.5 rounded shadow-sm hover:bg-white" title="View PDF">
                                            <FileText size={14} />
                                        </a>
                                    )}
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <div className="flex gap-1 flex-wrap mb-2">
                                        <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{item.programme}</span>
                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{item.year}</span>
                                        {item.session && <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{item.session}</span>}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-xs leading-snug line-clamp-2 flex-1">{item.title}</h3>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                                        </div>
                                        <button onClick={() => handleToggle(item.id)}
                                            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded transition ${item.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                                            {item.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                            {item.isActive ? 'Active' : 'Hidden'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                                No time tables found. Click "Add Time Table" to create one.
                            </div>
                        )}
                    </div>
                    {items.length > rowsPerPage && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <span className="text-xs text-gray-500">Page {currentPage} of {totalPages} ({items.length} total)</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
