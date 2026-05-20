'use client';

import Topbar from '@/components/layout/Topbar';
import { MessageSquare, Plus, ChevronDown, ChevronRight, Phone, Mail, Clock, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function SupportPage() {
    const queryClient = useQueryClient();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Form state
    const [ticketData, setTicketData] = useState({
        category: 'Booking Issue',
        priority: 'NORMAL',
        subject: '',
        description: ''
    });

    const { data: faqs, isLoading: isFaqsLoading } = useQuery({
        queryKey: ['support-faqs'],
        queryFn: async () => {
            const res = await api.get('/support/faqs');
            return res.data;
        }
    });

    const { data: tickets, isLoading: isTicketsLoading } = useQuery({
        queryKey: ['support-tickets'],
        queryFn: async () => {
            const res = await api.get('/support/tickets');
            return res.data;
        }
    });

    const createTicketMutation = useMutation({
        mutationFn: async (data: typeof ticketData) => {
            return api.post('/support/tickets', data);
        },
        onSuccess: () => {
            setSuccessMsg('Support ticket raised successfully!');
            setTimeout(() => setSuccessMsg(''), 5000);
            setShowForm(false);
            setTicketData({
                category: 'Booking Issue',
                priority: 'NORMAL',
                subject: '',
                description: ''
            });
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
        },
        onError: () => {
            // Handle error
        }
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN': return AlertCircle;
            case 'IN_PROGRESS': return Timer;
            case 'RESOLVED': return CheckCircle2;
            case 'CLOSED': return CheckCircle2;
            default: return AlertCircle;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'hsl(38 92% 50%)'; // Warning
            case 'IN_PROGRESS': return 'hsl(199 89% 48%)'; // Info
            case 'RESOLVED': return 'hsl(142 71% 45%)'; // Success
            case 'CLOSED': return 'hsl(var(--muted-foreground))';
            default: return 'hsl(var(--muted-foreground))';
        }
    };

    return (
        <div>
            <Topbar title="Support & Help" subtitle="Get help with managing your hotel on TolidayTrip" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { icon: Phone, title: 'Call Support', desc: '+91 1800-123-4567', meta: 'Mon–Sat, 9AM–8PM IST', available: true, action: 'Call Now', color: 'hsl(142 71% 45%)' },
                        { icon: Mail, title: 'Email Support', desc: 'partners@tolidaytrip.com', meta: 'Avg response: 4 hours', available: true, action: 'Send Email', color: 'hsl(38 92% 50%)' },
                    ].map((c) => (
                        <div key={c.title} className="glass-card p-5 flex flex-col gap-4">
                            <div className="p-2.5 rounded-xl w-fit" style={{ background: `${c.color}18` }}>
                                <c.icon size={20} style={{ color: c.color }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[hsl(var(--foreground))]">{c.title}</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{c.desc}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                    <Clock size={10} /> {c.meta}
                                </div>
                            </div>
                            <button className="btn-primary mt-auto py-2 text-sm">{c.action}</button>
                        </div>
                    ))}
                </div>

                {/* Raise Ticket */}
                <div className="glass-card p-6">
                    {successMsg && (
                        <div className="mb-4 p-3 rounded-lg bg-[hsl(142_71%_45%)/10%] border border-[hsl(142_71%_45%)/20%] text-[hsl(142_71%_45%)] text-sm flex items-center gap-2 animate-fadeIn">
                            <CheckCircle2 size={16} /> {successMsg}
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">Raise a Support Ticket</h3>
                            <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Describe your issue in detail and our team will get back to you</p>
                        </div>
                        {!showForm && (
                            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                                <Plus size={14} /> New Ticket
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Category</label>
                                    <select
                                        className="form-input"
                                        value={ticketData.category}
                                        onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                                    >
                                        <option>Booking Issue</option>
                                        <option>Payment Issue</option>
                                        <option>Technical Problem</option>
                                        <option>Account Access</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Priority</label>
                                    <select
                                        className="form-input"
                                        value={ticketData.priority}
                                        onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                                    >
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Subject</label>
                                <input
                                    placeholder="Brief description of the issue"
                                    className="form-input"
                                    value={ticketData.subject}
                                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Description</label>
                                <textarea
                                    placeholder="Provide as much detail as possible..."
                                    className="form-input min-h-[120px] resize-none"
                                    value={ticketData.description}
                                    onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => createTicketMutation.mutate(ticketData)}
                                    disabled={createTicketMutation.isPending}
                                    className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                                >
                                    {createTicketMutation.isPending ? 'Raising...' : 'Raise Support Ticket'}
                                </button>
                                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm rounded-lg" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tickets List */}
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--glass-border)]">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Your Tickets</h3>
                    </div>
                    <div className="divide-y divide-white/05">
                        {isTicketsLoading ? (
                            <div className="p-10 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                            </div>
                        ) : tickets?.length > 0 ? (
                            tickets.map((ticket: any) => {
                                const StatusIcon = getStatusIcon(ticket.status);
                                return (
                                    <div key={ticket.id} className="px-6 py-5">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--accent) / 0.1)', color: 'hsl(var(--accent))' }}>{ticket.category}</span>
                                                    <span className="text-[10px] uppercase font-bold" style={{ color: ticket.priority === 'URGENT' ? 'hsl(0 84% 60%)' : ticket.priority === 'HIGH' ? 'hsl(38 92% 50%)' : 'hsl(var(--muted-foreground))' }}>
                                                        {ticket.priority} PRIORITY
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-[hsl(var(--foreground))]">{ticket.subject}</h4>
                                                <p className="text-sm line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>{ticket.description}</p>
                                                {ticket.adminComment && (
                                                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                        <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Admin Response</p>
                                                        <p className="text-sm italic" style={{ color: 'hsl(var(--foreground))' }}>"{ticket.adminComment}"</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${getStatusColor(ticket.status)}15`, color: getStatusColor(ticket.status) }}>
                                                    <StatusIcon size={12} />
                                                    {ticket.status.replace('_', ' ')}
                                                </div>
                                                <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 text-center flex flex-col items-center gap-3">
                                <div className="p-3 rounded-full bg-white/5">
                                    <MessageSquare size={24} className="opacity-20" />
                                </div>
                                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>You haven't raised any tickets yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* FAQs */}
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--glass-border)]">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Frequently Asked Questions</h3>
                    </div>
                    <div className="divide-y divide-white/05">
                        {isFaqsLoading ? (
                            <div className="p-10 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                            </div>
                        ) : faqs?.length > 0 ? (
                            faqs.map((faq: any, i: number) => (
                                <div key={faq.id} className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider font-bold opacity-50" style={{ color: 'hsl(var(--accent))' }}>{faq.category}</span>
                                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{faq.question}</p>
                                        </div>
                                        {openFaq === i
                                            ? <ChevronDown size={16} style={{ color: 'hsl(var(--accent))' }} />
                                            : <ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                        }
                                    </div>
                                    {openFaq === i && (
                                        <p className="text-sm mt-3 animate-fadeIn leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{faq.answer}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                No FAQs found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
