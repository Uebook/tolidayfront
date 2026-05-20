'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { CarFront, Users, MapPin, DollarSign, TrendingUp, ChevronRight, Activity, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function CabsDashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(getAuthUser());
    }, []);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['cab-stats'],
        queryFn: async () => {
            const res = await api.get('/cabs/stats');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const cards = [
        { 
            label: 'Total Fleet', 
            value: stats?.totalVehicles || 0, 
            icon: CarFront, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
        },
        { 
            label: 'Ongoing Trips', 
            value: stats?.activeBookings || 0, 
            icon: MapPin, 
            color: 'text-green-600', 
            bg: 'bg-green-50' 
        },
        { 
            label: 'Drivers', 
            value: stats?.totalDrivers || 0, 
            icon: Users, 
            color: 'text-orange-600', 
            bg: 'bg-orange-50' 
        },
        { 
            label: 'Revenue', 
            value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, 
            icon: Wallet, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Topbar title="Cab Agency Dashboard" subtitle={`Welcome, ${user?.name || 'Administrator'}`} />
            <div className="p-8 space-y-8 animate-fadeIn max-w-[1600px] mx-auto">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                            <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Operational Health */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <CheckCircle2 className="text-green-600" size={20} /> Fleet Utilization
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Utilization Rate</span>
                                        <span className="font-bold text-green-600">{(stats?.activeBookings / (stats?.totalVehicles || 1) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-600" style={{ width: `${(stats?.activeBookings / (stats?.totalVehicles || 1) * 100)}%` }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { label: 'Total Bookings', val: stats?.totalBookings, color: 'text-blue-600' },
                                        { label: 'Completed Trips', val: stats?.completedBookings, color: 'text-green-600' }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                                            <span className={`text-sm font-bold ${stat.color}`}>{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Link href="/cabs/bookings" className="mt-8 flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                                View Booking History <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Shortcuts</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/cabs/fleet" className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group">
                                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <CarFront size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">Add Vehicle</span>
                                </Link>
                                <Link href="/cabs/rates" className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group">
                                    <div className="p-2 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <DollarSign size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">Update Rates</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Performance */}
                    <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={20} /> Revenue Performance
                            </h3>
                            <button className="text-sm font-bold text-blue-600 hover:underline">Download Statement</button>
                        </div>
                        
                        <div className="flex-1 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 p-12">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <Wallet size={32} className="text-blue-600" />
                            </div>
                            <h4 className="text-4xl font-bold text-slate-900 mb-2">₹{(stats?.totalRevenue || 0).toLocaleString()}</h4>
                            <p className="text-sm font-medium text-slate-500 text-center max-w-sm">
                                Total revenue generated from {stats?.completedBookings} completed trips.
                            </p>
                            <div className="mt-8 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-2">
                                <TrendingUp size={14} /> Growing steadily
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
