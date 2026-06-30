'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { BedDouble, Plus, MoreVertical, Users, Maximize, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function RoomsPage() {
    const { data: rooms = [], isLoading } = useQuery({
        queryKey: ['room-types'],
        queryFn: async () => {
            const res = await api.get('/room-types');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    const totalRooms = rooms.reduce((s: number, r: any) => s + (r.totalRooms || 10), 0); // Sum room capacities
    const totalBooked = 0; // Backend doesn't provide today's booked count yet in this API

    return (
        <div>
            <Topbar title="Room Categories" subtitle="Manage your room types, pricing and capacities" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="glass-card px-4 py-3 text-center min-w-[100px]">
                            <div className="text-xl font-bold text-[hsl(var(--foreground))]">{rooms.length}</div>
                            <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Room Types</div>
                        </div>
                        <div className="glass-card px-4 py-3 text-center min-w-[100px]">
                            <div className="text-xl font-bold text-[hsl(var(--foreground))]">{totalRooms}</div>
                            <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Total Rooms</div>
                        </div>
                        <div className="glass-card px-4 py-3 text-center min-w-[100px]">
                            <div className="text-xl font-bold" style={{ color: 'hsl(142 71% 45%)' }}>{totalRooms > 0 ? Math.round((totalBooked / totalRooms) * 100) : 0}%</div>
                            <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Today's Occ.</div>
                        </div>
                    </div>
                    <Link href="/hotel/rooms/new">
                        <button className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                            <Plus size={16} /> Add Room Type
                        </button>
                    </Link>
                </div>

                {/* Room Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {rooms.map((room: any) => {
                        const occupancy = 0; // Mocked for now
                        const basePrice = parseFloat(room.price) || 0;
                        return (
                            <div key={room.id} className="glass-card p-5 hover:scale-[1.01] transition-transform cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl" style={{ background: 'hsl(225 70% 55% / 0.15)' }}>
                                            <BedDouble size={20} style={{ color: 'hsl(225 70% 65%)' }} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[hsl(var(--foreground))] text-sm flex items-center gap-2">
                                                {room.name}
                                                {room.ratePlans && room.ratePlans.length > 0 && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[hsl(var(--accent))/10] text-[hsl(var(--accent))] border border-[hsl(var(--accent))/20]">
                                                        {room.ratePlans.length} {room.ratePlans.length === 1 ? 'Package' : 'Packages'}
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Room Category</p>
                                        </div>
                                    </div>
                                    <button className="p-1 rounded hover:bg-[var(--table-header)]">
                                        <MoreVertical size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--glass-border-light)' }}>
                                        <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                            <Users size={11} /> Max Guests
                                        </div>
                                        <div className="font-bold text-[hsl(var(--foreground))] text-sm mt-0.5">{room.capacity}</div>
                                    </div>
                                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--glass-border-light)' }}>
                                        <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                            <Maximize size={11} /> Sqft
                                        </div>
                                        <div className="font-bold text-[hsl(var(--foreground))] text-sm mt-0.5">{room.size || '300'}</div>
                                    </div>
                                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--glass-border-light)' }}>
                                        <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Total</div>
                                        <div className="font-bold text-[hsl(var(--foreground))] text-sm mt-0.5">{room.totalRooms || 10}</div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-lg font-bold text-[hsl(var(--foreground))]">₹{basePrice.toLocaleString()}</span>
                                        <span className="text-xs ml-1" style={{ color: 'hsl(var(--muted-foreground))' }}>/night</span>
                                    </div>
                                    <span className={`badge ${occupancy >= 80 ? 'badge-success' : occupancy >= 50 ? 'badge-warning' : 'badge-muted'}`}>
                                        {occupancy}% booked
                                    </span>
                                </div>

                                {/* Occupancy bar */}
                                <div style={{ height: 4, background: 'var(--glass-border-light)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${occupancy}%`, borderRadius: 4,
                                        background: occupancy >= 80 ? 'hsl(142 71% 45%)' : occupancy >= 50 ? 'hsl(38 92% 50%)' : 'hsl(var(--accent))',
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>

                                {/* Amenity tags */}
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {room.amenities && room.amenities.length > 0 ? (
                                        room.amenities.slice(0, 4).map((a: string, i: number) => (
                                            <span key={i} className="badge badge-muted text-xs">{a}</span>
                                        ))
                                    ) : (
                                        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>No amenities listed</span>
                                    )}
                                    {room.amenities && room.amenities.length > 4 && (
                                        <span className="badge badge-muted text-xs">+{room.amenities.length - 4}</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--glass-border)]">
                                    <Link href={`/hotel/rooms/${room.id}`} className="flex-1">
                                        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--table-hover)] transition-colors" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>
                                            <Edit size={13} /> Edit
                                        </button>
                                    </Link>
                                    <Link href={`/hotel/inventory?room=${room.id}`} className="flex-1">
                                        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors btn-primary">
                                            Inventory
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Card */}
                    <Link href="/hotel/rooms/new">
                        <div className="glass-card p-5 flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-[var(--glass-border-light)] hover:border-[var(--glass-border-light)] transition-colors min-h-[280px]">
                            <div className="p-3 rounded-full" style={{ background: 'var(--glass-border-light)' }}>
                                <Plus size={24} style={{ color: 'hsl(var(--muted-foreground))' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Add Room Type</p>
                                <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Define a new room category</p>
                            </div>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
}
