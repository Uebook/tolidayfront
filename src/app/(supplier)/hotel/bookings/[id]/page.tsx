'use client';

import Topbar from '@/components/layout/Topbar';
import { ArrowLeft, User, Phone, Mail, Calendar, BedDouble, CreditCard, Clock, FileText, CheckCircle2, MessageSquare, Printer, Loader2, Edit } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [newRoomNumber, setNewRoomNumber] = useState('');

    const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
    const [modifyForm, setModifyForm] = useState({
        guestName: '',
        guestEmail: '',
        guestContact: '',
        numberOfGuests: 2,
        startDate: '',
        endDate: '',
        roomTypeId: ''
    });

    const { data: roomTypes = [] } = useQuery({
        queryKey: ['room-types'],
        queryFn: async () => {
            const res = await api.get('/room-types');
            return res.data;
        }
    });

    const modifyMutation = useMutation({
        mutationFn: async (payload: any) => {
            return api.patch(`/bookings/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            setIsModifyModalOpen(false);
            alert('Booking modified successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to modify booking');
        }
    });

    const openModifyModal = (booking: any) => {
        setModifyForm({
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestContact: booking.guestContact || '',
            numberOfGuests: booking.numberOfGuests || 2,
            startDate: booking.startDate,
            endDate: booking.endDate,
            roomTypeId: booking.roomTypeId
        });
        setIsModifyModalOpen(true);
    };

    const { data: booking, isLoading } = useQuery({
        queryKey: ['booking', id],
        queryFn: async () => {
            const res = await api.get(`/bookings/${id}`);
            return res.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            await api.patch(`/bookings/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
        }
    });

    const { data: physicalRooms = [] } = useQuery({
        queryKey: ['physical-rooms', booking?.roomTypeId],
        queryFn: async () => {
            const res = await api.get('/rooms');
            return res.data.filter((r: any) => r.roomTypeId === booking?.roomTypeId);
        },
        enabled: !!booking?.roomTypeId && isAssignModalOpen
    });

    const createRoomMutation = useMutation({
        mutationFn: async (roomNumber: string) => {
            const res = await api.post('/rooms', {
                roomNumber,
                roomTypeId: booking?.roomTypeId
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['physical-rooms', booking?.roomTypeId] });
            setNewRoomNumber('');
        }
    });

    const assignRoomMutation = useMutation({
        mutationFn: async (roomId: string) => {
            await api.patch(`/bookings/${id}/assign-room`, { roomId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            setIsAssignModalOpen(false);
        }
    });

    if (isLoading) {
        return (
            <div>
                <Topbar title="Booking Details" subtitle="Loading..." />
                <div className="flex items-center justify-center p-20">
                    <Loader2 size={32} className="animate-spin text-[hsl(195,90%,50%)]" />
                </div>
            </div>
        );
    }

    if (!booking) return null;

    const StatusBadge = ({ status }: { status: string }) => {
        const map: Record<string, string> = {
            CONFIRMED: 'badge-accent',
            CHECKED_IN: 'badge-success',
            CANCELLED: 'badge-destructive',
            PENDING: 'badge-warning',
            CHECKED_OUT: 'badge-muted'
        };
        const labels: Record<string, string> = {
            CONFIRMED: 'Confirmed',
            CHECKED_IN: 'Checked In',
            CANCELLED: 'Cancelled',
            PENDING: 'Pending',
            CHECKED_OUT: 'Checked Out'
        };
        return <span className={`badge ${map[status] || 'badge-muted'} text-[11px] px-3 py-1 uppercase tracking-wider`}>{labels[status] || status}</span>;
    };

    return (
        <div>
            <Topbar title={`Booking ${booking.id.substring(0, 8).toUpperCase()}`} subtitle={`Booking ID: ${booking.id}`} />

            <div className="p-8 space-y-6 animate-fadeIn max-w-[1200px] mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/hotel/bookings" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]">
                        <ArrowLeft size={16} /> Back to Bookings
                    </Link>

                    <div className="flex items-center gap-3">
                        <button onClick={() => openModifyModal(booking)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 transition-colors">
                            <Edit size={16} /> Modify Booking
                        </button>
                        <Link href={`/hotel-voucher/${id}`} target="_blank">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--glass-border-light)] hover:bg-[var(--table-header)] transition-colors">
                                <Printer size={16} /> Print Voucher
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status & Quick Actions */}
                        <div className="glass-card p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{booking.guestName}</h2>
                                <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                                    <StatusBadge status={booking.status} />
                                    <span>Ref: {booking.id.substring(0, 8).toUpperCase()}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> Booked {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons based on status */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {booking.status === 'PENDING' && (
                                    <button
                                        onClick={() => updateStatusMutation.mutate('CONFIRMED')}
                                        disabled={updateStatusMutation.isPending}
                                        className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Confirm Booking
                                    </button>
                                )}
                                {booking.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => updateStatusMutation.mutate('CHECKED_IN')}
                                        disabled={updateStatusMutation.isPending}
                                        className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Mark Checked In
                                    </button>
                                )}
                                {booking.status === 'CHECKED_IN' && (
                                    <button
                                        onClick={() => updateStatusMutation.mutate('CHECKED_OUT')}
                                        disabled={updateStatusMutation.isPending}
                                        className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Mark Checked Out
                                    </button>
                                )}
                                {booking.status !== 'CANCELLED' && booking.status !== 'CHECKED_OUT' && (
                                    <button
                                        onClick={() => updateStatusMutation.mutate('CANCELLED')}
                                        disabled={updateStatusMutation.isPending}
                                        className="px-5 py-2.5 text-sm rounded-lg font-medium text-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%,0.1)] border border-[hsl(0,84%,60%,0.2)] hover:bg-[hsl(0,84%,60%,0.15)] transition-colors"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stay Details */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-5 flex items-center gap-2">
                                <BedDouble size={20} className="text-[hsl(var(--accent))]" /> Stay Information
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 p-4 rounded-xl bg-[var(--table-header)] border border-[var(--glass-border-light)]">
                                <div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Check-in</p>
                                    <p className="font-semibold text-[hsl(var(--foreground))]">{new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">14:00 onwards</p>
                                </div>
                                <div className="hidden md:flex items-center justify-center">
                                    <div className="h-px w-full bg-[var(--table-header)] relative">
                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgb(16,20,31)] px-2 text-xs text-[hsl(var(--muted-foreground))]">
                                            Stay
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Check-out</p>
                                    <p className="font-semibold text-[hsl(var(--foreground))]">{new Date(booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Before 11:00</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Guests</p>
                                    <p className="font-semibold text-[hsl(var(--foreground))]">{booking.numberOfGuests} Guests</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-[var(--table-header)] border border-[var(--glass-border-light)]">
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Room Type</p>
                                    <p className="font-medium text-[hsl(var(--foreground))]">{booking.roomType?.name || 'N/A'}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--table-header)] border border-[var(--glass-border-light)]">
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Meal Plan</p>
                                    <p className="font-medium text-[hsl(var(--foreground))]">Not Specified</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--table-header)] border border-[var(--glass-border-light)] md:col-span-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Room Number</p>
                                        <p className="font-medium text-[hsl(var(--foreground))]">{booking.assignedRoom ? booking.assignedRoom.roomNumber : 'Unassigned'}</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsAssignModalOpen(true)}
                                        className="text-sm text-[hsl(var(--accent))] font-medium hover:underline"
                                    >
                                        {booking.assignedRoom ? 'Change Room' : 'Assign Room'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Guest & Payment */}
                    <div className="space-y-6">

                        {/* Guest Details */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-5 flex items-center gap-2">
                                <User size={20} className="text-[hsl(var(--accent))]" /> Guest Details
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(228,80%,55%)] to-[hsl(195,90%,45%)] flex items-center justify-center font-bold text-[hsl(var(--foreground))] text-lg">
                                        {booking.guestName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-[hsl(var(--foreground))]">{booking.guestName}</p>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone size={16} className="text-[hsl(var(--muted-foreground))]" />
                                        <a href={`tel:${booking.guestContact}`} className="text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] transition-colors">{booking.guestContact || 'N/A'}</a>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail size={16} className="text-[hsl(var(--muted-foreground))]" />
                                        <a href={`mailto:${booking.guestEmail}`} className="text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] transition-colors">{booking.guestEmail}</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-5 flex items-center gap-2">
                                <CreditCard size={20} className="text-[hsl(var(--accent))]" /> Payment Summary
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Booking Total</span>
                                    <span className="text-[hsl(var(--foreground))] font-medium">₹{Number(booking.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="pt-3 mt-3 border-t border-[var(--glass-border-light)] flex items-center justify-between">
                                    <span className="text-[hsl(var(--foreground))] font-semibold">Total Amount</span>
                                    <span className="text-lg font-bold text-[hsl(var(--foreground))]">₹{Number(booking.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Room Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 animate-fadeIn">
                        <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4">Assign Room Number</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Select Existing Room</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {physicalRooms.map((room: any) => (
                                        <button
                                            key={room.id}
                                            onClick={() => setSelectedRoomId(room.id)}
                                            className={`p-2 rounded-lg text-sm font-medium border transition-colors ${
                                                selectedRoomId === room.id 
                                                ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]' 
                                                : 'border-[var(--glass-border)] hover:border-[hsl(var(--accent)/0.5)]'
                                            }`}
                                        >
                                            {room.roomNumber}
                                        </button>
                                    ))}
                                    {physicalRooms.length === 0 && (
                                        <div className="col-span-3 text-sm text-[hsl(var(--muted-foreground))] py-2">
                                            No rooms created for this room type yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--glass-border-light)]">
                                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Or Add New Room</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newRoomNumber}
                                        onChange={(e) => setNewRoomNumber(e.target.value)}
                                        placeholder="e.g. 101" 
                                        className="flex-1 px-3 py-2 bg-[var(--table-header)] border border-[var(--glass-border-light)] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--accent))]"
                                    />
                                    <button 
                                        onClick={() => createRoomMutation.mutate(newRoomNumber)}
                                        disabled={!newRoomNumber.trim() || createRoomMutation.isPending}
                                        className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border-light)]">
                            <button 
                                onClick={() => setIsAssignModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => assignRoomMutation.mutate(selectedRoomId)}
                                disabled={!selectedRoomId || assignRoomMutation.isPending}
                                className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModifyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-[500px] max-w-full p-6 animate-scaleIn space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border-light)]">
                            <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Modify Booking Details</h3>
                            <button onClick={() => setIsModifyModalOpen(false)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Guest Name</label>
                                <input 
                                    type="text" 
                                    value={modifyForm.guestName}
                                    onChange={(e) => setModifyForm({ ...modifyForm, guestName: e.target.value })}
                                    className="form-input w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={modifyForm.guestEmail}
                                        onChange={(e) => setModifyForm({ ...modifyForm, guestEmail: e.target.value })}
                                        className="form-input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Contact Number</label>
                                    <input 
                                        type="text" 
                                        value={modifyForm.guestContact}
                                        onChange={(e) => setModifyForm({ ...modifyForm, guestContact: e.target.value })}
                                        className="form-input w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Check-in Date</label>
                                    <input 
                                        type="date" 
                                        value={modifyForm.startDate}
                                        onChange={(e) => setModifyForm({ ...modifyForm, startDate: e.target.value })}
                                        className="form-input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Check-out Date</label>
                                    <input 
                                        type="date" 
                                        value={modifyForm.endDate}
                                        onChange={(e) => setModifyForm({ ...modifyForm, endDate: e.target.value })}
                                        className="form-input w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Guests Count</label>
                                    <input 
                                        type="number" 
                                        value={modifyForm.numberOfGuests}
                                        onChange={(e) => setModifyForm({ ...modifyForm, numberOfGuests: Number(e.target.value) })}
                                        className="form-input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Room Category</label>
                                    <select 
                                        value={modifyForm.roomTypeId}
                                        onChange={(e) => setModifyForm({ ...modifyForm, roomTypeId: e.target.value })}
                                        className="form-input w-full bg-[var(--table-header)]"
                                    >
                                        {roomTypes.map((rt: any) => (
                                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border-light)]">
                            <button 
                                onClick={() => setIsModifyModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => modifyMutation.mutate(modifyForm)}
                                disabled={modifyMutation.isPending}
                                className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
