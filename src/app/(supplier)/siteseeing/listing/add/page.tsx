'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
       Map, DollarSign, Calendar, Image as ImageIcon,
       FileText, Save, ArrowRight, ArrowLeft, Info,
       Plus, Trash2, Clock, Users, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AddTourPage() {
       const router = useRouter();
       const [activeTab, setActiveTab] = useState('basic');
       const [isLoading, setIsLoading] = useState(false);

       // Form State
       const [formData, setFormData] = useState({
              title: '',
              description: '',
              location: '',
              duration: '',
              basePrice: '',
              maxCapacity: '0',
              includes: [],
              excludes: [],
              itinerary: [],
              status: 'DRAFT'
       });

       const handleBack = () => {
              const tabs = ['basic', 'pricing', 'media', 'policies'];
              const currentIdx = tabs.indexOf(activeTab);
              if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
       };

       const handleNext = () => {
              const tabs = ['basic', 'pricing', 'media', 'policies'];
              const currentIdx = tabs.indexOf(activeTab);
              if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
       };

       const handleSave = async () => {
              setIsLoading(true);
              try {
                     await api.post('/siteseeing/tours', {
                            ...formData,
                            basePrice: parseFloat(formData.basePrice),
                            maxCapacity: parseInt(formData.maxCapacity)
                     });
                     alert('Tour published successfully!');
                     router.push('/siteseeing/dashboard');
              } catch (err: any) {
                     alert(err.response?.data?.message || 'Failed to save tour');
              } finally {
                     setIsLoading(false);
              }
       };

       return (
              <div className="min-h-screen bg-background">
                     <Topbar
                            title="Create New Tour"
                            subtitle="Fill in the details to list your sightseeing package"
                     />

                     <div className="p-8 max-w-[1200px] mx-auto">
                            {/* Tabs */}
                            <div className="flex gap-2 mb-8 bg-muted/30 p-1 rounded-2xl w-fit">
                                   {[
                                          { id: 'basic', label: 'Basic Info', icon: Map },
                                          { id: 'pricing', label: 'Pricing & Schedule', icon: DollarSign },
                                          { id: 'media', label: 'Media Gallery', icon: ImageIcon },
                                          { id: 'policies', label: 'Policies', icon: FileText },
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
                                   {/* BASIC INFO TAB */}
                                   {activeTab === 'basic' && (
                                          <div className="space-y-8 animate-fadeIn">
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2 col-span-2">
                                                               <label className="text-sm font-bold ml-1">Tour Name</label>
                                                               <input
                                                                      type="text"
                                                                      value={formData.title}
                                                                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                                      placeholder="e.g. Traditional Mysore Palace Guided Walk"
                                                                      className="form-input text-lg"
                                                               />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Tour Category</label>
                                                               <select className="form-input">
                                                                      <option>Heritage & History</option>
                                                                      <option>Nature & Wildlife</option>
                                                                      <option>Adventure Sports</option>
                                                                      <option>Food & Culinary</option>
                                                                      <option>Spiritual & Cultural</option>
                                                               </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Tour Type</label>
                                                               <select className="form-input">
                                                                      <option>Public Group</option>
                                                                      <option>Private Tour</option>
                                                                      <option>Semi-Private</option>
                                                               </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Location / City</label>
                                                               <input
                                                                      type="text"
                                                                      value={formData.location}
                                                                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                                      placeholder="e.g. Mysore, Karnataka"
                                                                      className="form-input"
                                                               />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Duration</label>
                                                               <input 
                                                                      type="text" 
                                                                      value={formData.duration}
                                                                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                                      placeholder="e.g. 4 Hours" 
                                                                      className="form-input" 
                                                               />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Max Capacity</label>
                                                               <input 
                                                                      type="number" 
                                                                      value={formData.maxCapacity}
                                                                      onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                                                                      placeholder="0 for unlimited" 
                                                                      className="form-input" 
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Short Description (for cards)</label>
                                                        <textarea
                                                               className="form-input min-h-[80px]"
                                                               placeholder="Quick 1-2 sentence overview..."
                                                        ></textarea>
                                                 </div>

                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Detailed Itinerary / Highlights</label>
                                                        <textarea
                                                               className="form-input min-h-[160px]"
                                                               placeholder="Describe the full experience, stops, and what makes it special..."
                                                        ></textarea>
                                                 </div>

                                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                                        {[
                                                               { label: 'Wheelchair Access', id: 'wc' },
                                                               { label: 'Child Friendly', id: 'cf' },
                                                               { label: 'Pet Friendly', id: 'pf' },
                                                               { label: 'Instant Confirmation', id: 'ic' },
                                                        ].map((opt) => (
                                                               <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                                                      <div className="w-10 h-6 bg-muted rounded-full relative transition-colors group-hover:bg-muted/80">
                                                                             <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full transition-transform"></div>
                                                                      </div>
                                                                      <span className="text-sm font-medium">{opt.label}</span>
                                                               </label>
                                                        ))}
                                                 </div>
                                          </div>
                                   )}

                                   {/* PRICING & SCHEDULE TAB */}
                                   {activeTab === 'pricing' && (
                                          <div className="space-y-10 animate-fadeIn">
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1 text-accent flex items-center gap-1">
                                                                      <DollarSign size={16} /> Base Price (INR)
                                                               </label>
                                                               <input 
                                                                      type="number" 
                                                                      value={formData.basePrice}
                                                                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                                                      placeholder="1200" 
                                                                      className="form-input" 
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-4">
                                                        <h4 className="font-bold flex items-center gap-2">
                                                               <Calendar size={18} className="text-accent" />
                                                               Weekly Schedule
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                                                      <button
                                                                             key={day}
                                                                             className="px-6 py-2 rounded-xl border border-accent/20 bg-accent/5 text-accent text-sm font-bold"
                                                                      >
                                                                             {day}
                                                                      </button>
                                                               ))}
                                                        </div>
                                                 </div>

                                                 <div className="space-y-4">
                                                        <h4 className="font-bold flex items-center gap-2">
                                                               <Clock size={18} className="text-accent" />
                                                               Time Slots
                                                        </h4>
                                                        <div className="flex flex-wrap gap-3">
                                                               {['09:00', '11:00', '14:30', '16:00'].map((time) => (
                                                                      <div key={time} className="px-4 py-2 rounded-lg bg-muted flex items-center gap-3 font-mono">
                                                                             {time}
                                                                             <button className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                                                                      </div>
                                                               ))}
                                                               <button className="px-4 py-2 rounded-lg border border-dashed border-accent/40 text-accent text-sm flex items-center gap-1">
                                                                      <Plus size={14} /> Add Slot
                                                               </button>
                                                        </div>
                                                 </div>
                                          </div>
                                   )}

                                   {/* MEDIA TAB */}
                                   {activeTab === 'media' && (
                                          <div className="animate-fadeIn space-y-8">
                                                 <div className="space-y-4">
                                                        <h4 className="font-bold">Cover Photo</h4>
                                                        <div className="w-full h-64 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
                                                               <ImageIcon size={48} className="text-muted-foreground mb-4" />
                                                               <p className="font-bold">Click to upload cover</p>
                                                               <p className="text-xs text-muted-foreground">High resolution, landscape (16:9)</p>
                                                        </div>
                                                 </div>

                                                 <div className="space-y-4">
                                                        <h4 className="font-bold">Gallery (Min 3 photos)</h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                               {[1, 2, 3, 4].map((i) => (
                                                                      <div key={i} className="aspect-square bg-muted/20 border border-dashed border-muted rounded-xl flex items-center justify-center cursor-pointer">
                                                                             <Plus size={24} className="text-muted-foreground" />
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          </div>
                                   )}

                                   {/* POLICIES TAB */}
                                   {activeTab === 'policies' && (
                                          <div className="space-y-8 animate-fadeIn">
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Cancellation Policy</label>
                                                               <select className="form-input">
                                                                      <option>Free until 48hrs before</option>
                                                                      <option>Free until 24hrs before</option>
                                                                      <option>Non-refundable</option>
                                                               </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-sm font-bold ml-1">Rescheduling</label>
                                                               <select className="form-input">
                                                                      <option>Allowed (Free)</option>
                                                                      <option>Allowed (With Fees)</option>
                                                                      <option>Not Allowed</option>
                                                               </select>
                                                        </div>
                                                 </div>
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Safety Guidelines for Guests</label>
                                                        <textarea className="form-input min-h-[100px]" placeholder="What should they wear? Carry? Is it safe for elderlies?"></textarea>
                                                 </div>
                                                 <div className="space-y-2">
                                                        <label className="text-sm font-bold ml-1">Terms & Conditions</label>
                                                        <textarea className="form-input min-h-[100px]" placeholder="Any specific T&Cs for this tour..."></textarea>
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
                                          <button className="px-8 py-4 font-bold text-muted-foreground hover:text-foreground">
                                                 Save Draft
                                          </button>
                                          {activeTab === 'policies' ? (
                                                 <button
                                                        onClick={handleSave}
                                                        disabled={isLoading}
                                                        className="btn-accent px-10 py-4 flex items-center gap-2 shadow-xl shadow-accent/20"
                                                 >
                                                        {isLoading ? 'Saving...' : <><CheckCircle2 size={18} /> Publish Tour</>}
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
