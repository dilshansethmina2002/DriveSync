// =============================================================
//  Request validation rules (express-validator)
//  Each array is placed in a route BEFORE the controller.
// =============================================================
import { body, param, query } from 'express-validator';
import { PAYMENT_METHODS, PAYMENT_TYPES, PAYMENT_STATUSES } from '../models/Payment.js';

// IDs from other services are MongoDB ObjectIds (24 hex characters)
const mongoId = (field, location = body) =>
  location(field).trim().isMongoId().withMessage(`${field} must be a valid 24-character ID`);

const paymentIdParam = param('paymentId')
  .trim()
  .matches(/^PAY-\d{8}-[A-F0-9]{8}$/)
  .withMessage('paymentId format must look like PAY-20261112-7F3A9C21');

export const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive whole number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(PAYMENT_STATUSES).withMessage(`status must be one of: ${PAYMENT_STATUSES.join(', ')}`),
  query('type').optional().isIn(PAYMENT_TYPES).withMessage(`type must be one of: ${PAYMENT_TYPES.join(', ')}`),
];

export const createPaymentRules = [
  mongoId('bookingId'),
  body('customerId').optional().trim().isMongoId().withMessage('customerId must be a valid 24-character ID'),
  mongoId('vehicleId'),
  body('amount')
    .exists({ values: 'null' }).withMessage('amount is required')
    .bail()
    .isFloat({ gt: 0, max: 10_000_000 }).withMessage('amount must be a number greater than 0')
    .bail()
    // max 2 decimal places, e.g. 1500.50 is fine, 1500.555 is not
    .custom((value) => /^\d+(\.\d{1,2})?$/.test(String(value))).withMessage('amount can have at most 2 decimal places')
    .toFloat(),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).isAlpha().withMessage('currency must be a 3-letter code such as LKR'),
  body('paymentMethod').isIn(PAYMENT_METHODS).withMessage(`paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}`),
  body('paymentType').isIn(PAYMENT_TYPES).withMessage(`paymentType must be one of: ${PAYMENT_TYPES.join(', ')}`),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('description max 500 characters').escape(),
  body('simulateFailure').optional().isBoolean({ strict: true }).withMessage('simulateFailure must be true or false'),
  // Security: refuse anything that looks like card data. We never accept or store it.
  body(['cardNumber', 'cvv', 'cardNo', 'card']).not().exists().withMessage('Card details must never be sent to this service'),
];

export const paymentIdRules = [paymentIdParam];

export const bookingIdRules = [mongoId('bookingId', param), ...paginationRules];

export const customerIdRules = [mongoId('customerId', param), ...paginationRules];

export const updateStatusRules = [
  paymentIdParam,
  body('status').isIn(['Successful', 'Failed']).withMessage('status must be Successful or Failed (use the refund endpoint for refunds)'),
  body('note').optional().trim().isLength({ max: 300 }).escape(),
];

export const refundRules = [
  paymentIdParam,
  body('refundAmount').optional().isFloat({ gt: 0 }).withMessage('refundAmount must be greater than 0').toFloat(),
  body('refundReason').optional().trim().isLength({ max: 500 }).withMessage('refundReason max 500 characters').escape(),
];
