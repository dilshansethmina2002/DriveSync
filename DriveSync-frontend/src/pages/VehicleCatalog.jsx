import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Car, Fuel, Gauge, MapPin, RefreshCw, Search, Users } from 'lucide-react';
import apiClient from '../api/apiClient';
import BookingModal from '../components/BookingModal';
import VehicleDetailModal from '../components/VehicleDetailModal';
import HeroSection from '../components/HeroSection';
import FeaturedVehiclesSection from '../components/FeaturedVehiclesSection';
import PopularPackagesSection from '../components/PopularPackagesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import WhyChooseSection from '../components/WhyChooseSection';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/States';
import { formatMoney } from '../utils/format';
import { getUser, isSessionExpired } from '../utils/auth';

const VehicleCatalog = ({ isPublic = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    transmission: '',
    location: '',
    maxPrice: '',
    availability: 'all',
  });
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilters.search) params.search = activeFilters.search;
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.location) params.location = activeFilters.location;
      if (activeFilters.maxPrice) params.maxPrice = activeFilters.maxPrice;
      if (activeFilters.availability === 'available') params.isAvailable = true;

      const res = await apiClient.get('/catalog', { params });
      let list = res.data?.data || [];

      if (activeFilters.transmission) {
        list = list.filter(
          (v) => String(v.transmission || 'Automatic').toLowerCase() === activeFilters.transmission.toLowerCase()
        );
      }

      setVehicles(list);

      // If redirected back after login with a vehicleId, auto-open BookingModal
      const pendingVehicleId = location.state?.vehicleId;
      if (pendingVehicleId && getUser() && !isSessionExpired()) {
        const match = list.find((v) => v._id === pendingVehicleId);
        if (match && match.isAvailable !== false) {
          setBookingVehicle(match);
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const incoming = location.state?.searchFilters;
    if (incoming) {
      const merged = {
        ...filters,
        location: incoming.location || '',
        category: incoming.category || '',
      };
      setFilters(merged);
      fetchVehicles(merged);
    } else {
      fetchVehicles();
    }
  }, []);

  useEffect(() => {
    if (!isPublic) return;
    if (location.pathname === '/packages') {
      document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
    } else if (location.pathname === '/vehicles') {
      document.getElementById('vehicles')?.scrollIntoView({ behavior: 'smooth' });
    } else if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, isPublic]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles(filters);
  };

  const handleReset = () => {
    const empty = {
      search: '',
      category: '',
      transmission: '',
      location: '',
      maxPrice: '',
      availability: 'all',
    };
    setFilters(empty);
    fetchVehicles(empty);
  };

  const handleRentNow = (vehicle) => {
    const user = getUser();
    if (!user || isSessionExpired()) {
      toast('Please sign in or create an account to book this vehicle.', { icon: '🔐' });
      navigate('/login', {
        state: {
          from: location.pathname,
          vehicleId: vehicle._id,
        },
      });
      return;
    }
    setBookingVehicle(vehicle);
  };

  const handleQuickSearch = (quickFilters) => {
    const updated = {
      ...filters,
      location: quickFilters.location || '',
      category: quickFilters.category || '',
    };
    setFilters(updated);
    fetchVehicles(updated);
    if (isPublic && location.pathname !== '/vehicles') {
      navigate('/vehicles', { state: { searchFilters: quickFilters } });
    }
  };

  const isHomeLanding = isPublic && (location.pathname === '/' || location.pathname === '/packages');

  return (
    <div className={isPublic ? '' : 'space-y-6'}>
      {/* Home Landing Sections: Hero -> Featured Vehicles -> Packages -> How It Works -> Why Choose */}
      {isHomeLanding && (
        <>
          <HeroSection onQuickSearch={handleQuickSearch} />
          <FeaturedVehiclesSection
            onViewDetails={(v) => setDetailVehicle(v)}
            onRentNow={handleRentNow}
          />
          <PopularPackagesSection />
          <HowItWorksSection />
          <WhyChooseSection />
        </>
      )}

      {!isHomeLanding && (
        <div className={isPublic ? 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8' : 'space-y-6'}>
          {!isPublic ? (
            <PageHeader
              title="Browse Vehicles"
              subtitle="Search available fleet vehicles by category, transmission, pickup location, and daily rate."
              actions={
                <Button variant="secondary" size="sm" onClick={() => fetchVehicles()} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-block text-xs font-extrabold uppercase tracking-[0.2em] text-[#00B4D8]">
                  ALL FLEET VEHICLES
                </span>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0A1F44]">
                  Browse Our Fleet
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Search and filter live vehicle availability across all categories.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => fetchVehicles()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          )}

        {/* Search & Filter Tools */}
        <section id="vehicles" className="space-y-6">
          <div className="rounded-3xl bg-white p-3 sm:p-4 shadow-[0_12px_35px_rgba(10,31,68,0.08)] border border-slate-200/80">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center"
            >
              <div className="lg:col-span-3 flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4D8]/40 transition">
                <Search className="h-4 w-4 text-[#00B4D8] shrink-0" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search brand or model..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-medium text-[#0A1F44] placeholder-slate-400 outline-none"
                />
              </div>

              <div className="lg:col-span-2 rounded-2xl bg-slate-50 px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4D8]/40 transition">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-[#0A1F44] outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Van">Van</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              <div className="lg:col-span-2 rounded-2xl bg-slate-50 px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4D8]/40 transition">
                <select
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-[#0A1F44] outline-none cursor-pointer"
                >
                  <option value="">All Transmissions</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="lg:col-span-2 flex items-center gap-2 rounded-2xl bg-slate-50 px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4D8]/40 transition">
                <MapPin className="h-4 w-4 text-[#00B4D8] shrink-0" />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-medium text-[#0A1F44] placeholder-slate-400 outline-none"
                />
              </div>

              <div className="lg:col-span-1 rounded-2xl bg-slate-50 px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4D8]/40 transition">
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max LKR"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-medium text-[#0A1F44] placeholder-slate-400 outline-none"
                />
              </div>

              <div className="lg:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#0A1F44] to-[#0D2B5E] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:from-[#00B4D8] hover:to-[#00E5FF] hover:text-[#0A1F44] transition-all cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
                {(filters.search || filters.category || filters.transmission || filters.location || filters.maxPrice) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Vehicle Grid */}
          {loading ? (
            <Card className="p-10 flex justify-center">
              <Spinner label="Loading vehicles..." />
            </Card>
          ) : vehicles.length === 0 ? (
            <Card className="p-10">
              <EmptyState
                icon={Car}
                title="No vehicles match your search"
                description="Try clearing your search filters or check back later for newly added fleet vehicles."
                action={
                  <Button variant="secondary" onClick={handleReset}>
                    Show All Vehicles
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => {
                const available = vehicle.isAvailable !== false;
                return (
                  <Card
                    key={vehicle._id}
                    className="relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(0,180,216,0.14)] hover:border-[#00B4D8]/45 transition-all duration-300"
                  >
                    {/* Animated Ambient Card Background */}
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                      <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-[#00E5FF]/15 blur-2xl animate-pulse group-hover:bg-[#00E5FF]/30 transition-colors duration-500" />
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#00E5FF]/12 to-transparent skew-x-12" />
                    </div>

                    {/* Vehicle Image / Banner */}
                    <div
                      onClick={() => setDetailVehicle(vehicle)}
                      className="relative z-10 h-44 bg-gradient-to-br from-slate-800 via-ds-navy to-ds-royal flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Car className="h-14 w-14 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                      )}

                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-ds-navy shadow-xs">
                        {vehicle.category}
                      </span>

                      <span
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs ${
                          available ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      >
                        {available ? 'Available' : 'Currently Rented'}
                      </span>
                    </div>

                    {/* Vehicle Body */}
                    <div className="relative z-10 p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-ds-ink">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <span className="text-xs font-semibold text-ds-muted">{vehicle.year}</span>
                        </div>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ds-muted">
                          <MapPin className="h-3.5 w-3.5 text-ds-royal" />
                          {vehicle.location}
                        </p>

                        {/* Quick Specs */}
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-ds-muted">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-ds-surface px-2 py-1">
                            <Users className="h-3 w-3 text-ds-royal" /> {vehicle.seats || 5} Seats
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-ds-surface px-2 py-1">
                            <Fuel className="h-3 w-3 text-ds-royal" /> {vehicle.fuelType || 'Petrol'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-ds-surface px-2 py-1">
                            <Gauge className="h-3 w-3 text-ds-royal" /> {vehicle.transmission || 'Automatic'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <span className="text-lg font-extrabold text-ds-ink">
                            {formatMoney(vehicle.dailyRate)}
                          </span>
                          <span className="text-xs text-ds-muted"> / day</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setDetailVehicle(vehicle)}>
                            Details
                          </Button>
                          <Button
                            size="sm"
                            disabled={!available}
                            onClick={() => handleRentNow(vehicle)}
                          >
                            {available ? 'Rent Now' : 'Rented'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
      )}

      {/* Detailed Vehicle Information Modal */}
      {detailVehicle && (
        <VehicleDetailModal
          vehicle={detailVehicle}
          onClose={() => setDetailVehicle(null)}
          onRentNow={handleRentNow}
        />
      )}

      {/* Reservation Modal (when logged in) */}
      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
};

export default VehicleCatalog;
