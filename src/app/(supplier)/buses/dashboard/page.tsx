'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
    TrendingUp, Users, Bus, ArrowUpRight, ArrowDownRight,
    Clock, CheckCircle2, AlertCircle, DollarSign,
    MapPin, Users2, LayoutGrid, FileText, ChevronRight, Activity, Wallet
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
        in_transit: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        completed: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${map[status.toLowerCase()] || 'bg-slate-100 text-slate-700'}`}>
            {status}
        </span>
    );
}

export default function BusDashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(getAuthUser());
    }, []);

    const { data: summary, isLoading } = useQuery({
        queryKey: ['bus-stats'],
        queryFn: async () => {
            const res = await api.get('/buses/stats');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Revenue",
            value: `₹${summary?.totalRevenue?.toLocaleString() || 0}`,
            icon: Wallet,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Total Buses',
            value: summary?.totalBuses || 0,
            icon: Bus,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            label: 'Tickets Sold',
            value: summary?.totalTickets || 0,
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            label: 'Active Trips',
            value: summary?.activeTrips || 0,
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        }
    ];

    const revenueChartData = summary?.revenueTrend || [
        { day: 'Mon', revenue: 45000 },
        { day: 'Tue', revenue: 52000 },
        { day: 'Wed', revenue: 48000 },
        { day: 'Thu', revenue: 61000 },
        { day: 'Fri', revenue: 55000 },
        { day: 'Sat', revenue: 72000 },
        { day: 'Sun', revenue: 68000 },
    ];

    const recentBookings = summary?.recentBookings || [];

    return (
        <div className="min-h-screen bg-slate-50">
            <Topbar title="Dashboard" subtitle={`Welcome back, ${user?.name || 'Administrator'}`} />
            <div className="p-8 space-y-8 animate-fadeIn max-w-[1600px] mx-auto">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" /> Revenue Analytics
                            </h3>
                            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueChartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <LayoutGrid size={20} className="text-blue-600" /> Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { label: 'Add New Trip', href: '/buses/routes-and-schedules', icon: MapPin, color: 'bg-blue-50 text-blue-600' },
                                { label: 'Fleet Manager', href: '/buses/fleet', icon: Bus, color: 'bg-green-50 text-green-600' },
                                { label: 'Manage Crew', href: '/buses/crew', icon: Users2, color: 'bg-orange-50 text-orange-600' },
                                { label: 'View Reports', href: '/buses/reports', icon: FileText, color: 'bg-purple-50 text-purple-600' },
                            ].map((action, i) => (
                                <Link key={i} href={action.href} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${action.color}`}>
                                            <action.icon size={18} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{action.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
                        <Link href="/buses/bookings" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PNR</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Seats</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentBookings.length > 0 ? (
                                    recentBookings.map((b: any) => (
                                        <tr key={b.pnr || b.ref} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-4 font-mono text-sm font-bold text-blue-600">{b.pnr || b.ref}</td>
                                            <td className="px-8 py-4">
                                                <div className="text-sm font-bold text-slate-900">{b.passenger || b.guest}</div>
                                            </td>
                                            <td className="px-8 py-4 text-sm text-slate-600">{b.route || 'Delhi → Manali'}</td>
                                            <td className="px-8 py-4 font-mono text-xs text-slate-500">{b.seats || 'L1, L2'}</td>
                                            <td className="px-8 py-4"><StatusBadge status={b.status} /></td>
                                            <td className="px-8 py-4 font-bold text-slate-900">₹{b.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-sm">
                                            No recent bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
