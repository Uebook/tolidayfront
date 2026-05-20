'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import {
    Map, Package, IndianRupee, Clock, ListChecks, Calendar, 
    Image as ImageIcon, Plus, Trash2, ArrowRight, ArrowLeft, 
    Save, Info, CheckCircle2, Upload, X, MapPin, Grid
} from 'lucide-react';
import api from '@/lib/api';

export default function PackageDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState<any>({
        title: '',
        category: 'Leisure',
        destinations: '',
        duration: '',
        basePrice: '',
        salePrice: '',
        description: '',
        inclusions: [],
        exclusions: [],
    });

    const [itinerary, setItinerary] = useState<any[]>([]);

    // Media State
    const [images, setImages] = useState<string[]>([]);
    const [galleryImages, setGalleryImages] = useState<any[]>([]);
    const [showGallery, setShowGallery] = useState(false);
    const [isFetchingGallery, setIsFetchingGallery] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get(`/packages/${id}`);
                const data = res.data;
                setFormData({
                    title: data.title || '',
                    category: data.category || 'Leisure',
                    destinations: Array.isArray(data.destinations) ? data.destinations.join(', ') : (data.destinations || ''),
                    duration: data.duration || '',
                    basePrice: data.basePrice || '',
                    salePrice: data.salePrice || '',
                    description: data.description || '',
                    inclusions: data.inclusions || [],
                    exclusions: data.exclusions || [],
                });
                setItinerary(data.itinerary || []);
                setImages(data.images || []);
            } catch (err) {
                setError('Failed to load package data');
            } finally {
                setIsFetching(false);
            }
        };
        loadData();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const addListItem = (type: 'inclusions' | 'exclusions') => {
        setFormData((prev: any) => ({ ...prev, [type]: [...prev[type], ''] }));
    };

    const updateListItem = (type: 'inclusions' | 'exclusions', index: number, value: string) => {
        const newList = [...formData[type]];
        newList[index] = value;
        setFormData((prev: any) => ({ ...prev, [type]: newList }));
    };

    const removeListItem = (type: 'inclusions' | 'exclusions', index: number) => {
        setFormData((prev: any) => ({ ...prev, [type]: prev[type].filter((_: any, i: number) => i !== index) }));
    };

    const addItineraryDay = () => {
        setItinerary([...itinerary, { day: itinerary.length + 1, title: '', description: '' }]);
    };

    const updateItinerary = (index: number, field: string, value: string) => {
        const newItinerary = [...itinerary];
        newItinerary[index] = { ...newItinerary[index], [field]: value };
        setItinerary(newItinerary);
    };

    const removeItineraryDay = (index: number) => {
        setItinerary(itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 })));
    };

    // Gallery Logic
    const fetchGallery = async () => {
        setIsFetchingGallery(true);
        try {
            const res = await api.get('/media');
            setGalleryImages(res.data);
        } catch (err) {
            console.error('Failed to fetch gallery', err);
        } finally {
            setIsFetchingGallery(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsLoading(true);
        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('category', 'Tour Package');

        try {
            const res = await api.post('/media/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImages(prev => [...prev, res.data.url]);
        } catch (err) {
            alert('Upload failed');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGalleryImage = (url: string) => {
        setImages(prev => 
            prev.includes(url) ? prev.filter(img => img !== url) : [...prev, url]
        );
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const submitData = {
                ...formData,
                destinations: typeof formData.destinations === 'string' ? formData.destinations.split(',').map((d: string) => d.trim()) : formData.destinations,
                itinerary,
                images
            };

            await api.patch(`/packages/${id}`, submitData);
            router.push('/packages/listing');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update package');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <Package size={16} className="text-blue-600" /> Package Name
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-600" /> Destinations
                                </label>
                                <input
                                    name="destinations"
                                    value={formData.destinations}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <Info size={16} className="text-blue-600" /> Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                >
                                    <option>Leisure</option>
                                    <option>Adventure</option>
                                    <option>Honeymoon</option>
                                    <option>Family</option>
                                    <option>Spiritual</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <Clock size={16} className="text-blue-600" /> Duration
                                </label>
                                <input
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Detailed Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm resize-none"
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <IndianRupee size={16} className="text-blue-600" /> Base Price (INR)
                                </label>
                                <input
                                    name="basePrice"
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <IndianRupee size={16} className="text-emerald-500" /> Sale Price (INR)
                                </label>
                                <input
                                    name="salePrice"
                                    type="number"
                                    value={formData.salePrice}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <ListChecks className="text-emerald-500" /> Inclusions
                                </h3>
                                <button
                                    onClick={() => addListItem('inclusions')}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-500/20"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.inclusions.map((item: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2 group">
                                        <input
                                            value={item}
                                            onChange={(e) => updateListItem('inclusions', index, e.target.value)}
                                            className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                        />
                                        <button
                                            onClick={() => removeListItem('inclusions', index)}
                                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <X className="text-red-500" /> Exclusions
                                </h3>
                                <button
                                    onClick={() => addListItem('exclusions')}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-500/20"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.exclusions.map((item: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2 group">
                                        <input
                                            value={item}
                                            onChange={(e) => updateListItem('exclusions', index, e.target.value)}
                                            className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                                        />
                                        <button
                                            onClick={() => removeListItem('exclusions', index)}
                                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Calendar className="text-blue-600" /> Itinerary
                            </h3>
                            <button
                                onClick={addItineraryDay}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95"
                            >
                                <Plus size={18} /> Add Day
                            </button>
                        </div>
                        <div className="space-y-4">
                            {itinerary.map((day: any, index: number) => (
                                <div key={index} className="glass-card p-5 border border-[var(--glass-border)] space-y-4 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                                                {day.day}
                                            </div>
                                            <input
                                                value={day.title}
                                                onChange={(e) => updateItinerary(index, 'title', e.target.value)}
                                                className="bg-transparent border-b border-white/5 focus:border-blue-600 outline-none font-bold text-lg py-1 px-0 transition-all w-full md:w-96"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeItineraryDay(index)}
                                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <textarea
                                        value={day.description || ''}
                                        onChange={(e) => updateItinerary(index, 'description', e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-3xl p-8 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-inner"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={24} />
                                </div>
                                <h3 className="font-bold text-lg">Upload New Image</h3>
                                <p className="text-muted-foreground text-xs">Directly from your device</p>
                            </div>

                            <div 
                                className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-3xl p-8 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-inner"
                                onClick={() => { setShowGallery(true); fetchGallery(); }}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Grid size={24} />
                                </div>
                                <h3 className="font-bold text-lg">Select from Gallery</h3>
                                <p className="text-muted-foreground text-xs">Choose from already uploaded images</p>
                            </div>
                        </div>

                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-lg group">
                                        <img src={img} alt="Selected" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Topbar
                title="Edit Package"
                subtitle={formData.title || "Manage your package information"}
            />

            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
                {/* Step Indicator */}
                <div className="flex items-center justify-between px-4 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--glass-border)] -z-10 -translate-y-1/2 mx-10" />
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${
                                    step >= s 
                                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                        : 'bg-white border-slate-200 text-slate-400 shadow-sm'
                                }`}
                            >
                                {step > s ? <CheckCircle2 size={18} /> : s}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider hidden md:block ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
                                {['Info', 'Pricing', 'Included', 'Itinerary', 'Media'][s-1]}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="glass-card p-8 border border-[var(--glass-border)] shadow-2xl rounded-[32px]">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
                            <X size={18} /> {error}
                        </div>
                    )}

                    {renderStep()}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--glass-border)]">
                        <button
                            onClick={prevStep}
                            disabled={step === 1 || isLoading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-semibold ${
                                step === 1 
                                    ? 'bg-[var(--glass-bg)] hover:bg-[var(--table-header)] text-[hsl(var(--foreground))] border border-[var(--glass-border)]' 
                                    : 'bg-[var(--glass-bg)] hover:bg-[var(--table-header)] text-[hsl(var(--foreground))] border border-[var(--glass-border)]'
                            }`}
                        >
                            {step === 1 ? (
                                <span onClick={() => router.push('/packages/listing')} className="flex items-center gap-2">
                                    <ArrowLeft size={18} /> Back to List
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <ArrowLeft size={18} /> Previous
                                </span>
                            )}
                        </button>

                        <div className="flex items-center gap-3">
                            {step < 5 ? (
                                <button
                                    onClick={nextStep}
                                    className="btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl shadow-xl transition-all"
                                >
                                    <span>Next</span>
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-xl transition-all disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    <span>Update Package</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Selection Modal */}
            {showGallery && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGallery(false)} />
                    <div className="relative w-full max-w-4xl glass-card border border-white/10 rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">Select from Gallery</h3>
                                <p className="text-xs text-muted-foreground mt-1">Choose images to add to your package</p>
                            </div>
                            <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                            {isFetchingGallery ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
                                    ))}
                                </div>
                            ) : galleryImages.length > 0 ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                    {galleryImages.map((img) => (
                                        <div 
                                            key={img.id} 
                                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                                                images.includes(img.url) ? 'border-blue-600 ring-4 ring-blue-600/20' : 'border-transparent hover:border-white/20'
                                            }`}
                                            onClick={() => toggleGalleryImage(img.url)}
                                        >
                                            <img src={img.url} className="w-full h-full object-cover" />
                                            {images.includes(img.url) && (
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                    <CheckCircle2 size={14} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <ImageIcon size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                                    <p className="text-muted-foreground">No images found in gallery.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={() => setShowGallery(false)}
                                className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                            >
                                Done Selecting
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
