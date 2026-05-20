'use client';
import Topbar from '@/components/layout/Topbar';
import { Image as ImageIcon, Upload, Trash2, Plus } from 'lucide-react';

export default function BusMediaPage() {
    return (
        <div>
            <Topbar title="Media Gallery" subtitle="Manage photos of your buses, amenities and fleet" />
            <div className="p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="glass-card px-4 py-2 text-center">
                            <div className="text-xl font-black text-blue-500">24</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Total Photos</div>
                        </div>
                    </div>
                    <button className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                        <Upload size={16} /> Upload New Media
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="aspect-square rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent cursor-pointer transition-all">
                        <Plus size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="group relative aspect-square rounded-3xl bg-white/05 border border-white/05 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                <ImageIcon size={48} />
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                                    <Plus size={18} />
                                </button>
                                <button className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
