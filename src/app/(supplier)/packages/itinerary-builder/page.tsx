'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Plus, Trash2, GripVertical, Image, MapPin, Clock, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type Activity = {
    id: string;
    day: number;
    title: string;
    description: string;
    inclusions: string[];
};

export default function ItineraryBuilderPage() {
    const queryClient = useQueryClient();
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [days, setDays] = useState<Activity[]>([
        { id: '1', day: 1, title: 'Arrival and Welcome', description: 'Meet and greet at the airport...', inclusions: ['Airport Transfer', 'Dinner'] }
    ]);

    // Fetch Packages
    const { data: packages = [] } = useQuery({
        queryKey: ['tour-packages'],
        queryFn: async () => {
            const res = await api.get('/packages');
            if (res.data.length > 0 && !selectedPackageId) setSelectedPackageId(res.data[0].id);
            return res.data;
        },
    });

    const addDay = () => {
        const newDay: Activity = {
            id: Math.random().toString(36).substr(2, 9),
            day: days.length + 1,
            title: '',
            description: '',
            inclusions: []
        };
        setDays([...days, newDay]);
    };

    const updateDay = (id: string, field: keyof Activity, value: any) => {
        setDays(days.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const removeDay = (id: string) => {
        setDays(days.filter(d => d.id !== id).map((d, i) => ({ ...d, day: i + 1 })));
    };

    return (
        <div>
            <Topbar title="Advanced Itinerary Builder" subtitle="Design stunning day-wise travel experiences" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex gap-6">
                    {/* Package Selector & Meta */}
                    <div className="w-80 space-y-4">
                        <div className="glass-card p-5">
                            <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))] block mb-2">Editing Itinerary For</label>
                            <select 
                                value={selectedPackageId || ''} 
                                onChange={(e) => setSelectedPackageId(e.target.value)}
                                className="w-full bg-white/5 border border-[var(--glass-border)] rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                            >
                                {packages.map((pkg: any) => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                                ))}
                            </select>
                            <div className="mt-4 pt-4 border-t border-[var(--glass-border)] space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[hsl(var(--muted-foreground))]">Total Duration</span>
                                    <span className="font-bold">{days.length} Days / {days.length - 1} Nights</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[hsl(var(--muted-foreground))]">Destinations</span>
                                    <span className="font-bold">3 Cities</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-5 bg-blue-500/5 border-blue-500/20">
                            <h4 className="text-sm font-bold text-blue-500 mb-2">AI Optimization (Beta)</h4>
                            <p className="text-[10px] leading-relaxed opacity-80 mb-3">Our AI can help you optimize travel times and suggest popular activities based on your destinations.</p>
                            <button className="w-full py-2 bg-blue-500 text-white text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-colors">
                                Suggest Improvements
                            </button>
                        </div>
                    </div>

                    {/* Builder Main */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg">Itinerary Timeline</h3>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 text-xs font-bold border border-[var(--glass-border)] rounded-lg hover:bg-white/5 transition-colors">
                                    Preview as Guest
                                </button>
                                <button className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                                    <Save size={16} /> Save Itinerary
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {days.map((day, index) => (
                                <div key={day.id} className="glass-card group animate-slideInUp" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="flex items-start gap-4 p-5">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[hsl(var(--accent))/0.3]">
                                                {day.day}
                                            </div>
                                            <div className="w-0.5 h-20 bg-[var(--glass-border)] group-last:hidden" />
                                        </div>
                                        
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter day title (e.g., Explore Old Delhi)"
                                                    value={day.title}
                                                    onChange={(e) => updateDay(day.id, 'title', e.target.value)}
                                                    className="w-full bg-transparent text-lg font-bold outline-none placeholder:opacity-30"
                                                />
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => removeDay(day.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-white/10 rounded cursor-grab">
                                                        <GripVertical size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <textarea 
                                                placeholder="Describe the day's activities in detail..."
                                                value={day.description}
                                                onChange={(e) => updateDay(day.id, 'description', e.target.value)}
                                                className="w-full bg-white/5 border border-[var(--glass-border)] rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--accent))] min-h-[100px] resize-none"
                                            />

                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-xs font-medium text-blue-500 cursor-pointer hover:underline">
                                                    <Image size={14} /> Add Day Gallery
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-blue-500 cursor-pointer hover:underline">
                                                    <MapPin size={14} /> Tag Locations
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-blue-500 cursor-pointer hover:underline">
                                                    <Clock size={14} /> Set Timings
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button 
                                onClick={addDay}
                                className="w-full py-6 border-2 border-dashed border-[var(--glass-border)] rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 hover:border-[hsl(var(--accent))/0.3] transition-all group"
                            >
                                <div className="p-2 rounded-full bg-white/5 group-hover:bg-[hsl(var(--accent))/0.1] text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))]">
                                    <Plus size={24} />
                                </div>
                                <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))]">Add Another Day</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
