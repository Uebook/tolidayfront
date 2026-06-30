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

function AnimatedNumber({ value }: { value: number | string }) {
    const [displayVal, setDisplayVal] = useState<string | number>(value);

    useEffect(() => {
        const strVal = String(value);
        const numericStr = strVal.replace(/[^0-9]/g, '');
        const parsed = parseInt(numericStr, 10);
        if (isNaN(parsed)) {
            setDisplayVal(value);
            return;
        }

        let start = 0;
        const end = parsed;
        const duration = 1000; // 1 second animation
        const startTime = performance.now();

        const update = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const ease = progress * (2 - progress);
            const current = Math.floor(start + (end - start) * ease);
            
            if (strVal.startsWith('₹')) {
                setDisplayVal(`₹${current.toLocaleString()}`);
            } else {
                setDisplayVal(current.toLocaleString());
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }, [value]);

    return <span>{displayVal}</span>;
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
    if (!points || points.length === 0) return null;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const height = 24;
    const width = 80;
    const padding = 2;
    
    const coordinates = points.map((p, i) => {
        const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((p - min) / range) * (height - padding * 2) - padding;
        return `${x},${y}`;
    });
    
    const pathD = `M ${coordinates.join(' L ')}`;
    
    return (
        <svg className="w-20 h-6 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <style>{`
                @keyframes drawPath {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    strokeDasharray: 120,
                    strokeDashoffset: 120,
                    animation: 'drawPath 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}
            />
        </svg>
    );
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [isDemoMode, setIsDemoMode] = useState(true);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setUser(getAuthUser());
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString('en-US', options));
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

    const demoSummary = {
        revenue: 342850,
        checkInsToday: 12,
        pendingBookings: 5,
        cancellations: 2,
        activeStay: 38,
        checkOutsToday: 8,
        adr: 6850,
        revpar: 4795,
        recentBookings: [
            { ref: 'TX-4920', guest: 'Rahul Sharma', room: 'Deluxe Room', checkIn: '2026-06-29', status: 'checked_in', amount: '₹14,500' },
            { ref: 'TX-4919', guest: 'Ananya Iyer', room: 'Executive Suite', checkIn: '2026-06-29', status: 'confirmed', amount: '₹22,000' },
            { ref: 'TX-4918', guest: 'Amit Patel', room: 'Standard Room', checkIn: '2026-06-29', status: 'confirmed', amount: '₹7,200' },
            { ref: 'TX-4917', guest: 'David Miller', room: 'Deluxe Room', checkIn: '2026-06-28', status: 'checked_in', amount: '₹14,500' },
            { ref: 'TX-4916', guest: 'Sneha Reddy', room: 'Standard Room', checkIn: '2026-06-28', status: 'cancelled', amount: '₹7,200' },
        ],
        revenueTrend: [
            { day: 'Mon', revenue: 42000, bookings: 4 },
            { day: 'Tue', revenue: 38000, bookings: 3 },
            { day: 'Wed', revenue: 52000, bookings: 5 },
            { day: 'Thu', revenue: 48000, bookings: 4 },
            { day: 'Fri', revenue: 65000, bookings: 6 },
            { day: 'Sat', revenue: 72000, bookings: 7 },
            { day: 'Sun', revenue: 59000, bookings: 5 },
        ]
    };

    const activeSummary = isDemoMode ? demoSummary : (summary || {
        revenue: 0,
        checkInsToday: 0,
        pendingBookings: 0,
        cancellations: 0,
        activeStay: 0,
        checkOutsToday: 0,
        adr: 0,
        revpar: 0,
        recentBookings: [],
        revenueTrend: [
            { day: 'Mon', revenue: 0 },
            { day: 'Tue', revenue: 0 },
            { day: 'Wed', revenue: 0 },
            { day: 'Thu', revenue: 0 },
            { day: 'Fri', revenue: 0 },
            { day: 'Sat', revenue: 0 },
            { day: 'Sun', revenue: 0 },
        ]
    });

    const stats = [
        {
            label: "Total Revenue",
            value: `₹${activeSummary.revenue.toLocaleString()}`,
            change: 'All time',
            up: true,
            icon: DollarSign,
            color: 'hsl(219 90% 50%)',
            bg: 'rgba(59,130,246,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)] border-blue-500/10',
            sparklinePoints: [30, 45, 35, 60, 50, 75, 90],
        },
        {
            label: 'Check-ins Today',
            value: activeSummary.checkInsToday,
            change: 'Scheduled',
            up: true,
            icon: BedDouble,
            color: 'hsl(142 71% 45%)',
            bg: 'rgba(16,185,129,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(16,185,129,0.12)] border-emerald-500/10',
            sparklinePoints: [5, 8, 12, 6, 10, 15, 12],
        },
        {
            label: 'Pending Bookings',
            value: activeSummary.pendingBookings,
            change: 'Needs attention',
            up: false,
            icon: Clock,
            color: 'hsl(38 92% 50%)',
            bg: 'rgba(245,158,11,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(245,158,11,0.12)] border-amber-500/10',
            sparklinePoints: [2, 5, 8, 4, 3, 6, 5],
        },
        {
            label: 'Cancellations',
            value: activeSummary.cancellations,
            change: 'Recent',
            up: false,
            icon: XCircle,
            color: 'hsl(0 84% 60%)',
            bg: 'rgba(239,68,68,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(239,68,68,0.12)] border-rose-500/10',
            sparklinePoints: [0, 1, 3, 2, 1, 2, 2],
        },
        {
            label: 'Active Stays',
            value: activeSummary.activeStay,
            change: 'Guests in-house',
            up: true,
            icon: Users,
            color: 'hsl(262 83% 58%)',
            bg: 'rgba(139,92,246,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(139,92,246,0.12)] border-violet-500/10',
            sparklinePoints: [20, 25, 28, 30, 32, 35, 38],
        },
        {
            label: 'Check-outs Today',
            value: activeSummary.checkOutsToday,
            change: 'Rooms clearing',
            up: null,
            icon: CalendarDays,
            color: 'hsl(200 15% 45%)',
            bg: 'rgba(100,116,139,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(100,116,139,0.12)] border-slate-500/10',
            sparklinePoints: [4, 6, 5, 8, 10, 7, 8],
        },
        {
            label: 'ADR',
            value: `₹${activeSummary.adr.toLocaleString()}`,
            change: 'Avg Daily Rate',
            up: true,
            icon: DollarSign,
            color: 'hsl(292 84% 60%)',
            bg: 'rgba(168,85,247,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(168,85,247,0.12)] border-purple-500/10',
            sparklinePoints: [6000, 6200, 6100, 6400, 6600, 6700, 6850],
        },
        {
            label: 'RevPAR',
            value: `₹${activeSummary.revpar.toLocaleString()}`,
            change: 'Per Available Room',
            up: true,
            icon: TrendingUp,
            color: 'hsl(326 86% 55%)',
            bg: 'rgba(236,72,153,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(236,72,153,0.12)] border-pink-500/10',
            sparklinePoints: [4200, 4350, 4100, 4500, 4600, 4700, 4795],
        },
    ];

    const revenueChartData = activeSummary.revenueTrend;
    const recentBookings = activeSummary.recentBookings;

    return (
        <div className="min-h-full">
            <Topbar title="Dashboard Overview" subtitle="Welcome back, here's what's happening today" />
            <div className="p-6 md:p-8 space-y-6 md:space-y-8 animate-fadeIn max-w-[1600px] mx-auto">

                {/* Sub Header / Control panel widget */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-3xl bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl border border-border/10 gap-4">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Current Date</div>
                        <div className="text-sm font-extrabold text-foreground">{currentDate || 'Loading date...'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Demo Preview</span>
                        <label className="ios-switch">
                            <input 
                                type="checkbox" 
                                checked={isDemoMode}
                                onChange={(e) => setIsDemoMode(e.target.checked)}
                            />
                            <span className="ios-switch-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Stats Grid - iOS Widgets Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {stats.map((stat) => (
                        <div 
                            key={stat.label} 
                            className={`ios-platter p-5 rounded-[24px] flex flex-col justify-between hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.01)] border ${stat.glow}`}
                            style={{
                                background: 'linear-gradient(135deg, var(--card-bg-start, rgba(255,255,255,0.05)), var(--card-bg-end, rgba(255,255,255,0.02)))',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]" style={{ background: stat.bg }}>
                                    <stat.icon size={16} style={{ color: stat.color }} />
                                </div>
                                <Sparkline points={stat.sparklinePoints} color={stat.color} />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5">{stat.label}</div>
                                <div className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-none">
                                    <AnimatedNumber value={stat.value} />
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                                    <div className="text-[10px] font-bold" style={{ color: stat.up ? 'hsl(142 71% 45%)' : stat.up === null ? 'hsl(var(--muted-foreground))' : 'hsl(0 84% 60%)' }}>
                                        {stat.change}
                                    </div>
                                    {stat.up !== null && (
                                        <div className={`flex items-center gap-0.5 text-[10px] font-extrabold ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {stat.up ? '+' : '-'}
                                            {stat.up ? <ArrowUpRight size={10} className="stroke-[3.5]" /> : <ArrowDownRight size={10} className="stroke-[3.5]" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row - Apple Health/Summary Style */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="ios-sheet p-6 rounded-[28px] border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] xl:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground/60">Revenue & Bookings</h3>
                                <p className="text-2xl font-black tracking-tight text-foreground mt-1">₹{activeSummary.revenue.toLocaleString()}</p>
                            </div>
                            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">+18% vs last week</span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(219 90% 50%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(219 90% 50%)" stopOpacity={0} />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="5" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="hsl(219 90% 50%)" strokeWidth={4} fill="url(#colorRevenue)" filter="url(#glow)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Occupancy Summary Activity Ring */}
                    <div className="ios-sheet p-6 rounded-[28px] border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                        <div className="mb-6">
                            <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground/60">Occupancy Ring</h3>
                            <p className="text-xs text-muted-foreground font-semibold mt-1">Live guests in-house</p>
                        </div>
                        <div className="flex flex-col items-center justify-center h-[240px] space-y-5">
                            <div className="relative h-36 w-36">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#34d399" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                        <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#22d3ee" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                    {/* Outer Ring: Active Stays (Capacity 50) */}
                                    <circle className="stroke-black/5 dark:stroke-white/5" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                                    <circle className="stroke-[url(#emeraldGradient)]" strokeWidth="8" strokeDasharray={`${Math.min((activeSummary.activeStay / 50) * 251, 251)} 251`} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" style={{ filter: 'drop-shadow(0 2px 8px rgba(16,185,129,0.25))' }} />
                                    
                                    {/* Inner Ring: Check-ins Progress (Target 15) */}
                                    <circle className="stroke-black/5 dark:stroke-white/5" strokeWidth="8" fill="transparent" r="28" cx="50" cy="50" />
                                    <circle className="stroke-[url(#cyanGradient)]" strokeWidth="8" strokeDasharray={`${Math.min((activeSummary.checkInsToday / 15) * 175, 175)} 175`} strokeLinecap="round" fill="transparent" r="28" cx="50" cy="50" style={{ filter: 'drop-shadow(0 2px 6px rgba(6,180,212,0.25))' }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black tracking-tight text-foreground">{activeSummary.activeStay}</span>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Active Stays</span>
                                </div>
                            </div>
                            <div className="flex gap-4 text-[10px] font-bold">
                                <div className="flex items-center gap-1.5 text-emerald-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    <span>Occupancy ({Math.round((activeSummary.activeStay / 50) * 100)}%)</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-cyan-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                                    <span>Check-ins ({Math.round((activeSummary.checkInsToday / 15) * 100)}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings plist widget */}
                <div className="ios-sheet rounded-[28px] border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border/10 bg-black/[0.01] dark:bg-white/[0.01]">
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground/60">Recent Bookings</h3>
                        <Link href="/hotel/bookings" className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline no-underline">View All →</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/5 bg-black/[0.01] dark:bg-white/[0.01]">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reference</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Guest Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Room Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Check-in Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.length > 0 ? (
                                    recentBookings.map((b: any) => (
                                        <tr key={b.ref} className="border-b border-border/5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{b.ref}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-foreground">{b.guest}</td>
                                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{b.room}</td>
                                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{b.checkIn}</td>
                                            <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                                            <td className="px-6 py-4 text-xs font-bold text-foreground text-right">{b.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-xs font-bold text-muted-foreground">No recent bookings found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions Shortcuts */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                                className="ios-platter flex items-center gap-4 px-5 py-4 rounded-[22px] border border-border/10 hover:scale-[1.03] transition-all duration-300 ios-tap-scale shadow-[0_4px_15px_rgba(0,0,0,0.01)] no-underline"
                            >
                                <div className="p-2.5 rounded-full flex items-center justify-center shadow-inner" style={{ background: a.bg }}>
                                    <a.icon size={16} style={{ color: a.color }} />
                                </div>
                                <span className="text-xs font-bold text-foreground uppercase tracking-wider">{a.label}</span>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
}

