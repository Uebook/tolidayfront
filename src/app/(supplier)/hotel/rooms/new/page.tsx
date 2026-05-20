'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { BedDouble, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import MediaPicker from '@/components/media/MediaPicker';

export default function NewRoomPage() {
       const router = useRouter();
       const queryClient = useQueryClient();
       const [error, setError] = useState<string | null>(null);

       const [formData, setFormData] = useState({
              name: '',
              description: '',
              price: '',
              capacity: '2',
              extraPersonPrice: '0',
              images: [] as string[],
              size: '',
              amenities: [] as string[],
              totalRooms: '10',
       });

       const mutation = useMutation({
              mutationFn: async (data: any) => {
                     const payload = {
                            ...data,
                            price: parseFloat(data.price),
                            capacity: parseInt(data.capacity),
                            extraPersonPrice: parseFloat(data.extraPersonPrice) || 0,
                            totalRooms: parseInt(data.totalRooms) || 10,
                     };
                     return await api.post('/room-types', payload);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['room-types'] });
                     router.push('/hotel/rooms');
              },
              onError: (err: any) => {
                     setError(err.response?.data?.message || 'Failed to create room type');
              },
       });

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              setError(null);
              if (!formData.name || !formData.price || !formData.capacity) {
                     setError('Please fill in all required fields');
                     return;
              }
              mutation.mutate(formData);
       };

       const availableAmenities = [
              "Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Mini-bar",
              "Coffee machine", "Safe", "Ensuite bathroom", "Balcony", "Sea view"
       ];

       const toggleAmenity = (amenity: string) => {
              setFormData(prev => ({
                     ...prev,
                     amenities: prev.amenities.includes(amenity)
                            ? prev.amenities.filter(a => a !== amenity)
                            : [...prev.amenities, amenity]
              }));
       };

       return (
              <div className="animate-fadeIn">
                     <Topbar title="Add New Room Category" subtitle="Define a new room type for your property" />

                     <div className="p-6 max-w-4xl">
                            <Link href="/hotel/rooms" className="inline-flex items-center gap-2 text-sm mb-6 hover:text-[hsl(var(--accent))] transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                   <ArrowLeft size={16} /> Back to Categories
                            </Link>

                            <div className="glass-card p-8">
                                   <form onSubmit={handleSubmit} className="space-y-6">
                                          {error && (
                                                 <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm">
                                                        <AlertCircle size={16} />
                                                        {error}
                                                 </div>
                                          )}

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                 {/* Room Name */}
                                                 <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Room Category Name *</label>
                                                        <input
                                                               type="text"
                                                               placeholder="e.g. Deluxe King Suite"
                                                               className="form-input w-full"
                                                               value={formData.name}
                                                               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        />
                                                        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Enter a descriptive name for this room type</p>
                                                 </div>

                                                 {/* Base Price */}
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Base Price (₹) *</label>
                                                        <input
                                                               type="number"
                                                               placeholder="0.00"
                                                               className="form-input w-full"
                                                               value={formData.price}
                                                               onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                        />
                                                 </div>

                                                 {/* Capacity */}
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Max Capacity (Guests) *</label>
                                                        <input
                                                               type="number"
                                                               placeholder="2"
                                                               className="form-input w-full"
                                                               value={formData.capacity}
                                                               onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                                        />
                                                 </div>

                                                 {/* Extra Person Price */}
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Extra Person Charge (₹)</label>
                                                        <input
                                                               type="number"
                                                               placeholder="0.00"
                                                               className="form-input w-full"
                                                               value={formData.extraPersonPrice}
                                                               onChange={(e) => setFormData({ ...formData, extraPersonPrice: e.target.value })}
                                                        />
                                                 </div>

                                                 {/* Room Size */}
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Room Size (sq ft)</label>
                                                        <input
                                                               type="text"
                                                               placeholder="e.g. 350"
                                                               className="form-input w-full"
                                                               value={formData.size}
                                                               onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                                        />
                                                 </div>

                                                 {/* Total Rooms */}
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Total Rooms of this type *</label>
                                                        <input
                                                               type="number"
                                                               placeholder="10"
                                                               className="form-input w-full"
                                                               value={formData.totalRooms}
                                                               onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                                                        />
                                                 </div>

                                                 {/* Description */}
                                                 <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Description</label>
                                                        <textarea
                                                               placeholder="Describe the amenities, view, and unique features of this room..."
                                                               className="form-input w-full min-h-[120px]"
                                                               value={formData.description}
                                                               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        />
                                                 </div>

                                                 {/* Amenities */}
                                                 <div className="space-y-4 md:col-span-2">
                                                        <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Amenities</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                               {availableAmenities.map((amenity) => (
                                                                      <button
                                                                             key={amenity}
                                                                             type="button"
                                                                             onClick={() => toggleAmenity(amenity)}
                                                                             className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all border ${formData.amenities.includes(amenity)
                                                                                           ? 'bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                                                                                           : 'bg-white/5 border-[var(--glass-border)] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--muted-foreground))]'
                                                                                    }`}
                                                                      >
                                                                             <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.amenities.includes(amenity)
                                                                                           ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))]'
                                                                                           : 'border-[hsl(var(--muted-foreground))]'
                                                                                    }`}>
                                                                                    {formData.amenities.includes(amenity) && (
                                                                                           <div className="w-2 h-2 bg-white rounded-full" />
                                                                                    )}
                                                                             </div>
                                                                             {amenity}
                                                                      </button>
                                                               ))}
                                                        </div>
                                                 </div>

                                                 {/* Photos */}
                                                 <div className="space-y-4 md:col-span-2 pt-4">
                                                        <div>
                                                               <label className="text-sm font-medium block mb-1" style={{ color: 'hsl(var(--foreground))' }}>Room Photos</label>
                                                               <p className="text-xs mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>Add up to 10 photos of this room category</p>
                                                        </div>
                                                        <MediaPicker
                                                               selectedUrls={formData.images}
                                                               onSelect={(urls) => setFormData({ ...formData, images: urls })}
                                                        />
                                                 </div>
                                          </div>

                                          <div className="pt-6 border-t border-[var(--glass-border)] flex justify-end gap-4">
                                                 <Link href="/hotel/rooms">
                                                        <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--table-header)] transition-colors" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--foreground))' }}>
                                                               Cancel
                                                        </button>
                                                 </Link>
                                                 <button
                                                        type="submit"
                                                        disabled={mutation.isPending}
                                                        className="btn-primary flex items-center gap-2 px-8 py-2.5 text-sm font-bold disabled:opacity-50"
                                                 >
                                                        {mutation.isPending ? 'Saving...' : (
                                                               <>
                                                                      <Save size={18} /> Save Room Category
                                                               </>
                                                        )}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </div>
              </div>
       );
}
