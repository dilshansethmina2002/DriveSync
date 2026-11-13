// =============================================================
//  Payment business logic
//
//  Controllers stay "thin" (read request -> call service -> send response).
//  ALL rules about money live here, so they are easy to find and test.
// =============================================================
import Payment from '../models/Payment.js';
import AppError from '../utils/AppError.js';
import config from '../config/env.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { generatePaymentId, generateReceiptNumber } from '../utils/generateId.js';
import * as gateway from './paymentGateway.js';
import * as bookingClient from './bookingClient.js';

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
const isAdmin = (user) => user?.role?.toLowerCase() === 'admin';
const isService = (user) => user?.role === 'Service';
const isPrivileged = (user) => isAdmin(user) || isService(user);

/** A customer may only see / pay their own payments. Admins and services see everything. */
const assertCanAccess = (user, customerId) => {
  if (isPrivileged(user)) return;
  if (String(user.id) !== String(customerId)) {
    throw new AppError('You are not allowed to access payments of another customer', 403);
  }
};

/** Generic paginated search used by every "list" endpoint */
const findPaginated = async (filter, query) => {
  const { page, limit, skip } = getPagination(query);

  // Run the two queries at the same time (faster than one after another)
  const [payments, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments(filter),
  ]);

  return { payments, pagination: buildPaginationMeta(page, limit, total) };
};

/** Optional filters shared by list endpoints: ?status=Successful&type=Security Deposit */
const applyListFilters = (filter, query) => {
  if (query.status) filter.paymentStatus = String(query.status);
  if (query.type) filter.paymentType = String(query.type);
  return filter;
};

// -------------------------------------------------------------
// 1. Process a payment (rental payment OR security deposit)
// -------------------------------------------------------------
export const processPayment = async (data, user) => {
  // Customers pay for themselves. If they do not send customerId we use the one in their token.
  const customerId = data.customerId || user.id;
  assertCanAccess(user, customerId);

  // (a) Optionally verify the booking with the Booking Service (REST call, not DB access)
  if (config.verifyBooking) {
    const booking = await bookingClient.getBooking(data.bookingId, customerId);
    if (!booking) {
      throw new AppError('Booking not found for this customer', 404);
    }
    if (String(booking.vehicleId) !== String(data.vehicleId)) {
      throw new AppError('vehicleId does not match the booking', 400);
    }
    if (['Cancelled', 'Completed'].includes(booking.status)) {
      throw new AppError(`Cannot pay for a booking that is ${booking.status}`, 409);
    }
    // The rental payment must equal the booking total calculated by the Booking Service
    if (data.paymentType === 'Rental Payment' && Number(booking.totalPrice) !== Number(data.amount)) {
      throw new AppError(`Amount must equal the booking total (${booking.totalPrice})`, 400);
    }
  }

  // (b) Prevent double charging: only ONE successful payment of each type per booking
  const alreadyPaid = await Payment.findOne({
    bookingId: data.bookingId,
    paymentType: data.paymentType,
    paymentStatus: 'Successful',
  });
  if (alreadyPaid) {
    throw new AppError(
      `A successful ${data.paymentType} already exists for this booking (${alreadyPaid.paymentId})`,
      409
    );
  }

  // (c) Record the transaction FIRST as "Pending".
  //     If the server crashes while talking to the gateway, we still have a record.
  const payment = await Payment.create({
    paymentId: generatePaymentId(),
    bookingId: data.bookingId,
    customerId,
    vehicleId: data.vehicleId,
    amount: data.amount,
    currency: data.currency || config.defaultCurrency,
    paymentMethod: data.paymentMethod,
    paymentType: data.paymentType,
    description: data.description,
    paymentStatus: 'Pending',
    statusHistory: [{ status: 'Pending', note: 'Payment created' }],
  });

  // (d) Cash is paid at the counter: it stays Pending until an admin confirms it.
  if (data.paymentMethod === 'Cash') {
    return payment;
  }

  // (e) Ask the (simulated) gateway to charge the customer
  const result = await gateway.chargePayment({
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    simulateFailure: data.simulateFailure === true,
  });

  if (result.approved) {
    markSuccessful(payment, result.transactionReference, result.message);
  } else {
    payment.paymentStatus = 'Failed';
    payment.failureReason = result.message;
    payment.statusHistory.push({ status: 'Failed', note: result.message });
  }
  await payment.save();

  // (f) Let the Booking Service know the rental is paid (best effort, does not block)
  if (payment.paymentStatus === 'Successful' && payment.paymentType === 'Rental Payment' && config.notifyBookingOnPayment) {
    await bookingClient.confirmBooking(payment.bookingId);
  }

  return payment;
};

/** Sets every field that belongs to a successful payment (used in 2 places) */
const markSuccessful = (payment, transactionReference, note) => {
  payment.paymentStatus = 'Successful';
  payment.transactionReference = transactionReference;
  payment.receiptNumber = generateReceiptNumber();
  payment.paymentDate = new Date();
  payment.failureReason = null;
  payment.statusHistory.push({ status: 'Successful', note });
};

// -------------------------------------------------------------
// 2. Read payments
// -------------------------------------------------------------
export const getPaymentById = async (paymentId, user) => {
  const payment = await Payment.findOne({ paymentId });
  if (!payment) {
    throw new AppError(`Payment ${paymentId} not found`, 404);
  }
  assertCanAccess(user, payment.customerId);
  return payment;
};

export const getPaymentsByBooking = async (bookingId, query, user) => {
  const filter = applyListFilters({ bookingId }, query);
  // A customer can only see their own payments for this booking
  if (!isPrivileged(user)) filter.customerId = String(user.id);
  return findPaginated(filter, query);
};

