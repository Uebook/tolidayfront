'use client';

import Topbar from '@/components/layout/Topbar';
import { User, Mail, Phone, MapPin, Building2, ShieldCheck, Camera, Edit2, FileText, X, Save, Globe, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getAuthUser } from '@/lib/auth';

export default function BusProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
    });
    const queryClient = useQueryClient();

    useEffect(() => {
        setUser(getAuthUser());
    }, []);

    const { data: vendor, isLoading, error } = useQuery({
        queryKey: ['bus-vendor-profile'],
        queryFn: async () => {
            const res = await api.get('/buses/profile');
            return res.data;
        }
    });

    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                address: vendor.address || '',
                gstNumber: vendor.gstNumber || '',
            });
        }
    }, [vendor]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put('/buses/profile', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-vendor-profile'] });
            setIsEditModalOpen(false);
        },
    });

    const handleSave = () => {
        updateProfileMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center bg-slate-50">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <User size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Profile Loading Failed</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                    We couldn't load your agency profile. Please check your connection or try logging in again.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Topbar title="Profile" subtitle="Manage your agency and personal information" />
            
            <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fadeIn">
                
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    </div>
                    <div className="px-8 pb-8 flex flex-col md:flex-row md:items-end gap-6 -mt-12">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                                {vendor.logo ? (
                                    <img src={vendor.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={48} className="text-slate-300" />
                                )}
                            </div>
                            <button className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-900">{vendor.name}</h2>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-green-200">
                                    Verified Agency
                                </span>
                            </div>
                            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                                <MapPin size={14} /> {vendor.address?.split(',')[0] || 'Location unset'}
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Agency Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Building2 size={20} className="text-blue-600" /> Agency Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Name</p>
                                    <p className="text-slate-900 font-medium">{vendor.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GST Number</p>
                                    <p className="text-slate-900 font-medium font-mono">{vendor.gstNumber || 'Not provided'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                    <p className="text-slate-900 font-medium">{vendor.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</p>
                                    <p className="text-slate-900 font-medium">{vendor.phone || 'Not provided'}</p>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Address</p>
                                    <p className="text-slate-900 font-medium leading-relaxed">{vendor.address || 'Address not set'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600" /> Compliance Documents
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'GST Certificate', status: 'Verified', color: 'bg-green-100 text-green-700' },
                                    { label: 'Transport License', status: 'Under Review', color: 'bg-blue-100 text-blue-700' },
                                    { label: 'Vehicle Insurance', status: 'Verified', color: 'bg-green-100 text-green-700' },
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                                <FileText size={20} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{doc.label}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${doc.color}`}>
                                                {doc.status}
                                            </span>
                                            <ChevronRight size={18} className="text-slate-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Personal Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <User size={20} className="text-blue-600" /> My Account
                            </h3>
                            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-2xl mb-4 border border-slate-200">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">{user?.name || 'Administrator'}</h4>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{user?.role || 'User'}</span>
                            </div>
                            <div className="pt-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="text-sm text-slate-600 truncate">{user?.email || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={16} className="text-slate-400" />
                                    <span className="text-sm text-slate-600">{user?.role === 'ADMIN' ? 'Full Access' : 'Limited Access'}</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                                Manage Account
                            </button>
                        </div>

                        <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg shadow-blue-200">
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                <Globe size={18} /> Support Hub
                            </h4>
                            <p className="text-blue-100 text-sm leading-relaxed mb-4">
                                Need help with your profile or documents? Our team is available 24/7.
                            </p>
                            <button className="w-full py-2 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)} />
                        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Agency Name</label>
                                        <input 
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">GST Number</label>
                                        <input 
                                            value={formData.gstNumber || ''}
                                            onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input 
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                        <input 
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                        <textarea 
                                            value={formData.address || ''}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            rows={3}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-6 bg-slate-50 flex justify-end gap-3">
                                <button 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={updateProfileMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
