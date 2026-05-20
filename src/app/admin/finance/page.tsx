'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
    DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Clock, 
    CheckCircle2, AlertCircle, FileText, Filter, Zap, RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminFinancePage() {
    const queryClient = useQueryClient();

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

    if (loadingPayouts || loadingLedger) return <div className="p-10 text-center font-black text-slate-400 animate-pulse">Initializing Financial Matrix...</div>;

    const pendingPayouts = payouts.filter((p: any) => p.status === 'PENDING');
    const totalPendingAmount = pendingPayouts.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    return (
        <div className="p-8 lg:p-12 animate-fadeIn">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Finance OS v2.0</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Economic Treasury</h1>
                    <p className="text-slate-400 font-bold mt-2">Oversee global ledger activity and vendor settlements</p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => settleMutation.mutate()}
                        disabled={settleMutation.isPending}
                        className="px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 group"
                    >
                        <RefreshCcw size={18} className={settleMutation.isPending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        {settleMutation.isPending ? 'Processing Engine...' : 'Run Global Settlement'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={14} className="text-amber-500" /> Pending Payouts
                        </div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter">₹{totalPendingAmount.toLocaleString()}</div>
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
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" /> Transaction Volume
                        </div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter">{ledger.length}</div>
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
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" /> Total Capital Flow
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter">
                            ₹{payouts.filter((p: any) => p.status === 'COMPLETED').reduce((sum: number, p: any) => sum + Number(p.amount), 0).toLocaleString()}
                        </div>
                        <div className="mt-4 px-3 py-1 bg-white/10 text-emerald-400 text-[10px] font-black rounded-lg inline-block uppercase tracking-widest border border-white/5">
                            Success Rate 100%
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <DollarSign size={120} color="white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Withdrawal Requests */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Withdrawal Requests</h3>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">Action Required</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Ref ID</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Vertical</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Amount</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Status</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payouts.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="font-black text-sm text-slate-900 tracking-tight">#{p.id.substring(0, 8)}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: {p.vendorId.substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">{p.vertical}</span>
                                        </td>
                                        <td className="px-10 py-6 font-black text-slate-900">₹{Number(p.amount).toLocaleString()}</td>
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
                                                    className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all uppercase tracking-widest active:scale-95"
                                                >
                                                    Process Payout
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-20 text-slate-300 font-black uppercase tracking-widest text-[10px]">No active requests</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Ledger Entries */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">System Ledger Activity</h3>
                        <button className="p-3 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"><Filter size={16} /></button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Timestamp</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Transaction Details</th>
                                    <th className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ledger.map((entry: any) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                            <div className="mt-1 font-bold lowercase opacity-60">{new Date(entry.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="font-black text-sm text-slate-900 tracking-tight leading-tight mb-1">{entry.description}</div>
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
