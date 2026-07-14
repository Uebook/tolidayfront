'use client';

import Topbar from '@/components/layout/Topbar';
import { MapPin, Star, Clock, Users, Baby, Phone, Mail, Globe, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import MediaPicker from '@/components/media/MediaPicker';

const amenityOptions = [
    { id: 'wifi', label: 'Free WiFi', icon: '📶' },
    { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
    { id: 'gym', label: 'Fitness Center', icon: '💪' },
    { id: 'spa', label: 'Spa & Wellness', icon: '🧖' },
    { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
    { id: 'bar', label: 'Bar & Lounge', icon: '🍸' },
    { id: 'parking', label: 'Free Parking', icon: '🅿️' },
    { id: 'airport', label: 'Airport Shuttle', icon: '✈️' },
    { id: 'room_service', label: 'Room Service', icon: '🛎️' },
    { id: 'laundry', label: 'Laundry Service', icon: '👔' },
    { id: 'conference', label: 'Conference Room', icon: '🏛️' },
    { id: 'ev', label: 'EV Charging', icon: '⚡' },
    { id: 'pets', label: 'Pet Friendly', icon: '🐾' },
    { id: 'ac', label: 'Central AC', icon: '❄️' },
];

export default function PropertyPage() {
    const queryClient = useQueryClient();
    const [stars, setStars] = useState(3);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'details' | 'policies' | 'amenities' | 'images'>('details');

    // Form inputs state
    const [formData, setFormData] = useState({
        name: '', description: '', contactNumber: '', email: '', website: '',
        address: '', city: '', pinCode: '', checkInTime: '', checkOutTime: '',
        maxAdults: '', maxChildren: '', childPolicy: '', cancellationPolicy: '', petPolicy: '',
        coupleRules: '', mustReadRules: '', otherRules: '',
        images: [] as string[],
        latitude: '', longitude: ''
    });

    const { data: hotel, isLoading } = useQuery({
        queryKey: ['my-hotel'],
        queryFn: async () => {
            const res = await api.get('/hotel/my-hotel');
            return res.data;
        },
    });

    useEffect(() => {
        if (hotel) {
            setStars(hotel.stars || 3);
            setSelectedAmenities(hotel.amenities || []);
            
            const pRules = hotel.propertyRules || [];
            const coupleRules = pRules.filter((r: string) => r.startsWith('Guest Profile|')).map((r: string) => r.split('|')[1]).join('\n');
            const mustReadRules = pRules.filter((r: string) => r.startsWith('Must Read Rules|')).map((r: string) => r.split('|')[1]).join('\n');
            const otherRules = pRules.filter((r: string) => !r.startsWith('Guest Profile|') && !r.startsWith('Must Read Rules|')).map((r: string) => r.includes('|') ? r.split('|')[1] : r).join('\n');

            setFormData({
                name: hotel.name || '', description: hotel.description || '',
                contactNumber: hotel.contactNumber || '', email: hotel.email || '', website: hotel.website || '',
                address: hotel.address || '', city: hotel.city || '', pinCode: hotel.pinCode || '',
                checkInTime: hotel.checkInTime || '', checkOutTime: hotel.checkOutTime || '',
                maxAdults: hotel.maxAdults || '', maxChildren: hotel.maxChildren || '',
                childPolicy: hotel.childPolicy || '', cancellationPolicy: hotel.cancellationPolicy || '', petPolicy: hotel.petPolicy || '',
                coupleRules, mustReadRules, otherRules,
                images: hotel.images || [],
                latitude: hotel.latitude !== null && hotel.latitude !== undefined ? String(hotel.latitude) : '',
                longitude: hotel.longitude !== null && hotel.longitude !== undefined ? String(hotel.longitude) : '',
            });
        }
    }, [hotel]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            await api.patch('/hotel/my-hotel', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-hotel'] });
            alert('Property details saved successfully!');
        }
    });

    const handleSave = () => {
        const rules = [
            ...formData.coupleRules.split('\n').filter(Boolean).map(r => `Guest Profile|${r.trim()}`),
            ...formData.mustReadRules.split('\n').filter(Boolean).map(r => `Must Read Rules|${r.trim()}`),
            ...formData.otherRules.split('\n').filter(Boolean).map(r => r.trim())
        ];

        const { coupleRules, mustReadRules, otherRules, ...validData } = formData;

        mutation.mutate({ 
            ...validData, 
            propertyRules: rules,
            stars, 
            amenities: selectedAmenities,
            latitude: validData.latitude ? parseFloat(validData.latitude as string) : null,
            longitude: validData.longitude ? parseFloat(validData.longitude as string) : null
        });
    };

    const toggleAmenity = (id: string) => {
        setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Property Details" subtitle="Manage your hotel information and guest-facing content" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                    {(['details', 'policies', 'amenities', 'images'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                            style={{ background: activeTab === tab ? 'var(--glass-border)' : 'transparent', color: 'hsl(var(--muted-foreground))' }}
                        >
                            {tab === 'details' ? 'Details' : tab === 'policies' ? 'Policies' : tab === 'amenities' ? 'Amenities' : 'Gallery'}
                        </button>
                    ))}
                </div>

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fadeIn">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">Basic Information</h3>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Hotel Name</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-input min-h-[100px] resize-y" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Star Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setStars(s)}>
                                            <Star size={24} fill={s <= stars ? 'hsl(38 92% 50%)' : 'transparent'} color={s <= stars ? 'hsl(38 92% 50%)' : 'var(--glass-border)'} />
                                        </button>
                                    ))}
                                    <span className="ml-2 self-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{stars} Star Hotel</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Phone</label>
                                    <input value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className="form-input" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Email</label>
                                    <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Website</label>
                                    <input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="form-input" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 space-y-4">
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">Location</h3>
                            {/* Map placeholder */}
                            <div className="rounded-xl overflow-hidden flex items-center justify-center" style={{ height: 200, background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                                <div className="text-center">
                                    <MapPin size={32} style={{ color: 'hsl(var(--accent))' }} className="mx-auto mb-2" />
                                    <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Google Maps Integration</p>
                                    <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Map Coordinates will appear here</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Full Address</label>
                                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="form-input min-h-[80px] resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">City</label>
                                    <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="form-input" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Pin Code</label>
                                    <input value={formData.pinCode} onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })} className="form-input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Latitude</label>
                                    <input value={formData.latitude} placeholder="e.g. 28.6139" onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="form-input" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Longitude</label>
                                    <input value={formData.longitude} placeholder="e.g. 77.2090" onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="form-input" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Policies Tab */}
                {activeTab === 'policies' && (
                    <div className="glass-card p-6 space-y-5 animate-fadeIn">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Hotel Policies</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center gap-1.5"><Clock size={12} /> Check-in Time</label>
                                <input value={formData.checkInTime} onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center gap-1.5"><Clock size={12} /> Check-out Time</label>
                                <input value={formData.checkOutTime} onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center gap-1.5"><Users size={12} /> Max Adults/Room</label>
                                <input value={formData.maxAdults} onChange={(e) => setFormData({ ...formData, maxAdults: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center gap-1.5"><Baby size={12} /> Max Children/Room</label>
                                <input value={formData.maxChildren} onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value })} className="form-input" />
                            </div>
                        </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Child Policy</label>
                                <textarea value={formData.childPolicy} onChange={(e) => setFormData({ ...formData, childPolicy: e.target.value })} className="form-input min-h-[80px] resize-none" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Cancellation Policy</label>
                                <textarea value={formData.cancellationPolicy} onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })} className="form-input min-h-[80px] resize-none" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Pet Policy</label>
                                <textarea value={formData.petPolicy} onChange={(e) => setFormData({ ...formData, petPolicy: e.target.value })} className="form-input min-h-[80px] resize-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Couple/Bachelor Rules</label>
                                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">Enter couple or bachelor specific rules.</p>
                                <textarea value={formData.coupleRules} onChange={(e) => setFormData({ ...formData, coupleRules: e.target.value })} placeholder="e.g. Unmarried couples allowed. Local ids are allowed." className="form-input min-h-[60px] resize-y" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Must Read Rules</label>
                                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">Enter each rule on a new line.</p>
                                <textarea value={formData.mustReadRules} onChange={(e) => setFormData({ ...formData, mustReadRules: e.target.value })} placeholder="e.g. Primary Guest should be atleast 18 years of age." className="form-input min-h-[80px] resize-y" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Other Property Rules</label>
                                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">Enter each rule on a new line (e.g., breakfast fees, incidental charges).</p>
                                <textarea value={formData.otherRules} onChange={(e) => setFormData({ ...formData, otherRules: e.target.value })} placeholder="e.g. Extra-person charges may apply..." className="form-input min-h-[80px] resize-y" />
                            </div>
                        </div>
                )}

                {/* Amenities Tab */}
                {activeTab === 'amenities' && (
                    <div className="glass-card p-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">Amenities ({selectedAmenities.length} selected)</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                            {amenityOptions.map((a) => {
                                const active = selectedAmenities.includes(a.id);
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => toggleAmenity(a.id)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all"
                                        style={{
                                            background: active ? 'hsl(199 89% 48% / 0.15)' : 'var(--glass-border-light)',
                                            border: `1px solid ${active ? 'hsl(199 89% 48% / 0.4)' : 'var(--glass-border-light)'}`,
                                            transform: active ? 'scale(1.02)' : 'scale(1)',
                                        }}
                                    >
                                        <span className="text-2xl">{a.icon}</span>
                                        <span className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{a.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Images Tab */}
                {activeTab === 'images' && (
                    <div className="glass-card p-6 space-y-4 animate-fadeIn">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Property Photos</h3>
                        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            Upload high-resolution images of your property. These images will be featured on the customer-facing website listing.
                        </p>
                        <MediaPicker
                            selectedUrls={formData.images}
                            onSelect={(urls) => setFormData({ ...formData, images: urls })}
                        />
                    </div>
                )}

                {/* Save */}
                <div className="flex justify-end">
                    <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                        <Save size={16} /> {mutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
}
