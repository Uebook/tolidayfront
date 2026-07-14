'use client';

import Topbar from '@/components/layout/Topbar';
import { ArrowLeft, Check, X, Shield, Users, Hotel, CreditCard, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

const permissionGroups = [
    {
        category: 'Property & Inventory',
        icon: Hotel,
        permissions: [
            { id: 'view_property', name: 'View Property Details', desc: 'Can see basic hotel info and descriptions' },
            { id: 'edit_property', name: 'Edit Property Details', desc: 'Can update address, policies, and amenities' },
            { id: 'manage_inventory', name: 'Manage Inventory', desc: 'Can update room counts and set stop-sales' },
            { id: 'manage_rates', name: 'Manage Rates', desc: 'Can modify pricing and rate rules' },
        ],
        roles: {
            owner: ['view_property', 'edit_property', 'manage_inventory', 'manage_rates'],
            manager: ['view_property', 'manage_inventory', 'manage_rates'],
            staff: ['view_property']
        }
    },
    {
        category: 'Bookings & Operations',
        icon: Users,
        permissions: [
            { id: 'view_bookings', name: 'View Bookings', desc: 'Can see guest list and booking details' },
            { id: 'manage_bookings', name: 'Manage Bookings', desc: 'Can check guests in/out and cancel bookings' },
            { id: 'message_guests', name: 'Message Guests', desc: 'Can send messages to upcoming guests' },
        ],
        roles: {
            owner: ['view_bookings', 'manage_bookings', 'message_guests'],
            manager: ['view_bookings', 'manage_bookings', 'message_guests'],
            staff: ['view_bookings', 'manage_bookings']
        }
    },
    {
        category: 'Financials & Reports',
        icon: BarChart2,
        permissions: [
            { id: 'view_reports', name: 'View Reports', desc: 'Can access occupancy and revenue analytics' },
            { id: 'export_reports', name: 'Export Data', desc: 'Can download CSV reports' },
            { id: 'view_payouts', name: 'View Payouts', desc: 'Can see historical and upcoming payouts' },
        ],
        roles: {
            owner: ['view_reports', 'export_reports', 'view_payouts'],
            manager: ['view_reports', 'export_reports'],
            staff: []
        }
    },
    {
        category: 'Account Administration',
        icon: Shield,
        permissions: [
            { id: 'manage_staff', name: 'Manage Staff', desc: 'Can add, edit, or deactivate employee logins' },
            { id: 'manage_bank', name: 'Manage Bank Details', desc: 'Can update payout account information' },
        ],
        roles: {
            owner: ['manage_staff', 'manage_bank'],
            manager: ['manage_staff'], /* Managers can manage staff, but not bank info */
            staff: []
        }
    }
];

export default function PermissionsMatrixPage() {
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

    return (
        <div>
            <Topbar title="Permissions Matrix" subtitle="Understand what actions each role can perform" />

            <div className="p-8 space-y-6 animate-fadeIn max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <Link href="/hotel/staff" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]">
                        <ArrowLeft size={16} /> Back to Staff Management
                    </Link>
                    <button onClick={() => setIsCreateRoleOpen(true)} className="btn-primary px-5 py-2 text-sm">
                        Create Custom Role
                    </button>
                </div>

                <div className="glass-card overflow-hidden border-t-0 bg-[rgba(16,26,40,0.7)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--table-header)] border-b border-[var(--glass-border-light)]">
                                    <th className="p-5 font-bold text-[hsl(var(--foreground))] uppercase text-xs tracking-wider w-2/5">Permission Type</th>
                                    <th className="p-5 font-bold text-center text-[hsl(var(--foreground))] uppercase text-xs tracking-wider border-l border-[var(--glass-border-light)] w-1/5">Owner</th>
                                    <th className="p-5 font-bold text-center text-[hsl(var(--foreground))] uppercase text-xs tracking-wider border-l border-[var(--glass-border-light)] w-1/5">Manager</th>
                                    <th className="p-5 font-bold text-center text-[hsl(var(--foreground))] uppercase text-xs tracking-wider border-l border-[var(--glass-border-light)] w-1/5">Staff</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {permissionGroups.map((group, groupIndex) => (
                                    <React.Fragment key={group.category}>
                                        <tr className="bg-[var(--glass-border-light)]">
                                            <td colSpan={4} className="p-4 pl-5">
                                                <div className="flex items-center gap-2 font-semibold text-[hsl(195,90%,50%)]">
                                                    <group.icon size={16} /> {group.category}
                                                </div>
                                            </td>
                                        </tr>
                                        {group.permissions.map((perm) => (
                                            <tr key={perm.id} className="hover:bg-[var(--table-header)][0.02] transition-colors">
                                                <td className="p-4 pl-8">
                                                    <p className="font-medium text-[hsl(var(--foreground))] text-sm">{perm.name}</p>
                                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{perm.desc}</p>
                                                </td>
                                                {['owner', 'manager', 'staff'].map((role) => {
                                                    const hasPerm = group.roles[role as keyof typeof group.roles].includes(perm.id);
                                                    return (
                                                        <td key={role} className="p-4 text-center border-l border-[var(--glass-border-light)]">
                                                            <div className="flex justify-center">
                                                                {hasPerm ? (
                                                                    <div className="w-6 h-6 rounded-full bg-[hsl(142,70%,45%,0.15)] text-[hsl(142,70%,45%)] flex items-center justify-center">
                                                                        <Check size={14} strokeWidth={3} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-[var(--table-header)] text-[hsl(var(--muted-foreground))] flex items-center justify-center">
                                                                        <X size={14} strokeWidth={2} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="p-5 rounded-2xl bg-[var(--table-header)] border border-[var(--glass-border-light)]">
                        <h4 className="font-bold text-[hsl(var(--foreground))] mb-2 text-sm uppercase tracking-wider">Property Owner</h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Full unrestricted access to all portal features, financial data, and account settings including payout mechanisms.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--table-header)] border border-[var(--glass-border-light)]">
                        <h4 className="font-bold text-[hsl(var(--foreground))] mb-2 text-sm uppercase tracking-wider">Hotel Manager</h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Designed for general managers. Can oversee day-to-day operations, pricing, bookings, and manage base-level staff.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--table-header)] border border-[var(--glass-border-light)]">
                        <h4 className="font-bold text-[hsl(var(--foreground))] mb-2 text-sm uppercase tracking-wider">Reception Staff</h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Restricted specifically to booking management and check-ins. No access to financial data or rate configurations.</p>
                    </div>
                </div>
            </div>

            {/* Create Role Modal */}
            {isCreateRoleOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[hsl(var(--card))] border border-[var(--glass-border)] rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--glass-border-light)]">
                            <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">Create Custom Role</h3>
                            <button onClick={() => setIsCreateRoleOpen(false)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Role Name</label>
                                <input type="text" placeholder="e.g. Housekeeping Lead" className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Description</label>
                                <textarea placeholder="Describe the responsibilities of this role..." className="form-input min-h-[80px] resize-y" />
                            </div>
                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm flex items-start gap-3">
                                <Shield className="shrink-0 mt-0.5" size={18} />
                                <p>Custom roles will allow you to pick and choose specific permissions for each group. This feature is currently in preview.</p>
                            </div>
                        </div>
                        <div className="p-5 border-t border-[var(--glass-border-light)] flex justify-end gap-3 bg-[var(--table-header)] rounded-b-2xl">
                            <button onClick={() => setIsCreateRoleOpen(false)} className="px-5 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">Cancel</button>
                            <button onClick={() => { setIsCreateRoleOpen(false); alert('Custom Role feature is coming soon!'); }} className="btn-primary px-6 py-2">Create Role</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
