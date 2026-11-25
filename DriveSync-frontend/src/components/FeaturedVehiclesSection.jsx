import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowRight, Fuel, Settings2, Users } from 'lucide-react';
import { getUser, isSessionExpired } from '../utils/auth';

const FEATURED_VEHICLES = [
  {
    _id: 'feat-mercedes-e',
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2024,
    subtitle: '2024 • Executive Sedan',
    category: 'Luxury',
    tags: ['Luxury', 'Sedan', 'Hybrid'],
    dailyRate: 24500,
    isAvailable: true,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Hybrid',
    location: 'Colombo',
    luggageCapacity: '3 Large Bags',
    mileageLimit: '200 km / day',
    hasAC: true,
    imageUrl:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=85',
  },
  {
    _id: 'feat-prado',
    brand: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2023,
    subtitle: '2023 • 4x4 Expedition',
    category: 'SUV',
    tags: ['SUV'],
    dailyRate: 28000,
    isAvailable: true,
    seats: 7,
    transmission: 'Auto',
    fuelType: 'Diesel',
    location: 'Colombo',
    luggageCapacity: '4 Large Bags',
    mileageLimit: '200 km / day',
    hasAC: true,
    imageUrl:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85',
  },
  {
    _id: 'feat-civic-hybrid',
    brand: 'Honda',
    model: 'Civic Hybrid',
    year: 2024,
    subtitle: '2024 • e:HEV Touring',
    category: 'Hybrid',
    tags: ['Hybrid', 'Sedan'],
    dailyRate: 14500,
    isAvailable: true,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Hybrid',
    location: 'Kandy',
    luggageCapacity: '2 Large Bags',
    mileageLimit: '150 km / day',
    hasAC: true,
    imageUrl:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85',
  },
  {
    _id: 'feat-bmw-5',
    brand: 'BMW',
    model: '5 Series',
    year: 2024,
    subtitle: '2024 • M Sport Package',
    category: 'Luxury',
    tags: ['Luxury', 'Sedan'],
    dailyRate: 26000,
    isAvailable: false,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Petrol',
    location: 'Colombo',
    luggageCapacity: '3 Large Bags',
    mileageLimit: '180 km / day',
    hasAC: true,
    imageUrl:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=85',
  },
];

const FILTER_TABS = ['All', 'Sedan', 'SUV', 'Luxury', 'Hybrid'];

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FeaturedVehiclesSection({ onViewDetails, onRentNow }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filteredVehicles =
    activeTab === 'All'
      ? FEATURED_VEHICLES
      : FEATURED_VEHICLES.filter(
          (v) => v.category === activeTab || v.tags.includes(activeTab)
        );

  const handleRentClick = (vehicle) => {
    if (!vehicle.isAvailable) return;

    const user = getUser();
    if (!user || isSessionExpired()) {
      toast('Please sign in to book this vehicle', {
        icon: '🔐',
        style: { background: '#0A1F44', color: '#fff' },
      });
      navigate('/login');
      return;
    }

    if (onRentNow) {
      onRentNow(vehicle);
    } else {
      navigate('/vehicles');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-white to-[#EFF6FF]/60">
      {/* Subtle Architectural Dot-Matrix Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: 'radial-gradient(#0A1F44 1.25px, transparent 1.25px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Ambient Cyan & Sky Glow Blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#00E5FF]/14 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#00B4D8]/12 blur-3xl" />

      {/* Subtle Decorative Rings */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full border border-[#00B4D8]/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full border border-[#0A1F44]/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <span className="inline-block text-xs font-extrabold uppercase tracking-[0.2em] text-[#00B4D8]">
              CURATED FLEET
            </span>
            <h2 className="mt-1.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]">
              Featured Vehicles
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Handpicked, well-maintained vehicles ready for your next journey.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="group inline-flex items-center gap-2 text-sm font-bold text-[#0A1F44] hover:text-[#00B4D8] transition-colors cursor-pointer self-start sm:self-auto"
          >
            View All Vehicles
            <ArrowRight className="h-4 w-4 text-[#00B4D8] transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Quick Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#0A1F44] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-[#0A1F44]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 4-Column Responsive Vehicle Cards Grid */}
        <motion.div
          key={activeTab}
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredVehicles.map((vehicle) => (
            <motion.div
              key={vehicle._id}
              variants={cardVariants}
              className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(10,31,68,0.06)] overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,180,216,0.16)] hover:border-[#00B4D8]/45 transition-all duration-300 flex flex-col"
            >
              {/* Animated Ambient Background Layer */}
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                {/* Soft breathing cyan orb */}
                <motion.div
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.35, 0.65, 0.35],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[#00E5FF]/15 blur-2xl group-hover:bg-[#00E5FF]/30 transition-colors duration-500"
                />
                {/* Soft navy-sky top-left accent */}
                <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#0A1F44]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Diagonal Light Shimmer Sweep on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#00E5FF]/12 to-transparent skew-x-12" />
              </div>

              {/* Image Area */}
              <div className="relative z-10 h-48 overflow-hidden bg-slate-100">
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top-Left Availability Badge */}
                {vehicle.isAvailable ? (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Available
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-rose-600 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Booked
                  </span>
                )}

                {/* Top-Right Category Tag */}
                <span className="absolute top-3 right-3 rounded-full bg-[#0A1F44]/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                  {vehicle.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="relative z-10 p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#0A1F44] truncate">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{vehicle.subtitle}</p>

                  {/* Specs Row */}
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#00B4D8]" />
                      {vehicle.seats} Seats
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Settings2 className="h-3.5 w-3.5 text-[#00B4D8]" />
                      {vehicle.transmission}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Fuel className="h-3.5 w-3.5 text-[#00B4D8]" />
                      {vehicle.fuelType}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="border-t border-slate-100 my-4" />

                  {/* Bottom Price & Action Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-extrabold text-[#0A1F44]">
                        LKR {vehicle.dailyRate.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400"> / day</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails && onViewDetails(vehicle)}
                        className="rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#0A1F44] transition cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        disabled={!vehicle.isAvailable}
                        onClick={() => handleRentClick(vehicle)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                          vehicle.isAvailable
                            ? 'bg-[#0A1F44] text-white hover:bg-[#00B4D8] hover:text-[#0A1F44] cursor-pointer'
                            : 'bg-slate-200 text-slate-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {vehicle.isAvailable ? 'Rent Now' : 'Booked'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
