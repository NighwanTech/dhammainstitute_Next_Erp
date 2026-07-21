"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle, IndianRupee, FileText } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE || "http://localhost:5000";

interface FeeStructure {
    id: number;
    programme: string;
    quota: string;
    year: string;
    session: string | null;
    tuitionFee: string | null;
    hostelFee: string | null;
    developmentFee: string | null;
    cautionDeposit: string | null;
    otherFee: string | null;
    totalFee: string | null;
    notes: string | null;
    pdfFile: string | null;
    displayOrder: number;
    isActive: boolean;
}

export default function FeeStructureAdminPage() {
    const [items, setItems] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [programme, setProgramme] = useState("MBBS");
    const [quota, setQuota] = useState("");
    const [year, setYear] = useState("1st Year");
    const [session, setSession] = useState("");
    const [tuitionFee, setTuitionFee] = useState("");
    const [hostelFee, setHostelFee] = useState("");
    const [developmentFee, setDevelopmentFee] = useState("");
    const [cautionDeposit, setCautionDeposit] = useState("");
    const [otherFee, setOtherFee] = useState("");
    const [totalFee, setTotalFee] = useState("");
    const [notes, setNotes] = useState("");
    const [displayOrder, setDisplayOrder] = useState(999);
    const [isActive, setIsActive] = useState(true);
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const token = () => localStorage.getItem("admin_token") || "";

    const fetchItems = () => {
        setLoading(true);
        fetch(`${API_BASE}/fee-structure/admin/all`, { headers: { Authorization: `Bearer ${token()}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setItems(d.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchItems(); }, []);

    const resetForm = () => {
        setProgramme("MBBS"); setQuota(""); setYear("1st Year"); setSession("");
        setTuitionFee(""); setHostelFee(""); setDevelopmentFee(""); setCautionDeposit("");
        setOtherFee(""); setTotalFee(""); setNotes(""); setDisplayOrder(999); setIsActive(true); setPdfFile(null);
    };

    const handleSave = async () => {
        if (!programme || !quota) return alert("Programme and Quota are required.");
        const url = editId ? `${API_BASE}/fee-structure/${editId}` : `${API_BASE}/fee-structure`;
        const method = editId ? "PUT" : "POST";

        const formData = new FormData();
        formData.append("programme", programme);
        formData.append("quota", quota);
        formData.append("year", year);
        if (session) formData.append("session", session);
        if (tuitionFee) formData.append("tuitionFee", tuitionFee);
        if (hostelFee) formData.append("hostelFee", hostelFee);
        if (developmentFee) formData.append("developmentFee", developmentFee);
        if (cautionDeposit) formData.append("cautionDeposit", cautionDeposit);
        if (otherFee) formData.append("otherFee", otherFee);
        if (totalFee) formData.append("totalFee", totalFee);
        if (notes) formData.append("notes", notes);
        formData.append("displayOrder", displayOrder.toString());
        formData.append("isActive", isActive.toString());
        if (pdfFile) formData.append("pdfFile", pdfFile);

        const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: formData });
        const data = await res.json();
        if (data.success) { setShowForm(false); setEditId(null); resetForm(); fetchItems(); }
        else alert(data.message || "Failed to save.");
    };

    const handleEdit = (item: FeeStructure) => {
        setEditId(item.id); setProgramme(item.programme); setQuota(item.quota); setYear(item.year);
        setSession(item.session || ""); setTuitionFee(item.tuitionFee || ""); setHostelFee(item.hostelFee || "");
        setDevelopmentFee(item.developmentFee || ""); setCautionDeposit(item.cautionDeposit || "");
        setOtherFee(item.otherFee || ""); setTotalFee(item.totalFee || ""); setNotes(item.notes || "");
        setDisplayOrder(item.displayOrder); setIsActive(item.isActive); setPdfFile(null); setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this fee structure record?")) return;
        await fetch(`${API_BASE}/fee-structure/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
        fetchItems();
    };

    const handleToggle = async (id: number) => {
        await fetch(`${API_BASE}/fee-structure/${id}/toggle-status`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}` } });
        fetchItems();
    };

    const totalPages = Math.ceil(items.length / rowsPerPage) || 1;
    const paginated = items.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Fee Structure Management</h1>
                <button onClick={() => { setShowForm(true); setEditId(null); resetForm(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white text-sm font-semibold rounded-lg hover:bg-[#0f2557] w-fit">
                    <Plus size={16} /> Add Fee Structure
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">{editId ? "Edit Fee Structure" : "Add Fee Structure"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Programme *</label>
                                <select value={programme} onChange={e => setProgramme(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 bg-white">
                                    <option>MBBS</option><option>MD</option><option>MS</option><option>BSc Nursing</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Quota / Category *</label>
                                <input value={quota} onChange={e => setQuota(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. State Govt. Quota" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Year</label>
                                <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 bg-white">
                                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>Final Year</option><option>All Years</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Session (Optional)</label>
                                <input value={session} onChange={e => setSession(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. 2024-25" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Tuition Fee (Annual)</label>
                                <input value={tuitionFee} onChange={e => setTuitionFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. ₹5,00,000" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Hostel & Mess Fee</label>
                                <input value={hostelFee} onChange={e => setHostelFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. ₹1,20,000" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Development Fee</label>
                                <input value={developmentFee} onChange={e => setDevelopmentFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. ₹50,000" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Caution Deposit (Refundable)</label>
                                <input value={cautionDeposit} onChange={e => setCautionDeposit(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. ₹10,000" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Other Fee</label>
                                <input value={otherFee} onChange={e => setOtherFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. ₹20,000" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Total Fee (1st Year)</label>
                                <input value={totalFee} onChange={e => setTotalFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. ₹7,00,000" />
                            </div>
                            <div className="col-span-full">
                                <label className="text-xs font-bold text-gray-600 uppercase">Notes / Remarks (Optional)</label>
                                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="Any additional notes..." />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">PDF Attachment (Optional)</label>
                                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700" />
                                {editId && !pdfFile && <p className="text-[10px] text-gray-400 mt-1">Leave empty to keep existing PDF.</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase">Display Order</label>
                                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Programme</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Quota</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Year</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total Fee</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">PDF</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginated.map(item => (
                                    <tr key={item.id} className={`hover:bg-gray-50 transition ${!item.isActive ? 'opacity-60' : ''}`}>
                                        <td className="px-4 py-3"><span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.programme}</span></td>
                                        <td className="px-4 py-3 font-medium text-gray-800 text-xs">{item.quota}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{item.year} {item.session && `· ${item.session}`}</td>
                                        <td className="px-4 py-3 font-bold text-emerald-700 text-xs">{item.totalFee || "—"}</td>
                                        <td className="px-4 py-3">
                                            {item.pdfFile ? (
                                                <a href={`${ASSET_BASE}${item.pdfFile}`} target="_blank" className="text-red-600 hover:text-red-700" title="View PDF"><FileText size={16} /></a>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleToggle(item.id)}
                                                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded transition ${item.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                                                {item.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                {item.isActive ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-12 text-gray-500">No fee structures found. Click "Add Fee Structure" to create one.</td></tr>
                                )}
                            </tbody>
                        </table>
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
