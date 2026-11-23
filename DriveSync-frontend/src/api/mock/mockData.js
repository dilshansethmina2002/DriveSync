// =============================================================
//  SAMPLE DATA for mock mode (fictional - not from the database)
// =============================================================
import { daysAgo, daysAhead } from './mockUtils';

export const MOCK_CUSTOMER_ID = '6650a1b2c3d4e5f6000000c1';

export const mockCatalogVehicles = [
  { _id: '6650a1b2c3d4e5f6000000a1', brand: 'Toyota', model: 'Prius', year: 2022, category: 'Hybrid', dailyRate: 9500, location: 'Colombo' },
  { _id: '6650a1b2c3d4e5f6000000a2', brand: 'Honda', model: 'Vezel', year: 2021, category: 'SUV', dailyRate: 12500, location: 'Kandy' },
  { _id: '6650a1b2c3d4e5f6000000a3', brand: 'Suzuki', model: 'Wagon R', year: 2020, category: 'Hatchback', dailyRate: 6500, location: 'Galle' },
  { _id: '6650a1b2c3d4e5f6000000a4', brand: 'Nissan', model: 'Leaf', year: 2023, category: 'Electric', dailyRate: 11000, location: 'Colombo' },
  { _id: '6650a1b2c3d4e5f6000000a5', brand: 'Toyota', model: 'KDH Van', year: 2019, category: 'Van', dailyRate: 18000, location: 'Negombo' },
  { _id: '6650a1b2c3d4e5f6000000a6', brand: 'Mitsubishi', model: 'Montero', year: 2018, category: 'SUV', dailyRate: 22000, location: 'Colombo' },
];

const history = (to, reason, at) => [{ from: null, to, reason, changedBy: 'admin', changedAt: at }];

export const mockVehicles = [
  { vehicleId: '6650a1b2c3d4e5f6000000a1', vehicleName: 'Toyota Prius 2022', registrationNumber: 'CAB-1234', currentStatus: 'Available', condition: 'Excellent', mileage: 15420, lastMaintenanceDate: daysAgo(40), nextMaintenanceDate: daysAhead(50) },
  { vehicleId: '6650a1b2c3d4e5f6000000a2', vehicleName: 'Honda Vezel 2021', registrationNumber: 'CBK-7781', currentStatus: 'Rented', condition: 'Good', mileage: 38210, lastMaintenanceDate: daysAgo(70), nextMaintenanceDate: daysAhead(20) },
  { vehicleId: '6650a1b2c3d4e5f6000000a3', vehicleName: 'Suzuki Wagon R 2020', registrationNumber: 'KV-4521', currentStatus: 'Under Maintenance', condition: 'Damaged', mileage: 61200, lastMaintenanceDate: daysAgo(120), nextMaintenanceDate: daysAgo(30) },
  { vehicleId: '6650a1b2c3d4e5f6000000a4', vehicleName: 'Nissan Leaf 2023', registrationNumber: 'CBN-3300', currentStatus: 'Available', condition: 'Good', mileage: 9800, lastMaintenanceDate: daysAgo(15), nextMaintenanceDate: daysAhead(75) },
  { vehicleId: '6650a1b2c3d4e5f6000000a5', vehicleName: 'Toyota KDH Van 2019', registrationNumber: 'NC-9087', currentStatus: 'Rented', condition: 'Fair', mileage: 142300, lastMaintenanceDate: daysAgo(95), nextMaintenanceDate: daysAgo(5) },
  { vehicleId: '6650a1b2c3d4e5f6000000a6', vehicleName: 'Mitsubishi Montero 2018', registrationNumber: 'WP KA-5562', currentStatus: 'Inactive', condition: 'Poor', mileage: 188900, lastMaintenanceDate: daysAgo(200), nextMaintenanceDate: null },
].map((v, i) => ({
  _id: `mockvehicle${i}`,
  maintenanceHistory: [],
  lastReturn: null,
  statusHistory: history(v.currentStatus, 'Registered in fleet', daysAgo(300 - i * 20)),
  createdAt: daysAgo(300 - i * 20),
  updatedAt: daysAgo(i),
  ...v,
}));

