'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Printer, Download, ArrowLeft, Mail, Phone, Info } from 'lucide-react';
import Link from 'next/link';

export default function StandaloneInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Queries
    const { data: invoice, isLoading: invoiceLoading, error } = useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            const res = await api.get(`/finance/invoices/${id}`);
            return res.data;
        }
    });

    const { data: hotel, isLoading: hotelLoading } = useQuery({
        queryKey: ['my-hotel-profile'],
        queryFn: async () => {
            const res = await api.get('/hotel/my-hotel');
            return res.data;
        }
    });

    // Auto-trigger print when fully loaded
    useEffect(() => {
        if (invoice && hotel) {
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [invoice, hotel]);

    if (invoiceLoading || hotelLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-zinc-600 font-medium">Generating Invoice PDF...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
                    <Info size={32} />
                </div>
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Invoice Not Found</h1>
                <p className="text-zinc-500 mb-6 max-w-sm">We couldn't retrieve the details for this invoice.</p>
                <Link href="/hotel/finance" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Finance Dashboard
                </Link>
            </div>
        );
    }

    const hotelName = hotel?.name || 'Hotel Partner';
    const hotelAddress = hotel?.address || 'Plot No. 10, Sector 62, Noida';
    const hotelEmail = hotel?.email || 'manager@noidahotel.com';
    const hotelPhone = hotel?.contactNumber || '7220014014';

    const invoiceDateStr = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(invoice.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const gstRate = 18; // Standard GST for commissions

    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-800 font-sans print:bg-white print:p-0">
            {/* Top Toolbar (Hidden during print) */}
            <div className="bg-white border-b border-zinc-200 py-4 px-6 sticky top-0 z-50 shadow-sm flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/hotel/finance" className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900">
                        <ArrowLeft size={16} /> Back to Ledger Dashboard
                    </Link>
                    <span className="text-zinc-300">|</span>
                    <span className="text-sm font-bold text-zinc-800">Tax Invoice Preview</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow transition-colors"
                    >
                        <Printer size={16} /> Print Invoice
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Invoice Page Container */}
            <div className="max-w-[850px] mx-auto my-8 bg-white shadow-lg border border-zinc-200 p-10 print:shadow-none print:border-none print:my-0 print:p-0">
                
                {/* Invoice Header block */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-indigo-900 tracking-tight uppercase">Tax Invoice</h1>
                        <p className="text-zinc-500 font-mono text-sm mt-1">No: {invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            Status: {invoice.status}
                        </span>
                    </div>
                </div>

                {/* Company details grid */}
                <div className="grid grid-cols-2 gap-8 pb-8 border-b border-zinc-200 text-xs">
                    <div>
                        <h3 className="font-bold text-indigo-950 uppercase mb-2 tracking-wide">Issued By</h3>
                        <p className="font-bold text-sm text-zinc-900 mb-1">Toliday Trip Private Limited</p>
                        <p className="text-zinc-600 leading-relaxed">
                            Sector P3, Greater Noida<br />
                            Uttar Pradesh, 201308, IN
                        </p>
                        <div className="mt-3 space-y-0.5 text-zinc-500 font-medium">
                            <span className="flex items-center gap-1"><Phone size={12} /> 8447804043</span>
                            <span className="flex items-center gap-1"><Mail size={12} /> ceo@toliday.in</span>
                            <p className="font-bold text-zinc-700 mt-1">GSTIN: 09AAPCT8447R1ZX</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-950 uppercase mb-2 tracking-wide">Billing To (Recipient)</h3>
                        <p className="font-bold text-sm text-zinc-900 mb-1">{hotelName}</p>
                        <p className="text-zinc-600 leading-relaxed">
                            {hotelAddress}
                        </p>
                        <div className="mt-3 space-y-0.5 text-zinc-500 font-medium">
                            <span className="flex items-center gap-1"><Phone size={12} /> {hotelPhone}</span>
                            <span className="flex items-center gap-1"><Mail size={12} /> {hotelEmail}</span>
                        </div>
                    </div>
                </div>

                {/* Invoice Dates Row */}
                <div className="grid grid-cols-3 gap-6 py-6 border-b border-zinc-200 text-xs bg-slate-50/50 px-4 rounded-xl my-6">
                    <div>
                        <span className="text-zinc-400 font-bold block uppercase text-[10px]">Invoice Date</span>
                        <span className="font-bold text-zinc-800 text-xs">{invoiceDateStr}</span>
                    </div>
                    <div>
                        <span className="text-zinc-400 font-bold block uppercase text-[10px]">Vertical type</span>
                        <span className="font-bold text-zinc-800 text-xs uppercase">{invoice.vertical} Services</span>
                    </div>
                    <div>
                        <span className="text-zinc-400 font-bold block uppercase text-[10px]">Currency</span>
                        <span className="font-bold text-zinc-800 text-xs">INR (Indian Rupee)</span>
                    </div>
                </div>

                {/* Details Table */}
                <div className="my-8">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Gross Booking Val</th>
                                <th className="p-3 text-right">Commission Rate</th>
                                <th className="p-3 text-right">Net Commission</th>
                                <th className="p-3 text-right">GST ({gstRate}%)</th>
                                <th className="p-3 text-right">Total Payable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            <tr className="font-medium text-zinc-700">
                                <td className="p-3 max-w-xs">
                                    <span className="font-bold text-zinc-900 block text-sm">Hotel Commission Fee</span>
                                    <span className="text-[10px] text-zinc-400 block mt-0.5">Toliday commission charges for room booking services provided during the billing cycle.</span>
                                </td>
                                <td className="p-3 text-right">₹{Number(invoice.totalAmount).toLocaleString()}</td>
                                <td className="p-3 text-right">10%</td>
                                <td className="p-3 text-right">₹{Number(invoice.commissionAmount).toLocaleString()}</td>
                                <td className="p-3 text-right">₹{Number(invoice.gstAmount).toLocaleString()}</td>
                                <td className="p-3 text-right font-bold text-indigo-900">₹{(Number(invoice.commissionAmount) + Number(invoice.gstAmount)).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Summary calculation card */}
                <div className="flex justify-end my-10">
                    <div className="w-80 space-y-2 text-xs border-t-2 border-indigo-900 pt-4">
                        <div className="flex justify-between font-semibold">
                            <span className="text-zinc-500">Net Taxable Value:</span>
                            <span>₹{Number(invoice.commissionAmount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span className="text-zinc-500">GST (18% Output CGST+SGST):</span>
                            <span>₹{Number(invoice.gstAmount).toLocaleString('en-IN')}</span>
                        </div>
                        {Number(invoice.tdsAmount) > 0 && (
                            <div className="flex justify-between font-semibold text-rose-600">
                                <span>TDS Deducted:</span>
                                <span>- ₹{Number(invoice.tdsAmount).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-black text-indigo-950">
                            <span>Grand Total:</span>
                            <span>₹{(Number(invoice.commissionAmount) + Number(invoice.gstAmount) - Number(invoice.tdsAmount || 0)).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Declaration block */}
                <div className="mt-16 text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-200 pt-6">
                    <p className="font-bold mb-1">Declaration:</p>
                    <p>We declare that this invoice shows the actual price of the services described and that all particulars are true and correct. This is a computer generated invoice and does not require a physical signature.</p>
                </div>

            </div>
        </div>
    );
}
