'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { 
    Building, Mail, Phone, Globe, MapPin, 
    Calendar, Briefcase, FileText, Landmark,
    ShieldCheck, Save, Edit3, Camera, CheckCircle2,
    Clock, ExternalLink, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('business');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/packages/profile');
            setProfile(res.data);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.patch('/packages/profile', profile);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'business', label: 'Business Details', icon: Building },
        { id: 'bank', label: 'Bank Information', icon: Landmark },
        { id: 'documents', label: 'Compliance & Docs', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-white text-black">
            <Topbar 
                title="Business Profile" 
                subtitle="Manage your tour agency identity, credentials and payouts"
            />

            <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Profile Header Card */}
                <div className="bg-black text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-[32px] bg-white text-black flex items-center justify-center text-4xl font-black shadow-2xl">
                                {profile?.businessName?.charAt(0) || profile?.name?.charAt(0)}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-3xl font-black italic">{profile?.businessName || profile?.name}</h1>
                                {profile?.isVerified && (
                                    <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center gap-1 uppercase tracking-widest">
                                        <CheckCircle2 size={12} /> Verified
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-400 font-bold flex items-center gap-2 justify-center md:justify-start">
                                <MapPin size={14} className="text-blue-500" /> {profile?.city || 'City not set'} • {profile?.businessType || 'Tour Agency'}
                            </p>
                            <div className="flex items-center gap-4 pt-2 justify-center md:justify-start">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-lg">
                                    Partner ID: {profile?.id.slice(0, 8)}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-lg">
                                    Since {new Date(profile?.createdAt).getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-black text-white shadow-xl translate-x-2' 
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm space-y-10">
                            {activeTab === 'business' && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <Briefcase className="text-blue-600" /> Business Identity
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Business Registered Name</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.businessName || ''}
                                                onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Email (Official)</label>
                                            <input 
                                                type="email"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.email || ''}
                                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operating Website</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.website || ''}
                                                onChange={(e) => setProfile({...profile, website: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Contact Number</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.contactNumber || ''}
                                                onChange={(e) => setProfile({...profile, contactNumber: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Years in Operation</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.yearsInOperation || ''}
                                                onChange={(e) => setProfile({...profile, yearsInOperation: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Main Operating Area</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.operatingArea || ''}
                                                onChange={(e) => setProfile({...profile, operatingArea: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'bank' && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <Landmark className="text-blue-600" /> Settlement Account
                                    </h3>
                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black">Escrow Verification Active</p>
                                            <p className="text-[10px] font-bold text-slate-500">Your payments are secured and settled weekly.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Account Holder Name</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.bankHolder || ''}
                                                onChange={(e) => setProfile({...profile, bankHolder: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Bank Name</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.bankName || ''}
                                                onChange={(e) => setProfile({...profile, bankName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Account Number</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.bankAccount || ''}
                                                onChange={(e) => setProfile({...profile, bankAccount: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">IFSC Code</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.bankIfsc || ''}
                                                onChange={(e) => setProfile({...profile, bankIfsc: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <FileText className="text-blue-600" /> Regulatory Documents
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">GST Number</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.gstNumber || ''}
                                                onChange={(e) => setProfile({...profile, gstNumber: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">PAN Number</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                                                value={profile?.panNumber || ''}
                                                onChange={(e) => setProfile({...profile, panNumber: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { label: 'GST Certificate', key: 'gstDoc' },
                                            { label: 'PAN Card Copy', key: 'panDoc' },
                                            { label: 'Trade License', key: 'licenseDoc' },
                                        ].map((doc) => (
                                            <div key={doc.key} className="p-5 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black">{doc.label}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {profile?.[doc.key] ? 'Document Uploaded' : 'Action Required'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {profile?.[doc.key] ? (
                                                    <button type="button" className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">
                                                        View <ExternalLink size={12} />
                                                    </button>
                                                ) : (
                                                    <button type="button" className="text-xs font-black text-slate-900 bg-slate-200 px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-all">
                                                        Upload
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Clock size={16} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Last updated: {new Date(profile?.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    disabled={isSaving}
                                    className="px-12 py-4 bg-black text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
