'use client';

import React from 'react';
import { 
       Activity, TrendingUp, Users, IndianRupee, 
       Building2, Map, Bus, CarFront, Download, ArrowUpRight,
       DollarSign, Clock, CalendarDays, ArrowDownRight, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { useAdminFilter } from '@/context/AdminFilterContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

function AnimatedNumber({ value }: { value: number | string }) {
    return <span>{value}</span>;
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

export default function SuperDashboardPage() {
    const { serviceFilter } = useAdminFilter();

    const { data: dbStats, isLoading } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/admin/stats');
            return res.data;
        }
    });

    const formatCurrency = (val: number) => {
        if (!val) return '₹0';
        if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toLocaleString()}`;
    };

    const formatNumber = (val: number) => {
        if (!val) return '0';
        return val.toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Analytics...</span>
                </div>
            </div>
        );
    }

    const rev = dbStats?.revenue || {};
    const bookings = dbStats?.bookingsCount || {};
    const consumers = dbStats?.consumersCount || {};

    const getFilterData = () => {
        if (serviceFilter === 'Hotel') {
            return {
                tgv: formatCurrency(rev.hotels),
                bookings: formatNumber(bookings.hotels),
                consumers: formatNumber(consumers.hotels),
                revenue: formatCurrency(rev.hotels * 0.15),
                sparklines: [
                    [15, 20, 18, 30, 25, 38, 45],
                    [20, 35, 50, 25, 40, 60, 50],
                    [100, 120, 135, 115, 110, 125, 120],
                    [10, 12, 14, 15, 16, 17, 19]
                ]
            };
        }
        if (serviceFilter === 'Packages') {
            return {
                tgv: formatCurrency(rev.packages),
                bookings: formatNumber(bookings.packages),
                consumers: formatNumber(consumers.packages),
                revenue: formatCurrency(rev.packages * 0.15),
                sparklines: [
                    [10, 15, 12, 20, 18, 25, 30],
                    [15, 25, 35, 20, 30, 45, 40],
                    [60, 75, 85, 70, 65, 80, 75],
                    [6, 8, 9, 10, 11, 12, 13]
                ]
            };
        }
        if (serviceFilter === 'Buses') {
            return {
                tgv: formatCurrency(rev.buses),
                bookings: formatNumber(bookings.buses),
                consumers: formatNumber(consumers.buses),
                revenue: formatCurrency(rev.buses * 0.15),
                sparklines: [
                    [5, 8, 6, 10, 8, 12, 15],
                    [10, 18, 25, 15, 20, 30, 28],
                    [30, 40, 45, 35, 30, 42, 38],
                    [2, 3, 4, 4, 5, 5, 6]
                ]
            };
        }
        if (serviceFilter === 'Cabs') {
            return {
                tgv: formatCurrency(rev.cabs),
                bookings: formatNumber(bookings.cabs),
                consumers: formatNumber(consumers.cabs),
                revenue: formatCurrency(rev.cabs * 0.15),
                sparklines: [
                    [3, 5, 4, 6, 5, 8, 10],
                    [5, 10, 15, 10, 12, 18, 16],
                    [15, 20, 22, 18, 16, 22, 20],
                    [1, 1, 2, 2, 2, 3, 3]
                ]
            };
        }

        // All
        return {
            tgv: formatCurrency(rev.total),
            bookings: formatNumber(bookings.total),
            consumers: formatNumber(consumers.total),
            revenue: formatCurrency(rev.total * 0.15),
            sparklines: [
                [30, 45, 35, 60, 50, 75, 90],
                [50, 80, 120, 60, 100, 150, 120],
                [200, 250, 280, 240, 230, 260, 250],
                [20, 25, 28, 30, 32, 35, 38]
            ]
        };
    };

    const currentData = getFilterData();

    const stats = [
        {
            label: "Total Gross Volume (TGV)",
            value: currentData.tgv,
            change: 'All time',
            up: true,
            icon: DollarSign,
            color: 'hsl(219 90% 50%)',
            bg: 'rgba(59,130,246,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)] border-blue-500/10',
            sparklinePoints: currentData.sparklines[0],
        },
        {
            label: 'Total Bookings',
            value: currentData.bookings,
            change: 'Network wide',
            up: true,
            icon: CheckCircle2,
            color: 'hsl(142 71% 45%)',
            bg: 'rgba(16,185,129,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(16,185,129,0.12)] border-emerald-500/10',
            sparklinePoints: currentData.sparklines[1],
        },
        {
            label: 'Active Consumers',
            value: currentData.consumers,
            change: 'Growing',
            up: true,
            icon: Users,
            color: 'hsl(38 92% 50%)',
            bg: 'rgba(245,158,11,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(245,158,11,0.12)] border-amber-500/10',
            sparklinePoints: currentData.sparklines[2],
        },
        {
            label: 'Net Platform Revenue',
            value: currentData.revenue,
            change: 'Calculated from 15% flat commission',
            up: true,
            icon: Activity,
            color: 'hsl(262 83% 58%)',
            bg: 'rgba(139,92,246,0.08)',
            glow: 'hover:shadow-[0_12px_30px_rgba(139,92,246,0.12)] border-violet-500/10',
            sparklinePoints: currentData.sparklines[3],
        }
    ];

    const verticalData = [
        { name: 'Hotel Operations', filterKey: 'Hotel', icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', rev: formatCurrency(rev.hotels), bookings: formatNumber(bookings.hotels) },
        { name: 'Tour Operations', filterKey: 'Packages', icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', rev: formatCurrency(rev.packages), bookings: formatNumber(bookings.packages) },
        { name: 'Bus Operations', filterKey: 'Buses', icon: Bus, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', rev: formatCurrency(rev.buses), bookings: formatNumber(bookings.buses) },
        { name: 'Cab Operations', filterKey: 'Cabs', icon: CarFront, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', rev: formatCurrency(rev.cabs), bookings: formatNumber(bookings.cabs) },
    ];
    
    return (
        <div className="min-h-full">
            <Topbar title="Super Dashboard" subtitle="Global Intelligence and Platform-wide overview" />
            <div className="p-6 md:p-8 space-y-6 md:space-y-8 animate-fadeIn max-w-[1600px] mx-auto">

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
                                    <div className="text-[10px] font-bold text-muted-foreground">
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

                {/* Vertical Performance Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vertical Performance Widget */}
                    <div className="ios-sheet p-6 rounded-[28px] border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground/60">Vertical Performance</h3>
                        </div>
                        <div className="divide-y divide-border/5">
                            {verticalData
                            .filter(vert => serviceFilter === 'All' || vert.filterKey === serviceFilter)
                            .map((vert, i) => (
                                <div key={i} className="flex items-center justify-between py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors rounded-xl px-2">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${vert.bg} ${vert.color}`}>
                                            <vert.icon size={20} />
                                        </div>
                                        <div>
                                            <div className="font-black text-foreground text-sm">{vert.name}</div>
                                            <div className="text-xs font-bold text-muted-foreground mt-0.5">{vert.bookings} Bookings</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-foreground">{vert.rev}</div>
                                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
                                            <TrendingUp size={10} /> Growing
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Health Widget */}
                    <div className="ios-sheet p-6 rounded-[28px] border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] relative overflow-hidden bg-indigo-600 dark:bg-indigo-900/50">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity size={200} className="text-white" />
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">System Health & Live Events</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between bg-white/10 dark:bg-black/20 p-4 rounded-2xl backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                    <span className="font-bold text-sm text-white">Booking API Node 1</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Operational</span>
                            </div>
                            <div className="flex items-center justify-between bg-white/10 dark:bg-black/20 p-4 rounded-2xl backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                    <span className="font-bold text-sm text-white">Payment Gateway (Stripe)</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Operational</span>
                            </div>
                            <div className="flex items-center justify-between bg-white/10 dark:bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-amber-500/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                    <span className="font-bold text-sm text-white">Redis Caching Layer</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">High Load</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

