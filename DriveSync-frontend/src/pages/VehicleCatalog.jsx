import React, { useState, useEffect } from 'react';
import { Car, MapPin, Search, RefreshCw } from 'lucide-react';
import apiClient from '../api/apiClient';
import BookingModal from '../components/BookingModal';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/States';
import { formatMoney } from '../utils/format';

const VehicleCatalog = () => {
    const [vehicles, setVehicles] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        maxPrice: '',
    });
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const params = { isAvailable: true };
            if (filters.category) params.category = filters.category;
            if (filters.location) params.location = filters.location;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;

            const res = await apiClient.get('/catalog', { params });
            setVehicles(res.data?.data || []);
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
        fetchVehicles();
    };

    const handleReset = () => {
        setFilters({ category: '', location: '', maxPrice: '' });
        setTimeout(() => fetchVehicles(), 0);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Browse Vehicles"
                subtitle="Search available fleet vehicles by category, pickup location, and daily rate."
                actions={
                    <Button variant="secondary" size="sm" onClick={fetchVehicles} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                }
            />

            {/* Filter Card */}
            <Card className="p-4 sm:p-5 bg-gradient-to-r from-ds-navy to-ds-royal text-white border-none">
                <form
                    onSubmit={handleSearch}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center"
                >
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

                    <input
                        type="text"
                        name="location"
                        placeholder="Pickup Location (e.g., Colombo)"
                        value={filters.location}
                        onChange={handleFilterChange}
                        className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-ds-ink placeholder-ds-muted outline-none focus:ring-2 focus:ring-ds-cyan"
                    />

                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max Daily Rate (LKR)"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-ds-ink placeholder-ds-muted outline-none focus:ring-2 focus:ring-ds-cyan"
                    />

                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-ds-cyan text-ds-navy hover:bg-white font-bold">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                        {(filters.category || filters.location || filters.maxPrice) && (
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
                    <Spinner label="Loading available vehicles..." />
                </Card>
            ) : vehicles.length === 0 ? (
                <Card className="p-10">
                    <EmptyState
                        icon={Car}
                        title="No vehicles available"
                        description="Try clearing your search filters or check back later."
                        action={
                            <Button variant="secondary" onClick={handleReset}>
                                Show All Vehicles
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {vehicles.map((vehicle) => (
                        <Card
                            key={vehicle._id}
                            className="p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-ds-royal">
                                        {vehicle.category}
                                    </span>
                                    <span className="text-xs font-medium text-ds-muted">
                                        {vehicle.year}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-ds-ink">
                                    {vehicle.brand} {vehicle.model}
                                </h3>
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-ds-muted">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {vehicle.location}
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <div>
                                    <span className="text-lg font-extrabold text-ds-ink">
                                        {formatMoney(vehicle.dailyRate)}
                                    </span>
                                    <span className="text-xs text-ds-muted"> / day</span>
                                </div>

                                <Button size="sm" onClick={() => setSelectedVehicle(vehicle)}>
                                    Book Now
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reservation Modal */}
            {selectedVehicle && (
                <BookingModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </div>
    );
};

export default VehicleCatalog;
