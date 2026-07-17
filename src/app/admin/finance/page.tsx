'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/layout/Topbar';
import api from '@/lib/api';
import { 
    IndianRupee, Wallet, ArrowUpRight, ArrowDownRight, Clock, 
    CheckCircle2, AlertCircle, FileText, Filter, Zap, RefreshCcw, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminFinancePage() {
    const queryClient = useQueryClient();
    const [payoutsFilter, setPayoutsFilter] = useState('ALL');
    const [ledgerFilter, setLedgerFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');

    const { data: payouts = [], isLoading: loadingPayouts } = useQuery({
        queryKey: ['admin-payouts'],
        queryFn: async () => {
            const res = await api.get('/finance/admin/payouts');
            return res.data;
        }
    });

    const { data: ledger = [], isLoading: loadingLedger } = useQuery({
        queryKey: ['admin-ledger'],
        queryFn: async () => {
            const res = await api.get('/finance/admin/ledger');
            return res.data;
        }
    });

    const settleMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/admin/finance/settle');
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-ledger'] });
            queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
            toast.success(`Processed ${data.processedCount} settlements worth ₹${data.totalVolume.toLocaleString()}`);
        },
        onError: () => {
            toast.error('Failed to process settlements');
        }
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            return api.patch(`/finance/admin/payouts/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
            toast.success('Payout status updated');
        }
    });

    if (loadingPayouts || loadingLedger) return <div className="p-10 text-center font-black text-muted-foreground animate-pulse">Initializing Financial Matrix...</div>;

    const filteredPayouts = payouts.filter((p: any) => {
        const matchesStatus = payoutsFilter === 'ALL' || p.status === payoutsFilter;
        const matchesDate = !dateFrom || new Date(p.createdAt) >= new Date(dateFrom);
        return matchesStatus && matchesDate;
    });
    
    const filteredLedger = ledger.filter((l: any) => {
        const matchesVertical = ledgerFilter === 'ALL' || l.vertical === ledgerFilter;
        const matchesDate = !dateFrom || new Date(l.createdAt) >= new Date(dateFrom);
        return matchesVertical && matchesDate;
    });

    const pendingPayouts = payouts.filter((p: any) => p.status === 'PENDING');
    const totalPendingAmount = pendingPayouts.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const exportPayouts = () => {
        if (!filteredPayouts.length) return toast.error('No payouts to export');
        const headers = ['Ref ID', 'Vendor ID', 'Vertical', 'Amount', 'Status', 'Created At'];
        const rows = filteredPayouts.map((p: any) => [p.id, p.vendorId, p.vertical, p.amount, p.status, new Date(p.createdAt).toLocaleDateString()]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payouts_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportLedger = () => {
        if (!filteredLedger.length) return toast.error('No ledger entries to export');
        const headers = ['Timestamp', 'Type', 'Amount', 'Vertical', 'Description', 'Reference ID'];
        const rows = filteredLedger.map((l: any) => [new Date(l.createdAt).toISOString(), l.type, l.amount, l.vertical, `"${l.description}"`, l.referenceId]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ledger_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8 lg:p-12 animate-fadeIn">
            <Topbar title="Economic Treasury" subtitle="Oversee global ledger activity and vendor settlements" />

            <div className="flex justify-end mb-8">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={14} className="text-amber-500" /> Pending Payouts
                        </div>
                        <div className="text-4xl font-black text-foreground tracking-tighter">₹{totalPendingAmount.toLocaleString()}</div>
                        <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg inline-block uppercase tracking-widest border border-amber-100">
                            {pendingPayouts.length} Requests Active
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <Wallet size={120} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" /> Transaction Volume
                        </div>
                        <div className="text-4xl font-black text-foreground tracking-tighter">{ledger.length}</div>
                        <div className="mt-4 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg inline-block uppercase tracking-widest border border-blue-100">
                            Ledger History
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <Zap size={120} />
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" /> Total Capital Flow
                        </div>
                        <div className="text-4xl font-black text-foreground tracking-tighter">
                            ₹{payouts.filter((p: any) => p.status === 'COMPLETED').reduce((sum: number, p: any) => sum + Number(p.amount), 0).toLocaleString()}
                        </div>
                        <div className="mt-4 px-3 py-1 bg-white/10 text-emerald-400 text-[10px] font-black rounded-lg inline-block uppercase tracking-widest border border-white/5">
                            Success Rate 100%
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <IndianRupee size={120} color="white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Withdrawal Requests */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-xl font-black text-foreground tracking-tight">Withdrawal Requests</h3>
                        <div className="flex items-center gap-3">
                            <select value={payoutsFilter} onChange={(e) => setPayoutsFilter(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none">
                                <option value="ALL">All Status</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option>
                            </select>
                            <button onClick={exportPayouts} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"><Download size={14} /> Export</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Ref ID</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Vertical</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Amount</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Status</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPayouts.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="font-black text-sm text-foreground tracking-tight">#{p.id.substring(0, 8)}</div>
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase mt-1">ID: {p.vendorId.substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">{p.vertical}</span>
                                        </td>
                                        <td className="px-10 py-6 font-black text-foreground">₹{Number(p.amount).toLocaleString()}</td>
                                        <td className="px-10 py-6">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                p.status === 'COMPLETED' ? 'text-emerald-600' : 
                                                p.status === 'PENDING' ? 'text-amber-600' : 'text-blue-600'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            {p.status === 'PENDING' && (
                                                <button 
                                                    onClick={() => statusMutation.mutate({ id: p.id, status: 'COMPLETED' })}
                                                    className="px-6 py-2.5 bg-emerald-600 text-foreground text-[10px] font-black rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all uppercase tracking-widest active:scale-95"
                                                >
                                                    Process Payout
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayouts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-20 text-slate-300 font-black uppercase tracking-widest text-[10px]">No matching requests</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Ledger Entries */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-xl font-black text-foreground tracking-tight">System Ledger Activity</h3>
                        <div className="flex items-center gap-3">
                            <select value={ledgerFilter} onChange={(e) => setLedgerFilter(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none">
                                <option value="ALL">All Verticals</option><option value="HOTEL">Hotel</option><option value="CAB">Cab</option><option value="BUS">Bus</option><option value="TOUR">Tour</option><option value="FLIGHT">Flight</option>
                            </select>
                            <button onClick={exportLedger} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"><Download size={14} /> Export</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Timestamp</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Transaction Details</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLedger.map((entry: any) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                            <div className="mt-1 font-bold lowercase opacity-60">{new Date(entry.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="font-black text-sm text-foreground tracking-tight leading-tight mb-1">{entry.description}</div>
                                            <div className="flex gap-2 items-center">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                                    entry.vertical === 'HOTEL' ? 'bg-blue-500/10 text-blue-500' :
                                                    entry.vertical === 'PACKAGE' ? 'bg-purple-500/10 text-purple-500' :
                                                    entry.vertical === 'BUS' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-emerald-500/10 text-emerald-500'
                                                }`}>
                                                    {entry.vertical}
                                                </span>
                                                <div className="text-[10px] text-slate-300 font-mono">Ref: {entry.referenceId?.substring(0,8)}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className={`flex items-center gap-1 font-black text-lg ${entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {entry.type === 'CREDIT' ? '+' : '-'} ₹{Number(entry.amount).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
