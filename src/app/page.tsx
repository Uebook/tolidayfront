'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Hotel, Car, Map, Bus, ArrowRight, ShieldCheck, TrendingUp, Users, CheckCircle2, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const services = [
  {
    id: 'hotels',
    name: 'Hotels & Properties',
    description: 'List your hotel, resort, or homestay. Manage inventory, pricing, and bookings in real-time.',
    icon: Hotel,
    color: 'hsl(228 80% 55%)',
    bg: 'linear-gradient(135deg, hsl(228 80% 55%), hsl(195 90% 45%))',
    shadow: 'rgba(20, 80, 255, 0.4)',
    active: true,
    loginHref: '/hotel/login',
    signupHref: '/hotel/signup'
  },
  {
    id: 'cabs',
    name: 'Cabs & Fleet',
    description: 'Register your vehicle fleet. Accept point-to-point transfers and daily rentals.',
    icon: Car,
    color: 'hsl(285 70% 65%)',
    bg: 'linear-gradient(135deg, hsl(285 70% 65%), hsl(265 80% 60%))',
    shadow: 'rgba(150, 50, 250, 0.4)',
    active: true,
    loginHref: '/cabs/login',
    signupHref: '/cabs/signup'
  },
  {
    id: 'packages',
    name: 'Sightseeing Packages',
    description: 'Create and sell customizable tour itineraries. Manage group bookings and seasonal pricing.',
    icon: Map,
    color: 'hsl(142 70% 45%)',
    bg: 'linear-gradient(135deg, hsl(142 70% 45%), hsl(162 80% 40%))',
    shadow: 'rgba(20, 180, 100, 0.4)',
    active: true,
    loginHref: '/packages/login',
    signupHref: '/packages/signup'
  },
  {
    id: 'buses',
    name: 'Bus Services',
    description: 'Manage bus schedules, routes, and seat-level inventory with our advanced booking engine.',
    icon: Bus,
    color: 'hsl(38 92% 50%)',
    bg: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 90% 45%))',
    shadow: 'rgba(250, 150, 20, 0.4)',
    active: true,
    loginHref: '/buses/login',
    signupHref: '/buses/signup'
  }
];

