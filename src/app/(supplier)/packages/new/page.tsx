'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import {
    Map, Package, IndianRupee, Clock, ListChecks, Calendar, 
    Image as ImageIcon, Plus, Trash2, ArrowRight, ArrowLeft, 
    Save, Info, CheckCircle2, Upload, X, MapPin, Grid
} from 'lucide-react';
import api from '@/lib/api';
import MediaSelector from '@/components/ui/MediaSelector';

export default function CreatePackagePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Leisure',
        destinations: '',
        duration: '',
        basePrice: '',
        salePrice: '',
        description: '',
        inclusions: ['Hotel Stay', 'Breakfast', 'Sightseeing'],
        exclusions: ['Airfare', 'Lunch', 'Personal Expenses'],
    });

    const [itinerary, setItinerary] = useState([
        { day: 1, title: 'Arrival', description: '' }
    ]);

    // Media State
    const [images, setImages] = useState<string[]>([]); // URLs of selected images

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addListItem = (type: 'inclusions' | 'exclusions') => {
        setFormData(prev => ({ ...prev, [type]: [...prev[type], ''] }));
    };

    const updateListItem = (type: 'inclusions' | 'exclusions', index: number, value: string) => {
        const newList = [...formData[type]];
        newList[index] = value;
        setFormData(prev => ({ ...prev, [type]: newList }));
    };

    const removeListItem = (type: 'inclusions' | 'exclusions', index: number) => {
        setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
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

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const submitData = {
                ...formData,
                destinations: formData.destinations.split(',').map(d => d.trim()),
                inclusions: formData.inclusions.map(i => i.trim()).filter(i => i !== ''),
                exclusions: formData.exclusions.map(e => e.trim()).filter(e => e !== ''),
                itinerary,
                images, // Send selected image URLs
                status: 'ACTIVE'
            };

            await api.post('/packages', submitData);
            router.push('/packages/listing');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create package');
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
                                    placeholder="e.g. Magical Himachal Getaway"
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
                                    placeholder="e.g. Shimla, Manali"
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
                                    placeholder="e.g. 5 Days, 4 Nights"
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Detailed Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                placeholder="Write a compelling description for your package..."
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
                                    placeholder="e.g. 25000"
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <IndianRupee size={16} className="text-emerald-500" /> Sale Price (INR) - Optional
                                </label>
                                <input
                                    name="salePrice"
                                    type="number"
                                    value={formData.salePrice}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 19999"
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
                                {formData.inclusions.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 group">
                                        <input
                                            value={item}
                                            onChange={(e) => updateListItem('inclusions', index, e.target.value)}
                                            className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                            placeholder="Enter inclusion item..."
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
                                {formData.exclusions.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 group">
                                        <input
                                            value={item}
                                            onChange={(e) => updateListItem('exclusions', index, e.target.value)}
                                            className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                                            placeholder="Enter exclusion item..."
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
                                <Calendar className="text-blue-600" /> Day-by-Day Itinerary
                            </h3>
                            <button
                                onClick={addItineraryDay}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95"
                            >
                                <Plus size={18} /> Add Day
                            </button>
                        </div>
                        <div className="space-y-4">
                            {itinerary.map((day, index) => (
                                <div key={index} className="glass-card p-5 border border-[var(--glass-border)] space-y-4 group relative hover:border-blue-600/30 transition-all shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                                                {day.day}
                                            </div>
                                            <input
                                                value={day.title}
                                                onChange={(e) => updateItinerary(index, 'title', e.target.value)}
                                                className="bg-transparent border-b border-white/5 focus:border-blue-600 outline-none font-bold text-lg py-1 px-0 transition-all w-full md:w-96"
                                                placeholder="Day Title (e.g. Arrival in Shimla)"
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
                                        value={day.description}
                                        onChange={(e) => updateItinerary(index, 'description', e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none"
                                        placeholder="Describe the activities for this day..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <MediaSelector 
                            selectedImages={images} 
                            onSelect={setImages}
                            multiple={true}
                            maxImages={10}
                            category="Tour Package"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Topbar
                title="Create New Package"
                subtitle="Design a memorable experience for your travelers"
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
                                    ? 'opacity-0 pointer-events-none' 
                                    : 'bg-[var(--glass-bg)] hover:bg-[var(--table-header)] text-[hsl(var(--foreground))] border border-[var(--glass-border)]'
                            }`}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        <div className="flex items-center gap-3">
                            {step < 5 ? (
                                <button
                                    onClick={nextStep}
                                    className="btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl shadow-xl transition-all active:scale-95"
                                >
                                    <span>Continue</span>
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    <span>Create Package</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
