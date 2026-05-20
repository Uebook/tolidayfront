'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { FileText, Download, Send, ArrowLeft, Settings, Image as ImageIcon, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function QuotationGeneratorPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params.leadId as string;

    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('Looking forward to hosting you on this wonderful journey!');
    const [customItems, setCustomItems] = useState([{ desc: 'Airport Pickup', price: 1500 }]);

    // In a real app we'd fetch the specific lead. We mock it for the demo if not available.
    const { data: leads = [] } = useQuery({
        queryKey: ['package-leads'],
        queryFn: async () => {
            const res = await api.get('/packages/leads');
            return res.data;
        },
    });

    const lead = leads.find((l: any) => l.id === leadId) || {
        guestName: 'Guest',
        paxCount: 2,
        package: { title: 'Standard Tour', price: 50000 }
    };

    const basePrice = (lead.package?.price || 50000) * lead.paxCount;
    const customTotal = customItems.reduce((acc, curr) => acc + curr.price, 0);
    const subtotal = basePrice + customTotal;
    const taxes = subtotal * 0.05; // 5% GST
    const finalTotal = subtotal + taxes - discount;

    return (
        <div>
            <Topbar title="Quotation Generator" subtitle="Create and send beautiful, branded proposals" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium hover:text-[hsl(var(--accent))] transition-colors">
                        <ArrowLeft size={16} /> Back to Leads
                    </button>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--glass-border)] rounded-lg hover:bg-white/5 transition-colors">
                            <Download size={16} /> Preview PDF
                        </button>
                        <button className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                            <Send size={16} /> Send to Customer
                        </button>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Settings Sidebar */}
                    <div className="w-80 space-y-4">
                        <div className="glass-card p-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4 flex items-center gap-2">
                                <Settings size={14} /> Quote Settings
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium block mb-1">Customer Name</label>
                                    <input type="text" value={lead.guestName} readOnly className="form-input opacity-70" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium block mb-1">Total Pax</label>
                                    <input type="number" value={lead.paxCount} readOnly className="form-input opacity-70" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium block mb-1">Discount Amount (₹)</label>
                                    <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="form-input focus:ring-[hsl(var(--accent))]" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium block mb-1">Cover Image</label>
                                    <button className="w-full py-8 border-2 border-dashed border-[var(--glass-border)] rounded-lg flex flex-col items-center gap-2 hover:bg-white/5 transition-colors">
                                        <ImageIcon size={20} className="text-[hsl(var(--muted-foreground))]" />
                                        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Upload Banner</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4 flex items-center gap-2">
                                <Plus size={14} /> Add-ons & Custom Items
                            </h3>
                            <div className="space-y-3 mb-4">
                                {customItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input 
                                            type="text" 
                                            value={item.desc}
                                            onChange={e => {
                                                const newItems = [...customItems];
                                                newItems[idx].desc = e.target.value;
                                                setCustomItems(newItems);
                                            }}
                                            className="form-input text-xs flex-1" 
                                        />
                                        <input 
                                            type="number" 
                                            value={item.price}
                                            onChange={e => {
                                                const newItems = [...customItems];
                                                newItems[idx].price = Number(e.target.value);
                                                setCustomItems(newItems);
                                            }}
                                            className="form-input text-xs w-24" 
                                        />
                                        <button onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCustomItems([...customItems, { desc: 'New Item', price: 0 }])}
                                className="w-full py-2 text-xs border border-[var(--glass-border)] rounded-lg hover:bg-white/5 text-[hsl(var(--muted-foreground))]"
                            >
                                + Add Line Item
                            </button>
                        </div>
                    </div>

                    {/* Preview Document Canvas */}
                    <div className="flex-1 glass-card bg-white text-black min-h-[800px] shadow-2xl relative overflow-hidden">
                        {/* Branded Header */}
                        <div className="h-40 bg-[hsl(var(--accent))] p-8 text-white relative">
                            <div className="absolute right-0 top-0 w-64 h-full bg-white/10 skew-x-12 translate-x-10" />
                            <h1 className="text-3xl font-bold uppercase tracking-wider">Travel Proposal</h1>
                            <p className="mt-2 opacity-80 text-sm">Prepared exclusively for {lead.guestName}</p>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Meta info */}
                            <div className="flex justify-between border-b border-gray-200 pb-6">
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Package Name</div>
                                    <div className="text-xl font-bold text-gray-800">{lead.package?.title}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quote Date</div>
                                    <div className="font-medium">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                </div>
                            </div>

                            {/* Pricing Table */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Briefcase size={16} /> Investment Summary
                                </h3>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-y border-gray-200 text-gray-500">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-bold">Description</th>
                                            <th className="text-right py-3 px-4 font-bold">Qty</th>
                                            <th className="text-right py-3 px-4 font-bold">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-gray-800">Base Package Cost</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Standard inclusions as per itinerary</div>
                                            </td>
                                            <td className="py-4 px-4 text-right">{lead.paxCount} Pax</td>
                                            <td className="py-4 px-4 text-right font-medium">₹{basePrice.toLocaleString()}</td>
                                        </tr>
                                        {customItems.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-4 px-4 text-gray-700">{item.desc}</td>
                                                <td className="py-4 px-4 text-right">1</td>
                                                <td className="py-4 px-4 text-right font-medium">₹{item.price.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Taxes (5% GST)</span>
                                        <span>₹{taxes.toLocaleString()}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount Applied</span>
                                            <span>- ₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-3">
                                        <span>Total Amount</span>
                                        <span className="text-[hsl(var(--accent))]">₹{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Notes */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Personal Note</h3>
                                <textarea 
                                    className="w-full text-sm text-gray-600 p-4 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-gray-200 resize-none min-h-[100px]"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Payment CTA Mock */}
                            <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl text-center">
                                <p className="text-sm text-gray-600 mb-4">Click below to securely pay and confirm your booking instantly.</p>
                                <button className="bg-[hsl(var(--accent))] text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                    Pay ₹{finalTotal.toLocaleString()} Securely
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
