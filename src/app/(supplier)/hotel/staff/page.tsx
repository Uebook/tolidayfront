'use client';

import Topbar from '@/components/layout/Topbar';
import { Plus, Edit, Trash2, ShieldCheck, UserX, MoreVertical, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

type Role = 'owner' | 'manager' | 'staff';

const roleColors: Record<Role, string> = {
    owner: 'hsl(225 70% 65%)',
    manager: 'hsl(199 89% 48%)',
    staff: 'hsl(142 71% 45%)',
};

const roleBg: Record<Role, string> = {
    owner: 'hsl(225 70% 55% / 0.15)',
    manager: 'hsl(199 89% 48% / 0.15)',
    staff: 'hsl(142 71% 45% / 0.15)',
};

const permissionLabels: Record<string, string> = {
    dashboard_view: 'View Dashboard',
    notifications_view: 'View Notifications',
    bookings_view: 'View Bookings',
    bookings_modify: 'Modify Bookings',
    bookings_cancel: 'Cancel Bookings',
    inventory_edit: 'Edit Inventory',
    rates_edit: 'Edit Rates',
    property_view: 'View Property Details',
    media_upload: 'Upload Media',
    payments_view: 'View Payments',
    reports_view: 'View Reports',
    staff_manage: 'Manage Staff',
    settings_edit: 'Edit Settings',
    profile_view: 'View Profile',
    support_view: 'Support & Help',
};

export default function StaffPage() {
    const queryClient = useQueryClient();
    const [selectedStaff, setSelectedStaff] = useState<any>(null);

    const { data: staffData, isLoading } = useQuery({
        queryKey: ['hotel-staff'],
        queryFn: async () => {
            // Need to get the hotelId. Since user is logged in, their hotelId is known by the backend.
            // But the backend GET /staff requires ?hotelId=... 
            // Wait, the backend StaffController GET /staff expects `hotelId` in query.
            // Let's get the hotelId from the user's profile first, or let the backend infer it from the JWT if we update it.
            // Looking at StaffController: `@Get() findAll(@Query('hotelId') hotelId: string)`
            // We need the hotelId. Let's fetch the my-hotel profile first.
            const profileRes = await api.get('/hotel/my-hotel');
            const hotelId = profileRes.data.id;
            const res = await api.get(`/staff?hotelId=${hotelId}`);
            return res.data;
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: async (id: string) => {
            const member = staff.find((s: any) => s.id === id);
            await api.patch(`/staff/${id}`, { isActive: !member.isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotel-staff'] });
            setSelectedStaff(null);
            alert('Staff member status updated.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!confirm('Are you sure you want to permanently delete this staff member? This action cannot be undone.')) return;
            await api.delete(`/staff/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotel-staff'] });
            setSelectedStaff(null);
            alert('Staff member deleted successfully.');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete staff member.');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    const staff = staffData || [];
    const activeCount = staff.filter((s: any) => s.isActive).length;
    const managerCount = staff.filter((s: any) => s.role === 'manager').length;

    return (
        <div>
            <Topbar title="Staff Management" subtitle="Manage team members and their access permissions" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Summary */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        {[
                            { label: 'Total Staff', value: staff.length },
                            { label: 'Active', value: activeCount, color: 'hsl(142 71% 45%)' },
                            { label: 'Managers', value: managerCount, color: 'hsl(199 89% 48%)' },
                        ].map((s) => (
                            <div key={s.label} className="glass-card px-4 py-3 min-w-[100px] text-center">
                                <div className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{s.value}</div>
                                <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <Link href="/hotel/staff/new">
                        <button className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                            <Plus size={16} /> Add Staff Member
                        </button>
                    </Link>
                </div>

                <div className="flex gap-5">
                    {/* Staff List */}
                    <div className="flex-1 glass-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">Team Members</h3>
                            <Link href="/hotel/staff/permissions">
                                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--accent))' }}>
                                    <ShieldCheck size={13} /> Permissions Matrix
                                </button>
                            </Link>
                        </div>
                        <div className="divide-y divide-white/05">
                            {staff.map((member: any) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--table-header)] transition-colors"
                                    style={{ background: selectedStaff?.id === member.id ? 'var(--glass-border-light)' : undefined }}
                                    onClick={() => setSelectedStaff(selectedStaff?.id === member.id ? null : member)}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                        style={{
                                            background: roleBg[member.role.toLowerCase() as Role] || 'var(--glass-border-light)',
                                            color: roleColors[member.role.toLowerCase() as Role] || 'hsl(var(--muted-foreground))'
                                        }}
                                    >
                                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[hsl(var(--foreground))] text-sm">{member.name}</span>
                                            {member.role === 'owner' && <ShieldCheck size={13} style={{ color: roleColors.owner }} />}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{member.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="badge text-xs" style={{
                                            background: roleBg[member.role.toLowerCase() as Role] || 'var(--glass-border-light)',
                                            color: roleColors[member.role.toLowerCase() as Role] || 'hsl(var(--muted-foreground))'
                                        }}>
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
                                        </span>
                                        <span className={`badge ${member.isActive ? 'badge-success' : 'badge-muted'}`}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <button className="p-1 rounded hover:bg-[var(--table-header)] ml-1">
                                            <MoreVertical size={15} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permission Panel */}
                    {selectedStaff && (
                        <div className="w-72 glass-card p-5 h-fit animate-fadeIn">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--glass-border)]">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                                    style={{
                                        background: roleBg[selectedStaff.role.toLowerCase() as Role] || 'var(--glass-border-light)',
                                        color: roleColors[selectedStaff.role.toLowerCase() as Role] || 'hsl(var(--muted-foreground))'
                                    }}
                                >
                                    {selectedStaff.name?.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="font-semibold text-[hsl(var(--foreground))]">{selectedStaff.name}</div>
                                    <div className="text-xs" style={{
                                        color: roleColors[selectedStaff.role.toLowerCase() as Role] || 'hsl(var(--muted-foreground))'
                                    }}>
                                        {selectedStaff.role.charAt(0).toUpperCase() + selectedStaff.role.slice(1).toLowerCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 mb-4">
                                <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                    <Mail size={11} /> {selectedStaff.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                    <Phone size={11} /> {selectedStaff.phone}
                                </div>
                            </div>

                            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>Permissions</h4>
                            <div className="space-y-2">
                                {Object.entries(selectedStaff.permissions).map(([key, val]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                            {permissionLabels[key]}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${val ? 'bg-green-500' : 'bg-[var(--table-header)]'}`} />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-5">
                                <Link href={`/hotel/staff/${selectedStaff.id}`} className="flex-1">
                                    <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium btn-primary">
                                        <Edit size={12} /> Edit
                                    </button>
                                </Link>
                                {selectedStaff.role !== 'owner' && (
                                    <>
                                        <button
                                            onClick={() => deactivateMutation.mutate(selectedStaff.id)}
                                            disabled={deactivateMutation.isPending}
                                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs disabled:opacity-50"
                                            style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}
                                        >
                                            <UserX size={12} /> {deactivateMutation.isPending ? '...' : (selectedStaff.isActive ? 'Deactivate' : 'Activate')}
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(selectedStaff.id)}
                                            disabled={deleteMutation.isPending}
                                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs disabled:opacity-50"
                                            style={{ border: '1px solid hsl(0 84% 60% / 0.4)', color: 'hsl(0 84% 60%)' }}
                                        >
                                            <Trash2 size={12} /> {deleteMutation.isPending ? '...' : 'Delete'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
