'use client';

import Topbar from '@/components/layout/Topbar';
import { Plus, Edit, Trash2, CalendarDays, Tag } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const typeConfig: Record<string, { label: string; cls: string }> = {
    seasonal: { label: 'Seasonal', cls: 'badge-accent' },
    special: { label: 'Special Event', cls: 'badge-warning' },
    weekend: { label: 'Weekend', cls: 'badge-success' },
};

function ExtraPersonCharges({ roomTypes }: { roomTypes: any[] }) {
    const queryClient = useQueryClient();
    const [prices, setPrices] = useState<Record<string, number>>({});

    // Initialize prices from roomTypes
    useState(() => {
        const p: Record<string, number> = {};
        roomTypes.forEach(rt => {
            p[rt.id] = Number(rt.extraPersonPrice) || 0;
        });
        setPrices(p);
    });

    const updateMutation = useMutation({
        mutationFn: async (vars: { id: string, price: number }) => {
            await api.patch(`/room-types/${vars.id}`, { extraPersonPrice: vars.price });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['room-types'] });
            // alert('Saved!');
        }
    });

    const handleSaveAll = async () => {
        for (const [id, price] of Object.entries(prices)) {
            const original = roomTypes.find(rt => rt.id === id);
            if (Number(original?.extraPersonPrice) !== price) {
                await updateMutation.mutateAsync({ id, price });
            }
        }
        alert('Extra person charges updated!');
    };

    return (
        <div className="glass-card p-5">
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">Extra Person Charges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roomTypes.map((r: any) => (
                    <div key={r.id}>
                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">{r.name}</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>₹</span>
                            <input
                                type="number"
                                value={prices[r.id] ?? r.extraPersonPrice ?? 0}
                                onChange={e => setPrices({ ...prices, [r.id]: Number(e.target.value) })}
                                className="form-input pl-7"
                            />
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>per extra adult/night</p>
                    </div>
                ))}
                {roomTypes.length === 0 && (
                    <div className="col-span-full">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Add room types for extra person charges.</p>
                    </div>
                )}
            </div>
            {roomTypes.length > 0 && (
                <button
                    onClick={handleSaveAll}
                    disabled={updateMutation.isPending}
                    className="btn-primary mt-4 px-5 py-2 text-sm"
                >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            )}
        </div>
    );
}

export default function RatesPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [filterRoom, setFilterRoom] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        roomTypeId: 'all',
        type: 'seasonal',
        startDate: '',
        endDate: '',
        rate: '',
        minNights: 1,
    });

    // Fetch hotel ID first
    const { data: myHotel } = useQuery({
        queryKey: ['my-hotel-rates'],
        queryFn: async () => {
            const res = await api.get('/hotel/my-hotel');
            return res.data;
        }
    });

    const hotelId = myHotel?.id;

    // Fetch rooms
    const { data: roomTypes = [], isLoading: loadingRooms } = useQuery({
        queryKey: ['room-types', hotelId],
        queryFn: async () => {
            // Need to know how to fetch room types for this hotel.
            // Since we don't know the exact route, let's assume /room-type?hotelId=... or they are returned.
            // We'll leave it simple.
            const res = await api.get(`/room-types?hotelId=${hotelId}`);
            return res.data || [];
        },
        enabled: !!hotelId
    });

    // Fetch rates
    const { data: rates = [], isLoading: loadingRates } = useQuery({
        queryKey: ['rates', hotelId],
        queryFn: async () => {
            const res = await api.get(`/rates?hotelId=${hotelId}`);
            return res.data || [];
        },
        enabled: !!hotelId
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // Convert to correct types, e.g. rate and minNights to numbers
            const payload = {
                ...data,
                rate: Number(data.rate),
                minNights: Number(data.minNights),
                hotelId: hotelId,
                roomTypeId: data.roomTypeId === 'all' ? null : data.roomTypeId,
            };
            await api.post('/rates', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rates'] });
            setShowForm(false);
            setFormData({
                name: '', roomTypeId: 'all', type: 'seasonal', startDate: '', endDate: '', rate: '', minNights: 1
            });
            alert('Rate added successfully!');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/rates/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rates'] });
        }
    });

    if (loadingRooms || loadingRates || !hotelId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    const filtered = rates.filter((r: any) => filterRoom === 'all' || r.roomTypeId === filterRoom || r.roomTypeId === null);

    const getRoomName = (roomTypeId: string | null) => {
        if (!roomTypeId) return 'All Rooms';
        const room = roomTypes.find((rt: any) => rt.id === roomTypeId);
        return room ? room.name : 'Unknown Room';
    };

    return (
        <div>
            <Topbar title="Rate Manager" subtitle="Configure seasonal rates, special event pricing and weekend rates" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <select
                            className="form-input text-sm"
                            style={{ width: 200 }}
                            value={filterRoom}
                            onChange={(e) => setFilterRoom(e.target.value)}
                        >
                            <option value="all">All Room Types</option>
                            {roomTypes.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                        <Plus size={16} /> Add Rate Rule
                    </button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="glass-card p-5 animate-fadeIn">
                        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">New Rate Rule</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Rule Name</label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Summer Peak" className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Room Type</label>
                                <select value={formData.roomTypeId} onChange={e => setFormData({ ...formData, roomTypeId: e.target.value })} className="form-input">
                                    <option value="all">All Rooms</option>
                                    {roomTypes.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Rate Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="form-input">
                                    <option value="seasonal">Seasonal</option>
                                    <option value="special">Special Event</option>
                                    <option value="weekend">Weekend</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Start Date</label>
                                <input value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} type="date" className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">End Date</label>
                                <input value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} type="date" className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Rate (₹/night)</label>
                                <input value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} type="number" placeholder="4500" className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Min Nights</label>
                                <input value={formData.minNights} onChange={e => setFormData({ ...formData, minNights: Number(e.target.value) })} type="number" placeholder="1" className="form-input" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} className="btn-primary px-5 py-2 text-sm">
                                {createMutation.isPending ? 'Saving...' : 'Save Rate'}
                            </button>
                            <button onClick={() => setShowForm(false)} className="px-5 py-2 text-sm rounded-lg" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Rates Table */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--glass-border)]">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">{filtered.length} Rate Rules</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rule Name</th>
                                    <th>Room Type</th>
                                    <th>Type</th>
                                    <th>Valid Period</th>
                                    <th>Rate/Night</th>
                                    <th>Min Nights</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r: any) => {
                                    const cfg = typeConfig[r.type] || { label: r.type, cls: 'badge-muted' };
                                    return (
                                        <tr key={r.id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <Tag size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                                    <span className="font-medium text-[hsl(var(--foreground))] text-sm">{r.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{getRoomName(r.roomTypeId)}</td>
                                            <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                                            <td>
                                                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                                    <CalendarDays size={12} />
                                                    {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="font-bold text-[hsl(var(--foreground))]">₹{Number(r.rate).toLocaleString()}</td>
                                            <td className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{r.minNights}N</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1.5 rounded-lg hover:bg-[var(--table-header)] transition-colors">
                                                        <Edit size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                                    </button>
                                                    <button onClick={() => { if (confirm('Delete rate?')) deleteMutation.mutate(r.id); }} disabled={deleteMutation.isPending} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                                                        <Trash2 size={13} style={{ color: 'hsl(0 84% 60%)' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-sm text-[hsl(var(--muted-foreground))]">No rates found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Extra Person Charge - Dynamic Integration */}
                <ExtraPersonCharges roomTypes={roomTypes} />

            </div>
        </div>
    );
}
