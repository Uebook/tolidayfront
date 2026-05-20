'use client';

import Topbar from '@/components/layout/Topbar';
import { Package as PackageIcon, Plus, MapPin, Clock, IndianRupee, Eye, Edit2, Search, Filter, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PackageListingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await api.get('/packages');
            setPackages(res.data);
        } catch (err) {
            console.error('Failed to fetch packages', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        try {
            await api.delete(`/packages/${id}`);
            setPackages(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete package');
        }
    };

    const filteredPackages = packages.filter(pkg => 
        (pkg.name || pkg.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.destination || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Topbar 
                title="Tour Packages" 
                subtitle="Manage and create your holiday offerings"
            />

            <div className="p-8 space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or destination..."
                            className="w-full pl-12 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl focus:ring-2 focus:ring-accent/50 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--table-header)] transition-colors text-sm font-semibold">
                            <Filter size={18} /> Filters
                        </button>
                        <Link href="/packages/new" className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-accent/20">
                            <Plus size={20} /> Create Package
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 rounded-3xl bg-[var(--glass-bg)] animate-pulse border border-[var(--glass-border)]" />
                        ))}
                    </div>
                ) : filteredPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPackages.map((pkg) => (
                            <div key={pkg.id} className="glass-card group overflow-hidden border border-[var(--glass-border)] hover:border-accent/30 transition-all duration-500 shadow-xl hover:shadow-2xl rounded-[32px]">
                                <div className="relative aspect-video overflow-hidden">
                                    <img 
                                        src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60'} 
                                        alt={pkg.name || pkg.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                            pkg.status === 'ACTIVE' || pkg.status === 'active' 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-amber-500 text-white'
                                        }`}>
                                            {pkg.status || 'DRAFT'}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <button 
                                            onClick={() => handleDelete(pkg.id)}
                                            className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-colors"
                                            title="Delete Package"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-xl mb-1 line-clamp-1">{pkg.name || pkg.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                            <MapPin size={14} className="text-accent" /> {pkg.destination || pkg.destinations?.join(', ')}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-y border-[var(--glass-border)]">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <Clock size={16} className="text-accent" /> {pkg.duration || `${pkg.durationDays}D/${pkg.durationNights}N`}
                                        </div>
                                        <div className="text-right">
                                            {pkg.sale_price || pkg.basePrice ? (
                                                <>
                                                    <div className="text-[10px] text-muted-foreground line-through font-bold">
                                                        ₹{pkg.base_price || pkg.basePrice}
                                                    </div>
                                                    <div className="text-lg font-black text-accent">
                                                        ₹{pkg.sale_price || pkg.basePrice}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-lg font-black text-accent">Price on Request</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <Link 
                                            href={`/packages/${pkg.id}`} 
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </Link>
                                        <Link 
                                            href={`/packages/${pkg.id}`} 
                                            className="flex items-center justify-center p-3 rounded-2xl border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 transition-colors text-accent"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card flex flex-col items-center justify-center p-20 border border-dashed border-[var(--glass-border)] rounded-[40px] text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                            <PackageIcon size={48} className="text-accent animate-bounce" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black mb-2">No Packages Found</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                                Start growing your business by creating your first tour package.
                            </p>
                        </div>
                        <Link href="/packages/new" className="btn-primary flex items-center gap-2 px-8 py-4 rounded-[20px] shadow-2xl shadow-accent/30 font-bold transition-all hover:scale-105">
                            <Plus size={24} /> Create Your First Package
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
