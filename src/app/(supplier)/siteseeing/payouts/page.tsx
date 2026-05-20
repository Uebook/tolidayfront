'use client';

import Topbar from '@/components/layout/Topbar';
import {
       DollarSign, TrendingUp, Calendar,
       ArrowUpRight, Download, Clock, CheckCircle2
} from 'lucide-react';

export default function SiteSeeingPayoutsPage() {
       return (
              <div>
                     <Topbar title="Payouts & Earnings" subtitle="Track your sightseeing revenue and settlements" />

                     <div className="p-8 space-y-8 animate-fadeIn max-w-[1200px] mx-auto">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="stat-card p-6">
                                          <div className="flex items-center justify-between mb-4">
                                                 <div className="p-3 rounded-2xl bg-accent/10">
                                                        <DollarSign size={24} className="text-accent" />
                                                 </div>
                                                 <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-2 py-1 rounded-lg">Next: 22 Mar</span>
                                          </div>
                                          <p className="text-3xl font-black">₹48,250</p>
                                          <p className="text-xs text-muted-foreground mt-2 font-medium">Next Payout Amount</p>
                                   </div>
                                   <div className="stat-card p-6">
                                          <div className="flex items-center justify-between mb-4">
                                                 <div className="p-3 rounded-2xl bg-emerald-500/10">
                                                        <TrendingUp size={24} className="text-emerald-500" />
                                                 </div>
                                                 <span className="text-xs font-bold text-emerald-500">+12%</span>
                                          </div>
                                          <p className="text-3xl font-black">₹3,42,100</p>
                                          <p className="text-xs text-muted-foreground mt-2 font-medium">Total Lifetime Earnings</p>
                                   </div>
                                   <div className="stat-card p-6">
                                          <div className="flex items-center justify-between mb-4">
                                                 <div className="p-3 rounded-2xl bg-blue-500/10">
                                                        <Clock size={24} className="text-blue-500" />
                                                 </div>
                                          </div>
                                          <p className="text-3xl font-black">₹12,400</p>
                                          <p className="text-xs text-muted-foreground mt-2 font-medium">Pending Approvals</p>
                                   </div>
                            </div>

                            {/* History */}
                            <div className="glass-card">
                                   <div className="px-6 py-5 border-b border-muted flex items-center justify-between">
                                          <h3 className="font-bold flex items-center gap-2">
                                                 <Calendar size={18} className="text-accent" />
                                                 Payout History
                                          </h3>
                                          <button className="text-xs font-bold text-accent flex items-center gap-1 hover:underline">
                                                 <Download size={14} /> Download Reports
                                          </button>
                                   </div>
                                   <div className="overflow-x-auto">
                                          <table className="data-table">
                                                 <thead>
                                                        <tr>
                                                               <th>Date</th>
                                                               <th>Reference ID</th>
                                                               <th>Amount</th>
                                                               <th>Status</th>
                                                               <th>Receipt</th>
                                                        </tr>
                                                 </thead>
                                                 <tbody>
                                                        {[
                                                               { date: '15 Mar 2024', ref: 'PAY-88210', amount: '₹12,400', status: 'Completed' },
                                                               { date: '08 Mar 2024', ref: 'PAY-88150', amount: '₹18,900', status: 'Completed' },
                                                               { date: '01 Mar 2024', ref: 'PAY-87980', amount: '₹9,200', status: 'Completed' },
                                                        ].map((p, i) => (
                                                               <tr key={i}>
                                                                      <td className="text-sm font-medium">{p.date}</td>
                                                                      <td className="font-mono text-xs">{p.ref}</td>
                                                                      <td className="font-bold">{p.amount}</td>
                                                                      <td>
                                                                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                                                                    <CheckCircle2 size={12} /> {p.status}
                                                                             </span>
                                                                      </td>
                                                                      <td>
                                                                             <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                                                                                    <Download size={16} />
                                                                             </button>
                                                                      </td>
                                                               </tr>
                                                        ))}
                                                 </tbody>
                                          </table>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}
