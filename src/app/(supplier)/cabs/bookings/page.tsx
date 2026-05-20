'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Search, Filter, Eye, Plus, MapPin, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

type Status = 'all' | 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'badge-accent' },
    ONGOING: { label: 'In Progress', cls: 'badge-success' },
    COMPLETED: { label: 'Completed', cls: 'badge-muted' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-destructive' },
    PENDING: { label: 'Pending', cls: 'badge-warning' },
};

const tabs: { key: Status; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'ONGOING', label: 'Ongoing' },
    { key: 'COMPLETED', label: 'Past' },
];

export default function CabBookingsPage() {
    const [activeTab, setActiveTab] = useState<Status>('all');
    const [search, setSearch] = useState('');

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['cab-bookings'],
        queryFn: async () => {
            const res = await api.get('/cabs/bookings');
            return res.data;
        },
    });

    const filtered = bookings.filter((b: any) => {
        const matchTab = activeTab === 'all' || b.status === activeTab;
        const matchSearch = !search ||
            b.customerName.toLowerCase().includes(search.toLowerCase()) ||
            b.bookingId.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const counts: Record<string, number> = {};
    tabs.forEach((t) => {
        counts[t.key] = t.key === 'all' ? bookings.length : bookings.filter((b: any) => b.status === t.key).length;
    });

    return (
        <div>
            <Topbar title="Cab Bookings" subtitle="Manage taxi reservations and fleet deployment" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Tab + Search row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-1 p-1 rounded-xl bg-slate-900/50 border border-slate-800">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === t.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {t.label}
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20">
                                    {counts[t.key] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="relative group">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                placeholder="Search by Guest or ID..."
                                className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all w-[260px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Grid View for Cabs - Feels more "Fleet" like */}
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((b: any) => {
                            const cfg = statusConfig[b.status] || { label: b.status, cls: 'badge-muted' };
                            return (
                                <div key={b.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:translate-y-[-2px] transition-all group shadow-xl">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Booking ID</span>
                                            <span className="font-mono text-sm font-bold text-blue-500">{b.bookingId}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' :
                                            b.status === 'ONGOING' ? 'bg-blue-500/10 text-blue-500' :
                                            b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-slate-500/10 text-slate-500'
                                        }`}>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-500">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{b.customerName}</h4>
                                                <p className="text-[10px] text-slate-500">{b.customerPhone}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={10} /> Pickup</span>
                                                <p className="text-xs text-slate-300 font-medium truncate">{b.pickupLocation}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar size={10} /> Date</span>
                                                <p className="text-xs text-slate-300 font-medium">{new Date(b.pickupDateTime).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5">
                                            <div>
                                                <span className="text-[10px] text-slate-500 block">Vehicle</span>
                                                <span className="text-xs font-bold text-slate-200">{b.vehicle?.model || 'Unassigned'}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-500 block">Amount</span>
                                                <span className="text-sm font-bold text-white">₹{Number(b.totalAmount).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-2.5 rounded-xl transition-all">
                                            VIEW DETAILS
                                        </button>
                                        {b.status === 'PENDING' && (
                                            <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                                                CONFIRM
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl">
                        <p className="text-slate-500 font-medium">No cab bookings found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
