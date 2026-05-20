'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Plus, Edit, Trash2, BedDouble, CheckCircle2, XCircle, Info, Coffee, Utensils, UtensilsCrossed, X } from 'lucide-react';
import { useState } from 'react';

const mealPlanIcons: Record<string, any> = {
    EP: BedDouble,
    CP: Coffee,
    MAP: Utensils,
    AP: UtensilsCrossed
};

const mealPlanLabels: Record<string, string> = {
    EP: 'Room Only (EP)',
    CP: 'Breakfast Included (CP)',
    MAP: 'Half Board (MAP)',
    AP: 'Full Board (AP)'
};

export default function RatePlansPage() {
    const queryClient = useQueryClient();
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [modalData, setModalData] = useState({
        name: '',
        mealPlan: 'EP',
        markupType: 'fixed' as 'fixed' | 'percentage',
        markupAmount: '0',
        markupPercentage: '0',
        isRefundable: true,
        inclusionsString: '',
        cancellationPolicy: '',
        isActive: true,
    });

    // Fetch Room Types
    const { data: rooms = [], isLoading: roomsLoading } = useQuery({
        queryKey: ['room-types'],
        queryFn: async () => {
            const res = await api.get('/room-types');
            if (res.data.length > 0 && !selectedRoom) setSelectedRoom(res.data[0].id);
            return res.data;
        },
    });

    // Fetch Rate Plans for selected room
    const { data: ratePlans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['rate-plans', selectedRoom],
        queryFn: async () => {
            if (!selectedRoom) return [];
            const res = await api.get(`/hotel/rooms/${selectedRoom}/rate-plans`);
            return res.data;
        },
        enabled: !!selectedRoom
    });

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post('/hotel/rate-plans', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-plans', selectedRoom] });
            setIsModalOpen(false);
            alert('Rate Plan created successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to create rate plan');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            return await api.patch(`/hotel/rate-plans/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-plans', selectedRoom] });
            setIsModalOpen(false);
            alert('Rate Plan updated successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to update rate plan');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await api.delete(`/hotel/rate-plans/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-plans', selectedRoom] });
            alert('Rate Plan deleted successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete rate plan');
        }
    });

    const handleOpenCreateModal = () => {
        setEditingPlan(null);
        setModalData({
            name: '',
            mealPlan: 'EP',
            markupType: 'fixed',
            markupAmount: '0',
            markupPercentage: '0',
            isRefundable: true,
            inclusionsString: 'Room Stay',
            cancellationPolicy: 'Cancel up to 24 hours before check-in for a full refund.',
            isActive: true,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan: any) => {
        setEditingPlan(plan);
        setModalData({
            name: plan.name || '',
            mealPlan: plan.mealPlan || 'EP',
            markupType: parseFloat(plan.markupPercentage || '0') > 0 ? 'percentage' : 'fixed',
            markupAmount: plan.markupAmount?.toString() || '0',
            markupPercentage: plan.markupPercentage?.toString() || '0',
            isRefundable: plan.isRefundable ?? true,
            inclusionsString: plan.inclusions ? plan.inclusions.join(', ') : 'Room Stay',
            cancellationPolicy: plan.cancellationPolicy || '',
            isActive: plan.isActive ?? true,
        });
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoom) return;

        const payload = {
            roomTypeId: selectedRoom,
            name: modalData.name,
            mealPlan: modalData.mealPlan,
            markupAmount: modalData.markupType === 'fixed' ? parseFloat(modalData.markupAmount) || 0 : 0,
            markupPercentage: modalData.markupType === 'percentage' ? parseFloat(modalData.markupPercentage) || 0 : 0,
            isRefundable: modalData.isRefundable,
            cancellationPolicy: modalData.cancellationPolicy,
            inclusions: modalData.inclusionsString.split(',').map(s => s.trim()).filter(Boolean),
            isActive: modalData.isActive,
        };

        if (editingPlan) {
            updateMutation.mutate({ id: editingPlan.id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this rate plan?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCreateStandardEP = () => {
        if (!selectedRoom) return;
        createMutation.mutate({
            roomTypeId: selectedRoom,
            name: 'Room Only (EP)',
            mealPlan: 'EP',
            markupAmount: 0,
            markupPercentage: 0,
            isRefundable: true,
            cancellationPolicy: 'Free cancellation 24h prior.',
            inclusions: ['Room Stay'],
            isActive: true
        });
    };

    if (roomsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Rate Plan Management" subtitle="Define meal plans, cancellation policies and pricing markups" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex gap-6">
                    {/* Room Sidebar */}
                    <div className="w-72 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">Room Categories</h3>
                        {rooms.map((room: any) => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(room.id)}
                                className={`glass-card p-4 cursor-pointer transition-all ${selectedRoom === room.id ? 'ring-1 ring-[hsl(var(--accent))] bg-white/5' : 'hover:bg-white/5'}`}
                            >
                                <div className="font-bold text-sm">{room.name}</div>
                                <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 uppercase">Base: ₹{room.price}</div>
                            </div>
                        ))}
                    </div>

                    {/* Rate Plans List */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">
                                Rate Plans for {rooms.find((r: any) => r.id === selectedRoom)?.name || 'Selected Room'}
                            </h3>
                            {selectedRoom && (
                                <button onClick={handleOpenCreateModal} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                                    <Plus size={16} /> Create New Plan
                                </button>
                            )}
                        </div>

                        {plansLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ratePlans.map((plan: any) => {
                                    const Icon = mealPlanIcons[plan.mealPlan] || BedDouble;
                                    return (
                                        <div key={plan.id} className="glass-card p-5 hover:scale-[1.01] transition-transform">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                                                        <Icon size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[hsl(var(--foreground))]">{plan.name}</h4>
                                                        <span className="text-[10px] font-bold uppercase text-blue-500">{mealPlanLabels[plan.mealPlan]}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-muted'}`}>
                                                        {plan.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-[hsl(var(--muted-foreground))]">Pricing Strategy</span>
                                                    <span className="font-bold">
                                                        {parseFloat(plan.markupAmount) > 0 ? `+ ₹${parseFloat(plan.markupAmount).toLocaleString()}` : parseFloat(plan.markupPercentage) > 0 ? `+ ${plan.markupPercentage}%` : 'Base Rate'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-[hsl(var(--muted-foreground))]">Refund Policy</span>
                                                    <span className={`font-bold ${plan.isRefundable ? 'text-green-500' : 'text-red-500'}`}>
                                                        {plan.isRefundable ? 'Refundable' : 'Non-Refundable'}
                                                    </span>
                                                </div>
                                                {plan.cancellationPolicy && (
                                                    <div className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                                        <span className="font-medium text-[hsl(var(--foreground))]">Policy:</span> {plan.cancellationPolicy}
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t border-[var(--glass-border)]">
                                                    <div className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))] mb-2">Plan Inclusions</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {plan.inclusions?.map((inc: string) => (
                                                            <span key={inc} className="px-2 py-0.5 rounded-md bg-white/5 border border-[var(--glass-border)] text-[10px]">{inc}</span>
                                                        ))}
                                                        {(!plan.inclusions || plan.inclusions.length === 0) && <span className="text-[10px] italic opacity-50">No inclusions listed</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenEditModal(plan)} className="flex-1 py-2 rounded-lg text-xs font-bold border border-[var(--glass-border)] hover:bg-white/5 transition-colors">
                                                    <Edit size={12} className="inline mr-1" /> Edit Plan
                                                </button>
                                                <button onClick={() => handleDelete(plan.id)} className="p-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {ratePlans.length === 0 && (
                                    <div className="col-span-full py-20 text-center glass-card flex flex-col items-center gap-4 border-dashed">
                                        <div className="p-4 rounded-full bg-white/5">
                                            <Info size={32} className="text-[hsl(var(--muted-foreground))]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">No Rate Plans Found</h4>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Create your first rate plan for this room category to enable bookings.</p>
                                        </div>
                                        <button onClick={handleCreateStandardEP} className="btn-primary px-6 py-2 text-sm mt-2">
                                            Add Standard EP Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="glass-card w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[var(--glass-border)]">
                            <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">
                                {editingPlan ? 'Edit Rate Plan' : 'Create Rate Plan'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                                <X size={20} className="text-[hsl(var(--muted-foreground))]" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Plan Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Standard Breakfast Plan (CP)"
                                    className="form-input w-full"
                                    value={modalData.name}
                                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Meal Plan */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Meal Plan</label>
                                    <select
                                        className="form-input w-full bg-black/40 text-[hsl(var(--foreground))]"
                                        value={modalData.mealPlan}
                                        onChange={(e) => setModalData({ ...modalData, mealPlan: e.target.value })}
                                    >
                                        <option value="EP" className="bg-neutral-900">Room Only (EP)</option>
                                        <option value="CP" className="bg-neutral-900">Breakfast Included (CP)</option>
                                        <option value="MAP" className="bg-neutral-900">Breakfast + Lunch/Dinner (MAP)</option>
                                        <option value="AP" className="bg-neutral-900">All Meals Included (AP)</option>
                                    </select>
                                </div>

                                {/* Pricing Strategy */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Markup Type</label>
                                    <select
                                        className="form-input w-full bg-black/40 text-[hsl(var(--foreground))]"
                                        value={modalData.markupType}
                                        onChange={(e) => setModalData({ ...modalData, markupType: e.target.value as any })}
                                    >
                                        <option value="fixed" className="bg-neutral-900">Fixed Price (₹)</option>
                                        <option value="percentage" className="bg-neutral-900">Percentage (%)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Markup Value */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                                    {modalData.markupType === 'fixed' ? 'Markup Amount (₹)' : 'Markup Percentage (%)'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-input w-full"
                                    value={modalData.markupType === 'fixed' ? modalData.markupAmount : modalData.markupPercentage}
                                    onChange={(e) => {
                                        if (modalData.markupType === 'fixed') {
                                            setModalData({ ...modalData, markupAmount: e.target.value });
                                        } else {
                                            setModalData({ ...modalData, markupPercentage: e.target.value });
                                        }
                                    }}
                                />
                            </div>

                            {/* Inclusions */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Inclusions (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Room Stay, Free WiFi, Welcome Drink"
                                    className="form-input w-full"
                                    value={modalData.inclusionsString}
                                    onChange={(e) => setModalData({ ...modalData, inclusionsString: e.target.value })}
                                />
                            </div>

                            {/* Cancellation Policy */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Cancellation Policy</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Cancellation policy details..."
                                    className="form-input w-full min-h-[60px]"
                                    value={modalData.cancellationPolicy}
                                    onChange={(e) => setModalData({ ...modalData, cancellationPolicy: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-6 pt-2">
                                {/* Refundable */}
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[var(--glass-border)] bg-black/40 text-[hsl(var(--accent))] focus:ring-0"
                                        checked={modalData.isRefundable}
                                        onChange={(e) => setModalData({ ...modalData, isRefundable: e.target.checked })}
                                    />
                                    <span className="text-xs font-medium">Is Refundable</span>
                                </label>

                                {/* Active */}
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[var(--glass-border)] bg-black/40 text-[hsl(var(--accent))] focus:ring-0"
                                        checked={modalData.isActive}
                                        onChange={(e) => setModalData({ ...modalData, isActive: e.target.checked })}
                                    />
                                    <span className="text-xs font-medium">Is Active</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--glass-border)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--glass-border)] hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="btn-primary px-5 py-2 text-sm"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
