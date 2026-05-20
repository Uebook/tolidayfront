'use client';

import Topbar from '@/components/layout/Topbar';
import { 
    BookOpen, Search, Filter, Calendar, Users, 
    IndianRupee, Eye, Download, Mail, Phone,
    CheckCircle2, Clock, XCircle, ArrowRight, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function BookingsListingPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Topbar 
                title="Tour Bookings" 
                subtitle="Track and manage your upcoming traveler reservations"
            />

            <div className="p-8 space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Bookings', value: bookings.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-600/10' },
                        { label: 'Confirmed', value: bookings.filter(b => b.status === 'CONFIRMED').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Revenue', value: `₹${bookings.reduce((acc, b) => acc + Number(b.totalAmount), 0).toLocaleString()}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-600/10' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-6 border border-[var(--glass-border)] rounded-[24px] flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by guest name or ref..."
                            className="w-full pl-12 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] outline-none text-sm font-bold min-w-[140px]"
                        >
                            <option value="ALL">All Status</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PENDING">Pending</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--table-header)] transition-colors text-sm font-bold">
                            <Download size={18} /> Export List
                        </button>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="glass-card border border-[var(--glass-border)] rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--table-header)] border-b border-[var(--glass-border)]">
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">Booking Info</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">Traveler Details</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">Tour Details</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">Amount</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">Status</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--glass-border)]">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="p-8"><div className="h-12 bg-white/5 rounded-2xl" /></td>
                                        </tr>
                                    ))
                                ) : filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-5">
                                                <div className="space-y-1">
                                                    <p className="font-black text-sm text-blue-600">#{booking.bookingReference || 'REF-8291'}</p>
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                                                        <Calendar size={12} /> {new Date(booking.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                        {booking.guestName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{booking.guestName}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                                                            <Mail size={10} /> {booking.guestEmail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm line-clamp-1">{booking.packageName || 'Kashmir Paradise Tour'}</p>
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                                        <Users size={12} /> {booking.numberOfGuests} Guests
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-lg text-accent">₹{Number(booking.totalAmount).toLocaleString()}</p>
                                                    <p className="text-[9px] uppercase font-bold text-emerald-500 tracking-wider">Paid Online</p>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <Link 
                                                    href={`/packages/bookings/${booking.id}`}
                                                    className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-[var(--glass-border)] hover:border-blue-600/50 hover:bg-blue-600/10 transition-all text-muted-foreground hover:text-blue-600"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center">
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                                    <BookOpen size={30} className="text-muted-foreground opacity-20" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">No Bookings Found</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
