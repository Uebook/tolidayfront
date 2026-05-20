'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Bus, Plus, MoreVertical, Users, LayoutGrid, Edit, Trash2, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

export default function FleetPage() {
    const queryClient = useQueryClient();
    const [user] = useState(() => getAuthUser());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: buses = [], isLoading } = useQuery({
        queryKey: ['bus-fleet', user?.busVendorId || user?.bus_vendor_id],
        queryFn: async () => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            if (!vendorId) return [];
            const res = await api.get(`/buses/vendors/${vendorId}/buses`);
            return res.data;
        },
        enabled: !!user,
    });

    const addBusMutation = useMutation({
        mutationFn: async (data: any) => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            return api.post('/buses/buses', { ...data, vendorId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-fleet'] });
            setIsAddModalOpen(false);
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Bus Fleet Management" subtitle="Manage your vehicles, seat layouts, and GPS tracking" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="glass-card px-4 py-3 text-center min-w-[120px]">
                            <div className="text-xl font-bold text-[hsl(var(--foreground))]">{buses.length}</div>
                            <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Total Vehicles</div>
                        </div>
                        <div className="glass-card px-4 py-3 text-center min-w-[120px]">
                            <div className="text-xl font-bold" style={{ color: 'hsl(142 71% 45%)' }}>
                                {buses.filter((b: any) => b.isActive).length}
                            </div>
                            <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Active Now</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
                    >
                        <Plus size={16} /> Add New Bus
                    </button>
                </div>

                {/* Bus Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {buses.map((bus: any) => (
                        <div key={bus.id} className="glass-card p-5 hover:scale-[1.01] transition-transform cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl" style={{ background: 'hsl(228 80% 55% / 0.15)' }}>
                                        <Bus size={20} style={{ color: 'hsl(228 80% 55%)' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[hsl(var(--foreground))] text-sm">{bus.registrationNumber}</h3>
                                        <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{bus.type.replace(/_/g, ' ')}</p>
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
                                        <LayoutGrid size={11} /> Seats
                                    </div>
                                    <div className="font-bold text-[hsl(var(--foreground))] text-sm mt-0.5">{bus.totalSeats}</div>
                                </div>
                                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--glass-border-light)' }}>
                                    <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                        <ShieldCheck size={11} /> Status
                                    </div>
                                    <div className="font-bold text-[hsl(var(--foreground))] text-sm mt-0.5" style={{ color: bus.isActive ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)' }}>
                                        {bus.isActive ? 'Active' : 'Idle'}
                                    </div>
                                </div>
                                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--glass-border-light)' }}>
                                    <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                        <MapPin size={11} /> GPS
                                    </div>
                                    <div className="font-bold text-[hsl(var(--foreground))] text-sm mt-0.5">{bus.gpsDeviceId ? 'Online' : 'None'}</div>
                                </div>
                            </div>

                            {/* Amenity tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4 min-h-[24px]">
                                {bus.amenities?.map((a: string) => (
                                    <span key={a} className="badge badge-muted text-[10px] uppercase">{a}</span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-[var(--glass-border)]">
                                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--table-hover)] transition-colors" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>
                                    <Edit size={13} /> Edit Bus
                                </button>
                                <Link href={`/buses/fleet/${bus.id}/layout-builder`} className="flex-1">
                                    <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors btn-accent">
                                        Manage Layout
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card */}
                    <div 
                        onClick={() => setIsAddModalOpen(true)}
                        className="glass-card p-5 flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-[var(--glass-border-light)] hover:border-[var(--glass-border-light)] transition-colors min-h-[240px]"
                    >
                        <div className="p-3 rounded-full" style={{ background: 'var(--glass-border-light)' }}>
                            <Plus size={24} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Add New Vehicle</p>
                            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Expand your bus fleet</p>
                        </div>
                    </div>
                </div>

                {/* Add Bus Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                        <div 
                            className="w-full max-w-xl overflow-hidden animate-scaleIn shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10"
                            style={{ 
                                background: 'linear-gradient(145deg, #1a1f35 0%, #0d101b 100%)',
                                borderRadius: '32px'
                            }}
                        >
                            {/* Modal Header */}
                            <div 
                                className="px-10 py-8 flex items-center justify-between relative overflow-hidden"
                                style={{ background: 'linear-gradient(90deg, hsl(228 80% 55%) 0%, hsl(195 90% 45%) 100%)' }}
                            >
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                                
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                                        <Bus size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-white leading-none">Register Vehicle</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></span>
                                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Fleet Expansion Hub</p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all hover:scale-110 relative z-10"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <form className="p-10 space-y-10" onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const data = {
                                    registrationNumber: formData.get('registrationNumber'),
                                    type: formData.get('type'),
                                    totalSeats: Number(formData.get('totalSeats')),
                                    amenities: (formData.get('amenities') as string).split(',').map(s => s.trim()).filter(Boolean),
                                    gpsDeviceId: formData.get('gpsDeviceId'),
                                };
                                addBusMutation.mutate(data);
                            }}>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Registration Number</label>
                                        <input 
                                            name="registrationNumber"
                                            required
                                            className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner"
                                            placeholder="e.g. MH-12-PQ-9988"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Vehicle Category</label>
                                        <div className="relative">
                                            <select 
                                                name="type"
                                                required
                                                className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option className="bg-[#0d101b]" value="AC_SEATER">AC Seater (Premium)</option>
                                                <option className="bg-[#0d101b]" value="NON_AC_SEATER">Non-AC Seater</option>
                                                <option className="bg-[#0d101b]" value="AC_SLEEPER">AC Sleeper (Luxury)</option>
                                                <option className="bg-[#0d101b]" value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                                                <option className="bg-[#0d101b]" value="VOLVO_AC_SEATER">Volvo Multi-Axle</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Seating Capacity</label>
                                        <input 
                                            name="totalSeats"
                                            type="number"
                                            required
                                            className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                                            placeholder="Total seats"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">GPS Integration ID</label>
                                        <input 
                                            name="gpsDeviceId"
                                            className="w-full bg-white/05 border border-white/10 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner"
                                            placeholder="Device Serial (Opt.)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Premium Amenities</label>
                                    <textarea 
                                        name="amenities"
                                        rows={2}
                                        className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 resize-none shadow-inner"
                                        placeholder="WiFi, Luxury Blanket, Water, USB Charging Ports..."
                                    />
                                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest ml-1">Separate entries with commas</p>
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border border-white/10 text-white/40 hover:text-white hover:bg-white/05 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={addBusMutation.isPending}
                                        className="flex-[2] py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_50px_rgba(20,80,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale relative overflow-hidden group"
                                        style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%) 0%, hsl(195 90% 45%) 100%)' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">{addBusMutation.isPending ? 'Processing...' : 'Register Vehicle'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
