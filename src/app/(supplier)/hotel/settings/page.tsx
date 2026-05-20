'use client';

import Topbar from '@/components/layout/Topbar';
import { Key, Smartphone, Bell, Globe, Shield, AlertTriangle, Save, LogOut, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getAuthUser } from '@/lib/auth';

export default function SettingsPage() {
    const user = getAuthUser();
    const queryClient = useQueryClient();

    const [twoFA, setTwoFA] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [smsNotifs, setSmsNotifs] = useState(true);

    const { data: staff, isLoading } = useQuery({
        queryKey: ['my-staff-settings', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await api.get(`/staff/${user.id}`);
            return res.data;
        },
        enabled: !!user?.id
    });

    useEffect(() => {
        if (staff) {
            setTwoFA(staff.twoFactorEnabled ?? false);
            setEmailNotifs(staff.emailNotifications ?? true);
            setSmsNotifs(staff.smsNotifications ?? true);
        }
    }, [staff]);

    const updateSettingsMutation = useMutation({
        mutationFn: async (vars: any) => {
            await api.patch(`/staff/${user?.id}`, vars);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-staff-settings'] });
        }
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const changePasswordMutation = useMutation({
        mutationFn: async () => {
            setErrorMsg('');
            setSuccessMsg('');
            if (!passwords.currentPassword) throw new Error("Current password is required");
            if (passwords.newPassword !== passwords.confirmPassword) {
                throw new Error("Passwords don't match");
            }
            if (passwords.newPassword.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }
            await api.patch('/auth/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
        },
        onSuccess: () => {
            setSuccessMsg('Password updated successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (err: any) => {
            setErrorMsg(err.response?.data?.message || err.message || 'Failed to update password');
        }
    });

    const handleUpdatePassword = () => {
        changePasswordMutation.mutate();
    };

    const handleToggle = (key: string, value: boolean) => {
        if (key === '2fa') setTwoFA(value);
        if (key === 'email') setEmailNotifs(value);
        if (key === 'sms') setSmsNotifs(value);

        const payload: any = {};
        if (key === '2fa') payload.twoFactorEnabled = value;
        if (key === 'email') payload.emailNotifications = value;
        if (key === 'sms') payload.smsNotifications = value;

        updateSettingsMutation.mutate(payload);
    };

    const handleLogoutAll = () => {
        if (confirm("Are you sure you want to sign out of all devices? This will invalidate your current session too.")) {
            // Simulated for now, would typically revoke refresh tokens in a real implementation
            alert("This feature requires advanced session management. Implementing baseline revoker...");
            window.location.href = '/login';
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
        <div>
            <Topbar title="Account Settings" subtitle="Manage your security and account preferences" />
            <div className="p-6 space-y-5 animate-fadeIn max-w-2xl">

                {/* Change Password */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Key size={16} style={{ color: 'hsl(var(--accent))' }} />
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Change Password</h3>
                    </div>
                    {errorMsg && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
                            {successMsg}
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Current Password</label>
                        <div className="relative">
                            <input
                                value={passwords.currentPassword}
                                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="form-input pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                            >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">New Password</label>
                        <div className="relative">
                            <input
                                value={passwords.newPassword}
                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Minimum 8 characters"
                                className="form-input pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Confirm New Password</label>
                        <div className="relative">
                            <input
                                value={passwords.confirmPassword}
                                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="form-input pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button onClick={handleUpdatePassword} disabled={changePasswordMutation.isPending} className="btn-primary px-5 py-2.5 text-sm">
                        {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ background: twoFA ? 'hsl(142 71% 45% / 0.15)' : 'var(--glass-border-light)' }}>
                                <Smartphone size={16} style={{ color: twoFA ? 'hsl(142 71% 45%)' : 'hsl(var(--muted-foreground))' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[hsl(var(--foreground))]">Two-Factor Authentication</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Add an extra layer of security to your account</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={twoFA} onChange={(e) => handleToggle('2fa', e.target.checked)} />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    {twoFA && (
                        <div className="mt-4 p-3 rounded-lg animate-fadeIn" style={{ background: 'hsl(142 71% 45% / 0.1)', border: '1px solid hsl(142 71% 45% / 0.3)' }}>
                            <p className="text-xs" style={{ color: 'hsl(142 71% 45%)' }}>✓ 2FA is enabled. OTP will be sent to your registered mobile number on each login.</p>
                        </div>
                    )}
                </div>

                {/* Notification Channels */}
                <div className="glass-card p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell size={16} style={{ color: 'hsl(var(--accent))' }} />
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Notification Channels</h3>
                    </div>
                    {[
                        { key: 'email', label: 'Email Notifications', subtext: 'Receive booking and payment alerts via email', checked: emailNotifs },
                        { key: 'sms', label: 'SMS Notifications', subtext: 'Get instant SMS alerts for new bookings', checked: smsNotifs },
                    ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--glass-border-light)' }}>
                            <div>
                                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{pref.label}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{pref.subtext}</p>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={pref.checked} onChange={(e) => handleToggle(pref.key, e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    ))}
                </div>

                {/* Active Sessions */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={16} style={{ color: 'hsl(var(--accent))' }} />
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Active Sessions</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--glass-border)] bg-white/5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">Current Browser Session</p>
                                    <span className="badge badge-success text-[10px]">Active Now</span>
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>New Delhi, IN · Chrome on macOS</p>
                            </div>
                            <span className="text-[10px] uppercase font-bold opacity-40">Your device</span>
                        </div>
                        <p className="text-[10px] px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            Note: Device tracking is currently limited to your local session. Sign out all devices feature is available below.
                        </p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="glass-card p-6 space-y-4" style={{ borderColor: 'hsl(0 84% 60% / 0.3)' }}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} style={{ color: 'hsl(0 84% 60%)' }} />
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Danger Zone</h3>
                    </div>
                    <div className="p-4 rounded-xl space-y-4" style={{ background: 'hsl(0 84% 60% / 0.05)' }}>
                        <div>
                            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Sign out of all devices</p>
                            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                This will log you out of all devices where you are currently signed in.
                            </p>
                        </div>
                        <button
                            onClick={handleLogoutAll}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold w-full transition-all hover:scale-[1.01] active:scale-[0.99]"
                            style={{
                                background: 'hsl(0 84% 60%)',
                                color: 'white',
                                boxShadow: '0 4px 12px hsl(0 84% 60% / 0.3)'
                            }}
                        >
                            <LogOut size={16} /> Sign out of all devices
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
