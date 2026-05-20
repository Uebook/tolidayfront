'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Image as ImageIcon, Plus, X, Upload, Check } from 'lucide-react';

interface MediaPickerProps {
       onSelect: (urls: string[]) => void;
       selectedUrls: string[];
       maxFiles?: number;
}

export default function MediaPicker({ onSelect, selectedUrls, maxFiles = 10 }: MediaPickerProps) {
       const [isOpen, setIsOpen] = useState(false);
       const queryClient = useQueryClient();

       // Fetch hotel ID
       const { data: myHotel } = useQuery({
              queryKey: ['my-hotel-media'],
              queryFn: async () => {
                     const res = await api.get('/hotel/my-hotel');
                     return res.data;
              }
       });

       const hotelId = myHotel?.id;

       // Fetch media
       const { data: media = [], isLoading } = useQuery({
              queryKey: ['media', hotelId],
              queryFn: async () => {
                     const res = await api.get(`/media?hotelId=${hotelId}`);
                     return res.data;
              },
              enabled: !!hotelId && isOpen
       });

       const uploadMutation = useMutation({
              mutationFn: async (file: File) => {
                     const formData = new FormData();
                     formData.append('file', file);
                     formData.append('hotelId', hotelId || '');
                     formData.append('category', 'Rooms');

                     await api.post('/media/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                     });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['media'] });
              }
       });

       const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files) {
                     Array.from(e.target.files).forEach(file => uploadMutation.mutate(file));
              }
       };

       const toggleUrl = (url: string) => {
              if (selectedUrls.includes(url)) {
                     onSelect(selectedUrls.filter(u => u !== url));
              } else {
                     if (selectedUrls.length < maxFiles) {
                            onSelect([...selectedUrls, url]);
                     }
              }
       };

       return (
              <div className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {selectedUrls.map((url, index) => (
                                   <div key={index} className="relative aspect-video rounded-xl overflow-hidden group border border-[var(--glass-border)]">
                                          <img src={url} alt="Room" className="w-full h-full object-cover" />
                                          <button
                                                 type="button"
                                                 onClick={() => onSelect(selectedUrls.filter(u => u !== url))}
                                                 className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                                 <X size={14} />
                                          </button>
                                   </div>
                            ))}

                            {selectedUrls.length < maxFiles && (
                                   <button
                                          type="button"
                                          onClick={() => setIsOpen(true)}
                                          className="aspect-video rounded-xl border-2 border-dashed border-[var(--glass-border)] flex flex-col items-center justify-center gap-2 hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.05)] transition-all group"
                                   >
                                          <Plus size={24} className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))]" />
                                          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))]">Add Photos</span>
                                   </button>
                            )}
                     </div>

                     {isOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                                   <div className="relative w-full max-w-4xl bg-[hsl(var(--background))] border border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                                          <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                                                 <h3 className="font-semibold">Select Photos</h3>
                                                 <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[var(--table-header)] rounded-lg transition-colors">
                                                        <X size={20} />
                                                 </button>
                                          </div>

                                          <div className="p-6 overflow-y-auto flex-1">
                                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {/* Upload Button in Grid */}
                                                        <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--glass-border)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[hsl(var(--accent))] transition-all">
                                                               <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                                                               <Upload size={24} className="text-[hsl(var(--accent))]" />
                                                               <span className="text-xs font-medium">Upload New</span>
                                                        </label>

                                                        {media.map((item: any) => {
                                                               const isSelected = selectedUrls.includes(item.url);
                                                               return (
                                                                      <div
                                                                             key={item.id}
                                                                             onClick={() => toggleUrl(item.url)}
                                                                             className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-[hsl(var(--accent))]' : 'border-transparent'}`}
                                                                      >
                                                                             <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                                             {isSelected && (
                                                                                    <div className="absolute inset-0 bg-[hsl(var(--accent)/0.2)] flex items-center justify-center">
                                                                                           <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center text-white">
                                                                                                  <Check size={20} />
                                                                                           </div>
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               );
                                                        })}

                                                        {isLoading && <div className="col-span-4 text-center py-12">Loading gallery...</div>}
                                                 </div>
                                          </div>

                                          <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--table-header)]/50 flex justify-between items-center">
                                                 <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                                        {selectedUrls.length} / {maxFiles} photos selected
                                                 </span>
                                                 <button
                                                        onClick={() => setIsOpen(false)}
                                                        className="btn-primary px-6 py-2 text-sm"
                                                 >
                                                        Done
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     )}
              </div>
       );
}
