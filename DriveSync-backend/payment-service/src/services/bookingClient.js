// =============================================================
//  Booking Service client (talks to Member 2's service over REST)
//
//  Microservice rule: we NEVER open drivesync_booking_db ourselves.
//  If we need booking data we ask the Booking Service's API.
//
//  Booking Service contract used here (from Member 2's code):
//    GET   /api/bookings/:id             -> { success, data: booking }
//    GET   /api/bookings?userId=<id>     -> { success, data: [booking, ...] }
//    PATCH /api/bookings/:id/status      body { status: "Confirmed" }
//  Booking fields: _id, userId, vehicleId, totalPrice, status
// =============================================================
import config from '../config/env.js';
import AppError from '../utils/AppError.js';

const TIMEOUT_MS = 5000;

// Headers sent on every internal call
const internalHeaders = () => ({
  'Content-Type': 'application/json',
  'x-service-key': config.serviceApiKey,
  'x-calling-service': 'payment-service',
});

/**
 * Fetch one booking from the Booking Service.
 * Attempts direct GET /api/bookings/:id first; falls back to list by userId.
 */
export const getBooking = async (bookingId, customerId) => {
  // 1. Try direct GET /api/bookings/:id (Member 2's endpoint)
  try {
    const directUrl = `${config.bookingServiceUrl}/api/bookings/${encodeURIComponent(bookingId)}`;
    const directRes = await fetch(directUrl, { headers: internalHeaders(), signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (directRes.ok) {
      const body = await directRes.json();
      if (body.data) return body.data;
    }
  } catch {
    // If direct lookup fails, fall through to user list lookup
  }

  // 2. Fallback: GET /api/bookings?userId=...
  const url = `${config.bookingServiceUrl}/api/bookings?userId=${encodeURIComponent(customerId)}`;
  let response;
  try {
    response = await fetch(url, { headers: internalHeaders(), signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new AppError('Booking Service is unavailable. Please try again later.', 503);
  }

  if (!response.ok) {
    throw new AppError(`Booking Service returned an error (${response.status})`, 502);
  }

  const body = await response.json();
  const bookings = Array.isArray(body.data) ? body.data : [];
  return bookings.find((booking) => String(booking._id) === String(bookingId)) || null;
};

/**
 * Tell the Booking Service the booking is paid -> "Confirmed".
 * Best-effort update with internal x-service-key authentication.
 */
export const confirmBooking = async (bookingId) => {
  try {
    const response = await fetch(`${config.bookingServiceUrl}/api/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: 'PATCH',
      headers: internalHeaders(),
      body: JSON.stringify({ status: 'Confirmed' }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(`Could not confirm booking ${bookingId}: Booking Service returned ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`Could not confirm booking ${bookingId}: ${error.message}`);
    return false;
  }
};
