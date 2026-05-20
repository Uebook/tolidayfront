'use client';
import Topbar from '@/components/layout/Topbar';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
export default function CabProfilePage() {
    return (
        <div>
            <Topbar title="Agency Profile" subtitle="Manage your cab agency details" />
            <div className="p-6 animate-fadeIn max-w-4xl mx-auto">
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-6 pb-8 border-b border-white/05">
                        <div className="w-24 h-24 rounded-3xl bg-white/05 flex items-center justify-center text-muted-foreground">
                            <Building2 size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">Agency Name</h2>
                            <p className="text-sm text-accent font-bold uppercase tracking-widest">Verified Cab Partner</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
                            <p className="font-bold">agency@test.com</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</label>
                            <p className="font-bold">+91 XXXXX XXXXX</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