export const mockMaintenance = [
  { maintenanceId: 'MNT-20261020-1A2B3C4D', vehicleId: '6650a1b2c3d4e5f6000000a3', maintenanceType: 'Repair', description: 'Front bumper and headlight replacement after minor collision', status: 'In Progress', cost: 0, serviceProvider: 'AutoCare Colombo', startDate: daysAgo(3), completedDate: null, relatedBookingId: '6650a1b2c3d4e5f601234560' },
  { maintenanceId: 'MNT-20261003-5E6F7A8B', vehicleId: '6650a1b2c3d4e5f6000000a1', maintenanceType: 'Routine Service', description: '15,000 km service - oil, filters, brake check', status: 'Completed', cost: 14500, serviceProvider: 'Toyota Lanka', startDate: daysAgo(41), completedDate: daysAgo(40) },
  { maintenanceId: 'MNT-20260915-9C0D1E2F', vehicleId: '6650a1b2c3d4e5f6000000a4', maintenanceType: 'Inspection', description: 'Battery health inspection', status: 'Completed', cost: 6000, serviceProvider: 'EV Care Lanka', startDate: daysAgo(16), completedDate: daysAgo(15) },
  { maintenanceId: 'MNT-20260820-3A4B5C6D', vehicleId: '6650a1b2c3d4e5f6000000a2', maintenanceType: 'Tyre Replacement', description: 'Replaced all four tyres', status: 'Completed', cost: 72000, serviceProvider: 'DSI Tyres', startDate: daysAgo(71), completedDate: daysAgo(70) },
  { maintenanceId: 'MNT-20260710-7E8F9A0B', vehicleId: '6650a1b2c3d4e5f6000000a5', maintenanceType: 'Oil Change', description: 'Engine oil and filter change', status: 'Completed', cost: 11800, serviceProvider: 'Quick Lube Negombo', startDate: daysAgo(96), completedDate: daysAgo(95) },
].map((m, i) => ({ _id: `mockmnt${i}`, mileageAtService: 0, performedBy: 'admin', createdAt: m.startDate, updatedAt: m.completedDate || m.startDate, ...m }));

// Payments spread over the last 6 months so the charts have data
const P = (n, daysBack, bookingId, customerId, vehicleId, amount, type, method, status, extra = {}) => {
  const date = daysAgo(daysBack);
  const ok = status === 'Successful' || status === 'Refunded';
  return {
    paymentId: `PAY-${date.slice(0, 10).replace(/-/g, '')}-${(0xa1b2c300 + n).toString(16).toUpperCase()}`,
    bookingId,
    customerId,
    vehicleId,
    amount,
    currency: 'LKR',
    paymentMethod: method,
    paymentType: type,
    paymentStatus: status,
    transactionReference: ok ? `TXN-${Date.parse(date)}-${n}A${n}` : null,
    receiptNumber: ok ? `RCPT-${date.slice(0, 10).replace(/-/g, '')}-${(0xbeef0000 + n).toString(16).toUpperCase()}` : undefined,
    paymentDate: date,
    description: type === 'Rental Payment' ? 'Vehicle rental' : 'Refundable security deposit',
    failureReason: status === 'Failed' ? 'Payment declined by the simulated gateway' : null,
    refund: null,
    statusHistory: [{ status: 'Pending', changedAt: date, note: 'Payment created' }, ...(status !== 'Pending' ? [{ status, changedAt: date, note: `${method} payment ${status.toLowerCase()}` }] : [])],
    createdAt: date,
    updatedAt: date,
    ...extra,
  };
};

const C1 = MOCK_CUSTOMER_ID;
const C2 = '6650a1b2c3d4e5f6000000c2';
const C3 = '6650a1b2c3d4e5f6000000c3';

