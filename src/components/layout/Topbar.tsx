'use client';

import { Bell, Moon, Sun, ChevronDown, User, LogOut, Settings, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { getAuthUser, logout } from '@/lib/auth';
import { useTheme } from 'next-themes';

import { useAdminFilter } from '@/context/AdminFilterContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { serviceFilter, setServiceFilter } = useAdminFilter();

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.hotel_id],
    queryFn: async () => {
      if (!user?.hotel_id) return [];
      const res = await api.get(`/notifications?hotelId=${user.hotel_id}`);
      return res.data || [];
    },
    enabled: !!user?.hotel_id,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <header className="admin-topbar">
      {/* Left: Page title & Service Filter Dropdown */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 16, marginBottom: 0 }}>{title}</h1>
          {subtitle && (
            <p className="page-subtitle" style={{ fontSize: 12, marginTop: 0 }}>{subtitle}</p>
          )}
        </div>

        {/* Global Service Filter Dropdown */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid hsl(var(--border))',
            background: 'var(--card)',
            color: 'hsl(var(--foreground))',
            fontSize: '12.5px',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="All">All Services</option>
          <option value="Hotel">Hotels</option>
          <option value="Packages">Tours & Packages</option>
          <option value="Buses">Buses</option>
          <option value="Cabs">Cabs</option>
        </select>
      </div>

      {/* Right: actions + icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Page-level actions */}
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            width: 34, height: 34,
            border: '1px solid hsl(var(--border))',
            borderRadius: 7,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'hsl(var(--muted-foreground))',
            transition: 'all 0.15s',
          }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'hsl(var(--muted))';
            e.currentTarget.style.color = 'hsl(var(--foreground))';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button
          style={{
            width: 34, height: 34,
            border: '1px solid hsl(var(--border))',
            borderRadius: 7,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'hsl(var(--muted-foreground))',
            position: 'relative',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'hsl(var(--muted))';
            e.currentTarget.style.color = 'hsl(var(--foreground))';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
          }}
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 7, height: 7,
              background: '#ef4444',
              borderRadius: '50%',
              border: '1.5px solid white',
            }} />
          )}
        </button>

        {/* User profile pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 6px',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              background: isProfileOpen ? 'hsl(var(--muted))' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isProfileOpen) e.currentTarget.style.background = 'hsl(var(--muted))'; }}
            onMouseLeave={e => { if (!isProfileOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Avatar */}
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'hsl(var(--primary))',
              color: 'white',
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {/* Name */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--foreground))', lineHeight: 1.2 }}>
                {user?.name || 'Admin User'}
              </div>
              <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }}>
                {user?.role || 'Admin'}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: 'hsl(var(--muted-foreground))', transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setIsProfileOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                width: 200,
                background: 'var(--topbar-bg)',
                border: '1px solid hsl(var(--border))',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                zIndex: 50,
              }} className="animate-fadeIn">
                {/* Email */}
                <div style={{ padding: '10px 14px', borderBottom: '1px solid hsl(var(--border))' }}>
                  <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Signed in as</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--foreground))' }}>{user?.email || 'admin@toliday.in'}</div>
                </div>

                {/* Actions */}
                <div style={{ padding: 6 }}>
                  {[
                    { icon: User, label: 'My Profile', href: '/admin/profile' },
                    { icon: Settings, label: 'Settings', href: '/admin/settings' },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px',
                        borderRadius: 7,
                        fontSize: 13,
                        color: 'hsl(var(--foreground))',
                        textDecoration: 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--muted))'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon size={14} />
                      {label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: 'hsl(var(--border))', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px',
                      borderRadius: 7,
                      fontSize: 13,
                      color: '#ef4444',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} />
                    Logout
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
