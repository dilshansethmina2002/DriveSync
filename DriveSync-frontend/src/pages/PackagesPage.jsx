import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Car,
  CheckCircle2,
  Headphones,
  Heart,
  Package,
  Plane,
  Sparkles,
  Sun,
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { getUser, isSessionExpired } from '../utils/auth';

const CURATED_PACKAGES = [
  {
    _id: 'pkg-weekend',
    name: 'Weekend Getaway',
    category: 'Weekend',
    tag: 'Self-Drive',
    price: 29500,
    unit: '/ 2 days',
    discountPercent: 15,
    includedMileage: '400 km included',
    description: 'Perfect for quick coastal or hill-country escapes from Friday evening to Sunday night.',
    featured: false,
    icon: Sun,
    perks: [
      '400 km mileage included',
      'Choice of Sedan or Compact SUV',
      'Full comprehensive insurance',
      '24/7 roadside assistance',
    ],
  },
  {
    _id: 'pkg-weekly',
    name: 'Executive Weekly',
    category: 'Weekly',
    tag: 'Self-Drive / Chauffeur',
    price: 85000,
    unit: '/ week',
    discountPercent: 20,
    includedMileage: '1,200 km included',
    description: 'Our best-selling all-inclusive weekly plan for executives, families, and island tours.',
    featured: true,
    icon: Briefcase,
    perks: [
      '1,200 km mileage included',
      'Luxury Sedan or Executive SUV',
      'Free doorstep delivery & pickup',
      'Zero security deposit for verified users',
      'Priority 24/7 concierge support',
    ],
  },
  {
    _id: 'pkg-airport',
    name: 'BIA Airport Transfer',
    category: 'Airport Transfer',
    tag: 'With Chauffeur',
    price: 12000,
    unit: '/ trip',
    discountPercent: 0,
    includedMileage: 'Point-to-point',
    description: 'Stress-free airport pickups and drops with real-time flight tracking and luggage help.',
    featured: false,
    icon: Plane,
    perks: [
      'BIA Airport to Colombo / Negombo',
      'Professional English-speaking driver',
      '60-min complimentary wait time',
      'Complimentary Wi-Fi & bottled water',
    ],
  },
  {
    _id: 'pkg-monthly',
    name: 'Monthly Corporate',
    category: 'Monthly',
    tag: 'Long-Term',
    price: 265000,
    unit: '/ month',
    discountPercent: 25,
    includedMileage: '3,500 km included',
    description: 'Cost-effective monthly mobility for corporate teams, expats, and long-term projects.',
    featured: false,
    icon: Calendar,
    perks: [
      '3,500 km monthly allowance',
      'Scheduled maintenance & service included',
      'Instant replacement vehicle guarantee',
      'Consolidated monthly LKR invoicing',
    ],
  },
  {
    _id: 'pkg-wedding',
    name: 'Royal Wedding VIP',
    category: 'Wedding',
    tag: 'Chauffeur & Decor',
    price: 45000,
    unit: '/ event',
    discountPercent: 0,
    includedMileage: '8 hours / 100 km',
    description: 'Make a grand entrance with our flagship Mercedes-Benz, BMW, or Range Rover fleet.',
    featured: false,
    icon: Heart,
    perks: [
      'Complimentary floral ribbon decor',
      'Uniformed VIP chauffeur',
      'Flexible 8-hour ceremony window',
      'Red-carpet photography standby',
    ],
  },
  {
    _id: 'pkg-daily',
    name: 'City Day Explorer',
    category: 'Daily',
    tag: 'Self-Drive',
    price: 14500,
    unit: '/ day',
    discountPercent: 0,
    includedMileage: '150 km included',
    description: 'Ideal for business meetings, city errands, or single-day trips around town.',
    featured: false,
    icon: Car,
    perks: [
      '150 km daily mileage included',
      'Fuel-efficient Hybrid & Sedan options',
      'Full A/C & sanitized interior',
      'Instant digital confirmation',
    ],
  },
];

const CATEGORIES = ['All', 'Daily', 'Weekend', 'Weekly', 'Monthly', 'Airport Transfer', 'Wedding'];

