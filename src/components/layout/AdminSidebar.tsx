'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
       LayoutDashboard, Building2, Users, BarChart3, Settings,
       Shield, LogOut, Hotel, ChevronLeft, ChevronRight, Map,
       Bus, CarFront, DollarSign, Activity, Bell, Search,
       Calendar, Tags, PieChart, MessageSquare, ChevronDown, Key
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
                     { href: '/admin/dashboard', label: 'Super Dashboard' },
                     { href: '/admin/bookings', label: 'Master Bookings List' },
                     { href: '/admin/finance/ledger', label: 'Global Transactions' },
                     { href: '/admin/consumer-users', label: 'All Consumers (KYC)' },
                     { href: '/admin/cms', label: 'Website CMS Manager' },
              ],
       },
       {
              label: 'Hotel Operations',
              icon: Hotel,
              id: 'hotels',
              permissionKey: 'hotels_manage',
              items: [
                     { href: '/admin/hotels', label: 'Profiles & Management' },
                     { href: '/admin/hotels/bookings', label: 'Bookings & Reservations' },
                     { href: '/admin/hotels/rates', label: 'Rates, Pricing & Availability' },
                     { href: '/admin/hotels/finance', label: 'Finance & Payments' },
                     { href: '/admin/hotels/analytics', label: 'Analytics & Reports' },
                     { href: '/admin/hotels/reviews', label: 'Reviews & Support' },
              ],
       },
       {
              label: 'Tour & Package Operations',
              icon: Map,
              id: 'tours',
              permissionKey: 'tours_manage',
              items: [
                     { href: '/admin/packages', label: 'Profiles & Management' },
                     { href: '/admin/packages/bookings', label: 'Bookings & Reservations' },
                     { href: '/admin/packages/rates', label: 'Rates, Pricing & Availability' },
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
                     { href: '/admin/buses/bookings', label: 'Bookings & Reservations' },
                     { href: '/admin/buses/rates', label: 'Routes & Scheduling' },
                     { href: '/admin/buses/finance', label: 'Finance & Payments' },
                     { href: '/admin/buses/analytics', label: 'Analytics & Reports' },
                     { href: '/admin/buses/reviews', label: 'Reviews & Support' },
              ],
       },
       {
              label: 'Cab Operations',
              icon: CarFront,
              id: 'cabs',
              permissionKey: 'cabs_manage',
              items: [
                     { href: '/admin/cabs', label: 'Profiles & Management' },
                     { href: '/admin/cabs/bookings', label: 'Bookings & Reservations' },
                     { href: '/admin/cabs/rates', label: 'Pricing & Availability' },
                     { href: '/admin/cabs/finance', label: 'Finance & Payments' },
                     { href: '/admin/cabs/analytics', label: 'Analytics & Reports' },
                     { href: '/admin/cabs/reviews', label: 'Reviews & Support' },
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
                     { href: '/admin/settings/api', label: 'Global API Integrations' },
                     { href: '/admin/settings', label: 'Global Settings' },
              ],
       },
];

