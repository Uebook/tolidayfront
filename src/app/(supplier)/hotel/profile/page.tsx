'use client';

import Topbar from '@/components/layout/Topbar';
import { Save, Building2, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'personal' | 'bank' | 'gst' | 'verification'>('personal');

    const [formData, setFormData] = useState({
        ownerFirstName: '', ownerLastName: '', email: '', ownerPhone: '',
        businessName: '', businessType: 'Hotel', city: '',
        bankHolder: '', bankName: '', bankAccount: '', bankIfsc: '',
        gstNumber: '', panNumber: '', isVerified: false,
        description: '', address: '', pinCode: '', contactNumber: '',
        website: '', stars: 3, checkInTime: '14:00', checkOutTime: '11:00',
        maxAdults: '4', maxChildren: '2', childPolicy: '',
        cancellationPolicy: '', petPolicy: '', amenities: [] as string[]
    });

    const { data: hotel, isLoading } = useQuery({
        queryKey: ['my-hotel-profile'],
        queryFn: async () => {
            const res = await api.get('/hotel/my-hotel');
            return res.data;
        },
    });

    useEffect(() => {
        if (hotel) {
            setFormData({
                ownerFirstName: hotel.ownerFirstName || '',
                ownerLastName: hotel.ownerLastName || '',
                email: hotel.email || '',
                ownerPhone: hotel.ownerPhone || '',
                businessName: hotel.businessName || '',
                businessType: hotel.businessType || 'Hotel',
                city: hotel.city || '',
                bankHolder: hotel.bankHolder || '',
                bankName: hotel.bankName || '',
                bankAccount: hotel.bankAccount || '',
                bankIfsc: hotel.bankIfsc || '',
                gstNumber: hotel.gstNumber || '',
                panNumber: hotel.panNumber || '',
                isVerified: hotel.isVerified || false,
                description: hotel.description || '',
                address: hotel.address || '',
                pinCode: hotel.pinCode || '',
                contactNumber: hotel.contactNumber || '',
                website: hotel.website || '',
                stars: hotel.stars || 3,
                checkInTime: hotel.checkInTime || '14:00',
                checkOutTime: hotel.checkOutTime || '11:00',
                maxAdults: hotel.maxAdults || '4',
                maxChildren: hotel.maxChildren || '2',
                childPolicy: hotel.childPolicy || '',
                cancellationPolicy: hotel.cancellationPolicy || '',
                petPolicy: hotel.petPolicy || '',
                amenities: hotel.amenities || [],
            });
        }
    }, [hotel]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            await api.patch('/hotel/my-hotel', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-hotel-profile'] });
            alert('Profile updated successfully!');
        }
    });

    const handleSave = () => {
        mutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Profile & Settings" subtitle="Manage your supplier account and verification details" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                    {([
                        { key: 'personal', label: 'Profile', icon: Building2 },
                        { key: 'bank', label: 'Bank Details', icon: CreditCard },
                        { key: 'gst', label: 'GST & Docs', icon: FileText },
                        { key: 'verification', label: 'Verification', icon: ShieldCheck },
                    ] as const).map((t) => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{ background: activeTab === t.key ? 'var(--glass-border)' : 'transparent', color: 'hsl(var(--muted-foreground))' }}
                        >
                            <t.icon size={13} /> {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'personal' && (
                    <div className="glass-card p-6 space-y-4 animate-fadeIn max-w-2xl">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Supplier Profile</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Property Name (Public)</label>
                                <input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="form-input" placeholder="e.g. Grand Plaza Hotel" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Property Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-input min-h-[100px]" placeholder="Describe your property..." />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Owner First Name</label>
                                <input value={formData.ownerFirstName} onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Owner Last Name</label>
                                <input value={formData.ownerLastName} onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Email Address</label>
                                <input value={formData.email} disabled className="form-input opacity-60 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Owner Phone</label>
                                <input value={formData.ownerPhone} onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Legal Business Name</label>
                                <input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Business Type</label>
                                <select value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} className="form-input">
                                    <option value="Hotel">Hotel</option>
                                    <option value="Resort">Resort</option>
                                    <option value="Boutique Hotel">Boutique Hotel</option>
                                    <option value="Service Apartment">Service Apartment</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Full Address</label>
                                <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="form-input" placeholder="123 Street, Area" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">City</label>
                                <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Pin Code</label>
                                <input value={formData.pinCode} onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Property Phone</label>
                                <input value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Website</label>
                                <input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="form-input" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Star Rating</label>
                                <select value={formData.stars} onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) })} className="form-input">
                                    {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Star</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="h-px w-full my-6 bg-border" />

                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Policies & Capacity</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Check-In Time</label>
                                <input type="time" value={formData.checkInTime} onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Check-Out Time</label>
                                <input type="time" value={formData.checkOutTime} onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Max Adults (Default)</label>
                                <input value={formData.maxAdults} onChange={(e) => setFormData({ ...formData, maxAdults: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Max Children (Default)</label>
                                <input value={formData.maxChildren} onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value })} className="form-input" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Child Policy</label>
                                <textarea value={formData.childPolicy} onChange={(e) => setFormData({ ...formData, childPolicy: e.target.value })} className="form-input min-h-[80px]" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Cancellation Policy</label>
                                <textarea value={formData.cancellationPolicy} onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })} className="form-input min-h-[80px]" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Pet Policy</label>
                                <textarea value={formData.petPolicy} onChange={(e) => setFormData({ ...formData, petPolicy: e.target.value })} className="form-input min-h-[80px]" />
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm mt-4">
                            <Save size={14} /> {mutation.isPending ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div className="glass-card p-6 space-y-4 animate-fadeIn max-w-2xl">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Bank Account Details</h3>
                        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Payouts will be transferred to this account every 7 days.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Account Holder Name</label>
                                <input value={formData.bankHolder} onChange={(e) => setFormData({ ...formData, bankHolder: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Bank Name</label>
                                <input value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Account Number</label>
                                <input value={formData.bankAccount} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">IFSC Code</label>
                                <input value={formData.bankIfsc} onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })} className="form-input" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'hsl(38 92% 50% / 0.1)', border: '1px solid hsl(38 92% 50% / 0.3)' }}>
                            <span style={{ color: 'hsl(38 92% 50%)' }}>⚠</span>
                            <p className="text-xs" style={{ color: 'hsl(38 92% 50%)' }}>Bank changes require admin verification. Processing takes 2–3 business days.</p>
                        </div>
                        <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
                            <Save size={14} /> {mutation.isPending ? 'Saving...' : 'Update Bank Details'}
                        </button>
                    </div>
                )}

                {activeTab === 'gst' && (
                    <div className="glass-card p-6 space-y-4 animate-fadeIn max-w-2xl">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">GST & Business Documents</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">GST Number</label>
                                <input value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} className="form-input" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">PAN Number</label>
                                <input value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} className="form-input" />
                            </div>
                            {['GST Certificate', 'PAN Card', 'Trade License', 'Property Ownership Proof'].map((doc) => (
                                <div key={doc} className="col-span-2 flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                                    <div>
                                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{doc}</p>
                                        <p className="text-xs mt-0.5" style={{ color: formData.isVerified ? 'hsl(142 71% 45%)' : 'hsl(38 92% 50%)' }}>
                                            {formData.isVerified ? '✓ Uploaded & Verified' : '⚠ Pending Upload/Verification'}
                                        </p>
                                    </div>
                                    <button className="text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>
                                        {formData.isVerified ? 'View' : 'Upload'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm mt-4">
                            <Save size={14} /> {mutation.isPending ? 'Saving...' : 'Save Document Details'}
                        </button>
                    </div>
                )}

                {activeTab === 'verification' && (
                    <div className="glass-card p-6 animate-fadeIn max-w-2xl">
                        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">Verification Status</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Email Verification', status: formData.isVerified ? 'verified' : 'pending', detail: formData.email || 'Missing email' },
                                { label: 'Mobile Verification', status: formData.isVerified ? 'verified' : 'pending', detail: formData.ownerPhone || 'Missing phone' },
                                { label: 'GST Verification', status: formData.isVerified ? 'verified' : 'pending', detail: formData.gstNumber || 'Missing GST' },
                                { label: 'Bank Account Verification', status: formData.isVerified ? 'verified' : 'pending', detail: `${formData.bankName} ••••${formData.bankAccount?.slice(-4) || ''}` },
                                { label: 'Business Verification', status: formData.isVerified ? 'verified' : 'pending', detail: formData.businessName || 'Missing business name' },
                            ].map((v) => (
                                <div key={v.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                                    <div>
                                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{v.label}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{v.detail}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ background: v.status === 'verified' ? 'hsl(142 71% 45%)' : 'hsl(38 92% 50%)' }} />
                                        <span className="text-xs font-medium" style={{ color: v.status === 'verified' ? 'hsl(142 71% 45%)' : 'hsl(38 92% 50%)' }}>
                                            {v.status === 'verified' ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

