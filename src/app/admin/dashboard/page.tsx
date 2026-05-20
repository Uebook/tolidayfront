'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
    Search, Bell, Settings, Zap, 
    TrendingUp, Users, DollarSign, 
    Calendar as CalendarIcon, 
    ArrowUpRight, Clock,
    CheckCircle2,
    Package,
    Building2,
    Bus,
    Car
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import { useState } from 'react';

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await api.get('/admin/stats');
            return res.data;
        },
        refetchInterval: 30000 
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={20} />
                </div>
            </div>
        );
    }

    const COLORS = ['#0ea5e9', '#d946ef', '#f59e0b', '#10b981'];
    
    const revenueData = [
        { name: 'Hotels', value: stats?.revenue?.hotels || 0 },
        { name: 'Packages', value: stats?.revenue?.packages || 0 },
        { name: 'Buses', value: stats?.revenue?.buses || 0 },
        { name: 'Cabs', value: stats?.revenue?.cabs || 0 },
    ];

    const leaderboardData = [
        { name: 'Hotels', value: stats?.counts?.hotels || 0, color: '#f43f5e' },
        { name: 'Packages', value: stats?.counts?.packages || 0, color: '#06b6d4' },
        { name: 'Buses', value: stats?.counts?.buses || 0, color: '#3b82f6' },
        { name: 'Cabs', value: stats?.counts?.cabs || 0, color: '#10b981' },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fadeIn max-w-[1600px] mx-auto bg-[#f8fbff]">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        Welcome Back, Admin <span className="animate-bounce">👋</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Here's what's happening across your platform today.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search everything..." 
                            className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold w-full sm:w-64 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-600/30 transition-all shadow-sm">
                            <Bell size={20} />
                        </button>
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-600/30 transition-all shadow-sm">
                            <Settings size={20} />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 overflow-hidden border-2 border-white shadow-lg ml-2 shrink-0">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff" alt="Profile" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Grid: Trends and Quick Fund */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Trends Chart */}
                <div className="xl:col-span-8 bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Trends</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Global Platform Performance</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none w-fit">
                            <option>Weekly</option>
                            <option>Monthly</option>
                        </select>
                    </div>
                    
                    <div className="h-[300px] md:h-[350px] w-full">
                        {stats?.trends && stats.trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trends}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                                        tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                        formatter={(val: any) => [val ? `₹${Number(val).toLocaleString()}` : '₹0', 'Revenue']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#d946ef" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorRev)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                                <Zap size={48} className="opacity-10" />
                                <span className="text-xs font-black uppercase tracking-widest">Awaiting trend data...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="xl:col-span-4 bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Financial Summary</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-600/20">
                            <div className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2">Total Revenue</div>
                            <div className="text-2xl font-black">₹{(stats?.revenue?.total || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-rose-500 rounded-[2rem] p-6 text-white shadow-lg shadow-rose-500/20">
                            <div className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2">Pending Payouts</div>
                            <div className="text-2xl font-black">₹240,500</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-[-8px] mb-10 overflow-hidden px-2">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-100 first:ml-0 -ml-3 shadow-sm">
                                <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="avatar" />
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 -ml-3 z-10 shadow-sm">
                            +12
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Platform Share</div>
                                <div className="text-sm font-black text-blue-600">12.5% Commission</div>
                            </div>
                            <TrendingUp className="text-blue-600" size={20} />
                        </div>
                        <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/10">
                            Process Settlements <ArrowUpRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle Grid: Leaderboard, Distribution, Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-8">
                {/* Leaderboard */}
                <div className="xl:col-span-4 bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Vertical Volume</h2>
                    <div className="h-[250px] w-full flex items-end justify-between gap-2 md:gap-4 px-2">
                        {leaderboardData.map((item, i) => {
                            const maxHeight = 200;
                            const maxVal = Math.max(...leaderboardData.map(d => d.value), 1);
                            const height = (item.value / maxVal) * maxHeight;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="relative w-full flex flex-col items-center">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black whitespace-nowrap z-20">
                                            {item.value} Units
                                        </div>
                                        <div 
                                            className="w-full max-w-[40px] rounded-2xl transition-all duration-1000 ease-out shadow-lg group-hover:scale-x-110 origin-bottom"
                                            style={{ height: `${Math.max(height, 20)}px`, backgroundColor: item.color }}
                                        />
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white shadow-xl flex items-center justify-center absolute -bottom-5 border border-slate-50 overflow-hidden">
                                            {item.name === 'Hotels' && <Building2 size={16} className="text-rose-500" />}
                                            {item.name === 'Packages' && <Package size={16} className="text-cyan-500" />}
                                            {item.name === 'Buses' && <Bus size={16} className="text-blue-500" />}
                                            {item.name === 'Cabs' && <Car size={16} className="text-emerald-500" />}
                                        </div>
                                    </div>
                                    <div className="mt-6 text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{item.name}</div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="w-full mt-10 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">Show Advanced Analytics</button>
                </div>

                {/* Donut Chart */}
                <div className="xl:col-span-3 bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Revenue Flow</h2>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+14.2% GROWTH</p>
                    
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={revenueData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={200}
                                >
                                    {revenueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                                ₹{(stats?.revenue?.total || 0) >= 1000 ? ((stats?.revenue?.total || 0) / 1000).toFixed(1) + 'k' : (stats?.revenue?.total || 0)}
                            </div>
                            <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sales</div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {revenueData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schedule / System Events */}
                <div className="xl:col-span-5 bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Events</h2>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 flex items-center gap-2">
                                <CalendarIcon size={12} /> Apr 2026
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 group hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm group-hover:bg-blue-500 group-hover:text-white">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm mb-1 group-hover:text-white transition-colors">Partner Verification Sync</h4>
                                        <p className="text-[10px] font-bold text-slate-500 group-hover:text-blue-100">02:00 - 03:40 PM • System Core</p>
                                    </div>
                                </div>
                                <div className="flex -space-x-2">
                                    <img src="https://i.pravatar.cc/100?u=11" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                                    <img src="https://i.pravatar.cc/100?u=12" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 group hover:bg-amber-600 hover:text-white transition-all cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white text-amber-600 rounded-2xl shadow-sm group-hover:bg-amber-500 group-hover:text-white">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm mb-1 group-hover:text-white transition-colors">Weekly Payout Processing</h4>
                                        <p className="text-[10px] font-bold text-slate-500 group-hover:text-amber-100">04:30 - 05:00 PM • Finance API</p>
                                    </div>
                                </div>
                                <div className="flex -space-x-2">
                                    <img src="https://i.pravatar.cc/100?u=13" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center text-[10px] font-black text-amber-500 shadow-sm">+4</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Workforce and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Workforce Overview */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Workforce Overview</h2>
                    
                    <div className="flex-1 flex flex-col justify-between space-y-10">
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden flex p-1 border border-slate-100 shadow-inner">
                                <div className="h-full bg-blue-500 rounded-full shadow-lg shadow-blue-500/20" style={{ width: '50%' }} />
                                <div className="h-full bg-purple-500 rounded-full shadow-lg shadow-purple-500/20 ml-1" style={{ width: '30%' }} />
                                <div className="h-full bg-rose-500 rounded-full shadow-lg shadow-rose-500/20 ml-1" style={{ width: '20%' }} />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Time</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-slate-900">500 <span className="text-sm font-bold text-slate-300 ml-1">75%</span></div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contract</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-slate-900">200 <span className="text-sm font-bold text-slate-300 ml-1">15%</span></div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trial</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-slate-900">100 <span className="text-sm font-bold text-slate-300 ml-1">10%</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-between group cursor-pointer hover:bg-indigo-600 transition-all shadow-sm">
                                <div>
                                    <div className="text-[10px] font-black text-indigo-400 group-hover:text-indigo-100 uppercase tracking-widest mb-1">Admin Operations</div>
                                    <div className="text-xl md:text-2xl font-black text-indigo-900 group-hover:text-white">Active Sessions</div>
                                </div>
                                <button className="p-4 bg-indigo-600 group-hover:bg-white text-white group-hover:text-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-90">
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-between group cursor-pointer hover:bg-emerald-600 transition-all shadow-sm">
                                <div>
                                    <div className="text-[10px] font-black text-emerald-400 group-hover:text-emerald-100 uppercase tracking-widest mb-1">System Health</div>
                                    <div className="text-xl md:text-2xl font-black text-emerald-900 group-hover:text-white">99.9% Uptime</div>
                                </div>
                                <button className="p-4 bg-emerald-600 group-hover:bg-white text-white group-hover:text-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-90">
                                    <Zap size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recently Complete / Activity Log */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight ml-4">Recently complete</h2>
                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
                        {stats?.activity && stats.activity.length > 0 ? (
                            stats.activity.map((item: any, i: number) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 group hover:scale-[1.02] transition-all cursor-default">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            item.type === 'BOOKING' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                                        }`}>
                                            {item.type}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tight">
                                            <Clock size={12} /> {new Date(item.time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
                                        {item.user}
                                        {item.type === 'BOOKING' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                    </h3>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{item.action}</p>
                                    {item.amount && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-sm font-black text-slate-900">₹{Number(item.amount).toLocaleString()}</div>
                                            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">VERIFIED</div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-lg text-center flex flex-col items-center gap-4">
                                <Clock size={40} className="text-slate-100" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No recent activities</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
