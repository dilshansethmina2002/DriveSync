import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Clock,
  Headphones,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react';

const CONTACT_CARDS = [
  {
    title: 'Call Us 24/7',
    primary: '+94 11 234 5678',
    secondary: '+94 77 890 1234 (Hotline)',
    icon: Phone,
  },
  {
    title: 'Email Support',
    primary: 'support@drivesync.lk',
    secondary: 'corporate@drivesync.lk',
    icon: Mail,
  },
  {
    title: 'Headquarters',
    primary: 'No. 45, Galle Road',
    secondary: 'Colombo 03, Sri Lanka',
    icon: MapPin,
  },
];

const PICKUP_HUBS = [
  { name: 'Colombo Flagship Hub', hours: '06:00 AM – 11:00 PM' },
  { name: 'BIA Katunayake Airport Desk', hours: 'Open 24 / 7' },
  { name: 'Kandy City Center', hours: '07:00 AM – 09:00 PM' },
  { name: 'Galle Fort Hub', hours: '07:00 AM – 09:00 PM' },
];

const FAQS = [
  {
    q: 'Do I need an account to browse vehicles?',
    a: 'No! Anyone can explore vehicles, compare LKR rates, and view packages without logging in. You only sign in when confirming a reservation.',
  },
  {
    q: 'Is insurance included in every rental?',
    a: 'Yes, every DriveSync vehicle comes with comprehensive insurance and 24/7 roadside assistance.',
  },
  {
    q: 'Can I cancel a pending booking?',
    a: 'Yes, you can cancel any Pending reservation for free directly from your My Bookings dashboard.',
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'General Inquiry',
    message: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent! Our DriveSync concierge team will reply shortly.', {
        style: { background: '#0A1F44', color: '#fff' },
      });
      setForm({
        name: '',
        email: '',
        phone: '',
        topic: 'General Inquiry',
        message: '',
      });
      setSending(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* 1. Dark Navy Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 rounded-[2rem] bg-gradient-to-br from-[#06132B] via-[#0A1F44] to-[#0D2B5E] p-8 sm:p-12 pb-16 text-white relative overflow-hidden shadow-xl"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0, 229, 255, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.35) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#00E5FF]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#00E5FF]">
                <Headphones className="h-3.5 w-3.5" />
                24/7 CONCIERGE &amp; SUPPORT
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Get in Touch With DriveSync
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                Questions about a reservation, corporate fleet package, or roadside assistance? Our team is ready 24/7.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 self-start lg:self-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 px-5 py-3.5 text-xs sm:text-sm font-bold shadow-lg">
              <span className="inline-flex items-center gap-2 text-emerald-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                Support Online
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="text-[#00E5FF]">Avg. reply &lt; 15 mins</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Overlapping Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 -mt-10 relative z-20 mx-2 sm:mx-6"
        >
          {CONTACT_CARDS.map(({ title, primary, secondary, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl bg-white border border-slate-100 p-5 shadow-[0_15px_35px_rgba(10,31,68,0.08)] flex items-center gap-4 hover:-translate-y-1 hover:border-[#00B4D8]/40 transition-all duration-300"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#00E5FF]/12 text-[#00B4D8]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
                <p className="text-sm font-extrabold text-[#0A1F44] mt-0.5">{primary}</p>
                <p className="text-xs text-slate-500">{secondary}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 3. Main 2-Column Grid: Pickup Hubs + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Left Column: Dark Navy Hubs & Roadside Card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#06132B] via-[#0A1F44] to-[#0D2B5E] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between gap-8"
          >
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[#00E5FF]/15 blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Pickup Hubs &amp; Hours</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
                  Collect or return your vehicle at any of our island-wide service hubs.
                </p>
              </div>

              <div className="space-y-3">
                {PICKUP_HUBS.map((hub) => (
                  <div
                    key={hub.name}
                    className="flex items-center justify-between rounded-2xl bg-white/8 border border-white/10 px-4 py-3 text-xs sm:text-sm"
                  >
                    <span className="font-bold text-white">{hub.name}</span>
                    <span className="inline-flex items-center gap-1.5 text-[#00E5FF] font-semibold text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {hub.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/25 p-4 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#00E5FF] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">24/7 Emergency Roadside Assistance</p>
                <p className="text-slate-300 mt-0.5">
                  Already on a trip and need immediate help? Call our priority dispatch line at{' '}
                  <strong className="text-[#00E5FF]">+94 77 890 1234</strong>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Message Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 rounded-3xl bg-white p-8 border border-slate-100 shadow-[0_15px_40px_rgba(10,31,68,0.06)]"
          >
            <h2 className="text-2xl font-extrabold text-[#0A1F44]">Send Us a Message</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 mb-6">
              Fill out the form below and our customer care team will respond promptly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#0A1F44]">Your Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Kasun Silva"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-sm font-medium text-[#0A1F44] outline-none transition focus:bg-white focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#0A1F44]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="kasun@example.com"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-sm font-medium text-[#0A1F44] outline-none transition focus:bg-white focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#0A1F44]">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-sm font-medium text-[#0A1F44] outline-none transition focus:bg-white focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#0A1F44]">Inquiry Topic</label>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-sm font-semibold text-[#0A1F44] outline-none transition focus:bg-white focus:border-[#00B4D8] cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Booking & Reservations">Booking &amp; Reservations</option>
                    <option value="Corporate / Packages">Corporate / Packages</option>
                    <option value="Roadside Support">Roadside Support</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0A1F44]">Message</label>
                <textarea
                  rows="4"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your trip dates, preferred vehicle, or question..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-sm font-medium text-[#0A1F44] outline-none transition focus:bg-white focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0A1F44] to-[#0D2B5E] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:from-[#00B4D8] hover:to-[#00E5FF] hover:text-[#0A1F44] hover:shadow-[0_8px_24px_rgba(0,180,216,0.35)] cursor-pointer disabled:opacity-60"
                >
                  <Send className="h-4 w-4 text-[#00E5FF] group-hover:text-[#0A1F44] transition-colors" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* 4. Quick FAQ Strip */}
        <div className="mt-14">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="h-5 w-5 text-[#00B4D8]" />
            <h3 className="text-lg font-extrabold text-[#0A1F44]">Frequently Asked Questions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl bg-white border border-slate-100 p-6 shadow-xs"
              >
                <h4 className="text-sm font-extrabold text-[#0A1F44]">{item.q}</h4>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
