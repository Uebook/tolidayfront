'use client';

import Topbar from '@/components/layout/Topbar';
import { Hammer } from 'lucide-react';

export default function PlaceholderPage() {
    return (
        <div>
            <Topbar title="Module Under Development" subtitle="We are working hard to bring this feature to you." />
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="p-6 rounded-3xl bg-accent/10 mb-6">
                    <Hammer size={48} className="text-accent animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
                <p className="text-muted-foreground max-w-sm">
                    This page is currently under development. Stay tuned for updates!
                </p>
            </div>
        </div>
    );
}
