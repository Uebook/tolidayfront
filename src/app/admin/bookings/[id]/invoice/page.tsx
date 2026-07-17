'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Printer, Download, ArrowLeft, Mail, Phone, Info } from 'lucide-react';
import Link from 'next/link';

export default function GuestInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Fetch Booking Details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['admin-booking-detail', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-zinc-600 font-medium">Generating Guest Invoice...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <Info size={32} />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">Booking Not Found</h1>
        <p className="text-zinc-500 mb-6 max-w-sm">We couldn't retrieve the details for this booking.</p>
        <Link href="/admin/bookings" className="btn btn-outline px-6 py-2.5 text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Bookings
        </Link>
      </div>
    );
  }

  const hotel = booking.hotel || {};
  const totalAmount = Number(booking.totalAmount || 0);

  // 12% GST Accommodation rule
  const gstRate = 12;
  const basePrice = totalAmount / (1 + gstRate / 100);
  const gstAmount = totalAmount - basePrice;
  const halfGst = gstAmount / 2; // CGST (6%) + SGST (6%)

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 font-sans print:bg-white print:p-0">
      {/* Top Toolbar (Hidden during print) */}
      <div className="bg-white border-b border-zinc-200 py-4 px-6 sticky top-0 z-50 shadow-sm flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900">
            <ArrowLeft size={16} /> Back to Bookings
          </Link>
          <span className="text-zinc-300">|</span>
          <span className="text-sm font-bold text-zinc-800">Guest Tax Invoice</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow transition-colors"
          >
            <Printer size={16} /> Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Page Container */}
      <div className="max-w-[850px] mx-auto my-8 bg-white shadow-lg border border-zinc-200 p-10 print:shadow-none print:border-none print:my-0 print:p-0">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight uppercase">Guest Tax Invoice</h1>
            <p className="text-zinc-500 font-mono text-sm mt-1">Ref: {booking.bookingReference || `#${booking.id.slice(0,8).toUpperCase()}`}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-green-100 text-green-700`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Company & Guest details */}
        <div className="grid grid-cols-2 gap-8 pb-8 border-b border-zinc-200 text-xs">
          <div>
            <h3 className="font-bold text-indigo-950 uppercase mb-2 tracking-wide">Property / Supplier</h3>
            <p className="font-bold text-sm text-zinc-900 mb-1">{hotel.name || 'Hotel Partner'}</p>
            <p className="text-zinc-600 leading-relaxed">
              {hotel.address || 'Property Address'}
            </p>
            <div className="mt-3 space-y-0.5 text-zinc-500 font-medium">
              <span className="flex items-center gap-1"><Phone size={12} /> {hotel.contactNumber || 'N/A'}</span>
              <span className="flex items-center gap-1"><Mail size={12} /> {hotel.email || 'N/A'}</span>
              {hotel.gstNumber && <p className="font-bold text-zinc-700 mt-1">GSTIN: {hotel.gstNumber}</p>}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-indigo-950 uppercase mb-2 tracking-wide">Guest Details</h3>
            <p className="font-bold text-sm text-zinc-900 mb-1">{booking.guestName}</p>
            <div className="space-y-0.5 text-zinc-600">
              <p>Email: {booking.guestEmail}</p>
              <p>Phone: {booking.guestPhone}</p>
            </div>
          </div>
        </div>

        {/* Invoice Dates Row */}
        <div className="grid grid-cols-3 gap-6 py-6 border-b border-zinc-200 text-xs bg-slate-50/50 px-4 rounded-xl my-6">
          <div>
            <span className="text-zinc-400 font-bold block uppercase text-[10px]">Booking Date</span>
            <span className="font-bold text-zinc-800 text-xs">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : '—'}</span>
          </div>
          <div>
            <span className="text-zinc-400 font-bold block uppercase text-[10px]">Check-In</span>
            <span className="font-bold text-zinc-800 text-xs">{booking.startDate}</span>
          </div>
          <div>
            <span className="text-zinc-400 font-bold block uppercase text-[10px]">Check-Out</span>
            <span className="font-bold text-zinc-800 text-xs">{booking.endDate}</span>
          </div>
        </div>

        {/* Details Table */}
        <div className="my-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Accommodation Description</th>
                <th className="p-3 text-right">Taxable Value</th>
                <th className="p-3 text-right">CGST (6%)</th>
                <th className="p-3 text-right">SGST (6%)</th>
                <th className="p-3 text-right">Gross Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr className="font-medium text-zinc-700">
                <td className="p-3 max-w-xs">
                  <span className="font-bold text-zinc-900 block text-sm">Room Stay Charges</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Stay from {booking.startDate} to {booking.endDate}</span>
                </td>
                <td className="p-3 text-right">₹{basePrice.toFixed(2)}</td>
                <td className="p-3 text-right">₹{halfGst.toFixed(2)}</td>
                <td className="p-3 text-right">₹{halfGst.toFixed(2)}</td>
                <td className="p-3 text-right font-bold text-indigo-900">₹{totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary calculation card */}
        <div className="flex justify-end my-10">
          <div className="w-80 space-y-2 text-xs border-t-2 border-indigo-900 pt-4">
            <div className="flex justify-between font-semibold">
              <span className="text-zinc-500">Taxable Value:</span>
              <span>₹{basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-zinc-500">CGST (6%):</span>
              <span>₹{halfGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-zinc-500">SGST (6%):</span>
              <span>₹{halfGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-black text-indigo-950">
              <span>Grand Total Paid:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="mt-16 text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-200 pt-6">
          <p className="font-bold mb-1">Declaration:</p>
          <p>This is a computer generated Guest Tax Invoice for your stay booking. All transactions are securely processed via platform settlement.</p>
        </div>

      </div>
    </div>
  );
}
