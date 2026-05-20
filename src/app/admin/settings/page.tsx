'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
       Settings, Save, Globe, Lock,
       Mail, MessageSquare, Shield,
       CreditCard, Bell, Database,
       DollarSign, Percent, Calculator
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
       const queryClient = useQueryClient();
       const [activeTab, setActiveTab] = useState('commission');
       const [localSettings, setLocalSettings] = useState<any[]>([]);

       const { data: settings = [], isLoading } = useQuery({
              queryKey: ['admin-global-settings'],
              queryFn: async () => {
                     const res = await api.get('/admin/settings');
                     return res.data;
              }
       });

       useEffect(() => {
              if (settings.length > 0) {
                     setLocalSettings(settings);
              }
       }, [settings]);

       const updateMutation = useMutation({
              mutationFn: async (updated: any[]) => {
                     await api.post('/admin/settings/bulk', { settings: updated });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-global-settings'] });
                     toast.success('Configuration saved successfully');
              }
       });

       const handleValueChange = (key: string, value: string) => {
              setLocalSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
       };

       const handleSave = () => {
              const changed = localSettings.map(s => ({ key: s.key, value: s.value }));
              updateMutation.mutate(changed);
       };

       const tabs = [
              { id: 'commission', label: 'Commission & Tax', icon: DollarSign },
              { id: 'general', label: 'Platform Info', icon: Globe },
              { id: 'auth', label: 'Security Policies', icon: Lock },
              { id: 'system', label: 'System Health', icon: Database },
       ];

       const getSetting = (key: string) => localSettings.find(s => s.key === key)?.value || '';

       return (
              <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fadeIn">
                     <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                   <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                                                 <Settings size={20} />
                                          </div>
                                          <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Portal OS v2.0</span>
                                   </div>
                                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Control Center</h1>
                                   <p className="text-slate-400 font-bold mt-2">Adjust global platform parameters and economic rules</p>
                            </div>
                            <button 
                                   onClick={handleSave}
                                   disabled={updateMutation.isPending}
                                   className="px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                   <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Sync Configuration'}
                            </button>
                     </header>

                     <div className="flex flex-col lg:flex-row gap-8">
                            {/* Modern Sidebar Tabs */}
                            <div className="w-full lg:w-72 space-y-3">
                                   {tabs.map((tab) => (
                                          <button
                                                 key={tab.id}
                                                 onClick={() => setActiveTab(tab.id)}
                                                 className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black transition-all text-xs uppercase tracking-widest group relative overflow-hidden ${activeTab === tab.id
                                                                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30'
                                                                : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600 shadow-sm'
                                                         }`}
                                          >
                                                 <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                                                        <tab.icon size={18} />
                                                 </div>
                                                 {tab.label}
                                                 {activeTab === tab.id && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/20" />}
                                          </button>
                                   ))}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1">
                                   <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
                                          <div className="mb-10 pb-10 border-b border-slate-50">
                                                 <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                                        {tabs.find(t => t.id === activeTab)?.label}
                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Global</span>
                                                 </h2>
                                          </div>

                                          <div className="space-y-10">
                                                 {activeTab === 'commission' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                               <div className="col-span-full p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-6">
                                                                      <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm">
                                                                             <Calculator size={32} />
                                                                      </div>
                                                                      <div>
                                                                             <h4 className="font-black text-emerald-900 uppercase text-[10px] tracking-widest mb-1">Economic Guardrails</h4>
                                                                             <p className="text-sm text-emerald-800/70 font-bold">These rates determine the platform revenue from every successful booking across all verticals.</p>
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-8">
                                                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                             <Percent size={14} className="text-blue-500" /> Commission Rules
                                                                      </h3>
                                                                      {[
                                                                             { key: 'COMMISSION_HOTEL', label: 'Hotel Vertical' },
                                                                             { key: 'COMMISSION_PACKAGE', label: 'Tour Packages' },
                                                                             { key: 'COMMISSION_BUS', label: 'Bus Network' },
                                                                             { key: 'COMMISSION_CAB', label: 'Cab Services' },
                                                                      ].map((item) => (
                                                                             <div key={item.key} className="space-y-2">
                                                                                    <div className="flex justify-between items-center mb-1">
                                                                                           <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</label>
                                                                                           <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{getSetting(item.key)}%</span>
                                                                                    </div>
                                                                                    <div className="relative group">
                                                                                           <input 
                                                                                                  type="number" 
                                                                                                  value={getSetting(item.key)}
                                                                                                  onChange={(e) => handleValueChange(item.key, e.target.value)}
                                                                                                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                                                                                           />
                                                                                           <Percent className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                                                    </div>
                                                                             </div>
                                                                      ))}
                                                               </div>

                                                               <div className="space-y-8">
                                                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                             <Calculator size={14} className="text-blue-500" /> Taxation Logic
                                                                      </h3>
                                                                      <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
                                                                             <div className="relative z-10">
                                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Standard GST Rate</label>
                                                                                    <div className="flex items-center gap-4">
                                                                                           <input 
                                                                                                  type="number" 
                                                                                                  value={getSetting('TAX_GST')}
                                                                                                  onChange={(e) => handleValueChange('TAX_GST', e.target.value)}
                                                                                                  className="bg-white/10 border border-white/20 rounded-2xl py-5 px-8 text-3xl font-black text-white w-full focus:outline-none focus:bg-white/20 transition-all" 
                                                                                           />
                                                                                           <div className="text-4xl font-black opacity-20">%</div>
                                                                                    </div>
                                                                                    <p className="mt-6 text-[10px] font-bold text-slate-500 uppercase leading-relaxed">Applied globally to all invoices generated through the portal.</p>
                                                                             </div>
                                                                             <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                                                                    <Calculator size={200} />
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 )}

                                                 {activeTab === 'general' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Name</label>
                                                                      <input type="text" defaultValue="TolidayTrip Extranet" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black text-slate-900" />
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                                                                      <input type="email" defaultValue="admin@tolidaytrip.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black text-slate-900" />
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}
