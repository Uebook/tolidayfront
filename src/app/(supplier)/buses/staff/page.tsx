'use client';

import Topbar from '@/components/layout/Topbar';
import { Plus, Edit, Trash2, ShieldCheck, UserX, MoreVertical, Mail, Phone, UserPlus, Fingerprint, Lock, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

type Role = 'OWNER' | 'MANAGER' | 'RECEPTIONIST';

const roleColors: Record<Role, string> = {
    OWNER: 'hsl(225 70% 65%)',
    MANAGER: 'hsl(199 89% 48%)',
    RECEPTIONIST: 'hsl(142 71% 45%)',
};

const roleBg: Record<Role, string> = {
    OWNER: 'hsl(225 70% 55% / 0.15)',
    MANAGER: 'hsl(199 89% 48% / 0.15)',
    RECEPTIONIST: 'hsl(142 71% 45% / 0.15)',
};

const permissionLabels: Record<string, string> = {
    dashboard_view: 'View Dashboard',
    notifications_view: 'View Notifications',
    bookings_view: 'View Bookings',
    bookings_modify: 'Modify Bookings',
    bookings_cancel: 'Cancel Bookings',
    fleet_manage: 'Manage Fleet',
    routes_manage: 'Manage Routes',
    payments_view: 'View Payments',
    reports_view: 'View Reports',
    staff_manage: 'Manage Staff',
    settings_edit: 'Edit Settings',
};

export default function BusStaffPage() {
    const queryClient = useQueryClient();
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['bus-staff'],
        queryFn: async () => {
            const res = await api.get('/staff');
            return res.data;
        },
    });

    const addStaffMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post('/staff', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-staff'] });
            setIsAddModalOpen(false);
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: async (id: string) => {
            const member = staff.find((s: any) => s.id === id);
            await api.patch(`/staff/${id}`, { isActive: !member.isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-staff'] });
            setSelectedStaff(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!confirm('Are you sure you want to delete this staff member?')) return;
            await api.delete(`/staff/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-staff'] });
            setSelectedStaff(null);
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
            <Topbar title="Human Capital" subtitle="Orchestrate your operational force and portal access nodes" />
            <div className="p-6 space-y-8 animate-fadeIn">

                {/* Summary Row */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                        {[
                            { label: 'Total Force', value: staff.length, icon: Fingerprint, color: 'hsl(var(--accent))' },
                            { label: 'Active Sessions', value: staff.filter((s: any) => s.isActive).length, icon: Shield, color: 'hsl(var(--success))' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card px-6 py-4 flex items-center gap-4 min-w-[220px]">
                                <div className="p-3 rounded-2xl bg-white/05 border border-white/10" style={{ color: stat.color }}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-foreground">{stat.value}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(20,80,255,0.3)]"
                    >
                        <UserPlus size={18} /> Recruit Staff
                    </button>
                </div>

                <div className="flex gap-8 items-start">
                    {/* Staff List Grid */}
                    <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {staff.map((member: any) => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedStaff(member)}
                                className={`glass-card p-6 cursor-pointer transition-all relative overflow-hidden group ${selectedStaff?.id === member.id ? 'border-accent ring-1 ring-accent bg-accent/5 shadow-[0_10px_30px_rgba(20,80,255,0.1)]' : 'hover:bg-white/05'}`}
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div 
                                        className="w-16 h-16 rounded-[1.25rem] border border-white/10 flex items-center justify-center font-black text-2xl shadow-2xl transition-transform group-hover:scale-105"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${roleBg[member.role as Role]?.split('/')[0] || 'hsl(var(--muted))'}, transparent)`,
                                            color: roleColors[member.role as Role]
                                        }}
                                    >
                                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-lg text-foreground tracking-tight">{member.name}</h3>
                                            {member.role === 'OWNER' && <Shield size={14} style={{ color: roleColors.OWNER }} />}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.15em] mt-1" style={{ color: roleColors[member.role as Role] }}>
                                            {member.role}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`badge text-[9px] font-black uppercase tracking-widest ${member.isActive ? 'badge-success' : 'badge-muted'}`}>
                                            {member.isActive ? 'Active' : 'Offline'}
                                        </span>
                                        <button className="p-2 rounded-xl hover:bg-white/05 text-muted-foreground">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/05 flex items-center justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><Mail size={12} /> {member.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone size={12} /> {member.phone || 'NO PHONE'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick View Panel - Premium Glass */}
                    {selectedStaff && (
                        <div className="w-[400px] glass-card p-10 h-fit sticky top-6 animate-fadeIn overflow-hidden border-accent/20">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                <Fingerprint size={200} />
                            </div>

                            <div className="flex flex-col items-center text-center mb-10 relative z-10">
                                <div 
                                    className="w-24 h-24 rounded-[2rem] border-2 border-white/10 flex items-center justify-center font-black text-4xl mb-6 shadow-2xl shadow-black/20"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${roleColors[selectedStaff.role as Role]}, transparent)`,
                                        color: 'white'
                                    }}
                                >
                                    {selectedStaff.name?.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <h4 className="text-2xl font-black text-foreground tracking-tight">{selectedStaff.name}</h4>
                                <div className="badge-accent mt-3 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">{selectedStaff.role}</div>
                            </div>

                            <div className="space-y-6 mb-10 relative z-10">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/03 border border-white/05">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><Mail size={18} /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Primary Contact</div>
                                        <div className="text-sm font-bold text-foreground truncate">{selectedStaff.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/03 border border-white/05">
                                    <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500"><Phone size={18} /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Mobile Access</div>
                                        <div className="text-sm font-bold text-foreground">{selectedStaff.phone || 'Not provided'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-3">
                                    <Lock size={14} className="text-accent" /> Security Permissions
                                </h4>
                                <div className="grid grid-cols-2 gap-3 mb-10">
                                    {Object.entries(selectedStaff.permissions || {}).map(([key, val]) => (
                                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/03 border border-white/05 group hover:border-accent/30 transition-colors">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tight truncate mr-2">
                                                {permissionLabels[key] || key.replace(/_/g, ' ')}
                                            </span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 relative z-10">
                                <button className="btn-primary py-4 text-xs font-black uppercase tracking-widest">
                                    <Edit size={16} className="inline mr-2" /> Modify Profile
                                </button>
                                {selectedStaff.role !== 'OWNER' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => deactivateMutation.mutate(selectedStaff.id)}
                                            className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/05 text-foreground transition-all"
                                        >
                                            <UserX size={16} className="inline mr-2" /> {selectedStaff.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(selectedStaff.id)}
                                            className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 text-red-500 hover:bg-red-500/05 transition-all"
                                        >
                                            <Trash2 size={16} className="inline mr-2" /> Revoke
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Staff Modal - Midnight Luxury Overhaul */}
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
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-white leading-none">Recruit Staff</h2>
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Access Node Provisioning</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-2.5 rounded-full hover:bg-white/10 text-white/80 transition-all"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <form className="p-10 space-y-10" onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                addStaffMutation.mutate({
                                    name: formData.get('name'),
                                    email: formData.get('email'),
                                    phone: formData.get('phone'),
                                    role: formData.get('role'),
                                    password: 'test123password',
                                    permissions: {
                                        dashboard_view: true,
                                        notifications_view: true,
                                        bookings_view: true,
                                        fleet_manage: formData.get('role') === 'MANAGER',
                                        routes_manage: formData.get('role') === 'MANAGER',
                                    }
                                });
                            }}>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Full Identity Name</label>
                                    <input name="name" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="e.g. Aryan Malhotra" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Primary Access Email</label>
                                    <input name="email" type="email" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="aryan@toliday.network" />
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Contact Mobile</label>
                                        <input name="phone" className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="+91 9988776655" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Operational Role</label>
                                        <div className="relative">
                                            <select name="role" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer shadow-inner">
                                                <option className="bg-[#0d101b]" value="RECEPTIONIST">Field Receptionist</option>
                                                <option className="bg-[#0d101b]" value="MANAGER">Operational Manager</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border border-white/10 text-white/40 hover:text-white transition-all">Discard</button>
                                    <button 
                                        type="submit" 
                                        disabled={addStaffMutation.isPending} 
                                        className="flex-[2] py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_50px_rgba(20,80,255,0.4)] relative overflow-hidden group"
                                        style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%) 0%, hsl(195 90% 45%) 100%)' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">{addStaffMutation.isPending ? 'Deploying...' : 'Provision Access'}</span>
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
