'use client';

import Topbar from '@/components/layout/Topbar';
import { Upload, Image as ImageIcon, Trash2, FolderOpen, Maximize2, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const categories = ['All', 'Lobby', 'Rooms', 'Vehicles', 'Pool & Spa', 'Restaurant', 'Common Areas', 'Other'];

export default function VendorGallery() {
    const queryClient = useQueryClient();
    const [activeCategory, setActiveCategory] = useState('All');
    const [selected, setSelected] = useState<string[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch media
    const { data: media = [], isLoading } = useQuery({
        queryKey: ['media-gallery'],
        queryFn: async () => {
            const res = await api.get('/media');
            return res.data;
        }
    });

    // Create media mutation (real upload via FormData)
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', activeCategory === 'All' ? 'Other' : activeCategory);

            await api.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-gallery'] });
        },
        onError: (err: any) => {
            console.error('Upload failed:', err);
            alert(`Upload failed: ${err.response?.data?.message || err.message}`);
        }
    });

    // Delete media mutation
    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            for (const id of ids) {
                await api.delete(`/media/${id}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media-gallery'] });
            setSelected([]);
        }
    });

    const filtered = activeCategory === 'All' ? media : media.filter((m: any) => m.category === activeCategory);
    const toggleSelect = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach(file => uploadMutation.mutate(file));
        }
    };

    if (isLoading) {
        return (
            <div>
                <Topbar title="Media Gallery" subtitle="Manage your photos and assets" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Media Gallery" subtitle="Manage your photos and assets" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Upload Area */}
                <div
                    className="rounded-xl p-8 text-center border-2 border-dashed transition-all cursor-pointer relative"
                    style={{ borderColor: isDragging ? 'hsl(var(--accent))' : 'var(--glass-border)', background: isDragging ? 'hsl(var(--accent) / 0.05)' : 'var(--glass-border-light)' }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            Array.from(e.dataTransfer.files).forEach(file => uploadMutation.mutate(file));
                        }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                    <Upload size={32} className="mx-auto mb-3" style={{ color: 'hsl(var(--accent))' }} />
                    <p className="text-[hsl(var(--foreground))] font-medium">Drag & drop images here</p>
                    <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Supports JPG, PNG, WebP up to 10MB each</p>
                    <button className="btn-primary mt-4 px-5 py-2 text-sm" disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ? 'Uploading...' : 'Browse Files'}
                    </button>
                </div>

                {/* Filters + Actions */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                        {categories.map((c) => (
                            <button key={c} onClick={() => setActiveCategory(c)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                style={{ background: activeCategory === c ? 'var(--glass-border)' : 'transparent', color: 'hsl(var(--muted-foreground))' }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    {selected.length > 0 && (
                        <button onClick={() => { if (confirm('Delete selected?')) deleteMutation.mutate(selected); }} disabled={deleteMutation.isPending} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.3)', color: 'hsl(0 84% 60%)' }}>
                            <Trash2 size={13} /> {deleteMutation.isPending ? 'Deleting...' : `Delete (${selected.length})`}
                        </button>
                    )}
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((m: any) => {
                        const isSelected = selected.includes(m.id);
                        return (
                            <div key={m.id} className="relative group rounded-xl overflow-hidden cursor-pointer"
                                style={{ border: `2px solid ${isSelected ? 'hsl(var(--accent))' : 'transparent'}` }}
                            >
                                <img src={m.url} alt={m.name} className="w-full object-cover" style={{ height: 180 }} onClick={() => toggleSelect(m.id)} />
                                
                                {/* Hover Action: Preview */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setPreviewUrl(m.url); }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                    title="View Full Image"
                                >
                                    <Maximize2 size={16} />
                                </button>
                                
                                <div className="absolute inset-0 bg-[var(--table-header)] group-hover:bg-[var(--table-header)] transition-all flex items-center justify-center pointer-events-none">
                                    {isSelected && (
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--accent))' }}>
                                            <span className="text-[hsl(var(--foreground))] text-xs">✓</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-2" style={{ background: 'linear-gradient(transparent, var(--glass-shadow))' }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate">{m.name}</p>
                                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{m.category} · {m.size}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[hsl(var(--muted-foreground))]">
                            No media found in this category.
                        </div>
                    )}
                </div>

                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {filtered.length} photos · {selected.length} selected
                </p>

                {/* Preview Modal */}
                {previewUrl && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
                        <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => setPreviewUrl(null)}
                                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                            >
                                <X size={28} />
                            </button>
                            <img src={previewUrl} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Preview" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
