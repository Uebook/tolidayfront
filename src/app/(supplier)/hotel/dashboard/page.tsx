'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
    TrendingUp, Users, BedDouble, XCircle, ArrowUpRight, ArrowDownRight,
    Clock, CheckCircle2, AlertCircle, CalendarDays, DollarSign,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        confirmed: 'badge-accent',
        checked_in: 'badge-success',
        cancelled: 'badge-destructive',
        pending: 'badge-warning',
    };
    const labels: Record<string, string> = {
        confirmed: 'Confirmed',
        checked_in: 'Checked In',
        cancelled: 'Cancelled',
        pending: 'Pending',
    };
    return <span className={`badge ${map[status] || 'badge-muted'}`}>{labels[status] || status}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 text-sm">
                <p className="text-[hsl(var(--foreground))] font-semibold mb-1">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(getAuthUser());
    }, []);

    const { data: summary, isLoading } = useQuery({
        queryKey: ['stats-summary'],
        queryFn: async () => {
            const res = await api.get('/stats/summary');
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
            change: 'All time',
            up: true,
            icon: TrendingUp,
            color: 'hsl(199 89% 48%)',
            bg: 'hsl(199 89% 48% / 0.1)',
        },
        {
            label: 'Check-ins Today',
            value: summary?.checkInsToday || 0,
            change: 'Scheduled',
            up: true,
            icon: BedDouble,
            color: 'hsl(142 71% 45%)',
            bg: 'hsl(142 71% 45% / 0.1)',
        },
        {
            label: 'Pending Bookings',
            value: summary?.pendingBookings || 0,
            change: 'Needs attention',
            up: false,
            icon: Clock,
            color: 'hsl(38 92% 50%)',
            bg: 'hsl(38 92% 50% / 0.1)',
        },
        {
            label: 'Cancellations',
            value: summary?.cancellations || 0,
            change: 'Recent',
            up: false,
            icon: XCircle,
            color: 'hsl(0 84% 60%)',
            bg: 'hsl(0 84% 60% / 0.1)',
        },
        {
            label: 'Active Stays',
            value: summary?.activeStay || 0,
            change: 'Guests in-house',
            up: true,
            icon: Users,
            color: 'hsl(225 70% 65%)',
            bg: 'hsl(225 70% 65% / 0.1)',
        },
        {
            label: 'Check-outs Today',
            value: summary?.checkOutsToday || 0,
            change: 'Rooms clearing',
            up: null,
            icon: CalendarDays,
            color: 'hsl(var(--muted-foreground))',
            bg: 'var(--glass-border-light)',
        },
    ];

    const revenueChartData = summary?.revenueTrend || [];
    const recentBookings = summary?.recentBookings || [];

    return (
        <div>
            <Topbar title="Dashboard Overview" subtitle="Welcome back, here's what's happening today" />
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

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="glass-card p-5 xl:col-span-2">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-semibold text-[hsl(var(--foreground))]">Revenue & Bookings</h3>
                                <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Last 7 days</p>
                            </div>
                            <span className="badge badge-success">+18% vs last week</span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border-light)" />
                                <XAxis dataKey="day" tick={{ fill: 'hsl(222 15% 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'hsl(222 15% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="hsl(199 89% 48%)" strokeWidth={2} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Occupancy Summary */}
                    <div className="glass-card p-5">
                        <div className="mb-5">
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">Occupancy Summary</h3>
                            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Current status</p>
                        </div>
                        <div className="flex flex-col items-center justify-center h-[260px] space-y-4">
                            <div className="relative h-32 w-32">
                                <svg className="h-full w-full" viewBox="0 0 100 100">
                                    <circle className="stroke-[hsl(var(--muted-foreground))] opacity-20" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                                    <circle className="stroke-[hsl(142 71% 45%)]" strokeWidth="8" strokeDasharray={`${summary?.activeStay || 0} 251`} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold">{summary?.activeStay || 0}</span>
                                    <span className="text-[10px] uppercase text-[hsl(var(--muted-foreground))]">Guests</span>
                                </div>
                            </div>
                            <p className="text-sm text-center font-medium">Occupancy trending high</p>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="glass-card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Recent Bookings</h3>
                        <Link href="/hotel/bookings" className="text-xs font-medium" style={{ color: 'hsl(var(--accent))' }}>View all →</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ref</th>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.length > 0 ? (
                                    recentBookings.map((b: any) => (
                                        <tr key={b.ref} className="cursor-pointer">
                                            <td className="font-mono text-xs" style={{ color: 'hsl(var(--accent))' }}>{b.ref}</td>
                                            <td className="font-medium text-[hsl(var(--foreground))]">{b.guest}</td>
                                            <td style={{ color: 'hsl(var(--muted-foreground))' }}>{b.room}</td>
                                            <td style={{ color: 'hsl(var(--muted-foreground))' }}>{b.checkIn}</td>
                                            <td><StatusBadge status={b.status} /></td>
                                            <td className="font-semibold text-[hsl(var(--foreground))]">{b.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-[hsl(var(--muted-foreground))]">No recent bookings found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[
                        { label: 'Add Booking', href: '/hotel/bookings/add', icon: CheckCircle2, color: 'hsl(142 70% 45%)', bg: 'hsl(142 70% 45% / 0.1)', permission: 'bookings_modify' },
                        { label: 'Update Inventory', href: '/hotel/inventory', icon: CalendarDays, color: 'hsl(195 90% 50%)', bg: 'hsl(195 90% 50% / 0.1)', permission: 'inventory_edit' },
                        { label: 'Manage Payments', href: '/hotel/payments', icon: DollarSign, color: 'hsl(38 92% 50%)', bg: 'hsl(38 92% 50% / 0.1)', permission: 'payments_view' },
                        { label: 'Pending Actions', href: '/hotel/bookings?filter=pending', icon: AlertCircle, color: 'hsl(0 84% 60%)', bg: 'hsl(0 84% 60% / 0.1)', permission: 'bookings_view' },
                        { label: 'View Reports', href: '/hotel/reports', icon: TrendingUp, color: 'hsl(285 70% 65%)', bg: 'hsl(285 70% 65% / 0.1)', permission: 'reports_view' },
                    ]
                        .filter(a => {
                            if (!user) return false;
                            if (user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'MANAGER') return true;
                            return !!user.permissions?.[a.permission];
                        })
                        .map((a) => (
                            <Link key={a.label} href={a.href}
                                className="glass-card flex items-center gap-4 px-5 py-4 hover:scale-[1.02] transition-transform"
                            >
                                <div className="p-2.5 rounded-xl" style={{ background: a.bg }}>
                                    <a.icon size={20} style={{ color: a.color }} />
                                </div>
                                <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{a.label}</span>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
}
