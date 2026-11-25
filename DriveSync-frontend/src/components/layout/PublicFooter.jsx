import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    svg: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    svg: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    svg: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    svg: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
];

export default function PublicFooter() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Subscribed to DriveSync updates!', {
      style: { background: '#0A1F44', color: '#fff' },
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#06132B] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          {/* 1. Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white shadow-sm">
                <img
                  src="/drivesync_logo.png"
                  alt="DriveSync Logo"
                  className="h-8 w-8 object-contain"
                />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Drive
                <span className="bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] bg-clip-text text-transparent">
                  Sync
                </span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs">
              Smart vehicle rental and fleet management designed for seamless journeys.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {SOCIAL_LINKS.map(({ svg, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  onClick={(e) => e.preventDefault()}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-slate-300 transition-all duration-200 hover:border-[#00E5FF]/60 hover:text-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.25)]"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Home', to: '/' },
                { label: 'Vehicles', to: '/vehicles' },
                { label: 'Packages', to: '/packages' },
                { label: 'Contact Us', to: '/contact' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-slate-400 hover:text-[#00E5FF] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Vehicle Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Vehicle Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Luxury Sedans', to: '/vehicles' },
                { label: 'Executive SUVs', to: '/vehicles' },
                { label: 'Hybrid & EV', to: '/vehicles' },
                { label: 'Airport Transfers', to: '/packages' },
              ].map((cat) => (
                <li key={cat.label}>
                  <Link
                    to={cat.to}
                    className="text-slate-400 hover:text-[#00E5FF] transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact & Updates
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#00E5FF] shrink-0" />
                <span>Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#00E5FF] shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#00E5FF] shrink-0" />
                <span>support@drivesync.lk</span>
              </li>
            </ul>

            <form onSubmit={handleSubscribe} className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subscribe for seasonal offers
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-[#00E5FF]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] text-[#0A1F44] shadow-sm hover:scale-105 transition cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; 2026 DriveSync. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#00E5FF] transition">
              Privacy Policy
            </a>
            <span>&bull;</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#00E5FF] transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
