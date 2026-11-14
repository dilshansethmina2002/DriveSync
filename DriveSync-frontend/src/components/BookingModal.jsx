import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const BookingModal = ({ vehicle, onClose }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusMessage, setStatusMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Calculate total days and price
    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays * vehicle.dailyRate : 0;
    };

    const totalPrice = calculateTotal();

    const handleBooking = async (e) => {
        e.preventDefault();
        setStatusMessage(null);
        setSubmitting(true);

        try {
            // Replace with actual logged-in userId from Member 1's Auth context/localStorage
            const mockUserId = localStorage.getItem('userId') || '65f1a2b3c4d5e6f7a8b9c0d1';

            await apiClient.post('/bookings', {
                userId: mockUserId,
                vehicleId: vehicle._id,
                startDate,
                endDate,
                totalPrice
            });

            setIsError(false);
            setStatusMessage('Reservation confirmed! Proceed to payment.');
        } catch (error) {
            setIsError(true);
            setStatusMessage(
                error.response?.data?.message || 'Unable to complete booking. Please check your dates.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 27, 117, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--bg-white)',
                borderRadius: '16px',
                maxWidth: '440px',
                width: '100%',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--text-dark)' }}>
                        Book {vehicle.brand} {vehicle.model}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        &times;
                    </button>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Daily Rate: <strong>${vehicle.dailyRate}</strong> &bull; Pickup: {vehicle.location}
                </p>

                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={modalInputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={modalInputStyle}
                        />
                    </div>

                    <div style={{
                        backgroundColor: 'var(--input-bg)',
                        padding: '1rem',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Estimated Total</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--bg-outer)' }}>
                            ${totalPrice}
                        </span>
                    </div>

                    {statusMessage && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            backgroundColor: isError ? '#fee2e2' : '#dcfce7',
                            color: isError ? '#b91c1c' : '#15803d'
                        }}>
                            {statusMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || totalPrice <= 0}
                        style={{
                            backgroundColor: totalPrice <= 0 ? 'var(--text-muted)' : 'var(--btn-primary)',
                            color: 'var(--bg-white)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.9rem',
                            fontWeight: '600',
                            cursor: totalPrice <= 0 ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        {submitting ? 'Checking Availability...' : 'Confirm Reservation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const modalInputStyle = {
    width: '100%',
    backgroundColor: 'var(--input-bg)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.8rem',
    color: 'var(--text-dark)',
    fontSize: '0.95rem'
};

export default BookingModal;