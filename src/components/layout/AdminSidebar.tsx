'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, Shield, LogOut, Hotel,
  Map, Bus, CarFront, ChevronDown, ChevronRight, Key, Bell
} from 'lucide-react';
import { useState } from 'react';
import { getAuthUser, logout } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAdminFilter } from '@/context/AdminFilterContext';

const adminNav = [
  {
    label: 'Global Intelligence',
    icon: LayoutDashboard,
    id: 'dashboard',
    permissionKey: 'global_dashboard',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/bookings', label: 'Master Bookings' },
      { href: '/admin/finance/ledger', label: 'Global Transactions' },
      { href: '/admin/consumer-users', label: 'All Consumers' },
      { href: '/admin/reports', label: 'Reports & Analytics' },
      { href: '/admin/cms', label: 'CMS Manager' },
    ],
  },
  {
    label: 'Hotel Operations',
    icon: Hotel,
    id: 'hotels',
    permissionKey: 'hotels_manage',
    items: [
      { href: '/admin/hotels', label: 'Profiles & Management' },
      { href: '/admin/hotels/bookings', label: 'Bookings' },
      { href: '/admin/hotels/rates', label: 'Rates & Pricing' },
      { href: '/admin/hotels/finance', label: 'Finance & Payments' },
      { href: '/admin/hotels/analytics', label: 'Analytics & Reports' },
      { href: '/admin/hotels/reviews', label: 'Reviews & Support' },
    ],
  },
  {
    label: 'Tour & Packages',
    icon: Map,
    id: 'tours',
    permissionKey: 'tours_manage',
    items: [
      { href: '/admin/packages', label: 'Profiles & Management' },
      { href: '/admin/packages/bookings', label: 'Bookings' },
      { href: '/admin/packages/rates', label: 'Rates & Pricing' },
      { href: '/admin/packages/finance', label: 'Finance & Payments' },
      { href: '/admin/packages/analytics', label: 'Analytics & Reports' },
      { href: '/admin/packages/reviews', label: 'Reviews & Support' },
    ],
  },
  {
    label: 'Bus Operations',
    icon: Bus,
    id: 'buses',
    permissionKey: 'buses_manage',
    items: [
      { href: '/admin/buses', label: 'Profiles & Management' },
      { href: '/admin/buses/bookings', label: 'Bookings' },
      { href: '/admin/buses/rates', label: 'Routes & Scheduling' },
      { href: '/admin/buses/finance', label: 'Finance & Payments' },
      { href: '/admin/buses/analytics', label: 'Analytics & Reports' },
    ],
  },
  {
    label: 'Cab Operations',
    icon: CarFront,
    id: 'cabs',
    permissionKey: 'cabs_manage',
    items: [
      { href: '/admin/cabs', label: 'Profiles & Management' },
      { href: '/admin/cabs/bookings', label: 'Bookings' },
      { href: '/admin/cabs/rates', label: 'Pricing & Availability' },
      { href: '/admin/cabs/finance', label: 'Finance & Payments' },
      { href: '/admin/cabs/analytics', label: 'Analytics & Reports' },
    ],
  },
  {
    label: 'Notifications',
    icon: Bell,
    id: 'notifications',
    permissionKey: 'global_dashboard',
    items: [
      { href: '/admin/notifications/push', label: 'Push Notifications' },
      { href: '/admin/notifications/sms', label: 'SMS' },
      { href: '/admin/notifications/email', label: 'Email Campaigns' },
      { href: '/admin/notifications/promotional', label: 'Promotional' },
      { href: '/admin/notifications/alerts', label: 'Booking Alerts' },
    ],
  },
  {
    label: 'System & Security',
    icon: Shield,
    id: 'system',
    permissionKey: 'users_manage',
    items: [
      { href: '/admin/users', label: 'Staff & Admin Access' },
      { href: '/admin/approvals', label: 'Vendor Approvals' },
      { href: '/admin/settings', label: 'Global Settings' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getAuthUser();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    hotels: true,
    tours: false,
    buses: false,
    cabs: false,
    notifications: false,
    system: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (!user) return null;

  const { serviceFilter } = useAdminFilter();

  const filteredNav = adminNav.filter(group => {
    const hasAccess =
      user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'superadmin' ||
      !group.permissionKey || user.permissions?.[group.permissionKey] === true;
    if (!hasAccess) return false;

    if (serviceFilter !== 'All') {
      if (group.id === 'dashboard' || group.id === 'system' || group.id === 'notifications') return true;
      if (serviceFilter === 'Hotel' && group.id !== 'hotels') return false;
      if (serviceFilter === 'Packages' && group.id !== 'tours') return false;
      if (serviceFilter === 'Buses' && group.id !== 'buses') return false;
      if (serviceFilter === 'Cabs' && group.id !== 'cabs') return false;
    }
    return true;
  });

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={18} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">TolidayTrip</span>
          <span className="sidebar-logo-sub">Management</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {filteredNav.map((group) => {
          const isExpanded = expandedSections[group.id];
          const isActiveGroup = group.items.some(
            item => pathname === item.href || pathname.startsWith(item.href + '/')
          );
          const GroupIcon = group.icon;

          return (
            <div key={group.id}>
              {/* Group header */}
              <button
                onClick={() => toggleSection(group.id)}
                className={`sidebar-item w-full ${isActiveGroup && !isExpanded ? 'active' : ''}`}
                style={{ justifyContent: 'flex-start' }}
              >
                <span className="sidebar-item-icon">
                  <GroupIcon size={16} />
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: '13.5px' }}>
                  {group.label}
                </span>
                {isExpanded
                  ? <ChevronDown size={13} style={{ opacity: 0.5 }} />
                  : <ChevronRight size={13} style={{ opacity: 0.5 }} />
                }
              </button>

              {/* Sub-items */}
              {isExpanded && (
                <div style={{ paddingBottom: 4 }}>
                  {group.items.map((item) => {
                    const bestMatch = group.items.reduce((best: any, cur) => {
                      if (pathname === cur.href || pathname.startsWith(cur.href + '/')) {
                        if (!best || cur.href.length > best.href.length) return cur;
                      }
                      return best;
                    }, null);
                    const isActive = bestMatch?.href === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-sub-item ${isActive ? 'active' : ''}`}
                      >
                        {isActive && (
                          <span className="sidebar-item-dot" style={{ marginLeft: 0, marginRight: 6 }} />
                        )}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          {user.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {user.role || 'Admin'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              padding: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'hsl(var(--muted-foreground))',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
