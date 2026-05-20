'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Receipt, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function PaymentsDashboard() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'LEDGER' | 'PAYOUTS' | 'INVOICES'>('LEDGER');
    const [payoutAmount, setPayoutAmount] = useState<number | ''>('');
    const [isRequesting, setIsRequesting] = useState(false);

    // Queries
    const { data: balances = { totalEarnings: 0, availableBalance: 0, pendingSettlements: 0 }, isLoading: balancesLoading } = useQuery({
        queryKey: ['finance-balances'],
        queryFn: async () => {
            const res = await api.get('/finance/balances');
            return res.data;
        },
    });

    const { data: ledger = [], isLoading: ledgerLoading } = useQuery({
        queryKey: ['finance-ledger'],
        queryFn: async () => {
            const res = await api.get('/finance/ledger');
            return res.data;
        },
    });

    const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
        queryKey: ['finance-payouts'],
        queryFn: async () => {
            const res = await api.get('/finance/payouts');
            return res.data;
        },
    });

    const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
        queryKey: ['finance-invoices'],
        queryFn: async () => {
            const res = await api.get('/finance/invoices');
            return res.data;
        },
    });

    // Mutations
    const requestPayoutMutation = useMutation({
        mutationFn: async () => {
            return api.post('/finance/payouts', { amount: Number(payoutAmount) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance-balances'] });
            queryClient.invalidateQueries({ queryKey: ['finance-ledger'] });
            queryClient.invalidateQueries({ queryKey: ['finance-payouts'] });
            setIsRequesting(false);
            setPayoutAmount('');
            setActiveTab('PAYOUTS');
            alert('Payout requested successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to request payout');
        }
    });

    return (
        <div>
            <Topbar title="Global Finance & Tax Ledger" subtitle="Manage your earnings, ledger, and payouts across Toliday" />
            
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 border-l-4 border-l-blue-500 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] bg-blue-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2 font-bold text-sm">
                            <Wallet size={18} /> TOTAL EARNINGS
                        </div>
                        <div className="text-4xl font-bold text-[hsl(var(--foreground))]">
                            ₹{balances.totalEarnings.toLocaleString()}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">All-time revenue generated</p>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-l-green-500 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] bg-green-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2 font-bold text-sm">
                            <DollarSign size={18} /> AVAILABLE BALANCE
                        </div>
                        <div className="text-4xl font-bold text-[hsl(var(--foreground))]">
                            ₹{balances.availableBalance.toLocaleString()}
                        </div>
                        <div className="mt-4">
                            <button 
                                onClick={() => setIsRequesting(true)}
                                className="w-full btn-primary py-2 text-xs font-bold"
                            >
                                Withdraw Funds
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-l-orange-500 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] bg-orange-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2 font-bold text-sm">
                            <Clock size={18} /> PENDING SETTLEMENTS
                        </div>
                        <div className="text-4xl font-bold text-[hsl(var(--foreground))]">
                            ₹{balances.pendingSettlements.toLocaleString()}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Withdrawals currently processing</p>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[var(--glass-border)] bg-black/5">
                        <button 
                            onClick={() => setActiveTab('LEDGER')}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'LEDGER' ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                        >
                            <Receipt size={16} /> Ledger Statement
                        </button>
                        <button 
                            onClick={() => setActiveTab('PAYOUTS')}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'PAYOUTS' ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                        >
                            <ArrowUpRight size={16} /> Payout History
                        </button>
                        <button 
                            onClick={() => setActiveTab('INVOICES')}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'INVOICES' ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                        >
                            <FileText size={16} /> Tax Invoices
                        </button>
                    </div>

                    <div className="p-0">
                        {/* LEDGER TAB */}
                        {activeTab === 'LEDGER' && (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[var(--table-header)] border-b border-[var(--glass-border)] text-[hsl(var(--muted-foreground))] text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Date</th>
                                        <th className="px-6 py-4 font-bold">Ref ID</th>
                                        <th className="px-6 py-4 font-bold">Description</th>
                                        <th className="px-6 py-4 font-bold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerLoading ? (
                                        <tr><td colSpan={4} className="text-center py-10">Loading ledger...</td></tr>
                                    ) : ledger.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-10 text-[hsl(var(--muted-foreground))]">No transactions found.</td></tr>
                                    ) : (
                                        ledger.map((entry: any) => (
                                            <tr key={entry.id} className="border-b border-[var(--glass-border)] hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium">{new Date(entry.createdAt).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-[hsl(var(--muted-foreground))] text-xs font-mono">{entry.referenceId || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {entry.type === 'CREDIT' ? <ArrowDownRight size={16} className="text-green-500" /> : <ArrowUpRight size={16} className="text-red-500" />}
                                                        {entry.description}
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${entry.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {entry.type === 'CREDIT' ? '+' : '-'} ₹{Number(entry.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* PAYOUTS TAB */}
                        {activeTab === 'PAYOUTS' && (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[var(--table-header)] border-b border-[var(--glass-border)] text-[hsl(var(--muted-foreground))] text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Date Requested</th>
                                        <th className="px-6 py-4 font-bold">Amount</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold">Bank Ref No</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payoutsLoading ? (
                                        <tr><td colSpan={4} className="text-center py-10">Loading payouts...</td></tr>
                                    ) : payouts.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-10 text-[hsl(var(--muted-foreground))]">No payouts requested yet.</td></tr>
                                    ) : (
                                        payouts.map((payout: any) => (
                                            <tr key={payout.id} className="border-b border-[var(--glass-border)] hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium">{new Date(payout.createdAt).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-bold">₹{Number(payout.amount).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    {payout.status === 'PENDING' && <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>}
                                                    {payout.status === 'PROCESSING' && <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Processing</span>}
                                                    {payout.status === 'PAID' && <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Paid</span>}
                                                    {payout.status === 'REJECTED' && <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12} /> Rejected</span>}
                                                </td>
                                                <td className="px-6 py-4 text-[hsl(var(--muted-foreground))] text-xs font-mono">{payout.bankReferenceNo || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* INVOICES TAB */}
                        {activeTab === 'INVOICES' && (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[var(--table-header)] border-b border-[var(--glass-border)] text-[hsl(var(--muted-foreground))] text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Date</th>
                                        <th className="px-6 py-4 font-bold">Invoice No</th>
                                        <th className="px-6 py-4 font-bold text-right">Total Amount</th>
                                        <th className="px-6 py-4 font-bold text-right">Commission</th>
                                        <th className="px-6 py-4 font-bold text-right">GST</th>
                                        <th className="px-6 py-4 font-bold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoicesLoading ? (
                                        <tr><td colSpan={6} className="text-center py-10">Loading invoices...</td></tr>
                                    ) : invoices.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-[hsl(var(--muted-foreground))]">No invoices generated yet.</td></tr>
                                    ) : (
                                        invoices.map((inv: any) => (
                                            <tr key={inv.id} className="border-b border-[var(--glass-border)] hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : new Date(inv.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-bold text-[hsl(var(--accent))]">{inv.invoiceNumber}</td>
                                                <td className="px-6 py-4 text-right font-medium">₹{Number(inv.totalAmount).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-red-500">₹{Number(inv.commissionAmount).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-[hsl(var(--muted-foreground))]">₹{Number(inv.gstAmount).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="text-xs font-bold border border-[var(--glass-border)] px-3 py-1 rounded hover:bg-white/5">Download</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Request Payout Modal */}
                {isRequesting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="glass-card w-full max-w-md p-6 animate-slideInUp">
                            <h3 className="font-bold text-xl mb-2">Request Withdrawal</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Enter the amount you wish to withdraw to your registered bank account.</p>
                            
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                                <div className="text-xs text-blue-500 font-bold mb-1">AVAILABLE BALANCE</div>
                                <div className="text-2xl font-bold text-blue-500">₹{balances.availableBalance.toLocaleString()}</div>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold block mb-2">Withdrawal Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={payoutAmount} 
                                    onChange={e => setPayoutAmount(Number(e.target.value))} 
                                    placeholder="Enter amount" 
                                    className="form-input text-lg font-bold"
                                    max={balances.availableBalance}
                                />
                                {Number(payoutAmount) > balances.availableBalance && (
                                    <p className="text-xs text-red-500 mt-2 font-medium">Amount exceeds available balance.</p>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setIsRequesting(false)} className="flex-1 py-3 rounded-lg font-bold text-sm border border-[var(--glass-border)] hover:bg-white/5 transition-colors">Cancel</button>
                                <button 
                                    onClick={() => requestPayoutMutation.mutate()}
                                    disabled={!payoutAmount || Number(payoutAmount) <= 0 || Number(payoutAmount) > balances.availableBalance || requestPayoutMutation.isPending}
                                    className="flex-1 py-3 rounded-lg font-bold text-sm btn-primary"
                                >
                                    {requestPayoutMutation.isPending ? 'Processing...' : 'Confirm Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