export const getPaymentsByCustomer = async (customerId, query, user) => {
  assertCanAccess(user, customerId);
  return findPaginated(applyListFilters({ customerId }, query), query);
};

export const getAllPayments = async (query) => findPaginated(applyListFilters({}, query), query);

/** Totals for one booking: how much was paid, held as deposit, refunded */
export const getBookingSummary = async (bookingId, user) => {
  const filter = { bookingId };
  if (!isPrivileged(user)) filter.customerId = String(user.id);
  const payments = await Payment.find(filter);

  const sum = (type, status) =>
    payments.filter((p) => p.paymentType === type && p.paymentStatus === status).reduce((total, p) => total + p.amount, 0);
  const refunded = payments.reduce((total, p) => total + (p.refund?.refundAmount || 0), 0);

  return {
    bookingId,
    rentalPaid: sum('Rental Payment', 'Successful') > 0,
    depositPaid: sum('Security Deposit', 'Successful') > 0,
    totalRentalPaid: sum('Rental Payment', 'Successful'),
    depositHeld: sum('Security Deposit', 'Successful'),
    totalRefunded: refunded,
    pendingPayments: payments.filter((p) => p.paymentStatus === 'Pending').length,
    numberOfTransactions: payments.length,
  };
};

// -------------------------------------------------------------
// 3. Update payment status (admin) - validated transitions
// -------------------------------------------------------------
// Which status can move to which. Anything else is rejected.
// "Refunded" is NOT allowed here - it must go through the refund endpoint.
const ALLOWED_TRANSITIONS = {
  Pending: ['Successful', 'Failed'],
  Failed: [],
  Successful: [],
  Refunded: [],
};

export const updatePaymentStatus = async (paymentId, { status, note }) => {
  const payment = await Payment.findOne({ paymentId });
  if (!payment) throw new AppError(`Payment ${paymentId} not found`, 404);

  const allowed = ALLOWED_TRANSITIONS[payment.paymentStatus];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Invalid status change: ${payment.paymentStatus} -> ${status}. Allowed: ${allowed.join(', ') || 'none'}`,
      409
    );
  }

  if (status === 'Successful') {
    // Same double-charge rule as processPayment
    const duplicate = await Payment.findOne({
      bookingId: payment.bookingId,
      paymentType: payment.paymentType,
      paymentStatus: 'Successful',
    });
    if (duplicate) {
      throw new AppError(`A successful ${payment.paymentType} already exists for this booking (${duplicate.paymentId})`, 409);
    }
    // Manual confirmation (e.g. cash received at the counter)
    markSuccessful(payment, `MANUAL-${Date.now()}`, note || 'Confirmed manually by admin');
  } else {
    payment.paymentStatus = 'Failed';
    payment.failureReason = note || 'Marked as failed by admin';
    payment.statusHistory.push({ status: 'Failed', note: payment.failureReason });
  }

  await payment.save();
  return payment;
};

// -------------------------------------------------------------
// 4. Refunds (full or partial, e.g. deposit minus damage charges)
// -------------------------------------------------------------
export const refund = async (paymentId, { refundAmount, refundReason }, user) => {
  const payment = await Payment.findOne({ paymentId });
  if (!payment) throw new AppError(`Payment ${paymentId} not found`, 404);

  if (payment.paymentStatus === 'Refunded') {
    throw new AppError('This payment has already been refunded', 409);
  }
  if (payment.paymentStatus !== 'Successful') {
    throw new AppError(`Only Successful payments can be refunded (current status: ${payment.paymentStatus})`, 409);
  }

  // No amount = full refund
  const amountToRefund = refundAmount ?? payment.amount;
  if (amountToRefund > payment.amount) {
    throw new AppError(`Refund amount (${amountToRefund}) cannot be more than the paid amount (${payment.amount})`, 400);
  }

  const result = await gateway.refundPayment({ amount: amountToRefund });

  payment.paymentStatus = 'Refunded';
  payment.refund = {
    refundAmount: amountToRefund,
    refundReason: refundReason || 'No reason given',
    refundReference: result.refundReference,
    refundDate: new Date(),
    refundedBy: String(user.id),
  };
  payment.statusHistory.push({
    status: 'Refunded',
    note: `${amountToRefund === payment.amount ? 'Full' : 'Partial'} refund of ${amountToRefund}`,
  });

  await payment.save();
  return payment;
};

// -------------------------------------------------------------
// 5. Digital receipt
// -------------------------------------------------------------
export const generateReceipt = async (paymentId, user) => {
  const payment = await getPaymentById(paymentId, user); // includes the ownership check

  if (!payment.receiptNumber) {
    throw new AppError(`No receipt available: payment status is ${payment.paymentStatus}`, 409);
  }

  return {
    receiptNumber: payment.receiptNumber,
    issuedBy: 'DriveSync - Online Vehicle Rental Management System',
    issuedAt: new Date().toISOString(),
    payment: {
      paymentId: payment.paymentId,
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      transactionReference: payment.transactionReference,
      paymentDate: payment.paymentDate,
    },
    booking: {
      bookingId: payment.bookingId,
      customerId: payment.customerId,
      vehicleId: payment.vehicleId,
    },
    amount: {
      currency: payment.currency,
      paid: payment.amount,
      refunded: payment.refund?.refundAmount || 0,
      net: Math.round((payment.amount - (payment.refund?.refundAmount || 0)) * 100) / 100,
    },
    refund: payment.refund || null,
    note: 'This is a computer-generated receipt from a simulated payment gateway.',
  };
};
