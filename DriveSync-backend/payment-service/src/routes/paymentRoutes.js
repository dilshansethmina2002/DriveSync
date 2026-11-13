// =============================================================
//  Payment routes  (mounted at /api/payments in app.js)
//
//  Each route = URL + [middlewares...] + controller
//    authenticate -> who are you?          (JWT or service key)
//    authorize    -> are you allowed?      (role check)
//    rules        -> is the input valid?   (express-validator)
//    validate     -> stop with 400 if not
// =============================================================
import { Router } from 'express';
import * as controller from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as rules from '../validators/paymentValidators.js';

const router = Router();

// Every payment route needs a logged-in user (or an internal service)
router.use(authenticate);

// Create a payment (rental payment or security deposit)
router.post('/', authorize('Customer', 'Admin', 'Service'), rules.createPaymentRules, validate, controller.createPayment);

// Admin: list every payment (paginated, filter by status / type)
router.get('/', authorize('Admin'), rules.paginationRules, validate, controller.getAllPayments);

// History by booking / by customer.
// NOTE: these must be declared BEFORE "/:paymentId", otherwise Express
// would think "booking" is a paymentId.
router.get('/booking/:bookingId/summary', rules.bookingIdRules, validate, controller.getBookingSummary);
router.get('/booking/:bookingId', rules.bookingIdRules, validate, controller.getPaymentsByBooking);
router.get('/customer/:customerId', rules.customerIdRules, validate, controller.getPaymentsByCustomer);

// Single payment + receipt
router.get('/:paymentId/receipt', rules.paymentIdRules, validate, controller.getReceipt);
router.get('/:paymentId', rules.paymentIdRules, validate, controller.getPayment);

// Admin operations
router.patch('/:paymentId/status', authorize('Admin'), rules.updateStatusRules, validate, controller.updateStatus);
router.post('/:paymentId/refund', authorize('Admin'), rules.refundRules, validate, controller.refundPayment);

export default router;
