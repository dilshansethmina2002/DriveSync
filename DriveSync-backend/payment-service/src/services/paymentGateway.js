// =============================================================
//  SIMULATED payment gateway
//
//  In a real system this file would call Stripe / PayHere / a bank API.
//  For this university assignment we only PRETEND:
//    - wait a little (like a network call)
//    - approve the payment, unless the request asks to simulate a failure
//  No real money moves and no card details are ever received or stored.
// =============================================================
import config from '../config/env.js';
import { generateTransactionRef, generateRefundRef } from '../utils/generateId.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * "Charge" a customer.
 * @param {object} options
 * @param {number} options.amount
 * @param {string} options.paymentMethod
 * @param {boolean} [options.simulateFailure] - set true in Postman to test the failure path
 * @returns {Promise<{approved: boolean, transactionReference: string|null, message: string}>}
 */
export const chargePayment = async ({ amount, paymentMethod, simulateFailure = false }) => {
  await wait(config.gatewayDelayMs);

  if (simulateFailure) {
    return {
      approved: false,
      transactionReference: null,
      message: 'Payment declined by the simulated gateway (simulateFailure = true)',
    };
  }

  // Example of a realistic rule: the simulated gateway refuses very large single charges
  if (amount > 1_000_000) {
    return {
      approved: false,
      transactionReference: null,
      message: 'Amount exceeds the simulated gateway single-transaction limit',
    };
  }

  return {
    approved: true,
    transactionReference: generateTransactionRef(),
    message: `${paymentMethod} payment approved`,
  };
};

/** "Send money back" to the customer. Always succeeds in the simulation. */
export const refundPayment = async ({ amount }) => {
  await wait(config.gatewayDelayMs);
  return {
    approved: true,
    refundReference: generateRefundRef(),
    message: `Refund of ${amount} processed`,
  };
};
