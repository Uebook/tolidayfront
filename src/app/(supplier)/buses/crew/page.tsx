'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Users, Plus, ShieldCheck, MoreVertical, Phone, Mail, ChevronDown, UserPlus, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

export default function CrewManagementPage() {
    const queryClient = useQueryClient();
    const [user] = useState(() => getAuthUser());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: crew = [], isLoading } = useQuery({
        queryKey: ['bus-crew', user?.busVendorId || user?.bus_vendor_id],
        queryFn: async () => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            if (!vendorId) return [];
            const res = await api.get(`/buses/vendors/${vendorId}/crew`);
            return res.data;
        },
        enabled: !!user
    });

    const addCrewMutation = useMutation({
        mutationFn: async (data: any) => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            return api.post('/buses/crew', { ...data, vendorId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-crew'] });
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
            <Topbar title="Crew Network" subtitle="Elite squad of drivers and conductors powering your fleet" />
            <div className="p-6 space-y-8 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                        {[
                            { label: 'Total Crew', value: crew.length, icon: Users, color: 'hsl(var(--accent))' },
                            { label: 'Active Drivers', value: crew.filter((c: any) => c.role === 'DRIVER').length, icon: ShieldCheck, color: 'hsl(var(--success))' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card px-6 py-4 flex items-center gap-4 min-w-[200px]">
                                <div className="p-3 rounded-2xl bg-white/05 border border-white/10" style={{ color: stat.color }}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-foreground">{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm shadow-[0_15px_30px_rgba(20,80,255,0.3)]"
                    >
                        <UserPlus size={18} /> Add Crew Member
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {crew.length === 0 ? (
                        <div className="col-span-full py-40 glass-card border-dashed flex flex-col items-center justify-center text-center group hover:border-accent/30 transition-all">
                            <div className="w-24 h-24 rounded-full bg-accent/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users size={48} className="text-accent opacity-20" />
                            </div>
                            <h3 className="text-xl font-black text-foreground">No Crew Members Found</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                                Your network is currently empty. Start by adding your elite drivers and conductors to enable trip scheduling.
                            </p>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-8 px-8 py-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-bold text-sm hover:bg-accent/20 transition-all"
                            >
                                Register First Member
                            </button>
                        </div>
                    ) : (
                        crew.map((member: any) => (
                            <div key={member.id} className="glass-card p-6 hover:scale-[1.02] transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Users size={120} />
                                </div>
                                
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/05 border border-white/10 flex items-center justify-center font-black text-xl text-accent shadow-xl">
                                            {member.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground leading-tight">{member.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge-accent py-0.5 text-[9px] uppercase tracking-wider">{member.role}</span>
                                                {member.isActive && <HeartPulse size={12} className="text-green-500 animate-pulse" />}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-xl hover:bg-white/05 text-muted-foreground transition-colors relative z-10">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <div className="space-y-3.5 py-6 border-y border-white/05 relative z-10">
                                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-white/05"><Mail size={14} /></div>
                                        <span className="truncate">{member.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-white/05"><Phone size={14} /></div>
                                        <span>{member.phone || 'No phone provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-white/05"><ShieldCheck size={14} /></div>
                                        <span>DL: <span className="text-foreground font-bold">{member.licenseNumber || 'PENDING'}</span></span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                            {member.isActive ? 'Active Now' : 'Off-Duty'}
                                        </span>
                                    </div>
                                    <button className="text-xs font-black text-accent hover:underline tracking-tight">Performance History &rarr;</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Crew Modal - Midnight Luxury Overhaul */}
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
                                        <h2 className="text-2xl font-black tracking-tight text-white leading-none">Register Crew</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></span>
                                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Resource Onboarding</p>
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
                                addCrewMutation.mutate({
                                    name: formData.get('name'),
                                    email: formData.get('email'),
                                    phone: formData.get('phone'),
                                    role: formData.get('role'),
                                    licenseNumber: formData.get('licenseNumber'),
                                });
                            }}>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Full Identity Name</label>
                                    <input name="name" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="e.g. Vikram Singh Rathore" />
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Professional Role</label>
                                        <div className="relative">
                                            <select name="role" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer shadow-inner">
                                                <option className="bg-[#0d101b]" value="DRIVER">Master Driver</option>
                                                <option className="bg-[#0d101b]" value="CONDUCTOR">Conductor</option>
                                                <option className="bg-[#0d101b]" value="SUPPORT_STAFF">Trip Support</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Driving License No.</label>
                                        <input name="licenseNumber" className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="e.g. DL-142022001122" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Contact Email</label>
                                        <input name="email" type="email" className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="vikram@crew.trip" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Mobile Access</label>
                                        <input name="phone" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="+91 9988776655" />
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border border-white/10 text-white/40 hover:text-white hover:bg-white/05 transition-all">Discard</button>
                                    <button 
                                        type="submit" 
                                        disabled={addCrewMutation.isPending} 
                                        className="flex-[2] py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_50px_rgba(20,80,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale relative overflow-hidden group"
                                        style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%) 0%, hsl(195 90% 45%) 100%)' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">{addCrewMutation.isPending ? 'Verifying...' : 'Onboard Crew Member'}</span>
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
