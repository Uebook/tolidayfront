'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Sparkles, Trash2, Plus, Edit, ShieldAlert, CheckCircle2, User, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CustomSelect from '@/components/ui/CustomSelect';

const statusConfig: Record<string, { label: string; cls: string }> = {
    CLEAN: { label: 'Clean', cls: 'badge-success' },
    DIRTY: { label: 'Dirty', cls: 'badge-destructive' },
    MAINTENANCE: { label: 'Maintenance', cls: 'badge-warning' },
    OUT_OF_ORDER: { label: 'Out of Order', cls: 'badge-muted' },
};

export default function HousekeepingPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [formData, setFormData] = useState({
        roomNumber: '',
        roomTypeId: '',
        status: 'DIRTY',
        assignedStaffId: '',
    });

    // Queries
    const { data: housekeepingList = [], isLoading: listLoading } = useQuery({
        queryKey: ['housekeeping'],
        queryFn: async () => {
            const res = await api.get('/housekeeping');
            return res.data;
        }
    });

    const { data: roomTypes = [] } = useQuery({
        queryKey: ['room-types'],
        queryFn: async () => {
            const res = await api.get('/room-types');
            return res.data;
        }
    });

    const { data: staffList = [] } = useQuery({
        queryKey: ['hotel-staff'],
        queryFn: async () => {
            const profileRes = await api.get('/hotel/my-hotel');
            const hotelId = profileRes.data.id;
            const res = await api.get(`/staff?hotelId=${hotelId}`);
            return res.data;
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            return api.post('/housekeeping', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
            setIsModalOpen(false);
            resetForm();
            alert('Room status registered successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to add room');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            return api.patch(`/housekeeping/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
            setIsModalOpen(false);
            resetForm();
            alert('Housekeeping details updated successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to update details');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!confirm('Are you sure you want to remove this room from status tracking?')) return;
            return api.delete(`/housekeeping/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
            alert('Room removed successfully!');
        }
    });

    const resetForm = () => {
        setFormData({
            roomNumber: '',
            roomTypeId: '',
            status: 'DIRTY',
            assignedStaffId: '',
        });
        setEditingRoom(null);
    };

    const openEdit = (room: any) => {
        setEditingRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            roomTypeId: room.roomTypeId,
            status: room.status,
            assignedStaffId: room.assignedStaffId || '',
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.roomNumber.trim() || !formData.roomTypeId) {
            alert('Please fill all mandatory fields.');
            return;
        }

        const payload = {
            ...formData,
            assignedStaffId: formData.assignedStaffId || null,
        };

        if (editingRoom) {
            updateMutation.mutate({ id: editingRoom.id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleQuickStatus = (id: string, status: string) => {
        updateMutation.mutate({ id, payload: { status } });
    };

    if (listLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 size={32} className="animate-spin text-[hsl(var(--accent))]" />
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <Topbar title="Housekeeping & Cleaning" subtitle="Manage rooms status, cleanliness, and staff assignment" />
            <div className="p-6 space-y-6 animate-fadeIn">
                {/* Actions */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="ios-platter px-5 py-3.5 text-center min-w-[110px] rounded-2xl">
                            <div className="text-2xl font-black text-foreground leading-none">{housekeepingList.length}</div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1.5">Total Rooms</div>
                        </div>
                        <div className="ios-platter px-5 py-3.5 text-center min-w-[110px] rounded-2xl">
                            <div className="text-2xl font-black text-emerald-500 leading-none">{housekeepingList.filter((h: any) => h.status === 'CLEAN').length}</div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1.5">Clean</div>
                        </div>
                        <div className="ios-platter px-5 py-3.5 text-center min-w-[110px] rounded-2xl">
                            <div className="text-2xl font-black text-rose-500 leading-none">{housekeepingList.filter((h: any) => h.status === 'DIRTY').length}</div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1.5">Dirty</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => { resetForm(); setIsModalOpen(true); }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2.5 text-xs transition-all ios-tap-scale shadow-[0_4px_12px_rgba(37,99,235,0.2)] flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={15} /> Add Room Status
                    </button>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {housekeepingList.map((room: any) => (
                        <div key={room.id} className="ios-platter p-5 rounded-[22px] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-48 shadow-[0_4px_15px_rgba(0,0,0,0.01)] border border-border/10">
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-base font-extrabold text-foreground tracking-tight">Room {room.roomNumber}</h3>
                                        <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{room.roomType?.name || 'Category'}</p>
                                    </div>
                                    <span className={`badge ${statusConfig[room.status]?.cls || 'badge-muted'} text-[10px] font-bold px-2 py-0.5`}>
                                        {statusConfig[room.status]?.label || room.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-3">
                                    <User size={13} className="text-muted-foreground/70" />
                                    <span>Assigned: {room.assignedStaff?.name || 'Unassigned'}</span>
                                </div>
                            </div>

                            {/* Quick status and edits */}
                            <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-3">
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleQuickStatus(room.id, 'CLEAN')}
                                        className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors ios-tap-scale" 
                                        title="Mark Clean"
                                    >
                                        <CheckCircle2 size={15} />
                                    </button>
                                    <button 
                                        onClick={() => handleQuickStatus(room.id, 'DIRTY')}
                                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors ios-tap-scale" 
                                        title="Mark Dirty"
                                    >
                                        <ShieldAlert size={15} />
                                    </button>
                                </div>

                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => openEdit(room)} 
                                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors ios-tap-scale"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button 
                                        onClick={() => deleteMutation.mutate(room.id)} 
                                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors ios-tap-scale"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {housekeepingList.length === 0 && (
                        <div className="col-span-full py-16 text-center text-xs font-bold text-muted-foreground ios-platter rounded-3xl">
                            No rooms registered for housekeeping yet. Click 'Add Room Status' to start tracking.
                        </div>
                    )}
                </div>

            </div>

            {/* Add/Edit Modal */}
            {mounted && isModalOpen && createPortal(
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4 cursor-pointer"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 w-[450px] max-w-full p-6 rounded-[28px] border border-border/15 shadow-2xl space-y-5 animate-scaleIn cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-border/10">
                            <h3 className="text-base font-extrabold text-foreground tracking-tight">{editingRoom ? 'Edit Room Details' : 'Add Room Status'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 cursor-pointer">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Room Number</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 101"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none text-xs font-medium transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Room Category</label>
                                <CustomSelect
                                    value={formData.roomTypeId}
                                    onChange={(val) => setFormData({ ...formData, roomTypeId: val })}
                                    options={roomTypes.map((rt: any) => ({ value: rt.id, label: rt.name }))}
                                    placeholder="Select Category"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Status</label>
                                    <CustomSelect
                                        value={formData.status}
                                        onChange={(val) => setFormData({ ...formData, status: val })}
                                        options={[
                                            { value: 'CLEAN', label: 'Clean' },
                                            { value: 'DIRTY', label: 'Dirty' },
                                            { value: 'MAINTENANCE', label: 'Maintenance' },
                                            { value: 'OUT_OF_ORDER', label: 'Out of Order' },
                                        ]}
                                        placeholder="Select Status"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Assign Staff</label>
                                    <CustomSelect
                                        value={formData.assignedStaffId}
                                        onChange={(val) => setFormData({ ...formData, assignedStaffId: val })}
                                        options={staffList.map((st: any) => ({ value: st.id, label: st.name }))}
                                        placeholder="Unassigned"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all ios-tap-scale cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 py-2 text-xs transition-all ios-tap-scale shadow-[0_4px_12px_rgba(37,99,235,0.2)] cursor-pointer"
                            >
                                Save Details
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
