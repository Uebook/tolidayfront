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
                { href: '/media', icon: Image, label: 'Media Gallery', permission: 'media_upload' },
            ],
        },
        {
            label: 'Operations',
            items: [
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
            className="flex flex-col h-screen sticky top-0 transition-all duration-300"
            style={{
                width: collapsed ? '80px' : '280px',
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--glass-border)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '1px 0 20px var(--glass-shadow)'
            }}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 py-6 border-b ${collapsed ? 'justify-center px-0' : 'px-5'}`} style={{ borderColor: 'var(--glass-border)' }}>
                <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                        width: 42, height: 42,
                        background: 'linear-gradient(135deg, hsl(228 80% 55%), hsl(195 90% 45%))',
                        boxShadow: '0 4px 15px rgba(20, 80, 255, 0.3)'
                    }}
                >
                    {verticalPrefix === '/packages' ? (
                        <Map size={22} color="white" />
                    ) : verticalPrefix === '/buses' ? (
                        <Bus size={22} color="white" />
                    ) : verticalPrefix === '/cabs' ? (
                        <CarFront size={22} color="white" />
                    ) : (
                        <Hotel size={22} color="white" />
                    )}
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[hsl(var(--foreground))] leading-tight truncate">TolidayTrip</div>
                        <div className="text-xs truncate" style={{ color: 'hsl(var(--accent))' }}>Extranet Portal</div>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-1 rounded-lg hover:bg-[var(--table-header)] dark:hover:bg-[var(--table-header)] transition-colors ${collapsed ? 'absolute -right-3 top-8 border z-50 shadow-xl' : 'ml-auto'}`}
                    style={{ color: 'hsl(var(--muted-foreground))', backgroundColor: collapsed ? 'hsl(var(--card))' : 'transparent', borderColor: collapsed ? 'var(--glass-border)' : 'transparent' }}
                >
                    <ChevronDown
                        size={16}
                        className="transition-transform"
                        style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                    />
                </button>
            </div>

            {!collapsed && user && (
                <div className="mx-3 mt-3 px-3 py-2 rounded-lg" style={{ background: 'var(--table-header)', border: '1px solid var(--glass-border)' }}>
                    <div className="text-xs font-medium text-[hsl(var(--foreground))] truncate">{user.hotel_name || user.businessName || 'Business Name'}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {(verticalPrefix === '/packages') ? 'Partner ID' : 'Hotel ID'}: {user.hotel_id || user.tour_partner_id}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <div className="px-3 mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(222 25% 40%)' }}>
                                {group.label}
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}>
                                        <item.icon size={18} className="flex-shrink-0" />
                                        {!collapsed && <span className="flex-1">{item.label}</span>}
                                        {!collapsed && item.badge && (
                                            <span className="badge badge-accent text-xs">{item.badge}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User footer */}
            <div className="p-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--glass-border)' }}>
                <Link href={`${verticalPrefix}/profile`} className="flex-1 flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--table-header)] dark:hover:bg-[var(--table-header)] cursor-pointer transition-colors no-underline">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg text-[hsl(var(--foreground))]"
                        style={{ background: 'linear-gradient(135deg, hsl(225 70% 55%), hsl(199 89% 48%))' }}
                    >
                        {user ? user.name.charAt(0) : '?'}
                    </div>
                    {!collapsed && user && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{user.name}</div>
                            <div className="text-xs capitalize" style={{ color: 'hsl(var(--muted-foreground))' }}>{user.role}</div>
                        </div>
                    )}
                    {!collapsed && !user && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[hsl(var(--foreground))] truncate">Guest</div>
                            <div className="text-xs capitalize" style={{ color: 'hsl(var(--muted-foreground))' }}>Unauthenticated</div>
                        </div>
                    )}
                </Link>
                <div className="flex items-center gap-1">
                    {!collapsed && <ThemeToggle />}
                    <button
                        onClick={handleLogout}
                        className={`p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors ${collapsed ? 'mx-auto' : ''}`}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
