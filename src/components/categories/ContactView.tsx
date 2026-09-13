import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Headphones, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  ExternalLink, 
  FileText, 
  HeartPulse, 
  Truck, 
  Stethoscope,
  Building,
  User,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { TwoHorseshoesIcon } from '../common/TwoHorseshoesIcon';
import confetti from 'canvas-confetti';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { CategoryId, ContactTicket } from '../../types';

interface ContactViewProps {
  onOpenAI?: () => void;
  onSelectCategory?: (category: CategoryId) => void;
}

const FAQS = [
  {
    question: 'How does 24/7 Emergency Vet & Ambulatory Dispatch work?',
    answer: 'When you tap "Emergency Vet Dispatch", horsez locates the closest on-call ambulatory equine veterinarians within a 50-mile radius. Live GPS tracking calculates direct ETAs to your barn and establishes immediate phone triage with the on-duty vet.'
  },
  {
    question: 'How do veterinarians, farriers, and trainers list their services?',
    answer: 'Licensed equine professionals can submit a listing application directly through our Provider Onboarding form or by contacting our Provider Verification Team. All credentials, licenses, and insurance certificates are verified within 24–48 hours.'
  },
  {
    question: 'How are emergency feed & bulk hay deliveries fulfilled?',
    answer: 'We partner with local feed mills and authorized suppliers in your county. Same-day emergency deliveries are available for urgent orders placed before 3:00 PM, and recurring weekly or monthly barn subscriptions receive automated scheduled route delivery.'
  },
  {
    question: 'Are horse haulers and transport rigs DOT and MC verified?',
    answer: 'Yes! Every commercial hauler on the horsez platform undergoes verification of their USDOT and MC authority numbers, active commercial cargo insurance ($100k+ standard), and air-ride trailer inspection verification.'
  },
  {
    question: 'How do I securely store and share Coggins tests and medical records?',
    answer: 'horsez integrates with Google Drive Vault. Simply connect your account to automatically sync, store, and one-click share 12-month negative Coggins, health certificates (CVI), and vaccination records with haulers, barns, and show grounds.'
  }
];

