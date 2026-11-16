// =============================================================
//  MOCK Payment Service - same rules as the real backend
//  (only used when VITE_USE_MOCK=true)
// =============================================================
import { mockPayments } from './mockData';
import { delay, mockError, paginate, upperHex, datePart, clone } from './mockUtils';
import { getUser, isAdmin } from '../../utils/auth';

const payments = clone(mockPayments); // in-memory "collection"

const ok = (data, extra = {}) => ({ success: true, data: clone(data), ...extra });
const find = (paymentId) => payments.find((p) => p.paymentId === paymentId) || mockError(404, `Payment ${paymentId} not found`);

const canAccess = (payment) => {
  const user = getUser();
  if (!isAdmin(user) && String(user?.id) !== String(payment.customerId)) {
    mockError(403, 'You are not allowed to access payments of another customer');
  }
};

const markSuccessful = (p, note) => {
  p.paymentStatus = 'Successful';
  p.transactionReference = `TXN-${Date.now()}-${upperHex(6)}`;
  p.receiptNumber = `RCPT-${datePart()}-${upperHex()}`;
  p.paymentDate = new Date().toISOString();
  p.failureReason = null;
  p.statusHistory.push({ status: 'Successful', changedAt: new Date().toISOString(), note });
};

export const createPayment = async (payload) => {
  await delay(700);
  const user = getUser();
  const customerId = payload.customerId || user?.id;
  const duplicate = payments.find((p) => p.bookingId === payload.bookingId && p.paymentType === payload.paymentType && p.paymentStatus === 'Successful');
  if (duplicate) mockError(409, `A successful ${payload.paymentType} already exists for this booking (${duplicate.paymentId})`);

  const now = new Date().toISOString();
  const p = {
    _id: `mockpay${payments.length + 1}`,
    paymentId: `PAY-${datePart()}-${upperHex()}`,
    bookingId: payload.bookingId,
    customerId,
    vehicleId: payload.vehicleId,
    amount: Number(payload.amount),
    currency: payload.currency || 'LKR',
    paymentMethod: payload.paymentMethod,
    paymentType: payload.paymentType,
    paymentStatus: 'Pending',
    transactionReference: null,
    paymentDate: now,
    description: payload.description,
    failureReason: null,
    refund: null,
    statusHistory: [{ status: 'Pending', changedAt: now, note: 'Payment created' }],
    createdAt: now,
    updatedAt: now,
  };
  payments.unshift(p);

  if (payload.paymentMethod === 'Cash') return ok(p, { message: 'Payment recorded and awaiting confirmation' });
  if (payload.simulateFailure) {
    p.paymentStatus = 'Failed';
    p.failureReason = 'Payment declined by the simulated gateway (simulateFailure = true)';
    p.statusHistory.push({ status: 'Failed', changedAt: now, note: p.failureReason });
    mockError(402, `Payment failed: ${p.failureReason}`);
  }
  markSuccessful(p, `${p.paymentMethod} payment approved`);
  return ok(p, { message: 'Payment processed successfully' });
};

export const getPayment = async (paymentId) => {
  await delay();
  const p = find(paymentId);
  canAccess(p);
  return ok(p);
};

