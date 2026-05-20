'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, Hotel } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
       const [email, setEmail] = useState('');
       const [isSubmitted, setIsSubmitted] = useState(false);

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              setIsSubmitted(true);
       };

       return (
              <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden backdrop-blur-3xl">
                     {/* Background elements */}
                     <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
                     <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[120px]" />

                     <div className="w-full max-w-[440px] z-10 text-center">
                            <div
                                   className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 shadow-2xl"
                                   style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%), hsl(195 90% 45%))' }}
                            >
                                   <Hotel size={32} color="white" />
                            </div>

                            <div className="glass-card p-8 md:p-10 shadow-2xl relative">
                                   {!isSubmitted ? (
                                          <>
                                                 <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Reset Password</h2>
                                                 <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">Enter your registered email and we'll send you a link to reset your password.</p>

                                                 <form onSubmit={handleSubmit} className="space-y-6">
                                                        <div className="space-y-2 text-left">
                                                               <label className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--foreground))]/60 ml-1">Email Address</label>
                                                               <input
                                                                      type="email"
                                                                      value={email}
                                                                      onChange={(e) => setEmail(e.target.value)}
                                                                      placeholder="john@hotelbrand.com"
                                                                      className="form-input"
                                                                      required
                                                               />
                                                        </div>
                                                        <button type="submit" className="btn-primary w-full py-4 tracking-wide">
                                                               Send Reset Link
                                                        </button>
                                                 </form>
                                          </>
                                   ) : (
                                          <div className="animate-fadeIn">
                                                 <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <Mail size={32} />
                                                 </div>
                                                 <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Check your email</h2>
                                                 <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
                                                        We've sent password reset instructions to <br />
                                                        <span className="font-semibold text-[hsl(var(--foreground))]">{email}</span>
                                                 </p>
                                          </div>
                                   )}

                                   <div className="mt-8 pt-8 border-t border-[var(--glass-border)]">
                                          <Link href="/hotel/login" className="text-sm font-semibold text-accent hover:underline flex items-center justify-center gap-2">
                                                 <ArrowLeft size={16} /> Back to Login
                                          </Link>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}
