'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { 
    TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, 
    Download, Filter, DollarSign, Package, Users, 
    ArrowRight, PieChart, BarChart3, Info
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
    Tooltip, CartesianGrid, AreaChart, Area 
} from 'recharts';
import api from '@/lib/api';

const MOCK_CHART_DATA = [
    { name: 'Jan', revenue: 45000, bookings: 12 },
    { name: 'Feb', revenue: 52000, bookings: 15 },
    { name: 'Mar', revenue: 48000, bookings: 14 },
    { name: 'Apr', revenue: 61000, bookings: 19 },
    { name: 'May', revenue: 55000, bookings: 17 },
    { name: 'Jun', revenue: 67000, bookings: 22 },
];

export default function SalesReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('monthly');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            // Reusing the summary endpoint for now, or could create a specific reports one
            const res = await api.get('/packages/stats/summary');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <Topbar 
                title="Sales & Analytics" 
                subtitle="Track your revenue, booking trends and growth performance"
            />

            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-widest hover:border-black transition-all">
                            Export PDF
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-widest hover:border-black transition-all">
                            Download CSV
                        </button>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setTimeframe(t.toLowerCase())}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    timeframe === t.toLowerCase() 
                                        ? 'bg-black text-white shadow-lg' 
                                        : 'text-slate-500 hover:text-black'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-emerald-600 font-black text-xs">
                                +12.5% <ArrowUpRight size={14} />
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Revenue</p>
                            <h3 className="text-3xl font-black mt-1">₹{stats?.revenue?.toLocaleString() || '0'}</h3>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Package size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-blue-600 font-black text-xs">
                                +8.2% <ArrowUpRight size={14} />
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Bookings</p>
                            <h3 className="text-3xl font-black mt-1">{stats?.activeBookings + stats?.completedBookings || '0'}</h3>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-slate-500 font-black text-xs italic">
                                Stable <ArrowRight size={14} />
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversion Rate</p>
                            <h3 className="text-3xl font-black mt-1">4.2%</h3>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                                <ArrowDownRight size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-red-600 font-black text-xs">
                                -2.1% <ArrowDownRight size={14} />
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cancellation Rate</p>
                            <h3 className="text-3xl font-black mt-1">1.8%</h3>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Growth */}
                    <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <TrendingUp className="text-blue-600" /> Revenue Growth
                            </h3>
                            <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                <Filter size={18} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_CHART_DATA}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Booking Trends */}
                    <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <BarChart3 className="text-black" /> Booking Volume
                            </h3>
                            <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                <Info size={18} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_CHART_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="bookings" fill="#000" radius={[8, 8, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Top Packages Table */}
                <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-xl font-black">Top Performing Packages</h3>
                        <PieChart size={20} className="text-slate-400" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Package Name</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Bookings</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Revenue Generated</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Growth</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { name: 'Kashmir Paradise Tour', bookings: 124, revenue: '₹5,58,000', growth: '+14%' },
                                    { name: 'Himachal Adventure 7D/6N', bookings: 98, revenue: '₹4,41,000', growth: '+8%' },
                                    { name: 'Kerala Backwaters Magic', bookings: 86, revenue: '₹3,87,000', growth: '+11%' },
                                ].map((pkg, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6">
                                            <p className="font-black text-sm text-black">{pkg.name}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-sm text-black">{pkg.bookings}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-sm text-black">{pkg.revenue}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100">
                                                {pkg.growth}
                                            </span>
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
