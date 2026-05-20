'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { 
    HelpCircle, MessageSquare, Plus, Search, 
    ChevronRight, ExternalLink, Send, Info,
    CheckCircle2, Clock, AlertCircle, Phone, Mail,
    LifeBuoy
} from 'lucide-react';
import api from '@/lib/api';

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);
    
    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'Technical Support',
        priority: 'NORMAL',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ticketsRes, faqsRes] = await Promise.all([
                api.get('/support/tickets'),
                api.get('/support/faqs')
            ]);
            setTickets(ticketsRes.data);
            setFaqs(faqsRes.data);
        } catch (err) {
            console.error('Failed to fetch support data', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/support/tickets', newTicket);
            alert('Ticket created successfully! Our team will reach out soon.');
            setShowNewTicket(false);
            setNewTicket({ subject: '', category: 'Technical Support', priority: 'NORMAL', description: '' });
            fetchData();
        } catch (err) {
            alert('Failed to create ticket');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <Topbar 
                title="Support Center" 
                subtitle="Get help with your account, bookings, or platform technical issues"
            />

            <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
                
                {/* Support Header Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-600/20 blur-[40px] group-hover:bg-blue-600/40 transition-all duration-700" />
                        <LifeBuoy className="mb-6 opacity-40" size={32} />
                        <h3 className="text-xl font-black italic mb-2">Live Support</h3>
                        <p className="text-xs text-slate-400 font-bold mb-6">Chat with our partner success team 24/7</p>
                        <button className="w-full bg-white text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                            Start Live Chat
                        </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-8 rounded-[40px] flex flex-col justify-between">
                        <div>
                            <Phone className="text-blue-600 mb-6" size={32} />
                            <h3 className="text-xl font-black italic mb-1">Direct Line</h3>
                            <p className="text-xs text-slate-500 font-bold">+91 98765 43210</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4">Priority Support</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-8 rounded-[40px] flex flex-col justify-between">
                        <div>
                            <Mail className="text-blue-600 mb-6" size={32} />
                            <h3 className="text-xl font-black italic mb-1">Email Us</h3>
                            <p className="text-xs text-slate-500 font-bold">partners@toliday.com</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4">Avg Response: 2h</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Support Tickets Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black italic">Active Tickets</h2>
                            <button 
                                onClick={() => setShowNewTicket(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus size={16} /> New Ticket
                            </button>
                        </div>

                        {showNewTicket && (
                            <form onSubmit={handleCreateTicket} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-8 space-y-6 animate-in slide-in-from-top-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-black font-bold text-sm"
                                            value={newTicket.subject}
                                            onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                                        <select 
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-black font-bold text-sm appearance-none"
                                            value={newTicket.category}
                                            onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                                        >
                                            <option>Technical Support</option>
                                            <option>Billing & Payments</option>
                                            <option>Account Access</option>
                                            <option>Tour Management</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Detailed Description</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-black font-bold text-sm resize-none"
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewTicket(false)}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black"
                                    >
                                        Cancel
                                    </button>
                                    <button className="px-8 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Send size={14} /> Submit Ticket
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {tickets.length === 0 ? (
                                <div className="p-12 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 text-center space-y-4">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                        <CheckCircle2 className="text-emerald-500" size={32} />
                                    </div>
                                    <div>
                                        <p className="font-black italic text-lg">All Clear!</p>
                                        <p className="text-sm font-bold text-slate-400">You don't have any open support tickets at the moment.</p>
                                    </div>
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <div key={ticket.id} className="p-6 bg-white border border-slate-100 rounded-[32px] hover:shadow-xl hover:translate-x-2 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                                ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {ticket.status === 'RESOLVED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base">{ticket.subject}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ticket.category}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                ticket.status === 'OPEN' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 
                                                ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                            <ChevronRight size={20} className="text-slate-300 group-hover:text-black transition-colors" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* FAQs Sidebar */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black italic">Help Center</h2>
                        <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-8 space-y-8">
                            {faqs.map((faq) => (
                                <div key={faq.id} className="space-y-2 group cursor-pointer">
                                    <h5 className="font-black text-sm flex items-center justify-between group-hover:text-blue-600 transition-colors">
                                        {faq.question}
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                    </h5>
                                    <p className="text-xs font-bold text-slate-400 line-clamp-2 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                            <button className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">
                                View Knowledge Base <ExternalLink size={14} />
                            </button>
                        </div>

                        <div className="p-8 bg-blue-600 rounded-[40px] text-white space-y-4 shadow-2xl shadow-blue-600/20">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <h4 className="font-black italic text-lg">Partner Success</h4>
                            <p className="text-xs font-bold text-white/70 leading-relaxed">
                                Need custom integrations or specialized tour workflows? Contact our Partner Success team for bespoke solutions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
