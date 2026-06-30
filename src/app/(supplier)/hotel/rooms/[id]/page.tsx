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

       const [customAmenity, setCustomAmenity] = useState('');

       const toggleAmenity = (amenity: string) => {
              setFormData(prev => ({
                     ...prev,
                     amenities: prev.amenities.includes(amenity)
                            ? prev.amenities.filter(a => a !== amenity)
                            : [...prev.amenities, amenity]
              }));
       };

       const handleAddCustomAmenity = () => {
              const val = customAmenity.trim();
              if (val && !formData.amenities.includes(val)) {
                     setFormData(prev => ({
                            ...prev,
                            amenities: [...prev.amenities, val]
                     }));
              }
              setCustomAmenity('');
       };

       // Rate Plans Logic
       const { data: ratePlans = [], refetch: refetchRatePlans } = useQuery({
              queryKey: ['rate-plans', id],
              queryFn: async () => {
                     const res = await api.get(`/hotel/rooms/${id}/rate-plans`);
                     return res.data;
              },
       });

       const [isAddingRatePlan, setIsAddingRatePlan] = useState(false);
       const [newRatePlan, setNewRatePlan] = useState({
              name: '',
              mealPlan: 'EP',
              markupAmount: '',
              isRefundable: true,
              cancellationPolicy: '',
              inclusions: ''
       });

       const handleAddRatePlan = async () => {
              if (!newRatePlan.name.trim()) {
                     alert("Please enter a Package Name.");
                     return;
              }
              setIsAddingRatePlan(true);
              try {
                     await api.post('/hotel/rate-plans', {
                            roomTypeId: id,
                            name: newRatePlan.name,
                            mealPlan: newRatePlan.mealPlan,
                            markupAmount: parseFloat(newRatePlan.markupAmount) || 0,
                            isRefundable: newRatePlan.isRefundable,
                            cancellationPolicy: newRatePlan.cancellationPolicy,
                            inclusions: newRatePlan.inclusions.split(',').map(s => s.trim()).filter(Boolean)
                     });
                     setNewRatePlan({
                            name: '',
                            mealPlan: 'EP',
                            markupAmount: '',
                            isRefundable: true,
                            cancellationPolicy: '',
                            inclusions: ''
                     });
                     refetchRatePlans();
              } catch (err) {
                     alert('Failed to add rate plan');
              } finally {
                     setIsAddingRatePlan(false);
              }
       };

       const handleDeleteRatePlan = async (ratePlanId: string) => {
              if (confirm('Delete this rate plan?')) {
                     try {
                            await api.delete(`/hotel/rate-plans/${ratePlanId}`);
                            refetchRatePlans();
                     } catch(err) {
                            alert('Failed to delete');
                     }
              }
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
                                                               {Array.from(new Set([...availableAmenities, ...formData.amenities])).map((amenity) => (
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
                                                                             <span className="truncate">{amenity}</span>
                                                                      </button>
                                                               ))}
                                                        </div>
                                                        <div className="flex gap-3 pt-2">
                                                               <input 
                                                                      type="text" 
                                                                      placeholder="Add custom amenity (e.g., Private Pool, Butler)"
                                                                      className="form-input flex-1 md:max-w-xs"
                                                                      value={customAmenity}
                                                                      onChange={e => setCustomAmenity(e.target.value)}
                                                                      onKeyDown={e => {
                                                                             if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    handleAddCustomAmenity();
                                                                             }
                                                                      }}
                                                               />
                                                               <button 
                                                                      type="button" 
                                                                      onClick={handleAddCustomAmenity}
                                                                      className="px-5 py-2.5 bg-[var(--table-header)] border border-[var(--glass-border)] text-[hsl(var(--foreground))] rounded-xl text-sm font-bold shadow-sm hover:border-[hsl(var(--accent))] transition-all whitespace-nowrap"
                                                               >
                                                                      Add Custom
                                                               </button>
                                                        </div>
                                                 </div>

                                                 {/* Rate Plans / Packages */}
                                                 <div className="space-y-4 md:col-span-2 pt-2">
                                                        <label className="text-sm font-medium block" style={{ color: 'hsl(var(--foreground))' }}>Rate Plans / Packages</label>
                                                        <p className="text-xs mb-3 -mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Create advanced packages for this room (e.g., Free Cancellation, Breakfast Included) matching your pricing tiers.</p>
                                                        
                                                        {/* Add new rate plan form */}
                                                        <div className="flex flex-col gap-4 bg-[var(--table-header)] p-5 rounded-xl border border-[var(--glass-border)]">
                                                            {/* Row 1: Package Name and Meal Plan */}
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                               <input 
                                                                      type="text" 
                                                                      placeholder="Package Name (e.g. Room With Free Cancellation)"
                                                                      className="form-input w-full text-sm md:col-span-3"
                                                                      value={newRatePlan.name}
                                                                      onChange={e => setNewRatePlan({...newRatePlan, name: e.target.value})}
                                                                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRatePlan())}
                                                               />
                                                               <select 
                                                                    className="form-input w-full text-sm bg-transparent md:col-span-1"
                                                                    value={newRatePlan.mealPlan}
                                                                    onChange={e => setNewRatePlan({...newRatePlan, mealPlan: e.target.value})}
                                                               >
                                                                    <option value="EP" className="bg-[#0f172a]">Room Only (EP)</option>
                                                                    <option value="CP" className="bg-[#0f172a]">Breakfast Included (CP)</option>
                                                                    <option value="MAP" className="bg-[#0f172a]">Breakfast + Lunch/Dinner (MAP)</option>
                                                                    <option value="AP" className="bg-[#0f172a]">All Meals Included (AP)</option>
                                                               </select>
                                                            </div>

                                                            {/* Row 2: Inclusions and Markup */}
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                <input 
                                                                    type="text"
                                                                    placeholder="Inclusions (comma separated: Free Wifi, Happy Hour)"
                                                                    className="form-input w-full text-sm md:col-span-3"
                                                                    value={newRatePlan.inclusions}
                                                                    onChange={e => setNewRatePlan({...newRatePlan, inclusions: e.target.value})}
                                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRatePlan())}
                                                                />
                                                                <input 
                                                                       type="number" 
                                                                       placeholder="Markup (₹)"
                                                                       className="form-input w-full text-sm md:col-span-1"
                                                                       value={newRatePlan.markupAmount}
                                                                       onChange={e => setNewRatePlan({...newRatePlan, markupAmount: e.target.value})}
                                                                       onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRatePlan())}
                                                                />
                                                            </div>

                                                            {/* Row 3: Refundable Policy */}
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                                                                <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap text-[hsl(var(--foreground))]">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="rounded bg-black/20 border-white/10 w-4 h-4 accent-emerald-500"
                                                                        checked={newRatePlan.isRefundable}
                                                                        onChange={e => setNewRatePlan({...newRatePlan, isRefundable: e.target.checked})}
                                                                    />
                                                                    Refundable
                                                                </label>
                                                                {newRatePlan.isRefundable && (
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="Policy (e.g. till 24 hrs before)"
                                                                        className="form-input w-full sm:flex-1 text-sm sm:max-w-md"
                                                                        value={newRatePlan.cancellationPolicy}
                                                                        onChange={e => setNewRatePlan({...newRatePlan, cancellationPolicy: e.target.value})}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex justify-end border-t border-[var(--glass-border)] pt-4 mt-1">
                                                               <button 
                                                                      type="button" 
                                                                      onClick={handleAddRatePlan}
                                                                      disabled={isAddingRatePlan}
                                                                      className="px-6 py-2.5 bg-[hsl(var(--accent))] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                                                               >
                                                                      {isAddingRatePlan ? 'Adding Package...' : 'Add Package'}
                                                               </button>
                                                            </div>
                                                        </div>

                                                        {/* List of added rate plans */}
                                                        {ratePlans.length > 0 && (
                                                               <div className="grid grid-cols-1 gap-4 mt-6">
                                                                      {ratePlans.map((plan: any) => (
                                                                             <div key={plan.id} className="relative flex flex-col sm:flex-row p-5 rounded-2xl border border-[var(--glass-border)] bg-white/5 shadow-sm transition-all hover:bg-white/10">
                                                                                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                                                                                           <button 
                                                                                                  type="button" 
                                                                                                  onClick={() => handleDeleteRatePlan(plan.id)}
                                                                                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                                                           >
                                                                                                  <Trash2 size={16} />
                                                                                           </button>
                                                                                    </div>
                                                                                    <div className="flex-1 pr-12">
                                                                                        {plan.name.toLowerCase().includes('super package') && (
                                                                                            <span className="inline-block px-2 py-0.5 border border-[#cba052] text-[#cba052] text-[10px] font-bold uppercase rounded mb-2 bg-[#cba052]/10">Super Package</span>
                                                                                        )}
                                                                                        <h4 className="text-base font-bold text-[hsl(var(--foreground))] mb-3">{plan.name}</h4>
                                                                                        
                                                                                        <div className="text-[13px] space-y-2 text-[hsl(var(--muted-foreground))]">
                                                                                            {plan.mealPlan !== 'EP' && (
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--foreground))]"></span>
                                                                                                    {plan.mealPlan === 'CP' ? 'Breakfast included' : plan.mealPlan === 'MAP' ? 'Breakfast + Lunch/Dinner included' : 'All Meals Included'}
                                                                                                </div>
                                                                                            )}
                                                                                            {plan.inclusions?.map((inc: string, i: number) => (
                                                                                                <div key={i} className="flex items-center gap-2">
                                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--foreground))]"></span>
                                                                                                    {inc}
                                                                                                </div>
                                                                                            ))}
                                                                                            <div className={`flex items-center gap-2 ${plan.isRefundable ? 'text-emerald-500 font-medium' : 'text-red-500 font-medium'}`}>
                                                                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                                                                {plan.isRefundable ? `Free Cancellation ${plan.cancellationPolicy}` : 'Non-Refundable'}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="mt-4 sm:mt-0 sm:ml-6 sm:pl-6 sm:border-l border-[var(--glass-border)] flex flex-col justify-center sm:text-right pr-12 sm:pr-0">
                                                                                        <div className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tight">
                                                                                            + ₹{plan.markupAmount}
                                                                                        </div>
                                                                                        <div className="text-[11px] uppercase tracking-wide font-semibold text-[hsl(var(--muted-foreground))] mt-1">Extra / Night</div>
                                                                                    </div>
                                                                             </div>
                                                                      ))}
                                                               </div>
                                                        )}
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