export const listPayments = async (params = {}) => {
  await delay();
  const user = getUser();
  let rows = payments;
  if (!isAdmin(user)) rows = rows.filter((p) => p.customerId === String(user?.id));
  if (params.customerId) rows = rows.filter((p) => p.customerId === params.customerId);
  if (params.bookingId) rows = rows.filter((p) => p.bookingId === params.bookingId);
  if (params.status) rows = rows.filter((p) => p.paymentStatus === params.status);
  if (params.type) rows = rows.filter((p) => p.paymentType === params.type);
  if (params.method) rows = rows.filter((p) => p.paymentMethod === params.method);
  if (params.search) {
    const s = params.search.toLowerCase();
    rows = rows.filter((p) => [p.paymentId, p.bookingId, p.customerId, p.receiptNumber].some((v) => v?.toLowerCase().includes(s)));
  }
  rows = [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const { data, pagination } = paginate(rows, params);
  return ok(data, { count: data.length, pagination });
};

export const getBookingSummary = async (bookingId) => {
  await delay(200);
  const rows = payments.filter((p) => p.bookingId === bookingId);
  const sum = (type, status) => rows.filter((p) => p.paymentType === type && p.paymentStatus === status).reduce((t, p) => t + p.amount, 0);
  return ok({
    bookingId,
    rentalPaid: sum('Rental Payment', 'Successful') > 0,
    depositPaid: sum('Security Deposit', 'Successful') > 0,
    totalRentalPaid: sum('Rental Payment', 'Successful'),
    depositHeld: sum('Security Deposit', 'Successful'),
    totalRefunded: rows.reduce((t, p) => t + (p.refund?.refundAmount || 0), 0),
    pendingPayments: rows.filter((p) => p.paymentStatus === 'Pending').length,
    numberOfTransactions: rows.length,
  });
};

export const getPaymentStats = async () => {
  await delay();
  const collected = payments.filter((p) => ['Successful', 'Refunded'].includes(p.paymentStatus));
  const gross = collected.reduce((t, p) => t + p.amount, 0);
  const refunded = collected.reduce((t, p) => t + (p.refund?.refundAmount || 0), 0);
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const inMonth = collected.filter((p) => p.paymentDate.slice(0, 7) === key);
    months.push({
      month: key,
      revenue: inMonth.reduce((t, p) => t + p.amount - (p.refund?.refundAmount || 0), 0),
      rental: inMonth.filter((p) => p.paymentType === 'Rental Payment').reduce((t, p) => t + p.amount, 0),
      deposits: inMonth.filter((p) => p.paymentType === 'Security Deposit').reduce((t, p) => t + p.amount, 0),
    });
  }
  const methods = {};
  collected.forEach((p) => {
    methods[p.paymentMethod] = (methods[p.paymentMethod] || 0) + 1;
  });
  const rental = collected.filter((p) => p.paymentType === 'Rental Payment');
  return ok({
    totalPayments: payments.length,
    grossCollected: gross,
    totalRefunded: refunded,
    netRevenue: gross - refunded,
    rentalRevenue: rental.reduce((t, p) => t + p.amount - (p.refund?.refundAmount || 0), 0),
    depositsHeld: payments.filter((p) => p.paymentType === 'Security Deposit' && p.paymentStatus === 'Successful').reduce((t, p) => t + p.amount, 0),
    totalDepositsCollected: collected.filter((p) => p.paymentType === 'Security Deposit').reduce((t, p) => t + p.amount, 0),
    statusBreakdown: ['Successful', 'Pending', 'Failed', 'Refunded'].map((status) => {
      const rows = payments.filter((p) => p.paymentStatus === status);
      return { status, count: rows.length, amount: rows.reduce((t, p) => t + p.amount, 0) };
    }),
    methodBreakdown: Object.entries(methods).map(([method, count]) => ({ method, count })).sort((a, b) => b.count - a.count),
    monthlyRevenue: months,
    recentTransactions: [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
  });
};

export const updatePaymentStatus = async (paymentId, { status, note }) => {
  await delay(500);
  const p = find(paymentId);
  if (p.paymentStatus !== 'Pending') mockError(409, `Invalid status change: ${p.paymentStatus} -> ${status}. Allowed: none`);
  if (status === 'Successful') markSuccessful(p, note || 'Confirmed manually by admin');
  else {
    p.paymentStatus = 'Failed';
    p.failureReason = note || 'Marked as failed by admin';
    p.statusHistory.push({ status: 'Failed', changedAt: new Date().toISOString(), note: p.failureReason });
  }
  return ok(p, { message: `Payment marked as ${p.paymentStatus}` });
};

export const refundPayment = async (paymentId, { refundAmount, refundReason }) => {
  await delay(700);
  const p = find(paymentId);
  if (p.paymentStatus === 'Refunded') mockError(409, 'This payment has already been refunded');
  if (p.paymentStatus !== 'Successful') mockError(409, `Only Successful payments can be refunded (current status: ${p.paymentStatus})`);
  const amount = refundAmount ?? p.amount;
  if (amount > p.amount) mockError(400, `Refund amount (${amount}) cannot be more than the paid amount (${p.amount})`);
  p.paymentStatus = 'Refunded';
  p.refund = { refundAmount: amount, refundReason: refundReason || 'No reason given', refundReference: `RFND-${Date.now()}-${upperHex(6)}`, refundDate: new Date().toISOString(), refundedBy: getUser()?.id };
  p.statusHistory.push({ status: 'Refunded', changedAt: new Date().toISOString(), note: `${amount === p.amount ? 'Full' : 'Partial'} refund of ${amount}` });
  return ok(p, { message: 'Refund processed successfully' });
};

export const getReceipt = async (paymentId) => {
  await delay();
  const p = find(paymentId);
  canAccess(p);
  if (!p.receiptNumber) mockError(409, `No receipt available: payment status is ${p.paymentStatus}`);
  const refundedAmount = p.refund?.refundAmount || 0;
  return ok({
    receiptNumber: p.receiptNumber,
    issuedBy: 'DriveSync - Online Vehicle Rental Management System',
    issuedAt: new Date().toISOString(),
    payment: { paymentId: p.paymentId, paymentType: p.paymentType, paymentMethod: p.paymentMethod, paymentStatus: p.paymentStatus, transactionReference: p.transactionReference, paymentDate: p.paymentDate },
    booking: { bookingId: p.bookingId, customerId: p.customerId, vehicleId: p.vehicleId },
    amount: { currency: p.currency, paid: p.amount, refunded: refundedAmount, net: p.amount - refundedAmount },
    refund: p.refund,
    note: 'This is a computer-generated receipt from a simulated payment gateway.',
  });
};