export default function PackagesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState(CURATED_PACKAGES);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    apiClient
      .get('/catalog/packages')
      .then((res) => {
        const live = res.data?.data || [];
        if (live.length > 0) {
          const normalized = live.map((p) => ({
            ...p,
            tag: p.category,
            unit: '',
            featured: false,
            icon: Package,
            perks: p.perks?.length ? p.perks : [p.includedMileage || 'Flexible mileage', '24/7 Support'],
          }));
          setPackages([...normalized, ...CURATED_PACKAGES]);
        }
      })
      .catch(() => {
        // Keep curated packages seamlessly
      });
  }, []);

  const filteredPackages = useMemo(() => {
    if (activeCategory === 'All') return packages;
    return packages.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
  }, [packages, activeCategory]);

  const handleSelectPackage = (pkg) => {
    const token = localStorage.getItem('token');
    const user = getUser();
    if (!token || !user || isSessionExpired()) {
      toast('Please sign in to book this package', {
        icon: '📦',
        style: { background: '#0A1F44', color: '#fff' },
      });
      navigate('/login');
      return;
    }

    toast.success(`Selected "${pkg.name}" — pick a vehicle to apply this package!`);
    navigate('/vehicles');
  };

  return (
    <div className="bg-gradient-to-b from-[#EFF6FF]/60 via-[#F8FAFC] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Dark Navy Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 rounded-[2rem] bg-gradient-to-br from-[#06132B] via-[#0A1F44] to-[#0D2B5E] p-8 sm:p-12 text-white relative overflow-hidden shadow-xl"
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
                <Sparkles className="h-3.5 w-3.5" />
                TAILORED RENTAL PLANS
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Rental Packages &amp; Deals
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                All-inclusive daily, weekly, monthly, wedding, and airport transfer packages with transparent LKR rates.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 self-start lg:self-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 px-5 py-3.5 text-xs sm:text-sm font-bold shadow-lg">
              <span>{packages.length} Curated Plans</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-[#00E5FF]">Up to 25% Savings</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Overlapping Category Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-3.5 sm:p-4 -mt-8 relative z-20 mx-2 sm:mx-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0A1F44] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Packages Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 py-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredPackages.map((pkg) => {
              const Icon = pkg.icon || Package;
              const isHighlighted = pkg.featured;

              return isHighlighted ? (
                <motion.div
                  layout
                  key={pkg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="bg-gradient-to-br from-[#06132B] via-[#0A1F44] to-[#0D2B5E] text-white rounded-3xl p-8 border-2 border-[#00E5FF]/50 shadow-[0_20px_50px_rgba(10,31,68,0.25)] relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#00E5FF]/20 blur-3xl" />
                  <span className="absolute top-6 right-6 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-3 py-1 text-xs font-bold text-[#0A1F44]">
                    Most Popular
                  </span>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-[#00E5FF]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#00E5FF]">
                        {pkg.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-extrabold text-white">{pkg.name}</h3>
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">{pkg.description}</p>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white">
                        LKR {Number(pkg.price || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-300">{pkg.unit}</span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-slate-200">
                      {pkg.perks.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-[#00E5FF] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className="relative z-10 mt-8 w-full rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] py-3.5 text-sm font-bold text-[#0A1F44] shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:scale-[1.02] transition cursor-pointer"
                  >
                    Select Package
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  key={pkg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(10,31,68,0.05)] hover:-translate-y-1.5 hover:border-[#00B4D8]/40 hover:shadow-[0_20px_40px_rgba(0,180,216,0.12)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#00E5FF]/10 text-[#00B4D8]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#0A1F44]">
                          {pkg.tag}
                        </span>
                      </div>
                      {pkg.discountPercent > 0 && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          {pkg.discountPercent}% Off
                        </span>
                      )}
                    </div>

                    <h3 className="mt-5 text-xl font-extrabold text-[#0A1F44]">{pkg.name}</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{pkg.description}</p>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#0A1F44]">
                        LKR {Number(pkg.price || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">{pkg.unit}</span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-slate-600">
                      {pkg.perks.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-[#00B4D8] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className="mt-8 w-full rounded-xl border border-[#0A1F44]/20 bg-slate-50 py-3.5 text-sm font-bold text-[#0A1F44] transition-all duration-200 hover:bg-[#0A1F44] hover:text-white hover:border-[#0A1F44] cursor-pointer"
                  >
                    Select Package
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* 4. Bottom Custom Corporate / Fleet CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mb-16 rounded-[2rem] bg-gradient-to-r from-[#06132B] via-[#0A1F44] to-[#0D2B5E] p-8 sm:p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#00E5FF]/20 blur-3xl" />

          <div className="relative z-10 text-center lg:text-left max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Need a Custom Corporate or Long-Term Plan?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Talk to our fleet team for multi-vehicle corporate contracts, custom wedding convoys, or chauffeur schedules.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-6 py-3.5 text-sm font-bold text-[#0A1F44] shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:scale-105 transition cursor-pointer"
            >
              Browse Vehicles
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition cursor-pointer"
            >
              <Headphones className="h-4 w-4 text-[#00E5FF]" />
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
