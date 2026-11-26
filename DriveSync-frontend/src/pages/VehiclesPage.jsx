import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Fuel,
  Headphones,
  Luggage,
  MapPin,
  Package,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Snowflake,
  Star,
  Users,
  X,
} from 'lucide-react';
import apiClient from '../api/apiClient';
import BookingModal from '../components/BookingModal';
import { getUser, isSessionExpired } from '../utils/auth';

const MOCK_FLEET = [
  {
    _id: 'veh-mercedes-e',
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2024,
    category: 'Luxury',
    rating: 4.9,
    dailyRate: 24500,
    isAvailable: true,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Hybrid',
    hasAC: true,
    location: 'Colombo',
    luggageCapacity: '3 Large Bags',
    mileageLimit: '200 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-prado',
    brand: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2023,
    category: 'SUV',
    rating: 4.9,
    dailyRate: 28000,
    isAvailable: true,
    seats: 7,
    transmission: 'Auto',
    fuelType: 'Diesel',
    hasAC: true,
    location: 'Colombo',
    luggageCapacity: '4 Large Bags',
    mileageLimit: '200 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-civic-hybrid',
    brand: 'Honda',
    model: 'Civic Hybrid',
    year: 2024,
    category: 'Hybrid/EV',
    rating: 4.8,
    dailyRate: 14500,
    isAvailable: true,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Hybrid',
    hasAC: true,
    location: 'Kandy',
    luggageCapacity: '2 Large Bags',
    mileageLimit: '150 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-bmw-5',
    brand: 'BMW',
    model: '5 Series M Sport',
    year: 2024,
    category: 'Luxury',
    rating: 4.9,
    dailyRate: 26000,
    isAvailable: false,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Petrol',
    hasAC: true,
    location: 'Colombo',
    luggageCapacity: '3 Large Bags',
    mileageLimit: '180 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-axio',
    brand: 'Toyota',
    model: 'Corolla Axio',
    year: 2022,
    category: 'Sedan',
    rating: 4.7,
    dailyRate: 11500,
    isAvailable: true,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Hybrid',
    hasAC: true,
    location: 'Airport',
    luggageCapacity: '2 Large Bags',
    mileageLimit: '150 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-velar',
    brand: 'Range Rover',
    model: 'Velar R-Dynamic',
    year: 2024,
    category: 'SUV',
    rating: 5.0,
    dailyRate: 35000,
    isAvailable: true,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Petrol',
    hasAC: true,
    location: 'Colombo',
    luggageCapacity: '4 Large Bags',
    mileageLimit: '200 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-hiace',
    brand: 'Toyota',
    model: 'HiAce Commuter',
    year: 2023,
    category: 'Van',
    rating: 4.8,
    dailyRate: 19500,
    isAvailable: true,
    seats: 12,
    transmission: 'Manual',
    fuelType: 'Diesel',
    hasAC: true,
    location: 'Airport',
    luggageCapacity: '8 Large Bags',
    mileageLimit: '250 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-tesla-3',
    brand: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2024,
    category: 'Hybrid/EV',
    rating: 4.9,
    dailyRate: 23000,
    isAvailable: true,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Electric',
    hasAC: true,
    location: 'Colombo',
    luggageCapacity: '2 Large Bags',
    mileageLimit: '250 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-vezel',
    brand: 'Honda',
    model: 'Vezel RS Sensing',
    year: 2023,
    category: 'SUV',
    rating: 4.7,
    dailyRate: 13500,
    isAvailable: false,
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Hybrid',
    hasAC: true,
    location: 'Galle',
    luggageCapacity: '3 Large Bags',
    mileageLimit: '150 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd82c8377279?auto=format&fit=crop&w=1000&q=85',
  },
  {
    _id: 'veh-mazda-6',
    brand: 'Mazda',
    model: '6 SkyActiv',
    year: 2022,
    category: 'Sedan',
    rating: 4.8,
    dailyRate: 12800,
    isAvailable: true,
    seats: 5,
    transmission: 'Manual',
    fuelType: 'Petrol',
    hasAC: true,
    location: 'Kandy',
    luggageCapacity: '2 Large Bags',
    mileageLimit: '150 km/day included',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=85',
  },
];

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Van', 'Luxury', 'Hybrid/EV'];

