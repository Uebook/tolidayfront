'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
       Package, DollarSign, Calendar, Image as ImageIcon,
       FileText, Save, ArrowRight, ArrowLeft, Info,
       Plus, Trash2, Clock, MapPin, CheckCircle2,
       Plane, Hotel, Utensils, Car, Camera
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewItineraryPage() {
       const router = useRouter();
       const [activeTab, setActiveTab] = useState('basic');
       const [isLoading, setIsLoading] = useState(false);

       // Form State
       const [formData, setFormData] = useState({
              title: '',
              description: '',
              destinations: [''],
              durationDays: 1,
              durationNights: 0,
              basePrice: '',
              inclusions: {
                     hotels: true,
                     meals: true,
                     transport: true,
                     sightseeing: true,
                     flights: false,
              },
              itinerary: [
                     { day: 1, title: '', description: '', activities: [''] }
              ],
              policies: {
                     cancellation: 'Moderate',
                     terms: ''
              }
       });

       const handleAddDestination = () => {
              setFormData({ ...formData, destinations: [...formData.destinations, ''] });
       };

       const handleAddDay = () => {
              const nextDay = formData.itinerary.length + 1;
              setFormData({
                     ...formData,
                     itinerary: [...formData.itinerary, { day: nextDay, title: '', description: '', activities: [''] }],
                     durationDays: nextDay,
                     durationNights: nextDay - 1
              });
       };

       const handleSave = async () => {
              setIsLoading(true);
              try {
                     await api.post('/packages/itineraries', formData);
                     alert('Package created successfully!');
                     router.push('/packages/dashboard');
              } catch (err: any) {
                     alert(err.response?.data?.message || 'Failed to create package');
              } finally {
                     setIsLoading(false);
              }
       };

       const handleNext = () => {
              const tabs = ['basic', 'itinerary', 'inclusions', 'pricing'];
              const currentIdx = tabs.indexOf(activeTab);
              if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
       };

       const handleBack = () => {
              const tabs = ['basic', 'itinerary', 'inclusions', 'pricing'];
              const currentIdx = tabs.indexOf(activeTab);
              if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
       };

       return (
              <div className="min-h-screen bg-background">
                     <Topbar
                            title="Create New Holiday Package"
                            subtitle="Design a memorable travel experience for your customers"
                     />

                     <div className="p-8 max-w-[1200px] mx-auto">
                            {/* Tabs Navigation */}
                            <div className="flex gap-2 mb-8 bg-muted/30 p-1 rounded-2xl w-fit">
                                   {[
                                          { id: 'basic', label: 'Basic Info', icon: Package },
                                          { id: 'itinerary', label: 'Daily Itinerary', icon: Calendar },
                                          { id: 'inclusions', label: 'Inclusions', icon: CheckCircle2 },
                                          { id: 'pricing', label: 'Pricing & Policies', icon: DollarSign },
                                   ].map((tab) => (
                                          <button
                                                 key={tab.id}
                                                 onClick={() => setActiveTab(tab.id)}
                                                 className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                                               ? 'bg-background shadow-lg shadow-black/5 text-accent'
                                                               : 'text-muted-foreground hover:bg-background/50'
                                                        }`}
                                          >
                                                 <tab.icon size={18} />
                                                 {tab.label}
                                          </button>
                                   ))}
                            </div>

                            <div className="glass-card p-10 min-h-[500px]">
                                   {activeTab === 'basic' && (
                                          <div className="space-y-8 animate-fadeIn">
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Package Title</label>
                                                        <input
                                                               type="text"
                                                               value={formData.title}
                                                               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                               placeholder="e.g. Magical Kerala: Backwaters & Hills"
                                                               className="form-input text-lg"
                                                        />
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Duration Days</label>
                                                               <input
                                                                      type="number"
                                                                      value={formData.durationDays}
                                                                      onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                                                                      className="form-input"
                                                               />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Duration Nights</label>
                                                               <input
                                                                      type="number"
                                                                      value={formData.durationNights}
                                                                      onChange={(e) => setFormData({ ...formData, durationNights: parseInt(e.target.value) })}
                                                                      className="form-input"
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-4">
                                                        <label className="text-sm font-bold ml-1 flex items-center justify-between">
                                                               Destinations
                                                               <button onClick={handleAddDestination} className="text-xs text-accent flex items-center gap-1">
                                                                      <Plus size={14} /> Add City
                                                               </button>
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               {formData.destinations.map((dest, idx) => (
                                                                      <div key={idx} className="relative">
                                                                             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                                             <input
                                                                                    type="text"
                                                                                    value={dest}
                                                                                    onChange={(e) => {
                                                                                           const newDests = [...formData.destinations];
                                                                                           newDests[idx] = e.target.value;
                                                                                           setFormData({ ...formData, destinations: newDests });
                                                                                    }}
                                                                                    placeholder="City Name"
                                                                                    className="form-input !pl-12"
                                                                             />
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>

                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Overall Description</label>
                                                        <textarea
                                                               value={formData.description}
                                                               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                               className="form-input min-h-[120px]"
                                                               placeholder="Describe the highlight of this package..."
                                                        ></textarea>
                                                 </div>
                                          </div>
                                   )}

                                   {activeTab === 'itinerary' && (
                                          <div className="space-y-10 animate-fadeIn">
                                                 {formData.itinerary.map((day, idx) => (
                                                        <div key={idx} className="p-6 rounded-2xl bg-muted/20 border border-muted/50 space-y-4 relative">
                                                               <div className="absolute -left-3 top-6 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-lg">
                                                                      {day.day}
                                                               </div>
                                                               <div className="grid grid-cols-1 gap-4 ml-4">
                                                                      <input
                                                                             type="text"
                                                                             value={day.title}
                                                                             onChange={(e) => {
                                                                                    const newItin = [...formData.itinerary];
                                                                                    newItin[idx].title = e.target.value;
                                                                                    setFormData({ ...formData, itinerary: newItin });
                                                                             }}
                                                                             placeholder="Day Title (e.g. Arrival in Kochi)"
                                                                             className="form-input font-bold"
                                                                      />
                                                                      <textarea
                                                                             value={day.description}
                                                                             onChange={(e) => {
                                                                                    const newItin = [...formData.itinerary];
                                                                                    newItin[idx].description = e.target.value;
                                                                                    setFormData({ ...formData, itinerary: newItin });
                                                                             }}
                                                                             placeholder="Describe the day's events..."
                                                                             className="form-input text-sm min-h-[80px]"
                                                                      ></textarea>
                                                               </div>
                                                        </div>
                                                 ))}
                                                 <button
                                                        onClick={handleAddDay}
                                                        className="w-full py-4 border-2 border-dashed border-muted rounded-2xl text-muted-foreground hover:text-accent hover:border-accent/40 transition-all font-bold flex items-center justify-center gap-2"
                                                 >
                                                        <Plus size={20} /> Add Next Day
                                                 </button>
                                          </div>
                                   )}

                                   {activeTab === 'inclusions' && (
                                          <div className="space-y-8 animate-fadeIn">
                                                 <h4 className="font-bold text-lg mb-6">What's included in this package?</h4>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {[
                                                               { key: 'hotels', label: 'Hotel Accommodations', icon: Hotel },
                                                               { key: 'meals', label: 'Daily Meals', icon: Utensils },
                                                               { key: 'transport', label: 'Private Transport', icon: Car },
                                                               { key: 'sightseeing', label: 'Guided Tours', icon: Camera },
                                                               { key: 'flights', label: 'Flight Tickets', icon: Plane },
                                                        ].map((item) => (
                                                               <label key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-muted hover:border-accent/40 cursor-pointer transition-all bg-muted/5 group">
                                                                      <div className="flex items-center gap-4">
                                                                             <div className="p-2 rounded-lg bg-background group-hover:bg-accent/10 group-hover:text-accent transition-all">
                                                                                    <item.icon size={20} />
                                                                             </div>
                                                                             <span className="font-semibold">{item.label}</span>
                                                                      </div>
                                                                      <input
                                                                             type="checkbox"
                                                                             checked={(formData.inclusions as any)[item.key]}
                                                                             onChange={(e) => setFormData({
                                                                                    ...formData,
                                                                                    inclusions: { ...formData.inclusions, [item.key]: e.target.checked }
                                                                             })}
                                                                             className="w-5 h-5 rounded-md accent-accent"
                                                                      />
                                                               </label>
                                                        ))}
                                                 </div>
                                          </div>
                                   )}

                                   {activeTab === 'pricing' && (
                                          <div className="space-y-8 animate-fadeIn">
                                                 <div className="max-w-md space-y-4">
                                                        <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                                               <DollarSign size={16} className="text-accent" />
                                                               Base Price per Person (INR)
                                                        </label>
                                                        <input
                                                               type="number"
                                                               value={formData.basePrice}
                                                               onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                                               placeholder="25000"
                                                               className="form-input text-2xl font-bold text-accent"
                                                        />
                                                        <p className="text-xs text-muted-foreground">This is the starting price shown to customers. You can add seasonal variants later.</p>
                                                 </div>

                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Cancellation Policy</label>
                                                        <select className="form-input">
                                                               <option>Flexible (Free cancellation 7 days before)</option>
                                                               <option>Moderate (50% refund 7 days before)</option>
                                                               <option>Strict (Non-refundable)</option>
                                                        </select>
                                                 </div>

                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Terms & Conditions</label>
                                                        <textarea className="form-input min-h-[150px]" placeholder="Specific terms for this holiday package..."></textarea>
                                                 </div>
                                          </div>
                                   )}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-8 flex items-center justify-between">
                                   <button
                                          onClick={handleBack}
                                          disabled={activeTab === 'basic'}
                                          className="btn-secondary px-8 py-4 flex items-center gap-2 disabled:opacity-30"
                                   >
                                          <ArrowLeft size={18} /> Previous
                                   </button>

                                   <div className="flex gap-4">
                                          {activeTab === 'pricing' ? (
                                                 <button
                                                        onClick={handleSave}
                                                        disabled={isLoading}
                                                        className="btn-accent px-10 py-4 flex items-center gap-2 shadow-xl shadow-accent/20"
                                                 >
                                                        {isLoading ? 'Creating...' : <><CheckCircle2 size={18} /> Create Package</>}
                                                 </button>
                                          ) : (
                                                 <button
                                                        onClick={handleNext}
                                                        className="btn-primary px-10 py-4 flex items-center gap-2 shadow-xl shadow-primary/20"
                                                 >
                                                        Next Step <ArrowRight size={18} />
                                                 </button>
                                          )}
                                   </div>
                            </div>
                     </div>
              </div>
       );
}
