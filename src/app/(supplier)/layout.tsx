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
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
