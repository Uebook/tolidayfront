'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowLeft, Phone, Mail, ShieldCheck, ShieldAlert, Clock,
  Building2, Bus, CarFront, Map, Calendar, IndianRupee, Hash
} from 'lucide-react';
import Link from 'next/link';

const verticalIcon: Record<string, any> = {
  hotel: <Building2 size={14} />,
  HOTEL: <Building2 size={14} />,
  bus: <Bus size={14} />,
  BUS: <Bus size={14} />,
  cab: <CarFront size={14} />,
  CAB: <CarFront size={14} />,
  package: <Map size={14} />,
  PACKAGE: <Map size={14} />,
};

const statusStyle: Record<string, string> = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CANCELLED: 'badge-danger',
  COMPLETED: 'badge-info',
};

export default function ConsumerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // id is actually the email (see backend getAdminConsumers which sets id: c.email)
  const email = decodeURIComponent(id);

  // Fetch all consumers and find the one matching this email
  const { data: allConsumers = [], isLoading, error } = useQuery({
    queryKey: ['admin-consumers-list'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/consumers');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const consumer = allConsumers.find((c: any) => c.email === email || c.id === email);

  // Fetch all bookings and filter by guest email
  const { data: allBookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['admin-all-bookings-for-consumer'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/all');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const bookings = allBookings.filter((b: any) =>
    (b.guestEmail || '').toLowerCase() === email.toLowerCase()
  );

  if (isLoading || isBookingsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!consumer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Consumer Not Found</h1>
        <p className="text-zinc-500 mb-6 max-w-sm">No consumer found with email: <strong>{email}</strong></p>
        <Link href="/admin/consumer-users" className="btn btn-outline px-6 py-2.5 text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Users
        </Link>
      </div>
    );
  }

  const totalSpent = bookings.reduce((s: number, b: any) => s + Number(b.totalAmount || 0), 0);

  return (
    <div>
      <Topbar title="Consumer Profile" subtitle={`Details and booking history for ${consumer.name}`} />

      <div className="admin-page animate-fadeIn space-y-6">
        <Link href="/admin/consumer-users" className="btn btn-outline" style={{ gap: 6 }}>
          <ArrowLeft size={14} /> Back to User Management
        </Link>

        {/* Profile + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <div className="card md:col-span-1 p-6 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl">
              {consumer.name ? consumer.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">{consumer.name || 'Unknown'}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Joined: {consumer.createdAt ? new Date(consumer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>

            <div className="w-full space-y-2">
              <div className="p-3 bg-zinc-50 dark:bg-[#141e35] rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-bold">KYC Status</span>
                <span className={`badge ${consumer.kycStatus === 'VERIFIED' ? 'badge-success' : consumer.kycStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                  {consumer.kycStatus || 'PENDING'}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-[#141e35] rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-bold">Account</span>
                <span className={`badge ${consumer.status === 'suspended' ? 'badge-danger' : 'badge-success'}`}>
                  {consumer.status === 'suspended' ? 'Suspended' : 'Active'}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-[#141e35] rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-bold">Lifetime Value</span>
                <span className="font-black text-green-600">₹{Number(consumer.ltv || totalSpent).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-[#141e35] rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-bold">Total Bookings</span>
                <span className="font-black text-foreground">{bookings.length}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="card md:col-span-2 p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Contact & Identity</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email Address</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Mail size={14} className="text-zinc-400" /> {consumer.email || '—'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phone Number</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Phone size={14} className="text-zinc-400" /> {consumer.phone || '—'}
                </span>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/20">
              {[
                { label: 'Total Spent', value: `₹${Number(consumer.ltv || totalSpent).toLocaleString('en-IN')}`, Icon: IndianRupee, color: '#16a34a' },
                { label: 'Trips Booked', value: bookings.length, Icon: Calendar, color: '#1d4ed8' },
                { label: 'Confirmed', value: bookings.filter((b: any) => b.status === 'CONFIRMED').length, Icon: ShieldCheck, color: '#9333ea' },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 bg-zinc-50 dark:bg-[#141e35] rounded-xl">
                  <div className="text-lg font-black text-foreground">{s.value}</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Booking History</div>
            <span className="badge badge-info text-[9px] uppercase tracking-widest">
              {isBookingsLoading ? 'Loading...' : `${bookings.length} records`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Type</th>
                  <th>Property / Route</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                      <Calendar size={24} className="opacity-20 mx-auto mb-2" />
                      No booking history found for this user.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b: any, i: number) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Hash size={11} className="text-zinc-400" />
                          <span className="font-black text-blue-500 text-xs">{b.bookingReference || b.id?.slice(0, 8) || 'N/A'}</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-0.5 pl-5">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '—'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-muted flex items-center gap-1.5 w-fit">
                          {verticalIcon[b.vertical || b.type || 'hotel']}
                          {(b.vertical || b.type || 'Hotel').toUpperCase()}
                        </span>
                      </td>
                      <td className="text-xs font-bold text-foreground">{b.hotelName || b.propertyName || b.routeName || '—'}</td>
                      <td className="text-xs text-zinc-400">{b.startDate || b.checkIn || '—'}</td>
                      <td className="text-xs text-zinc-400">{b.endDate || b.checkOut || '—'}</td>
                      <td className="font-black text-sm text-foreground">₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${statusStyle[b.status] || 'badge-muted'}`}>{b.status || '—'}</span>
                      </td>
                      <td>
                        <Link href={`/admin/bookings/${b.id}`} className="btn btn-ghost btn-icon" title="View Booking">
                          <ArrowLeft size={13} className="rotate-180" />
                        </Link>
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
