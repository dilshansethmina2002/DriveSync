import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getUser, isSessionExpired } from '../utils/auth';

const PACKAGES = [
  {
    id: 'weekend-getaway',
    name: 'Weekend Getaway',
    tag: 'Self-Drive',
    price: 'LKR 29,500',
    unit: '/ 2 days',
    featured: false,
    features: [
      '400 km mileage included',
      'Choice of Sedan or Compact SUV',
      'Full comprehensive insurance',
      '24/7 roadside assistance',
    ],
  },
  {
    id: 'executive-weekly',
    name: 'Executive Weekly',
    tag: 'Self-Drive / Chauffeur',
    price: 'LKR 85,000',
    unit: '/ week',
    featured: true,
    features: [
      '1,200 km mileage included',
      'Luxury Sedan or Executive SUV',
      'Free doorstep delivery & pickup',
      'Zero security deposit for verified users',
      'Priority 24/7 concierge support',
    ],
  },
  {
    id: 'airport-transfer',
    name: 'Airport Transfer',
    tag: 'With Chauffeur',
    price: 'LKR 12,000',
    unit: '/ trip',
    featured: false,
    features: [
      'BIA Airport to Colombo / Negombo',
      'Professional English-speaking driver',
      'Real-time flight tracking & free wait time',
      'Complimentary Wi-Fi & bottled water',
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function PopularPackagesSection() {
  const navigate = useNavigate();

  const handleSelectPackage = (pkg) => {
    const user = getUser();
    if (!user || isSessionExpired()) {
      toast('Please sign in to book this package', {
        icon: '📦',
        style: { background: '#0A1F44', color: '#fff' },
      });
      navigate('/login');
      return;
    }
    toast.success(`Selected "${pkg.name}" — choose a vehicle to apply this package!`);
    navigate('/vehicles');
  };

  return (
    <section
      id="packages"
      className="relative overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-[#E6F2FF]/75 to-[#F8FAFC]"
    >
      {/* Subtle Light Blue / Cyan Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#00B4D8]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <span className="inline-block text-xs font-extrabold uppercase tracking-[0.2em] text-[#00B4D8]">
              TAILORED PLANS
            </span>
            <h2 className="mt-1.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]">
              Popular Rental Packages
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-500">
              Flexible, all-inclusive rental packages designed for weekend trips, business travel, and airport transfers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/packages')}
            className="group inline-flex items-center gap-2 text-sm font-bold text-[#0A1F44] hover:text-[#00B4D8] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Explore All Packages
            <ArrowRight className="h-4 w-4 text-[#00B4D8] transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* 3-Column Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mt-12"
        >
          {PACKAGES.map((pkg) =>
            pkg.featured ? (
              /* Highlighted Center Card (Deep Navy) */
              <motion.div
                key={pkg.id}
                variants={cardVariants}
                className="bg-gradient-to-br from-[#06132B] via-[#0A1F44] to-[#0D2B5E] text-white rounded-3xl p-8 sm:p-10 border-2 border-[#00E5FF]/50 shadow-[0_20px_50px_rgba(10,31,68,0.25)] relative lg:scale-105 overflow-hidden"
              >
                {/* Ambient Cyan Glow Blob */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#00E5FF]/20 blur-3xl" />

                {/* Most Popular Badge */}
                <span className="absolute top-6 right-6 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-3 py-1 text-xs font-bold text-[#0A1F44] shadow-sm">
                  Most Popular
                </span>

                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#00E5FF]">
                    {pkg.tag}
                  </span>

                  <h3 className="mt-4 text-2xl font-extrabold text-white">{pkg.name}</h3>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                      {pkg.price}
                    </span>
                    <span className="text-sm text-slate-300">{pkg.unit}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-200">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#00E5FF] shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] py-3.5 text-sm font-bold text-[#0A1F44] shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                  >
                    Select Package
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Standard White Card */
              <motion.div
                key={pkg.id}
                variants={cardVariants}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(10,31,68,0.05)] hover:-translate-y-2 transition-all duration-300"
              >
                <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#0A1F44]">
                  {pkg.tag}
                </span>

                <h3 className="mt-4 text-xl font-extrabold text-[#0A1F44]">{pkg.name}</h3>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-[#0A1F44]">
                    {pkg.price}
                  </span>
                  <span className="text-sm text-slate-400">{pkg.unit}</span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#00B4D8] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelectPackage(pkg)}
                  className="mt-8 w-full rounded-xl border border-[#0A1F44]/20 bg-slate-50 py-3.5 text-sm font-bold text-[#0A1F44] transition-all duration-200 hover:bg-[#0A1F44] hover:text-white hover:border-[#0A1F44] cursor-pointer"
                >
                  Select Package
                </button>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
