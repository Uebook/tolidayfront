'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, Image as ImageIcon, Plus, Trash2, Edit2, 
  Layout, Tag, MapPin, FileText, Check, FileCheck 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CMSPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'hero' | 'promos' | 'destinations' | 'blogs' | 'policies'>('hero');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [heroForm, setHeroForm] = useState({ id: '', title: '', subtitle: '', mediaUrl: '', ctaText: '', ctaLink: '' });
  const [promoForm, setPromoForm] = useState({ title: '', description: '', code: '', discount: '', imageUrl: '', service: 'home', isActive: true });
  const [destForm, setDestForm] = useState({ name: '', description: '', imageUrl: '', isInternational: false });
  const [blogForm, setBlogForm] = useState({ title: '', content: '', image: '', category: 'General', readTime: '5 min read', status: 'published' });
  const [policyForm, setPolicyForm] = useState({ key: 'privacy', title: 'Privacy Policy', contentHtml: '' });

  // ----------------------------------------
  // Data Queries
  // ----------------------------------------
  const { data: heroData, isLoading: loadingHero } = useQuery({
    queryKey: ['cms-hero'],
    queryFn: async () => {
      const res = await api.get('/public/cms/hero');
      if (res.data) setHeroForm(res.data);
      return res.data;
    }
  });

  const { data: promos = [], isLoading: loadingPromos } = useQuery({
    queryKey: ['cms-promos'],
    queryFn: async () => {
      const res = await api.get('/public/cms/promos');
      return res.data;
    }
  });

  const { data: destinations = [], isLoading: loadingDestinations } = useQuery({
    queryKey: ['cms-destinations'],
    queryFn: async () => {
      const res = await api.get('/public/cms/destinations');
      return res.data;
    }
  });

  const { data: blogs = [], isLoading: loadingBlogs } = useQuery({
    queryKey: ['cms-blogs'],
    queryFn: async () => {
      const res = await api.get('/public/cms/blogs');
      return res.data;
    }
  });

  const { data: policyData, isLoading: loadingPolicy, refetch: refetchPolicy } = useQuery({
    queryKey: ['cms-policy', policyForm.key],
    queryFn: async () => {
      const res = await api.get(`/public/cms/policy/${policyForm.key}`);
      if (res.data) {
        setPolicyForm({ key: res.data.key, title: res.data.title, contentHtml: res.data.contentHtml });
      } else {
        setPolicyForm(prev => ({ ...prev, title: prev.key === 'privacy' ? 'Privacy Policy' : 'Refund Policy', contentHtml: '' }));
      }
      return res.data;
    }
  });

  // ----------------------------------------
  // Mutations
  // ----------------------------------------
  const updateHeroMutation = useMutation({
    mutationFn: async (data: typeof heroForm) => {
      return api.patch(`/admin/cms/hero/${data.id}`, data);
    },
    onSuccess: () => {
      toast.success('Hero Section updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['cms-hero'] });
    },
    onError: () => toast.error('Failed to update Hero Section')
  });

  const savePromoMutation = useMutation({
    mutationFn: async (data: typeof promoForm) => {
      if (editingId) {
        return api.patch(`/admin/cms/promos/${editingId}`, data);
      }
      return api.post('/admin/cms/promos', data);
    },
    onSuccess: () => {
      toast.success(editingId ? 'Promotion updated!' : 'Promotion created!');
      setEditingId(null);
      setPromoForm({ title: '', description: '', code: '', discount: '', imageUrl: '', service: 'home', isActive: true });
      queryClient.invalidateQueries({ queryKey: ['cms-promos'] });
    },
    onError: () => toast.error('Failed to save promotion')
  });

  const deletePromoMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/cms/promos/${id}`),
    onSuccess: () => {
      toast.success('Promotion deleted!');
      queryClient.invalidateQueries({ queryKey: ['cms-promos'] });
    }
  });

  const saveDestMutation = useMutation({
    mutationFn: async (data: typeof destForm) => {
      if (editingId) {
        return api.patch(`/admin/cms/destinations/${editingId}`, data);
      }
      return api.post('/admin/cms/destinations', data);
    },
    onSuccess: () => {
      toast.success(editingId ? 'Destination updated!' : 'Destination created!');
      setEditingId(null);
      setDestForm({ name: '', description: '', imageUrl: '', isInternational: false });
      queryClient.invalidateQueries({ queryKey: ['cms-destinations'] });
    },
    onError: () => toast.error('Failed to save destination')
  });

  const deleteDestMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/cms/destinations/${id}`),
    onSuccess: () => {
      toast.success('Destination deleted!');
      queryClient.invalidateQueries({ queryKey: ['cms-destinations'] });
    }
  });

  const saveBlogMutation = useMutation({
    mutationFn: async (data: typeof blogForm) => {
      if (editingId) {
        return api.patch(`/admin/cms/blogs/${editingId}`, data);
      }
      return api.post('/admin/cms/blogs', data);
    },
    onSuccess: () => {
      toast.success(editingId ? 'Blog updated!' : 'Blog post published!');
      setEditingId(null);
      setBlogForm({ title: '', content: '', image: '', category: 'General', readTime: '5 min read', status: 'published' });
      queryClient.invalidateQueries({ queryKey: ['cms-blogs'] });
    },
    onError: () => toast.error('Failed to save blog')
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/cms/blogs/${id}`),
    onSuccess: () => {
      toast.success('Blog deleted!');
      queryClient.invalidateQueries({ queryKey: ['cms-blogs'] });
    }
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async (data: typeof policyForm) => {
      return api.put(`/admin/cms/policy/${data.key}`, data);
    },
    onSuccess: () => {
      toast.success('Policy updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['cms-policy', policyForm.key] });
    },
    onError: () => toast.error('Failed to update policy')
  });

  const startEdit = (type: string, item: any) => {
    setEditingId(item.id);
    if (type === 'promo') {
      setPromoForm({
        title: item.title,
        description: item.description || '',
        code: item.code,
        discount: item.discount || '',
        imageUrl: item.imageUrl,
        service: item.service || 'home',
        isActive: item.isActive ?? true
      });
    } else if (type === 'dest') {
      setDestForm({
        name: item.name,
        description: item.description || '',
        imageUrl: item.imageUrl,
        isInternational: item.isInternational ?? false
      });
    } else if (type === 'blog') {
      setBlogForm({
        title: item.title,
        content: item.content,
        image: item.image,
        category: item.category || 'General',
        readTime: item.readTime || '5 min read',
        status: item.status || 'published'
      });
    }
  };

  return (
    <div className="min-h-full">
      <Topbar title="Website CMS Manager" subtitle="Manage homepage hero banners, promotions, destinations, and policy pages" />
      <div className="p-6 md:p-8 space-y-6 md:space-y-8 animate-fadeIn max-w-[1600px] mx-auto">
        
        {/* Glassmorphic Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-black/[0.03] dark:bg-white/[0.03] border border-border/10 rounded-2xl w-fit">
          {[
            { id: 'hero', label: 'Homepage Hero', icon: Layout },
            { id: 'promos', label: 'Promo Banners', icon: Tag },
            { id: 'destinations', label: 'Destinations', icon: MapPin },
            { id: 'blogs', label: 'Blogs & Articles', icon: FileText },
            { id: 'policies', label: 'Legal Policies', icon: FileCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setEditingId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <Card className="rounded-[32px] border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight text-foreground">Hero Banner Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHero ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); updateHeroMutation.mutate(heroForm); }} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Main Title</label>
                      <input
                        type="text"
                        value={heroForm.title}
                        onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Media Background URL</label>
                      <input
                        type="text"
                        value={heroForm.mediaUrl}
                        onChange={(e) => setHeroForm({ ...heroForm, mediaUrl: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Subtitle Description</label>
                    <textarea
                      value={heroForm.subtitle}
                      onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors h-24 resize-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">CTA Button Text</label>
                      <input
                        type="text"
                        value={heroForm.ctaText}
                        onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">CTA Button Redirect</label>
                      <input
                        type="text"
                        value={heroForm.ctaLink}
                        onChange={(e) => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updateHeroMutation.isPending}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {updateHeroMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Hero Changes
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Promo Banners Tab */}
        {activeTab === 'promos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="rounded-[32px] border border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-foreground">
                  {editingId ? 'Edit Promo Banner' : 'Create Promo Banner'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); savePromoMutation.mutate(promoForm); }} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Service Category</label>
                    <select
                      value={promoForm.service}
                      onChange={(e) => setPromoForm({ ...promoForm, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors cursor-pointer"
                    >
                      <option value="home">Home / All Page</option>
                      <option value="hotels">Hotels Section</option>
                      <option value="flights">Flights Section</option>
                      <option value="bus">Bus Section</option>
                      <option value="cab">Cabs Section</option>
                      <option value="holidays">Holidays Section</option>
                      <option value="activities">Activities Section</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Promo Title</label>
                    <input
                      type="text"
                      value={promoForm.title}
                      onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                      placeholder="e.g. 21st Birthday Sale"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Coupon Code</label>
                      <input
                        type="text"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                        placeholder="e.g. TLDY20"
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Discount Detail</label>
                      <input
                        type="text"
                        value={promoForm.discount}
                        onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                        placeholder="e.g. Flat 20% Off"
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Description</label>
                    <textarea
                      value={promoForm.description}
                      onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      placeholder="e.g. Valid on all domestic airline bookings"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors h-20 resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Banner Image URL</label>
                    <input
                      type="text"
                      value={promoForm.imageUrl}
                      onChange={(e) => setPromoForm({ ...promoForm, imageUrl: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={promoForm.isActive}
                      onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Active Banner</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savePromoMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      {savePromoMutation.isPending && <Loader2 className="w-3 animate-spin" />}
                      Save Promo
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setPromoForm({ title: '', description: '', code: '', discount: '', imageUrl: '', service: 'home', isActive: true }); }}
                        className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-foreground font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-[32px] border border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-foreground">Active Banners ({promos.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingPromos ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                  <div className="divide-y divide-border/10 max-h-[600px] overflow-y-auto">
                    {promos.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-start justify-between gap-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                          <img src={item.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg border border-border/10 bg-slate-100" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-foreground">{item.title}</span>
                              <span className="text-[10px] font-black uppercase bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/10">
                                {item.service}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground mt-0.5">Code: <span className="font-bold text-foreground">{item.code}</span> ({item.discount || 'No Discount'})</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit('promo', item)}
                            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deletePromoMutation.mutate(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Featured Destinations Tab */}
        {activeTab === 'destinations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="rounded-[32px] border border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-foreground">
                  {editingId ? 'Edit Destination' : 'Add Destination'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); saveDestMutation.mutate(destForm); }} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Destination Name</label>
                    <input
                      type="text"
                      value={destForm.name}
                      onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                      placeholder="e.g. Kashmir"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Description</label>
                    <input
                      type="text"
                      value={destForm.description}
                      onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                      placeholder="e.g. Paradise on Earth"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Image URL</label>
                    <input
                      type="text"
                      value={destForm.imageUrl}
                      onChange={(e) => setDestForm({ ...destForm, imageUrl: e.target.value })}
                      placeholder="https://example.com/dest.jpg"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={destForm.isInternational}
                      onChange={(e) => setDestForm({ ...destForm, isInternational: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">International Destination</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saveDestMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      {saveDestMutation.isPending && <Loader2 className="w-3 animate-spin" />}
                      Save Destination
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setDestForm({ name: '', description: '', imageUrl: '', isInternational: false }); }}
                        className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-foreground font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-[32px] border border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-foreground">Featured Destinations ({destinations.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingDestinations ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                  <div className="divide-y divide-border/10 max-h-[600px] overflow-y-auto">
                    {destinations.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-start justify-between gap-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                          <img src={item.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg border border-border/10 bg-slate-100" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-foreground">{item.name}</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                item.isInternational 
                                  ? 'bg-purple-600/10 text-purple-600 border-purple-500/10'
                                  : 'bg-emerald-600/10 text-emerald-600 border-emerald-500/10'
                              }`}>
                                {item.isInternational ? 'International' : 'Domestic'}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground mt-0.5">{item.description || 'No Description'}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit('dest', item)}
                            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteDestMutation.mutate(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blogs & Travel Stories Tab */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="rounded-[32px] border border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-foreground">
                  {editingId ? 'Edit Article' : 'Write New Article'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); saveBlogMutation.mutate(blogForm); }} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Article Title</label>
                    <input
                      type="text"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="e.g. Travel Hacks for Airport Queues"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Category Tag</label>
                      <input
                        type="text"
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        placeholder="e.g. Travel Hacks"
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Read Time</label>
                      <input
                        type="text"
                        value={blogForm.readTime}
                        onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                        placeholder="e.g. 5 min read"
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Content Text</label>
                    <textarea
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      placeholder="Write your article text here..."
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors h-36 resize-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Cover Image URL</label>
                    <input
                      type="text"
                      value={blogForm.image}
                      onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                      placeholder="https://example.com/blog.jpg"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Publication Status</label>
                    <select
                      value={blogForm.status}
                      onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors cursor-pointer"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saveBlogMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      {saveBlogMutation.isPending && <Loader2 className="w-3 animate-spin" />}
                      Publish Article
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setBlogForm({ title: '', content: '', image: '', category: 'General', readTime: '5 min read', status: 'published' }); }}
                        className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-foreground font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-[32px] border border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-foreground">Blog Articles ({blogs.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingBlogs ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                  <div className="divide-y divide-border/10 max-h-[600px] overflow-y-auto">
                    {blogs.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-start justify-between gap-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt="" className="w-16 h-12 object-cover rounded-lg border border-border/10 bg-slate-100" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-foreground">{item.title}</span>
                              <span className="text-[10px] font-black uppercase bg-violet-600/10 text-violet-600 px-2 py-0.5 rounded-full border border-violet-500/10">
                                {item.category}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground mt-0.5">{item.readTime} • Status: <span className="font-bold text-foreground uppercase">{item.status}</span></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit('blog', item)}
                            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteBlogMutation.mutate(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legal Policies Tab */}
        {activeTab === 'policies' && (
          <Card className="rounded-[32px] border-border/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight text-foreground">Terms & Policies Editor</CardTitle>
              <select
                value={policyForm.key}
                onChange={(e) => setPolicyForm({ ...policyForm, key: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border/10 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="privacy">Privacy Policy</option>
                <option value="refund">Refund & Cancellation Policy</option>
              </select>
            </CardHeader>
            <CardContent>
              {loadingPolicy ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); updatePolicyMutation.mutate(policyForm); }} className="space-y-6 max-w-4xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Policy Title</label>
                    <input
                      type="text"
                      value={policyForm.title}
                      onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Content HTML Markup</label>
                    <textarea
                      value={policyForm.contentHtml}
                      onChange={(e) => setPolicyForm({ ...policyForm, contentHtml: e.target.value })}
                      placeholder="<p>Enter HTML policy content here...</p>"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 outline-none text-sm focus:border-blue-500/40 transition-colors h-72 resize-none font-mono"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatePolicyMutation.isPending}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {updatePolicyMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Policy Document
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
