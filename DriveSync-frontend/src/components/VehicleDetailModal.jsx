import { Car, Fuel, Gauge, Luggage, MapPin, ShieldCheck, Snowflake, Users, X } from 'lucide-react';
import Button from './ui/Button';
import { formatMoney } from '../utils/format';

export default function VehicleDetailModal({ vehicle, onClose, onRentNow }) {
  if (!vehicle) return null;

  const available = vehicle.isAvailable !== false;

  const specs = [
    { icon: Users, label: 'Seats', value: `${vehicle.seats || 5} Passengers` },
    { icon: Luggage, label: 'Luggage', value: vehicle.luggageCapacity || '2 Large Bags' },
    { icon: Fuel, label: 'Fuel Type', value: vehicle.fuelType || 'Petrol' },
    { icon: Gauge, label: 'Transmission', value: vehicle.transmission || 'Automatic' },
    { icon: Snowflake, label: 'Air Conditioning', value: vehicle.hasAC !== false ? 'Full AC' : 'Non-AC' },
    { icon: ShieldCheck, label: 'Mileage Limit', value: vehicle.mileageLimit || '150 km / day' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ds-navy/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ds-animate-in">
        {/* Top Banner / Image */}
        <div className="relative h-48 bg-gradient-to-br from-ds-navy via-ds-royal to-ds-sky flex items-center justify-center overflow-hidden">
          {vehicle.imageUrl ? (
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-white/90">
              <Car className="h-16 w-16 mb-2 opacity-90" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-75">
                {vehicle.category} &bull; {vehicle.year}
              </span>
            </div>
          )}

          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow ${
              available
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {available ? 'Available' : 'Currently Rented'}
          </span>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-ds-ink">
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ds-muted">
                <MapPin className="h-4 w-4 text-ds-royal" />
                Pickup Location: <strong className="text-ds-ink">{vehicle.location}</strong> &bull; {vehicle.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-ds-muted">Daily Rental Rate</p>
              <p className="text-2xl font-extrabold text-ds-royal">
                {formatMoney(vehicle.dailyRate)}
                <span className="text-xs font-normal text-ds-muted"> / day</span>
              </p>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-ds-surface p-3 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-ds-royal shadow-2xs">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-ds-muted">{label}</p>
                  <p className="truncate text-xs font-bold text-ds-ink">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rental Terms */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-ds-muted space-y-1">
            <p className="font-bold text-ds-ink">Rental Terms & Highlights</p>
            <p>&bull; Refundable security deposit applies at checkout. Valid driving license required.</p>
            <p>&bull; Free cancellation while booking is in Pending status.</p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              disabled={!available}
              onClick={() => {
                onClose();
                onRentNow(vehicle);
              }}
            >
              {available ? 'Rent Now' : 'Currently Unavailable'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
