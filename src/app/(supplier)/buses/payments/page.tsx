'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, Search, Download, Filter, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

export default function BusPaymentsPage() {
    const [user] = useState(() => getAuthUser());
    const [searchTerm, setSearchTerm] = useState('');

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['bus-payments', user?.busVendorId || user?.bus_vendor_id],
        queryFn: async () => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            if (!vendorId) return [];
            // For now, use bookings as a proxy for payments or fetch from a real payments endpoint
            const res = await api.get('/buses/bookings'); 
            return res.data;
        },
        enabled: !!user
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (Number(p.totalFare) || 0), 0);
    const pendingSettlement = totalRevenue * 0.15; // Mock logic

    return (
        <div>
            <Topbar title="Financial Ledger" subtitle="Track your earnings, settlements, and commission payouts" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">+12.5%</span>
                        </div>
                        <div className="text-2xl font-black tracking-tight text-foreground">₹{totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">Total Revenue</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <ArrowUpRight size={24} />
                            </div>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Next: 5th May</span>
                        </div>
                        <div className="text-2xl font-black tracking-tight text-foreground">₹{(totalRevenue * 0.85).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">Net Earnings</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                <Clock size={24} />
                            </div>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Awaiting</span>
                        </div>
                        <div className="text-2xl font-black tracking-tight text-foreground">₹{pendingSettlement.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">Pending Settlement</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Transaction ID or PNR..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/05 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/05 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/05">
                        <h3 className="font-bold text-foreground">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/05 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date & ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/05">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <DollarSign size={48} className="mx-auto text-muted-foreground opacity-10 mb-4" />
                                            <p className="text-muted-foreground text-sm font-medium">No transactions recorded yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-white/02 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-foreground">{new Date(p.createdAt).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase">TXN-{p.pnr}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-foreground">Booking Payment - {p.pnr}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">{p.passengerName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-green-500 font-bold text-xs">
                                                    <ArrowDownLeft size={14} /> Credit
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-foreground">₹{p.totalFare}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${p.paymentStatus === 'PAID' ? 'badge-success' : 'badge-muted'}`}>
                                                    {p.paymentStatus || 'COMPLETED'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 rounded-lg hover:bg-white/05 text-muted-foreground">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
