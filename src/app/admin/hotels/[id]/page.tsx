'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import {
       ChevronLeft, ShieldCheck, ShieldAlert, Building2,
       CreditCard, FileText, User, Globe, Clock, Star
} from 'lucide-react';

export default function AdminHotelDetailPage() {
       const { id } = useParams();
       const router = useRouter();
       const queryClient = useQueryClient();

       const { data: hotel, isLoading } = useQuery({
              queryKey: ['admin-hotel', id],
              queryFn: async () => {
                     const res = await api.get(`/admin/hotels/${id}`);
                     return res.data;
              }
       });

       const updateStatus = useMutation({
              mutationFn: async (status: string) => {
                     await api.patch(`/admin/hotels/${id}/status`, { status });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-hotel', id] });
                     queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
                     router.push('/admin/hotels');
              }
       });

       if (isLoading || !hotel) {
              return (
                     <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                     </div>
              );
       }

       const sections = [
              {
                     title: 'Property Details',
                     icon: Building2,
                     fields: [
                            { label: 'Name', value: hotel.name },
                            { label: 'Type', value: hotel.businessType || 'Hotel' },
                            { label: 'Stars', value: `${hotel.stars} Stars` },
                            { label: 'City', value: hotel.city },
                            { label: 'Address', value: hotel.address },
                     ]
              },
              {
                     title: 'Business Info',
                     icon: FileText,
                     fields: [
                            { label: 'GST Number', value: hotel.gstNumber },
                            { label: 'PAN Number', value: hotel.panNumber },
                            { label: 'Business Name', value: hotel.businessName },
                     ]
              },
              {
                     title: 'Bank Details',
                     icon: CreditCard,
                     fields: [
                            { label: 'Account Holder', value: hotel.bankHolder },
                            { label: 'Bank Name', value: hotel.bankName },
                            { label: 'Account Number', value: hotel.bankAccount },
                            { label: 'IFSC Code', value: hotel.bankIfsc },
                     ]
              },
              {
                     title: 'Owner Info',
                     icon: User,
                     fields: [
                            { label: 'Name', value: `${hotel.ownerFirstName} ${hotel.ownerLastName}` },
                            { label: 'Email', value: hotel.email },
                            { label: 'Phone', value: hotel.ownerPhone },
                     ]
              }
       ];

       return (
              <div className="p-8 space-y-8 max-w-6xl mx-auto">
                     <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                     >
                            <ChevronLeft size={20} /> Back to List
                     </button>

                     <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border">
                            <div className="flex gap-6 items-center">
                                   <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-600/20">
                                          {hotel.name.charAt(0)}
                                   </div>
                                   <div>
                                          <div className="flex items-center gap-3">
                                                 <h1 className="text-3xl font-bold text-foreground tracking-tight">{hotel.name}</h1>
                                                 <span className={`px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${hotel.status === 'APPROVED' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                                                        hotel.status === 'PENDING' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                                                               'text-red-500 border-red-500/20 bg-red-500/5'
                                                        }`}>
                                                        {hotel.status}
                                                 </span>
                                          </div>
                                          <p className="text-muted-foreground mt-1 text-xs">Ref ID: {hotel.id}</p>
                                   </div>
                            </div>

                            <div className="flex items-center gap-3">
                                   {hotel.status !== 'APPROVED' && (
                                          <button
                                                 onClick={() => updateStatus.mutate('APPROVED')}
                                                 className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                                          >
                                                 <ShieldCheck size={20} /> Approve Partner
                                          </button>
                                   )}
                                   {hotel.status === 'PENDING' && (
                                          <button
                                                 onClick={() => updateStatus.mutate('REJECTED')}
                                                 className="px-6 py-3 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-xl font-bold flex items-center gap-2 transition-all"
                                          >
                                                 <ShieldAlert size={20} /> Reject
                                          </button>
                                   )}
                                   {hotel.status === 'APPROVED' && (
                                          <button
                                                 onClick={() => updateStatus.mutate('BLOCKED')}
                                                 className="px-6 py-3 bg-muted hover:bg-destructive text-muted-foreground hover:text-white rounded-xl font-bold flex items-center gap-2 transition-all"
                                          >
                                                 Block Access
                                          </button>
                                   )}
                            </div>
                     </header>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sections.map((section) => (
                                   <div key={section.title} className="bg-card/50 border border-border rounded-3xl p-8 hover:bg-card transition-all">
                                          <div className="flex items-center gap-3 mb-6">
                                                 <div className="p-2 rounded-lg bg-blue-600/10 text-blue-500">
                                                        <section.icon size={20} />
                                                 </div>
                                                 <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                                          </div>
                                          <div className="space-y-4">
                                                 {section.fields.map((field) => (
                                                        <div key={field.label}>
                                                               <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{field.label}</div>
                                                               <div className="text-foreground/80 font-medium">{field.value || 'Not provided'}</div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            ))}

                            {/* Verification Documents Section */}
                            <div className="bg-card/50 border border-border rounded-3xl p-8 hover:bg-card transition-all">
                                   <div className="flex items-center gap-3 mb-6">
                                          <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-500">
                                                 <FileText size={20} />
                                          </div>
                                          <h2 className="text-xl font-bold text-foreground">Verification Documents</h2>
                                   </div>
                                   <div className="space-y-6">
                                          {[
                                                 { label: 'GST Certificate', value: hotel.gstDoc },
                                                 { label: 'PAN Card', value: hotel.panDoc },
                                                 { label: 'Property License', value: hotel.licenseDoc },
                                          ].map((doc) => (
                                                 <div key={doc.label} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                                                        <div>
                                                               <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{doc.label}</div>
                                                               <div className="text-sm font-medium text-foreground/80">
                                                                      {doc.value ? 'Document Uploaded' : 'Not Uploaded'}
                                                               </div>
                                                        </div>
                                                        {doc.value && (
                                                               <a
                                                                      href={doc.value}
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                      className="p-2 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                                                               >
                                                                      <Globe size={16} /> View
                                                               </a>
                                                        )}
                                                 </div>
                                          ))}
                                   </div>
                            </div>
                     </div>

                     {/* Additional Info */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
                                   <Globe className="text-blue-500" size={24} />
                                   <div>
                                          <div className="text-xs text-muted-foreground">Website</div>
                                          <div className="text-sm font-semibold truncate max-w-[200px] text-foreground/80">{hotel.website || 'N/A'}</div>
                                   </div>
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
                                   <Clock className="text-emerald-500" size={24} />
                                   <div>
                                          <div className="text-xs text-muted-foreground">Check-in / Out</div>
                                          <div className="text-sm font-semibold text-foreground/80">{hotel.checkInTime} / {hotel.checkOutTime}</div>
                                   </div>
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
                                   <Star className="text-amber-500" size={24} />
                                   <div>
                                          <div className="text-xs text-muted-foreground">Rating</div>
                                          <div className="text-sm font-semibold text-foreground/80">{hotel.stars} Stars</div>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}
