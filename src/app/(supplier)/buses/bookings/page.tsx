'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Calendar, Users, MapPin, Clock, Search, Filter, MoreVertical, Download, Ticket, ExternalLink, CreditCard, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

export default function BusBookingsPage() {
    const [user] = useState(() => getAuthUser());
    const [searchTerm, setSearchTerm] = useState('');

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['bus-bookings', user?.busVendorId || user?.bus_vendor_id],
        queryFn: async () => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            if (!vendorId) return [];
            const res = await api.get('/buses/bookings'); 
            return res.data;
        },
        enabled: !!user
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Reservation Ledger" subtitle="Real-time monitoring of passenger acquisition and seat occupancy" />
            <div className="p-6 space-y-8 animate-fadeIn">

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Today\'s Bookings', value: bookings.length, icon: Ticket, color: 'hsl(var(--accent))' },
                        { label: 'Confirmed Revenue', value: `₹${bookings.filter((b: any) => b.status === 'CONFIRMED').reduce((acc: number, b: any) => acc + (parseFloat(b.totalFare) || 0), 0).toLocaleString()}`, icon: CreditCard, color: 'hsl(var(--success))' },
                        { label: 'Active Passengers', value: bookings.filter((b: any) => b.status === 'CONFIRMED').length, icon: Users, color: 'hsl(var(--primary))' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-6 flex items-center gap-5">
                            <div className="p-4 rounded-3xl bg-white/05 border border-white/10" style={{ color: stat.color }}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Action Bar */}
                <div className="flex items-center justify-between gap-6 bg-white/02 p-6 rounded-[2.5rem] border border-white/05 shadow-sm">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by PNR, Passenger Name, or Mobile Access..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/03 border border-white/05 rounded-[2rem] pl-16 pr-6 py-4 text-sm font-bold text-foreground focus:ring-4 focus:ring-accent/20 focus:border-accent/50 outline-none transition-all placeholder:text-muted-foreground/30 shadow-inner"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/05 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            <Filter size={18} /> Deep Filters
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent text-white text-xs font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(20,80,255,0.3)] hover:scale-[1.02] transition-all">
                            <Download size={18} /> Export Data
                        </button>
                    </div>
                </div>

                {/* Bookings Table - High Precision */}
                <div className="glass-card overflow-hidden border-white/05">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/03 border-b border-white/05">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">PNR & Timestamp</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Passenger Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Trip Allocation</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Verification</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Transaction</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/03">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-40 text-center">
                                            <div className="relative inline-block mb-6">
                                                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
                                                <Ticket size={64} className="relative text-muted-foreground opacity-10 mx-auto" />
                                            </div>
                                            <p className="text-foreground text-lg font-black tracking-tight italic">Zero Reservation Activity</p>
                                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">Awaiting passenger unit acquisition</p>
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking: any) => (
                                        <tr key={booking.id} className="hover:bg-white/02 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-xs">
                                                        PNR
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-foreground tracking-tight">{booking.pnr}</div>
                                                        <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-black text-sm text-foreground tracking-tight">{booking.passengerName}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{booking.passengerPhone}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-xs font-black text-foreground">
                                                        <Clock size={14} className="text-accent" />
                                                        {booking.schedule?.departureTime || '10:30 PM'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        <MapPin size={12} />
                                                        Unit Segment: <span className="text-foreground">{booking.seatNumber || 'A1'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${booking.status === 'CONFIRMED' ? 'text-green-500' : 'text-muted-foreground'}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-black text-lg text-foreground tracking-tighter">₹{(parseFloat(booking.totalFare) || 0).toLocaleString()}</div>
                                                <div className="text-[10px] font-black text-accent mt-1 uppercase tracking-[0.15em]">{booking.paymentStatus || 'PAID'}</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-3 rounded-xl bg-white/03 border border-white/05 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    <button className="p-3 rounded-xl bg-white/03 border border-white/05 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
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
