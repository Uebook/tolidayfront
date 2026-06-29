'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Building2, BedDouble, CalendarDays, DollarSign,
    BookOpen, Image, Users, Bell, BarChart3, HelpCircle, Settings,
    ChevronDown, Hotel, LogOut, Shield, Map, Package, Bus, MapPin, Star, Tag, CarFront
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { getAuthUser, logout } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem {
    href: string;
    icon: any;
    label: string;
    badge?: number;
    permission?: string;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const getNavGroups = (vertical: string): NavGroup[] => {
    const isTourOperator = vertical === '/packages';
    const isBusVendor = vertical === '/buses';
    const isCabVendor = vertical === '/cabs';
    const isAdmin = vertical === '/admin';

    if (isAdmin) {
        return [
            {
                label: 'Administration',
                items: [
                    { href: '/dashboard', icon: LayoutDashboard, label: 'Global Dashboard' },
                ],
            },
            {
                label: 'Partner Management',
                items: [
                    { href: '/hotels', icon: Hotel, label: 'Hotel Partners' },
                    { href: '/packages', icon: Package, label: 'Tour Partners' },
                ],
            },
            {
                label: 'Bookings & Logs',
                items: [
                    { href: '/bookings', icon: BookOpen, label: 'All Bookings' },
                    { href: '/logs', icon: BarChart3, label: 'System Logs' },
                ],
            },
            {
                label: 'Support & Users',
                items: [
                    { href: '/tickets', icon: HelpCircle, label: 'Support Tickets' },
                    { href: '/users', icon: Users, label: 'User Management' },
                    { href: '/settings', icon: Settings, label: 'Admin Settings' },
                ],
            },
        ];
    }

    if (isBusVendor) {
        return [
            {
                label: 'Overview',
                items: [
                    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard_view' },
                    { href: '/notifications', icon: Bell, label: 'Notifications', permission: 'notifications_view' },
                ],
            },
            {
                label: 'Fleet & Layout',
                items: [
                    { href: '/fleet', icon: Bus, label: 'Bus Fleet', permission: 'property_view' },
                    { href: '/crew', icon: Users, label: 'Crew Management', permission: 'property_view' },
                    { href: '/media', icon: Image, label: 'Media Gallery', permission: 'media_upload' },
                ],
            },
            {
                label: 'Operations',
                items: [
                    { href: '/routes-and-schedules', icon: MapPin, label: 'Routes & Trips', permission: 'inventory_edit' },
                    { href: '/yield-management', icon: DollarSign, label: 'Dynamic Yield', permission: 'inventory_edit' },
                    { href: '/bookings', icon: BookOpen, label: 'Bookings', permission: 'bookings_view' },
                    { href: '/manifest', icon: BarChart3, label: 'Trip Manifests', permission: 'bookings_view' },
                    { href: '/promotions', icon: Tag, label: 'Smart Promotions', permission: 'rates_edit' },
                ],
            },
            {
                label: 'Management',
                items: [
                    { href: '/staff', icon: Users, label: 'Staff Management', permission: 'staff_manage' },
                    { href: '/payments', icon: DollarSign, label: 'Payments', permission: 'payments_view' },
                    { href: '/reports', icon: BarChart3, label: 'Reports', permission: 'reports_view' },
                ],
            },
            {
                label: 'Account',
                items: [
                    { href: '/profile', icon: Users, label: 'Profile', permission: 'profile_view' },
                    { href: '/settings', icon: Settings, label: 'Settings', permission: 'settings_edit' },
                    { href: '/support', icon: HelpCircle, label: 'Support', permission: 'support_view' },
                ],
            },
        ];
    }

    if (isCabVendor) {
        return [
            {
                label: 'Overview',
                items: [
                    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard_view' },
                    { href: '/notifications', icon: Bell, label: 'Notifications', permission: 'notifications_view' },
                ],
            },
            {
                label: 'Fleet & Drivers',
                items: [
                    { href: '/fleet', icon: CarFront, label: 'Fleet Management', permission: 'property_view' },
                    { href: '/drivers', icon: Users, label: 'Driver Roster', permission: 'property_view' },
                ],
            },
            {
                label: 'Operations',
                items: [
                    { href: '/rates', icon: DollarSign, label: 'Rate Manager', permission: 'rates_edit' },
                    { href: '/bookings', icon: BookOpen, label: 'Bookings', permission: 'bookings_view' },
                    { href: '/promotions', icon: Tag, label: 'Smart Promotions', permission: 'rates_edit' },
                ],
            },
            {
                label: 'Management',
                items: [
                    { href: '/staff', icon: Users, label: 'Staff Management', permission: 'staff_manage' },
                    { href: '/payments', icon: DollarSign, label: 'Payments', permission: 'payments_view' },
                    { href: '/reports', icon: BarChart3, label: 'Reports', permission: 'reports_view' },
                ],
            },
            {
                label: 'Account',
                items: [
                    { href: '/profile', icon: Users, label: 'Profile', permission: 'profile_view' },
                    { href: '/settings', icon: Settings, label: 'Settings', permission: 'settings_edit' },
                    { href: '/support', icon: HelpCircle, label: 'Support', permission: 'support_view' },
                ],
            },
        ];
    }

    return [
        {
            label: 'Overview',
            items: [
                { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard_view' },
                { href: '/notifications', icon: Bell, label: 'Notifications', permission: 'notifications_view' },
            ],
        },
        {
            label: isTourOperator ? 'Inventory' : 'Property',
            items: isTourOperator ? [
                { href: '/listing', icon: Map, label: 'My Tours', permission: 'property_view' },
                { href: '/media', icon: Image, label: 'Media Gallery', permission: 'media_upload' },
            ] : [
                { href: '/property', icon: Building2, label: 'Property Details', permission: 'property_view' },
                { href: '/rooms', icon: BedDouble, label: 'Room Categories', permission: 'property_view' },
                { href: '/housekeeping', icon: Shield, label: 'Housekeeping', permission: 'property_view' },
                { href: '/media', icon: Image, label: 'Media Gallery', permission: 'media_upload' },
            ],
        },
        {
            label: 'Operations',
            items: [
                ...((isTourOperator) ? [] : [{ href: '/calendar', icon: CalendarDays, label: 'Reservation Calendar', permission: 'bookings_view' }]),
                ...((isTourOperator) ? [] : [{ href: '/inventory-console', icon: CalendarDays, label: 'Inventory Console', permission: 'inventory_edit' }]),
                ...((isTourOperator) ? [] : [{ href: '/rate-plans', icon: DollarSign, label: 'Rate Plans', permission: 'rates_edit' }]),
                ...((!isTourOperator) ? [] : [{ href: '/pricing-and-departures', icon: DollarSign, label: 'Pricing & Departures', permission: 'rates_edit' }]),
                { href: '/bookings', icon: BookOpen, label: 'Bookings', permission: 'bookings_view' },
                ...((isTourOperator || isBusVendor) ? [] : [{ href: '/reviews', icon: Star, label: 'Reviews', permission: 'bookings_view' }]),
                { href: '/promotions', icon: Tag, label: 'Smart Promotions', permission: 'rates_edit' },
            ],
        },
        {
            label: 'Management',
            items: [
                { href: '/staff', icon: Users, label: 'Staff Management', permission: 'staff_manage' },
                { href: '/payments', icon: DollarSign, label: 'Payments', permission: 'payments_view' },
                { href: '/reports', icon: BarChart3, label: 'Reports', permission: 'reports_view' },
            ],
        },
        {
            label: 'Account',
            items: [
                { href: '/profile', icon: Users, label: 'Profile', permission: 'profile_view' },
                { href: '/settings', icon: Settings, label: 'Settings', permission: 'settings_edit' },
                { href: '/support', icon: HelpCircle, label: 'Support', permission: 'support_view' },
            ],
        },
    ];
};

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        setUser(getAuthUser());
    }, []);

    const handleLogout = () => {
        logout();
        router.push(`${verticalPrefix}/login`);
    };

    // Determine the vertical prefix (e.g., /hotel, /cabs, /packages, /bus)
    const verticalPrefix = useMemo(() => {
        const parts = pathname.split('/');
        // The vertical is usually the second part: /hotel/... or /cabs/...
        return parts.length > 1 ? `/${parts[1]}` : '/hotel';
    }, [pathname]);

    const partnerId = user?.hotel_id || user?.tour_partner_id;

    // Fetch unread notification count
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', partnerId],
        queryFn: async () => {
            if (!partnerId) return [];
            const res = await api.get(`/notifications?partnerId=${partnerId}`);
            return res.data || [];
        },
        enabled: !!partnerId,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const unreadCount = useMemo(() => {
        if (!Array.isArray(notifications)) return 0;
        return notifications.filter((n: any) => !n.read).length;
    }, [notifications]);

    const navGroups = useMemo(() => {
        if (!user) return [];

        // OWNER and ADMIN still bypass, but MANAGER is now restricted by permissions
        const isOwnerOrAdmin = user.role === 'OWNER' || user.role === 'ADMIN';

        return getNavGroups(verticalPrefix).map((group: NavGroup) => ({
            ...group,
            items: group.items
                .filter((item: NavItem) => {
                    if (isOwnerOrAdmin) return true;
                    if (!item.permission) return true;
                    return !!user.permissions?.[item.permission];
                })
                .map((item: NavItem) => ({
                    ...item,
                    href: `${verticalPrefix}${item.href}`,
                    // Inject real unread count for notifications
                    badge: item.href === '/notifications' ? unreadCount : item.badge
                }))
        })).filter((group: any) => group.items.length > 0);
    }, [verticalPrefix, user, unreadCount]);

    return (
        <aside
            className="flex flex-col h-full rounded-[28px] border border-border/20 shadow-sm transition-all duration-300 ios-spring bg-white/45 dark:bg-slate-900/30 backdrop-blur-2xl"
            style={{
                width: collapsed ? '80px' : '260px',
            }}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 py-6 border-b border-border/10 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
                <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0 transition-transform hover:scale-105 active:scale-95 duration-300 cursor-pointer"
                    style={{
                        width: 40, height: 40,
                        background: 'linear-gradient(135deg, hsl(219 90% 50%), hsl(195 90% 45%))',
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)'
                    }}
                >
                    {verticalPrefix === '/packages' ? (
                        <Map size={20} color="white" />
                    ) : verticalPrefix === '/buses' ? (
                        <Bus size={20} color="white" />
                    ) : verticalPrefix === '/cabs' ? (
                        <CarFront size={20} color="white" />
                    ) : (
                        <Hotel size={20} color="white" />
                    )}
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-sm text-[hsl(var(--foreground))] tracking-tight leading-tight truncate">TolidayTrip</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'hsl(var(--accent))' }}>Extranet Portal</div>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${collapsed ? 'absolute -right-3 top-8 border border-border/20 bg-white dark:bg-slate-900 z-50 shadow-md' : 'ml-auto'}`}
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                    <ChevronDown
                        size={14}
                        className="transition-transform duration-300"
                        style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                    />
                </button>
            </div>

            {!collapsed && user && (
                <div className="mx-4 mt-4 px-4 py-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-border/10">
                    <div className="text-xs font-bold text-[hsl(var(--foreground))] truncate">{user.hotel_name || user.businessName || 'Business Name'}</div>
                    <div className="text-[10px] font-semibold mt-0.5 text-muted-foreground">
                        {(verticalPrefix === '/packages') ? 'Partner ID' : 'Hotel ID'}: <span className="font-mono">{user.hotel_id || user.tour_partner_id}</span>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
                {navGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                        {!collapsed && (
                            <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                                {group.label}
                            </div>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href} 
                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ios-spring ios-tap-scale no-underline ${
                                            isActive 
                                                ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)]' 
                                                : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                                        } ${collapsed ? 'justify-center px-0' : ''}`}
                                    >
                                        <item.icon size={18} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`} />
                                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                                        {!collapsed && item.badge && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-blue-600' : 'bg-blue-600/10 text-blue-600'}`}>{item.badge}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User footer */}
            <div className="p-3 border-t border-border/10 flex items-center gap-2">
                <Link href={`${verticalPrefix}/profile`} className="flex-1 flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors no-underline">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 shadow-sm text-white"
                        style={{ background: 'linear-gradient(135deg, hsl(219 90% 50%), hsl(195 90% 45%))' }}
                    >
                        {user ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    {!collapsed && user && (
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[hsl(var(--foreground))] truncate leading-none">{user.name}</div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 leading-none">{user.role}</div>
                        </div>
                    )}
                    {!collapsed && !user && (
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[hsl(var(--foreground))] truncate leading-none">Guest</div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 leading-none">Offline</div>
                        </div>
                    )}
                </Link>
                <div className="flex items-center gap-1">
                    {!collapsed && <ThemeToggle />}
                    <button
                        onClick={handleLogout}
                        className={`p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors ios-tap-scale ${collapsed ? 'mx-auto' : ''}`}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
