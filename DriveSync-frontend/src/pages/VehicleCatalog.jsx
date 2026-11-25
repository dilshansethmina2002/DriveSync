import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Car, Fuel, Gauge, MapPin, RefreshCw, Search, ShieldCheck, Sparkles, Users, Plane, Heart, Calendar } from 'lucide-react';
import apiClient from '../api/apiClient';
import BookingModal from '../components/BookingModal';
import VehicleDetailModal from '../components/VehicleDetailModal';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/States';
import { formatMoney } from '../utils/format';
import { getUser, isSessionExpired } from '../utils/auth';

const FEATURED_PACKAGES = [
  {
    id: 'pkg-airport',
    title: 'Airport Drop & Pickup',
    badge: 'Popular',
    icon: Plane,
    price: 'From LKR 8,500',
    description: 'Punctual chauffeur-driven or self-drive airport transfers with 24/7 flight tracking.',
    perks: ['Free 60-min waiting time', 'Luggage assistance', 'All-inclusive highway tolls'],
  },
  {
    id: 'pkg-wedding',
    title: 'Wedding & VIP Fleet',
    badge: 'Luxury',
    icon: Heart,
    price: 'From LKR 25,000',
    description: 'Arrive in style with our executive sedans and SUVs tailored for special occasions.',
    perks: ['Complimentary ribbon decor', 'Uniformed professional driver', 'Flexible 8-hour window'],
  },
  {
    id: 'pkg-weekend',
    title: 'Weekend Getaway Deal',
    badge: '15% Off',
    icon: Calendar,
    price: 'From LKR 18,000',
    description: 'Book Friday to Monday and enjoy 15% off daily rates with extended mileage limits.',
    perks: ['300 km included', 'Free second driver', '24/7 roadside assistance'],
  },
];

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
    fetchVehicles();
  }, []);

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

  return (
    <div className={isPublic ? '' : 'space-y-6'}>
      {/* Hero Banner for Public Showcase */}
      {isPublic && (
        <section className="relative overflow-hidden bg-gradient-to-br from-ds-navy via-ds-deep to-ds-royal text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-ds-cyan/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-ds-sky/20 blur-2xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-ds-cyan ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Vehicle Rental & Fleet Platform
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
                Find Your Perfect Ride in Minutes
              </h1>
              <p className="mt-3 text-sm sm:text-base text-blue-100 leading-relaxed">
                Explore our verified fleet of sedans, SUVs, vans, and hatchbacks with transparent daily rates and instant online booking.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className={isPublic ? 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10' : 'space-y-6'}>
        {!isPublic && (
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
        )}

        {/* Search & Filter Tools */}
        <section id="vehicles" className="space-y-6">
          <Card className="p-4 sm:p-5 bg-gradient-to-r from-ds-navy to-ds-royal text-white border-none shadow-lg">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-center"
            >
              <input
                type="text"
                name="search"
                placeholder="Search brand or model..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-ds-ink placeholder-ds-muted outline-none focus:ring-2 focus:ring-ds-cyan"
              />

              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-ds-ink outline-none focus:ring-2 focus:ring-ds-cyan"
              >
                <option value="">All Categories</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Van">Van</option>
              </select>

              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-ds-ink outline-none focus:ring-2 focus:ring-ds-cyan"
              >
                <option value="">All Transmissions</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>

              <input
                type="text"
                name="location"
                placeholder="Location (e.g. Colombo)"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-ds-ink placeholder-ds-muted outline-none focus:ring-2 focus:ring-ds-cyan"
              />

              <input
                type="number"
                name="maxPrice"
                placeholder="Max Rate (LKR)"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-ds-ink placeholder-ds-muted outline-none focus:ring-2 focus:ring-ds-cyan"
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-ds-cyan text-ds-navy hover:bg-white font-bold">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                {(filters.search || filters.category || filters.transmission || filters.location || filters.maxPrice) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    className="text-white hover:bg-white/15"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </Card>

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
                    className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    {/* Vehicle Image / Banner */}
                    <div
                      onClick={() => setDetailVehicle(vehicle)}
                      className="relative h-44 bg-gradient-to-br from-slate-800 via-ds-navy to-ds-royal flex items-center justify-center cursor-pointer group overflow-hidden"
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
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
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

        {/* Public Sections: Rental Packages & How It Works */}
        {isPublic && (
          <>
            <section id="packages" className="pt-4 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-ds-ink">Special Rental Packages</h2>
                  <p className="text-sm text-ds-muted">
                    Value bundles designed for airport transfers, weddings, and weekend trips.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {FEATURED_PACKAGES.map(({ id, title, badge, icon: Icon, price, description, perks }) => (
                  <Card key={id} className="p-6 flex flex-col justify-between gap-4 border-t-4 border-t-ds-royal">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-ds-royal">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-ds-cyan/15 px-3 py-0.5 text-xs font-bold text-ds-royal">
                          {badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-ds-ink">{title}</h3>
                      <p className="text-xs text-ds-muted leading-relaxed">{description}</p>
                      <ul className="space-y-1.5 pt-1 text-xs text-ds-ink">
                        {perks.map((perk) => (
                          <li key={perk} className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-ds-royal">{price}</span>
                      <a href="#vehicles" className="text-xs font-bold text-ds-link hover:underline">
                        Choose Vehicle &rarr;
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section id="how-it-works" className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/80">
              <h2 className="text-xl font-extrabold text-ds-ink mb-5 text-center">Simple 4-Step Rental Workflow</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-center">
                {[
                  { step: '1', title: 'Browse Fleet', desc: 'Explore available vehicles, pricing, and specifications.' },
                  { step: '2', title: 'Select & Sign In', desc: 'Click Rent Now and sign in or create your customer account.' },
                  { step: '3', title: 'Choose Dates', desc: 'Pick rental dates with automatic double-booking protection.' },
                  { step: '4', title: 'Pay & Drive', desc: 'Complete online payment, get your digital receipt, and hit the road.' },
                ].map((item) => (
                  <div key={item.step} className="space-y-2">
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-ds-royal text-sm font-extrabold text-white">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-bold text-ds-ink">{item.title}</h3>
                    <p className="text-xs text-ds-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

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
