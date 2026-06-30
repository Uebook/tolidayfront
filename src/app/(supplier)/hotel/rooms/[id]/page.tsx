'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { BedDouble, ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import MediaSelector from '@/components/ui/MediaSelector';

export default function EditRoomPage() {
       const router = useRouter();
       const params = useParams();
       const { id } = params;
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

       const { data: room, isLoading } = useQuery({
              queryKey: ['room-type', id],
              queryFn: async () => {
                     const res = await api.get(`/room-types/${id}`);
                     return res.data;
              },
       });

       useEffect(() => {
              if (room) {
                     setFormData({
                            name: room.name || '',
                            description: room.description || '',
                            price: room.price?.toString() || '',
                            capacity: room.capacity?.toString() || '2',
                            extraPersonPrice: room.extraPersonPrice?.toString() || '0',
                            images: room.images || [],
                            size: room.size || '',
                            amenities: room.amenities || [],
                            totalRooms: room.totalRooms?.toString() || '10',
                     });
              }
       }, [room]);

       const updateMutation = useMutation({
              mutationFn: async (data: any) => {
                     const payload = {
                            ...data,
                            price: parseFloat(data.price),
                            capacity: parseInt(data.capacity),
                            extraPersonPrice: parseFloat(data.extraPersonPrice) || 0,
                            totalRooms: parseInt(data.totalRooms) || 10,
                     };
                     return await api.patch(`/room-types/${id}`, payload);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['room-types'] });
                     queryClient.invalidateQueries({ queryKey: ['room-type', id] });
                     router.push('/hotel/rooms');
              },
              onError: (err: any) => {
                     setError(err.response?.data?.message || 'Failed to update room type');
              },
       });

       const deleteMutation = useMutation({
              mutationFn: async () => {
                     return await api.delete(`/room-types/${id}`);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['room-types'] });
                     router.push('/hotel/rooms');
              },
              onError: (err: any) => {
                     setError(err.response?.data?.message || 'Failed to delete room type');
              },
       });

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              setError(null);
              if (!formData.name || !formData.price || !formData.capacity) {
                     setError('Please fill in all required fields');
                     return;
              }
              updateMutation.mutate(formData);
       };

       const handleDelete = () => {
              if (confirm('Are you sure you want to delete this room type? This action cannot be undone.')) {
                     deleteMutation.mutate();
              }
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

       // Linked Rooms Logic
       const { data: rooms = [], refetch: refetchRooms } = useQuery({
              queryKey: ['hotel-rooms'],
              queryFn: async () => {
                     const res = await api.get('/rooms');
                     return res.data;
              }
       });
       const linkedRooms = rooms.filter((r: any) => r.roomTypeId === id);
       const [newRoomNumbers, setNewRoomNumbers] = useState('');
       const [isAddingRooms, setIsAddingRooms] = useState(false);

       const handleAddRooms = async () => {
              if (!newRoomNumbers.trim()) return;
              setIsAddingRooms(true);
              try {
                     const numbers = newRoomNumbers.split(',').map(n => n.trim()).filter(n => n);
                     for (const num of numbers) {
                            if (linkedRooms.find((r: any) => r.roomNumber === num)) continue;
                            await api.post('/rooms', { roomNumber: num, roomTypeId: id, status: 'AVAILABLE', floor: '' });
                     }
                     setNewRoomNumbers('');
                     refetchRooms();
              } catch (err) {
                     alert('Failed to add some rooms. They might already exist or be in use.');
              } finally {
                     setIsAddingRooms(false);
              }
       };

       const handleRemoveRoom = async (roomId: string) => {
              if (confirm('Are you sure you want to delete this physical room?')) {
                     try {
                            await api.delete(`/rooms/${roomId}`);
                            refetchRooms();
                     } catch(err) {
                            alert('Failed to remove room.');
                     }
              }
       };

       if (isLoading) {
              return (
                     <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                     </div>
              );
       }

       return (
              <div className="animate-fadeIn">
                     <Topbar title="Edit Room Category" subtitle={`Managing ${formData.name || 'Room Type'}`} />

                     <div className="p-6 max-w-4xl">
                            <div className="flex items-center justify-between mb-6">
                                   <Link href="/hotel/rooms" className="inline-flex items-center gap-2 text-sm hover:text-[hsl(var(--accent))] transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                          <ArrowLeft size={16} /> Back to Categories
                                   </Link>
                                   <button
                                          onClick={handleDelete}
                                          disabled={deleteMutation.isPending}
                                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/20"
                                   >
                                          <Trash2 size={16} /> {deleteMutation.isPending ? 'Deleting...' : 'Delete Category'}
                                   </button>
                            </div>

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

                                                 {/* Linked Rooms Management */}
                                                 <div className="space-y-4 md:col-span-2 pt-4 border-t border-[var(--glass-border)]">
                                                        <div>
                                                               <label className="text-sm font-medium block mb-1" style={{ color: 'hsl(var(--foreground))' }}>Linked Room Numbers</label>
                                                               <p className="text-xs mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>Add actual physical room numbers (e.g., 101, 102, 103) to link them to this category. This generates the actual rooms for housekeeping and bookings.</p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                               <input 
                                                                      type="text" 
                                                                      placeholder="Enter room numbers separated by commas..."
                                                                      className="form-input flex-1"
                                                                      value={newRoomNumbers}
                                                                      onChange={e => setNewRoomNumbers(e.target.value)}
                                                               />
                                                               <button 
                                                                      type="button" 
                                                                      onClick={handleAddRooms}
                                                                      disabled={isAddingRooms}
                                                                      className="px-5 py-2.5 bg-[hsl(var(--accent))] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                                                               >
                                                                      {isAddingRooms ? 'Adding...' : 'Link Rooms'}
                                                               </button>
                                                        </div>
                                                        
                                                        {linkedRooms.length > 0 && (
                                                               <div className="flex flex-wrap gap-2 mt-4">
                                                                      {linkedRooms.map((r: any) => (
                                                                             <div key={r.id} className="flex items-center gap-2 bg-[var(--table-header)] border border-[var(--glass-border)] px-3 py-1.5 rounded-lg text-sm text-[hsl(var(--foreground))]">
                                                                                    <span className="font-bold">{r.roomNumber}</span>
                                                                                    <button 
                                                                                           type="button" 
                                                                                           onClick={() => handleRemoveRoom(r.id)}
                                                                                           className="text-red-500 hover:text-red-700 ml-1 transition-colors"
                                                                                    >
                                                                                           <Trash2 size={14} />
                                                                                    </button>
                                                                             </div>
                                                                      ))}
                                                               </div>
                                                        )}
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
                                                         <MediaSelector
                                                                selectedImages={formData.images}
                                                                onSelect={(urls) => setFormData({ ...formData, images: urls })}
                                                                multiple={true}
                                                                maxImages={10}
                                                                category="Hotel Room"
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
                                                        disabled={updateMutation.isPending}
                                                        className="btn-primary flex items-center gap-2 px-8 py-2.5 text-sm font-bold disabled:opacity-50"
                                                 >
                                                        {updateMutation.isPending ? 'Saving...' : (
                                                               <>
                                                                      <Save size={18} /> Update Room Category
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
