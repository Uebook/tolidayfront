'use client';

import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.endsWith('/login') || pathname.endsWith('/signup');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 p-3 md:p-4 gap-3 md:gap-4 text-foreground transition-colors duration-300 relative">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/8 dark:bg-blue-600/15 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/8 dark:bg-purple-600/15 blur-[150px] rounded-full pointer-events-none z-0" />
      
      <Sidebar />
      <main className="flex-1 relative rounded-[28px] border border-border/20 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] z-10 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto relative">
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
