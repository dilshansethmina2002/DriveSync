import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowRight, Calendar, Car, MapPin, Search, Sparkles } from 'lucide-react';

const FEATURED_FLEET = {
  Sedan: {
    name: 'Mercedes-Benz S-Class',
    price: 'LKR 14,500',
    specs: 'Auto • 5 Seats • Hybrid',
    image:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85',
  },
  SUV: {
    name: 'Range Rover Velar',
    price: 'LKR 22,000',
    specs: 'Auto • 5 Seats • AWD',
    image:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=85',
  },
  Luxury: {
    name: 'Porsche Panamera',
    price: 'LKR 35,000',
    specs: 'Auto • 4 Seats • Sport',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
  },
};

const TABS = ['Sedan', 'SUV', 'Luxury'];

export default function HeroSection({ onQuickSearch }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Sedan');
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const activeCar = FEATURED_FLEET[activeTab];

  const handleSearch = (e) => {
    e.preventDefault();

    if (!pickupDate || !returnDate) {
      toast.error('Please select both Pick-up Date and Return Date.');
      return;
    }

    if (new Date(pickupDate) >= new Date(returnDate)) {
      toast.error('Return Date must be after Pick-up Date.');
      return;
    }

    const searchFilters = {
      location,
      pickupDate,
      returnDate,
      category: vehicleType,
    };

    if (onQuickSearch) {
      onQuickSearch(searchFilters);
      document.getElementById('vehicles')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/vehicles', { state: { searchFilters } });
    }
  };

  return (
    <div className="bg-ds-surface pb-6">
      {/* Full-Width Dark Luxury Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#040B1A] via-[#06132B] to-[#0A1F44]">
        {/* Faint Geometric Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 229, 255, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.35) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />

        {/* Ambient Radial Cyan Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00E5FF]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-[#00E5FF]/20 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-16 lg:pb-28">
          {/* Left Side: Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Glass Pill Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span>#1 Smart Fleet Platform</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-white leading-[1.1]">
              Elevate Every
              <span className="block bg-gradient-to-r from-[#00E5FF] to-[#38BDF8] bg-clip-text text-transparent">
                Mile You Drive.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-lg text-sm sm:text-base text-slate-300 leading-relaxed">
              Instant booking, transparent daily rates, and a curated fleet of luxury, SUV, and hybrid vehicles—ready when you are.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => navigate('/vehicles')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-7 py-3.5 text-sm font-bold text-[#0A1F44] shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                Browse Fleet
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/packages')}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20 cursor-pointer"
              >
                View Packages
              </button>
            </div>
          </motion.div>

          {/* Right Side: Interactive Car Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-end space-y-5">
            {/* 3-Tab Pill Switcher */}
            <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-xl border border-white/15 p-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative rounded-full px-5 py-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      isActive ? 'text-[#0A1F44]' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="hero-car-tab"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-white shadow-sm -z-10"
                      />
                    )}
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Animated Car Image + Floating Glassmorphic Spec Card */}
            <div className="relative w-full max-w-lg">
              {/* Cyan Floor Glow */}
              <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 h-8 w-4/5 rounded-full bg-[#00E5FF]/35 blur-xl" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 24, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#06132B]/50 shadow-2xl">
                    <img
                      src={activeCar.image}
                      alt={activeCar.name}
                      className="h-56 sm:h-72 w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06132B]/65 via-transparent to-transparent" />
                  </div>

                  {/* Floating Glassmorphic Spec Card */}
                  <div className="mt-3 sm:mt-0 sm:absolute sm:bottom-4 sm:right-4 rounded-2xl bg-[#0A1F44]/75 backdrop-blur-xl border border-white/20 p-4 text-white shadow-2xl min-w-[215px]">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      Available Today
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-300">{activeCar.name}</p>
                    <p className="mt-0.5 text-lg font-extrabold tracking-tight text-white">
                      {activeCar.price}{' '}
                      <span className="text-xs font-normal text-slate-300">/ day</span>
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium text-[#00E5FF]">{activeCar.specs}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Search Dock (Overlapping Bottom Edge) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className="max-w-6xl mx-auto -mt-12 relative z-20 px-4 sm:px-6"
      >
        <form
          onSubmit={handleSearch}
          className="bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_24px_60px_rgba(6,19,43,0.18)] border border-slate-200/80 ring-1 ring-white p-2.5 sm:p-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-center">
            {/* 1. Location */}
            <div className="lg:col-span-3 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 hover:bg-slate-50 focus-within:bg-[#F0F9FF] focus-within:ring-2 focus-within:ring-[#00B4D8]/30 transition-all">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00E5FF]/12 text-[#00B4D8]">
                <MapPin className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-sm font-bold text-[#0A1F44] outline-none cursor-pointer"
                >
                  <option value="">All Locations</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Airport">BIA Airport</option>
                </select>
              </div>
            </div>

            {/* 2. Pick-up Date */}
            <div className="lg:col-span-2 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 hover:bg-slate-50 focus-within:bg-[#F0F9FF] focus-within:ring-2 focus-within:ring-[#00B4D8]/30 transition-all">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00E5FF]/12 text-[#00B4D8]">
                <Calendar className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pick-up Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-xs sm:text-sm font-bold text-[#0A1F44] outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Return Date */}
            <div className="lg:col-span-2 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 hover:bg-slate-50 focus-within:bg-[#F0F9FF] focus-within:ring-2 focus-within:ring-[#00B4D8]/30 transition-all">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00E5FF]/12 text-[#00B4D8]">
                <Calendar className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-xs sm:text-sm font-bold text-[#0A1F44] outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* 4. Vehicle Type */}
            <div className="lg:col-span-3 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 hover:bg-slate-50 focus-within:bg-[#F0F9FF] focus-within:ring-2 focus-within:ring-[#00B4D8]/30 transition-all">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00E5FF]/12 text-[#00B4D8]">
                <Car className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-sm font-bold text-[#0A1F44] outline-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            {/* 5. Search Button */}
            <div className="sm:col-span-2 lg:col-span-2">
              <button
                type="submit"
                className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0A1F44] to-[#0D2B5E] px-5 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[#00B4D8] hover:to-[#00E5FF] hover:text-[#0A1F44] hover:shadow-[0_10px_28px_rgba(0,180,216,0.35)] cursor-pointer"
              >
                <Search className="h-4 w-4 text-[#00E5FF] group-hover:text-[#0A1F44] transition-colors" />
                Search
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