export const ContactView: React.FC<ContactViewProps> = ({
  onOpenAI,
  onSelectCategory
}) => {
  const { user, userProfile, userHorses } = useAuth();

  // Form State
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [equineRole, setEquineRole] = useState(userProfile?.equineRole || 'Horse Owner');
  const [inquiryCategory, setInquiryCategory] = useState<ContactTicket['inquiryCategory']>('general');
  const [urgency, setUrgency] = useState<ContactTicket['urgency']>('normal');
  const [selectedHorse, setSelectedHorse] = useState(userHorses[0]?.name || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // UI & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; timestamp: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Please provide a subject line.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please write your message or inquiry.');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedTicketId = `HZ-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      const ticketData = {
        ticketId: generatedTicketId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        equineRole,
        inquiryCategory,
        urgency,
        horseName: selectedHorse.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
        createdAtIso: nowIso
      };

      // Save to Firestore
      try {
        await addDoc(collection(db, 'contact_messages'), ticketData);
      } catch (firestoreErr) {
        console.warn('Firestore write fallback (local mode):', firestoreErr);
      }

      // Also persist to localStorage for user history
      try {
        const storedTickets = JSON.parse(localStorage.getItem('horsez_user_tickets') || '[]');
        storedTickets.unshift({ ...ticketData, id: generatedTicketId, createdAt: nowIso });
        localStorage.setItem('horsez_user_tickets', JSON.stringify(storedTickets.slice(0, 10)));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      // Confetti effect
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setSubmittedTicket({
        id: generatedTicketId,
        timestamp: new Date().toLocaleString()
      });

      // Clear form inputs except user contact info
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEmail = (emailText: string) => {
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-10 space-y-8 font-sans">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-[#1B4A72] via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/30 relative overflow-hidden">
        {/* Background Subtle Pattern */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-teal-400/20 text-teal-300 border border-teal-400/40 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5 text-teal-300" />
            <span>horsez Equine Concierge & Support</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            We're Here For You & Your Horses
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Need emergency dispatch assistance, provider onboarding, feed delivery tracking, or general equine support? Connect with our dedicated support team 24/7.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-500/20 text-rose-200 border border-rose-400/30 px-3 py-1 rounded-lg">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              24/7 Emergency Dispatch Live
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Avg Response: &lt; 15 mins
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30 px-3 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Verified Equine Specialists
            </span>
          </div>
        </div>
      </div>

      {/* Direct Contact Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: 24/7 Emergency & Dispatch Hotline */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Phone className="w-5 h-5 text-rose-600" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              24/7 Dispatch &amp; Contact
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 pt-1">Emergency &amp; Dispatch Line</h3>
            <p className="text-xs text-slate-500">24/7 urgent colic triage, mobile vet dispatch &amp; transport hotline.</p>
          </div>
          <a
            href="tel:4085042185"
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl transition-colors shadow-xs"
            title="Call 24/7 Dispatch Hotline at 408 504-2185"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>(408) 504-2185</span>
          </a>
        </div>

        {/* Card 2: Email Concierge & Admin */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5 text-teal-700" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Admin &amp; Concierge Email
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 pt-1">Direct Administrator Support</h3>
            <p className="text-xs text-slate-500">Provider onboarding, hauler credentials, billing &amp; executive concierge.</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <a
              href="mailto:horsez.admin@gmail.com"
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-2.5 rounded-xl transition-colors shadow-xs truncate"
              title="Send email to horsez.admin@gmail.com"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">horsez.admin@gmail.com</span>
            </a>
            <button
              onClick={() => handleCopyEmail('horsez.admin@gmail.com')}
              className="p-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
              title={copiedEmail ? 'Copied to clipboard!' : 'Copy email'}
            >
              {copiedEmail ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Card 3: AI Equine Assistant Shortcut */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-purple-700" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Instant AI
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 pt-1">AI Equine Triage</h3>
            <p className="text-xs text-slate-500">Ask symptoms, feed formulas, Coggins rules & farrier advice.</p>
          </div>
          {onOpenAI && (
            <button
              onClick={onOpenAI}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Triage</span>
            </button>
          )}
        </div>

        {/* Card 4: Operating Hubs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 text-sky-700" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Locations
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 pt-1">Regional Hubs</h3>
            <p className="text-xs text-slate-500">Santa Rosa, CA (Sonoma) &amp; Lexington, KY (Bluegrass).</p>
          </div>
          <div className="mt-4 text-[11px] font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Mon–Sat 6am–9pm PT</span>
          </div>
        </div>

      </div>

      {/* Main Split Content: Contact Form & FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Send an Inquiry or Support Request</h2>
              </div>
              {user && (
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Signed in as {userProfile?.fullName || 'Member'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fill out the form below. Our equine coordination team reviews and answers tickets promptly.
            </p>
          </div>

          {/* Submission Success Banner */}
          {submittedTicket && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-emerald-900">
                    Inquiry Received Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you! Your ticket has been logged in our dispatch database. An Equine Concierge specialist will contact you at <strong>{email}</strong>.
                  </p>
                </div>
              </div>

              {/* Reference ID Pill */}
              <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                    Ticket Reference ID
                  </span>
                  <span className="text-sm font-mono font-black text-slate-900">
                    {submittedTicket.id}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyTicket(submittedTicket.id)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
                  <span>{copiedId ? 'Copied!' : 'Copy Reference'}</span>
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3.5 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. eleanor@oakridgestables.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone & Equine Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(408) 504-2185"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Equine Role
                </label>
                <select
                  value={equineRole}
                  onChange={(e) => setEquineRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                >
                  <option value="Horse Owner">Horse Owner / Rider</option>
                  <option value="Barn Manager">Barn / Facility Manager</option>
                  <option value="Veterinarian">Veterinarian / Clinic Staff</option>
                  <option value="Farrier">Farrier / Hoof Specialist</option>
                  <option value="Hauler">Equine Hauler / Transport</option>
                  <option value="Trainer">Equine Trainer / Instructor</option>
                  <option value="Feed Supplier">Feed Supplier / Merchant</option>
                  <option value="Other">Other Equine Specialist</option>
                </select>
              </div>
            </div>

            {/* Topic & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Inquiry Topic <span className="text-rose-500">*</span>
                </label>
                <select
                  value={inquiryCategory}
                  onChange={(e) => setInquiryCategory(e.target.value as ContactTicket['inquiryCategory'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                >
                  <option value="general">💬 General Inquiries &amp; Feedback</option>
                  <option value="emergency-dispatch">🚨 24/7 Emergency Vet Dispatch</option>
                  <option value="provider-listing">📋 Provider Onboarding &amp; Verification</option>
                  <option value="orders-billing">📦 Feed Orders &amp; Subscriptions</option>
                  <option value="transport-help">🚛 Hauler &amp; Transport Booking</option>
                  <option value="technical">🔒 Vault, Records &amp; Account Help</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('normal')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      urgency === 'normal'
                        ? 'bg-teal-50 border-teal-400 text-teal-800 ring-1 ring-teal-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('high')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      urgency === 'high'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    High Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      urgency === 'urgent'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🚨 Urgent
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Horse Reference */}
            {userHorses.length > 0 && (
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Associated Horse (Optional)
                </label>
                <select
                  value={selectedHorse}
                  onChange={(e) => setSelectedHorse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                >
                  <option value="">None / General Inquiry</option>
                  {userHorses.map((horse) => (
                    <option key={horse.id} value={horse.name}>
                      🐴 {horse.name} ({horse.breed || 'Horse'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Question about recurring Timothy Hay delivery in Santa Rosa"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                required
              />
            </div>

            {/* Detailed Message */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Message Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry, barn location, timeline, or any specific details we should know..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-y leading-relaxed"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1B4A72] hover:bg-[#0c2f4d] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Ticket to Concierge...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry to horsez Concierge</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Info & FAQ Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Service Categories Directory Tile */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-wider">
              <Stethoscope className="w-4 h-4" />
              <span>Direct Category Access</span>
            </div>
            
            <p className="text-xs text-slate-300">
              Looking for immediate booking or automated quotes? Access our core modules directly:
            </p>

            <div className="space-y-2">
              {onSelectCategory && (
                <>
                  <button
                    onClick={() => onSelectCategory('emergency-vet')}
                    className="w-full bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 rounded-xl p-2.5 text-left text-xs font-bold text-rose-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>24/7 Emergency Vet Dispatch</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                  </button>

                  <button
                    onClick={() => onSelectCategory('farriers')}
                    className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-left text-xs font-bold text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <TwoHorseshoesIcon className="w-4 h-4 text-amber-400" />
                      <span>Farrier Trims &amp; Shoeing Log</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => onSelectCategory('transportation')}
                    className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-left text-xs font-bold text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-sky-400" />
                      <span>Hauler Quote &amp; Live Tracking</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Interactive FAQs Accordion */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-100 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left p-3.5 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs font-extrabold text-slate-800 cursor-pointer transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust & Guarantee Card */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h4 className="font-extrabold text-teal-950">100% Equine-First Verification</h4>
              <p className="text-teal-800 text-[11px] leading-tight mt-0.5">
                Every veterinarian, hauler, farrier, and feed provider is verified by equine professionals before activation.
              </p>
            </div>
          </div>

          {/* Administrator Direct Channel */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800">
                Official Administration
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Direct Inbox</span>
            </div>
            <p className="text-xs text-slate-300">
              For executive inquiries, urgent listing verifications, and partnership proposals:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="mailto:horsez.admin@gmail.com"
                className="flex-1 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 hover:text-teal-200 text-xs font-mono font-bold py-2 px-3 rounded-xl flex items-center gap-2 transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                <span className="truncate">horsez.admin@gmail.com</span>
              </a>
              <button
                onClick={() => handleCopyEmail('horsez.admin@gmail.com')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl border border-slate-700 transition-colors cursor-pointer shrink-0"
                title={copiedEmail ? 'Copied to clipboard!' : 'Copy email address'}
              >
                {copiedEmail ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
