'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { 
    Users, Plus, Mail, Phone, Shield, Trash2, 
    Edit3, CheckCircle2, XCircle, MoreVertical,
    Lock, Key, Bell, ShieldCheck, X, Save, UserPlus,
    UserX, Edit, ChevronRight, Search, Clock, Edit2
} from 'lucide-react';
import api from '@/lib/api';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    isActive: boolean;
    permissions: Record<string, boolean>;
    lastLogin: string | null;
}

const DEFAULT_PERMISSIONS = {
    property_view: true,
    property_edit: false,
    inventory_view: true,
    inventory_edit: false,
    rates_view: true,
    rates_edit: false,
    bookings_view: true,
    staff_manage: false,
    media_upload: true,
    reports_view: false,
};

const roleColors: Record<string, string> = {
    OWNER: 'text-blue-600',
    MANAGER: 'text-indigo-600',
    ADMIN: 'text-purple-600',
    RECEPTIONIST: 'text-green-600',
};

const roleBg: Record<string, string> = {
    OWNER: 'bg-blue-50',
    MANAGER: 'bg-indigo-50',
    ADMIN: 'bg-purple-50',
    RECEPTIONIST: 'bg-green-50',
};

export default function StaffManagementPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'MANAGER',
        permissions: { ...DEFAULT_PERMISSIONS }
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            setStaff(res.data);
        } catch (err) {
            console.error('Failed to fetch staff', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingStaff) {
                await api.patch(`/staff/${editingStaff.id}`, formData);
            } else {
                await api.post('/staff', formData);
            }
            setShowModal(false);
            fetchStaff();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to save staff member. Please check if email is unique.';
            alert(msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await api.delete(`/staff/${id}`);
            fetchStaff();
            setSelectedStaff(null);
        } catch (err) {
            alert('Cannot delete the owner or failed to delete.');
        }
    };

    const openEdit = (s: StaffMember) => {
        setEditingStaff(s);
        setFormData({
            name: s.name,
            email: s.email,
            phone: s.phone || '',
            role: s.role,
            permissions: { ...DEFAULT_PERMISSIONS, ...s.permissions }
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Topbar title="Staff Management" subtitle="Manage team members and their access permissions" />
            
            <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fadeIn">
                
                {/* Stats & Action */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-4">
                        {[
                            { label: 'Total Staff', value: staff.length, bg: 'bg-white', color: 'text-slate-900' },
                            { label: 'Active', value: staff.filter(s => s.isActive).length, bg: 'bg-green-50', color: 'text-green-600' },
                            { label: 'Managers', value: staff.filter(s => s.role === 'MANAGER').length, bg: 'bg-blue-50', color: 'text-blue-600' },
                        ].map((s) => (
                            <div key={s.label} className={`${s.bg} border border-slate-200 px-6 py-4 rounded-2xl min-w-[140px] text-center shadow-sm`}>
                                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => {
                            setEditingStaff(null);
                            setFormData({
                                name: '', email: '', password: '', phone: '',
                                role: 'MANAGER', permissions: { ...DEFAULT_PERMISSIONS }
                            });
                            setShowModal(true);
                        }}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} /> Add New Staff Member
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Staff List */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Team Directory</h3>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input placeholder="Search staff..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/10 transition-all" />
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="p-8 animate-pulse flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 bg-slate-100 rounded" />
                                            <div className="h-3 w-48 bg-slate-100 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : staff.map((member) => (
                                <div 
                                    key={member.id}
                                    className={`flex items-center gap-5 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedStaff?.id === member.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : ''}`}
                                    onClick={() => setSelectedStaff(selectedStaff?.id === member.id ? null : member)}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${roleBg[member.role] || 'bg-slate-100'} ${roleColors[member.role] || 'text-slate-500'}`}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{member.name}</span>
                                            {member.role === 'OWNER' && <ShieldCheck size={14} className="text-blue-600" />}
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${roleBg[member.role]} ${roleColors[member.role]}`}>
                                            {member.role}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                            <span className="text-xs font-medium text-slate-600">{member.isActive ? 'Active' : 'Offline'}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick View Panel */}
                    <div className="space-y-6">
                        {selectedStaff ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 h-fit sticky top-24 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl mb-4 ${roleBg[selectedStaff.role]} ${roleColors[selectedStaff.role]}`}>
                                        {selectedStaff.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">{selectedStaff.name}</h4>
                                    <span className={`text-xs font-bold uppercase tracking-widest mt-1 ${roleColors[selectedStaff.role]}`}>{selectedStaff.role}</span>
                                </div>

                                <div className="py-6 space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail size={16} className="text-slate-400" /> <span className="truncate">{selectedStaff.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone size={16} className="text-slate-400" /> {selectedStaff.phone || 'No phone set'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Clock size={16} className="text-slate-400" /> {selectedStaff.lastLogin ? new Date(selectedStaff.lastLogin).toLocaleDateString() : 'No activity'}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Key Permissions</p>
                                    {Object.entries(selectedStaff.permissions).slice(0, 5).map(([key, val]) => (
                                        <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{key.replace(/_/g, ' ')}</span>
                                            <div className={`w-2 h-2 rounded-full ${val ? 'bg-green-500' : 'bg-slate-200'}`} />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => openEdit(selectedStaff)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(selectedStaff.id)} className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center opacity-60">
                                <Users size={32} className="text-slate-300 mb-2" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a member to view details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Simplified Professional Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <UserPlus size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{editingStaff ? 'Update Staff Member' : 'New Staff Member'}</h3>
                                        <p className="text-xs font-medium text-slate-500">Configure access levels and notification settings</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Profile Info */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                        <Lock size={14} /> Account Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                            <input 
                                                type="email"
                                                disabled={!!editingStaff}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        {!editingStaff && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Initial Password</label>
                                                <input 
                                                    type="password"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Assigned Role</label>
                                            <select 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            >
                                                <option value="MANAGER">Agency Manager</option>
                                                <option value="ADMIN">Administrative Officer</option>
                                                <option value="RECEPTIONIST">Operations Staff</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Grid */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                        <ShieldCheck size={14} /> Access Permissions
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.keys(DEFAULT_PERMISSIONS).map((perm) => (
                                            <label key={perm} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 group-hover:text-slate-900">
                                                    {perm.replace(/_/g, ' ')}
                                                </span>
                                                <input 
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    checked={formData.permissions[perm]}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        permissions: { ...formData.permissions, [perm]: e.target.checked }
                                                    })}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 items-center">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> {editingStaff ? 'Update Member' : 'Deploy Team Member'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
