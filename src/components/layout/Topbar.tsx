'use client';

import { Bell, Search, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { getAuthUser, logout } from '@/lib/auth';

interface TopbarProps {
    title: string;
    subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setUser(getAuthUser());
    }, []);

    const verticalPrefix = useMemo(() => {
        const parts = pathname.split('/');
        return parts.length > 1 ? `/${parts[1]}` : '/hotel';
    }, [pathname]);

    const hotelId = user?.hotel_id;

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', hotelId],
        queryFn: async () => {
            if (!hotelId) return [];
            const res = await api.get(`/notifications?hotelId=${hotelId}`);
            return res.data || [];
        },
        enabled: !!hotelId,
        refetchInterval: 30000,
    });

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
            <div className="animate-fadeIn">
                <h1 className="text-xl font-bold text-slate-900 leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search..."
                        className="w-64 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border-2 border-white" />
                    )}
                </button>

                {/* User Profile */}
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-lg border transition-all ${isProfileOpen ? 'bg-slate-50 border-slate-300 shadow-inner' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {user ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="hidden lg:block text-left">
                            <div className="text-sm font-bold text-slate-900 leading-none">{user ? user.name : 'User'}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{user ? user.role : 'Guest'}</div>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-2 animate-scaleIn overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                                </div>

                                <div className="p-1">
                                    <Link 
                                        href={`${verticalPrefix}/profile`}
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-medium"
                                    >
                                        <User size={16} /> My Profile
                                    </Link>
                                    <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-medium">
                                        <Settings size={16} /> Account Settings
                                    </button>
                                    <div className="h-px bg-slate-100 my-1 mx-2" />
                                    <button 
                                        onClick={() => logout()}
                                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-all font-bold"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
