'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import { 
    ArrowLeft, Calendar, Users, IndianRupee, Mail, Phone, 
    MapPin, Clock, CheckCircle2, XCircle, Printer, Send,
    FileText, User, CreditCard, ShieldCheck, Info, Map
} from 'lucide-react';
import api from '@/lib/api';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const res = await api.get(`/bookings/${id}`);
            setBooking(res.data);
        } catch (err) {
            console.error('Failed to fetch booking', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await api.patch(`/bookings/${id}/status`, { status: newStatus });
            setBooking({ ...booking, status: newStatus });
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
            <button onClick={() => router.back()} className="text-blue-600 font-bold">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Topbar 
                title={`Booking #${booking.bookingReference || 'REF-8291'}`}
                subtitle={`Managed reservation for ${booking.guestName}`}
            />

            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 transition-all font-bold text-sm"
                    >
                        <ArrowLeft size={18} /> Back to List
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="p-2.5 rounded-xl border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 transition-all text-muted-foreground">
                            <Printer size={18} />
                        </button>
                        <button className="p-2.5 rounded-xl border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 transition-all text-muted-foreground">
                            <Send size={18} />
                        </button>
                        {booking.status === 'PENDING' && (
                            <button 
                                onClick={() => handleStatusUpdate('CONFIRMED')}
                                disabled={isUpdating}
                                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95"
                            >
                                Confirm Booking
                            </button>
                        )}
                        {booking.status !== 'CANCELLED' && (
                            <button 
                                onClick={() => handleStatusUpdate('CANCELLED')}
                                disabled={isUpdating}
                                className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Alert */}
                        <div className={`p-6 rounded-[32px] border flex items-center justify-between ${
                            booking.status === 'CONFIRMED' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                                : booking.status === 'PENDING'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                                : 'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    booking.status === 'CONFIRMED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                    {booking.status === 'CONFIRMED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-black text-lg uppercase tracking-widest">Booking {booking.status}</h4>
                                    <p className="text-sm font-bold opacity-80">
                                        {booking.status === 'CONFIRMED' 
                                            ? 'The traveler has been notified and the tour is locked.' 
                                            : 'Please review and confirm this booking as soon as possible.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="glass-card p-8 border border-[var(--glass-border)] rounded-[40px] shadow-2xl space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--glass-border)] pb-6">
                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                                    {booking.guestName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">{booking.guestName}</h3>
                                    <p className="text-muted-foreground font-bold flex items-center gap-2">
                                        <Mail size={16} className="text-blue-600" /> {booking.guestEmail}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Traveler Contact</h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-[var(--glass-border)] font-bold text-sm">
                                            <Phone size={18} className="text-blue-600" /> {booking.guestContact || '+91 98765 43210'}
                                        </div>
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-[var(--glass-border)] font-bold text-sm">
                                            <MapPin size={18} className="text-blue-600" /> New Delhi, India
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h5 className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Booking Metadata</h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-[var(--glass-border)]">
                                            <span className="text-xs font-bold text-muted-foreground">Created On</span>
                                            <span className="text-sm font-black">{new Date(booking.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-[var(--glass-border)]">
                                            <span className="text-xs font-bold text-muted-foreground">Guests</span>
                                            <span className="text-sm font-black flex items-center gap-2">
                                                <Users size={14} className="text-blue-600" /> {booking.numberOfGuests} Persons
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Itinerary Preview */}
                        <div className="glass-card p-8 border border-[var(--glass-border)] rounded-[40px] shadow-2xl space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <Map size={24} className="text-blue-600" /> Tour Overview
                            </h3>
                            <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-600/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-lg">{booking.packageName || 'Kashmir Paradise Tour'}</h4>
                                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">Selected Package</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-sm font-bold">
                                        <Calendar size={18} className="text-blue-600" />
                                        <span>Start: {new Date(booking.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold">
                                        <Clock size={18} className="text-blue-600" />
                                        <span>End: {new Date(booking.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Sidebar */}
                    <div className="space-y-8">
                        {/* Payment Card */}
                        <div className="glass-card p-8 border border-[var(--glass-border)] rounded-[40px] shadow-2xl bg-gradient-to-br from-white/5 to-white/[0.02] space-y-6">
                            <h5 className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Payment Summary</h5>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-muted-foreground">Package Rate</span>
                                    <span className="font-black">₹{Number(booking.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-muted-foreground">GST (5%)</span>
                                    <span className="font-black">₹0.00</span>
                                </div>
                                <div className="pt-4 border-t border-[var(--glass-border)] flex items-center justify-between">
                                    <span className="text-lg font-black">Total Paid</span>
                                    <span className="text-2xl font-black text-accent">₹{Number(booking.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600">Payment Verified via Stripe</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="glass-card p-8 border border-[var(--glass-border)] rounded-[40px] shadow-2xl space-y-4">
                            <h5 className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Operational Tasks</h5>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-sm font-bold">
                                    <Printer size={18} className="text-muted-foreground" /> Print Voucher
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-sm font-bold">
                                    <FileText size={18} className="text-muted-foreground" /> Download Invoice
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-sm font-bold">
                                    <User size={18} className="text-muted-foreground" /> Assign Guide
                                </button>
                            </div>
                        </div>

                        {/* Important Note */}
                        <div className="p-6 rounded-[32px] bg-amber-500/5 border border-amber-500/10 space-y-2">
                            <h6 className="flex items-center gap-2 text-xs font-black text-amber-600 uppercase tracking-widest">
                                <Info size={14} /> Partner Note
                            </h6>
                            <p className="text-[11px] font-bold text-amber-600/80 leading-relaxed">
                                Please ensure all operational manifests are updated at least 24 hours before the tour start date.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
