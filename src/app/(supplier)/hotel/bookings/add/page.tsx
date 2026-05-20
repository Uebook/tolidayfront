'use client';

import Topbar from '@/components/layout/Topbar';
import { ArrowLeft, User, Phone, Mail, Calendar, BedDouble, CreditCard, CheckCircle2, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export default function AddBookingPage() {
       const router = useRouter();
       const [formData, setFormData] = useState({
              guestName: '',
              guestEmail: '',
              guestContact: '',
              roomTypeId: '',
              startDate: '',
              endDate: '',
              numberOfGuests: 2,
              totalAmount: 0,
       });

       const { data: roomTypes = [], isLoading: isLoadingRooms } = useQuery({
              queryKey: ['room-types'],
              queryFn: async () => {
                     const res = await api.get('/room-types');
                     return res.data;
              }
       });

       const [errorMsg, setErrorMsg] = useState('');

       const mutation = useMutation({
              mutationFn: async (vars: any) => {
                     return api.post('/bookings', vars);
              },
              onSuccess: () => {
                     router.push('/hotel/bookings');
              },
              onError: (error: any) => {
                     const msg = error.response?.data?.message || 'Failed to save booking';
                     setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
              }
       });

       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
              const { name, value } = e.target;
              setFormData(prev => ({ ...prev, [name]: value }));
              if (errorMsg) setErrorMsg('');
       };

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              mutation.mutate({
                     ...formData,
                     numberOfGuests: Number(formData.numberOfGuests),
                     totalAmount: Number(formData.totalAmount),
              });
       };

       return (
              <div>
                     <Topbar title="New Manual Booking" subtitle="Add a booking received via phone or walk-in" />

                     <div className="p-8 space-y-6 animate-fadeIn max-w-[800px] mx-auto">
                            <Link href="/hotel/bookings" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]">
                                   <ArrowLeft size={16} /> Back to Bookings
                            </Link>

                            {errorMsg && (
                                   <div className="p-4 rounded-xl bg-[hsl(0_84%_60%)/10%] border border-[hsl(0_84%_60%)/20%] text-[hsl(0_84%_60%)] text-sm animate-shake">
                                          <strong>Submission Failed:</strong> {errorMsg}
                                   </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                   {/* Guest Information */}
                                   <div className="glass-card p-6 space-y-4">
                                          <div className="flex items-center gap-2 mb-2">
                                                 <User size={18} className="text-[hsl(var(--accent))]" />
                                                 <h3 className="font-semibold text-[hsl(var(--foreground))]">Guest Information</h3>
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Guest Full Name</label>
                                                 <input
                                                        name="guestName"
                                                        value={formData.guestName}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. Rahul Sharma"
                                                        className="form-input"
                                                        required
                                                 />
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Email Address (Optional)</label>
                                                        <div className="relative group">
                                                               <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] transition-colors" />
                                                               <input
                                                                      name="guestEmail"
                                                                      type="email"
                                                                      value={formData.guestEmail}
                                                                      onChange={handleInputChange}
                                                                      placeholder="rahul@example.com"
                                                                      className="form-input pl-10"
                                                               />
                                                        </div>
                                                 </div>
                                                 <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Contact Number</label>
                                                        <div className="relative group">
                                                               <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] transition-colors" />
                                                               <input
                                                                      name="guestContact"
                                                                      value={formData.guestContact}
                                                                      onChange={handleInputChange}
                                                                      placeholder="+91 9876543210"
                                                                      className="form-input pl-10"
                                                                      required
                                                               />
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Stay Details */}
                                   <div className="glass-card p-6 space-y-4">
                                          <div className="flex items-center gap-2 mb-2">
                                                 <BedDouble size={18} className="text-[hsl(var(--accent))]" />
                                                 <h3 className="font-semibold text-[hsl(var(--foreground))]">Stay Information</h3>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Check-in Date</label>
                                                        <div className="relative group">
                                                               <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] transition-colors" />
                                                               <input
                                                                      name="startDate"
                                                                      type="date"
                                                                      value={formData.startDate}
                                                                      onChange={handleInputChange}
                                                                      className="form-input pl-10"
                                                                      required
                                                               />
                                                        </div>
                                                 </div>
                                                 <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Check-out Date</label>
                                                        <div className="relative group">
                                                               <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] transition-colors" />
                                                               <input
                                                                      name="endDate"
                                                                      type="date"
                                                                      value={formData.endDate}
                                                                      onChange={handleInputChange}
                                                                      className="form-input pl-10"
                                                                      required
                                                               />
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Room Category</label>
                                                        <select
                                                               name="roomTypeId"
                                                               value={formData.roomTypeId}
                                                               onChange={handleInputChange}
                                                               className="form-input"
                                                               required
                                                        >
                                                               <option value="">Select a Category</option>
                                                               {roomTypes.map((rt: any) => (
                                                                      <option key={rt.id} value={rt.id}>{rt.name}</option>
                                                               ))}
                                                        </select>
                                                 </div>
                                                 <div className="space-y-2">
                                                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Number of Guests</label>
                                                        <input
                                                               name="numberOfGuests"
                                                               type="number"
                                                               min="1"
                                                               value={formData.numberOfGuests}
                                                               onChange={handleInputChange}
                                                               className="form-input"
                                                               required
                                                        />
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Payment Summary */}
                                   <div className="glass-card p-6 space-y-4">
                                          <div className="flex items-center gap-2 mb-2">
                                                 <CreditCard size={18} className="text-[hsl(var(--accent))]" />
                                                 <h3 className="font-semibold text-[hsl(var(--foreground))]">Payment Summary</h3>
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Total Amount (₹)</label>
                                                 <input
                                                        name="totalAmount"
                                                        type="number"
                                                        min="0"
                                                        value={formData.totalAmount}
                                                        onChange={handleInputChange}
                                                        placeholder="0.00"
                                                        className="form-input"
                                                        required
                                                 />
                                          </div>

                                          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex gap-4 items-start">
                                                 <CheckCircle2 size={20} className="text-accent flex-shrink-0 mt-0.5" />
                                                 <p className="text-[11px] leading-relaxed text-[hsl(var(--foreground))]/70">
                                                        This manual booking will be marked as "CONFIRMED" automatically. You can manage check-in and payments from the booking details page after saving.
                                                 </p>
                                          </div>
                                   </div>

                                   <div className="flex justify-end gap-3 pt-2">
                                          <button
                                                 type="button"
                                                 onClick={() => router.back()}
                                                 className="px-6 py-2.5 rounded-lg text-sm font-medium border border-[var(--glass-border-light)] hover:bg-[var(--table-header)] transition-colors"
                                          >
                                                 Cancel
                                          </button>
                                          <button
                                                 type="submit"
                                                 disabled={mutation.isPending}
                                                 className="btn-primary flex items-center gap-2 px-8 py-2.5 text-sm font-bold shadow-xl hover:shadow-2xl transition-all"
                                          >
                                                 {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                 Save Booking
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       );
}
