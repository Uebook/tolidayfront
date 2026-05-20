'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
       LayoutDashboard, Building2, Users, BarChart3, Settings,
       Shield, LogOut, Hotel, ChevronLeft, ChevronRight, Map,
       Bus, CarFront, DollarSign, Activity, Bell, Search
} from 'lucide-react';
import { useState } from 'react';
import { getAuthUser, logout } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

const adminNav = [
       {
              label: 'Main Intelligence',
              items: [
                     { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Super Dashboard' },
                     { href: '/admin/hotels', icon: Hotel, label: 'Hotel Partners' },
                     { href: '/admin/packages', icon: Map, label: 'Tour Partners' },
                     { href: '/admin/buses', icon: Bus, label: 'Bus Partners' },
                     { href: '/admin/cabs', icon: CarFront, label: 'Cab Partners' },
              ],
       },
       {
              label: 'Operations Hub',
              items: [
                     { href: '/admin/bookings', icon: BarChart3, label: 'Global Bookings' },
                     { href: '/admin/finance', icon: DollarSign, label: 'Financial Matrix' },
                     { href: '/admin/users', icon: Users, label: 'User Directory' },
              ],
       },
       {
              label: 'System Core',
              items: [
                     { href: '/admin/settings', icon: Settings, label: 'Configuration' },
                     { href: '/admin/logs', icon: Shield, label: 'Security Protocols' },
              ],
       },
];

export default function AdminSidebar() {
       const pathname = usePathname();
       const router = useRouter();
       const user = getAuthUser();
       const [collapsed, setCollapsed] = useState(false);

       const handleLogout = () => {
              logout();
              router.push('/admin/login');
       };

       if (!user) return null;

       return (
              <aside
                     className="flex flex-col h-screen sticky top-0 transition-all duration-500 z-50 bg-white border-r border-slate-200 dark:bg-white dark:border-slate-200 shadow-xl"
                     style={{
                            width: collapsed ? '90px' : '300px',
                     }}
              >
                     {/* Logo Section */}
                     <div className={`flex items-center gap-4 py-10 ${collapsed ? 'justify-center px-0' : 'px-8'}`}>
                            <div
                                   className="flex items-center justify-center rounded-2xl flex-shrink-0 transition-transform duration-500 hover:rotate-12"
                                   style={{
                                          width: 48, height: 48,
                                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)'
                                   }}
                            >
                                   <Shield size={26} color="white" strokeWidth={2.5} />
                            </div>
                            {!collapsed && (
                                   <div className="flex-1 min-w-0">
                                          <div className="font-black text-xl text-slate-900 dark:text-slate-900 leading-none tracking-tighter">TOLIDAY</div>
                                          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-500 font-black mt-1">ADMIN OS v2.0</div>
                                   </div>
                            )}
                     </div>

                     {/* Search Bar - Hidden when collapsed */}
                     {!collapsed && (
                            <div className="px-6 mb-8">
                                   <div className="relative group">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                                          <input 
                                                 type="text" 
                                                 placeholder="Search Modules..." 
                                                 className="w-full bg-slate-200/50 dark:bg-slate-100 border border-transparent dark:border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-blue-500/50 transition-all text-slate-900 dark:text-slate-900"
                                          />
                                   </div>
                            </div>
                     )}

                     {/* Navigation */}
                     <nav className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide">
                            {adminNav.map((group) => (
                                   <div key={group.label} className="space-y-2">
                                          {!collapsed && (
                                                 <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/60 dark:text-white/20">
                                                        {group.label}
                                                 </div>
                                          )}
                                          <div className="space-y-1.5">
                                                 {group.items.map((item) => {
                                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                                        return (
                                                               <Link
                                                                      key={item.href}
                                                                      href={item.href}
                                                                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                                                             ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30'
                                                                             : 'text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-600 hover:bg-blue-600/5 dark:hover:bg-blue-600/5'
                                                                             } ${collapsed ? 'justify-center px-0' : ''}`}
                                                               >
                                                                      <item.icon size={20} className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-500'}`} />
                                                                      {!collapsed && <span className="flex-1 font-bold text-sm tracking-tight">{item.label}</span>}
                                                                      
                                                                      {isActive && !collapsed && (
                                                                             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                                      )}
                                                                      
                                                                      {collapsed && (
                                                                             <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-2xl">
                                                                                    {item.label}
                                                                             </div>
                                                                      )}
                                                               </Link>
                                                        );
                                                 })}
                                          </div>
                                   </div>
                            ))}
                     </nav>

                     {/* Footer Profile Section */}
                     <div className="p-6 mt-auto border-t border-slate-200 dark:border-white/5 space-y-6">
                            {!collapsed && (
                                   <div className="flex items-center gap-4 p-3 rounded-[1.5rem] bg-slate-100 dark:bg-slate-100 border border-transparent dark:border-slate-200 group hover:border-blue-500/30 transition-all">
                                          <div className="relative">
                                                 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg group-hover:rotate-6 transition-transform">
                                                        {user.name?.charAt(0) || 'A'}
                                                 </div>
                                                 <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-100 dark:border-black shadow-sm" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                                 <div className="text-sm font-black text-slate-900 dark:text-slate-900 truncate tracking-tight">{user.name}</div>
                                                 <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{user.role || 'Super Admin'}</div>
                                          </div>
                                   </div>
                            )}

                            <div className={`flex items-center justify-between ${collapsed ? 'flex-col gap-4' : ''}`}>
                                   <div className="flex items-center gap-2">
                                          <button
                                                 onClick={() => setCollapsed(!collapsed)}
                                                 className="p-3 rounded-xl bg-slate-200 dark:bg-slate-200 text-slate-600 dark:text-slate-600 hover:text-blue-600 hover:bg-blue-600/10 transition-all"
                                          >
                                                 {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                          </button>
                                          {!collapsed && <ThemeToggle />}
                                   </div>
                                   
                                   <button
                                          onClick={handleLogout}
                                          className={`p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 transition-all ${collapsed ? 'w-full' : ''}`}
                                   >
                                          <LogOut size={18} />
                                   </button>
                            </div>
                     </div>
              </aside>
       );
}
