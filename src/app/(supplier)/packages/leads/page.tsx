'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { 
    Search, Filter, Plus, Mail, Phone, Calendar, 
    ChevronRight, MoreVertical, Flame, Thermometer, 
    ThermometerSnowflake, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

const statusConfig: Record<string, any> = {
    NEW: { label: 'New Inquiry', icon: Clock, color: 'hsl(199 89% 48%)', bg: 'hsl(199 89% 48% / 0.1)' },
    HOT: { label: 'Hot Lead', icon: Flame, color: 'hsl(0 84% 60%)', bg: 'hsl(0 84% 60% / 0.1)' },
    WARM: { label: 'Warm', icon: Thermometer, color: 'hsl(38 92% 50%)', bg: 'hsl(38 92% 50% / 0.1)' },
    COLD: { label: 'Cold', icon: ThermometerSnowflake, color: 'hsl(222 15% 55%)', bg: 'hsl(222 15% 55% / 0.1)' },
    CONVERTED: { label: 'Converted', icon: CheckCircle2, color: 'hsl(142 71% 45%)', bg: 'hsl(142 71% 45% / 0.1)' },
    LOST: { label: 'Lost', icon: XCircle, color: 'hsl(0 0% 50%)', bg: 'hsl(0 0% 50% / 0.1)' },
};

export default function LeadManagementPage() {
    const queryClient = useQueryClient();
    const [selectedLead, setSelectedLead] = useState<any>(null);

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['package-leads'],
        queryFn: async () => {
            const res = await api.get('/packages/leads');
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

    const stats = {
        total: leads.length,
        hot: leads.filter((l: any) => l.status === 'HOT').length,
        new: leads.filter((l: any) => l.status === 'NEW').length,
        conversion: leads.length > 0 ? Math.round((leads.filter((l: any) => l.status === 'CONVERTED').length / leads.length) * 100) : 0
    };

    return (
        <div>
            <Topbar title="Lead Management (CRM)" subtitle="Track inquiries, manage follow-ups, and boost conversions" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* KPI Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Inquiries', value: stats.total, icon: Mail, color: 'hsl(199 89% 48%)' },
                        { label: 'Hot Leads', value: stats.hot, icon: Flame, color: 'hsl(0 84% 60%)' },
                        { label: 'New Today', value: stats.new, icon: Clock, color: 'hsl(285 70% 65%)' },
                        { label: 'Conversion Rate', value: `${stats.conversion}%`, icon: CheckCircle2, color: 'hsl(142 71% 45%)' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-white/5" style={{ color: stat.color }}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-xl font-bold">{stat.value}</div>
                                    <div className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-6">
                    {/* Leads Table */}
                    <div className="flex-1 glass-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--glass-border)] flex items-center justify-between bg-[var(--table-header)]">
                            <div className="flex items-center gap-4">
                                <h3 className="font-bold">Inquiries</h3>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                                    <input 
                                        type="text" 
                                        placeholder="Search leads..." 
                                        className="pl-9 pr-4 py-1.5 rounded-lg border border-[var(--glass-border)] bg-background text-xs outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                                    />
                                </div>
                            </div>
                            <button className="btn-primary flex items-center gap-2 px-4 py-1.5 text-xs">
                                <Plus size={14} /> Add Manual Lead
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th>Guest Details</th>
                                        <th>Interested Package</th>
                                        <th>Status</th>
                                        <th>Pax</th>
                                        <th>Created</th>
                                        <th>Next Follow-up</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead: any) => {
                                        const status = statusConfig[lead.status] || statusConfig.NEW;
                                        return (
                                            <tr 
                                                key={lead.id} 
                                                onClick={() => setSelectedLead(lead)}
                                                className={`cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-white/5' : ''}`}
                                            >
                                                <td>
                                                    <div className="font-bold text-sm">{lead.guestName}</div>
                                                    <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{lead.guestEmail}</div>
                                                </td>
                                                <td>
                                                    <div className="text-xs font-medium">{lead.package?.title || 'General Inquiry'}</div>
                                                </td>
                                                <td>
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ color: status.color, background: status.bg }}>
                                                        <status.icon size={10} />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="text-sm font-bold">{lead.paxCount}</td>
                                                <td className="text-[10px] text-[hsl(var(--muted-foreground))]">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</td>
                                                <td>
                                                    <div className="flex items-center gap-1 text-[10px] font-medium text-orange-500">
                                                        <Clock size={10} />
                                                        {lead.nextFollowUp || 'Not Set'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button className="p-1 rounded-lg hover:bg-white/10">
                                                        <MoreVertical size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {leads.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-20 opacity-40 italic">No inquiries found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lead Detail Panel */}
                    {selectedLead && (
                        <div className="w-96 glass-card p-6 h-fit animate-slideInRight sticky top-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h4 className="text-lg font-bold">{selectedLead.guestName}</h4>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{selectedLead.guestPhone || 'No phone provided'}</div>
                                </div>
                                <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-white/10 rounded">
                                    <XCircle size={18} className="text-[hsl(var(--muted-foreground))]" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-[var(--glass-border)]">
                                    <div className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))] mb-2">Lead Status</div>
                                    <div className="flex gap-2">
                                        {['NEW', 'HOT', 'WARM', 'COLD', 'CONVERTED'].map(s => (
                                            <button 
                                                key={s}
                                                className={`flex-1 py-1 text-[8px] font-bold rounded-md border transition-all ${selectedLead.status === s ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white' : 'border-[var(--glass-border)] text-[hsl(var(--muted-foreground))]'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-[var(--glass-border)]">
                                    <div className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))] mb-1">Internal Notes</div>
                                    <p className="text-xs opacity-80 leading-relaxed">{selectedLead.notes || 'No notes added for this lead.'}</p>
                                    <button className="text-[10px] font-bold text-[hsl(var(--accent))] mt-2 hover:underline">+ Add Note</button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                                        <Phone size={14} /> Call Guest
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-xs font-bold shadow-lg shadow-green-500/20">
                                        <Mail size={14} /> WhatsApp
                                    </button>
                                </div>
                                
                                <Link href={`/packages/leads/${selectedLead.id}/quotation`}>
                                    <button className="w-full py-2.5 rounded-xl border border-[hsl(var(--accent))] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))/0.05] transition-colors">
                                        Create Booking Quotation
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
