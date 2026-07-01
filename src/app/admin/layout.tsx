'use client';

import AdminSidebar from '@/components/layout/AdminSidebar';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { AdminFilterProvider } from '@/context/AdminFilterContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
       const pathname = usePathname();
       const router = useRouter();
       const isAuthPage = pathname.endsWith('/login');
       const [isAuthorized, setIsAuthorized] = useState(false);
       const [isLoading, setIsLoading] = useState(true);

       useEffect(() => {
              const user = getAuthUser();
              if (!isAuthPage) {
                     if (!user) {
                            router.push('/admin/login');
                     } else if (user.role !== 'ADMIN' && user.role !== 'superadmin') {
                            localStorage.removeItem('token');
                            router.push('/admin/login?error=unauthorized');
                     } else {
                            setIsAuthorized(true);
                     }
              }
              setIsLoading(false);
       }, [pathname, router, isAuthPage]);

       if (isAuthPage) {
              return <div className="min-h-screen bg-[#050505]">{children}</div>;
       }

       if (isLoading || !isAuthorized) {
              return (
                     <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                   <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                                   <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/50" size={20} />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Secure Session</div>
                     </div>
              );
       }

       return (
              <AdminFilterProvider>
                     <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 p-3 md:p-4 gap-3 md:gap-4 text-foreground transition-colors duration-300 relative">
                            {/* Ambient background glows */}
                            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/8 dark:bg-blue-600/15 blur-[150px] rounded-full pointer-events-none z-0" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/8 dark:bg-purple-600/15 blur-[150px] rounded-full pointer-events-none z-0" />
                            
                            <AdminSidebar />
                            
                            <main className="flex-1 relative rounded-[28px] border border-border/20 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] z-10 overflow-hidden flex flex-col">
                                   <div className="flex-1 overflow-y-auto relative">
                                          <div className="relative z-10">
                                                 <div className="max-w-[1600px] mx-auto min-h-full">
                                                        {children}
                                                 </div>
                                          </div>
                                   </div>
                            </main>
                     </div>
              </AdminFilterProvider>
       );
}