export const mockPayments = [
  P(1, 160, '6650a1b2c3d4e5f601230001', C2, '6650a1b2c3d4e5f6000000a2', 37500, 'Rental Payment', 'Credit Card', 'Successful'),
  P(2, 160, '6650a1b2c3d4e5f601230001', C2, '6650a1b2c3d4e5f6000000a2', 5000, 'Security Deposit', 'Credit Card', 'Refunded', { refund: { refundAmount: 5000, refundReason: 'Vehicle returned in good condition', refundReference: 'RFND-1-AAA', refundDate: daysAgo(155), refundedBy: 'admin' } }),
  P(3, 130, '6650a1b2c3d4e5f601230002', C3, '6650a1b2c3d4e5f6000000a5', 72000, 'Rental Payment', 'Bank Transfer', 'Successful'),
  P(4, 128, '6650a1b2c3d4e5f601230003', C1, '6650a1b2c3d4e5f6000000a1', 28500, 'Rental Payment', 'Debit Card', 'Failed'),
  P(5, 127, '6650a1b2c3d4e5f601230003', C1, '6650a1b2c3d4e5f6000000a1', 28500, 'Rental Payment', 'Online Wallet', 'Successful'),
  P(6, 95, '6650a1b2c3d4e5f601230004', C2, '6650a1b2c3d4e5f6000000a4', 44000, 'Rental Payment', 'Credit Card', 'Successful'),
  P(7, 95, '6650a1b2c3d4e5f601230004', C2, '6650a1b2c3d4e5f6000000a4', 5000, 'Security Deposit', 'Credit Card', 'Refunded', { refund: { refundAmount: 3500, refundReason: 'Deposit returned minus 1,500 cleaning fee', refundReference: 'RFND-2-BBB', refundDate: daysAgo(88), refundedBy: 'admin' } }),
  P(8, 64, '6650a1b2c3d4e5f601230005', C3, '6650a1b2c3d4e5f6000000a6', 66000, 'Rental Payment', 'Credit Card', 'Successful'),
  P(9, 60, '6650a1b2c3d4e5f601230006', C1, '6650a1b2c3d4e5f6000000a3', 19500, 'Rental Payment', 'Credit Card', 'Successful'),
  P(10, 60, '6650a1b2c3d4e5f601230006', C1, '6650a1b2c3d4e5f6000000a3', 5000, 'Security Deposit', 'Credit Card', 'Successful'),
  P(11, 33, '6650a1b2c3d4e5f601230007', C2, '6650a1b2c3d4e5f6000000a2', 50000, 'Rental Payment', 'Online Wallet', 'Successful'),
  P(12, 33, '6650a1b2c3d4e5f601230007', C2, '6650a1b2c3d4e5f6000000a2', 5000, 'Security Deposit', 'Online Wallet', 'Successful'),
  P(13, 12, '6650a1b2c3d4e5f601230008', C3, '6650a1b2c3d4e5f6000000a5', 90000, 'Rental Payment', 'Bank Transfer', 'Successful'),
  P(14, 12, '6650a1b2c3d4e5f601230008', C3, '6650a1b2c3d4e5f6000000a5', 5000, 'Security Deposit', 'Bank Transfer', 'Successful'),
  P(15, 4, '6650a1b2c3d4e5f601230009', C1, '6650a1b2c3d4e5f6000000a4', 33000, 'Rental Payment', 'Cash', 'Pending'),
  P(16, 2, '6650a1b2c3d4e5f601230010', C2, '6650a1b2c3d4e5f6000000a1', 19000, 'Rental Payment', 'Debit Card', 'Failed'),
  P(17, 1, '6650a1b2c3d4e5f601230011', C3, '6650a1b2c3d4e5f6000000a4', 22000, 'Rental Payment', 'Credit Card', 'Successful'),
].map((p, i) => ({ ...p, _id: `mockpay${i}` }));

/** Bookings for the logged-in customer (Member 2's Booking Service shape) */
export const buildMockBookings = (userId) => [
  { _id: '6650a1b2c3d4e5f601234567', userId, vehicleId: '6650a1b2c3d4e5f6000000a1', startDate: daysAhead(2), endDate: daysAhead(5), totalPrice: 28500, status: 'Pending' },
  { _id: '6650a1b2c3d4e5f601234568', userId, vehicleId: '6650a1b2c3d4e5f6000000a4', startDate: daysAhead(10), endDate: daysAhead(12), totalPrice: 22000, status: 'Pending' },
  { _id: '6650a1b2c3d4e5f601230009', userId, vehicleId: '6650a1b2c3d4e5f6000000a4', startDate: daysAhead(1), endDate: daysAhead(4), totalPrice: 33000, status: 'Pending' },
];
