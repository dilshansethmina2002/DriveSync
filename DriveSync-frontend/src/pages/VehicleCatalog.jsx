import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import BookingModal from '../components/BookingModal';

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
            setVehicles(res.data.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
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

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--input-bg)' }}>
            {/* Top Navbar */}
            <header style={{
                backgroundColor: 'var(--bg-outer)',
                color: 'var(--bg-white)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                    Drive<span style={{ color: 'var(--brand-cyan)' }}>Sync</span>
                </h2>
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Fleet & Rental Catalog</span>
            </header>

            {/* Hero Filter Banner */}
            <div style={{
                backgroundColor: 'var(--bg-panel-blue)',
                padding: '2.5rem 2rem',
                color: 'var(--bg-white)'
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h1 style={{ marginBottom: '0.5rem' }}>Find Your Vehicle</h1>
                    <p style={{ color: '#dbe4ff', marginBottom: '1.5rem' }}>
                        Search available fleet vehicles by category, pickup location, and daily rate.
                    </p>

                    <form onSubmit={handleSearch} style={{
                        backgroundColor: 'var(--bg-white)',
                        padding: '1rem',
                        borderRadius: '12px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            style={inputStyle}
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
                            style={inputStyle}
                        />

                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max Daily Rate ($)"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            style={inputStyle}
                        />

                        <button type="submit" style={primaryBtnStyle}>
                            Search Fleet
                        </button>
                    </form>
                </div>
            </div>

            {/* Vehicle Grid */}
            <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 2rem' }}>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading available vehicles...</p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {vehicles.map((vehicle) => (
                            <div key={vehicle._id} style={{
                                backgroundColor: 'var(--bg-white)',
                                borderRadius: '14px',
                                padding: '1.5rem',
                                boxShadow: '0 4px 14px rgba(20, 38, 84, 0.06)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{
                                            backgroundColor: '#eef3fc',
                                            color: 'var(--link-blue)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            {vehicle.category}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {vehicle.year}
                                        </span>
                                    </div>

                                    <h3 style={{ color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                                        {vehicle.brand} {vehicle.model}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                                        Location: {vehicle.location}
                                    </p>
                                </div>

                                <div style={{
                                    borderTop: '1px solid var(--input-bg)',
                                    paddingTop: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                                            ${vehicle.dailyRate}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> / day</span>
                                    </div>

                                    <button
                                        onClick={() => setSelectedVehicle(vehicle)}
                                        style={primaryBtnStyle}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

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

const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: 'var(--text-dark)',
    fontSize: '0.95rem',
    outline: 'none'
};

const primaryBtnStyle = {
    backgroundColor: 'var(--btn-primary)',
    color: 'var(--bg-white)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem 1.25rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
};

export default VehicleCatalog;