export default function LandingPage() {
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'login' | 'signup' | null }>({ isOpen: false, type: null });

  const openModal = (type: 'login' | 'signup') => {
    setModalConfig({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[hsl(var(--background))]">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-[var(--sidebar-bg)] backdrop-blur-md border-b border-[var(--glass-border)]">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%), hsl(195 90% 45%))' }}
            >
              <Hotel size={20} color="white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-[hsl(var(--foreground))] leading-tight tracking-tight block">TolidayTrip</span>
              <span className="text-xs font-semibold text-accent uppercase tracking-widest block">Partner Network</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => openModal('login')} className="hidden sm:flex text-sm font-semibold text-[hsl(var(--foreground))] hover:text-accent transition-colors">
              Sign In
            </button>
            <button onClick={() => openModal('signup')} className="btn-primary px-5 py-2.5 text-sm">
              Become a Partner
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] mx-auto px-6 w-full z-10 flex flex-col gap-24 lg:gap-32">
        {/* SECTION 1: Main Hero */}
        <section className="pt-32 pb-4 relative">
          <div className="text-center max-w-3xl mx-auto animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
              <TrendingUp size={14} /> Accelerate Your Business
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[hsl(var(--foreground))] tracking-tight leading-[1.1] mb-6">
              Grow your business with <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, hsl(228 80% 55%), hsl(195 90% 45%))' }}>
                TolidayTrip
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl mx-auto mb-10">
              Join thousands of successful partners. One unified portal to manage your properties, fleets, and tour packages efficiently.
            </p>
            <div className="flex justify-center flex-wrap gap-4">
              <button onClick={() => openModal('signup')} className="btn-primary px-8 py-3.5 text-base">Get Started</button>
              <Link href="#portals" className="px-8 py-3.5 rounded-xl font-bold bg-[var(--table-header)] text-[hsl(var(--foreground))] border border-[var(--glass-border-light)] hover:bg-[var(--table-hover)] transition-all">Explore Portals</Link>
            </div>
          </div>
        </section>

        {/* SECTION 2: Our Portals (Services Grid) */}
        <section className="relative scroll-mt-24" id="portals">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">Choose Your Portal</h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">Access dedicated management dashboards tailored exactly to your specific travel vertical.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {services.map((service) => (
              <div key={service.id} className="relative group h-full">
                <div
                  className={`glass-card h-full flex flex-col p-8 transition-all duration-300 ${service.active ? 'hover:-translate-y-2 hover:border-accent/40 cursor-pointer shadow-xl' : 'opacity-[0.85] grayscale-[20%] cursor-not-allowed'}`}
                  style={{ border: '1px solid var(--glass-border-light)' }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform group-hover:scale-110 duration-300"
                    style={{ background: service.bg, boxShadow: `0 8px 30px ${service.shadow}` }}
                  >
                    <service.icon size={28} color="white" />
                  </div>

                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-3">{service.name}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-8 flex-1">
                    {service.description}
                  </p>

                  <div className="mt-auto pt-5 border-t border-[var(--glass-border)]">
                    {service.active ? (
                      <button onClick={() => openModal('login')} className="flex w-full items-center justify-between text-sm font-bold text-accent group/link text-left">
                        Open Portal <ArrowRight size={18} className="transition-transform group-hover/link:translate-x-1" />
                      </button>
                    ) : (
                      <button onClick={() => openModal('login')} className="flex w-full items-center justify-between text-left cursor-pointer">
                        <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">In Development</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--table-header)] text-[hsl(var(--muted-foreground))] border border-[var(--glass-border)]">
                          Coming Soon
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: About The Extranet */}
        <section className="relative overflow-hidden" id="about">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-6 leading-tight">
                More than just a booking engine. It's your <span className="text-accent underline decoration-accent/30 underline-offset-4">growth engine.</span>
              </h2>
              <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                The Toliday Extranet Portal provides supply partners with state-of-the-art tools to visualize performance, manage dynamic pricing, and oversee staff operations from a single pane of glass.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time inventory synchronization',
                  'Advanced role-based access control for your team',
                  'Automated secure payment settlements',
                  'Deep analytics into booking trends and occupancy'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[hsl(var(--foreground))]">
                    <CheckCircle2 size={20} className="text-accent flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-[hsl(var(--foreground))]/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass-card border border-[var(--glass-border)] p-4 shadow-2xl bg-black/5 dark:bg-white/5">
                {/* Abstract UI Mockup inside the card */}
                <div className="w-full h-full rounded-2xl bg-[var(--background)] border border-[var(--glass-border-light)] overflow-hidden flex flex-col shadow-inner">
                  <div className="h-12 border-b border-[var(--glass-border)] flex items-center px-4 gap-2 bg-[var(--table-header)]">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                    <div className="w-3 h-3 rounded-full bg-green-400/50" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col gap-4">
                    <div className="h-8 w-1/3 bg-[var(--table-header)] rounded-lg animate-pulse" />
                    <div className="flex gap-4">
                      <div className="h-24 flex-1 bg-[hsl(228,80%,55%)]/10 border border-[hsl(228,80%,55%)]/20 rounded-xl flex items-center justify-center">
                        <TrendingUp size={24} className="text-[hsl(228,80%,55%)] opacity-50" />
                      </div>
                      <div className="h-24 flex-1 bg-[var(--table-header)] rounded-xl" />
                      <div className="h-24 flex-1 bg-[var(--table-header)] rounded-xl" />
                    </div>
                    <div className="flex-1 bg-[var(--table-header)] rounded-xl mt-4" />
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl shadow-xl border border-[var(--glass-border-light)] animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><TrendingUp size={20} /></div>
                  <div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Revenue Increase</div>
                    <div className="text-lg font-bold text-[hsl(var(--foreground))]">+42.5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Features / Trust Elements */}
        <section className="text-center pt-8">
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-12">Why Industry Leaders Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, title: 'Millions of Travelers', desc: 'Get your inventory in front of high-intent travelers worldwide directly through the Toliday app.' },
              { icon: ShieldCheck, title: 'Secure & Verified', desc: 'Every booking and transaction is secured. Our KYC system protects both partners and consumers.' },
              { icon: Map, title: 'Multi-Service Hub', desc: 'Expand your business. Manage hotels, cabs, or tour packages without continuously changing platforms.' }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center p-8 rounded-3xl glass-card border border-[var(--glass-border-light)] hover:bg-[var(--table-header)] transition-colors">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="font-bold text-xl text-[hsl(var(--foreground))] mb-3">{feature.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: CTA */}
        <section className="relative overflow-hidden rounded-[2.5rem] mt-8 mb-20 shadow-2xl" style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%), hsl(195 90% 45%))' }}>
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="relative z-10 text-center px-6 py-24">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">Ready to scale your bookings?</h2>
            <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Join the Toliday Partner Network today. Setup takes less than 10 minutes and you only pay a fair commission strictly on successful bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={() => openModal('signup')} className="px-8 py-4 bg-white text-[hsl(228,80%,55%)] hover:bg-white/90 font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Start Onboarding Now
              </button>
              <button onClick={() => openModal('login')} className="px-8 py-4 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl transition-all">
                Sign In to Dashboard
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-10 mt-auto bg-[var(--sidebar-bg)] relative z-20">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-80 cursor-default">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md">
              <Hotel size={16} color="white" />
            </div>
            <span className="font-bold text-[hsl(var(--foreground))] tracking-tight">Toliday Partner Network</span>
          </div>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            &copy; {new Date().getFullYear()} TolidayTrip. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            <span className="cursor-pointer hover:text-accent transition-colors">Supplier Agreement</span>
            <span className="cursor-pointer hover:text-accent transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-accent transition-colors">Help Center</span>
          </div>
        </div>
      </footer>

      {/* Auth Selection Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={closeModal} />
          <div className="glass-card bg-[var(--sidebar-bg)] relative z-10 w-full max-w-3xl p-6 sm:p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--table-header)] text-[hsl(var(--muted-foreground))] transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--foreground))] mb-2">
              {modalConfig.type === 'login' ? 'Sign In to Portal' : 'Register New Enterprise'}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">Select your service vertical to proceed to the {modalConfig.type === 'login' ? 'login' : 'onboarding'} dashboard.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={modalConfig.type === 'login' ? s.loginHref : s.signupHref}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${s.active ? 'border-[var(--glass-border-light)] hover:border-accent hover:bg-[var(--table-header)] hover:shadow-lg cursor-pointer' : 'border-[var(--glass-border)] opacity-[0.85] grayscale-[30%] hover:bg-[var(--table-header)] cursor-pointer'}`}
                  onClick={closeModal}
                >
                  <div className="p-3.5 rounded-xl flex-shrink-0 shadow-md" style={{ background: s.bg }}>
                    <s.icon size={24} color="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[hsl(var(--foreground))] mb-1 text-base flex justify-between items-center">
                      <span>{s.name}</span>
                      {!s.active && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider whitespace-nowrap ml-2">Coming Soon</span>}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">{s.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
