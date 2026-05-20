'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
       TrendingUp, Users, Map, XCircle, ArrowUpRight, ArrowDownRight,
       Clock, CheckCircle2, AlertCircle, CalendarDays, DollarSign,
       Ticket, ShoppingBag
} from 'lucide-react';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

function StatusBadge({ status }: { status: string }) {
       const map: Record<string, string> = {
              confirmed: 'badge-accent',
              completed: 'badge-success',
              cancelled: 'badge-destructive',
              pending: 'badge-warning',
       };
       const labels: Record<string, string> = {
              confirmed: 'Confirmed',
              completed: 'Completed',
              cancelled: 'Cancelled',
              pending: 'Pending',
       };
       return <span className={`badge ${map[status] || 'badge-muted'}`}>{labels[status] || status}</span>;
}

export default function SiteSeeingDashboard() {
       const [user, setUser] = useState<any>(null);

       useEffect(() => {
              setUser(getAuthUser());
       }, []);

       const { data: summary, isLoading } = useQuery({
              queryKey: ['siteseeing-stats-summary'],
              queryFn: async () => {
                     const res = await api.get('/siteseeing/stats/summary');
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

       const stats = [
              {
                     label: "Total Revenue",
                     value: `₹${summary?.revenue?.toLocaleString() || 0}`,
                     change: 'Month to date',
                     up: true,
                     icon: DollarSign,
                     color: 'hsl(199 89% 48%)',
                     bg: 'hsl(199 89% 48% / 0.1)',
              },
              {
                     label: 'Total Tours',
                     value: summary?.totalTours || 0,
                     change: 'Active listings',
                     up: true,
                     icon: Map,
                     color: 'hsl(142 71% 45%)',
                     bg: 'hsl(142 71% 45% / 0.1)',
              },
              {
                     label: 'Pending Confirmation',
                     value: summary?.pendingBookings || 0,
                     change: 'Action required',
                     up: false,
                     icon: Clock,
                     color: 'hsl(38 92% 50%)',
                     bg: 'hsl(38 92% 50% / 0.1)',
              },
              {
                     label: 'Active Bookings',
                     value: summary?.activeBookings || 0,
                     change: 'Upcoming tours',
                     up: true,
                     icon: Ticket,
                     color: 'hsl(225 70% 65%)',
                     bg: 'hsl(225 70% 65% / 0.1)',
              },
              {
                     label: 'Total Completed',
                     value: summary?.completedBookings || 0,
                     change: 'Successful tours',
                     up: true,
                     icon: CheckCircle2,
                     color: 'hsl(285 70% 65%)',
                     bg: 'hsl(285 70% 65% / 0.1)',
              },
              {
                     label: 'Cancellations',
                     value: summary?.cancelledBookings || 0,
                     change: 'Loss of revenue',
                     up: false,
                     icon: XCircle,
                     color: 'hsl(0 84% 60%)',
                     bg: 'hsl(0 84% 60% / 0.1)',
              },
       ];

       return (
              <div>
                     <Topbar title="Sightseeing Overview" subtitle="Track your tour performance and bookings" />
                     <div className="p-8 space-y-8 animate-fadeIn max-w-[1600px] mx-auto">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
                                   {stats.map((stat) => (
                                          <div key={stat.label} className="stat-card p-4">
                                                 <div className="flex items-start justify-between mb-3">
                                                        <div className="p-2 rounded-lg" style={{ background: stat.bg }}>
                                                               <stat.icon size={16} style={{ color: stat.color }} />
                                                        </div>
                                                        {stat.up !== null && (
                                                               stat.up
                                                                      ? <ArrowUpRight size={14} style={{ color: 'hsl(142 71% 45%)' }} />
                                                                      : <ArrowDownRight size={14} style={{ color: 'hsl(0 84% 60%)' }} />
                                                        )}
                                                 </div>
                                                 <div className="text-xl font-bold text-[hsl(var(--foreground))]">{stat.value}</div>
                                                 <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{stat.label}</div>
                                                 <div className="text-xs mt-1" style={{ color: stat.up ? 'hsl(142 71% 45%)' : stat.up === null ? 'hsl(var(--muted-foreground))' : 'hsl(0 84% 60%)' }}>
                                                        {stat.change}
                                                 </div>
                                          </div>
                                   ))}
                            </div>

                            {/* Middle Content */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                   {/* Revenue placeholder or chart would go here */}
                                   <div className="glass-card p-6 xl:col-span-2 flex flex-col items-center justify-center text-center min-h-[300px]">
                                          <div className="p-4 rounded-full bg-accent/10 mb-4">
                                                 <TrendingUp size={32} className="text-accent" />
                                          </div>
                                          <h3 className="text-lg font-bold">Revenue Insights</h3>
                                          <p className="text-muted-foreground text-sm max-w-sm mt-2">
                                                 View detailed charts of your sightseeing revenue once more bookings are processed.
                                          </p>
                                   </div>

                                   {/* Quick Access */}
                                   <div className="glass-card p-6 min-h-[300px]">
                                          <h3 className="font-semibold mb-6 flex items-center gap-2">
                                                 <ShoppingBag size={18} className="text-accent" />
                                                 Inventory Status
                                          </h3>
                                          <div className="space-y-6">
                                                 <div>
                                                        <div className="flex justify-between text-sm mb-2">
                                                               <span>Listing Quality</span>
                                                               <span className="text-accent font-bold">85%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                               <div className="h-full bg-accent rounded-full" style={{ width: '85%' }}></div>
                                                        </div>
                                                 </div>
                                                 <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                                                        <p className="text-xs leading-relaxed">
                                                               <span className="font-bold text-accent">TIP:</span> Complete all tour details and add at least 5 photos per gallery to improve your booking conversion rates.
                                                        </p>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Recent Bookings */}
                            <div className="glass-card overflow-hidden">
                                   <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
                                          <h3 className="font-semibold text-[hsl(var(--foreground))]">Recent Sightseeing Bookings</h3>
                                          <Link href="/siteseeing/bookings" className="text-xs font-medium" style={{ color: 'hsl(var(--accent))' }}>View all bookings →</Link>
                                   </div>
                                   <div className="overflow-x-auto">
                                          <table className="data-table">
                                                 <thead>
                                                        <tr>
                                                               <th>Ref</th>
                                                               <th>Customer</th>
                                                               <th>Tour / Package</th>
                                                               <th>Date</th>
                                                               <th>Status</th>
                                                               <th>Total</th>
                                                        </tr>
                                                 </thead>
                                                 <tbody>
                                                        {summary?.recentBookings.map((b: any) => (
                                                               <tr key={b.ref} className="cursor-pointer">
                                                                      <td className="font-mono text-xs" style={{ color: 'hsl(var(--accent))' }}>{b.ref}</td>
                                                                      <td className="font-medium text-[hsl(var(--foreground))]">{b.customer}</td>
                                                                      <td style={{ color: 'hsl(var(--muted-foreground))' }}>{b.tour}</td>
                                                                      <td style={{ color: 'hsl(var(--muted-foreground))' }}>{b.date}</td>
                                                                      <td><StatusBadge status={b.status} /></td>
                                                                      <td className="font-semibold text-[hsl(var(--foreground))]">{b.amount}</td>
                                                               </tr>
                                                        ))}
                                                 </tbody>
                                          </table>
                                   </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                   <Link href="/siteseeing/listing/add" className="glass-card flex items-center gap-4 px-5 py-4 hover:scale-[1.02] transition-transform">
                                          <div className="p-2.5 rounded-xl bg-accent/10">
                                                 <Map size={20} className="text-accent" />
                                          </div>
                                          <span className="text-[15px] font-semibold">Add New Tour</span>
                                   </Link>
                                   <Link href="/siteseeing/availability" className="glass-card flex items-center gap-4 px-5 py-4 hover:scale-[1.02] transition-transform">
                                          <div className="p-2.5 rounded-xl bg-emerald-500/10">
                                                 <CalendarDays size={20} className="text-emerald-500" />
                                          </div>
                                          <span className="text-[15px] font-semibold">Calendar</span>
                                   </Link>
                                   <Link href="/siteseeing/payouts" className="glass-card flex items-center gap-4 px-5 py-4 hover:scale-[1.02] transition-transform">
                                          <div className="p-2.5 rounded-xl bg-blue-500/10">
                                                 <DollarSign size={20} className="text-blue-500" />
                                          </div>
                                          <span className="text-[15px] font-semibold">Payouts</span>
                                   </Link>
                            </div>
                     </div>
              </div>
       );
}
