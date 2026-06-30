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
              dashboard: true // Default open the dashboard section
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

       // Filter sidebar items based on RBAC permissions
       const filteredNav = adminNav.filter(group => {
              if (user.role === 'OWNER' || user.role === 'ADMIN') return true;
              if (!group.permissionKey) return true;
              return user.permissions?.[group.permissionKey] === true;
       });

       return (
              <aside
                     className="flex flex-col h-screen sticky top-0 transition-all duration-500 z-50 bg-[#1c1c1c] border-r border-[#2a2a2a] shadow-xl text-slate-300"
                     style={{
                            width: collapsed ? '90px' : '320px',
                     }}
              >
                     {/* Logo Section */}
                     <div className={`flex items-center gap-4 py-8 ${collapsed ? 'justify-center px-0' : 'px-6'}`}>
                            <div
                                   className="flex items-center justify-center rounded-xl flex-shrink-0 transition-transform duration-500"
                                   style={{
                                          width: 44, height: 44,
                                          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                   }}
                            >
                                   <Shield size={24} color="white" strokeWidth={2.5} />
                            </div>
                            {!collapsed && (
                                   <div className="flex-1 min-w-0">
                                          <div className="font-bold text-lg text-white leading-none tracking-tight">TOLIDAY</div>
                                          <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-1">Admin OS v2.0</div>
                                   </div>
                            )}
                     </div>

                     {/* Search Bar */}
                     {!collapsed && (
                            <div className="px-6 mb-6">
                                   <div className="relative group">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                          <input 
                                                 type="text" 
                                                 placeholder="Search Modules..." 
                                                 className="w-full bg-[#2a2a2a] border border-transparent rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder-slate-500"
                                          />
                                   </div>
                            </div>
                     )}

                     {/* Navigation Accordion */}
                     <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 scrollbar-hide">
                            {filteredNav.map((group) => {
                                   const isExpanded = expandedSections[group.id];
                                   const isActiveGroup = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

                                   return (
                                          <div key={group.id} className="space-y-1">
                                                 {/* Accordion Header */}
                                                 <button
                                                        onClick={() => toggleSection(group.id)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group relative ${isActiveGroup && !isExpanded ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a]'} ${collapsed ? 'justify-center px-0' : ''}`}
                                                 >
                                                        <group.icon size={18} className={`flex-shrink-0 transition-all duration-300 ${isActiveGroup ? 'text-blue-500' : 'group-hover:text-slate-300'}`} />
                                                        
                                                        {!collapsed && (
                                                               <span className="flex-1 text-left font-medium text-[13px]">{group.label}</span>
                                                        )}
                                                        
                                                        {!collapsed && (
                                                               <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        )}

                                                        {collapsed && (
                                                               <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[11px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                                                                      {group.label}
                                                               </div>
                                                        )}
                                                 </button>

                                                 {/* Accordion Content */}
                                                 {(!collapsed && isExpanded) && (
                                                        <div className="ml-9 pl-3 py-1 space-y-1 border-l border-[#333]">
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
                                                                                    className={`block px-3 py-2 rounded-md text-[13px] transition-colors ${isActive
                                                                                           ? 'bg-blue-600 text-white font-medium'
                                                                                           : 'text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a]'
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
                     <div className="p-5 mt-auto border-t border-[#2a2a2a] bg-[#1c1c1c] space-y-5">
                            {!collapsed && (
                                   <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#2a2a2a] border border-transparent hover:border-blue-500/30 transition-all">
                                          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                                                 {user.name?.charAt(0) || 'A'}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                                 <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
                                                 <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{user.role || 'Super Admin'}</div>
                                          </div>
                                   </div>
                            )}

                             <div className={`flex items-center justify-between ${collapsed ? 'flex-col gap-4' : ''}`}>
                                    <div className="flex items-center gap-2">
                                           <button
                                                  onClick={() => setCollapsed(!collapsed)}
                                                  className="p-2.5 rounded-lg bg-[#2a2a2a] text-slate-400 hover:text-white transition-all"
                                           >
                                                  {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                                           </button>
                                           {!collapsed && <ThemeToggle />}
                                    </div>
                                   
                                   <button
                                          onClick={handleLogout}
                                          className={`p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all ${collapsed ? 'w-full' : ''}`}
                                   >
                                          <LogOut size={16} />
                                   </button>
                            </div>
                     </div>
              </aside>
       );
}

