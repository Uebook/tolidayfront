'use client';
import Topbar from '@/components/layout/Topbar';
export default function CabMediaPage() {
    return (
        <div>
            <Topbar title="Media" subtitle="Cab agency media" />
            <div className="p-6 animate-fadeIn">
                <div className="glass-card p-20 text-center text-muted-foreground">
                    <p className="text-sm font-bold">Cab media content coming soon</p>
                </div>
            </div>
        </div>
    );
}
