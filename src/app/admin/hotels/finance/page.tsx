'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import DataTable from '@/components/admin/DataTable';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { IndianRupee, ArrowUpRight, ArrowDownRight, RefreshCcw, Download, Clock, FileText, CheckCircle2, CreditCard, Filter, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Tab = 'OVERVIEW' | 'INVOICES' | 'PAYOUT REQUESTS' | 'PAYMENT HISTORY';

export default function HotelsFinancePage() {
       const [search, setSearch] = useState('');
       const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
       const [verticalFilter, setVerticalFilter] = useState('HOTEL');
       const [statusFilter, setStatusFilter] = useState('ALL');

       const { data: transactions = [], isLoading, error } = useQuery({
              queryKey: ['ledger', '/finance/admin/ledger', verticalFilter],
              queryFn: async () => {
                     try {
                         const res = await api.get(`/finance/admin/ledger?vertical=${verticalFilter}`);
                         const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                         return data.map((t: any) => ({
                                id: t.id,
                                vendor: t.vendorId, // Generic vendor ID for now
                                hotel: t.vendorId,
                                vertical: t.vertical,
                                amount: t.amount,
                                type: t.type === 'CREDIT' ? 'INCOME' : 'PAYOUT',
                                status: t.status,
                                date: t.createdAt
                         }));
                     } catch (err) {
                         console.error("Error fetching ledger:", err);
                         return [];
                     }
              }
       });
    
       const filteredTransactions = transactions.filter((t: any) => {
              const matchesSearch = t.id.toLowerCase().includes(search.toLowerCase()) || 
                                  t.hotel.toLowerCase().includes(search.toLowerCase());
              const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
              return matchesSearch && matchesStatus;
       });

       const ledgerColumns = [
              {
                     header: 'Transaction Info',
                     accessor: 'id',
                     render: (trx: any) => (
                            <div>
                                   <div className="font-black text-foreground text-sm">{trx.id}</div>
                                   <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                          {new Date(trx.date).toLocaleString()}
                                   </div>
                            </div>
                     )
              },
              {
                     header: 'Property',
                     accessor: 'hotel',
                     render: (trx: any) => (
                            <div className="font-bold text-slate-700 text-sm">{trx.hotel}</div>
                     )
              },
              {
                     header: 'Direction',
                     accessor: 'type',
                     render: (trx: any) => (
                            <div className="flex items-center gap-2">
                                   {trx.type === 'INCOME' ? (
                                          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                 <ArrowDownRight size={16} />
                                          </div>
                                   ) : (
                                          <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                                 <ArrowUpRight size={16} />
                                          </div>
                                   )}
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${trx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                          {trx.type === 'INCOME' ? 'Booking Revenue' : 'Vendor Payout'}
                                   </span>
                            </div>
                     )
              },
              {
                     header: 'Amount',
                     accessor: 'amount',
                     render: (trx: any) => (
                            <div>
                                   <div className="text-sm font-black text-foreground">₹{trx.amount.toLocaleString()}</div>
                                   {trx.type === 'INCOME' && (
                                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                                                 +₹{trx.fee || 0} Platform Fee
                                          </div>
                                   )}
                            </div>
                     )
              },
              {
                     header: 'Status',
                     accessor: 'status',
                     render: (trx: any) => (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest
                                   ${trx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                                   ${trx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                            `}>
                                   {trx.status === 'COMPLETED' && <RefreshCcw size={12} />}
                                   {trx.status === 'PENDING' && <Clock size={12} />}
                                   {trx.status}
                            </div>
                     )
              }
       ];

        const exportLedgerToCSV = () => {
          if (!filteredTransactions.length) {
            toast.error('No transactions to export');
            return;
          }
          const headers = ['Transaction Info', 'Property', 'Direction', 'Amount (₹)', 'Platform Fee (₹)', 'Status', 'Date'];
          const rows = filteredTransactions.map((trx: any) => [
            trx.id || '',
            trx.hotel || '',
            trx.type === 'INCOME' ? 'Booking Revenue' : 'Vendor Payout',
            trx.amount || 0,
            trx.fee || 0,
            trx.status || '',
            new Date(trx.date).toLocaleString('en-IN')
          ]);
          downloadCSV('ledger_export', headers, rows);
        };

        const exportInvoicesToCSV = () => {
          const headers = ['Invoice ID', 'Vendor', 'Period', 'Amount (₹)', 'Status'];
          const rows = mockInvoices.map((inv: any) => [
            inv.id, inv.vendor, inv.period, inv.amount, inv.status
          ]);
          downloadCSV('invoices_export', headers, rows);
        };

        const exportPayoutsToCSV = () => {
          const headers = ['Request ID', 'Vendor', 'Requested At', 'Amount (₹)', 'Status'];
          const rows = mockPayoutRequests.map((req: any) => [
            req.id, req.vendor, new Date(req.requestedAt).toLocaleString('en-IN'), req.amount, req.status
          ]);
          downloadCSV('payout_requests_export', headers, rows);
        };

        const exportHistoryToCSV = () => {
          const headers = ['Transaction ID', 'Vendor', 'Date', 'Amount (₹)', 'Method', 'Status'];
          const rows = mockPaymentHistory.map((txn: any) => [
            txn.id, txn.vendor, new Date(txn.date).toLocaleString('en-IN'), txn.amount, txn.method, txn.status
          ]);
          downloadCSV('payment_history_export', headers, rows);
        };

        const downloadCSV = (filename: string, headers: string[], rows: any[]) => {
          const csvContent = [headers, ...rows]
            .map(r => r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
          const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        };

        const headerAction = (exportFn: () => void) => (
            <div className="flex items-center gap-3 w-full md:w-auto">
                {activeTab === 'OVERVIEW' && (
                  <>
                    <select
                        value={verticalFilter}
                        onChange={(e) => setVerticalFilter(e.target.value)}
                        className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-2xl py-3 px-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground"
                    >
                        <option value="HOTEL">Hotels</option>
                        <option value="CAB">Cabs</option>
                        <option value="BUS">Bus</option>
                        <option value="TOUR">Tours</option>
                        <option value="FLIGHT">Flights</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-2xl py-3 px-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground"
                    >
                        <option value="ALL">All Status</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                  </>
                )}
                <button 
                  onClick={exportFn}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group ml-auto md:ml-0"
                >
                       <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> Export
                </button>
            </div>
        );
 
       // MOCK DATA for new tabs
       const mockInvoices = [
           { id: 'INV-2026-001', vendor: 'Grand Hyatt Mumbai', period: 'May 2026', amount: 24000, status: 'GENERATED' },
           { id: 'INV-2026-002', vendor: 'Taj Mahal Palace', period: 'May 2026', amount: 15500, status: 'PAID' }
       ];
       const mockPayoutRequests = [
           { id: 'PR-9921', vendor: 'Grand Hyatt Mumbai', amount: 18400, requestedAt: '2026-06-29T10:00:00Z', status: 'PENDING' }
       ];
       const mockPaymentHistory = [
           { id: 'TXN-998123', vendor: 'Taj Mahal Palace', amount: 15500, method: 'BANK_TRANSFER', date: '2026-06-05T14:30:00Z', status: 'SUCCESS' }
       ];

        return (
              <div className="min-h-full">
                     <Topbar title="Finance & Payments" subtitle="Manage revenue, commissions, and payouts across verticals" />
                     
                     <div className="p-6 md:p-8 space-y-6 md:space-y-8 animate-fadeIn max-w-[1600px] mx-auto">
                            {/* Top Level Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="ios-platter p-6 rounded-[24px] border border-border/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-transform hover:scale-[1.03] group">
                                          <div className="flex items-center justify-between mb-2">
                                              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Vertical Revenue</div>
                                              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500"><IndianRupee size={16} /></div>
                                          </div>
                                          <div className="text-4xl font-black text-foreground mb-1 group-hover:text-emerald-500 transition-colors">₹342,500</div>
                                          <div className="text-xs font-bold text-slate-400">+12% from last month</div>
                                   </div>
                                   <div className="ios-platter p-6 rounded-[24px] border border-border/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-transform hover:scale-[1.03] group">
                                          <div className="flex items-center justify-between mb-2">
                                              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Platform Commissions</div>
                                              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500"><ArrowDownRight size={16} /></div>
                                          </div>
                                          <div className="text-4xl font-black text-foreground mb-1 group-hover:text-blue-500 transition-colors">₹34,250</div>
                                          <div className="text-xs font-bold text-slate-400">10% standard rate</div>
                                   </div>
                                   <div className="ios-platter p-6 rounded-[24px] border border-border/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-transform hover:scale-[1.03] bg-indigo-600 dark:bg-indigo-900/50 group">
                                          <div className="flex items-center justify-between mb-2">
                                              <div className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Pending Partner Payouts</div>
                                              <div className="p-2 bg-white/10 rounded-xl text-white"><Clock size={16} /></div>
                                          </div>
                                          <div className="text-4xl font-black text-white mb-1 group-hover:scale-105 origin-left transition-transform">₹18,400</div>
                                          <div className="text-xs font-bold text-indigo-200">2 requests pending approval</div>
                                   </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex bg-transparent p-1 border-b border-border/10 w-full overflow-x-auto hide-scrollbar">
                                {(["OVERVIEW", "INVOICES", "PAYOUT REQUESTS", "PAYMENT HISTORY"] as Tab[]).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-8 py-3.5 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {tab === 'OVERVIEW' && <IndianRupee size={16} />}
                                            {tab === 'INVOICES' && <FileText size={16} />}
                                            {tab === 'PAYOUT REQUESTS' && <Clock size={16} />}
                                            {tab === 'PAYMENT HISTORY' && <CreditCard size={16} />}
                                            {tab}
                                        </div>
                                    </button>
                                ))}
                            </div>
                     
                            {/* Content Area */}
                            {isLoading && activeTab === 'OVERVIEW' ? (
                                   <Card className="rounded-[2.5rem] border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] bg-black/[0.01] dark:bg-white/[0.01]">
                                          <CardContent className="p-16 flex items-center justify-center">
                                                 <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                                          </CardContent>
                                   </Card>
                            ) : (
                                <>
                                    {activeTab === 'OVERVIEW' && (
                                        <DataTable 
                                            title="Platform Ledger"
                                            description={`${filteredTransactions.length} records found`}
                                            columns={ledgerColumns}
                                            data={filteredTransactions}
                                            onSearch={setSearch}
                                            headerAction={headerAction(exportLedgerToCSV)}
                                        />
                                    )}

                                    {activeTab === 'INVOICES' && (
                                        <DataTable 
                                            title="Vendor Invoices"
                                            description="Automatically generated monthly commission invoices"
                                            columns={[
                                                { header: 'Invoice ID', accessor: 'id', render: (inv: any) => <span className="font-black text-foreground">{inv.id}</span> },
                                                { header: 'Vendor', accessor: 'vendor', render: (inv: any) => <span className="font-bold text-slate-700">{inv.vendor}</span> },
                                                { header: 'Period', accessor: 'period', render: (inv: any) => <span className="text-xs font-black uppercase tracking-widest text-slate-500">{inv.period}</span> },
                                                { header: 'Total Amount', accessor: 'amount', render: (inv: any) => <span className="font-black text-foreground">₹{inv.amount.toLocaleString()}</span> },
                                                { header: 'Status', accessor: 'status', render: (inv: any) => (
                                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>
                                                        {inv.status}
                                                    </span>
                                                )},
                                                { header: 'Actions', accessor: 'actions', render: (inv: any) => (
                                                    <div className="flex gap-2">
                                                        <Link href={`/invoice/${inv.id}`} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5">
                                                            <Eye size={12} /> View
                                                        </Link>
                                                        <Link href={`/invoice/${inv.id}`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-1.5">
                                                            <Download size={12} /> PDF
                                                        </Link>
                                                    </div>
                                                )}
                                            ]}
                                            data={mockInvoices}
                                            headerAction={headerAction(exportInvoicesToCSV)}
                                        />
                                    )}

                                    {activeTab === 'PAYOUT REQUESTS' && (
                                        <DataTable 
                                            title="Pending Payout Requests"
                                            description="Approve or reject vendor fund withdrawal requests"
                                            columns={[
                                                { header: 'Request ID', accessor: 'id', render: (req: any) => <span className="font-black text-foreground">{req.id}</span> },
                                                { header: 'Vendor', accessor: 'vendor', render: (req: any) => <span className="font-bold text-slate-700">{req.vendor}</span> },
                                                { header: 'Requested At', accessor: 'requestedAt', render: (req: any) => <span className="text-xs font-black uppercase tracking-widest text-slate-500">{new Date(req.requestedAt).toLocaleString()}</span> },
                                                { header: 'Amount', accessor: 'amount', render: (req: any) => <span className="font-black text-foreground">₹{req.amount.toLocaleString()}</span> },
                                                { header: 'Actions', accessor: 'actions', render: () => (
                                                    <div className="flex gap-2">
                                                        <button className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Approve</button>
                                                        <button className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Reject</button>
                                                    </div>
                                                )}
                                            ]}
                                            data={mockPayoutRequests}
                                            headerAction={headerAction(exportPayoutsToCSV)}
                                        />
                                    )}

                                    {activeTab === 'PAYMENT HISTORY' && (
                                        <DataTable 
                                            title="Settled Payments"
                                            description="Historical log of all processed vendor payouts"
                                            columns={[
                                                { header: 'Transaction ID', accessor: 'id', render: (txn: any) => <span className="font-black text-foreground">{txn.id}</span> },
                                                { header: 'Vendor', accessor: 'vendor', render: (txn: any) => <span className="font-bold text-slate-700">{txn.vendor}</span> },
                                                { header: 'Date', accessor: 'date', render: (txn: any) => <span className="text-xs font-black uppercase tracking-widest text-slate-500">{new Date(txn.date).toLocaleString()}</span> },
                                                { header: 'Amount', accessor: 'amount', render: (txn: any) => <span className="font-black text-foreground">₹{txn.amount.toLocaleString()}</span> },
                                                { header: 'Method', accessor: 'method', render: (txn: any) => <span className="px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">{txn.method.replace('_', ' ')}</span> },
                                                { header: 'Status', accessor: 'status', render: (txn: any) => (
                                                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                                                        <CheckCircle2 size={12} className="inline mr-1" /> {txn.status}
                                                    </span>
                                                )}
                                            ]}
                                            data={mockPaymentHistory}
                                            headerAction={headerAction(exportHistoryToCSV)}
                                        />
                                    )}
                                </>
                            )}
                     </div>
              </div>
       );
}
