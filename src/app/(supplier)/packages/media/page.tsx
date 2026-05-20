'use client';

import { useState, useEffect, useRef } from 'react';
import Topbar from '@/components/layout/Topbar';
import { 
    Image as ImageIcon, Upload, Search, Filter, Grid, List, 
    MoreVertical, Trash2, Download, Eye, X, CheckCircle2,
    Calendar, Tag, HardDrive, Package
} from 'lucide-react';
import api from '@/lib/api';

interface MediaItem {
    id: string;
    name: string;
    url: string;
    category: string;
    size: string;
    createdAt: string;
    packageId?: string;
}

export default function MediaGalleryPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<MediaItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await api.get('/media');
            setMedia(res.data);
        } catch (err) {
            console.error('Failed to fetch media', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        const file = e.target.files[0];
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'Tour Package');

        try {
            const res = await api.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMedia([res.data, ...media]);
        } catch (err) {
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await api.delete(`/media/${id}`);
            setMedia(media.filter(m => m.id !== id));
            if (previewImage?.id === id) setPreviewImage(null);
        } catch (err) {
            alert('Failed to delete media');
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredMedia = media.filter(item => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Topbar 
                title="Media Gallery" 
                subtitle="Manage all your package and tour images in one place"
            />

            <div className="p-8 space-y-6">
                {/* Actions Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Search images..."
                                className="w-full pl-12 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="flex bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-1 shadow-sm">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-muted-foreground hover:bg-white/5'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-muted-foreground hover:bg-white/5'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleUpload} 
                            className="hidden" 
                            accept="image/*"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="btn-primary flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/20"
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Upload size={20} />
                            )}
                            Upload Image
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="aspect-square rounded-3xl bg-[var(--glass-bg)] animate-pulse border border-[var(--glass-border)]" />
                        ))}
                    </div>
                ) : filteredMedia.length > 0 ? (
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                        : "flex flex-col gap-3"
                    }>
                        {filteredMedia.map((item) => (
                            viewMode === 'grid' ? (
                                <div 
                                    key={item.id} 
                                    className={`group relative aspect-square rounded-[32px] overflow-hidden border transition-all duration-500 cursor-pointer shadow-xl hover:shadow-2xl ${
                                        selectedItems.includes(item.id) ? 'border-blue-600 ring-4 ring-blue-600/20' : 'border-[var(--glass-border)] hover:border-blue-600/30'
                                    }`}
                                    onClick={() => setPreviewImage(item)}
                                >
                                    <img 
                                        src={item.url} 
                                        alt={item.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60';
                                        }}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelection(item.id);
                                                }}
                                                className={`p-2 rounded-xl transition-all ${selectedItems.includes(item.id) ? 'bg-blue-600 text-white' : 'bg-white/20 backdrop-blur-md text-white'}`}
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(item.url, '_blank');
                                                }}
                                                className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40 transition-colors"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    key={item.id}
                                    className="glass-card flex items-center gap-4 p-3 border border-[var(--glass-border)] rounded-2xl hover:border-blue-600/30 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                        <img src={item.url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                            <Tag size={12} /> {item.category} • <HardDrive size={12} /> {item.size}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 pr-2">
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                        <button onClick={() => setPreviewImage(item)} className="p-2 text-muted-foreground hover:text-blue-600 transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="glass-card flex flex-col items-center justify-center p-20 border border-dashed border-[var(--glass-border)] rounded-[40px] text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                            <ImageIcon size={48} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black mb-2">Your Gallery is Empty</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                                Upload high-quality images to make your tour packages more attractive.
                            </p>
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-primary flex items-center gap-2 px-8 py-4 rounded-[20px] shadow-2xl shadow-blue-600/30 font-bold transition-all hover:scale-105"
                        >
                            <Upload size={24} /> Upload First Image
                        </button>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
                    <div className="relative w-full max-w-6xl glass-card border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex-1 bg-black/50 flex items-center justify-center min-h-[40vh] md:min-h-0">
                            <img src={previewImage.url} alt={previewImage.name} className="max-w-full max-h-[80vh] object-contain" />
                        </div>
                        <div className="w-full md:w-80 bg-[var(--card)] p-8 space-y-8 overflow-y-auto max-h-[40vh] md:max-h-[80vh]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Image Info</h3>
                                <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted-foreground">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">File Name</label>
                                    <p className="text-sm font-bold break-all">{previewImage.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Category</label>
                                        <p className="text-sm font-bold flex items-center gap-2"><Tag size={14} className="text-blue-600" /> {previewImage.category}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">File Size</label>
                                        <p className="text-sm font-bold flex items-center gap-2"><HardDrive size={14} className="text-blue-600" /> {previewImage.size}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Uploaded On</label>
                                    <p className="text-sm font-bold flex items-center gap-2"><Calendar size={14} className="text-blue-600" /> {new Date(previewImage.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-3">
                                <button 
                                    onClick={() => window.open(previewImage.url, '_blank')}
                                    className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <Download size={18} /> Download
                                </button>
                                <button 
                                    onClick={() => handleDelete(previewImage.id)}
                                    className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} /> Delete Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
