'use client';
import Topbar from '@/components/layout/Topbar';
import { Download, TrendingUp } from 'lucide-react';
export default function CabReportsPage() {
    return (
        <div>
            <Topbar title="Fleet Reports" subtitle="Analyze your cab revenue and utilization" />
            <div className="p-6 space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Revenue', value: '₹0.00', color: 'hsl(199 89% 48%)' },
                        { label: 'Completed Rides', value: '0', color: 'hsl(225 70% 65%)' },
                        { label: 'Driver Efficiency', value: '0%', color: 'hsl(142 71% 45%)' },
                        { label: 'Cancellations', value: '0', color: 'hsl(0 84% 60%)' },
                    ].map((k) => (
                        <div key={k.label} className="glass-card p-5 text-center">
                            <div className="text-2xl font-black mb-1" style={{ color: k.color }}>{k.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</div>
                        </div>
                    ))}
                </div>
                <div className="glass-card p-20 text-center text-muted-foreground">
                    <TrendingUp size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-bold">No data available for the selected period</p>
                </div>
            </div>
        </div>
    );
}
