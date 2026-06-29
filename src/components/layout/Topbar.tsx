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
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border-b border-border/10">
            <div className="animate-fadeIn">
                <h1 className="text-lg font-extrabold text-foreground tracking-tight leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block group">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
                    <input
                        placeholder="Search..."
                        className="w-64 bg-black/[0.03] dark:bg-white/[0.04] border border-border/10 rounded-full pl-10 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all duration-300"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-transparent hover:border-border/10 active:scale-95 duration-200">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 animate-pulse" />
                    )}
                </button>

                {/* User Profile */}
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl border transition-all duration-300 ios-tap-scale ${isProfileOpen ? 'bg-black/5 dark:bg-white/5 border-border/20 shadow-inner' : 'bg-transparent border-border/10 hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                            {user ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="hidden lg:block text-left">
                            <div className="text-xs font-bold text-foreground leading-none">{user ? user.name : 'User'}</div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 leading-none">{user ? user.role : 'Guest'}</div>
                        </div>
                        <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                            <div className="absolute right-0 mt-2 w-60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-border/15 shadow-xl py-2 animate-scaleIn overflow-hidden z-50">
                                <div className="px-4 py-3 bg-black/[0.01] dark:bg-white/[0.01] border-b border-border/10">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Signed in as</p>
                                    <p className="text-xs font-bold text-foreground truncate mt-1">{user?.email || 'user@example.com'}</p>
                                </div>

                                <div className="p-1.5 space-y-0.5">
                                    <Link 
                                        href={`${verticalPrefix}/profile`}
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-blue-600 hover:text-white transition-all duration-200 font-bold no-underline"
                                    >
                                        <User size={14} /> My Profile
                                    </Link>
                                    <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-blue-600 hover:text-white transition-all duration-200 font-bold">
                                        <Settings size={14} /> Account Settings
                                    </button>
                                    <div className="h-px bg-border/10 my-1.5 mx-2" />
                                    <button 
                                        onClick={() => logout()}
                                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-500/10 transition-all duration-200 font-bold"
                                    >
                                        <LogOut size={14} /> Logout
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
