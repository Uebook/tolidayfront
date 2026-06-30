'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Receipt, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

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

    const { data: myHotel } = useQuery({
        queryKey: ['my-hotel-profile'],
        queryFn: async () => {
            try {
                const res = await api.get('/hotel/my-hotel');
                return res.data;
            } catch (e) {
                return null;
            }
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

    // Calculate net running balance and parse descriptions after commission/GST
    const sortedEntriesDesc = [...ledger].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    let tempBal = balances.availableBalance - Math.round(balances.totalEarnings * 0.118);
    const computedDesc = sortedEntriesDesc.map((entry: any) => {
        const runningBalance = tempBal;
        const commAmt = entry.type === 'CREDIT' ? Math.round(Number(entry.amount) * 0.118) : 0;
        const netAmt = Number(entry.amount) - commAmt;
        if (entry.type === 'CREDIT') {
            tempBal -= netAmt;
        } else {
            tempBal += netAmt;
        }
        return {
            ...entry,
            netAmount: netAmt,
            runningBalance,
        };
    });
    const openingBalance = tempBal;

    // Filter and Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const parseLedgerEntry = (entry: any) => {
        let refNumber = entry.referenceId ? entry.referenceId.substring(0, 10).toUpperCase() : '-';
        let line1 = entry.description;
        let line2 = '';
        let line3 = '';

        // If it's a booking: Booking Revenue (IE/2627/35379) - Rakesh Upadhyay
        const bookingMatch = entry.description.match(/Booking Revenue \(([^)]+)\) - (.*)/);
        if (bookingMatch) {
            refNumber = bookingMatch[1];
            line1 = `Booking Created : ${bookingMatch[2]} X 1 (Net of Comm.)`;
            line2 = `BOOKING REF: ${bookingMatch[1]}`;
            line3 = `TRANSACTION STATUS: COMPLETED`;
        } else {
            // If it's a withdrawal request: Withdrawal Request #abcdefgh
            const withdrawalMatch = entry.description.match(/Withdrawal Request #([0-9a-fA-F]+)/);
            if (withdrawalMatch) {
                refNumber = `WD/${withdrawalMatch[1].toUpperCase()}`;
                line1 = `Withdrawal Settled to Bank A/c`;
                line2 = `REQUEST ID: ${entry.referenceId ? entry.referenceId.substring(0, 8).toUpperCase() : 'N/A'}`;
                line3 = `TRANSACTION STATUS: COMPLETED`;
            }
        }
        return { refNumber, line1, line2, line3 };
    };

    // Apply Filters (Search and Dates) using computedDesc (newest first)
    const filteredEntries = computedDesc.filter((entry: any) => {
        const { refNumber, line1 } = parseLedgerEntry(entry);
        
        // Search Term Match
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesSearch = 
                refNumber.toLowerCase().includes(term) || 
                line1.toLowerCase().includes(term) || 
                entry.description.toLowerCase().includes(term);
            if (!matchesSearch) return false;
        }

        // Date Range Match
        const entryDate = new Date(entry.createdAt);
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            if (entryDate < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23,59,59,999);
            if (entryDate > end) return false;
        }

        return true;
    });

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div>
            <Topbar title="Global Finance & Tax Ledger" subtitle="Manage your earnings, ledger, and payouts across Toliday" />
            
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-card p-6 border-l-4 border-l-blue-500 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] bg-blue-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2 font-bold text-sm">
                            <Wallet size={18} /> GROSS EARNINGS
                        </div>
                        <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
                            ₹{balances.totalEarnings.toLocaleString()}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Total gross booking value</p>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-l-red-500 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] bg-red-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2 font-bold text-sm">
                            <AlertCircle size={18} /> COMMISSION (10% + GST)
                        </div>
                        <div className="text-3xl font-bold text-red-500">
                            ₹{(Math.round(balances.totalEarnings * 0.118)).toLocaleString()}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">10% Fee + 18% GST on fee</p>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-l-indigo-500 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] bg-indigo-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2 font-bold text-sm">
                            <Receipt size={18} /> NET EARNINGS
                        </div>
                        <div className="text-3xl font-bold text-indigo-500">
                            ₹{(balances.totalEarnings - Math.round(balances.totalEarnings * 0.118)).toLocaleString()}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Gross minus commission & tax</p>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-l-green-500 relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] bg-green-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2 font-bold text-sm">
                            <DollarSign size={18} /> AVAILABLE BALANCE
                        </div>
                        <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
                            ₹{Math.max(0, balances.availableBalance - Math.round(balances.totalEarnings * 0.118)).toLocaleString()}
                        </div>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5 font-bold uppercase tracking-wider">
                            Pending Payouts: ₹{balances.pendingSettlements.toLocaleString()}
                        </p>
                        <div className="mt-3">
                            <button 
                                onClick={() => setIsRequesting(true)}
                                className="w-full btn-primary py-2 text-xs font-bold"
                            >
                                Withdraw Funds
                            </button>
                        </div>
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
                            <div className="space-y-6">
                                {/* Address and Account Summary Header (Screenshot matching) */}
                                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[var(--glass-border)] bg-black/5 rounded-t-2xl">
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight text-[hsl(var(--foreground))]">{myHotel?.name || 'Grand Noida Resort & Spa'}</h3>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed font-semibold">
                                            {myHotel?.address || 'Plot No. 10, Road B, Sector 62'}<br />
                                            {myHotel?.city || 'Noida'}, Gautam Buddha Nagar, Uttar Pradesh {myHotel?.pinCode || '201301'}<br />
                                            Phone: {myHotel?.contactNumber || '7220014014'} | Email: {myHotel?.email || 'manager@noidahotel.com'}
                                        </p>
                                    </div>
                                    <div className="text-right md:items-end flex flex-col gap-1 w-full md:w-auto">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Trip Statement Account</span>
                                        <div className="text-sm font-bold text-[hsl(var(--foreground))] mt-1 font-black">
                                            Toliday Trip Private Limited
                                        </div>
                                        <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mt-1 flex flex-col gap-1 md:items-end">
                                            <span>Credit Limit: ₹0.00</span>
                                            <span>Cash A/c Balance: ₹{Math.max(0, balances.availableBalance - Math.round(balances.totalEarnings * 0.118)).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters Panel */}
                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-black/5 border-b border-[var(--glass-border)]">
                                    <div className="sm:col-span-2">
                                        <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase block mb-1.5">Search Statement</label>
                                        <input 
                                            type="text" 
                                            value={searchTerm}
                                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                            placeholder="Search description, reference no..."
                                            className="w-full text-xs px-4 py-2.5 bg-black/10 border border-[var(--glass-border)] rounded-xl outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase block mb-1.5">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={startDate}
                                            onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                                            className="w-full text-xs px-4 py-2.5 bg-black/10 border border-[var(--glass-border)] rounded-xl outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase block mb-1.5">End Date</label>
                                        <input 
                                            type="date" 
                                            value={endDate}
                                            onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                                            className="w-full text-xs px-4 py-2.5 bg-black/10 border border-[var(--glass-border)] rounded-xl outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--table-header)] border-b border-[var(--glass-border)] text-[hsl(var(--muted-foreground))] text-xs uppercase">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Date</th>
                                                <th className="px-6 py-4 font-bold">Ref. Number</th>
                                                <th className="px-6 py-4 font-bold">Particulars</th>
                                                <th className="px-6 py-4 font-bold text-right">Debit</th>
                                                <th className="px-6 py-4 font-bold text-right">Credit</th>
                                                <th className="px-6 py-4 font-bold text-right">Running Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ledgerLoading ? (
                                                <tr><td colSpan={6} className="text-center py-10">Loading ledger...</td></tr>
                                            ) : filteredEntries.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-10 text-[hsl(var(--muted-foreground))]">No transactions found matching your filters.</td></tr>
                                            ) : (
                                                <>
                                                    {/* Transaction Rows */}
                                                    {currentItems.map((entry: any) => {
                                                        const { refNumber, line1, line2, line3 } = parseLedgerEntry(entry);
                                                        return (
                                                            <tr key={entry.id} className="border-b border-[var(--glass-border)] hover:bg-white/5 transition-colors">
                                                                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                                                    {new Date(entry.createdAt).toLocaleDateString('en-GB')}
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-[hsl(var(--accent))] font-mono text-xs">
                                                                    {refNumber}
                                                                </td>
                                                                <td className="px-6 py-4 max-w-md">
                                                                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{line1}</div>
                                                                    {line2 && <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 uppercase tracking-wider">{line2}</div>}
                                                                    {line3 && <div className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-widest">{line3}</div>}
                                                                </td>
                                                                <td className="px-6 py-4 text-right text-red-500 font-bold">
                                                                    {entry.type === 'DEBIT' ? `₹${Number(entry.amount).toLocaleString()}` : '-'}
                                                                </td>
                                                                <td className="px-6 py-4 text-right text-green-500 font-bold">
                                                                    {entry.type === 'CREDIT' ? `₹${Number(entry.netAmount).toLocaleString()}` : '-'}
                                                                </td>
                                                                <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">
                                                                    ₹{entry.runningBalance.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                    {/* Opening Balance Row (only shown at the bottom of the last page) */}
                                                    {currentPage === totalPages && !searchTerm && !startDate && !endDate && (
                                                        <tr className="border-b border-[var(--glass-border)] bg-[hsl(var(--accent)/0.02)] font-semibold">
                                                            <td className="px-6 py-4 text-[hsl(var(--muted-foreground))] text-xs font-bold">-</td>
                                                            <td className="px-6 py-4 text-[hsl(var(--muted-foreground))] text-xs font-bold">-</td>
                                                            <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200">Opening Balance</td>
                                                            <td className="px-6 py-4 text-right text-[hsl(var(--muted-foreground))]">-</td>
                                                            <td className="px-6 py-4 text-right text-green-500 font-bold">₹{openingBalance.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">₹{openingBalance.toLocaleString()}</td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {filteredEntries.length > itemsPerPage && (
                                    <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--glass-border)] bg-black/5">
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Showing <strong className="text-[hsl(var(--foreground))]">{indexOfFirstItem + 1}</strong> to <strong className="text-[hsl(var(--foreground))]">{Math.min(indexOfLastItem, filteredEntries.length)}</strong> of <strong className="text-[hsl(var(--foreground))]">{filteredEntries.length}</strong> transactions
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1.5 border border-[var(--glass-border)] rounded-lg text-xs font-bold hover:bg-white/5 disabled:opacity-40 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'btn-primary' : 'border border-[var(--glass-border)] hover:bg-white/5'}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button 
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1.5 border border-[var(--glass-border)] rounded-lg text-xs font-bold hover:bg-white/5 disabled:opacity-40 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                                    <Link href={`/invoice/${inv.id}`} target="_blank">
                                                        <button className="text-xs font-bold border border-[var(--glass-border)] px-3 py-1 rounded hover:bg-white/5">Download</button>
                                                    </Link>
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
