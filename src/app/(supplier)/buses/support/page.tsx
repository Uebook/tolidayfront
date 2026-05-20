'use client';
import Topbar from '@/components/layout/Topbar';
import { HelpCircle, MessageSquare, Phone, Book, Mail } from 'lucide-react';

export default function BusSupportPage() {
    return (
        <div>
            <Topbar title="Support Center" subtitle="Get help with your operations and technical issues" />
            <div className="p-6 space-y-6 animate-fadeIn max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight">Live Chat</h3>
                        <p className="text-sm text-muted-foreground">Chat with our partner support team in real-time.</p>
                        <button className="btn-primary w-full py-3">Start Conversation</button>
                    </div>
                    <div className="glass-card p-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
                            <Phone size={32} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight">Phone Support</h3>
                        <p className="text-sm text-muted-foreground">Available Mon-Sat, 9AM to 8PM IST.</p>
                        <button className="btn-secondary w-full py-3">+91 1800-XXX-XXXX</button>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <h3 className="text-lg font-black tracking-tight mb-6">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        {[
                            'How do I add a new bus to my fleet?',
                            'How are payouts calculated for online bookings?',
                            'Can I set different prices for different seasons?',
                            'What happens if a passenger cancels their ticket?',
                        ].map((q) => (
                            <div key={q} className="p-4 rounded-2xl bg-white/05 border border-white/05 flex items-center justify-between group cursor-pointer hover:border-accent/50 transition-colors">
                                <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground">{q}</span>
                                <Book size={16} className="text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
