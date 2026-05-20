'use client';

import Topbar from '@/components/layout/Topbar';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 text-sm">
                <p className="text-[hsl(var(--foreground))] font-semibold mb-1">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {p.name}: {p.dataKey === 'revenue' ? `₹${Number(p.value).toLocaleString()}` : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function ReportsPage() {
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

    const { data, isLoading } = useQuery({
        queryKey: ['reports', period],
        queryFn: async () => {
            const res = await api.get(`/stats/reports?period=${period}`);
            return res.data;
        }
    });

    if (isLoading || !data) {
        return (
            <div>
                <Topbar title="Reports" subtitle="Revenue, bookings and occupancy analytics" />
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                </div>
            </div>
        );
    }

    const { dailyData, totalRevenue, totalBookings, totalCancellations, avgOccupancy, sourceData } = data;

    return (
        <div>
            <Topbar title="Reports" subtitle="Revenue, bookings and occupancy analytics" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* Period + Export */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                        {(['7d', '30d', '90d'] as const).map((p) => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: period === p ? 'var(--glass-border)' : 'transparent',
                                    color: 'hsl(var(--muted-foreground))',
                                }}
                            >
                                Last {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg font-medium" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>
                        <Download size={15} /> Export CSV
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, change: 'N/A', up: true, color: 'hsl(199 89% 48%)' },
                        { label: 'Total Bookings', value: totalBookings, change: 'N/A', up: true, color: 'hsl(225 70% 65%)' },
                        { label: 'Cancellations', value: totalCancellations, change: 'N/A', up: false, color: 'hsl(0 84% 60%)' },
                        { label: 'Avg Occupancy', value: `${avgOccupancy}%`, change: 'N/A', up: true, color: 'hsl(142 71% 45%)' },
                    ].map((k) => (
                        <div key={k.label} className="stat-card p-4">
                            <div className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
                            <div className="text-sm text-[hsl(var(--foreground))] mt-1">{k.label}</div>
                            <div className="flex items-center gap-1 mt-1">
                                {k.up ? <TrendingUp size={12} style={{ color: 'hsl(142 71% 45%)' }} /> : <TrendingDown size={12} style={{ color: 'hsl(0 84% 60%)' }} />}
                                <span className="text-xs" style={{ color: k.up ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)' }}>{k.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Revenue Chart */}
                <div className="glass-card p-5">
                    <h3 className="font-semibold text-[hsl(var(--foreground))] mb-5">Daily Revenue</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border-light)" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(222 15% 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'hsl(222 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(199 89% 48%)" strokeWidth={2} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Bookings + Sources */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-5">Daily Bookings vs Cancellations</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border-light)" />
                                <XAxis dataKey="date" tick={{ fill: 'hsl(222 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'hsl(222 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="bookings" name="Bookings" fill="hsl(199 89% 48%)" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="cancellations" name="Cancellations" fill="hsl(0 84% 60%)" radius={[3, 3, 0, 0]} />
                                <Legend formatter={(v) => <span style={{ color: 'hsl(222 15% 55%)', fontSize: 12 }}>{v}</span>} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-5">Booking Sources</h3>
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                        {sourceData.map((entry: any, i: number) => {
                                            const colors = ['hsl(199 89% 48%)', 'hsl(225 70% 60%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)'];
                                            return <Cell key={i} fill={colors[i % colors.length]} />;
                                        })}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {sourceData.map((s: any, i: number) => {
                                    const colors = ['hsl(199 89% 48%)', 'hsl(225 70% 60%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)'];
                                    const c = colors[i % colors.length];
                                    return (
                                        <div key={s.name} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
                                            <span className="text-sm text-[hsl(var(--foreground))]">{s.name}</span>
                                            <span className="text-sm font-bold ml-auto" style={{ color: c }}>{s.value}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
