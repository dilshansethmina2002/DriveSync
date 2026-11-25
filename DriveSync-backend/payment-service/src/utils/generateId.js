// =============================================================
//  Human-friendly unique IDs
//  PAY-20261112-7F3A9C21   (payment id)
//  RCPT-20261112-1B2C3D4E  (receipt number)
//  TXN-...                 (simulated gateway transaction reference)
//  RFND-...                (refund reference)
// =============================================================
import crypto from 'crypto';

const datePart = () => new Date().toISOString().slice(0, 10).replace(/-/g, ''); // 20261112

// crypto.randomBytes gives cryptographically random values (better than Math.random)
const randomPart = (bytes = 4) => crypto.randomBytes(bytes).toString('hex').toUpperCase();

export const generatePaymentId = () => `PAY-${datePart()}-${randomPart()}`;
export const generateReceiptNumber = () => `RCPT-${datePart()}-${randomPart()}`;
export const generateTransactionRef = () => `TXN-${Date.now()}-${randomPart(3)}`;
export const generateRefundRef = () => `RFND-${Date.now()}-${randomPart(3)}`;
