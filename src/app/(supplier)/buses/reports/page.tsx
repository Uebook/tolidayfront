'use client';

import Topbar from '@/components/layout/Topbar';
import { Download, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
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

export default function BusReportsPage() {
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

    const { data, isLoading } = useQuery({
        queryKey: ['bus-reports', period],
        queryFn: async () => {
            const res = await api.get(`/stats/reports?period=${period}`);
            return res.data;
        }
    });

    if (isLoading || !data) {
        return (
            <div>
                <Topbar title="Bus Operations Reports" subtitle="Revenue, trip occupancy and performance analytics" />
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                </div>
            </div>
        );
    }

    const { dailyData, totalRevenue, totalBookings, totalCancellations, avgOccupancy, sourceData } = data;

    return (
        <div>
            <Topbar title="Bus Operations Reports" subtitle="Revenue, trip occupancy and performance analytics" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* Period + Export */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 p-1 rounded-xl bg-[var(--table-header)] border border-[var(--glass-border)]">
                        {(['7d', '30d', '90d'] as const).map((p) => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Last {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>
                    <button className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm">
                        <Download size={15} /> Export Reports
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Fleet Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, change: '+12%', up: true, color: 'hsl(199 89% 48%)' },
                        { label: 'Ticket Bookings', value: totalBookings, change: '+5%', up: true, color: 'hsl(225 70% 65%)' },
                        { label: 'Cancellations', value: totalCancellations, change: '-2%', up: false, color: 'hsl(0 84% 60%)' },
                        { label: 'Avg Seat Occupancy', value: `${avgOccupancy}%`, change: '+8%', up: true, color: 'hsl(142 71% 45%)' },
                    ].map((k) => (
                        <div key={k.label} className="glass-card p-5">
                            <div className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
                            <div className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{k.label}</div>
                            <div className="flex items-center gap-1 mt-2">
                                {k.up ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}
                                <span className={`text-xs font-bold ${k.up ? 'text-green-500' : 'text-red-500'}`}>{k.change}</span>
                                <span className="text-[10px] text-muted-foreground ml-1">vs last period</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Revenue Chart */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-500" /> Daily Revenue Performance
                        </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border-light)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(199 89% 48%)" strokeWidth={2.5} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Bookings + Sources */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="font-bold text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                            <BarChart3 size={18} className="text-purple-500" /> Bookings vs Cancellations
                        </h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border-light)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="bookings" name="Bookings" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="cancellations" name="Cancellations" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                            <PieChartIcon size={18} className="text-orange-500" /> Revenue Channels
                        </h3>
                        <div className="flex flex-col md:flex-row items-center gap-8 justify-center h-[240px]">
                            <ResponsiveContainer width={200} height={200}>
                                <PieChart>
                                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={5}>
                                        {sourceData.map((entry: any, i: number) => {
                                            const colors = ['hsl(199 89% 48%)', 'hsl(225 70% 60%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)'];
                                            return <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />;
                                        })}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-4 w-full md:w-auto">
                                {sourceData.map((s: any, i: number) => {
                                    const colors = ['hsl(199 89% 48%)', 'hsl(225 70% 60%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)'];
                                    const c = colors[i % colors.length];
                                    return (
                                        <div key={s.name} className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" style={{ background: c }} />
                                            <span className="text-sm font-medium text-muted-foreground">{s.name}</span>
                                            <span className="text-sm font-black ml-auto" style={{ color: c }}>{s.value}%</span>
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
