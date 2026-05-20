'use client';
import Topbar from '@/components/layout/Topbar';
import { Settings, Shield, Bell, Lock, Globe } from 'lucide-react';

export default function BusSettingsPage() {
    return (
        <div>
            <Topbar title="Account Settings" subtitle="Configure your portal preferences and security" />
            <div className="p-6 space-y-6 animate-fadeIn max-w-4xl">
                <div className="glass-card divide-y divide-white/05">
                    {[
                        { icon: Shield, label: 'Security & Auth', desc: 'Manage passwords and 2FA' },
                        { icon: Bell, label: 'Notification Preferences', desc: 'Choose what alerts you receive' },
                        { icon: Globe, label: 'Regional Settings', desc: 'Timezones and currency display' },
                        { icon: Lock, label: 'Data Privacy', desc: 'Control your business data visibility' },
                    ].map((item) => (
                        <div key={item.label} className="p-6 flex items-center justify-between hover:bg-white/05 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/05 flex items-center justify-center text-muted-foreground group-hover:text-accent transition-colors">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">{item.label}</div>
                                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg border border-white/05 flex items-center justify-center text-muted-foreground group-hover:border-accent group-hover:text-accent">
                                <Globe size={14} className="rotate-90" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
