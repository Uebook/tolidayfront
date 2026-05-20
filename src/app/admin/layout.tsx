'use client';

import AdminSidebar from '@/components/layout/AdminSidebar';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

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
                            router.push('/hotel/login');
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
              <div className="flex h-screen overflow-hidden bg-[#f8fbff] text-slate-900 transition-colors duration-500">
                     <AdminSidebar />
                     
                     <main className="flex-1 overflow-y-auto relative scroll-smooth">
                            {/* Premium Background Effects */}
                            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                                   <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[150px] rounded-full animate-pulse" />
                                   <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 blur-[150px] rounded-full" />
                            </div>

                            <div className="relative z-10 min-h-full">
                                   <div className="max-w-[1600px] mx-auto">
                                          {children}
                                   </div>
                            </div>
                     </main>
              </div>
       );
}
