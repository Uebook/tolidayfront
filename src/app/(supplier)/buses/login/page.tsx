'use client';

import Link from 'next/link';
import { Bus, Mail, Lock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
       const router = useRouter();
       const [isLoading, setIsLoading] = useState(false);

       const handleLogin = (e: React.FormEvent) => {
              e.preventDefault();
              setIsLoading(true);
              // Simulate login
              setTimeout(() => {
                     router.push('/buses/dashboard');
              }, 1500);
       };

       return (
              <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
                     {/* Background elements */}
                     <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
                     <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[120px]" />

                     <div className="w-full max-w-[440px] z-10">
                            {/* Logo & Header */}
                            <div className="text-center mb-10">
                                   <div
                                          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-2xl"
                                          style={{
                                                 background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 90% 45%))',
                                                 boxShadow: '0 8px 30px rgba(250, 150, 20, 0.4)'
                                          }}
                                   >
                                          <Bus size={32} color="white" />
                                   </div>
                                   <h1 className="text-3xl font-extrabold text-[hsl(var(--foreground))] tracking-tight mb-2">Bus Operator Portal</h1>
                                   <p style={{ color: 'hsl(var(--muted-foreground))' }}>Login to manage your routes and fleet</p>
                            </div>

                            {/* Login Card */}
                            <div className="glass-card p-8 md:p-10 border-[var(--glass-border-light)] shadow-2xl relative">
                                   <form onSubmit={handleLogin} className="space-y-6">
                                          <div className="space-y-2">
                                                 <label className="text-sm font-medium text-[hsl(var(--foreground))]/90 ml-1">Email Address</label>
                                                 <div className="relative group">
                                                        <Mail
                                                               className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-accent"
                                                               size={18}
                                                               style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}
                                                        />
                                                        <input
                                                               type="email"
                                                               placeholder="name@company.com"
                                                               className="form-input !pl-12 bg-[var(--table-header)] hover:bg-[var(--table-hover)] transition-all"
                                                               required
                                                        />
                                                 </div>
                                          </div>

                                          <div className="space-y-2">
                                                 <div className="flex justify-between items-center px-1">
                                                        <label className="text-sm font-medium text-[hsl(var(--foreground))]/90">Password</label>
                                                        <Link
                                                               href="/forgot-password"
                                                               className="text-xs font-semibold text-accent hover:underline"
                                                        >
                                                               Forgot Password?
                                                        </Link>
                                                 </div>
                                                 <div className="relative group">
                                                        <Lock
                                                               className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-accent"
                                                               size={18}
                                                               style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}
                                                        />
                                                        <input
                                                               type="password"
                                                               placeholder="••••••••"
                                                               className="form-input !pl-12 bg-[var(--table-header)] hover:bg-[var(--table-hover)] transition-all"
                                                               required
                                                        />
                                                 </div>
                                          </div>

                                          <button
                                                 type="submit"
                                                 disabled={isLoading}
                                                 className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 group mt-2"
                                          >
                                                 {isLoading ? (
                                                        <div className="w-5 h-5 border-2 border-[var(--glass-border-light)] border-t-white rounded-full animate-spin" />
                                                 ) : (
                                                        <>
                                                               Sign In <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                        </>
                                                 )}
                                          </button> <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/10"><p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Test Credentials</p><div className="flex justify-between items-center text-xs"><code className="text-foreground/70">bus@test.com</code><code className="text-foreground/70">test123</code></div></div>
                                   </form>
                            </div>

                            <p className="text-center mt-8 text-sm text-[hsl(var(--foreground))]/60">
                                   Don't have an account? {' '}
                                   <Link href="/buses/signup" className="text-accent font-bold hover:underline transition-all">
                                          Register Bus Operations
                                   </Link>
                            </p>
                     </div>
              </div>
       );
}
