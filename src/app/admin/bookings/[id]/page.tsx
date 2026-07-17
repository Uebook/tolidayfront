'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { ArrowLeft, Calendar, ShieldCheck, ShieldAlert, CreditCard, Mail, Phone, Clock, FileText, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  // Fetch Booking Details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['admin-booking-detail', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data;
    }
  });

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/bookings/admin/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
      toast.success('Booking status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Booking Not Found</h1>
        <p className="text-zinc-500 mb-6 max-w-sm">We couldn't retrieve the details for this booking.</p>
        <Link href="/admin/bookings" className="btn btn-outline px-6 py-2.5 text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Bookings
        </Link>
      </div>
    );
  }

  const hotel = booking.hotel || {};

  return (
    <div>
      <Topbar title="Booking Details" subtitle={`Reservation details for Ref: ${booking.bookingReference || booking.id.slice(0, 8).toUpperCase()}`} />

      <div className="admin-page animate-fadeIn space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/bookings" className="btn btn-outline" style={{ gap: 6 }}>
            <ArrowLeft size={14} /> Back to Master List
          </Link>
          <Link href={`/admin/bookings/${id}/invoice`} className="btn btn-success" style={{ gap: 6 }}>
            <FileText size={14} /> View Guest Invoice
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overview Info */}
          <div className="card p-6 md:col-span-2 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reference Reference</span>
                <h2 className="text-lg font-black text-foreground">{booking.bookingReference || 'N/A'}</h2>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-green-100 text-green-700`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Check-In Date</span>
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Calendar size={14} className="text-zinc-400" /> {booking.startDate}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Check-Out Date</span>
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Calendar size={14} className="text-zinc-400" /> {booking.endDate}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Property Name</span>
                <span className="font-bold text-foreground">{hotel.name || '—'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Room Category</span>
                <span className="font-bold text-foreground">{booking.roomType?.name || 'Standard Room'}</span>
              </div>
            </div>

            {/* Quick Actions */}
            {booking.status !== 'CANCELLED' && (
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                <button
                  onClick={() => updateStatusMutation.mutate('CANCELLED')}
                  disabled={updateStatusMutation.isPending}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <XCircle size={15} /> Cancel Reservation
                </button>
              </div>
            )}
          </div>

          {/* Guest Card */}
          <div className="card p-6 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Guest Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center font-bold text-blue-600">
                {booking.guestName ? booking.guestName.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className="text-sm font-black text-foreground">{booking.guestName}</div>
                <div className="text-xs text-zinc-400 mt-0.5">Primary Guest</div>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Mail size={14} className="text-zinc-400" /> {booking.guestEmail || '—'}
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Phone size={14} className="text-zinc-400" /> {booking.guestPhone || '—'}
              </div>
              <div className="flex justify-between font-black text-sm pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400">Total Paid</span>
                <span className="text-green-600">₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