export default function AdminSidebar() {
       const pathname = usePathname();
       const router = useRouter();
       const user = getAuthUser();
       const [collapsed, setCollapsed] = useState(false);
       
       // Track which accordion sections are expanded
       const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
              dashboard: true,
              hotels: true,
              tours: true,
              buses: true,
              cabs: true,
              system: true
       });

       const toggleSection = (id: string) => {
              if (collapsed) setCollapsed(false); // Auto expand sidebar if opening a section
              setExpandedSections(prev => ({
                     ...prev,
                     [id]: !prev[id]
              }));
       };

       const handleLogout = () => {
              logout();
              router.push('/admin/login');
       };

       if (!user) return null;

       const { serviceFilter, setServiceFilter } = useAdminFilter();

       // Filter sidebar items based on RBAC permissions AND service filter
       const filteredNav = adminNav.filter(group => {
              // 1. RBAC check
              const hasAccess = user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'superadmin' || (!group.permissionKey || user.permissions?.[group.permissionKey] === true);
              if (!hasAccess) return false;

              // 2. Service Filter check
              if (serviceFilter !== 'All') {
                     // Always show dashboard and system settings
                     if (group.id === 'dashboard' || group.id === 'system') return true;

                     // Match the specific service group
                     if (serviceFilter === 'Hotel' && group.id !== 'hotels') return false;
                     if (serviceFilter === 'Packages' && group.id !== 'tours') return false;
                     if (serviceFilter === 'Buses' && group.id !== 'buses') return false;
                     if (serviceFilter === 'Cabs' && group.id !== 'cabs') return false;
              }

              return true;
       });

       return (
              <aside
                     className="flex flex-col h-full rounded-[28px] border border-border/20 shadow-sm transition-all duration-300 ios-spring bg-white/45 dark:bg-slate-900/30 backdrop-blur-2xl"
                     style={{
                            width: collapsed ? '80px' : '260px',
                     }}
              >
                     {/* Logo Section */}
                     <div className={`flex items-center gap-3 py-6 border-b border-border/10 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
                            <div
                                   className="flex items-center justify-center rounded-xl flex-shrink-0 transition-transform hover:scale-105 active:scale-95 duration-300 cursor-pointer"
                                   style={{
                                          width: 40, height: 40,
                                          background: 'linear-gradient(135deg, hsl(219 90% 50%), hsl(195 90% 45%))',
                                          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)'
                                   }}
                            >
                                   <Shield size={20} color="white" />
                            </div>
                            {!collapsed && (
                                   <div className="flex-1 min-w-0">
                                          <div className="font-extrabold text-sm text-[hsl(var(--foreground))] tracking-tight leading-tight truncate">TolidayTrip</div>
                                          <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'hsl(var(--accent))' }}>Admin OS v2.0</div>
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

                     {/* Service Filter */}
                     {!collapsed && (
                            <div className="px-4 mt-5 mb-2">
                                   <div className="relative group">
                                          <select 
                                                 value={serviceFilter}
                                                 onChange={(e) => setServiceFilter(e.target.value)}
                                                 className="appearance-none w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/10 rounded-xl py-2.5 pl-4 pr-10 text-xs font-extrabold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-colors"
                                          >
                                                 <option value="All">All Services (Master View)</option>
                                                 <option value="Hotel">Hotel Operations</option>
                                                 <option value="Packages">Tour & Packages</option>
                                                 <option value="Buses">Bus Operations</option>
                                                 <option value="Cabs">Cab Operations</option>
                                          </select>
                                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">
                                                 <ChevronDown size={14} />
                                          </div>
                                   </div>
                            </div>
                     )}

                     {/* Search Bar */}
                     {!collapsed && (
                            <div className="px-4 mt-2">
                                   <div className="relative group">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={14} />
                                          <input 
                                                 type="text" 
                                                 placeholder="Search Modules..." 
                                                 className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-border/10 focus:shadow-sm transition-all text-foreground placeholder-muted-foreground/60"
                                          />
                                   </div>
                            </div>
                     )}

                     {/* Navigation Accordion */}
                     <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scrollbar-hide">
                            {filteredNav.map((group) => {
                                   const isExpanded = expandedSections[group.id];
                                   const isActiveGroup = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

                                   return (
                                          <div key={group.id} className="space-y-1">
                                                 {/* Accordion Header */}
                                                 <button
                                                        onClick={() => toggleSection(group.id)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ios-spring ios-tap-scale relative ${isActiveGroup && !isExpanded ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'} ${collapsed ? 'justify-center px-0' : ''}`}
                                                 >
                                                        <group.icon size={18} className={`flex-shrink-0 transition-all duration-300 ${isActiveGroup ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                                        
                                                        {!collapsed && (
                                                               <span className="flex-1 text-left font-medium text-[13px]">{group.label}</span>
                                                        )}
                                                        
                                                        {!collapsed && (
                                                               <ChevronDown size={14} className={`transition-transform duration-300 opacity-50 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        )}
                                                 </button>

                                                 {/* Accordion Content */}
                                                 {(!collapsed && isExpanded) && (
                                                        <div className="ml-9 py-1 space-y-1 border-l-2 border-border/10">
                                                               {group.items.map((item) => {
                                                                      // Find the most specific matching item in this group
                                                                      const bestMatch = group.items.reduce((best: any, currentItem) => {
                                                                             if (pathname === currentItem.href || pathname.startsWith(currentItem.href + '/')) {
                                                                                    if (!best || currentItem.href.length > best.href.length) {
                                                                                           return currentItem;
                                                                                    }
                                                                             }
                                                                             return best;
                                                                      }, null);
                                                                      
                                                                      const isActive = bestMatch?.href === item.href;
                                                                      
                                                                      return (
                                                                             <Link
                                                                                    key={item.href}
                                                                                    href={item.href}
                                                                                    className={`block px-4 py-2 -ml-[2px] border-l-2 text-[12px] transition-all ios-spring ios-tap-scale rounded-r-xl ${isActive
                                                                                           ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-bold'
                                                                                           : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                                                                                    }`}
                                                                             >
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

                     {/* Footer Profile Section */}
                     <div className="p-3 border-t border-border/10 flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors no-underline">
                                   <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 shadow-sm text-white"
                                          style={{ background: 'linear-gradient(135deg, hsl(219 90% 50%), hsl(195 90% 45%))' }}
                                   >
                                          {user ? user.name?.charAt(0).toUpperCase() || 'A' : '?'}
                                   </div>
                                   {!collapsed && user && (
                                          <div className="flex-1 min-w-0">
                                                 <div className="text-xs font-bold text-[hsl(var(--foreground))] truncate leading-none">{user.name}</div>
                                                 <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 leading-none">{user.role || 'Super Admin'}</div>
                                          </div>
                                   )}
                            </div>
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
