'use client';
import Topbar from '@/components/layout/Topbar';
export default function CabNotificationsPage() {
    return (
        <div>
            <Topbar title="Notifications" subtitle="Cab agency notifications" />
            <div className="p-6 animate-fadeIn">
                <div className="glass-card p-20 text-center text-muted-foreground">
                    <p className="text-sm font-bold">Cab notifications content coming soon</p>
                </div>
            </div>
        </div>
    );
}
