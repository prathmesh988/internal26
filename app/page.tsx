'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Clock } from 'lucide-react';

// --- Interactive Navigation Components ---
function InteractiveCTA({ href, text, primary = false }: { href: string, text: string, primary?: boolean }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    setTimeout(() => {
      router.push(href);
    }, 400); // 400ms visual delay for the animation
  };

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto cursor-pointer ${
        primary ? 'bg-[#ff5c35] text-white shadow-lg hover:bg-[#e04a2a]' : 'bg-white text-[#1a1a1a] border border-[#f3e8e4] hover:bg-gray-50 shadow-sm'
      }`}
    >
      <motion.span 
        animate={isNavigating ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex items-center gap-2"
      >
        {text} {primary && <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>}
      </motion.span>
      
      {isNavigating && (
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${primary ? 'border-white' : 'border-[#1a1a1a]'}`} />
        </motion.div>
      )}
    </motion.a>
  );
}

function NavCTA({ href, text, primary = false, className = '' }: { href: string, text: string, primary?: boolean, className?: string }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    setTimeout(() => {
      router.push(href);
    }, 400);
  };

  if (primary) {
    return (
      <motion.a
        href={href}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative overflow-hidden bg-[#ff5c35] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#e04a2a] transition-all shadow-sm flex justify-center items-center cursor-pointer ${className}`}
      >
        <motion.div animate={isNavigating ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          {text}
        </motion.div>
        {isNavigating && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center justify-center">
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.a>
    );
  }

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden text-[#666666] px-2 font-semibold text-sm hover:text-[#1a1a1a] transition-all flex justify-center items-center cursor-pointer ${className}`}
    >
      <motion.div animate={isNavigating ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        {text}
      </motion.div>
      {isNavigating && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center justify-center">
           <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.a>
  );
}

// --- Scroll Reveal Component ---
function ScrollReveal({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Accordion Component ---
function AccordionItem({ question, answer, isOpenInitial = false }: { question: string, answer: string, isOpenInitial?: boolean }) {
  const [isOpen, setIsOpen] = useState(isOpenInitial);

  return (
    <div className={`border border-[#f3e8e4] rounded-2xl p-6 transition-colors ${isOpen ? 'bg-[#fef5f2]/30' : ''}`}>
      <button 
        className="flex justify-between items-center w-full text-left font-bold"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span className={`transition-transform text-2xl text-[#ff5c35] ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="text-sm text-[#666666]">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="text-[#1a1a1a] bg-white min-h-screen font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        .hero-gradient { background: linear-gradient(180deg, #fef5f2 0%, #ffffff 100%); }
        .testimonial-gradient { background: linear-gradient(135deg, #ff6b4a 0%, #ff3d77 100%); }
      `}} />

      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ff5c35] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <span className="font-bold text-xl tracking-tight">WasteFlow</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-[#666666]">
          <Link href="#features" className="hover:text-[#1a1a1a]">Features</Link>
          <Link href="#how-it-works" className="hover:text-[#1a1a1a]">How It Works</Link>
        </div>
        <div className="flex gap-4 items-center">
          <NavCTA href="/citizen/dashboard" text="Citizen Portal" className="hidden sm:block" />
          <NavCTA href="/admin/dashboard" text="Admin Console" primary />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient pt-16 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Automating Sanitation for <span className="bg-red-100 px-2 rounded">Cleaner, Smarter Cities</span>
          </h1>
          <p className="text-[#666666] text-lg md:text-xl max-w-2xl mx-auto">
            Every missed pickup, every overflowing bin, every illegal dump site — reported, assigned, and resolved. <span className="font-semibold">WasteFlow</span> gives citizens a voice and gives cities the tools to act.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <InteractiveCTA href="/citizen/dashboard" text="File a Complaint" primary />
            <InteractiveCTA href="/admin/dashboard" text="See the City in Action" />
          </div>
        </div>

        {/* Hero Graphic Placeholder */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#f3e8e4] p-4 md:p-12">
            <img src="/hero-image.jpeg" alt="City View" className="w-full rounded-xl opacity-80 mix-blend-multiply object-cover h-[300px] md:h-[500px]" />
            <div className="absolute inset-0 flex items-start justify-center pointer-events-none pt-8 md:pt-14">
               <motion.div 
                 animate={{ y: [0, -8, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl p-5 border border-white/50 max-w-sm w-full pointer-events-auto"
               >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1a1a] text-sm leading-none mb-1">Issue Resolved</h4>
                        <span className="text-[#666666] text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Just now
                        </span>
                      </div>
                    </div>
                    <span className="bg-[#fef5f2] text-[#ff5c35] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                      Report #4092
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3 mb-1 border border-gray-100">
                    <p className="text-[#1a1a1a] font-medium text-sm flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-[#666666]" /> 
                      Shivaji Nagar, Sector 4
                    </p>
                    <p className="text-[#666666] text-xs pl-5">
                      Overflowing bin cleared and area sanitized.
                    </p>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[#666666] text-sm font-medium mb-10">Trusted by citizens and administrators</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-80">
            <div className="font-bold text-xl flex flex-col items-center"><span className="text-3xl text-[#1a1a1a]">94.8%</span><span className="text-xs text-[#666666] uppercase tracking-wider mt-1">Collection Efficiency</span></div>
            <div className="font-bold text-xl flex flex-col items-center"><span className="text-3xl text-[#1a1a1a]">12,480+</span><span className="text-xs text-[#666666] uppercase tracking-wider mt-1">Issues Resolved</span></div>
            <div className="font-bold text-xl flex flex-col items-center"><span className="text-3xl text-[#1a1a1a]">24</span><span className="text-xs text-[#666666] uppercase tracking-wider mt-1">Vehicles On Road Today</span></div>
            <div className="font-bold text-xl flex flex-col items-center"><span className="text-3xl text-[#1a1a1a]">150,000+</span><span className="text-xs text-[#666666] uppercase tracking-wider mt-1">Reward Points Earned</span></div>
            <div className="font-bold text-xl flex flex-col items-center"><span className="text-3xl text-[#1a1a1a]">6</span><span className="text-xs text-[#666666] uppercase tracking-wider mt-1">Wards Covered</span></div>
          </div>
        </div>
      </section>

      {/* Workflows Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Sanitation workflows embedded where work happens</h2>
          <p className="text-[#666666]">Let WasteFlow handle your city's manual reporting and assigning workflows.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Card - For Citizens */}
          <ScrollReveal className="space-y-6">
            <h3 className="text-2xl font-bold">For Citizens: A Cleaner Ward Starts with You</h3>
            <p className="text-[#666666]">Spotted a problem? Report it in under a minute. Take a photo, describe what you see, and submit — we'll handle the rest. You'll get updates as your complaint moves forward, and points every time you participate.</p>
            <div className="bg-[#fef5f2] rounded-3xl p-8 aspect-video flex flex-col justify-center items-center border border-orange-50">
                <div className="flex gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">📸</div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">📍</div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">⭐</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-xs border border-orange-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#ff5c35] rounded-full"></div>
                        <span className="text-xs font-bold">WasteFlow is assigning worker...</span>
                    </div>
                </div>
            </div>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> File a complaint in seconds
                </li>
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> Watch it get resolved in real time
                </li>
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> Earn points for reporting and surveys
                </li>
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> Check your ward's cleanliness score
                </li>
            </ul>
          </ScrollReveal>

          {/* Right Card - For Admins */}
          <ScrollReveal className="space-y-6">
            <h3 className="text-2xl font-bold">For Admins: Everything You Need</h3>
            <p className="text-[#666666]">One place to see every vehicle, every team, every open complaint. Spot problems early, manage your workforce, and keep the city on schedule.</p>
            <div className="bg-[#fef5f2] rounded-3xl p-8 aspect-video flex flex-col justify-center items-center border border-orange-50">
                <div className="flex gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">🗺️</div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">🚛</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-xs border border-orange-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#ff5c35] rounded-full"></div>
                        <span className="text-xs font-bold">Tracking 24 active vehicles...</span>
                    </div>
                </div>
            </div>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> See where every truck is, right now
                </li>
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> Know which routes are on time and which aren't
                </li>
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> Manage worker assignments and performance
                </li>
                <li className="flex items-center gap-3 text-sm text-[#666666]">
                    <span className="text-green-500">●</span> Review and act on every open complaint
                </li>
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* Ward Leaderboard Section */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto testimonial-gradient rounded-[40px] p-12 md:p-20 text-white text-center">
            <h3 className="text-2xl md:text-4xl font-bold leading-snug mb-6">
              Which Ward is Winning?
            </h3>
            <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
              Cleanliness is scored every day. See how your neighbourhood compares.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto mb-10">
               <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm shadow-sm"><span className="font-bold text-xl block">1. Kothrud</span> <span className="text-white/80 text-sm">98/100</span></div>
               <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm shadow-sm"><span className="font-bold text-xl block">2. Shivaji Nagar</span> <span className="text-white/80 text-sm">94/100</span></div>
               <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm shadow-sm"><span className="font-bold text-xl block">3. Aundh</span> <span className="text-white/80 text-sm">89/100</span></div>
               <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-lg block">4. Viman Nagar</span> <span className="text-white/70 text-sm">85/100</span></div>
               <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-lg block">5. Katraj</span> <span className="text-white/70 text-sm">81/100</span></div>
               <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-lg block">6. Hadapsar</span> <span className="text-white/70 text-sm">76/100</span></div>
            </div>
            <button className="bg-white text-[#ff5c35] px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm">
              View Full City Report
            </button>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-24 px-6 bg-[#fef5f2] mt-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20">
          <div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl mb-6">📋</div>
            <h2 className="text-3xl font-extrabold mb-6">A Clean City Needs Accountability</h2>
            <p className="text-[#666666]">When rules aren't followed — improper waste disposal, bin overflows, or illegal dumping — violations are recorded, fines are issued, and the case is documented. Nothing is missed. Everything is on record.</p>
          </div>
          <div className="space-y-10">
            <div>
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <span className="text-red-500">⚡</span> Fast Action
              </h4>
              <p className="text-sm text-[#666666] leading-relaxed">Violations actioned within 48 hours to ensure our streets stay clean and rules are upheld consistently.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Automated Enforcement</h4>
              <p className="text-sm text-[#666666] leading-relaxed">Fines are issued and tracked automatically. Every case is backed by solid photo evidence collected by citizens and workers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (FAQ Style) */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h2 className="text-3xl font-extrabold mb-4">How It Works</h2>
            <p className="text-[#666666] text-sm">Complaints Don't Wait. Neither Do We. From report to resolution — without anyone having to chase it.</p>
            <Link href="/citizen/dashboard" className="text-[#ff5c35] font-bold text-sm inline-block mt-6">File a complaint ↗</Link>
          </div>
          <div className="md:col-span-2 space-y-4">
            <AccordionItem 
              isOpenInitial={true}
              question="1. A citizen spots a problem" 
              answer="A citizen notices an issue like an overflowing bin or illegal dumping and files a report through the WasteFlow citizen portal."
            />
            <AccordionItem 
              question="2. The system reads and categorises" 
              answer="Our system instantly processes the report, assigns it to the correct category, and flags the priority based on severity."
            />
            <AccordionItem 
              question="3. Automatic assignment" 
              answer="The closest available worker or vehicle is assigned to the task automatically, optimizing travel time and efficiency."
            />
            <AccordionItem 
              question="4. Notifications sent" 
              answer="The worker is notified of their new task with exact coordinates, and the citizen receives an update that help is on the way."
            />
            <AccordionItem 
              question="5. Resolution and closing" 
              answer="Once the worker resolves the issue and uploads photo proof, the record is closed, saved, and the citizen earns reward points."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-[#fef5f2] mb-12 mx-6 rounded-[40px] text-center">
        <h2 className="text-3xl font-extrabold mb-4">Ready to make a difference?</h2>
        <p className="text-[#666666] mb-8">Join thousands of citizens and administrators keeping the city clean.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <InteractiveCTA href="/citizen/dashboard" text="Citizen Portal" primary />
          <InteractiveCTA href="/admin/dashboard" text="Admin Console" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#ff5c35] py-20 px-6 text-white/90">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">WasteFlow</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              <Link href="#" className="hover:text-white">About</Link>
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Contact Support</Link>
              <Link href="/citizen/dashboard" className="hover:text-white">Citizen Portal</Link>
              <Link href="/admin/dashboard" className="hover:text-white">Admin Console</Link>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/20 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
            <p>WasteFlow — Building cleaner, smarter neighbourhoods.</p>
            <p>© 2026 WasteFlow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
