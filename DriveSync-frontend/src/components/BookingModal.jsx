import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Car, Clock, MapPin, Package, ShieldCheck, UserCheck, X } from 'lucide-react';
import apiClient from '../api/apiClient';
import Button from './ui/Button';
import { formatMoney } from '../utils/format';

const DRIVER_DAILY_FEE = 3500;

const BookingModal = ({ vehicle, onClose }) => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pickupTime, setPickupTime] = useState('09:00');
    const [returnTime, setReturnTime] = useState('18:00');
    const [pickupLocation, setPickupLocation] = useState(vehicle?.location || '');
    const [packages, setPackages] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [driverRequired, setDriverRequired] = useState(false);
    const [notes, setNotes] = useState('');

    const [statusMessage, setStatusMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createdBooking, setCreatedBooking] = useState(null);

    useEffect(() => {
        apiClient
            .get('/catalog/packages')
            .then((res) => setPackages(res.data?.data || []))
            .catch(() => setPackages([]));
    }, []);

    const selectedPackage = packages.find((p) => p._id === selectedPackageId) || null;

    const getDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const days = getDays();
    const baseRental = days * (vehicle?.dailyRate || 0);
    const driverCost = driverRequired ? days * DRIVER_DAILY_FEE : 0;
    const discountAmount = selectedPackage?.discountPercent
        ? Math.round((baseRental * selectedPackage.discountPercent) / 100)
        : 0;
    const packageFlatPrice = selectedPackage && !selectedPackage.discountPercent ? selectedPackage.price : 0;
    const totalPrice = days > 0 ? Math.max(0, baseRental - discountAmount + driverCost + packageFlatPrice) : 0;

    const handleBooking = async (e) => {
        e.preventDefault();
        setStatusMessage(null);
        setSubmitting(true);

        try {
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const actualUserId = currentUser?.id || currentUser?._id || localStorage.getItem('userId');

            if (!actualUserId) {
                setIsError(true);
                setStatusMessage('Please sign in before making a reservation.');
                return;
            }

            const res = await apiClient.post('/bookings', {
                userId: actualUserId,
                vehicleId: vehicle._id,
                startDate,
                endDate,
                pickupTime,
                returnTime,
                pickupLocation,
                packageId: selectedPackage?._id || null,
                packageName: selectedPackage?.name || '',
                driverRequired,
                notes,
                totalPrice,
            });

            const booking = res.data?.data;
            setCreatedBooking(booking);
            setIsError(false);
            setStatusMessage('Reservation confirmed! Proceed to payment to finalize your booking.');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ds-navy/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden ds-animate-in my-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-ds-navy to-ds-royal px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                            <Car className="h-5 w-5" />
                        </span>
                        <div>
                            <h3 className="text-base font-bold">
                                Book {vehicle.brand} {vehicle.model}
                            </h3>
                            <p className="text-xs text-blue-100">
                                {formatMoney(vehicle.dailyRate)} / day &bull; {vehicle.location}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close booking modal"
                        className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleBooking} className="p-6 space-y-4">
                    {/* Dates & Times */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                                <Calendar className="h-3.5 w-3.5 text-ds-royal" /> Pickup Date
                            </label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
                            />
                        </div>
                        <div>
                            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                                <Clock className="h-3.5 w-3.5 text-ds-royal" /> Pickup Time
                            </label>
                            <input
                                type="time"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
                            />
                        </div>
                        <div>
                            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                                <Calendar className="h-3.5 w-3.5 text-ds-royal" /> Return Date
                            </label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
                            />
                        </div>
                        <div>
                            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                                <Clock className="h-3.5 w-3.5 text-ds-royal" /> Return Time
                            </label>
                            <input
                                type="time"
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                                className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
                            />
                        </div>
                    </div>

                    {/* Pickup Location */}
                    <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                            <MapPin className="h-3.5 w-3.5 text-ds-royal" /> Pickup Location
                        </label>
                        <input
                            type="text"
                            required
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            placeholder="e.g., Colombo Airport / City Hub"
                            className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
                        />
                    </div>

                    {/* Optional Package & Driver Service */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                                <Package className="h-3.5 w-3.5 text-ds-royal" /> Rental Package (Optional)
                            </label>
                            <select
                                value={selectedPackageId}
                                onChange={(e) => setSelectedPackageId(e.target.value)}
                                className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
                            >
                                <option value="">Standard Daily Rate</option>
                                {packages.map((pkg) => (
                                    <option key={pkg._id} value={pkg._id}>
                                        {pkg.name} ({pkg.discountPercent ? `${pkg.discountPercent}% off` : formatMoney(pkg.price)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="flex items-center gap-2.5 rounded-xl bg-ds-surface px-3 py-2 text-xs font-semibold text-ds-ink cursor-pointer hover:bg-slate-200/60 transition">
                            <input
                                type="checkbox"
                                checked={driverRequired}
                                onChange={(e) => setDriverRequired(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-ds-royal focus:ring-ds-royal"
                            />
                            <span className="flex items-center gap-1">
                                <UserCheck className="h-3.5 w-3.5 text-ds-royal" />
                                Add Driver (+{formatMoney(DRIVER_DAILY_FEE)}/day)
                            </span>
                        </label>
                    </div>

                    {/* Price Summary */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1.5 text-xs">
                        <div className="flex justify-between text-ds-muted">
                            <span>Vehicle Rental ({days} {days === 1 ? 'day' : 'days'})</span>
                            <span className="font-semibold text-ds-ink">{formatMoney(baseRental)}</span>
                        </div>
                        {driverRequired && days > 0 && (
                            <div className="flex justify-between text-ds-muted">
                                <span>Professional Driver Service</span>
                                <span className="font-semibold text-ds-ink">+{formatMoney(driverCost)}</span>
                            </div>
                        )}
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-semibold">
                                <span>Package Discount ({selectedPackage?.discountPercent}%)</span>
                                <span>-{formatMoney(discountAmount)}</span>
                            </div>
                        )}
                        {packageFlatPrice > 0 && (
                            <div className="flex justify-between text-ds-muted">
                                <span>Package Add-on ({selectedPackage?.name})</span>
                                <span className="font-semibold text-ds-ink">+{formatMoney(packageFlatPrice)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-sm font-extrabold text-ds-navy">
                            <span>Estimated Total</span>
                            <span className="text-lg text-ds-royal">{formatMoney(totalPrice)}</span>
                        </div>
                    </div>

                    {statusMessage && (
                        <div
                            className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 ${
                                isError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                            {!isError && <ShieldCheck className="h-4 w-4 shrink-0" />}
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        {createdBooking ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate('/payments/checkout', {
                                        state: {
                                            bookingId: createdBooking._id,
                                            vehicleId: vehicle._id,
                                            totalPrice,
                                        },
                                    });
                                }}
                            >
                                Proceed to Payment &rarr;
                            </Button>
                        ) : (
                            <Button type="submit" disabled={submitting || totalPrice <= 0}>
                                {submitting ? 'Checking Availability...' : 'Confirm Reservation'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
