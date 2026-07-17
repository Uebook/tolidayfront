'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(() => {
        if (typeof window !== 'undefined') {
            const err = new URLSearchParams(window.location.search).get('error');
            if (err === 'unauthorized') {
                return 'Access Denied: Administrator role required.';
            }
        }
        return '';
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            const decoded: any = jwtDecode(res.data.token);
            if (decoded.role !== 'ADMIN' && decoded.role !== 'superadmin') {
                throw new Error('Access Denied: Administrator role required.');
            }
            localStorage.setItem('token', res.data.token);
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#070b19] dark:bg-[#070b19]">
            {/* Ambient Background Blur */}
            <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[140px] pointer-events-none" />

            <div className="w-full max-w-[440px] z-10 animate-fadeIn">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] mb-6 shadow-xl transition-transform hover:scale-105 active:scale-95 duration-300"
                        style={{
                            background: 'linear-gradient(135deg, hsl(230 90% 50%), hsl(260 90% 45%))',
                            boxShadow: '0 8px 30px rgba(79, 70, 229, 0.35)'
                        }}
                    >
                        <Shield size={30} color="white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Toliday Admin OS Portal</p>
                </div>

                {/* Glass Card */}
                <div className="bg-[#0e1628]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[32px] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 tracking-wide ml-1 uppercase">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@toliday.com"
                                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 focus:bg-[#070b19] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none text-sm font-medium text-white transition-all duration-300"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-zinc-400 tracking-wide uppercase">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 focus:bg-[#070b19] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none text-sm font-medium text-white transition-all duration-300"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl py-4 transition-all duration-300 shadow-[0_8px_25px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 mt-3 cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Establish Link <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-blue-600 text-xs font-bold transition-all group">
                        <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Return to Public Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}
