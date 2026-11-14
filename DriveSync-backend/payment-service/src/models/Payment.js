// =============================================================
//  Payment model  (collection: payments, DB: drivesync_payment_db)
//
//  IMPORTANT: bookingId, customerId and vehicleId are only stored as
//  plain IDs. We do NOT reference other services' collections, because
//  each microservice owns its own database.
//
//  We never store card numbers, CVV or bank details - the payment
//  gateway is simulated for this assignment.
// =============================================================
import mongoose from 'mongoose';

// Exported so validators and services use the SAME lists (no typos)
export const PAYMENT_STATUSES = ['Pending', 'Successful', 'Failed', 'Refunded'];
export const PAYMENT_TYPES = ['Rental Payment', 'Security Deposit'];
export const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Online Wallet'];

const refundSchema = new mongoose.Schema(
  {
    refundAmount: { type: Number, required: true, min: 0.01 },
    refundReason: { type: String, trim: true, maxlength: 500 },
    refundReference: { type: String, required: true },
    refundDate: { type: Date, default: Date.now },
    refundedBy: { type: String }, // user id of the admin who approved it
  },
  { _id: false } // a sub-document, no separate _id needed
);

const paymentSchema = new mongoose.Schema(
  {
    // Public, human-friendly ID (e.g. PAY-20261112-7F3A9C21). Used in URLs.
    paymentId: { type: String, required: true, unique: true, index: true },

    // IDs that come from other microservices
    bookingId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    vehicleId: { type: String, required: true },

    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
      // round to 2 decimal places (money)
      set: (value) => Math.round(value * 100) / 100,
    },
    currency: { type: String, default: 'LKR', uppercase: true, trim: true },

    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentType: { type: String, enum: PAYMENT_TYPES, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Pending', index: true },

    // Reference returned by the (simulated) payment gateway
    transactionReference: { type: String, default: null },
    paymentDate: { type: Date, default: Date.now },

    // Only created when the payment is Successful.
    // "sparse" lets many documents have no receipt number while keeping it unique.
    receiptNumber: { type: String, unique: true, sparse: true },

    description: { type: String, trim: true, maxlength: 500 },
    failureReason: { type: String, default: null },
    refund: { type: refundSchema, default: null },

    // Simple audit trail: every status change is recorded here
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: PAYMENT_STATUSES },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Compound index: fast lookup of "all payments for this booking of this type"
paymentSchema.index({ bookingId: 1, paymentType: 1, paymentStatus: 1 });

// Hide internal Mongo fields when the document is sent as JSON
paymentSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