export default function VehiclesPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const incoming = location.state?.searchFilters || {};

  const [vehicles, setVehicles] = useState(MOCK_FLEET);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(incoming.category || 'All');
  const [transmission, setTransmission] = useState('All');
  const [fuelType, setFuelType] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState(incoming.location || '');

  const [detailVehicle, setDetailVehicle] = useState(null);
  const [bookingVehicle, setBookingVehicle] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Fetch live catalog vehicles if backend is running and merge with curated showcase
    apiClient
      .get('/catalog')
      .then((res) => {
        const liveList = res.data?.data || [];
        if (liveList.length > 0) {
          const normalized = liveList.map((v) => ({
            ...v,
            rating: v.rating || 4.8,
            transmission: v.transmission === 'Automatic' ? 'Auto' : v.transmission || 'Auto',
            hasAC: v.hasAC !== false,
            imageUrl:
              v.imageUrl ||
              'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=85',
          }));
          setVehicles([...normalized, ...MOCK_FLEET]);
        }
      })
      .catch(() => {
        // Keep curated mock fleet seamlessly when backend is offline
      });
  }, []);

  useEffect(() => {
    if (location.state?.searchFilters) {
      if (location.state.searchFilters.category) setCategory(location.state.searchFilters.category);
      if (location.state.searchFilters.location !== undefined) {
        setLocationFilter(location.state.searchFilters.location);
      }
    }
  }, [location.state]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    category !== 'All' ||
    transmission !== 'All' ||
    fuelType !== 'All' ||
    sortBy !== 'featured' ||
    availableOnly ||
    locationFilter !== '';

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setTransmission('All');
    setFuelType('All');
    setSortBy('featured');
    setAvailableOnly(false);
    setLocationFilter('');
  };

  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') {
      if (category === 'Hybrid/EV') {
        list = list.filter(
          (v) =>
            v.category === 'Hybrid/EV' ||
            v.fuelType === 'Hybrid' ||
            v.fuelType === 'Electric'
        );
      } else {
        list = list.filter((v) => v.category.toLowerCase() === category.toLowerCase());
      }
    }

    if (transmission !== 'All') {
      list = list.filter((v) =>
        v.transmission.toLowerCase().includes(transmission.toLowerCase())
      );
    }

    if (fuelType !== 'All') {
      list = list.filter((v) => v.fuelType.toLowerCase() === fuelType.toLowerCase());
    }

    if (locationFilter) {
      list = list.filter((v) =>
        (v.location || '').toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (availableOnly) {
      list = list.filter((v) => v.isAvailable !== false);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.dailyRate - b.dailyRate);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.dailyRate - a.dailyRate);
    }

    return list;
  }, [vehicles, searchTerm, category, transmission, fuelType, sortBy, availableOnly, locationFilter]);

  const availableCount = vehicles.filter((v) => v.isAvailable !== false).length;

  const handleRentNow = (vehicle) => {
    if (vehicle.isAvailable === false) return;

    const token = localStorage.getItem('token');
    const user = getUser();
    if (!token || !user || isSessionExpired()) {
      toast('Please sign in to book this vehicle', {
        icon: '🔐',
        style: { background: '#0A1F44', color: '#fff' },
      });
      navigate('/login', { state: { from: '/vehicles', vehicleId: vehicle._id } });
      return;
    }

    setBookingVehicle(vehicle);
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Compact Dark Navy Page Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 rounded-[2rem] bg-gradient-to-br from-[#06132B] via-[#0A1F44] to-[#0D2B5E] p-8 sm:p-12 text-white relative overflow-hidden shadow-xl"
        >
          {/* Faint Tech Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0, 229, 255, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.35) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          {/* Ambient Cyan Glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#00E5FF]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#00E5FF]">
                LIVE FLEET CATALOG
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Explore Our Fleet
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                Browse real-time vehicle availability, compare transparent LKR daily rates, and reserve your ideal ride.
              </p>
            </div>

            {/* Right Quick Stats Badge */}
            <div className="inline-flex items-center gap-3 self-start lg:self-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 px-5 py-3.5 text-xs sm:text-sm font-bold shadow-lg">
              <span>{vehicles.length} Vehicles</span>
              <span className="text-white/30">&bull;</span>
              <span className="inline-flex items-center gap-2 text-emerald-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                {availableCount} Available Now
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. Overlapping Interactive Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-5 -mt-8 relative z-20 mx-2 sm:mx-6 space-y-4">
          {/* Top Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-4 flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#00B4D8] focus-within:ring-2 focus-within:ring-[#00B4D8]/20 transition">
              <Search className="h-4 w-4 text-[#00B4D8] shrink-0" />
              <input
                type="text"
                placeholder="Search by brand or model (e.g., Prado, Civic)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[#0A1F44] placeholder-slate-400 outline-none"
              />
            </div>

            {/* Transmission */}
            <div className="lg:col-span-2">
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 text-sm font-semibold text-[#0A1F44] outline-none focus:border-[#00B4D8] cursor-pointer"
              >
                <option value="All">Transmission: All</option>
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div className="lg:col-span-2">
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 text-sm font-semibold text-[#0A1F44] outline-none focus:border-[#00B4D8] cursor-pointer"
              >
                <option value="All">Fuel: All</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 text-sm font-semibold text-[#0A1F44] outline-none focus:border-[#00B4D8] cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Available Only Toggle */}
            <div className="lg:col-span-2 flex items-center justify-between lg:justify-end gap-2.5 px-1">
              <span className="text-xs font-bold text-[#0A1F44]">Available Only</span>
              <button
                type="button"
                role="switch"
                aria-checked={availableOnly}
                onClick={() => setAvailableOnly((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                  availableOnly ? 'bg-[#00B4D8]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    availableOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Row: Category Pills + Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0A1F44] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              {locationFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#00E5FF]/15 px-3 py-1 text-xs font-bold text-[#0A1F44]">
                  <MapPin className="h-3 w-3 text-[#00B4D8]" />
                  {locationFilter}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4D8] hover:text-[#0A1F44] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 3. Responsive Vehicle Cards Grid or Empty State */}
        {filteredVehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-14 rounded-3xl bg-white border border-slate-100 p-12 text-center shadow-sm"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#00E5FF]/10 text-[#00B4D8] mb-4">
              <Car className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0A1F44]">No vehicles match your filters</h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
              Try adjusting your search keywords, vehicle category, or availability toggle.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A1F44] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#00B4D8] hover:text-[#0A1F44] transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12"
          >
            <AnimatePresence mode="popLayout">
              {filteredVehicles.map((vehicle) => {
                const available = vehicle.isAvailable !== false;
                return (
                  <motion.div
                    layout
                    key={vehicle._id}
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(10,31,68,0.06)] overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,180,216,0.14)] hover:border-[#00B4D8]/40 transition-all duration-300 flex flex-col"
                  >
                    {/* Animated Ambient Card Background */}
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                      <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-[#00E5FF]/14 blur-2xl group-hover:bg-[#00E5FF]/28 transition-colors duration-500" />
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#00E5FF]/12 to-transparent skew-x-12" />
                    </div>

                    {/* Image Section */}
                    <div className="relative z-10 h-52 overflow-hidden bg-slate-50">
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top-Left Availability Badge */}
                      {available ? (
                        <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                          Available
                        </span>
                      ) : (
                        <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-rose-600 shadow-xs">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Booked
                        </span>
                      )}

                      {/* Top-Right Category Tag */}
                      <span className="absolute top-3.5 right-3.5 rounded-full bg-[#0A1F44]/85 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                        {vehicle.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="relative z-10 p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-extrabold text-[#0A1F44]">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {vehicle.year} &bull; {vehicle.location || 'Colombo'}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-bold text-[#0A1F44]">
                            {vehicle.rating || 4.9}
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          </span>
                        </div>

                        {/* 4-Item Specs Row */}
                        <div className="mt-4 grid grid-cols-4 gap-2 text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-[#00B4D8] shrink-0" />
                            {vehicle.seats || 5} Seats
                          </span>
                          <span className="flex items-center gap-1">
                            <Settings2 className="h-3.5 w-3.5 text-[#00B4D8] shrink-0" />
                            {vehicle.transmission || 'Auto'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Fuel className="h-3.5 w-3.5 text-[#00B4D8] shrink-0" />
                            {vehicle.fuelType || 'Petrol'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Snowflake className="h-3.5 w-3.5 text-[#00B4D8] shrink-0" />
                            {vehicle.hasAC !== false ? 'A/C' : 'Non-AC'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="border-t border-slate-100 my-4" />

                        {/* Price & Action Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-lg font-extrabold text-[#0A1F44]">
                              LKR {Number(vehicle.dailyRate || 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400"> / day</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailVehicle(vehicle)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0A1F44] hover:border-[#00B4D8] hover:text-[#00B4D8] transition cursor-pointer"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              disabled={!available}
                              onClick={() => handleRentNow(vehicle)}
                              className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                                available
                                  ? 'bg-[#0A1F44] text-white hover:bg-[#00B4D8] hover:text-[#0A1F44] cursor-pointer'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {available ? 'Rent Now' : 'Booked'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 rounded-[2rem] bg-gradient-to-r from-[#06132B] via-[#0A1F44] to-[#0D2B5E] p-8 sm:p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl"
        >
          {/* Faint Grid + Ambient Cyan Glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0, 229, 255, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.35) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#00E5FF]/20 blur-3xl" />

          <div className="relative z-10 text-center lg:text-left max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#00E5FF]">
              <Package className="h-3.5 w-3.5" />
              TAILORED MOBILITY
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Looking for a Custom Rental or Package?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Save more with our all-inclusive weekly, wedding, and airport transfer bundles—or reach our 24/7 fleet concierge for custom bookings.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-6 py-3.5 text-sm font-bold text-[#0A1F44] shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              Explore Packages
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20 cursor-pointer"
            >
              <Headphones className="h-4 w-4 text-[#00E5FF]" />
              Contact Concierge
            </button>
          </div>
        </motion.div>
      </div>

      {/* 4. Sleek Animated Vehicle Details Modal (Framer Motion) */}
      <AnimatePresence>
        {detailVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailVehicle(null)}
            className="fixed inset-0 bg-[#06132B]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden my-auto"
            >
              {/* Modal Image Header */}
              <div className="relative h-56 sm:h-64 bg-slate-100">
                <img
                  src={detailVehicle.imageUrl}
                  alt={`${detailVehicle.brand} ${detailVehicle.model}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setDetailVehicle(null)}
                  className="absolute top-4 right-4 rounded-full bg-black/45 p-2 text-white hover:bg-black/65 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                <span
                  className={`absolute top-4 left-4 rounded-full px-3.5 py-1 text-xs font-bold shadow ${
                    detailVehicle.isAvailable !== false
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {detailVehicle.isAvailable !== false ? 'Available' : 'Currently Booked'}
                </span>

                <span className="absolute bottom-4 right-4 rounded-full bg-[#0A1F44]/85 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white">
                  {detailVehicle.category}
                </span>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0A1F44]">
                      {detailVehicle.brand} {detailVehicle.model}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {detailVehicle.year} &bull; {detailVehicle.location || 'Colombo'} &bull;{' '}
                      <span className="font-semibold text-[#00B4D8]">
                        {detailVehicle.mileageLimit || '150 km/day included'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">Daily Rate</p>
                    <p className="text-2xl font-extrabold text-[#0A1F44]">
                      LKR {Number(detailVehicle.dailyRate || 0).toLocaleString()}
                      <span className="text-xs font-normal text-slate-400"> / day</span>
                    </p>
                  </div>
                </div>

                {/* Detailed Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Users, label: 'Seats', value: `${detailVehicle.seats || 5} Seats` },
                    { icon: Settings2, label: 'Transmission', value: detailVehicle.transmission || 'Auto' },
                    { icon: Fuel, label: 'Fuel Type', value: detailVehicle.fuelType || 'Petrol' },
                    { icon: Snowflake, label: 'Climate', value: detailVehicle.hasAC !== false ? 'Full A/C' : 'Non-AC' },
                    { icon: Luggage, label: 'Luggage', value: detailVehicle.luggageCapacity || '2 Large Bags' },
                    { icon: ShieldCheck, label: 'Insurance', value: 'Comprehensive' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-2xl bg-[#F8FAFC] p-3 flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#00B4D8] shadow-2xs">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">{label}</p>
                        <p className="text-xs font-bold text-[#0A1F44]">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Included Features Checklist */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0A1F44] mb-2.5">
                    Included With Every Rental
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                    {['Full Insurance', '24/7 Support', 'Free Cancellation', 'Sanitized Interior'].map((item) => (
                      <span key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00B4D8] shrink-0" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDetailVehicle(null)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={detailVehicle.isAvailable === false}
                    onClick={() => {
                      const target = detailVehicle;
                      setDetailVehicle(null);
                      handleRentNow(target);
                    }}
                    className={`rounded-xl px-6 py-2.5 text-sm font-bold transition ${
                      detailVehicle.isAvailable !== false
                        ? 'bg-[#0A1F44] text-white hover:bg-[#00B4D8] hover:text-[#0A1F44] cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {detailVehicle.isAvailable !== false ? 'Rent This Vehicle' : 'Currently Booked'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal when Authenticated */}
      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
}
