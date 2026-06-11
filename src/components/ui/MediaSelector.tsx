'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Grid, X, CheckCircle2, Image as ImageIcon, Plus, Maximize2 } from 'lucide-react';
import api from '@/lib/api';

interface MediaSelectorProps {
    onSelect: (urls: string[]) => void;
    selectedImages: string[];
    multiple?: boolean;
    maxImages?: number;
    category?: string;
}

export default function MediaSelector({ 
    onSelect, 
    selectedImages = [], 
    multiple = true,
    maxImages = 10,
    category = 'General'
}: MediaSelectorProps) {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
    const [galleryImages, setGalleryImages] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [tempSelected, setTempSelected] = useState<string[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync tempSelected with selectedImages when modal opens
    useEffect(() => {
        if (showModal) {
            setTempSelected(selectedImages);
            if (activeTab === 'gallery') {
                fetchGallery();
            }
        }
    }, [showModal, selectedImages, activeTab]);

    const fetchGallery = async () => {
        setIsFetching(true);
        try {
            const res = await api.get('/media');
            setGalleryImages(res.data);
        } catch (err) {
            console.error('Failed to fetch gallery', err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        
        try {
            const urls = [];
            // Handle multiple file upload sequentially
            for (let i = 0; i < e.target.files.length; i++) {
                if (!multiple && i > 0) break; // If single selection, only upload first file
                if (tempSelected.length + urls.length >= maxImages) {
                    alert(`Maximum ${maxImages} images allowed`);
                    break;
                }
                
                const file = e.target.files[i];
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('category', category);

                const res = await api.post('/media/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                urls.push(res.data.url);
            }
            
            const newSelected = multiple 
                ? [...tempSelected, ...urls].slice(0, maxImages)
                : [urls[0]];
                
            setTempSelected(newSelected);
            
            // If we successfully uploaded, auto-confirm and close
            if (urls.length > 0) {
                onSelect(newSelected);
                setShowModal(false);
            }
        } catch (err) {
            alert('Upload failed');
            console.error(err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleGalleryImage = (url: string) => {
        if (!multiple) {
            setTempSelected([url]);
            return;
        }

        if (tempSelected.includes(url)) {
            setTempSelected(prev => prev.filter(img => img !== url));
        } else {
            if (tempSelected.length >= maxImages) {
                alert(`Maximum ${maxImages} images allowed`);
                return;
            }
            setTempSelected(prev => [...prev, url]);
        }
    };

    const handleConfirm = () => {
        onSelect(tempSelected);
        setShowModal(false);
    };

    const removeImage = (urlToRemove: string) => {
        onSelect(selectedImages.filter(url => url !== urlToRemove));
    };

    return (
        <div className="space-y-4">
            {/* Display current selections */}
            {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selectedImages.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--glass-border)] shadow-md group">
                            <img src={img} alt="Selected" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPreviewUrl(img); }}
                                className="absolute top-2 left-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/80 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                                title="View Full Image"
                            >
                                <Maximize2 size={14} />
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => removeImage(img)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                                title="Remove Image"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {(multiple && selectedImages.length < maxImages) && (
                        <div 
                            onClick={() => setShowModal(true)}
                            className="aspect-square rounded-xl border-2 border-dashed border-[var(--glass-border)] flex flex-col items-center justify-center bg-white/5 hover:bg-[var(--table-header)] transition-colors cursor-pointer text-blue-600"
                        >
                            <Plus size={24} className="mb-2" />
                            <span className="text-xs font-bold">Add More</span>
                        </div>
                    )}
                </div>
            )}

            {selectedImages.length === 0 && (
                <div 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-2xl p-8 bg-white/5 hover:bg-[var(--table-header)] transition-all cursor-pointer group"
                    onClick={() => setShowModal(true)}
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">Add Media</h3>
                    <p className="text-muted-foreground text-xs mt-1">Upload files or select from gallery</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setShowModal(false)} />
                    
                    <div className="relative w-full max-w-3xl glass-card bg-[var(--background)] border border-[var(--glass-border-light)] rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
                        
                        {/* Header Tabs */}
                        <div className="flex border-b border-[var(--glass-border)] bg-[var(--table-header)]">
                            <button
                                className={`flex-1 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === 'upload' ? 'border-blue-600 text-blue-600 bg-blue-600/5' : 'border-transparent text-muted-foreground hover:text-[hsl(var(--foreground))] hover:bg-black/5'}`}
                                onClick={() => setActiveTab('upload')}
                            >
                                <Upload size={18} /> Upload Local File
                            </button>
                            <button
                                className={`flex-1 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === 'gallery' ? 'border-emerald-600 text-emerald-600 bg-emerald-600/5' : 'border-transparent text-muted-foreground hover:text-[hsl(var(--foreground))] hover:bg-black/5'}`}
                                onClick={() => setActiveTab('gallery')}
                            >
                                <Grid size={18} /> Choose from Gallery
                            </button>
                            <button onClick={() => !isUploading && setShowModal(false)} className="absolute top-3 right-4 p-2 text-muted-foreground hover:bg-[var(--glass-border)] rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-[var(--background)]">
                            {activeTab === 'upload' ? (
                                <div className="h-full flex flex-col items-center justify-center py-10">
                                    <div 
                                        className="w-full max-w-md border-2 border-dashed border-[var(--glass-border)] hover:border-blue-500 bg-white/5 rounded-3xl p-10 flex flex-col items-center text-center cursor-pointer transition-colors"
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            className="hidden" 
                                            accept="image/*" 
                                            multiple={multiple}
                                        />
                                        <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6">
                                            {isUploading ? (
                                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Upload size={32} />
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Click to Upload</h3>
                                        <p className="text-sm text-muted-foreground">Supported formats: JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {isFetching ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                <div key={i} className="aspect-square rounded-xl bg-[var(--glass-border)] animate-pulse" />
                                            ))}
                                        </div>
                                    ) : galleryImages.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {galleryImages.map((img) => {
                                                const isSelected = tempSelected.includes(img.url);
                                                return (
                                                    <div 
                                                        key={img.id} 
                                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                                                            isSelected ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-transparent hover:border-white/20'
                                                        }`}
                                                        onClick={() => toggleGalleryImage(img.url)}
                                                    >
                                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                                        <div className={`absolute inset-0 bg-black/40 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                                        
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            {isSelected ? (
                                                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform scale-100 transition-transform cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleGalleryImage(img.url); }}>
                                                                    <CheckCircle2 size={18} className="text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleGalleryImage(img.url); }}>
                                                                    <Plus size={18} className="text-white" />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => setPreviewUrl(img.url)}
                                                                    className="p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/80 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                                                                    title="View Full Image"
                                                                >
                                                                    <Maximize2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-[var(--glass-border)] rounded-full flex items-center justify-center mb-4">
                                                <ImageIcon size={32} className="text-muted-foreground" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">No Images Found</h3>
                                            <p className="text-muted-foreground text-sm">You haven't uploaded any images to your gallery yet.</p>
                                            <button 
                                                className="mt-6 px-6 py-2 bg-blue-600/10 text-blue-600 font-bold rounded-lg"
                                                onClick={() => setActiveTab('upload')}
                                            >
                                                Upload Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer (Only for Gallery selection) */}
                        {activeTab === 'gallery' && (
                            <div className="p-5 border-t border-[var(--glass-border)] bg-[var(--table-header)] flex items-center justify-between">
                                <div className="text-sm font-semibold text-muted-foreground">
                                    <span className="text-[hsl(var(--foreground))]">{tempSelected.length}</span> selected {multiple ? `(max ${maxImages})` : ''}
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--glass-border)] transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirm}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg transition-all active:scale-95 text-sm"
                                    >
                                        Confirm Selection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Modal for MediaSelector */}
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
    );
}
