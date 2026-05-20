'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { 
    DollarSign, Plus, Calendar, Tag, Info, Trash2, 
    Edit3, CheckCircle2, AlertCircle, Package, 
    Users, ChevronRight, X, Save, IndianRupee
} from 'lucide-react';
import api from '@/lib/api';

interface Rate {
    id: string;
    name: string;
    packageId: string;
    startDate: string;
    endDate: string;
    rate: number;
    childPrice: number;
    infantPrice: number;
    type: string;
}

export default function PricingManagerPage() {
    const [rates, setRates] = useState<Rate[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRate, setEditingRate] = useState<Rate | null>(null);

    const [formData, setFormData] = useState<Partial<Rate>>({
        name: '',
        packageId: '',
        startDate: '',
        endDate: '',
        rate: 0,
        childPrice: 0,
        infantPrice: 0,
        type: 'seasonal'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ratesRes, packagesRes] = await Promise.all([
                api.get('/rates'),
                api.get('/packages')
            ]);
            setRates(ratesRes.data);
            setPackages(packagesRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingRate) {
                await api.patch(`/rates/${editingRate.id}`, formData);
            } else {
                await api.post('/rates', formData);
            }
            setShowModal(false);
            setEditingRate(null);
            fetchData();
        } catch (err) {
            alert('Failed to save rate');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rate?')) return;
        try {
            await api.delete(`/rates/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete rate');
        }
    };

    const openEdit = (rate: Rate) => {
        setEditingRate(rate);
        setFormData(rate);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Topbar 
                title="Pricing Manager" 
                subtitle="Manage seasonal rates and special offers for your tours"
            />

            <div className="p-8 space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black">Rate Calendars</h2>
                        <p className="text-sm text-muted-foreground font-medium">Define how your prices change across different seasons</p>
                    </div>
                    <button 
                        onClick={() => {
                            setEditingRate(null);
                            setFormData({
                                name: '',
                                packageId: '',
                                startDate: '',
                                endDate: '',
                                rate: 0,
                                childPrice: 0,
                                infantPrice: 0,
                                type: 'seasonal'
                            });
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        <Plus size={20} /> Add New Rate Plan
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[4/3] rounded-[32px] bg-white/5 animate-pulse border border-[var(--glass-border)]" />
                        ))}
                    </div>
                ) : rates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rates.map((rate) => (
                            <div key={rate.id} className="glass-card group p-6 border border-[var(--glass-border)] rounded-[32px] hover:border-blue-600/30 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => openEdit(rate)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(rate.id)} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white backdrop-blur-md transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-blue-600">
                                            <Tag size={12} /> {rate.type} Plan
                                        </div>
                                        <h3 className="text-xl font-black line-clamp-1">{rate.name}</h3>
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                            <Package size={14} className="text-muted-foreground/50" /> 
                                            {packages.find(p => p.id === rate.packageId)?.title || 'All Packages'}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-muted-foreground">Validity</span>
                                            <span className="text-xs font-black flex items-center gap-2">
                                                <Calendar size={14} className="text-blue-600" />
                                                {new Date(rate.startDate).toLocaleDateString()} - {new Date(rate.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 rounded-2xl bg-blue-600/10 border border-blue-600/20">
                                            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Adult</p>
                                            <p className="text-sm font-black">₹{rate.rate}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                            <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Child</p>
                                            <p className="text-sm font-black">₹{rate.childPrice}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                            <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Infant</p>
                                            <p className="text-sm font-black">₹{rate.infantPrice}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card flex flex-col items-center justify-center p-20 border border-dashed border-[var(--glass-border)] rounded-[40px] text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                            <IndianRupee size={48} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black mb-2">No Rate Plans Defined</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                                Start by creating seasonal rate plans to offer different prices throughout the year.
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="btn-primary px-8 py-4 rounded-[20px] shadow-2xl shadow-blue-600/30 font-bold transition-all hover:scale-105"
                        >
                            Create Your First Rate Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-2xl glass-card border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black">{editingRate ? 'Edit Rate Plan' : 'Create Rate Plan'}</h3>
                                <p className="text-xs font-bold text-muted-foreground mt-1">Configure pricing rules for your tours</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Plan Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Summer Special 2024"
                                        className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Package</label>
                                        <select 
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                            value={formData.packageId}
                                            onChange={(e) => setFormData({...formData, packageId: e.target.value})}
                                        >
                                            <option value="">All Packages</option>
                                            {packages.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Plan Type</label>
                                        <select 
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="seasonal">Seasonal</option>
                                            <option value="holiday">Holiday/Festival</option>
                                            <option value="special">Special Promotion</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start Date</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">End Date</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Adult Price</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                            value={formData.rate}
                                            onChange={(e) => setFormData({...formData, rate: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Child Price</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                            value={formData.childPrice}
                                            onChange={(e) => setFormData({...formData, childPrice: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Infant Price</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                                            value={formData.infantPrice}
                                            onChange={(e) => setFormData({...formData, infantPrice: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-10 py-3 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Save size={20} /> {editingRate ? 'Update Plan' : 'Save Rate Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
