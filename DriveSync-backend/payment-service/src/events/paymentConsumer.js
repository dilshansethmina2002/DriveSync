import crypto from 'crypto';
import { consumer } from '../config/kafka.js';
import Payment from '../models/Payment.js';

const generatePaymentId = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PAY-${datePart}-${randomPart}`;
};

export const startPaymentConsumer = async () => {
  await consumer.subscribe({ topic: 'booking-created', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());

      if (topic === 'booking-created') {
        try {
          // Prevent duplicate pending payments if the event is re-delivered
          const existing = await Payment.findOne({
            bookingId: data.bookingId,
            paymentType: 'Rental Payment',
          });

          if (!existing) {
            const newPayment = await Payment.create({
              paymentId: generatePaymentId(),
              bookingId: data.bookingId,
              customerId: data.userId,
              vehicleId: data.vehicleId,
              amount: data.totalPrice,
              currency: 'LKR',
              paymentMethod: 'Credit Card', // Default until customer completes checkout
              paymentType: 'Rental Payment',
              paymentStatus: 'Pending',
              description: `Rental payment for booking ${data.bookingId}`,
              statusHistory: [
                {
                  status: 'Pending',
                  note: 'Auto-created from Kafka booking-created event',
                },
              ],
            });

            console.log(
              `[Kafka] Created Pending Payment ${newPayment.paymentId} for Booking ${data.bookingId}`
            );
          }
        } catch (err) {
          console.error('[Kafka] Error handling booking-created:', err.message);
        }
      }
    },
  });
};