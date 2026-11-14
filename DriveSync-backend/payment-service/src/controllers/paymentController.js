// =============================================================
//  Payment controller
//  Job: read the HTTP request -> call the service -> send the HTTP response.
//  No business rules here (they live in services/paymentService.js).
//
//  Express 5 catches errors thrown in async functions automatically
//  and passes them to errorHandler, so we don't need try/catch.
// =============================================================
import { matchedData } from 'express-validator';
import * as paymentService from '../services/paymentService.js';

// POST /api/payments
export const createPayment = async (req, res) => {
  // matchedData = only the fields that passed validation (unknown fields are dropped)
  const data = matchedData(req, { locations: ['body'] });
  const payment = await paymentService.processPayment(data, req.user);

  // Choose the HTTP status that matches the result
  if (payment.paymentStatus === 'Failed') {
    // 402 Payment Required: the request was valid but the charge was declined
    return res.status(402).json({ success: false, message: `Payment failed: ${payment.failureReason}`, data: payment });
  }
  if (payment.paymentStatus === 'Pending') {
    // 202 Accepted: recorded, waiting for confirmation (cash payments)
    return res.status(202).json({ success: true, message: 'Payment recorded and awaiting confirmation', data: payment });
  }
  return res.status(201).json({ success: true, message: 'Payment processed successfully', data: payment });
};

// GET /api/payments  (admin)
export const getAllPayments = async (req, res) => {
  const { payments, pagination } = await paymentService.getAllPayments(req.query);
  res.status(200).json({ success: true, count: payments.length, pagination, data: payments });
};

// GET /api/payments/:paymentId
export const getPayment = async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.paymentId, req.user);
  res.status(200).json({ success: true, data: payment });
};

// GET /api/payments/booking/:bookingId
export const getPaymentsByBooking = async (req, res) => {
  const { payments, pagination } = await paymentService.getPaymentsByBooking(req.params.bookingId, req.query, req.user);
  res.status(200).json({ success: true, count: payments.length, pagination, data: payments });
};

// GET /api/payments/booking/:bookingId/summary
export const getBookingSummary = async (req, res) => {
  const summary = await paymentService.getBookingSummary(req.params.bookingId, req.user);
  res.status(200).json({ success: true, data: summary });
};

// GET /api/payments/customer/:customerId
export const getPaymentsByCustomer = async (req, res) => {
  const { payments, pagination } = await paymentService.getPaymentsByCustomer(req.params.customerId, req.query, req.user);
  res.status(200).json({ success: true, count: payments.length, pagination, data: payments });
};

// GET /api/payments/:paymentId/receipt
export const getReceipt = async (req, res) => {
  const receipt = await paymentService.generateReceipt(req.params.paymentId, req.user);
  res.status(200).json({ success: true, data: receipt });
};

// PATCH /api/payments/:paymentId/status  (admin)
export const updateStatus = async (req, res) => {
  const { status, note } = matchedData(req, { locations: ['body'] });
  const payment = await paymentService.updatePaymentStatus(req.params.paymentId, { status, note });
  res.status(200).json({ success: true, message: `Payment marked as ${payment.paymentStatus}`, data: payment });
};

// POST /api/payments/:paymentId/refund  (admin)
export const refundPayment = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const payment = await paymentService.refund(req.params.paymentId, data, req.user);
  res.status(200).json({ success: true, message: 'Refund processed successfully', data: payment });
};
